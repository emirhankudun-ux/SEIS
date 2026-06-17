#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const ROOT = process.cwd();
const workspaceRoot = path.resolve(
  process.env.SEIS_ICLOUD_ROOT ||
    path.join((process.env.HOME || os.homedir()), "Library", "Mobile Documents", "com~apple~CloudDocs", "Github")
);

const REPORT_JSON_PATH = path.join(ROOT, "reports", "icloud-personal-inventory.json");
const REPORT_MD_PATH = path.join(ROOT, "reports", "icloud-personal-inventory.md");

const MAX_DEPTH = 4;
const MAX_SAMPLE_PER_CATEGORY = 30;
const MAX_SAMPLE_FILES = 200;

const CATEGORY_EXT = {
  image: new Set([
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".heic",
    ".bmp",
    ".svg",
    ".avif",
    ".tif",
    ".tiff",
    ".png",
    ".raw"
  ]),
  video: new Set([ ".mp4", ".mov", ".mkv", ".avi", ".webm", ".m4v", ".hevc" ]),
  code: new Set([
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".py",
    ".swift",
    ".m",
    ".mm",
    ".java",
    ".kt",
    ".go",
    ".rs",
    ".php",
    ".rb",
    ".cs",
    ".cpp",
    ".h",
    ".c",
    ".sh",
    ".bash",
    ".zsh",
    ".ps1",
    ".sql"
  ]),
  config: new Set([
    ".json",
    ".yaml",
    ".yml",
    ".toml",
    ".ini",
    ".env",
    ".md"
  ])
};

const IGNORE_DIRS = new Set([
  ".git",
  ".playwright-mcp",
  "node_modules",
  ".cache",
  "dist",
  ".next",
  "build",
  "coverage",
  "tmp",
  "temp",
  "Library",
  "Caches",
  "Library/Mobile Documents"
]);

function toGb(value) {
  return `${(value / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatBytes(bytes) {
  if (bytes === 0) {
    return "0 B";
  }
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

function safeCategory(ext) {
  if (CATEGORY_EXT.image.has(ext)) return "image";
  if (CATEGORY_EXT.video.has(ext)) return "video";
  if (CATEGORY_EXT.code.has(ext)) return "code";
  if (CATEGORY_EXT.config.has(ext)) return "config";

  return null;
}

if (!fs.existsSync(workspaceRoot)) {
  console.error(`iCloud root bulunamadı: ${workspaceRoot}`);
  process.exit(1);
}

const queue = [{ dir: workspaceRoot, depth: 0 }];
const visited = new Set();
const summary = {
  workspaceRoot,
  generatedAt: new Date().toISOString(),
  scannedAtDepth: MAX_DEPTH,
  totals: {
    files: 0,
    matched: 0,
    byCategory: { image: 0, video: 0, code: 0, config: 0, other: 0 },
    byCategoryBytes: { image: 0, video: 0, code: 0, config: 0, other: 0 }
  },
  byExtension: {},
  byTopDir: {},
  samples: {
    image: [],
    video: [],
    code: [],
    config: [],
    other: []
  },
  largestFiles: []
};

while (queue.length) {
  const current = queue.shift();
  const { dir, depth } = current;

  if (depth > MAX_DEPTH || visited.has(dir)) {
    continue;
  }

  visited.add(dir);

  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (_error) {
    continue;
  }

  for (const entry of entries) {
    if (entry.name.startsWith(".")) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(workspaceRoot, fullPath);

    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) {
        continue;
      }
      queue.push({ dir: fullPath, depth: depth + 1 });
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    let stat;
    try {
      stat = fs.statSync(fullPath);
    } catch (_error) {
      continue;
    }

    summary.totals.files += 1;

    const ext = path.extname(entry.name).toLowerCase();
    const category = safeCategory(ext) || "other";
    const size = stat.size;
    const topDir = relPath.split(path.sep)[0] || "<root>";

    summary.byTopDir[topDir] = (summary.byTopDir[topDir] || 0) + 1;
    summary.totals.byCategory[category] += 1;
    summary.totals.byCategoryBytes[category] += size;
    summary.byExtension[ext || "<no_ext>"] = (summary.byExtension[ext || "<no_ext>"] || 0) + 1;

    const fileRecord = {
      path: relPath,
      extension: ext || "<no_ext>",
      size,
      sizeLabel: formatBytes(size),
      category
    };

    if (summary.samples[category].length < MAX_SAMPLE_PER_CATEGORY) {
      summary.samples[category].push(fileRecord);
    }

    summary.totals.matched += 1;

    summary.largestFiles.push(fileRecord);
    summary.largestFiles.sort((a, b) => b.size - a.size);
    if (summary.largestFiles.length > MAX_SAMPLE_FILES) {
      summary.largestFiles.length = MAX_SAMPLE_FILES;
    }
  }
}

for (const key of Object.keys(summary.samples)) {
  summary.samples[key].sort((a, b) => a.path.localeCompare(b.path));
}

summary.byExtension = Object.entries(summary.byExtension)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 50)
  .reduce((acc, [ext, count]) => {
    acc[ext] = count;
    return acc;
  }, {});

summary.topDirs = Object.entries(summary.byTopDir)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 40)
  .map(([dir, count]) => ({ dir, fileCount: count }));

summary.totals.byCategoryBytesLabel = {
  image: formatBytes(summary.totals.byCategoryBytes.image),
  video: formatBytes(summary.totals.byCategoryBytes.video),
  code: formatBytes(summary.totals.byCategoryBytes.code),
  config: formatBytes(summary.totals.byCategoryBytes.config),
  other: formatBytes(summary.totals.byCategoryBytes.other)
};
summary.totals.totalBytes = summary.totals.byCategoryBytes.image + summary.totals.byCategoryBytes.video + summary.totals.byCategoryBytes.code + summary.totals.byCategoryBytes.config + summary.totals.byCategoryBytes.other;
summary.totals.totalBytesLabel = formatBytes(summary.totals.totalBytes);
summary.largestFiles = summary.largestFiles.map((entry) => ({ ...entry, sizeLabel: formatBytes(entry.size) }));

const mdLines = [
  "# iCloud Kişisel Varlık Envanteri",
  "",
  `- Oluşturulma: ${summary.generatedAt}`,
  `- Kaynak kök: ${summary.workspaceRoot}`,
  `- Tarama derinliği: ${summary.scannedAtDepth}`,
  `- Toplam dosya: ${summary.totals.files}`,
  `- Kategoriye uyan dosya: ${summary.totals.matched}`,
  `- Toplam büyüklük: ${summary.totals.totalBytesLabel}`,
  "",
  "## Kategori özeti",
  "",
  "| Kategori | Dosya | Boyut |",
  "| --- | --- | --- |",
  `| image | ${summary.totals.byCategory.image} | ${summary.totals.byCategoryBytesLabel.image} |`,
  `| video | ${summary.totals.byCategory.video} | ${summary.totals.byCategoryBytesLabel.video} |`,
  `| code | ${summary.totals.byCategory.code} | ${summary.totals.byCategoryBytesLabel.code} |`,
  `| config | ${summary.totals.byCategory.config} | ${summary.totals.byCategoryBytesLabel.config} |`,
  `| other | ${summary.totals.byCategory.other} | ${summary.totals.byCategoryBytesLabel.other} |`,
  "",
  "## En fazla dosya bulunan dizinler",
  "",
  "| Dizin | Dosya sayısı |",
  "| --- | --- |"
];

for (const item of summary.topDirs) {
  mdLines.push(`| ${item.dir} | ${item.fileCount} |`);
}

mdLines.push(
  "",
  "## En büyük 25 dosya",
  "",
  "| Dosya | Boyut | Kategori |",
  "| --- | --- | --- |"
);

for (const item of summary.largestFiles.slice(0, 25)) {
  mdLines.push(`| ${item.path} | ${item.sizeLabel} | ${item.category} |`);
}

fs.mkdirSync(path.dirname(REPORT_JSON_PATH), { recursive: true });
fs.writeFileSync(REPORT_JSON_PATH, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
fs.writeFileSync(REPORT_MD_PATH, `${mdLines.join("\n")}\n`, "utf8");

console.log(`iCloud kişisel varlık raporu yazıldı: ${path.relative(ROOT, REPORT_JSON_PATH)}`);
console.log(`Markdown rapor yazıldı: ${path.relative(ROOT, REPORT_MD_PATH)}`);
console.log(`Toplam eşleşen dosya: ${summary.totals.matched}`);
console.log(`Büyük medya+kod envanteri: ${summary.totals.byCategory.image + summary.totals.byCategory.video + summary.totals.byCategory.code} dosya`);
