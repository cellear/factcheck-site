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

// S5-1: phase 1 (parse/triage) uses web_fetch only, no web_search -- $0 search spend by
// construction. Confirmed live (spike probe, 2026-09-01): no beta header needed, and web_fetch
// has no per-use charge (token cost only) -- unlike web_search's $10/1000, so computeCostUsd()
// needs no fetch line item.
const WEB_FETCH_TOOL_TYPE = "web_fetch_20260209";
const PHASE1_MAX_TOKENS = 4096;
const PHASE2_MAX_TOKENS = 8192;
const MAX_FETCH_CONTENT_TOKENS = 50000; // defensive cap so one huge page can't blow up cost/context
const SESSION_TTL_SECONDS = 3600; // "sits, then expires" (Luke) -- no auto-proceed, 1 hour window
const JSON_TRAILER_RE = /```json\s*([\s\S]*?)```\s*$/;

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
  return Number.isFinite(parsed) ? parsed : 20; // Sprint 5 planning proposed raising this to 100;
  // Luke kept it at $20 (2026-09-01) -- unchanged from S3-2.
}

// S5-1: web search cap raised from a hardcoded 5 to an env var (WEB_SEARCH_MAX_USES), default 25.
// Only /session/:id/proceed (phase 2) reads this; /check keeps its original max_uses: 5 --
// frozen, not touched by this sprint, so it can keep answering unchanged during the transition.
function webSearchMaxUses(env) {
  const parsed = Number(env.WEB_SEARCH_MAX_USES);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 25;
}

function webFetchMaxUses(env) {
  const parsed = Number(env.WEB_FETCH_MAX_USES);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 3;
}

// S4-2: track durations of successful checks to show predicted range. Store as JSON array in
// durations:<yyyy-mm> alongside spend:<yyyy-mm>.
function durationKeyForNow() {
  const now = new Date();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `durations:${now.getUTCFullYear()}-${month}`;
}

async function addDuration(env, durationMs) {
  const key = durationKeyForNow();
  const stored = await env.RESULTS.get(key);
  const durations = stored ? JSON.parse(stored) : [];
  durations.push(durationMs);
  await env.RESULTS.put(key, JSON.stringify(durations));
}

function calculateStats(durations) {
  if (durations.length === 0) return null;

  const sorted = [...durations].sort((a, b) => a - b);
  const mean = durations.reduce((a, b) => a + b, 0) / durations.length;
  const variance = durations.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / durations.length;
  const stdDev = Math.sqrt(variance);

  return {
    mean: Math.round(mean),
    stdDev: Math.round(stdDev),
    min: sorted[0],
    max: sorted[sorted.length - 1],
    count: durations.length,
  };
}

async function getDurationStats(env) {
  const stored = await env.RESULTS.get(durationKeyForNow());
  if (!stored) return null;
  const durations = JSON.parse(stored);
  return calculateStats(durations);
}

// S5-2: streams both phases instead of blocking until the API call finishes. Confirmed live
// (probe, 2026-09-01): server_tool_use blocks for web_search/web_fetch carry their full `input`
// (query text / URL) in the content_block_start event itself, not streamed via delta -- so the
// browser-facing "search"/"fetch" events fire the instant the block starts, no accumulation
// needed. web_search_tool_result/web_fetch_tool_result blocks likewise arrive fully formed at
// content_block_start.

const SSE_HEADERS = {
  "content-type": "text/event-stream",
  "cache-control": "no-store",
  ...CORS_HEADERS,
};

// Parses Anthropic's raw `event: <type>\ndata: <json>\n\n` wire format into the JSON events
// (the `event:` line duplicates `data.type`, so only `data:` is read). Not the SDK's stream
// helper -- the Worker talks to the API over plain fetch, same as every other call in this file.
async function* parseAnthropicSSE(body) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx;
      while ((idx = buffer.indexOf("\n\n")) !== -1) {
        const frame = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        const dataLine = frame.split("\n").find((l) => l.startsWith("data:"));
        if (!dataLine) continue;
        try {
          yield JSON.parse(dataLine.slice(5).trim());
        } catch {
          // malformed frame; skip rather than fail the whole stream over one bad line
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// Reconstructs the same message shape a non-streaming call would have returned (content:
// [...blocks], usage, stop_reason, stop_details, model) so classify()/extractTextAndCitations()/
// extractReport()/computeCostUsd() run completely unchanged against a streamed response.
// onEvent(rawEvent) fires for every parsed event so the caller can relay a curated subset to the
// browser as it happens, before the full message is assembled.
async function consumeAnthropicStream(body, onEvent) {
  const contentBlocks = [];
  let model = null;
  let stopReason = null;
  let stopDetails = null;
  let usage = null;
  let sawMessageStop = false;
  let streamError = null;

  for await (const event of parseAnthropicSSE(body)) {
    onEvent(event);

    switch (event.type) {
      case "message_start":
        model = event.message.model;
        usage = event.message.usage;
        break;
      case "content_block_start":
        contentBlocks[event.index] = { ...event.content_block };
        break;
      case "content_block_delta": {
        const block = contentBlocks[event.index];
        if (!block) break;
        const d = event.delta;
        if (d.type === "text_delta") block.text = (block.text ?? "") + d.text;
        else if (d.type === "thinking_delta") block.thinking = (block.thinking ?? "") + d.thinking;
        else if (d.type === "signature_delta") block.signature = (block.signature ?? "") + d.signature;
        break;
      }
      case "message_delta":
        if (event.delta.stop_reason !== undefined) stopReason = event.delta.stop_reason;
        if (event.delta.stop_details !== undefined) stopDetails = event.delta.stop_details;
        if (event.usage) usage = event.usage; // the final call carries the complete cumulative usage
        break;
      case "message_stop":
        sawMessageStop = true;
        break;
      case "error":
        streamError = event.error;
        break;
      default:
        break; // ping, content_block_stop: nothing to reconstruct
    }
  }

  if (streamError) {
    throw new Error(streamError.message || "upstream stream error");
  }
  if (!sawMessageStop) {
    throw new Error("stream ended without message_stop");
  }

  return { model, role: "assistant", content: contentBlocks, stop_reason: stopReason, stop_details: stopDetails, usage };
}

// Maps the raw Anthropic stream events to the browser-facing vocabulary: search, search_results,
// fetch, fetch_result, text. Thinking, code_execution, and the message_start/stop bookkeeping
// events are internal only -- the browser never sees them (see DOC promotion note in the S5-2
// handoff: this vocabulary is this project's own design, not an Anthropic-defined format).
function relayEvent(event, write) {
  if (event.type === "content_block_start") {
    const b = event.content_block;
    if (b.type === "server_tool_use" && b.name === "web_search") {
      write({ type: "search", query: b.input?.query ?? "" });
    } else if (b.type === "server_tool_use" && b.name === "web_fetch") {
      write({ type: "fetch", url: b.input?.url ?? "" });
    } else if (b.type === "web_search_tool_result") {
      if (Array.isArray(b.content)) {
        write({
          type: "search_results",
          results: b.content.map((r) => ({ title: r.title, url: r.url })),
        });
      } else {
        write({ type: "search_error" });
      }
    } else if (b.type === "web_fetch_tool_result") {
      if (b.content?.type === "web_fetch_result") {
        write({ type: "fetch_result", url: b.content.url, title: b.content.content?.title ?? null });
      } else {
        write({ type: "fetch_error" });
      }
    }
  } else if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
    write({ type: "text", text: event.delta.text });
  }
}

// Runs `pump(write)` via ctx.waitUntil so the response can be returned immediately while pump()
// keeps writing SSE chunks. write() swallows errors from a closed/aborted connection so pump()
// never blocks or throws just because nobody's listening anymore.
//
// IMPORTANT (found live, 2026-09-02): ctx.waitUntil() only extends execution up to 30 seconds
// past when the response finishes sending or the client disconnects -- confirmed against
// Cloudflare's docs and by direct testing (a disconnected phase-1 call, ~15-20s, completed and
// metered correctly; three separate disconnected phase-2 calls, 74-250s, never wrote a record
// even after 5+ minutes). This is fine for phase 1 (POST /session, well under 30s) but is NOT
// safe for phase 2's typical duration -- see handleProceedSession, which deliberately does NOT
// use sseResponse()/ctx.waitUntil for exactly this reason. Luke's call (2026-09-02): phase 2
// polls a progress:<sessionId> KV key instead of streaming, so its disconnect-survival matches
// /check's already-proven pattern (a plain blocking await outlives client disconnects with no
// waitUntil involved at all -- see S2-1's six-minute hold test).
function sseResponse(pump, ctx) {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();
  const write = (obj) => writer.write(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`)).catch(() => {});

  const work = pump(write)
    .catch((err) => write({ type: "error", message: err.message || "internal error" }))
    .finally(() => writer.close().catch(() => {}));

  ctx.waitUntil(work);

  return new Response(readable, { headers: SSE_HEADERS });
}

// S5-2 (revised): phase 2 polls instead of streaming, since it can run well past the 30s
// ctx.waitUntil cap. Coalesces the rapid stream of text_delta events into a running string so a
// throttled KV write (see PROGRESS_FLUSH_MIN_MS in handleProceedSession) doesn't fragment the
// report into dozens of tiny entries -- a snapshot() call flushes any pending text into the log
// so ordering against search/fetch events is preserved.
const PROGRESS_TTL_SECONDS = 600; // generous over any real check's duration; cheap to over-provision
function makeProgressTracker() {
  const log = [];
  let pendingText = "";
  function flushText() {
    if (pendingText) {
      log.push({ type: "text", text: pendingText });
      pendingText = "";
    }
  }
  return {
    push(event) {
      if (event.type === "text") {
        pendingText += event.text;
        return;
      }
      flushText();
      log.push(event);
    },
    snapshot() {
      flushText();
      return log;
    },
  };
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

// S5-1: phase 1 of the two-phase session flow -- parse and triage only, no web_search, and the
// model must end its reply with a machine-readable fenced ```json block (see splitPhase1Output).
// Retires frameClaim()'s "never ask, always produce the full report" text for this call: the
// site now has a second turn, so there is something to ask about again.
function frameParse(input) {
  return (
    `${input}\n\n---\n\n` +
    "This is phase 1 of a two-step process: parse and triage only. Do not use web_search and do " +
    "not produce the full fact-check report yet -- that happens in phase 2, after the user " +
    "chooses what to investigate. If the input looks like a URL, use web_fetch to retrieve the " +
    "article first, then work from its content.\n\n" +
    "Do:\n" +
    "1. Identify the PRIMARY claim and any other independently checkable claims or issues in the " +
    "text.\n" +
    "2. Give a quick triage assessment: uncontroversial, disputed, or contains contentious " +
    "sub-claims, with a one- or two-sentence reason.\n\n" +
    "Then end your reply with a fenced ```json block (and nothing after it) with exactly this " +
    "shape:\n" +
    "{\n" +
    '  "primary_claim": "...",\n' +
    '  "issues": ["...", "..."],\n' +
    '  "triage": "uncontroversial" | "disputed" | "contentious_subclaims",\n' +
    '  "settled": true | false,\n' +
    '  "url_fetched": true | false\n' +
    "}\n" +
    '"issues" should list every independently choosable thing a user could ask to dig into, ' +
    'including the primary claim itself as the first entry. "settled" is true only when triage ' +
    'is "uncontroversial" and the primary claim needs no deep verification.'
  );
}

// S5-1: phase 2 -- the final turn, replayed after phase 1's message pair (see
// handleProceedSession). Same single-turn framing as the old frameClaim(), scoped to whatever
// the user chose to dig into rather than the whole claim.
function frameInvestigate(chosenText) {
  return (
    `Investigate: ${chosenText}\n\n---\n\n` +
    "This is phase 2 of a two-step process -- the final turn, with no further follow-up " +
    "available. Even if phase 1 already gave a preliminary read on this, phase 2 requires a " +
    "fresh, evidence-gathering fact-check: use web_search as needed to investigate the issue(s) " +
    "above and produce the FULL fact-check report now, using the exact format in SKILL.md's " +
    "Output Format section -- start with the literal heading \"# Fact-Check Report\" on its own " +
    "line, then every section the format calls for. Do this regardless of how settled or " +
    "uncontroversial phase 1's triage found it -- note the settledness in the Triage section of " +
    "the report rather than skipping the report format or answering conversationally instead. " +
    "If any part of the request is ambiguous, state your reading and proceed rather than asking."
  );
}

// S5-1: splits phase 1's assembled text into the human-readable prose and the trailing
// machine-readable JSON block frameParse() asked for. Returns parsed: null (not a thrown error)
// when the model didn't comply or the block doesn't have the required shape -- a known,
// accepted simplification: any phase-1 non-compliance is treated the same as a parse failure,
// with no finer-grained classification the way phase 2's outcome field has (DOC promotion
// candidate for Lila to note as a simplification, same spirit as other accepted tradeoffs).
function splitPhase1Output(assembled) {
  const match = assembled.match(JSON_TRAILER_RE);
  if (!match) return { prose: assembled.trim(), parsed: null };

  const prose = assembled.slice(0, match.index).trim();
  let parsed;
  try {
    parsed = JSON.parse(match[1]);
  } catch {
    return { prose, parsed: null };
  }

  const valid =
    parsed &&
    typeof parsed.primary_claim === "string" &&
    Array.isArray(parsed.issues) &&
    typeof parsed.triage === "string" &&
    typeof parsed.settled === "boolean";

  return { prose, parsed: valid ? parsed : null };
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
  // S4-2: track durations of successful checks for countdown calibration.
  if (outcome === "ok") {
    await addDuration(env, durationMs);
  }
  await env.RESULTS.put(`result:${id}`, JSON.stringify(record));

  return jsonResponse({ id });
}

// S5-1/S5-2: POST /session. Accepts { claim, invite_word } (claim may be a pasted claim or a URL
// -- same field, broader meaning; SKILL.md already tells the model to web_fetch a URL). Streams
// phase 1 (parse/triage, no web_search) as SSE and stores a session record for
// handleProceedSession to replay once it completes. $0 search spend by construction: phase 1's
// tools array has no web_search. Early validation (invite word, missing claim, spend cap) stays
// a plain response -- only the real API call becomes an SSE stream.
async function handleCreateSession(request, env, ctx) {
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
  if ((await getMonthSpend(env)) >= spendCapUsd(env)) {
    return new Response("Monthly budget reached", { status: 402, headers: CORS_HEADERS });
  }

  const userContent = frameParse(claim);

  return sseResponse(async (write) => {
    const apiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: PHASE1_MAX_TOKENS,
        stream: true,
        system: [{ type: "text", text: SKILL_MD, cache_control: { type: "ephemeral" } }],
        tools: [
          {
            type: WEB_FETCH_TOOL_TYPE,
            name: "web_fetch",
            max_uses: webFetchMaxUses(env),
            max_content_tokens: MAX_FETCH_CONTENT_TOKENS,
          },
        ],
        messages: [{ role: "user", content: userContent }],
      }),
    });

    if (!apiResponse.ok) {
      write({ type: "error", message: `upstream API error (${apiResponse.status})` });
      return;
    }

    const message = await consumeAnthropicStream(apiResponse.body, (event) => relayEvent(event, write));
    const { assembled } = extractTextAndCitations(message);
    const costUsd = computeCostUsd(message.usage, 0); // phase 1 has no web_search tool: 0 searches

    // Every completed phase-1 call meters, same principle as S3-2's "every completed check
    // meters, including failed outcomes" -- a non-compliant reply still spent tokens.
    await addToMonthSpend(env, costUsd);

    if (message.stop_reason !== "end_turn") {
      write({ type: "error", message: "phase 1 did not complete", stop_reason: message.stop_reason });
      return;
    }

    const { prose, parsed } = splitPhase1Output(assembled);
    if (!parsed) {
      write({ type: "error", message: "phase 1 did not return structured output" });
      return;
    }

    const sessionId = generateId();
    const session = {
      id: sessionId,
      created_at: new Date().toISOString(),
      input: claim,
      phase1: {
        // Plain-text replay only (no tool_use/tool_result blocks) -- simpler and safer than
        // preserving the exact block structure, and only the resulting text matters for phase 2's
        // continuity. See scope: "Phase-1 message history is replayed from the session record."
        messages: [
          { role: "user", content: userContent },
          { role: "assistant", content: assembled },
        ],
        parsed,
      },
    };
    await env.RESULTS.put(`session:${sessionId}`, JSON.stringify(session), {
      expirationTtl: SESSION_TTL_SECONDS,
    });

    write({
      type: "done",
      session_id: sessionId,
      parse_text: prose,
      primary_claim: parsed.primary_claim,
      issues: parsed.issues,
      triage: parsed.triage,
      settled: parsed.settled,
      url_fetched: parsed.url_fetched ?? false,
    });
  }, ctx);
}

// S5-1/S5-2 (revised 2026-09-02, see the ctx.waitUntil note above makeProgressTracker):
// POST /session/:id/proceed. Accepts { invite_word, issues?: string[], custom?: string }.
// issues/custom choose what to dig into; neither given means "run the deep check on the primary
// claim anyway" (the settled fast-path's "deep-check offered" button). Runs phase 2 (full
// investigation, web_search enabled) as a plain BLOCKING call, replaying phase 1's history, then
// writes the permanent result:<id> record exactly as /check always has -- same classify()/
// extraction/metering, only reached via a different route in. Deliberately blocking, not
// streamed to the browser, so a connected browser gets a normal final response same as /check
// always has. Blocking does NOT, on its own, guarantee survival past a client disconnect --
// Cloudflare cancels outstanding subrequests on disconnect the same way for a blocking handler
// as a streaming one, with only ctx.waitUntil()'s capped 30-second grace as an exception (see
// runPhase2() below). A disconnect during a long-running phase 2 can lose the check; this is a
// known, accepted platform limitation (Luke's call, 2026-09-02), not something this design
// claims to fully solve. The API call to Anthropic still uses stream: true internally so
// progress can be captured; that progress is written to progress:<sessionId> in KV (throttled --
// KV limits writes to the same key to about once/sec) for the browser to poll via
// GET /session/:id/progress while it's still connected.
async function handleProceedSession(request, env, ctx, sessionId) {
  let inviteWord, issues, custom;
  try {
    const body = await request.json();
    inviteWord = typeof body?.invite_word === "string" ? body.invite_word.trim() : "";
    issues = Array.isArray(body?.issues)
      ? body.issues.filter((s) => typeof s === "string" && s.trim()).map((s) => s.trim())
      : [];
    custom = typeof body?.custom === "string" ? body.custom.trim() : "";
  } catch {
    return jsonResponse({ error: "invalid JSON body" }, 400);
  }

  if (!inviteWord || inviteWord !== env.INVITE_WORD) {
    return new Response("Unauthorized", { status: 403, headers: CORS_HEADERS });
  }

  const sessionKey = `session:${sessionId}`;
  const stored = await env.RESULTS.get(sessionKey);
  if (stored === null) {
    return jsonResponse({ error: "session not found or expired" }, 404);
  }
  const session = JSON.parse(stored);
  // A session is single-use: this call consumes it regardless of outcome, so a retry needs a
  // fresh POST /session rather than reusing a half-spent one (same no-compare-and-swap spirit
  // as the spend/duration counters -- simple over exactly-once).
  await env.RESULTS.delete(sessionKey);

  if ((await getMonthSpend(env)) >= spendCapUsd(env)) {
    return new Response("Monthly budget reached", { status: 402, headers: CORS_HEADERS });
  }

  const chosenText =
    custom ||
    (issues.length > 0 ? issues.map((i) => `- ${i}`).join("\n") : session.phase1.parsed.primary_claim);

  const progressKey = `progress:${sessionId}`;
  const tracker = makeProgressTracker();
  let lastFlushMs = 0;
  const PROGRESS_FLUSH_MIN_MS = 1000;
  const maybeFlushProgress = () => {
    const now = Date.now();
    if (now - lastFlushMs < PROGRESS_FLUSH_MIN_MS) return;
    lastFlushMs = now;
    // Best-effort: a lost progress update only affects the live-watching display, never
    // correctness -- the final result write below doesn't depend on this succeeding.
    env.RESULTS
      .put(progressKey, JSON.stringify({ events: tracker.snapshot(), done: false }), {
        expirationTtl: PROGRESS_TTL_SECONDS,
      })
      .catch(() => {});
  };

  // S5-2 (2026-09-02): the actual work is wrapped in a named function and ALSO registered with
  // ctx.waitUntil, on top of being directly awaited below. Confirmed against Cloudflare's own
  // docs and by live testing: "outstanding work may be canceled [on client disconnect] unless it
  // is passed to ctx.waitUntil()" -- this applies to subrequests too, not just the Worker's own
  // execution, and it applies to a plain blocking handler exactly the same as a streaming one.
  // waitUntil's own cap (30s past disconnect) means this does NOT guarantee survival of a check
  // that's still running when the client disconnects -- that is a known, accepted platform
  // limitation for now (Luke's call, 2026-09-02), not something this code can fully fix without
  // genuinely decoupled infrastructure (Cloudflare Queues or Durable Objects). What this DOES
  // buy: a disconnect very close to completion, or during phase 1's shorter duration, has a real
  // chance of still finishing instead of being cancelled with zero grace at all.
  async function runPhase2() {
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
        max_tokens: PHASE2_MAX_TOKENS,
        stream: true,
        system: [{ type: "text", text: SKILL_MD, cache_control: { type: "ephemeral" } }],
        tools: [{ type: "web_search_20260209", name: "web_search", max_uses: webSearchMaxUses(env) }],
        messages: [...session.phase1.messages, { role: "user", content: frameInvestigate(chosenText) }],
      }),
    });

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text();
      return { ok: false, status: apiResponse.status, body: errorBody };
    }

    const message = await consumeAnthropicStream(apiResponse.body, (event) =>
      relayEvent(event, (curated) => {
        tracker.push(curated);
        maybeFlushProgress();
      }),
    );
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
      claim_text: session.input,
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
      // S5-1: new field, additive -- what the user actually chose to investigate. site/r.html
      // doesn't read it; it's here for anyone auditing a result later.
      issues_investigated: issues.length > 0 ? issues : custom ? [custom] : [session.phase1.parsed.primary_claim],
    };

    await addToMonthSpend(env, costUsd);
    if (outcome === "ok") {
      await addDuration(env, durationMs);
    }
    await env.RESULTS.put(`result:${id}`, JSON.stringify(record));

    // Final progress write so a still-polling browser learns completion and the result id
    // without needing its own POST fetch() to resolve (it may have moved on to only polling).
    await env.RESULTS
      .put(progressKey, JSON.stringify({ events: tracker.snapshot(), done: true, result_id: id }), {
        expirationTtl: 60,
      })
      .catch(() => {});

    return { ok: true, id };
  }

  const work = runPhase2();
  ctx.waitUntil(work.catch(() => {}));
  const result = await work;

  if (!result.ok) {
    return jsonResponse({ error: "upstream API error", status: result.status, body: result.body }, 502);
  }
  return jsonResponse({ id: result.id });
}

// S5-2: GET /session/:id/progress?invite_word=<word>. Polled by the browser while phase 2 runs
// (see handleProceedSession). Returns { events: [...], done, result_id? }. No session record to
// check against (the session was deleted the moment /proceed started) -- an unknown or expired
// progress key just means "nothing to show yet" rather than a 404, since a slow first poll
// arriving before the first throttled flush is a normal, expected timing, not an error.
async function handleGetProgress(url, env, sessionId) {
  const inviteWord = url.searchParams.get("invite_word")?.trim() ?? "";
  if (!inviteWord || inviteWord !== env.INVITE_WORD) {
    return new Response("Unauthorized", { status: 403, headers: CORS_HEADERS });
  }
  const stored = await env.RESULTS.get(`progress:${sessionId}`);
  if (stored === null) {
    return jsonResponse({ events: [], done: false });
  }
  return new Response(stored, { headers: { "content-type": "application/json", ...CORS_HEADERS } });
}

// S4-2: GET /durations?invite_word=<word> -> { mean, stdDev, min, max, count, lower, upper }.
// Returns duration stats for successful checks this month. Gated by invite word like /spend.
// lower/upper are mean ± 1 std dev (the predicted range).
async function handleGetDurations(url, env) {
  const inviteWord = url.searchParams.get("invite_word")?.trim() ?? "";
  if (!inviteWord || inviteWord !== env.INVITE_WORD) {
    return new Response("Unauthorized", { status: 403, headers: CORS_HEADERS });
  }

  const stats = await getDurationStats(env);
  if (!stats) {
    return jsonResponse({ mean: null, stdDev: null, min: null, max: null, count: 0, lower: null, upper: null });
  }

  return jsonResponse({
    mean: stats.mean,
    stdDev: stats.stdDev,
    min: stats.min,
    max: stats.max,
    count: stats.count,
    lower: Math.round(Math.max(0, stats.mean - stats.stdDev)),
    upper: Math.round(stats.mean + stats.stdDev),
  });
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
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    if (url.pathname === "/check" && request.method === "POST") {
      return handleCheck(request, env);
    }
    if (url.pathname === "/session" && request.method === "POST") {
      return handleCreateSession(request, env, ctx);
    }
    const sessionProceedMatch = url.pathname.match(/^\/session\/([^/]+)\/proceed$/);
    if (sessionProceedMatch && request.method === "POST") {
      return handleProceedSession(request, env, ctx, sessionProceedMatch[1]);
    }
    const sessionProgressMatch = url.pathname.match(/^\/session\/([^/]+)\/progress$/);
    if (sessionProgressMatch && request.method === "GET") {
      return handleGetProgress(url, env, sessionProgressMatch[1]);
    }
    if (url.pathname === "/durations" && request.method === "GET") {
      return handleGetDurations(url, env);
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
