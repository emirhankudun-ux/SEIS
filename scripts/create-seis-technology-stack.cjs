#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const checkMode = process.argv.includes("--check");
const generatedAt = "2026-06-12";
const languageDistributionPath = path.join(ROOT, "reports", "language-distribution.json");
const fullstackLanguageMatrixPath = path.join(ROOT, "content", "development", "fullstack-language-matrix.json");
const requestedSoftwareStackPath = path.join(ROOT, "content", "development", "requested-software-stack.json");
const sourcePath = path.join(ROOT, "content", "development", "seis-technology-stack.json");
const reportJsonPath = path.join(ROOT, "reports", "seis-technology-stack.json");
const reportMarkdownPath = path.join(ROOT, "reports", "seis-technology-stack.md");

const sourceLanguageIds = [
  "JavaScript",
  "TypeScript",
  "Objective-C",
  "Python",
  "Swift",
  "Go",
  "Rust",
  "Java",
  "Kotlin",
  "Dart",
  "PHP",
  "Ruby",
  "C",
  "C++",
  "C#",
  "SQL",
  "Shell",
  "PowerShell",
  "Lua",
  "R",
  "Julia",
  "Perl",
  "Haskell",
  "Scala",
  "Elixir",
  "Erlang",
  "Clojure",
  "F#",
  "OCaml",
  "Nim",
  "Zig",
  "Groovy",
  "Crystal",
  "D",
  "V",
  "Fortran",
  "COBOL",
  "Pascal",
  "Racket",
  "Scheme",
  "Prolog",
  "Tcl",
  "AWK",
  "Common Lisp",
  "Emacs Lisp",
  "Smalltalk",
  "Ada",
  "Visual Basic",
  "Batchfile",
  "MATLAB",
  "HTML",
  "CSS",
  "Solidity",
  "Move",
  "Cairo",
  "Hack",
  "Apex",
  "ABAP",
  "Q#",
  "Make"
];

const manualLanguageEntrypoints = {
  HTML: ["apps/web/index.html", "apps/web/seis-cockpit.html"],
  CSS: ["apps/web/style.css", "apps/web/styles.css"],
  Shell: ["polyglot/bash/deploy_guard.sh", "scripts/polyglot-check.sh"],
  AWK: ["polyglot/awk/release_policy.awk"],
  Batchfile: ["polyglot/windows/scripting/seis_windows_platform.bat"],
  Make: ["polyglot/make/Makefile"]
};

const ecosystemGroups = [
  group("core-languages-and-logic", "Core Languages & Logic", "source-language", [
    "Python",
    "JavaScript",
    "TypeScript",
    "Objective-C",
    "Swift",
    "Go",
    "Rust",
    "Java",
    "Kotlin",
    "C",
    "C++",
    "C#",
    "PHP",
    "Ruby",
    "R",
    "Lua",
    "Scala",
    "Haskell",
    "Elixir",
    "Dart",
    "F#",
    "Perl",
    "Shell",
    "PowerShell",
    "SQL"
  ]),
  group("web-mobile-and-runtimes", "Web, Mobile & Runtimes", "framework-runtime", [
    "React",
    "Next.js",
    "Angular",
    "Vue",
    "Svelte",
    "Astro",
    "Node.js",
    "Express.js",
    "Django",
    "Flask",
    "Laravel",
    "Ruby on Rails",
    "WordPress",
    "GraphQL",
    "REST",
    "Tailwind CSS",
    "Bootstrap",
    "Sass",
    "jQuery",
    "Flutter",
    "React Native",
    "Expo",
    "Android",
    "SwiftUI",
    "UIKit",
    "AppKit",
    "Web Components",
    "Progressive Web Apps"
  ]),
  group("ai-data-and-intelligence", "AI, Data & Intelligence", "ai-data", [
    "TensorFlow",
    "PyTorch",
    "OpenCV",
    "scikit-learn",
    "Pandas",
    "NumPy",
    "Jupyter",
    "Matplotlib",
    "D3.js",
    "Chart.js",
    "OpenAI APIs",
    "Agents SDK",
    "MCP",
    "RAG",
    "Embeddings",
    "Model Evaluation"
  ]),
  group("infra-cloud-and-devops", "Infra, Cloud & DevOps", "infra-cloud-devops", [
    "Docker",
    "Kubernetes",
    "Git",
    "GitHub",
    "GitHub Actions",
    "GitLab",
    "Jenkins",
    "AWS",
    "Google Cloud",
    "Azure",
    "Cloudflare",
    "Firebase",
    "Vercel",
    "Netlify",
    "Render",
    "Heroku",
    "Nginx",
    "Terraform",
    "Ansible",
    "Prometheus",
    "Grafana",
    "Sentry",
    "Datadog"
  ]),
  group("databases-and-storage", "Databases & Storage", "database-storage", [
    "PostgreSQL",
    "MySQL",
    "MariaDB",
    "MongoDB",
    "SQLite",
    "Redis",
    "Cassandra",
    "DynamoDB",
    "Supabase",
    "Firebase Realtime Database",
    "Cloudinary",
    "Object Storage"
  ]),
  group("tools-and-design-suite", "Tools & Design Suite", "tool-design", [
    "Antigravity IDE",
    "Xcode",
    "Android Studio",
    "JetBrains Toolbox",
    "Vim",
    "Neovim",
    "Sublime Text",
    "Figma",
    "Adobe Photoshop",
    "Adobe Illustrator",
    "Adobe After Effects",
    "Adobe Premiere Pro",
    "Adobe XD",
    "Blender",
    "Postman",
    "npm",
    "pnpm",
    "Bun",
    "Obsidian",
    "Notion",
    "Discord"
  ]),
  group("meta-and-productivity", "Meta & Productivity", "meta-productivity", [
    "Stack Overflow",
    "GitHub Discussions",
    "GitLab Issues",
    "Bitbucket",
    "LinkedIn",
    "X / Twitter",
    "Markdown",
    "Mermaid",
    "Graphviz",
    "Readwise",
    "Zotero",
    "NotebookLM"
  ])
];

const languageDistribution = readJson(languageDistributionPath);
const fullstackLanguageMatrix = readJson(fullstackLanguageMatrixPath);
const requestedSoftwareStack = readJson(requestedSoftwareStackPath);
const matrixByLanguage = new Map((fullstackLanguageMatrix.languages || []).map((language) => [language.language, language]));
const githubLanguageBytes = new Map((languageDistribution.languages || []).map((entry) => [entry.language, entry.bytes]));
const focusedGithubPanel = languageDistribution.githubLanguagePanelSplit || [];

const sourceLanguageCatalog = sourceLanguageIds.map((label, index) => {
  const matrixEntry = matrixByLanguage.get(label);
  const entrypoints = matrixEntry?.entrypoints || manualLanguageEntrypoints[label] || [];
  return {
    order: index + 1,
    id: slug(label),
    label,
    kind: "source-language",
    githubLanguageSurface: true,
    githubBytes: githubLanguageBytes.get(label) || 0,
    layer: matrixEntry?.layer || inferLanguageLayer(label),
    entrypoints
  };
});

const allTechnologies = ecosystemGroups.flatMap((groupEntry) =>
  groupEntry.technologies.map((technology) => ({
    ...technology,
    groupId: groupEntry.id,
    groupLabel: groupEntry.label,
    kind: groupEntry.kind
  }))
);

validateContractInputs(sourceLanguageCatalog, ecosystemGroups);

const contract = {
  version: 1,
  id: "seis-technology-stack",
  generatedAt,
  mode: "source_languages_plus_ecosystem_stack",
  sourceReferences: {
    languageDistribution: path.relative(ROOT, languageDistributionPath),
    fullstackLanguageMatrix: path.relative(ROOT, fullstackLanguageMatrixPath),
    requestedSoftwareStack: path.relative(ROOT, requestedSoftwareStackPath)
  },
  summary: {
    sourceLanguageCount: sourceLanguageCatalog.length,
    ecosystemGroupCount: ecosystemGroups.length,
    ecosystemTechnologyCount: allTechnologies.length,
    requestedCoreStackCount: requestedSoftwareStack.summary?.technologyCount || 0,
    githubFocusedPanels: focusedGithubPanel.map((entry) => entry.language),
    githubLanguagePolicy: "Only real source languages belong in the GitHub language surface; frameworks, clouds, products, and tools belong in the ecosystem stack."
  },
  sourceLanguageCatalog,
  ecosystemGroups,
  governance: [
    "Keep GitHub Linguist honest: source languages are counted from real files and language overrides only clarify true source identity.",
    "Do not add placeholder code to inflate a language percentage.",
    "Represent frameworks, SDKs, cloud providers, databases, design tools, and productivity surfaces in the ecosystem stack instead of the language bar.",
    "Default editor guidance remains Antigravity IDE, Xcode for Apple work, Android Studio for Android work, and terminal/Codex for repo automation."
  ]
};

const report = {
  version: 1,
  id: "seis-technology-stack-report",
  generatedAt,
  sourceId: contract.id,
  sourcePath: path.relative(ROOT, sourcePath),
  summary: contract.summary,
  sourceLanguages: contract.sourceLanguageCatalog.map(({ order, label, layer, githubBytes, entrypoints }) => ({
    order,
    label,
    layer,
    githubBytes,
    entrypoints
  })),
  ecosystemGroups: contract.ecosystemGroups
};

const markdown = createMarkdown(contract);

if (checkMode) {
  const expectedSource = `${JSON.stringify(contract, null, 2)}\n`;
  const expectedReport = `${JSON.stringify(report, null, 2)}\n`;
  const expectedMarkdown = `${markdown}\n`;
  const drift = [];

  if (readText(sourcePath) !== expectedSource) drift.push(path.relative(ROOT, sourcePath));
  if (readText(reportJsonPath) !== expectedReport) drift.push(path.relative(ROOT, reportJsonPath));
  if (readText(reportMarkdownPath) !== expectedMarkdown) drift.push(path.relative(ROOT, reportMarkdownPath));

  if (drift.length > 0) {
    console.error("SEIS technology stack is stale:");
    for (const file of drift) console.error(`- ${file}`);
    console.error("Run node scripts/create-seis-technology-stack.cjs to refresh generated files.");
    process.exit(1);
  }

  console.log("SEIS technology stack check passed.");
} else {
  fs.writeFileSync(sourcePath, `${JSON.stringify(contract, null, 2)}\n`);
  fs.writeFileSync(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(reportMarkdownPath, `${markdown}\n`);
  console.log(`SEIS technology stack written: ${path.relative(ROOT, sourcePath)}`);
  console.log(`SEIS technology stack written: ${path.relative(ROOT, reportJsonPath)}`);
  console.log(`SEIS technology stack written: ${path.relative(ROOT, reportMarkdownPath)}`);
}

function group(id, label, kind, labels) {
  return {
    id,
    label,
    kind,
    technologies: labels.map((technologyLabel, index) => ({
      id: slug(technologyLabel),
      label: technologyLabel,
      order: index + 1
    }))
  };
}

function validateContractInputs(languages, groups) {
  const failures = [];
  const requiredSourceLanguages = ["JavaScript", "TypeScript", "Objective-C", "Python", "Swift", "Go", "Rust"];
  const requiredTechnologies = ["React", "Node.js", "Docker", "Kubernetes", "AWS", "Firebase", "PostgreSQL", "Figma", "Antigravity IDE"];
  const technologyIds = new Set();

  if (languages.length < 40) failures.push("source language catalog must include at least 40 real languages");
  for (const required of requiredSourceLanguages) {
    if (!languages.some((language) => language.label === required)) {
      failures.push(`missing required source language: ${required}`);
    }
  }

  for (const groupEntry of groups) {
    if (!groupEntry.technologies.length) failures.push(`empty ecosystem group: ${groupEntry.id}`);
    for (const technology of groupEntry.technologies) {
      const scopedId = `${groupEntry.id}:${technology.id}`;
      if (technologyIds.has(scopedId)) failures.push(`duplicate technology in group: ${scopedId}`);
      technologyIds.add(scopedId);
    }
  }

  const allLabels = groups.flatMap((groupEntry) => groupEntry.technologies.map((technology) => technology.label));
  for (const required of requiredTechnologies) {
    if (!allLabels.includes(required)) failures.push(`missing required ecosystem technology: ${required}`);
  }

  if (failures.length > 0) {
    console.error("SEIS technology stack contract failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
}

function createMarkdown(contractData) {
  const lines = [
    "# SEIS Technology Stack",
    "",
    `- Generated: ${contractData.generatedAt}`,
    `- Mode: ${contractData.mode}`,
    `- Source languages: ${contractData.summary.sourceLanguageCount}`,
    `- Ecosystem groups: ${contractData.summary.ecosystemGroupCount}`,
    `- Ecosystem technologies: ${contractData.summary.ecosystemTechnologyCount}`,
    "",
    "## Principle",
    "",
    contractData.summary.githubLanguagePolicy,
    "",
    "## GitHub Source Languages",
    "",
    "| # | language | layer | GitHub bytes | entrypoints |",
    "| ---: | --- | --- | ---: | --- |",
    ...contractData.sourceLanguageCatalog.map((language) => [
      language.order,
      language.label,
      language.layer,
      language.githubBytes,
      language.entrypoints.join(", ")
    ].map(escapeCell).join(" | ")).map((row) => `| ${row} |`),
    "",
    "## Ecosystem Stack",
    "",
    "| group | technologies |",
    "| --- | --- |",
    ...contractData.ecosystemGroups.map((groupEntry) => {
      const labels = groupEntry.technologies.map((technology) => technology.label).join(", ");
      return `| ${escapeCell(groupEntry.label)} | ${escapeCell(labels)} |`;
    }),
    "",
    "## Governance",
    "",
    ...contractData.governance.map((item) => `- ${item}`)
  ];

  return lines.join("\n");
}

function inferLanguageLayer(label) {
  if (["HTML", "CSS", "JavaScript", "TypeScript"].includes(label)) return "frontend-and-experience";
  if (["Swift", "Objective-C", "Kotlin", "Dart", "C", "C++", "Rust", "Zig", "Nim"].includes(label)) return "mobile-and-native";
  if (["SQL", "R", "Julia", "MATLAB"].includes(label)) return "database-and-data";
  if (["Shell", "PowerShell", "Batchfile", "Make"].includes(label)) return "cloud-devops-and-config";
  return "backend-and-api";
}

function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/\+/g, "plus")
    .replace(/#/g, "sharp")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
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
