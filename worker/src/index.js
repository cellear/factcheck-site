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
// No invite word or spend cap yet (Sprint 3).

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

function classify(message, report) {
  if (message.stop_reason === "refusal") {
    return { outcome: "refusal", searchCapHit: false, toolErrors: [] };
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
  let claim;
  try {
    const body = await request.json();
    claim = typeof body?.claim === "string" ? body.claim.trim() : "";
  } catch {
    return jsonResponse({ error: "invalid JSON body" }, 400);
  }
  if (!claim) {
    return jsonResponse({ error: "missing claim" }, 400);
  }

  const startedAt = new Date();
  const startMs = Date.now();

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
      system: SKILL_MD,
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
  const { outcome, searchCapHit, toolErrors } = classify(message, report);
  const searches = message.content.filter((b) => b.type === "web_search_tool_result").length;
  const usage = message.usage;

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
      searches,
    },
    cost_usd: computeCostUsd(usage, searches),
    outcome,
    search_cap_hit: searchCapHit,
    tool_errors: toolErrors,
    duration_ms: durationMs,
  };

  await env.RESULTS.put(`result:${id}`, JSON.stringify(record));

  return jsonResponse({ id });
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
    const resultMatch = url.pathname.match(/^\/r\/([^/]+)$/);
    if (resultMatch && request.method === "GET") {
      return handleGetResult(resultMatch[1], env);
    }
    return jsonResponse({ error: "not found" }, 404);
  },
};
