#!/usr/bin/env node
// SEIS AI integration & training orchestrator.
// Unifies the four SEIS AI surfaces into a single integration ledger so the
// agent is "trained" on one coherent map of its own capabilities:
//   1. unified tools  — MCP tools + bin entry points + polyglot lanes
//   2. knowledge      — skill guide + CLAUDE.md reference docs
//   3. audit          — one-command audit entry points
//   4. agent          — composed agent lanes + skills
// Default run regenerates data/seis-ai-integration-training.json.
// `--check` verifies the committed ledger still matches reality.
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const isCheck = process.argv.includes("--check");
const manifestPath = path.join(root, "data/seis-ai-integration-training.json");

const exists = (rel) => fs.existsSync(path.join(root, rel));
const listDirs = (rel) => {
  const dir = path.join(root, rel);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
};
const listFiles = (rel, ext) => {
  const dir = path.join(root, rel);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && (!ext || e.name.endsWith(ext)))
    .map((e) => e.name)
    .sort();
};
const countMatches = (rel, needle) => {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) return 0;
  return fs.readFileSync(file, "utf8").split(needle).length - 1;
};

/**
 * Scan the repo and assemble the unified SEIS AI capability ledger.
 * Counts MCP tools, bin entry points, polyglot lanes, and agent lanes/skills
 * into a structured object suitable for serialization and verification.
 * @returns {object} The freshly derived integration/training ledger.
 */
function buildLedger() {
  const binaries = listFiles("packages/seis-ai/bin", ".mjs");
  const polyglotLanguages = listDirs("polyglot");
  const agentLanes = listFiles("plugins/seis-ai-agent/assets/lanes", ".json").map((f) =>
    f.replace(/\.json$/, "")
  );
  const agentSkills = listDirs("plugins/seis-ai-agent/skills");
  return {
    name: "seis-ai-integration-training",
    description:
      "Unified integration ledger that trains SEIS AI on its own capability surface.",
    generatedBy: "scripts/seis-ai-integration-training.mjs",
    lanes: {
      unifiedTools: {
        mcpToolCount: countMatches("packages/seis-ai/src/mcp/server.mjs", "server.tool("),
        binaries,
        polyglotLanguageCount: polyglotLanguages.length,
      },
      knowledge: {
        skillGuide: ".claude/skills/seis-ai/SKILL.md",
        rootGuide: "CLAUDE.md",
      },
      audit: {
        entryPoints: ["npm run seis:check", "./scripts/polyglot-check.sh"],
      },
      agent: {
        lanes: agentLanes,
        skills: agentSkills,
      },
    },
  };
}

/**
 * Validate a ledger against on-disk reality: minimum lane counts and the
 * existence of every referenced binary, doc, agent lane, and skill.
 * Defensive against a missing or malformed ledger object.
 * @param {object} ledger The ledger to verify (committed or freshly built).
 * @returns {string[]} A list of failure messages; empty when everything passes.
 */
function verify(ledger) {
  const failures = [];
  const ensure = (cond, msg) => {
    if (!cond) failures.push(msg);
  };

  const lanes = ledger?.lanes;
  if (!lanes) {
    failures.push("ledger is missing the 'lanes' property or is malformed");
    return failures;
  }

  // Lane 1 — unified tools
  const t = lanes.unifiedTools;
  ensure(t?.mcpToolCount >= 16, `expected >=16 MCP tools, ledger has ${t?.mcpToolCount ?? "undefined"}`);
  ensure(t?.binaries?.length >= 3, `expected >=3 seis-ai binaries, ledger has ${t?.binaries?.length ?? "undefined"}`);
  for (const bin of t?.binaries ?? []) ensure(exists(`packages/seis-ai/bin/${bin}`), `missing binary ${bin}`);
  ensure(t?.polyglotLanguageCount >= 33, `expected >=33 polyglot lanes, ledger has ${t?.polyglotLanguageCount ?? "undefined"}`);

  // Lane 2 — knowledge
  ensure(lanes.knowledge?.skillGuide && exists(lanes.knowledge.skillGuide), "missing skill guide");
  ensure(lanes.knowledge?.rootGuide && exists(lanes.knowledge.rootGuide), "missing CLAUDE.md");

  // Lane 3 — audit
  ensure(exists("packages/seis-ai/bin/seis-check.mjs"), "missing seis-check audit entry");
  ensure(exists("scripts/polyglot-check.sh"), "missing polyglot-check.sh audit entry");

  // Lane 4 — agent
  ensure(lanes.agent?.lanes?.length > 0, "no agent lanes discovered");
  for (const lane of lanes.agent?.lanes ?? [])
    ensure(exists(`plugins/seis-ai-agent/assets/lanes/${lane}.json`), `missing agent lane ${lane}`);
  for (const skill of lanes.agent?.skills ?? [])
    ensure(exists(`plugins/seis-ai-agent/skills/${skill}`), `missing agent skill ${skill}`);

  return failures;
}

const live = buildLedger();

if (isCheck) {
  if (!fs.existsSync(manifestPath)) {
    console.error("SEIS AI integration ledger missing — run: npm run automation:seis-ai-integration-training");
    process.exit(1);
  }
  let committed;
  try {
    committed = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch (err) {
    console.error(`SEIS AI integration ledger is not valid JSON: ${err.message}`);
    process.exit(1);
  }
  const failures = verify(committed);
  if (JSON.stringify(committed.lanes) !== JSON.stringify(live.lanes)) {
    failures.push("ledger is stale — re-run automation:seis-ai-integration-training");
  }
  if (failures.length) {
    console.error("SEIS AI integration training check failed:");
    for (const f of failures) console.error(`- ${f}`);
    process.exit(1);
  }
  console.log("SEIS AI integration training: OK (4 lanes unified, ledger current)");
  process.exit(0);
}

const failures = verify(live);
if (failures.length) {
  console.error("SEIS AI integration training generation failed:");
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}
fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
fs.writeFileSync(manifestPath, `${JSON.stringify(live, null, 2)}\n`);
const t = live.lanes.unifiedTools;
console.log(`SEIS AI integration ledger written: ${path.relative(root, manifestPath)}`);
console.log(
  `  tools: ${t.mcpToolCount} MCP + ${t.binaries.length} bin + ${t.polyglotLanguageCount} polyglot · ` +
    `agent: ${live.lanes.agent.lanes.length} lanes / ${live.lanes.agent.skills.length} skills`
);
