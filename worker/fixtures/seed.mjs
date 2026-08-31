#!/usr/bin/env node
// S2-6: seed KV with fixture records for every failure outcome, plus one ok record
// with search_cap_hit, so Luke can open a stable permalink for each without spending.
// Usage: node worker/fixtures/seed.mjs
//
// Writes via `wrangler kv key put --remote`, reading the namespace id from
// worker/wrangler.jsonc so this stays in sync if the namespace ever changes.

import { execFileSync } from "child_process";
import { writeFileSync, mkdtempSync, readFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const WORKER_DIR = new URL("..", import.meta.url).pathname;
const wranglerConfig = JSON.parse(
  readFileSync(join(WORKER_DIR, "wrangler.jsonc"), "utf8").replace(/\/\/.*$/gm, ""),
);
const NAMESPACE_ID = wranglerConfig.kv_namespaces[0].id;

const COMMON = {
  model: "claude-sonnet-5",
  served_by_model: "claude-sonnet-5",
  skill_commit: "73a08409365b4b07e204989d60682f9de1a2d26a",
};

const FIXTURES = {
  "fixture-refusal": {
    ...COMMON,
    id: "fixture-refusal",
    created_at: "2026-08-31T00:00:00.000Z",
    claim_text: "S2-6 fixture — a seeded example of a refusal, not a real fact-check.",
    report: null,
    citations: [],
    usage: { input_tokens: 4200, output_tokens: 40, searches: 0 },
    cost_usd: 0.0084,
    outcome: "refusal",
    search_cap_hit: false,
    tool_errors: [],
    duration_ms: 3100,
  },
  "fixture-tool-error": {
    ...COMMON,
    id: "fixture-tool-error",
    created_at: "2026-08-31T00:00:00.000Z",
    claim_text: "S2-6 fixture — a seeded example of a tool_error, not a real fact-check.",
    report: null,
    citations: [],
    usage: { input_tokens: 5100, output_tokens: 120, searches: 1 },
    cost_usd: 0.0113,
    outcome: "tool_error",
    search_cap_hit: false,
    tool_errors: [{ type: "web_search_tool_result_error", error_code: "unavailable" }],
    duration_ms: 8400,
  },
  "fixture-truncated": {
    ...COMMON,
    id: "fixture-truncated",
    created_at: "2026-08-31T00:00:00.000Z",
    claim_text: "S2-6 fixture — a seeded example of a truncated check, not a real fact-check.",
    report: null,
    citations: [],
    usage: { input_tokens: 38000, output_tokens: 8192, searches: 4 },
    cost_usd: 0.158,
    outcome: "truncated",
    search_cap_hit: false,
    tool_errors: [],
    duration_ms: 187000,
  },
  "fixture-no-report": {
    ...COMMON,
    id: "fixture-no-report",
    created_at: "2026-08-31T00:00:00.000Z",
    claim_text: "S2-6 fixture — a seeded example of no_report, not a real fact-check.",
    report: null,
    citations: [],
    usage: { input_tokens: 3900, output_tokens: 210, searches: 1 },
    cost_usd: 0.0126,
    outcome: "no_report",
    search_cap_hit: false,
    tool_errors: [],
    duration_ms: 6200,
  },
  "fixture-search-cap-hit": {
    ...COMMON,
    id: "fixture-search-cap-hit",
    created_at: "2026-08-31T00:00:00.000Z",
    claim_text: "S2-6 fixture — a seeded example of search_cap_hit, not a real fact-check.",
    report:
      "# Fact-Check Report\n\n" +
      "## Main Claim Identified\n" +
      "This is a seeded fixture (S2-6) demonstrating how a real report renders when the " +
      "search budget was reached before the model finished gathering sources.\n\n" +
      "## Triage\n" +
      "Fixture content — not a real verdict.\n\n" +
      "## Bottom Line\n" +
      "This is placeholder report text so the result page's markdown rendering, Sources " +
      "list, and search-budget note can all be checked against one fixture.",
    citations: [
      { url: "https://example.com/fixture-source-1", title: "Fixture source 1", cited_text: null },
      { url: "https://example.com/fixture-source-2", title: "Fixture source 2", cited_text: null },
    ],
    usage: { input_tokens: 61000, output_tokens: 2400, searches: 5 },
    cost_usd: 0.196,
    outcome: "ok",
    search_cap_hit: true,
    tool_errors: [{ type: "web_search_tool_result_error", error_code: "max_uses_exceeded" }],
    duration_ms: 94000,
  },
};

const tmpDir = mkdtempSync(join(tmpdir(), "factcheck-fixtures-"));

for (const [id, record] of Object.entries(FIXTURES)) {
  const filePath = join(tmpDir, `${id}.json`);
  writeFileSync(filePath, JSON.stringify(record, null, 2));
  execFileSync(
    "npx",
    [
      "wrangler",
      "kv",
      "key",
      "put",
      `result:${id}`,
      "--path",
      filePath,
      "--namespace-id",
      NAMESPACE_ID,
      "--remote",
    ],
    { cwd: WORKER_DIR, stdio: "inherit" },
  );
  console.log(`seeded result:${id}`);
}

console.log("\nDone. Permalinks (once the site is deployed):");
for (const id of Object.keys(FIXTURES)) {
  console.log(`  https://factcheck-site.pages.dev/r/${id}`);
}
