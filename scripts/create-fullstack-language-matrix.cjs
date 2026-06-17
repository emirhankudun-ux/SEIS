#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const checkMode = process.argv.includes("--check");
const manifestPath = path.join(ROOT, "polyglot", "manifest.json");
const requestedStackPath = path.join(ROOT, "content", "development", "requested-software-stack.json");
const pluginLanesPath = path.join(ROOT, "content", "development", "plugin-capability-lanes.json");
const sourcePath = path.join(ROOT, "content", "development", "fullstack-language-matrix.json");
const reportJsonPath = path.join(ROOT, "reports", "fullstack-language-matrix.json");
const reportMarkdownPath = path.join(ROOT, "reports", "fullstack-language-matrix.md");

const ACTIVATION_POLICY = "activate_only_when_relevant_authenticated_scoped_and_user_approved";

const layerRules = [
  {
    id: "frontend-and-experience",
    label: "Frontend and Experience",
    keywords: ["javascript", "typescript", "react", "elm", "purescript", "rescript", "reasonml", "html", "css", "gdscript", "glsl", "wgsl"]
  },
  {
    id: "backend-and-api",
    label: "Backend and API",
    keywords: ["node.js", "express.js", "python", "ruby", "php", "go", "java", "c#", "scala", "groovy", "elixir", "erlang", "clojure", "f#", "graphql", "openapi", "asyncapi", "protocol buffers", "avro"]
  },
  {
    id: "database-and-data",
    label: "Database and Data",
    keywords: ["mysql", "sql", "pl/sql", "t-sql", "r", "julia", "matlab", "csv", "json-ld", "turtle", "sparql", "json schema"]
  },
  {
    id: "mobile-and-native",
    label: "Mobile and Native",
    keywords: ["swift", "kotlin", "dart", "objective-c", "c", "c++", "rust", "zig", "nim", "crystal", "d", "v", "ada", "pascal"]
  },
  {
    id: "cloud-devops-and-config",
    label: "Cloud, DevOps, and Config",
    keywords: ["bash", "powershell", "yaml", "toml", "xml", "hcl", "bicep", "nix", "cue", "ini", "dotenv", "make", "cmake", "meson", "just", "taskfile", "docker", "cloudflare worker", "nginx", "apache config", "jsonnet", "dhall", "starlark", "kdl", "hocon", "java properties"]
  },
  {
    id: "security-policy-and-governance",
    label: "Security, Policy, and Governance",
    keywords: ["rego", "cel", "solidity", "move", "cairo", "hack", "apex", "abap", "q#", "perl", "lua", "wat", "mermaid", "plantuml"]
  },
  {
    id: "research-legacy-and-lab",
    label: "Research, Legacy, and Lab",
    keywords: ["haskell", "ocaml", "fortran", "cobol", "racket", "scheme", "prolog", "forth", "common lisp", "emacs lisp", "smalltalk", "tcl", "awk", "visual basic"]
  }
];

const languageLayerMap = new Map([
  ...mapLanguages("frontend-and-experience", [
    "JavaScript",
    "TypeScript",
    "React",
    "Elm",
    "PureScript",
    "ReScript",
    "ReasonML",
    "GDScript",
    "GLSL",
    "WGSL"
  ]),
  ...mapLanguages("backend-and-api", [
    "Node.js",
    "Express.js",
    "Python",
    "Ruby",
    "PHP",
    "Go",
    "Java",
    "C#",
    "Elixir",
    "Erlang",
    "Scala",
    "Groovy",
    "Clojure",
    "F#",
    "GraphQL",
    "OpenAPI",
    "Protocol Buffers",
    "Avro",
    "AsyncAPI"
  ]),
  ...mapLanguages("database-and-data", [
    "MySQL",
    "SQL",
    "PL/SQL",
    "T-SQL",
    "R",
    "Julia",
    "MATLAB",
    "CSV",
    "JSON Schema",
    "JSON-LD",
    "Turtle",
    "SPARQL"
  ]),
  ...mapLanguages("mobile-and-native", [
    "Rust",
    "Swift",
    "Kotlin",
    "Dart",
    "C",
    "C++",
    "Objective-C",
    "Zig",
    "Nim",
    "Crystal",
    "D",
    "V",
    "Ada",
    "Pascal"
  ]),
  ...mapLanguages("cloud-devops-and-config", [
    "Bash",
    "YAML",
    "Cloudflare Worker",
    "Docker",
    "Nginx/Apache config",
    "PowerShell",
    "TOML",
    "XML",
    "HCL",
    "INI",
    "Bicep",
    "Nix",
    "CUE",
    "Jsonnet",
    "Dhall",
    "Starlark",
    "KDL",
    "HOCON",
    "Java Properties",
    "dotenv",
    "Make",
    "CMake",
    "Meson",
    "Just",
    "Taskfile"
  ]),
  ...mapLanguages("security-policy-and-governance", [
    "Lua",
    "Perl",
    "WebAssembly Text",
    "Solidity",
    "Move",
    "Cairo",
    "Hack",
    "Q#",
    "Apex",
    "ABAP",
    "Mermaid",
    "PlantUML",
    "Rego",
    "CEL"
  ]),
  ...mapLanguages("research-legacy-and-lab", [
    "Haskell",
    "OCaml",
    "Visual Basic",
    "Fortran",
    "COBOL",
    "Racket",
    "Scheme",
    "Prolog",
    "Tcl",
    "AWK",
    "Forth",
    "Common Lisp",
    "Emacs Lisp",
    "Smalltalk"
  ])
]);

const manifest = readJson(manifestPath);
const requestedStack = readJson(requestedStackPath);
const pluginLanes = readJson(pluginLanesPath);
const manifestLanguages = Array.isArray(manifest.languages) ? manifest.languages : [];
const requestedStackIds = new Set((requestedStack.requiredStack || []).map((id) => String(id).toLowerCase()));
const requestedStackLabels = new Set((requestedStack.technologies || []).map((technology) => String(technology.label).toLowerCase()));

const languages = manifestLanguages.map((language, index) => {
  const layer = classifyLanguage(language);
  const entrypoints = Array.isArray(language.entrypoints) ? language.entrypoints : [];
  return {
    order: index + 1,
    language: language.language,
    layer: layer.id,
    layerLabel: layer.label,
    role: language.role,
    entrypoints,
    entrypointCount: entrypoints.length,
    requestedCoreStack: isRequestedCoreStackLanguage(language.language),
    activationPolicy: ACTIVATION_POLICY
  };
});

const layerCounts = countBy(languages, (language) => language.layer);
const layerSummaries = layerRules.map((layer) => ({
  id: layer.id,
  label: layer.label,
  languageCount: layerCounts[layer.id] || 0,
  languages: languages.filter((language) => language.layer === layer.id).map((language) => language.language)
}));
const missingEntrypoints = languages.flatMap((language) =>
  language.entrypoints
    .filter((entrypoint) => !fs.existsSync(path.join(ROOT, entrypoint)))
    .map((entrypoint) => ({ language: language.language, entrypoint }))
);

const contract = {
  version: 1,
  id: "seis-fullstack-language-matrix",
  generatedAt: requestedStack.generatedAt || "2026-06-03",
  mode: "all_polyglot_surfaces_visible_in_environment_sources",
  sourceReferences: {
    polyglotManifest: path.relative(ROOT, manifestPath),
    requestedSoftwareStack: path.relative(ROOT, requestedStackPath),
    pluginCapabilityLanes: path.relative(ROOT, pluginLanesPath)
  },
  activationPolicy: ACTIVATION_POLICY,
  summary: {
    languageCount: languages.length,
    layerCount: layerRules.length,
    entrypointCount: languages.reduce((total, language) => total + language.entrypointCount, 0),
    requestedCoreStackCount: languages.filter((language) => language.requestedCoreStack).length,
    pluginCapabilityLaneCount: pluginLanes.summary?.laneCount || 0,
    missingEntrypoints
  },
  layers: layerSummaries,
  languages,
  governance: [
    "Every polyglot manifest language surface is represented in this matrix.",
    "Full-stack layers are routing metadata, not runtime activation.",
    "New language files stay small, reversible, and contract-oriented until a concrete product feature needs runtime dependencies.",
    "Plugin capability lanes provide source guidance while live connectors remain gated by authentication, scope, and approval."
  ]
};

const report = {
  version: 1,
  id: "seis-fullstack-language-matrix-report",
  generatedAt: contract.generatedAt,
  sourceId: contract.id,
  sourcePath: path.relative(ROOT, sourcePath),
  summary: contract.summary,
  layers: contract.layers,
  languages: contract.languages
};

const markdown = createMarkdown(contract);

if (missingEntrypoints.length > 0) {
  console.error("Full-stack language matrix has missing entrypoints:");
  for (const missing of missingEntrypoints) {
    console.error(`- ${missing.language}: ${missing.entrypoint}`);
  }
  process.exit(1);
}

if (checkMode) {
  const expectedSource = `${JSON.stringify(contract, null, 2)}\n`;
  const expectedReport = `${JSON.stringify(report, null, 2)}\n`;
  const expectedMarkdown = `${markdown}\n`;
  const drift = [];

  if (readText(sourcePath) !== expectedSource) drift.push(path.relative(ROOT, sourcePath));
  if (readText(reportJsonPath) !== expectedReport) drift.push(path.relative(ROOT, reportJsonPath));
  if (readText(reportMarkdownPath) !== expectedMarkdown) drift.push(path.relative(ROOT, reportMarkdownPath));

  if (drift.length > 0) {
    console.error("Full-stack language matrix is stale:");
    for (const file of drift) console.error(`- ${file}`);
    console.error("Run node scripts/create-fullstack-language-matrix.cjs to refresh generated files.");
    process.exit(1);
  }

  console.log("Full-stack language matrix check passed.");
} else {
  fs.writeFileSync(sourcePath, `${JSON.stringify(contract, null, 2)}\n`);
  fs.writeFileSync(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(reportMarkdownPath, `${markdown}\n`);
  console.log(`Full-stack language matrix written: ${path.relative(ROOT, sourcePath)}`);
  console.log(`Full-stack language matrix written: ${path.relative(ROOT, reportJsonPath)}`);
  console.log(`Full-stack language matrix written: ${path.relative(ROOT, reportMarkdownPath)}`);
}

function classifyLanguage(language) {
  const name = String(language.language || "");
  const mappedLayer = languageLayerMap.get(name.toLowerCase());

  if (mappedLayer) {
    return layerRules.find((layer) => layer.id === mappedLayer);
  }

  return layerRules[layerRules.length - 1];
}

function isRequestedCoreStackLanguage(language) {
  const name = String(language || "").toLowerCase();
  const normalized = name.replace(/[^a-z0-9]/g, "");
  return requestedStackLabels.has(name) || requestedStackIds.has(normalized);
}

function createMarkdown(contractData) {
  const lines = [
    "# SEIS Full-Stack Language Matrix",
    "",
    `- Generated: ${contractData.generatedAt}`,
    `- Mode: ${contractData.mode}`,
    `- Languages/config surfaces: ${contractData.summary.languageCount}`,
    `- Full-stack layers: ${contractData.summary.layerCount}`,
    `- Entry points: ${contractData.summary.entrypointCount}`,
    "",
    "## Layer Summary",
    "",
    "| layer | languages |",
    "| --- | ---: |",
    ...contractData.layers.map((layer) => `| ${escapeCell(layer.label)} | ${layer.languageCount} |`),
    "",
    "## Language Assignment",
    "",
    "| # | language | layer | core stack | entrypoints |",
    "| ---: | --- | --- | --- | --- |",
    ...contractData.languages.map((language) => [
      language.order,
      language.language,
      language.layerLabel,
      language.requestedCoreStack ? "yes" : "no",
      language.entrypoints.join(", ")
    ].map(escapeCell).join(" | ")).map((row) => `| ${row} |`),
    "",
    "## Governance",
    "",
    ...contractData.governance.map((item) => `- ${item}`)
  ];

  return lines.join("\n");
}

function countBy(items, keySelector) {
  return items.reduce((counts, item) => {
    const key = keySelector(item);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function mapLanguages(layer, languages) {
  return languages.map((language) => [language.toLowerCase(), layer]);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function readText(file) {
  if (!fs.existsSync(file)) return "";
  return fs.readFileSync(file, "utf8");
}

function escapeCell(value) {
  return String(value ?? "").replaceAll("\\", "\\\\").replaceAll("|", "\\|").split(/\r?\n/).join("<br>");
}
