#!/usr/bin/env node

const { existsSync, mkdirSync, readFileSync, writeFileSync } = require("node:fs");
const { dirname, relative, resolve } = require("node:path");
const { spawnSync } = require("node:child_process");

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const checkMode = args.has("--check");
const jsonPath = resolve(root, "reports/seis-commit-packages.json");
const markdownPath = resolve(root, "reports/seis-commit-packages.md");
const selfGenerated = new Set([
  "reports/seis-commit-packages.json",
  "reports/seis-commit-packages.md",
]);

const packageRules = [
  {
    id: "ci-publish-governance",
    title: "CI Publish Governance",
    priority: 10,
    commitMessage: "chore(ci): add publish governance reporting gates",
    rationale: "Workflow, publish readiness, and quality publish reporting should ship as one auditable CI change.",
    validation: [
      "npm run check:open-source-governance",
      "node --check scripts/automation-publish-readiness.cjs",
      "node --check scripts/quality-governance-publish.cjs",
      "npm run quality:governance:publish:ci",
    ],
    match: (filePath) => [
      ".github/workflows/ci.yml",
      "scripts/automation-publish-readiness.cjs",
      "scripts/quality-governance-publish.cjs",
      "docs/governance/development-automation.md",
    ].includes(filePath),
  },
  {
    id: "generated-language-stack-reports",
    title: "Generated Language And Stack Reports",
    priority: 20,
    commitMessage: "chore(reports): refresh language and technology stack reports",
    rationale: "Generated reports should stay separate from handwritten governance and runtime changes.",
    validation: [
      "npm run check:language-distribution",
      "npm run check:seis-technology-stack",
      "npm run quality:governance:publish:ci",
    ],
    match: (filePath) => filePath === "content/development/seis-technology-stack.json"
      || filePath.startsWith("reports/language-distribution")
      || filePath.startsWith("reports/seis-technology-stack"),
  },
  {
    id: "god-mode-model-lab",
    title: "God Mode Model Lab",
    priority: 30,
    commitMessage: "feat(ai): add god-mode model lab assets",
    rationale: "Model cards, generated model/data artifacts, redaction, and lab tests form one AI evaluation surface.",
    validation: [
      "npm test --prefix packages/seis-ai",
      "npm run check:seis-universe-model-lab",
      "npm run check:seis-universe-memory-ranker-model",
      "npm run check:seis-universe-eval-critic-model",
    ],
    match: (filePath) => filePath.startsWith("packages/seis-ai/")
      || filePath.startsWith("SEIS_UNIVERSE_")
      || filePath.startsWith("scripts/build-seis-")
      || filePath.startsWith("scripts/check-seis-universe-"),
  },
  {
    id: "god-mode-governance-contracts",
    title: "God Mode Governance Contracts",
    priority: 40,
    commitMessage: "feat(governance): expand god-mode operating contracts",
    rationale: "God Mode governance docs, roadmap, decisions, and contract checks should be reviewed as a governance unit.",
    validation: [
      "npm run quality:governance",
      "npm run check:seis-god-mode-staging-manifest",
      "npm run check:seis-god-mode-completion-audit",
    ],
    match: (filePath) => filePath.startsWith("docs/governance/")
      || filePath.startsWith("governance/")
      || filePath.startsWith("goals/")
      || filePath.startsWith("roadmap/")
      || filePath.startsWith("docs/architecture/")
      || filePath.startsWith("docs/decisions/")
      || filePath.startsWith("content/development/seis-god-mode")
      || filePath.startsWith("scripts/check-seis-god-mode-")
      || filePath.startsWith("scripts/check-seis-goals-")
      || filePath.startsWith("scripts/check-seis-repo-health")
      || filePath.startsWith("scripts/check-seis-governance")
      || filePath.startsWith("scripts/check-seis-project")
      || filePath.startsWith("scripts/inspect-seis-project"),
  },
  {
    id: "demo-runtime-contracts",
    title: "Demo Runtime Contracts",
    priority: 50,
    commitMessage: "feat(demo): align SEIS demo runtime contracts",
    rationale: "Web demo, core demo, service worker, and platform contract mirrors move together.",
    validation: [
      "npm run seis:check",
      "npm run check:workspace",
      "npm run check:seis-command-center",
    ],
    match: (filePath) => filePath.startsWith("apps/seis-demo-web/")
      || filePath.startsWith("apps/seis-core/")
      || filePath.startsWith("packages/seis_platform_swift/"),
  },
  {
    id: "plugin-agent-surface",
    title: "Plugin And Agent Surface",
    priority: 60,
    commitMessage: "feat(plugins): refresh SEIS plugin and agent surfaces",
    rationale: "Plugin metadata, requested skills, and agent checks should stay in one review lane.",
    validation: [
      "npm run check:seis-plugin-bundle",
      "npm run check:seis-ai-agent",
      "npm run check:seis-specialist-plugins -- --include-legacy-personal",
    ],
    match: (filePath) => filePath.startsWith("plugins/")
      || filePath.includes("plugin")
      || filePath.includes("ai-agent"),
  },
  {
    id: "ssh-cloud-security",
    title: "SSH Cloud Security",
    priority: 70,
    commitMessage: "feat(cloud): strengthen SEIS SSH cloud security docs",
    rationale: "SSH, cloud, and security policy files should be reviewed with the matching hardening gates.",
    validation: [
      "npm run check:ssh-hardening-contract",
      "npm run check:seis-ssh-access-model",
      "npm run check:seis-ssh-picker-compatibility",
      "npm run check:cloud-access-policy",
    ],
    match: (filePath) => filePath.includes("ssh")
      || filePath.includes("cloud")
      || filePath === "ai/policy.md",
  },
  {
    id: "repo-metadata-and-community",
    title: "Repository Metadata And Community Health",
    priority: 80,
    commitMessage: "chore(repo): update repository metadata and community health",
    rationale: "GitHub templates, gitignore, and repository metadata are a separate maintenance lane.",
    validation: [
      "npm run check:open-source-governance",
      "npm run check:publish-gate-contract",
    ],
    match: (filePath) => filePath.startsWith(".github/")
      || filePath === ".gitignore"
      || filePath === "package.json",
  },
];

const fallbackRule = {
  id: "manual-review",
  title: "Manual Review",
  priority: 999,
  commitMessage: "chore: review uncategorized SEIS changes",
  rationale: "Files that do not match a stable lane need human review before staging.",
  validation: ["npm run quality:governance:publish:ci"],
};

const report = buildReport(readExistingGeneratedAt());
const jsonText = `${JSON.stringify(report, null, 2)}\n`;
const markdownText = buildMarkdown(report);

if (checkMode) {
  const failures = [];
  if (!existsSync(jsonPath)) failures.push(`missing ${relative(root, jsonPath)}`);
  if (!existsSync(markdownPath)) failures.push(`missing ${relative(root, markdownPath)}`);
  if (existsSync(jsonPath) && readFileSync(jsonPath, "utf8") !== jsonText) failures.push(`stale ${relative(root, jsonPath)}`);
  if (existsSync(markdownPath) && readFileSync(markdownPath, "utf8") !== markdownText) failures.push(`stale ${relative(root, markdownPath)}`);
  if (failures.length > 0) {
    console.error("SEIS commit package report check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    console.error("Run: npm run automation:seis-commit-packages");
    process.exit(1);
  }
  console.log("SEIS commit package report check passed.");
  process.exit(0);
}

mkdirSync(dirname(jsonPath), { recursive: true });
writeFileSync(jsonPath, jsonText);
writeFileSync(markdownPath, markdownText);
console.log(`SEIS commit package report written: ${relative(root, jsonPath)}`);
console.log(`SEIS commit package report written: ${relative(root, markdownPath)}`);
console.log(`Packages: ${report.summary.packageCount}; files: ${report.summary.fileCount}`);

function buildReport(generatedAt) {
  const status = runGit(["status", "--short"]);
  const branch = runGit(["branch", "--show-current"]).stdout.trim();
  const statusBranch = runGit(["status", "--short", "--branch"]).stdout.split("\n").find(Boolean) || "";
  const upstream = runGit(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"], { allowFailure: true }).stdout.trim();
  const files = parseStatus(status.stdout).filter((entry) => !selfGenerated.has(entry.path));
  const groups = new Map();

  for (const entry of files) {
    const rule = packageRules.find((candidate) => candidate.match(entry.path)) || fallbackRule;
    if (!groups.has(rule.id)) {
      groups.set(rule.id, {
        id: rule.id,
        title: rule.title,
        priority: rule.priority,
        commitMessage: rule.commitMessage,
        rationale: rule.rationale,
        validation: rule.validation,
        files: [],
      });
    }
    groups.get(rule.id).files.push(entry);
  }

  const packages = Array.from(groups.values())
    .map((group) => ({
      ...group,
      files: group.files.sort((left, right) => left.path.localeCompare(right.path)),
      fileCount: group.files.length,
      staged: false,
      action: "review-validate-stage-commit-as-unit",
    }))
    .sort((left, right) => left.priority - right.priority || left.id.localeCompare(right.id));

  return {
    id: "seis-commit-package-plan",
    generatedAt,
    mode: "read-only-git-status",
    branch,
    upstream: upstream || null,
    statusLine: statusBranch,
    summary: {
      packageCount: packages.length,
      fileCount: files.length,
      selfGeneratedExcluded: Array.from(selfGenerated),
    },
    packages,
    nextActions: [
      "Review each package boundary before staging files.",
      "Run the package validation commands before each commit.",
      "Commit one package at a time with the suggested commit message or a more precise variant.",
      "Run npm run automation:publish-readiness before any GitHub push attempt.",
    ],
    safety: [
      "This report does not stage, commit, push, or delete files.",
      "Private keys, tokens, and credentials must not be committed.",
      "Generated report files are excluded from their own package calculation.",
    ],
  };
}

function readExistingGeneratedAt() {
  if (!checkMode || !existsSync(jsonPath)) return new Date().toISOString();
  try {
    const existing = JSON.parse(readFileSync(jsonPath, "utf8"));
    if (typeof existing.generatedAt === "string" && existing.generatedAt.trim().length > 0) {
      return existing.generatedAt;
    }
  } catch {
    return new Date().toISOString();
  }
  return new Date().toISOString();
}

function parseStatus(stdout) {
  return stdout
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const status = line.slice(0, 2).trim() || "modified";
      const rawPath = line.slice(3).trim();
      const pathValue = rawPath.includes(" -> ") ? rawPath.split(" -> ").pop() : rawPath;
      return {
        path: pathValue.replace(/\/$/, ""),
        status,
        raw: line,
        kind: inferKind(pathValue),
      };
    });
}

function inferKind(filePath) {
  if (filePath.endsWith("/")) return "directory";
  if (filePath.startsWith("reports/") || filePath.startsWith("content/development/")) return "generated-report";
  if (filePath.startsWith("docs/") || filePath.startsWith("roadmap/") || filePath.startsWith("governance/")) return "documentation";
  if (filePath.startsWith("scripts/")) return "automation";
  if (filePath.startsWith(".github/")) return "github-workflow";
  if (filePath.startsWith("packages/") || filePath.startsWith("apps/")) return "source";
  return "repository-file";
}

function buildMarkdown(data) {
  const lines = [
    "# SEIS Commit Package Plan",
    "",
    `Generated: ${data.generatedAt}`,
    `Mode: ${data.mode}`,
    `Branch: ${data.branch || "unknown"}`,
    `Upstream: ${data.upstream || "none"}`,
    `Status: ${data.statusLine || "unknown"}`,
    "",
    "## Summary",
    "",
    `- Packages: ${data.summary.packageCount}`,
    `- Files: ${data.summary.fileCount}`,
    "- State: planned-not-staged",
    "",
    "## Packages",
    "",
  ];

  for (const group of data.packages) {
    lines.push(`### ${group.title}`);
    lines.push("");
    lines.push(`- ID: ${group.id}`);
    lines.push(`- Files: ${group.fileCount}`);
    lines.push(`- Suggested commit: \`${group.commitMessage}\``);
    lines.push(`- Rationale: ${group.rationale}`);
    lines.push(`- Action: ${group.action}`);
    lines.push("- Validation:");
    for (const command of group.validation) lines.push(`  - \`${command}\``);
    lines.push("");
    lines.push("| Status | Kind | Path |");
    lines.push("| --- | --- | --- |");
    for (const file of group.files) {
      lines.push(`| ${escapeCell(file.status)} | ${escapeCell(file.kind)} | \`${escapeCell(file.path)}\` |`);
    }
    lines.push("");
  }

  lines.push("## Next Actions");
  lines.push("");
  for (const action of data.nextActions) lines.push(`- ${action}`);
  lines.push("");
  lines.push("## Safety");
  lines.push("");
  for (const item of data.safety) lines.push(`- ${item}`);
  lines.push("");
  return `${lines.join("\n")}\n`;
}

function runGit(gitArgs, options = {}) {
  const result = spawnSync("git", gitArgs, { cwd: root, encoding: "utf8" });
  if (!options.allowFailure && result.status !== 0) {
    throw new Error(`git ${gitArgs.join(" ")} failed: ${result.stderr || result.stdout}`);
  }
  return { stdout: result.stdout || "", stderr: result.stderr || "", status: result.status || 0 };
}

function escapeCell(value) {
  return String(value).replace(/\|/g, "\\|");
}
