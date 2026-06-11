#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const ROOT = process.cwd();
const WORKSPACE_ROOT = path.resolve(ROOT, "..");
const THIRD_PARTY_ROOT = process.env.SEIS_THIRD_PARTY_SOURCE_ROOT || path.join(WORKSPACE_ROOT, "3.taraf kodlar");

const THIRD_PARTY_PLAN_PATH = path.join(ROOT, "content", "development", "third-party-adaptation-plan.json");
const THIRD_PARTY_PLAN_REPORT_PATH = path.join(ROOT, "reports", "third-party-adaptation-plan.md");
const TOOLCHAIN_PATH = path.join(ROOT, "content", "development", "toolchain-runtime-readiness.json");
const TOOLCHAIN_REPORT_PATH = path.join(ROOT, "reports", "toolchain-runtime-readiness.md");
const DESKTOP_PATH = path.join(ROOT, "content", "development", "desktop-app-integration.json");
const DESKTOP_REPORT_PATH = path.join(ROOT, "reports", "desktop-app-integration.md");
const LICENSE_NAMES = ["LICENSE", "LICENSE.md", "LICENSE.txt", "COPYING", "NOTICE", "NOTICE.txt"];
const METADATA_NAMES = ["README.md", "README", "package.json", "pyproject.toml", "go.mod", "Cargo.toml"];

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  printHelp();
  process.exit(0);
}

const checkMode = args.check === true;

const thirdPartyPlan = createThirdPartyAdaptationPlan();
const toolchainReadiness = createToolchainRuntimeReadiness();
const desktopIntegration = createDesktopAppIntegration();

const outputs = [
  [THIRD_PARTY_PLAN_PATH, `${JSON.stringify(thirdPartyPlan, null, 2)}\n`],
  [THIRD_PARTY_PLAN_REPORT_PATH, renderThirdPartyMarkdown(thirdPartyPlan)],
  [TOOLCHAIN_PATH, `${JSON.stringify(toolchainReadiness, null, 2)}\n`],
  [TOOLCHAIN_REPORT_PATH, renderToolchainMarkdown(toolchainReadiness)],
  [DESKTOP_PATH, `${JSON.stringify(desktopIntegration, null, 2)}\n`],
  [DESKTOP_REPORT_PATH, renderDesktopMarkdown(desktopIntegration)]
];

if (checkMode) {
  const stale = outputs.filter(([file, expected]) => !fs.existsSync(file) || fs.readFileSync(file, "utf8") !== expected);
  if (stale.length > 0) {
    console.error("SEIS ecosystem intake outputs are stale.");
    for (const [file] of stale) {
      console.error(`- ${path.relative(ROOT, file)}`);
    }
    console.error("Run npm run automation:ecosystem-intake to refresh.");
    process.exit(1);
  }

  console.log("SEIS ecosystem intake check passed.");
  process.exit(0);
}

for (const [file, text] of outputs) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}

console.log("SEIS ecosystem intake written:");
for (const [file] of outputs) {
  console.log(`- ${path.relative(ROOT, file)}`);
}

function createThirdPartyAdaptationPlan() {
  const existing = readJsonIfExists(THIRD_PARTY_PLAN_PATH);
  const generatedAt = existing?.generatedAt || new Date().toISOString();
  const candidates = [
    thirdPartyCandidate({
      id: "claude-code",
      label: "Claude Code source tree",
      relativePath: "claude-code",
      kind: "agent-source-tree",
      targetRole: "local-helper-adapter",
      ownedAdaptation: [
        "Keep SEIS Agent as the orchestrator.",
        "Use only CLI invocation boundaries and policy ideas.",
        "Rebuild SEIS-owned wrapper behavior in scripts/ai-launcher.cjs and policy JSON."
      ]
    }),
    thirdPartyCandidate({
      id: "gemini-cli",
      label: "Gemini CLI source tree",
      relativePath: "gemini-cli",
      kind: "agent-source-tree",
      targetRole: "research-helper-adapter",
      ownedAdaptation: [
        "Keep Google/Gemini as a local helper only.",
        "Use command availability and credential gates.",
        "Rebuild source lookup routing inside SEIS policy files."
      ]
    }),
    thirdPartyCandidate({
      id: "deepseek-coder",
      label: "DeepSeek Coder source tree",
      relativePath: "DeepSeek-Coder",
      kind: "model-source-tree",
      targetRole: "future-local-model-reference",
      ownedAdaptation: [
        "Do not import model code into SEIS.",
        "Record capability ideas for future Ollama/local model lanes.",
        "Keep any model download or fine tuning out of the default pipeline."
      ]
    }),
    thirdPartyCandidate({
      id: "awesome-deepseek-agent",
      label: "Awesome DeepSeek Agent reference tree",
      relativePath: "awesome-deepseek-agent",
      kind: "agent-reference-tree",
      targetRole: "agent-pattern-reference",
      ownedAdaptation: [
        "Use as a capability checklist only.",
        "Implement SEIS-owned MCP/skill conventions.",
        "No direct source import."
      ]
    }),
    thirdPartyCandidate({
      id: "antigravity-desktop",
      label: "Antigravity desktop bundle",
      relativePath: "antigravity",
      kind: "desktop-application-bundle",
      targetRole: "preferred-ide-integration",
      ownedAdaptation: [
        "Detect app presence and expose launch/readiness metadata.",
        "Do not copy bundled application files.",
        "Keep integration at command, path, and workflow documentation level."
      ]
    }),
    thirdPartyCandidate({
      id: "desktop-bundle-root",
      label: "Desktop application bundle resources",
      relativePath: ".",
      kind: "proprietary-or-binary-bundle",
      targetRole: "reference-only",
      ownedAdaptation: [
        "Treat app resources, fonts, presets, and binary assets as reference-only.",
        "Do not import proprietary files into SEIS.",
        "Build SEIS-native design and automation behavior from our own code."
      ]
    })
  ];

  return {
    id: "seis-third-party-adaptation-plan",
    version: "0.1.0",
    generatedAt,
    sourceRoot: relative(THIRD_PARTY_ROOT),
    policy: {
      sourceUse: "reference_only_or_interface_contracts",
      codeImport: "blocked_without_license_review_and_explicit_user_confirmation",
      deletePolicy: "blocked_until_owned_reimplementation_validated_and_user_confirms",
      githubPublishPolicy: "publish_seis_owned_code_manifests_and_reports_only",
      secretPolicy: "never_commit_tokens_credentials_or_private_app_state"
    },
    summary: {
      candidateCount: candidates.length,
      detectedCount: candidates.filter((candidate) => candidate.detected).length,
      blockedDeleteCount: candidates.filter((candidate) => candidate.deletionReadiness === "blocked").length,
      highRiskCount: candidates.filter((candidate) => candidate.riskLevel === "high").length
    },
    candidates,
    ownedImplementationTargets: [
      "scripts/ai-launcher.cjs",
      "scripts/ai-routing-policy.cjs",
      "mcp/seis-mcp-server.mjs",
      "packages/ai-language/src/llm-task-planner.mjs",
      "content/development/llm-task-routing-policy.json",
      "content/development/llm-adapter-readiness.json",
      "deploy/cloud-environment.json"
    ],
    requiredBeforeDeleteOrPush: [
      "Run npm run automation:ecosystem-intake.",
      "Run npm run automation:refresh-seis-surface.",
      "Review generated reports for proprietary or unknown-license sources.",
      "Commit only SEIS-owned outputs.",
      "Keep third-party source folders out of the pushed repo unless license review says otherwise."
    ]
  };
}

function thirdPartyCandidate(config) {
  const candidateRoot = config.relativePath === "."
    ? THIRD_PARTY_ROOT
    : path.join(THIRD_PARTY_ROOT, config.relativePath);
  const detected = fs.existsSync(candidateRoot);
  const licenseFiles = detected ? findNamedFiles(candidateRoot, LICENSE_NAMES, 4, 20) : [];
  const metadataFiles = detected ? findNamedFiles(candidateRoot, METADATA_NAMES, 4, 20) : [];
  const fileProfile = detected ? scanFileProfile(candidateRoot) : emptyFileProfile();
  const gitRemote = detected ? readGitRemote(candidateRoot) : null;
  const proprietary = config.kind.includes("bundle") || config.kind.includes("proprietary");
  const riskLevel = proprietary || licenseFiles.length === 0 ? "high" : "medium";

  return {
    id: config.id,
    label: config.label,
    kind: config.kind,
    targetRole: config.targetRole,
    sourcePath: relative(candidateRoot),
    detected,
    riskLevel,
    allowedUse: proprietary ? "reference_only_no_import" : "ideas_interfaces_and_cli_boundaries_only",
    copyPolicy: "do_not_copy_third_party_source_into_seis",
    deletionReadiness: "blocked",
    githubPublishReadiness: "seis_owned_outputs_only",
    gitRemote,
    licenseFiles: licenseFiles.map(relative),
    metadataFiles: metadataFiles.map(relative),
    fileProfile,
    ownedAdaptation: config.ownedAdaptation
  };
}

function createToolchainRuntimeReadiness() {
  const existing = readJsonIfExists(TOOLCHAIN_PATH);
  const generatedAt = existing?.generatedAt || new Date().toISOString();
  const tools = [
    tool("node", "Node.js", "language-runtime", "node --version", "Use for SEIS scripts, web tooling, and MCP helpers.", "Already central to this repo."),
    tool("npm", "npm", "package-manager", "npm --version", "Use for workspace automation.", "Already central to this repo."),
    tool("python3", "Python", "language-runtime", "python3 --version", "Use for data transforms and local experiments.", "Prefer uv for project environments."),
    tool("uv", "uv", "package-manager", "uv --version", "Use for Python env/package orchestration.", "Recommended Python installer lane."),
    tool("go", "Go", "language-runtime", "go version", "Use for small services and CLI tools.", "Good candidate for future SEIS service adapters."),
    tool("rustc", "Rust", "language-runtime", "rustc --version", "Use for secure performance-sensitive tooling.", "Pair with cargo."),
    tool("cargo", "Cargo", "package-manager", "cargo --version", "Use for Rust packages.", "Required for Rust builds."),
    tool("java", "Java", "language-runtime", "java -version", "Use for Android/JVM tooling.", "Temurin JDK 21 preferred."),
    tool("swift", "Swift", "language-runtime", "swift --version", "Use for Apple-platform work.", "Use Xcode for full builds."),
    tool("xcodebuild", "Xcode build", "platform-build-tool", "xcodebuild -version", "Use for iOS/macOS validation.", "Signing changes require explicit permission."),
    tool("kotlin", "Kotlin", "language-runtime", "kotlin -version", "Use for Android/Kotlin work.", "Install only if Android work requires it."),
    tool("dart", "Dart", "language-runtime", "dart --version", "Use for Flutter/Dart surfaces.", "Flutter path can provide this."),
    tool("ruby", "Ruby", "language-runtime", "ruby --version", "Use for legacy/macOS helper scripts.", "System Ruby is enough unless project requires gems."),
    tool("php", "PHP", "language-runtime", "php --version", "Use only when project explicitly needs PHP.", "Optional."),
    tool("lua", "Lua", "language-runtime", "lua -v", "Use only for plugin/runtime niches.", "Optional."),
    tool("dotnet", ".NET", "language-runtime", "dotnet --version", "Use for C# services when needed.", "Optional."),
    tool("docker", "Docker", "container-runtime", "docker --version", "Use for container validation.", "Do not start heavy services by default."),
    tool("gh", "GitHub CLI", "source-control", "gh --version", "Use for GitHub auth, PR, CI, and repo checks.", "Push only after clean review."),
    tool("gcloud", "Google Cloud CLI", "cloud-cli", "gcloud --version", "Use for Google Cloud checks.", "Do not deploy without explicit deploy request."),
    tool("firebase", "Firebase CLI", "cloud-cli", "firebase --version", "Use for Firebase readiness.", "Do not deploy without explicit deploy request."),
    tool("adb", "Android Debug Bridge", "android-tool", "adb version", "Use for Android device/emulator workflows.", "Large emulator downloads need confirmation."),
    tool("sdkmanager", "Android SDK Manager", "android-tool", "sdkmanager --version", "Use for Android SDK inventory.", "Large SDK installs need confirmation."),
    tool("claude", "Claude CLI", "ai-agent-cli", "claude --version", "Use as local long-context/narrative helper.", "Credential gate required."),
    tool("gemini", "Gemini CLI", "ai-agent-cli", "gemini --version", "Use as local research/Google helper.", "Credential gate required."),
    tool("qwen", "Qwen CLI", "ai-agent-cli", "qwen --version", "Use as alternate local reasoning helper.", "Optional."),
    tool("opencode", "OpenCode", "ai-agent-cli", "opencode --version", "Use for terminal coding assistance.", "Optional."),
    tool("aider", "Aider", "ai-agent-cli", "aider --version", "Use for diff-oriented local edits.", "Optional."),
    tool("ollama", "Ollama", "local-model-runtime", "ollama --version", "Use as offline/private fallback.", "Install/start only with user confirmation."),
    tool("openai", "OpenAI CLI", "ai-agent-cli", "openai --version", "Use as local OpenAI helper.", "Credential gate required."),
    tool("codex", "Codex CLI", "ai-agent-cli", "codex --version", "Use for repo execution and agent workflows.", "Primary execution lane."),
    tool("interpreter", "Open Interpreter", "ai-agent-cli", "interpreter --version", "Use for data/log analysis.", "Optional.")
  ];

  return {
    id: "seis-toolchain-runtime-readiness",
    version: "0.1.0",
    generatedAt,
    installPolicy: {
      defaultMode: "detect_and_report",
      installExecution: "manual_confirmation_required",
      largeDownloads: "confirmation_required",
      packageManagers: ["uv", "npm", "official installers", "platform SDK managers"],
      neverInstallSilently: true
    },
    summary: {
      toolCount: tools.length,
      installedCount: tools.filter((entry) => entry.installed).length,
      missingCount: tools.filter((entry) => !entry.installed).length,
      aiAgentCliCount: tools.filter((entry) => entry.category === "ai-agent-cli").length,
      languageRuntimeCount: tools.filter((entry) => entry.category === "language-runtime").length
    },
    tools
  };
}

function tool(id, label, category, versionCommand, use, notes) {
  const command = versionCommand.split(/\s+/)[0];
  const commandPath = commandExists(command);
  const version = commandPath ? runVersion(versionCommand) : null;
  return {
    id,
    label,
    category,
    command,
    commandPath,
    installed: Boolean(commandPath),
    version,
    use,
    notes,
    installAction: commandPath ? "none" : "manual_install_when_needed"
  };
}

function createDesktopAppIntegration() {
  const existing = readJsonIfExists(DESKTOP_PATH);
  const generatedAt = existing?.generatedAt || new Date().toISOString();
  const apps = [
    app("antigravity", "Antigravity IDE", ["Antigravity.app"], "preferred-agentic-ide", ["Open repo/worktree", "Run agent workflows", "Review SEIS plans"]),
    app("xcode", "Xcode", ["Xcode.app"], "apple-platform-ide", ["Build iOS/macOS", "Inspect signing", "Use simulators"]),
    app("android-studio", "Android Studio", ["Android Studio.app"], "android-ide", ["Gradle projects", "Emulator/device workflows", "Kotlin/Java inspection"]),
    app("jetbrains-toolbox", "JetBrains Toolbox", ["JetBrains Toolbox.app"], "ide-manager", ["Manage JetBrains IDEs", "Open JVM/backend projects"]),
    app("codex", "Codex", ["Codex.app"], "primary-agent-execution", ["Repo edits", "Terminal automation", "Validation"]),
    app("ollama", "Ollama", ["Ollama.app"], "local-model-runtime", ["Offline fallback", "Local model experiments"]),
    app("docker", "Docker Desktop", ["Docker.app"], "container-runtime", ["Container validation when explicitly needed"]),
    app("figma", "Figma", ["Figma.app"], "design-workflow", ["Design review", "Prototype and asset handoff"]),
    app("adobe-creative-cloud", "Adobe Creative Cloud", ["Adobe Creative Cloud.app"], "creative-app-manager", ["Reference only unless project-owned assets are exported"])
  ];

  return {
    id: "seis-desktop-app-integration",
    version: "0.1.0",
    generatedAt,
    policy: {
      launchMode: "manual_or_user_requested",
      defaultIde: "antigravity",
      appleWork: "xcode",
      androidWork: "android-studio",
      noPrivateAppStateInRepo: true
    },
    summary: {
      appCount: apps.length,
      detectedCount: apps.filter((entry) => entry.detected).length,
      missingCount: apps.filter((entry) => !entry.detected).length
    },
    apps
  };
}

function app(id, label, bundleNames, role, workflows) {
  const foundPath = findAppBundle(bundleNames);
  return {
    id,
    label,
    role,
    detected: Boolean(foundPath),
    appPath: foundPath ? relative(foundPath) : null,
    bundleNames,
    workflows,
    integrationAction: foundPath ? "use_when_task_matches" : "install_or_configure_when_needed"
  };
}

function renderThirdPartyMarkdown(plan) {
  const lines = [
    "# Third-Party Adaptation Plan",
    "",
    `Generated: ${plan.generatedAt}`,
    "",
    "## Policy",
    "",
    `- Source use: ${plan.policy.sourceUse}`,
    `- Code import: ${plan.policy.codeImport}`,
    `- Delete policy: ${plan.policy.deletePolicy}`,
    `- GitHub publish policy: ${plan.policy.githubPublishPolicy}`,
    "",
    "## Candidates",
    "",
    "| ID | Detected | Risk | Allowed use | Delete | Publish |",
    "| --- | --- | --- | --- | --- | --- |"
  ];

  for (const candidate of plan.candidates) {
    lines.push(`| ${candidate.id} | ${candidate.detected ? "yes" : "no"} | ${candidate.riskLevel} | ${candidate.allowedUse} | ${candidate.deletionReadiness} | ${candidate.githubPublishReadiness} |`);
  }

  lines.push("", "## Required Before Delete Or Push", "");
  for (const item of plan.requiredBeforeDeleteOrPush) {
    lines.push(`- ${item}`);
  }

  return `${lines.join("\n")}\n`;
}

function renderToolchainMarkdown(readiness) {
  const lines = [
    "# Toolchain Runtime Readiness",
    "",
    `Generated: ${readiness.generatedAt}`,
    "",
    `Installed: ${readiness.summary.installedCount}/${readiness.summary.toolCount}`,
    "",
    "| Tool | Category | Installed | Path |",
    "| --- | --- | --- | --- |"
  ];

  for (const item of readiness.tools) {
    lines.push(`| ${item.id} | ${item.category} | ${item.installed ? "yes" : "no"} | ${item.commandPath || ""} |`);
  }

  return `${lines.join("\n")}\n`;
}

function renderDesktopMarkdown(integration) {
  const lines = [
    "# Desktop App Integration",
    "",
    `Generated: ${integration.generatedAt}`,
    "",
    `Detected: ${integration.summary.detectedCount}/${integration.summary.appCount}`,
    "",
    "| App | Role | Detected | Path |",
    "| --- | --- | --- | --- |"
  ];

  for (const item of integration.apps) {
    lines.push(`| ${item.id} | ${item.role} | ${item.detected ? "yes" : "no"} | ${item.appPath || ""} |`);
  }

  return `${lines.join("\n")}\n`;
}

function findNamedFiles(root, names, maxDepth, maxResults) {
  const found = [];
  walk(root, 0, maxDepth, (file, dirent) => {
    if (found.length >= maxResults) return;
    if (dirent.isFile() && names.includes(dirent.name)) {
      found.push(file);
    }
  });
  return found;
}

function scanFileProfile(root) {
  const extensionCounts = {};
  let scannedFiles = 0;
  let scannedDirs = 0;
  walk(root, 0, 4, (file, dirent) => {
    if (dirent.isDirectory()) {
      scannedDirs += 1;
      return;
    }
    scannedFiles += 1;
    const ext = path.extname(dirent.name).toLowerCase() || "[none]";
    extensionCounts[ext] = (extensionCounts[ext] || 0) + 1;
  }, 2500);

  return {
    scannedFiles,
    scannedDirs,
    topExtensions: Object.entries(extensionCounts)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 10)
      .map(([extension, count]) => ({ extension, count }))
  };
}

function emptyFileProfile() {
  return { scannedFiles: 0, scannedDirs: 0, topExtensions: [] };
}

function walk(root, depth, maxDepth, visit, maxEntries = 1000) {
  if (!fs.existsSync(root) || depth > maxDepth || maxEntries <= 0) return 0;
  let used = 0;
  let entries = [];
  try {
    entries = fs.readdirSync(root, { withFileTypes: true });
  } catch {
    return used;
  }

  for (const entry of entries) {
    if (used >= maxEntries) break;
    if ([".git", "node_modules", "Contents", "jbr", "Frameworks"].includes(entry.name) && depth > 0) continue;
    const fullPath = path.join(root, entry.name);
    visit(fullPath, entry);
    used += 1;
    if (entry.isDirectory()) {
      used += walk(fullPath, depth + 1, maxDepth, visit, maxEntries - used);
    }
  }
  return used;
}

function readGitRemote(root) {
  const configPath = path.join(root, ".git", "config");
  if (!fs.existsSync(configPath)) return null;
  const text = fs.readFileSync(configPath, "utf8");
  const match = text.match(/url\s*=\s*(.+)/);
  return match ? match[1].trim() : null;
}

function commandExists(command) {
  const result = spawnSync("bash", ["-lc", `command -v ${shellQuote(command)}`], {
    encoding: "utf8",
    timeout: 5000
  });
  return result.status === 0 ? result.stdout.trim() : null;
}

function runVersion(versionCommand) {
  const result = spawnSync("bash", ["-lc", versionCommand], {
    encoding: "utf8",
    timeout: 5000
  });
  const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
  return output.split("\n").slice(0, 3).join(" | ") || null;
}

function findAppBundle(bundleNames) {
  const roots = [
    "/Applications",
    "/System/Applications",
    path.join(process.env.HOME || "", "Applications"),
    path.join(WORKSPACE_ROOT, "3.taraf kodlar")
  ].filter(Boolean);

  for (const root of roots) {
    for (const bundleName of bundleNames) {
      const candidate = path.join(root, bundleName);
      if (fs.existsSync(candidate)) return candidate;
      const nested = findNestedApp(root, bundleName, 2);
      if (nested) return nested;
    }
  }

  return null;
}

function findNestedApp(root, bundleName, maxDepth) {
  if (!fs.existsSync(root) || maxDepth < 0) return null;
  let entries = [];
  try {
    entries = fs.readdirSync(root, { withFileTypes: true });
  } catch {
    return null;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const fullPath = path.join(root, entry.name);
    if (entry.name === bundleName) return fullPath;
    if (maxDepth > 0) {
      const nested = findNestedApp(fullPath, bundleName, maxDepth - 1);
      if (nested) return nested;
    }
  }

  return null;
}

function readJsonIfExists(file) {
  try {
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : null;
  } catch {
    return null;
  }
}

function relative(file) {
  return path.relative(ROOT, file) || ".";
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, "'\\''")}'`;
}

function parseArgs(argv) {
  const out = {};
  for (const arg of argv) {
    if (arg === "--check") out.check = true;
    if (arg === "--help" || arg === "-h") out.help = true;
  }
  return out;
}

function printHelp() {
  console.log(`
Usage:
  node scripts/create-seis-ecosystem-intake.cjs
  node scripts/create-seis-ecosystem-intake.cjs --check

Creates SEIS-owned third-party adaptation, toolchain readiness, and desktop app integration reports.
`);
}
