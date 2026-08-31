// S2-2: POST /check. Accepts { claim }, calls the Anthropic API with the vendored skill as the
// system prompt, classifies the outcome, writes a result record to KV, returns { id }.
//
// Deliberately NOT copied from spike/check.mjs — three rules that script doesn't implement
// (DOC/architecture.md, Failure handling):
//   1. citations[] is preserved from text-block `citations`, and text blocks are joined with NO
//      separator (spike joins with "\n\n").
//   2. The claim is wrapped in a single-turn frame (spike sends the raw claim).
//   3. `max_uses_exceeded` is not a tool_error; it's outcome: ok, search_cap_hit: true.
//
// S3-1 added the invite word. S3-2 adds the spend meter/cap and GET /spend. S3-3 stores the
// refusal category. S3-7 turns on prompt caching (S2-7 measured it cheaper even cold).

import SKILL_MD from "../../skill/SKILL.md";
import SOURCE_MD from "../../skill/SOURCE.md";

const MODEL = "claude-sonnet-5"; // decision 15
const REPORT_HEADING_RE = /^# Fact-Check Report.*$/m;
const SKILL_COMMIT = (SOURCE_MD.match(/Commit hash:\*\*\s*([0-9a-f]{7,40})/i) ?? [])[1] ?? null;

// $/1M tokens — see DOC/architecture.md decision 15 and spike/check.mjs.
const PRICES_USD_PER_MTOK = { "claude-sonnet-5": { input: 2.0, output: 10.0 } };
const WEB_SEARCH_USD_PER_SEARCH = 0.01;

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type",
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...CORS_HEADERS },
  });
}

function generateId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16)); // 128 bits, URL-safe base64
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// S3-2: spend:<yyyy-mm>, a running dollar total for the calendar month. No compare-and-swap in
// KV, so a read-modify-write under real concurrent traffic could lose an update — accepted at
// this project's traffic (a dozen checks/day), not fixed here.
function spendKeyForNow() {
  const now = new Date();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `spend:${now.getUTCFullYear()}-${month}`;
}

async function getMonthSpend(env) {
  const stored = await env.RESULTS.get(spendKeyForNow());
  return stored ? Number(stored) : 0;
}

async function addToMonthSpend(env, amountUsd) {
  const key = spendKeyForNow();
  const current = await getMonthSpend(env);
  await env.RESULTS.put(key, String(current + amountUsd));
}

function spendCapUsd(env) {
  const parsed = Number(env.SPEND_CAP_USD);
  return Number.isFinite(parsed) ? parsed : 20;
}

// The site has no second turn; SKILL.md assumes a chat and would otherwise stop and ask on
// uncontroversial claims. Confirmed live in S2-1: the same claim wording produced a full report
// once and a short conversational non-report answer other times, without this frame.
function frameClaim(claim) {
  return (
    `${claim}\n\n---\n\n` +
    "This is a single request with no follow-up turn available — there is no chance to ask a " +
    "clarifying question or continue this conversation. If any part of the claim is ambiguous, " +
    "state your reading of it and proceed on that basis rather than asking. Produce the full " +
    "fact-check report regardless of how settled or uncontroversial the claim seems — note that " +
    "it's uncontroversial in the Triage section rather than skipping the report format."
  );
}

function extractTextAndCitations(message) {
  const textBlocks = message.content.filter((b) => b.type === "text");
  const assembled = textBlocks.map((b) => b.text).join("");

  // Preferred path: inline citations attached directly to text blocks (the classic web_search
  // citation behavior DOC/architecture.md assumed). Measured in S2-2: claude-sonnet-5 invokes
  // web_search from inside an automatic code_execution sandbox on every real run seen so far
  // (undeclared — not a tool we requested), and in that mode no text block carries a
  // `citations` field at all. Fall back to the raw results from every successful
  // web_search_tool_result block; those carry url/title but no per-result excerpt in this mode,
  // hence cited_text: null in the fallback.
  const inlineCitations = [];
  for (const block of textBlocks) {
    if (!Array.isArray(block.citations)) continue;
    for (const c of block.citations) {
      inlineCitations.push({ url: c.url, title: c.title, cited_text: c.cited_text ?? null });
    }
  }
  if (inlineCitations.length > 0) {
    return { assembled, citations: inlineCitations };
  }

  const fallbackCitations = [];
  for (const block of message.content) {
    if (block.type !== "web_search_tool_result" || !Array.isArray(block.content)) continue;
    for (const result of block.content) {
      fallbackCitations.push({ url: result.url, title: result.title, cited_text: null });
    }
  }
  return { assembled, citations: fallbackCitations };
}

function extractReport(assembled) {
  const match = assembled.match(REPORT_HEADING_RE);
  return match ? assembled.slice(match.index) : null;
}

// S3-3: stop_reason is checked before any content is read, per DOC's failure-handling rule.
// stop_details.category (when present) is stored on the record so the result page can name
// the refusal category instead of a bare "refused".
function classify(message, report) {
  if (message.stop_reason === "refusal") {
    return {
      outcome: "refusal",
      searchCapHit: false,
      toolErrors: [],
      refusalCategory: message.stop_details?.category ?? null,
    };
  }

  const searchBlocks = message.content.filter((b) => b.type === "web_search_tool_result");
  const errorBlocks = searchBlocks.filter((b) => !Array.isArray(b.content));
  const realErrors = errorBlocks.filter((b) => b.content?.error_code !== "max_uses_exceeded");
  const toolErrors = errorBlocks.map((b) => b.content);

  if (realErrors.length > 0) {
    return { outcome: "tool_error", searchCapHit: false, toolErrors };
  }

  const capHit = errorBlocks.some((b) => b.content?.error_code === "max_uses_exceeded");

  if (message.stop_reason === "max_tokens" || message.stop_reason !== "end_turn") {
    return { outcome: "truncated", searchCapHit: false, toolErrors };
  }

  return { outcome: report ? "ok" : "no_report", searchCapHit: capHit, toolErrors };
}

function computeCostUsd(usage, searches) {
  const price = PRICES_USD_PER_MTOK[MODEL];
  const inputCost = (usage.input_tokens / 1_000_000) * price.input;
  const outputCost = (usage.output_tokens / 1_000_000) * price.output;
  const cacheWriteCost = ((usage.cache_creation_input_tokens ?? 0) / 1_000_000) * price.input * 1.25;
  const cacheReadCost = ((usage.cache_read_input_tokens ?? 0) / 1_000_000) * price.input * 0.1;
  const searchCost = searches * WEB_SEARCH_USD_PER_SEARCH;
  return Number((inputCost + outputCost + cacheWriteCost + cacheReadCost + searchCost).toFixed(6));
}

async function handleCheck(request, env) {
  let claim, inviteWord;
  try {
    const body = await request.json();
    claim = typeof body?.claim === "string" ? body.claim.trim() : "";
    inviteWord = typeof body?.invite_word === "string" ? body.invite_word.trim() : "";
  } catch {
    return jsonResponse({ error: "invalid JSON body" }, 400);
  }

  if (!inviteWord || inviteWord !== env.INVITE_WORD) {
    return new Response("Unauthorized", { status: 403, headers: CORS_HEADERS });
  }
  if (!claim) {
    return jsonResponse({ error: "missing claim" }, 400);
  }

  // S3-2: refuse before spending anything once the month's total is at or over the cap.
  // Decision 16: a silent refusal with a plain message, no notification to Luke in v1.
  if ((await getMonthSpend(env)) >= spendCapUsd(env)) {
    return new Response("Monthly budget reached", { status: 402, headers: CORS_HEADERS });
  }

  const startedAt = new Date();
  const startMs = Date.now();

  // S3-7: system prompt sent as a cacheable block. S2-7 measured this cheaper than an uncached
  // call even on a cold cache (the 1.25x write premium is outweighed by 0.1x reads inside the
  // same request's tool loop), and 58% cheaper once warm. No behavior change, only billing shape.
  const apiResponse = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8192,
      system: [{ type: "text", text: SKILL_MD, cache_control: { type: "ephemeral" } }],
      tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 5 }],
      messages: [{ role: "user", content: frameClaim(claim) }],
    }),
  });

  if (!apiResponse.ok) {
    const errorBody = await apiResponse.text();
    return jsonResponse(
      { error: "upstream API error", status: apiResponse.status, body: errorBody },
      502,
    );
  }

  const message = await apiResponse.json();
  const durationMs = Date.now() - startMs;

  const { assembled, citations } = extractTextAndCitations(message);
  const report = extractReport(assembled);
  const { outcome, searchCapHit, toolErrors, refusalCategory } = classify(message, report);
  const searches = message.content.filter((b) => b.type === "web_search_tool_result").length;
  const usage = message.usage;
  const costUsd = computeCostUsd(usage, searches);

  const id = generateId();
  const record = {
    id,
    created_at: startedAt.toISOString(),
    claim_text: claim,
    report,
    citations,
    model: MODEL,
    served_by_model: message.model,
    skill_commit: SKILL_COMMIT,
    usage: {
      input_tokens: usage.input_tokens,
      output_tokens: usage.output_tokens,
      cache_creation_input_tokens: usage.cache_creation_input_tokens ?? 0,
      cache_read_input_tokens: usage.cache_read_input_tokens ?? 0,
      searches,
    },
    cost_usd: costUsd,
    outcome,
    refusal_category: refusalCategory ?? null,
    search_cap_hit: searchCapHit,
    tool_errors: toolErrors,
    duration_ms: durationMs,
  };

  // S3-2: every completed check meters, including failed outcomes — a refusal or tool_error
  // still spent tokens.
  await addToMonthSpend(env, costUsd);
  await env.RESULTS.put(`result:${id}`, JSON.stringify(record));

  return jsonResponse({ id });
}

// S3-2: GET /spend?invite_word=<word> -> { month, total_usd }. Read-only, gated the same as a
// check so spend totals aren't public to anyone without the invite word.
async function handleGetSpend(url, env) {
  const inviteWord = url.searchParams.get("invite_word")?.trim() ?? "";
  if (!inviteWord || inviteWord !== env.INVITE_WORD) {
    return new Response("Unauthorized", { status: 403, headers: CORS_HEADERS });
  }
  const key = spendKeyForNow();
  const totalUsd = await getMonthSpend(env);
  return jsonResponse({ month: key.slice("spend:".length), total_usd: totalUsd });
}

// S2-3: GET /r/:id. Reads result:<id> from KV, returns it as JSON; unknown id -> 404.
async function handleGetResult(id, env) {
  const stored = await env.RESULTS.get(`result:${id}`);
  if (stored === null) {
    return jsonResponse({ error: "not found" }, 404);
  }
  return new Response(stored, {
    headers: { "content-type": "application/json", ...CORS_HEADERS },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    if (url.pathname === "/check" && request.method === "POST") {
      return handleCheck(request, env);
    }
    if (url.pathname === "/spend" && request.method === "GET") {
      return handleGetSpend(url, env);
    }
    const resultMatch = url.pathname.match(/^\/r\/([^/]+)$/);
    if (resultMatch && request.method === "GET") {
      return handleGetResult(resultMatch[1], env);
    }
    return jsonResponse({ error: "not found" }, 404);
  },
};
