#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  printHelp();
  process.exit(0);
}

const sourceRoot = resolveCandidatePath(args.source, path.join(ROOT, "SEIS"));
if (!sourceRoot || !fs.existsSync(sourceRoot) || !fs.statSync(sourceRoot).isDirectory()) {
  console.error(`Kaynak klasör bulunamadı: ${sourceRoot || "<undefined>"}`);
  process.exit(1);
}

const reportJsonPath = resolveCandidatePath(args["report-json"], path.join(ROOT, "reports", "third-party-intake-blueprint.json"));
const reportMdPath = resolveCandidatePath(args["report-md"], path.join(ROOT, "reports", "third-party-intake-blueprint.md"));

const dryRun = args["dry-run"] !== false;
const includeDiff = args.diff === true;
const maxDiffLength = Number.parseInt(args["max-diff"] || "1200", 10);

const candidates = [
  {
    id: "mcp-server",
    title: "MCP sunucu çekirdeği",
    priority: "critical",
    source: "mcp/seis-mcp-server.mjs",
    target: "mcp/seis-mcp-server.mjs",
    reason: "Yerel MCP araç yüzeyi ve SEIS + LLM yönlendirme çekirdeği."
  },
  {
    id: "seis-plugin-launcher",
    title: "SEIS MCP launcher",
    priority: "critical",
    source: "plugins/seis/scripts/seis-mcp-launcher.mjs",
    target: "plugins/seis/scripts/seis-mcp-launcher.mjs",
    reason: "Plugin-MCP köprü noktası: SEIS motorunu taşınabilir konuma bağlar."
  },
  {
    id: "seis-plugin-bundle-audit",
    title: "Bundle audit scripti",
    priority: "high",
    source: "plugins/seis/scripts/seis-mcp-bundle-audit.sh",
    target: "plugins/seis/scripts/seis-mcp-bundle-audit.sh",
    reason: "Kurulum öncesi kritik kontrol: bundle varlık ve bütünlük"
  },
  {
    id: "seis-plugin-sync",
    title: "Plugin bundle sync",
    priority: "high",
    source: "scripts/sync-seis-plugin-bundle.mjs",
    target: "scripts/sync-seis-plugin-bundle.mjs",
    reason: "3. taraf bundle importu yerine kontrollü repo-local plugin eşleme."
  },
  {
    id: "seis-plugin-refresh",
    title: "Plugin bundle refresh",
    priority: "high",
    source: "scripts/refresh-seis-plugin-bundle.mjs",
    target: "scripts/refresh-seis-plugin-bundle.mjs",
    reason: "Sync + check + (opsiyonel) install döngüsünü güvenli biçimde yönetir."
  },
  {
    id: "seis-plugin-check",
    title: "SEIS plugin doğrulayıcı",
    priority: "high",
    source: "scripts/check-seis-plugin-bundle.mjs",
    target: "scripts/check-seis-plugin-bundle.mjs",
    reason: "MCP/plug-in varlıklarını sürüm ve politika açısından doğrular."
  },
  {
    id: "seis-repos-bridge-check",
    title: "REPO-LLM köprü doğrulayıcısı",
    priority: "high",
    source: "scripts/check-seis-repos-llm-bridge.mjs",
    target: "scripts/check-seis-repos-llm-bridge.mjs",
    reason: "Köprü manifestini ve yönlendirme dosyalarını bütünlüklü doğrular."
  },
  {
    id: "llm-planner",
    title: "LLM planlayıcı",
    priority: "high",
    source: "packages/ai-language/src/llm-task-planner.mjs",
    target: "packages/ai-language/src/llm-task-planner.mjs",
    reason: "Özel rota kararı: SEIS Agent (uzak yönetim) + yerel yardımcılar."
  },
  {
    id: "llm-registry",
    title: "LLM paket envanteri",
    priority: "medium",
    source: "content/development/llm-package-registry.json",
    target: "content/development/llm-package-registry.json",
    reason: "Eklenebilecek modellerin listesi, durumları ve kullanım alanları."
  },
  {
    id: "llm-routing-policy",
    title: "LLM görev yönlendirme politikası",
    priority: "high",
    source: "content/development/llm-task-routing-policy.json",
    target: "content/development/llm-task-routing-policy.json",
    reason: "Politika düzeyi: uzak orkestrasyon ve yerel yardımcı sınırları."
  },
  {
    id: "llm-adapter-readiness",
    title: "LLM adaptör hazırbulma",
    priority: "medium",
    source: "content/development/llm-adapter-readiness.json",
    target: "content/development/llm-adapter-readiness.json",
    reason: "OpenAI, Claude, Gemini, Ollama vb. için hazır olma durumu."
  },
  {
    id: "llm-request-blueprints",
    title: "LLM istek şablonları",
    priority: "low",
    source: "content/development/llm-request-blueprints.json",
    target: "content/development/llm-request-blueprints.json",
    reason: "Model çağrıları için standardize edilmiş istek gövdesi."
  },
  {
    id: "mcp-manifest",
    title: "MCP manifest veri dosyası",
    priority: "medium",
    source: "data/seis-mcp-server-2026-06-07.json",
    target: "data/seis-mcp-server-2026-06-07.json",
    reason: "MCP server hazırbulma manifesti, sürüm/açıklama odaklı."
  },
  {
    id: "bridge-manifest",
    title: "REPO-LLM köprü manifesti",
    priority: "critical",
    source: "data/seis-repos-llm-bridge-2026-06-08.json",
    target: "data/seis-repos-llm-bridge-2026-06-08.json",
    reason: "Kaynak, plugin, MCP ve LLM varlıkları arasında ana bağ."
  },
  {
    id: "plugin-codex-json",
    title: "Plugin manifest",
    priority: "high",
    source: "plugins/seis/.codex-plugin/plugin.json",
    target: "plugins/seis/.codex-plugin/plugin.json",
    reason: "SKILL-kapak ve plugin yetenek tanımı."
  },
  {
    id: "plugin-mcp-json",
    title: "Plugin MCP manifesti",
    priority: "high",
    source: "plugins/seis/.mcp.json",
    target: "plugins/seis/.mcp.json",
    reason: "MCP server transport referansı."
  },
];

const sourcePrefix = trimPath(sourceRoot);
const targetPrefix = trimPath(ROOT);
const inventory = {
  startedAt: new Date().toISOString(),
  sourceRoot: sourcePrefix,
  targetRoot: targetPrefix,
  options: {
    dryRun,
    includeDiff
  },
  summary: {
    candidateCount: candidates.length,
    adopted: 0,
    adapt: 0,
    add: 0,
    missingSource: 0,
    identical: 0,
    conflict: 0,
    ignored: 0
  },
  items: [],
  archiveAndSkips: {
    archives: [],
    ignoredDirs: [],
    ignoredFiles: []
  },
  recommendations: [],
  nextStep: []
};

for (const candidate of candidates) {
  const sourcePath = path.join(sourceRoot, candidate.source);
  const targetPath = path.join(ROOT, candidate.target);

  const sourceExists = exists(sourcePath);
  const targetExists = exists(targetPath);
  const sourceHash = sourceExists ? hashFile(sourcePath) : null;
  const targetHash = targetExists ? hashFile(targetPath) : null;
  const same = sourceHash && targetHash ? sourceHash === targetHash : false;

  let status = "missing-source";
  let action = "ignore";
  let severity = "note";
  let note = "";
  let diffPreview = "";

  if (!sourceExists && targetExists) {
    status = "target-only";
    action = "keep-existing";
    severity = "low";
    note = "Kaynakta karşılık bulunamadı, mevcut hedef korunmalı.";
    inventory.summary.missingSource += 1;
  } else if (sourceExists && !targetExists) {
    status = "add-new";
    action = "import";
    severity = candidate.priority === "critical" ? "high" : candidate.priority === "high" ? "medium" : "low";
    note = "Bu dosya sadece kaynakta var; adaptasyon için aday.";
    inventory.summary.adopted += 1;
    inventory.summary.add += 1;
  } else if (sourceExists && targetExists && same) {
    status = "aligned";
    action = "keep";
    severity = "low";
    note = "Kaynak ve hedef aynı içerikte.";
    inventory.summary.identical += 1;
  } else if (sourceExists && targetExists && !same) {
    status = "adapt";
    action = "manual-merge";
    severity = candidate.priority === "critical" ? "high" : "medium";
    note = "Kaynak ile hedef farklı; farkı inceleyip adapt etmelisin.";
    inventory.summary.adapt += 1;
    inventory.summary.conflict += 1;
    if (includeDiff) {
      diffPreview = buildSimpleDiff(sourcePath, targetPath, maxDiffLength);
    }
  }

  inventory.items.push({
    id: candidate.id,
    title: candidate.title,
    priority: candidate.priority,
    source: trimPath(sourcePath),
    target: trimPath(targetPath),
    status,
    action,
    severity,
    reason: candidate.reason,
    note,
    hashes: { source: sourceHash, target: targetHash }
  });

  if (diffPreview) {
    inventory.items[inventory.items.length - 1].diff = diffPreview;
  }
}

if (exists(path.join(sourceRoot, "data"))) {
  gatherArchivesAndSkips(path.join(sourceRoot, "data"), "data", inventory);
}

if (exists(path.join(sourceRoot, "releases"))) {
  gatherArchivesAndSkips(path.join(sourceRoot, "releases"), "releases", inventory);
}

if (exists(path.join(sourceRoot, "reports"))) {
  gatherArchivesAndSkips(path.join(sourceRoot, "reports"), "reports", inventory);
}

inventory.summary.ignored = inventory.archiveAndSkips.archives.length + inventory.archiveAndSkips.ignoredFiles.length + inventory.archiveAndSkips.ignoredDirs.length;

inventory.recommendations.push({
  phase: "Önce",
  actions: [
    "Önce critical ve high öncelik gruplarını kapla: bridge manifest, MCP sunucu, launcher, routing policy.",
    "Çakışan dosyalarda önce güvenlik ve erişim tarafını (plugin/.mcp.json, plugin.json) senkronla.",
    "archive ve release paketlerini doğrudan ekleme; referans için sadece dokümanda tut."
  ]
});
inventory.recommendations.push({
  phase: "Sonra",
  actions: [
    "Çeşitlenmiş LLM paket listesi ile content/development dosyalarını güncelle ve iş akışını doğrula.",
    "npm run check:llm-orchestration-policy && npm run check:seis-repos-llm-bridge ile uyumluluk test et.",
    "npm run automation:refresh-seis-surface --summary ile yüzey bütünlüğünü test et."
  ]
});

inventory.nextStep = deriveNextStep(inventory.items);

const byPriority = {
  critical: inventory.items.filter((item) => item.status !== "aligned" && item.priority === "critical"),
  high: inventory.items.filter((item) => item.status !== "aligned" && item.priority === "high"),
  medium: inventory.items.filter((item) => item.status !== "aligned" && item.priority === "medium"),
  low: inventory.items.filter((item) => item.status !== "aligned" && item.priority === "low")
};

inventory.summary.recommendationCount = byPriority.critical.length + byPriority.high.length + byPriority.medium.length + byPriority.low.length;

fs.mkdirSync(path.dirname(reportJsonPath), { recursive: true });
fs.writeFileSync(reportJsonPath, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");
fs.writeFileSync(reportMdPath, generateMarkdownReport(inventory, byPriority), "utf8");

console.log(`SEIS üçüncü taraf uyum özeti yazıldı.`);
console.log(`- JSON: ${path.relative(ROOT, reportJsonPath)}`);
console.log(`- MD:   ${path.relative(ROOT, reportMdPath)}`);

function printHelp() {
  console.log(`
SEIS üçüncü taraf kaynak uyum tarayıcısı

Komut:
  node scripts/third-party-intake-blueprint.mjs [seçenekler]

Seçenekler:
  --source <path>       Üçüncü taraf kök klasör. Varsayılan: ./SEIS
  --report-json <path>  JSON çıktı yolu. Varsayılan: reports/third-party-intake-blueprint.json
  --report-md <path>    Markdown çıktı yolu. Varsayılan: reports/third-party-intake-blueprint.md
  --diff                Adapt gerektiren dosyalarda kısa karşılaştırma eklesin.
  --max-diff <n>        Diff önizleme uzunluğu (varsayılan 1200).
  --help                Bu yardım metni.
`);
}

function parseArgs(argv) {
  const result = { };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token || !token.startsWith("--")) {
      continue;
    }
    if (token === "--help") {
      result.help = true;
      continue;
    }
    if (token === "--diff") {
      result.diff = true;
      continue;
    }
    if (token.startsWith("--source")) {
      const value = getValue(argv, i);
      if (value === null) continue;
      result.source = value;
      i += 1;
      continue;
    }
    if (token.startsWith("--report-json")) {
      const value = getValue(argv, i);
      if (value === null) continue;
      result["report-json"] = value;
      i += 1;
      continue;
    }
    if (token.startsWith("--report-md")) {
      const value = getValue(argv, i);
      if (value === null) continue;
      result["report-md"] = value;
      i += 1;
      continue;
    }
    if (token.startsWith("--max-diff")) {
      const value = getValue(argv, i);
      if (value === null) continue;
      result["max-diff"] = value;
      i += 1;
      continue;
    }
  }
  return result;
}

function getValue(argv, index) {
  const current = argv[index];
  if (current.includes("=")) {
    return current.split("=").slice(1).join("=");
  }
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    return null;
  }
  return value;
}

function resolveCandidatePath(candidate, fallback) {
  if (typeof candidate === "string" && candidate.trim()) {
    return path.resolve(candidate.trim());
  }
  return fallback;
}

function exists(candidate) {
  return fs.existsSync(candidate);
}

function hashFile(filePath) {
  const raw = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function trimPath(filePath) {
  return filePath.replace(/\\/g, "/");
}

function buildSimpleDiff(sourcePath, targetPath, maxLen) {
  try {
    const source = fs.readFileSync(sourcePath, "utf8");
    const target = fs.readFileSync(targetPath, "utf8");

    const sourceLines = source.split("\n");
    const targetLines = target.split("\n");
    const maxLine = Math.min(sourceLines.length, targetLines.length, 5);
    const samplePairs = [];
    for (let i = 0; i < maxLine; i += 1) {
      if (sourceLines[i] !== targetLines[i]) {
        samplePairs.push(`L${i + 1} | src: ${sourceLines[i]} || tgt: ${targetLines[i]}`);
      }
      if (samplePairs.length >= 5) break;
    }
    if (samplePairs.length === 0) {
      return "İçerik eşleşiyor gibi görünüyor ama hash farklı; satır karşılaştırmasında fark çıkarılamadı.";
    }
    return samplePairs.join("\n").slice(0, maxLen);
  } catch (error) {
    return `diff üretilemedi: ${error.message}`;
  }
}

function gatherArchivesAndSkips(basePath, scope, inventory) {
  try {
    const entries = fs.readdirSync(basePath, { withFileTypes: true });
    for (const entry of entries) {
      const rel = trimPath(path.relative(sourceRoot, path.join(basePath, entry.name)));
      if (entry.isDirectory()) {
        if (entry.name === ".git") {
          inventory.archiveAndSkips.ignoredDirs.push(rel);
          continue;
        }
        if (scope === "releases" && entry.name.toLowerCase().includes("static")) {
          inventory.archiveAndSkips.archives.push(rel);
          continue;
        }
      } else if (entry.isFile()) {
        if (entry.name.endsWith(".zip")) {
          inventory.archiveAndSkips.archives.push(rel);
          continue;
        }
        if ([".log", ".DS_Store", ".env", ".pem"].includes(path.extname(entry.name))) {
          inventory.archiveAndSkips.ignoredFiles.push(rel);
        }
      }
    }
  } catch (_error) {
    // no-op, güvenli pass
  }
}

function deriveNextStep(items) {
  const critical = items.filter((item) => item.priority === "critical" && item.status !== "aligned").map((item) => item.id);
  const high = items.filter((item) => item.priority === "high" && item.status !== "aligned").map((item) => item.id);
  const medium = items.filter((item) => item.priority === "medium" && item.status !== "aligned").map((item) => item.id);

  return [
    ...critical,
    ...high,
    ...medium
  ].slice(0, 8);
}

function generateMarkdownReport(report, byPriority) {
  const md = [];
  md.push("# SEIS Üçüncü Taraf Uyum Haritası");
  md.push("");
  md.push(`Oluşturulma: ${report.startedAt}`);
  md.push(`Kaynak: ${report.sourceRoot}`);
  md.push(`Hedef: ${report.targetRoot}`);
  md.push("");
  md.push("## Özet");
  md.push(`- Toplam aday dosya: ${report.summary.candidateCount}`);
  md.push(`- Kaynaktan eklenecek: ${report.summary.add}`);
  md.push(`- Adaptasyon gereken: ${report.summary.adapt}`);
  md.push(`- Tamamen uyumlu: ${report.summary.identical}`);
  md.push(`- Kaynakta olmayan ama hedefte olan: ${report.summary.missingSource}`);
  md.push("");
  md.push("## Aksiyon önceliği (Critical)");
  for (const item of byPriority.critical) {
    md.push(`- ${item.title}: **${item.status}**`);
  }
  md.push("");
  md.push("## Aksiyon önceliği (High)");
  for (const item of byPriority.high) {
    md.push(`- ${item.title}: **${item.status}**`);
  }
  md.push("");
  md.push("## Aksiyon önceliği (Medium)");
  for (const item of byPriority.medium) {
    md.push(`- ${item.title}: **${item.status}**`);
  }
  md.push("");
  md.push("## Aksiyon önceliği (Low)");
  for (const item of byPriority.low) {
    md.push(`- ${item.title}: **${item.status}**`);
  }
  md.push("");
  md.push("## Önerilen Yol");
  md.push("1. `npm run check:seis-plugin-bundle`");
  md.push("2. `npm run check:seis-repos-llm-bridge`");
  md.push("3. `npm run check:llm-orchestration-policy`");
  md.push("4. `npm run automation:refresh-seis-surface --summary`");
  md.push("");

  if (report.archiveAndSkips.archives.length > 0) {
    md.push("## Atlanan büyük/ham dosya kümeleri");
    for (const archive of report.archiveAndSkips.archives.slice(0, 60)) {
      md.push(`- ${archive}`);
    }
    if (report.archiveAndSkips.archives.length > 60) {
      md.push(`- ... ${report.archiveAndSkips.archives.length - 60} dosya daha`);
    }
  }

  return `${md.join("\n")}\n`;
}
