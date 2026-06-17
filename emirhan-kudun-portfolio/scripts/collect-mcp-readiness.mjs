import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputPath = path.join(root, "packages/runtime/src/mcp-readiness.generated.json");
const archivePath = "/Users/emirhan/Downloads/PortfolioWebsite/emirhan-kudun-fullstack-portfolio-fullstack-infra-v1.zip";

function normalizeId(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function readArchiveCatalog() {
  if (!fs.existsSync(archivePath)) {
    return { count: 0, ids: new Set() };
  }

  try {
    const raw = execFileSync("unzip", ["-p", archivePath, "config/mcp-catalog.json"], {
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024
    });
    const parsed = JSON.parse(raw);
    const mcps = Array.isArray(parsed.mcps) ? parsed.mcps : [];
    return {
      count: mcps.length,
      ids: new Set(mcps.map((item) => normalizeId(item.id || item.name)))
    };
  } catch {
    return { count: 0, ids: new Set() };
  }
}

function parseMcpList(raw) {
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const body = lines.filter((line) => !line.startsWith("Name "));
  const items = [];

  for (const line of body) {
    const columns = line.trim().split(/\s{2,}/);
    if (columns.length < 7) continue;

    const [name, command, args, env, cwd, status, auth] = columns;
    const id = normalizeId(name);
    const hasMaskedEnv = env !== "-" && env.includes("*****");
    const writeCapable = /\b(write|deploy|send|payment|terminal_control|allow-write|telegram|slack|gmail|resend)\b/i.test(
      `${name} ${command} ${args}`
    );

    let readiness = "active";
    let notes = "Listed by codex mcp list. No tool call was made.";
    let probe = "list_readiness";

    if (writeCapable) {
      readiness = "skipped_with_reason";
      notes = "Write-capable or externally side-effectful surface; listed but not invoked without explicit target and approval.";
      probe = "not_run";
    } else if (/not logged in/i.test(auth)) {
      readiness = "needs_credentials";
      notes = "Account-scoped connector is present but not authenticated.";
    } else if (/oauth/i.test(auth)) {
      readiness = "needs_credentials";
      notes = "OAuth-scoped connector needs account authorization before live use.";
    } else if (hasMaskedEnv) {
      readiness = "configured";
      notes = "Environment-backed connector appears configured; only readiness metadata is exposed.";
    } else if (!/enabled/i.test(status)) {
      readiness = "unavailable";
      notes = "Connector is listed but not enabled.";
    }

    items.push({
      id,
      name,
      category: "mcp",
      status: readiness,
      scope: `${command} ${args}`.trim().slice(0, 220),
      requiresEnv: hasMaskedEnv ? ["configured_env"] : [],
      lastChecked: new Date().toISOString(),
      notes,
      auth,
      sourceType: cwd && cwd !== "-" ? "workspace" : "local",
      archiveStatus: "unknown",
      probe
    });
  }

  return items;
}

const archive = readArchiveCatalog();
const rawList = execFileSync("codex", ["mcp", "list"], {
  encoding: "utf8",
  maxBuffer: 32 * 1024 * 1024
});
const generatedAt = new Date().toISOString();
const items = parseMcpList(rawList).map((item) => ({
  ...item,
  archiveStatus: archive.ids.has(item.id) ? "matched" : "live_only",
  lastChecked: generatedAt
}));

const liveIds = new Set(items.map((item) => item.id));
for (const id of archive.ids) {
  if (liveIds.has(id)) continue;
  items.push({
    id,
    name: id,
    category: "mcp",
    status: "skipped_with_reason",
    scope: "Present in infra-v1 archive MCP catalog but not present in live codex mcp list.",
    requiresEnv: [],
    lastChecked: generatedAt,
    notes: "Archive-only MCP reference retained for readiness comparison.",
    auth: "archive",
    sourceType: "archive",
    archiveStatus: "archive_only",
    probe: "not_run"
  });
}

items.sort((a, b) => a.name.localeCompare(b.name));

const snapshot = {
  generatedAt,
  sourceCommand: "codex mcp list",
  sourceArchiveCount: archive.count,
  items
};

fs.writeFileSync(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(`MCP readiness snapshot written: ${items.length} items, ${archive.count} archive entries.`);
