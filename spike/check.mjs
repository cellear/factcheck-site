#!/usr/bin/env node
// Timing spike for S1-2 (AMS/SPRINTS/sprint-1.md): one claim, one call, measured.
// Usage: node spike/check.mjs "<claim>" [--model <id>] [--force-tool-error]

import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");

const DEFAULT_MODEL = "claude-sonnet-5";

// $/1M tokens. See AMS/DOC/architecture.md decision 15 and the claude-api skill's model table.
const PRICES_USD_PER_MTOK = {
  "claude-sonnet-5": { input: 2.0, output: 10.0 },
  "claude-haiku-4-5": { input: 1.0, output: 5.0 },
};

// Anthropic web search server tool: $10 per 1,000 searches. Not itemized in
// `usage`, so this is an estimate layered on top of measured token cost.
const WEB_SEARCH_USD_PER_SEARCH = 0.01;

const FALLBACK_BETA = "server-side-fallback-2026-07-01";

// `fallbacks: "default"` is only accepted by Opus-tier/Fable models. Neither
// model in this sprint (claude-sonnet-5, claude-haiku-4-5) supports it — the
// API rejects it with a 400. See the handoff for the doc correction this
// implies for AMS/DOC/architecture.md's "enable from the first commit" line.
const MODELS_SUPPORTING_FALLBACKS = new Set([]);

function parseArgs(argv) {
  let model = DEFAULT_MODEL;
  let forceToolError = false;
  let cache = false;
  const claimParts = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--model") {
      model = argv[++i];
    } else if (arg === "--force-tool-error") {
      forceToolError = true;
    } else if (arg === "--cache") {
      cache = true;
    } else {
      claimParts.push(arg);
    }
  }

  const claim = claimParts.join(" ").trim();
  if (!claim) {
    console.error(
      'Usage: node spike/check.mjs "<claim>" [--model <id>] [--force-tool-error] [--cache]',
    );
    process.exit(1);
  }
  if (!PRICES_USD_PER_MTOK[model]) {
    console.error(
      `Unknown model "${model}". Known models: ${Object.keys(PRICES_USD_PER_MTOK).join(", ")}`,
    );
    process.exit(1);
  }

  return { claim, model, forceToolError, cache };
}

function webSearchTool(model, forceToolError) {
  // web_search_20260209 (dynamic filtering) is the current-generation variant;
  // Haiku 4.5 predates it and only supports the basic 20250305 variant.
  const type = model === "claude-haiku-4-5" ? "web_search_20250305" : "web_search_20260209";
  return {
    type,
    name: "web_search",
    // max_uses must be > 0 (0 is a 400 at request-validation time, not a
    // per-search error). Capping at 1 forces a max_uses_exceeded error on
    // any search past the first for claims needing multiple searches.
    max_uses: forceToolError ? 1 : 5,
  };
}

function countWebSearches(message) {
  return message.content.filter((block) => block.type === "web_search_tool_result").length;
}

// Failure-handling rule (AMS/DOC/architecture.md): a check that did not
// complete cleanly is classified as failed, never as a completed verdict.
// Refusals and web-search errors both return HTTP 200, so this has to be
// read out of the message body, not out of a thrown exception.
function classifyOutcome(message) {
  if (message.stop_reason === "refusal") return "refusal";
  if (message.stop_reason === "max_tokens") return "truncated";

  const hasToolError = message.content.some((block) => {
    if (block.type !== "web_search_tool_result") return false;
    // Success `content` is a list of results; an error is a single object.
    return !Array.isArray(block.content);
  });
  if (hasToolError) return "tool_error";

  if (message.stop_reason === "end_turn") return "ok";

  // pause_turn, tool_use, stop_sequence: none expected for a single-call
  // spike with only a server tool. Treat as not-cleanly-completed.
  return "truncated";
}

function extractReportText(message) {
  return message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n\n");
}

function extractToolErrors(message) {
  return message.content
    .filter((block) => block.type === "web_search_tool_result" && !Array.isArray(block.content))
    .map((block) => block.content);
}

function computeCostUsd(model, usage, searchCount) {
  const price = PRICES_USD_PER_MTOK[model];
  const inputCost = (usage.input_tokens / 1_000_000) * price.input;
  const outputCost = (usage.output_tokens / 1_000_000) * price.output;
  const cacheWriteCost =
    ((usage.cache_creation_input_tokens ?? 0) / 1_000_000) * price.input * 1.25;
  const cacheReadCost = ((usage.cache_read_input_tokens ?? 0) / 1_000_000) * price.input * 0.1;
  const searchCost = searchCount * WEB_SEARCH_USD_PER_SEARCH;
  return inputCost + outputCost + cacheWriteCost + cacheReadCost + searchCost;
}

function readSkillCommit() {
  const source = readFileSync(join(REPO_ROOT, "skill", "SOURCE.md"), "utf8");
  const match = source.match(/Commit hash:\*\*\s*([0-9a-f]{7,40})/i);
  return match ? match[1] : null;
}

function timestampSlug() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
}

async function main() {
  const { claim, model, forceToolError, cache } = parseArgs(process.argv.slice(2));
  const skillMd = readFileSync(join(REPO_ROOT, "skill", "SKILL.md"), "utf8");
  const skillCommit = readSkillCommit();

  const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

  const startedAt = new Date();
  const startMs = Date.now();

  // Nudge the model into a second search call so a max_uses:1 cap actually
  // triggers a tool_error (whether it needs a second search is otherwise
  // model discretion, and won't reliably reproduce run to run).
  const userContent = forceToolError
    ? `${claim}\n\n(For this check, run at least two separate web searches on different sub-claims or sources before writing your report.)`
    : claim;

  // S2-7: does prompt caching reduce billed input tokens inside the server-tool
  // loop? Behind a flag so default behavior (a plain string system prompt) is
  // unchanged when --cache is not passed. SKILL.md is the largest stable prefix
  // by a wide margin (tens of thousands of tokens vs. one small tool definition),
  // so that's the only block marked cacheable here.
  const system = cache
    ? [{ type: "text", text: skillMd, cache_control: { type: "ephemeral" } }]
    : skillMd;

  const supportsFallbacks = MODELS_SUPPORTING_FALLBACKS.has(model);
  const baseParams = {
    model,
    max_tokens: 8192,
    system,
    tools: [webSearchTool(model, forceToolError)],
    messages: [{ role: "user", content: userContent }],
  };

  let finalMessage;
  try {
    const stream = supportsFallbacks
      ? client.beta.messages.stream({
          ...baseParams,
          betas: [FALLBACK_BETA],
          fallbacks: "default",
        })
      : client.messages.stream(baseParams);
    finalMessage = await stream.finalMessage();
  } catch (error) {
    console.error(`API call failed before a message was returned: ${error.message}`);
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("Check that ANTHROPIC_API_KEY is set in the environment.");
    }
    process.exit(1);
  }

  const durationMs = Date.now() - startMs;
  const outcome = classifyOutcome(finalMessage);
  const searches = countWebSearches(finalMessage);
  const usage = finalMessage.usage;
  const costUsd = computeCostUsd(model, usage, searches);
  const reportText = extractReportText(finalMessage);
  const toolErrors = extractToolErrors(finalMessage);
  const usedFallback = finalMessage.content.some((block) => block.type === "fallback");

  const record = {
    created_at: startedAt.toISOString(),
    claim_text: claim,
    model,
    served_by_model: finalMessage.model,
    skill_commit: skillCommit,
    forced_tool_error: forceToolError,
    outcome,
    stop_reason: finalMessage.stop_reason,
    stop_details: finalMessage.stop_details ?? null,
    used_fallback: usedFallback,
    duration_ms: durationMs,
    usage: {
      input_tokens: usage.input_tokens,
      output_tokens: usage.output_tokens,
      cache_creation_input_tokens: usage.cache_creation_input_tokens ?? 0,
      cache_read_input_tokens: usage.cache_read_input_tokens ?? 0,
      searches,
    },
    cost_usd: Number(costUsd.toFixed(6)),
    tool_errors: toolErrors,
    report: reportText,
  };

  mkdirSync(join(REPO_ROOT, "spike", "results"), { recursive: true });
  const slug = `${timestampSlug()}-${model}`;
  const mdPath = join(REPO_ROOT, "spike", "results", `${slug}.md`);
  const jsonPath = join(REPO_ROOT, "spike", "results", `${slug}.json`);

  const mdLines = [
    "# Fact-Check Spike Result",
    "",
    `- Claim: ${claim}`,
    `- Model: ${model}${usedFallback ? ` (served by ${finalMessage.model} via fallback)` : ""}`,
    `- Timestamp: ${record.created_at}`,
    `- Duration: ${durationMs} ms`,
    `- Outcome: ${outcome}`,
    `- Stop reason: ${finalMessage.stop_reason}`,
    `- Usage: input=${usage.input_tokens} output=${usage.output_tokens} cache_read=${record.usage.cache_read_input_tokens} cache_write=${record.usage.cache_creation_input_tokens} searches=${searches}`,
    `- Cost: $${record.cost_usd}`,
    `- Skill commit: ${skillCommit ?? "unknown"}`,
    "",
    "---",
    "",
  ];

  if (outcome !== "ok") {
    mdLines.push(
      "**This check did not complete cleanly and is rendered as a failed check, not a verdict.**",
      "",
    );
    if (outcome === "refusal" && finalMessage.stop_details) {
      mdLines.push(
        `Refusal category: ${finalMessage.stop_details.category ?? "unknown"}`,
        `Explanation: ${finalMessage.stop_details.explanation ?? "none given"}`,
        "",
      );
    }
    if (outcome === "tool_error") {
      mdLines.push("Web search tool error(s):", "```json", JSON.stringify(toolErrors, null, 2), "```", "");
    }
  }

  mdLines.push(reportText || "_(no report text returned)_");

  writeFileSync(mdPath, mdLines.join("\n") + "\n", "utf8");
  writeFileSync(jsonPath, JSON.stringify(record, null, 2) + "\n", "utf8");

  console.log(`outcome=${outcome} stop_reason=${finalMessage.stop_reason} duration_ms=${durationMs} cost_usd=${record.cost_usd} searches=${searches} cache_read_input_tokens=${record.usage.cache_read_input_tokens} cache_creation_input_tokens=${record.usage.cache_creation_input_tokens}`);
  console.log(`report: ${mdPath}`);
  console.log(`record: ${jsonPath}`);
}

main();
