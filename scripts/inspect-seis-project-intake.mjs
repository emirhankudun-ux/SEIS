#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { containsSecretMaterial } from '../packages/seis-ai/src/lib/redaction.mjs';

const ROOT = process.cwd();
const CONTRACT_PATH = path.join(ROOT, 'content', 'development', 'seis-project-intake-contract.json');

const args = parseArgs(process.argv.slice(2));
const workspace = resolveWorkspace(args.workspace);
const reportPath = path.resolve(workspace, args.jsonOut || path.join('reports', 'seis-project-intake', 'latest.json'));
const reportMarkdownPath = path.resolve(workspace, args.mdOut || path.join('reports', 'seis-project-intake', 'latest.md'));

const report = generateIntakeReport(workspace);

mkdirSync(path.dirname(reportPath), { recursive: true });
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
writeFileSync(reportMarkdownPath, renderMarkdownReport(report), 'utf8');

console.log(`SEIS project intake written: ${path.relative(ROOT, reportPath)} | ${path.relative(ROOT, reportMarkdownPath)}`);
console.log(JSON.stringify({
  workspace: report.intake.workspaceRoot,
  generatedAt: report.generatedAt,
  warningCount: report.warnings.length,
  git: {
    isGitRepo: report.repository.isGitRepo,
    branch: report.repository.branch,
    uncommittedChanges: report.repository.uncommittedChanges,
  },
}, null, 2));

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === '--workspace') {
      out.workspace = next;
      i += 1;
    } else if (arg === '--json-out') {
      out.jsonOut = next;
      i += 1;
    } else if (arg === '--md-out') {
      out.mdOut = next;
      i += 1;
    }
  }
  return out;
}

function resolveWorkspace(candidate) {
  const resolved = candidate ? path.resolve(ROOT, candidate) : ROOT;
  if (!existsSync(resolved) || !statSync(resolved).isDirectory()) {
    throw new Error(`workspace not found: ${candidate}`);
  }
  return resolved;
}

function readJson(filePath) {
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function runGit(args, cwd = ROOT) {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    timeout: 5000,
    env: {
      ...process.env,
      GIT_TERMINAL_PROMPT: '0',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.status !== 0) {
    return { status: result.status, out: result.stdout?.trim() || '', err: result.stderr?.trim() || '' };
  }
  return { status: 0, out: result.stdout.trim(), err: result.stderr.trim() };
}

function collectInstructionFiles(workspaceRoot) {
  const required = [
    'AGENTS.md',
    'REFERENCE_REQUIREMENTS.md',
    'SEIS_UNIVERSE_CLEAN_BUILD.md',
    'SEIS_UNIVERSE_MODEL_FAMILY.md',
    'SEIS_UNIVERSE_MODEL_CARD_TEMPLATE.md',
    'SEIS_UNIVERSE_DATASET_CARD_TEMPLATE.md',
  ];

  return required
    .map((relativePath) => {
      const abs = path.join(workspaceRoot, relativePath);
      return {
        path: relativePath,
        exists: existsSync(abs),
      };
    })
    .filter((entry) => entry.exists)
    .map((entry) => entry.path)
    .sort();
}

function collectLanguages(workspaceRoot) {
  const extensionCounts = new Map();
  const stack = [{ directory: workspaceRoot, depth: 0 }];
  const skippedDirs = new Set(['node_modules', '.git', 'dist', 'build', 'coverage', 'releases', '.next', '.gradle', 'Pods', 'vendor']);

  while (stack.length > 0) {
    const item = stack.pop();
    const directory = item.directory;
    if (item.depth > 4) continue;
    if (!existsSync(directory)) continue;

    let entries;
    try {
      entries = readdirSync(directory);
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (entry.startsWith('.')) continue;
      const abs = path.join(directory, entry);
      let stat;
      try {
        stat = statSync(abs);
      } catch {
        continue;
      }

      if (stat.isDirectory()) {
        if (!skippedDirs.has(entry)) {
          stack.push({ directory: abs, depth: item.depth + 1 });
        }
      } else if (stat.isFile()) {
        const ext = path.extname(entry).toLowerCase() || 'noext';
        extensionCounts.set(ext, (extensionCounts.get(ext) || 0) + 1);
      }
    }
  }

  const sorted = [...extensionCounts.entries()].sort((left, right) => right[1] - left[1]);
  return sorted.slice(0, 8).map(([ext]) => ext.replace('.', ''));
}

function detectSecretExposure(workspaceRoot) {
  const candidates = [];
  const seen = new Set();
  const scannedFiles = listCandidateFiles(workspaceRoot, 3);

  for (const file of scannedFiles) {
    const abs = path.join(workspaceRoot, file);
    let text;
    try {
      text = readFileSync(abs, 'utf8');
    } catch {
      continue;
    }
    if (!text || text.length > 250000) continue;

    if (containsSecretMaterial(text)) {
      if (!seen.has(file)) {
        candidates.push(file);
        seen.add(file);
      }
    }
  }

  return candidates.sort();
}

function listCandidateFiles(workspaceRoot, maxDepth) {
  const out = [];
  const root = path.resolve(workspaceRoot);
  const stack = [{ filePath: root, depth: 0 }];
  const skipDirs = new Set(['.git', 'node_modules', 'dist', 'build', 'coverage', '.next', 'releases', 'coverage-cache', 'vendor', '.turbo']);
  const allowExtensions = new Set([
    '.md',
    '.txt',
    '.json',
    '.mjs',
    '.cjs',
    '.js',
    '.ts',
    '.tsx',
    '.jsx',
    '.py',
    '.java',
    '.kt',
    '.swift',
    '.yml',
    '.yaml',
    '.toml',
    '.xml',
    '.html',
    '.css',
    '.sh',
    '.gradle',
    '.proto',
    '.lock',
    '.cfg',
    '.ini',
    '.conf',
  ]);

  while (stack.length > 0) {
    const item = stack.pop();
    if (item.depth > maxDepth) continue;

    let entries;
    try {
      entries = readdirSync(item.filePath);
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (entry === '.DS_Store' || entry.startsWith('.seis-')) continue;
      const abs = path.join(item.filePath, entry);
      const rel = path.relative(root, abs).split(path.sep).join('/');

      let stat;
      try {
        stat = statSync(abs);
      } catch {
        continue;
      }

      if (stat.isDirectory()) {
        if (!skipDirs.has(entry)) {
          stack.push({ filePath: abs, depth: item.depth + 1 });
        }
        continue;
      }

      if (!stat.isFile()) continue;
      if (stat.size > 500000) continue;
      const ext = path.extname(entry).toLowerCase();
      if (!allowExtensions.has(ext) && !entry.startsWith('Dockerfile') && !entry.startsWith('Makefile')) {
        continue;
      }

      const normalized = rel.replace(/\\+/g, '/');
      if (!normalized.startsWith('..')) {
        out.push(normalized);
      }
    }
  }

  return out;
}

function collectNativeSignals(workspaceRoot) {
  const hasPackageSwift = existsSync(path.join(workspaceRoot, 'Package.swift'));
  const hasXcodeProject = listTopLevelMatches(workspaceRoot, ['.xcodeproj', '.xcworkspace']);
  const hasSwiftFile = existsSync(path.join(workspaceRoot, 'Sources')) && existsSync(path.join(workspaceRoot, 'Sources', 'SeisAppleNativeShell'));

  const hasIosTargetFile = existsSync(path.join(workspaceRoot, 'ios'));
  const hasAndroidTargetFile = existsSync(path.join(workspaceRoot, 'android'));

  const detected = [];
  if (hasPackageSwift) detected.push('swift-package');
  if (hasXcodeProject.length > 0) detected.push('xcode-workspace');
  if (hasSwiftFile) detected.push('seis-swift-target');
  if (hasIosTargetFile) detected.push('ios');
  if (hasAndroidTargetFile) detected.push('android');

  return {
    detected,
    hasPackageSwift,
    hasXcodeProject: hasXcodeProject.length > 0,
    hasAndroidSource: hasAndroidTargetFile,
    hasIosSource: hasIosTargetFile,
  };
}

function listTopLevelMatches(workspaceRoot, suffixes) {
  if (!existsSync(workspaceRoot)) return [];
  const files = readdirSync(workspaceRoot);
  return files.filter((entry) => {
    const lower = entry.toLowerCase();
    return suffixes.some((suffix) => lower.endsWith(suffix));
  });
}

function collectTooling(workspaceRoot) {
  return {
    packageManagers: [
      existsSync(path.join(workspaceRoot, 'package-lock.json')) ? 'npm' : null,
      existsSync(path.join(workspaceRoot, 'yarn.lock')) ? 'yarn' : null,
      existsSync(path.join(workspaceRoot, 'pnpm-lock.yaml')) ? 'pnpm' : null,
      existsSync(path.join(workspaceRoot, 'Package.resolved')) ? 'swift' : null,
      existsSync(path.join(workspaceRoot, 'Gemfile')) ? 'ruby' : null,
      existsSync(path.join(workspaceRoot, 'requirements.txt')) ? 'python' : null,
      existsSync(path.join(workspaceRoot, 'pyproject.toml')) ? 'python' : null,
      existsSync(path.join(workspaceRoot, 'Cargo.toml')) ? 'rust' : null,
      existsSync(path.join(workspaceRoot, 'go.mod')) ? 'go' : null,
      existsSync(path.join(workspaceRoot, 'build.gradle')) ? 'gradle' : null,
    ].filter(Boolean),
    languageStack: collectLanguages(workspaceRoot),
    nativeSignals: collectNativeSignals(workspaceRoot),
  };
}

function collectRepoState(workspaceRoot) {
  const gitProbe = runGit(['rev-parse', '--is-inside-work-tree'], workspaceRoot);
  if (gitProbe.status !== 0) {
    return {
      root: workspaceRoot,
      isGitRepo: false,
      branch: null,
      remote: null,
      uncommittedChanges: null,
      worktreeClean: null,
      recentCommit: null,
    };
  }

  const branch = runGit(['branch', '--show-current'], workspaceRoot).out || 'unknown';
  const remoteRaw = runGit(['remote', '-v'], workspaceRoot).out || '';
  const remote = remoteRaw
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.includes('(fetch)'))
    ?.split('\t')[1]
    ?.split(' ')[0] || null;
  const status = runGit(['status', '--porcelain'], workspaceRoot).out || '';
  const uncommittedChanges = status.length > 0;
  const commit = runGit(['log', '-1', '--oneline'], workspaceRoot).out || 'unknown';

  return {
    root: workspaceRoot,
    isGitRepo: true,
    branch,
    remote,
    uncommittedChanges,
    worktreeClean: !uncommittedChanges,
    recentCommit: commit,
  };
}

function commandPolicyFromContract() {
  const contract = readJson(CONTRACT_PATH);
  if (!contract?.commandPolicy) {
    return {
      default: 'read-only',
      scopedActions: [
        { capability: 'read', decision: 'allow' },
        { capability: 'write', decision: 'gate' },
        { capability: 'shell', decision: 'gate' },
        { capability: 'network', decision: 'deny' },
        { capability: 'secret', decision: 'deny' },
      ],
    };
  }

  return contract.commandPolicy;
}

function generateIntakeReport(workspaceRoot) {
  const generatedAt = new Date().toISOString();
  const repository = collectRepoState(workspaceRoot);
  const instructionFiles = collectInstructionFiles(workspaceRoot);
  const tooling = collectTooling(workspaceRoot);
  const commandPolicy = commandPolicyFromContract();
  const secretHits = detectSecretExposure(workspaceRoot);

  const warningMessages = [];
  if (!repository.isGitRepo) {
    warningMessages.push('Workspace is not a Git repository.');
  }
  if (!existsSync(path.join(workspaceRoot, 'AGENTS.md'))) {
    warningMessages.push('AGENTS.md is missing from workspace root.');
  }
  if (repository.isGitRepo && repository.uncommittedChanges) {
    warningMessages.push('Working tree has uncommitted changes.');
  }
  if (secretHits.length > 0) {
    warningMessages.push(`Potentially sensitive token-like patterns in ${secretHits.length} file(s). Redacted for output.`);
  }

  const recommendation = commandPolicy.default === 'read-only'
    ? ['Phase-2 deterministic read loop: yes', 'Write/shell actions require explicit gate', 'Model execution remains disabled for this slice']
    : [];

  return {
    generatedAt,
    repository: {
      workspaceRoot: repository.root,
      isGitRepo: repository.isGitRepo,
      branch: repository.branch,
      remote: repository.remote,
      uncommittedChanges: repository.uncommittedChanges,
      worktreeClean: repository.worktreeClean,
      recentCommit: repository.recentCommit,
    },
    intake: {
      workspaceRoot: workspaceRoot,
      isGitRepo: repository.isGitRepo,
      hasAgents: existsSync(path.join(workspaceRoot, 'AGENTS.md')),
      instructionFiles,
      commandPolicy,
      readOnlyDefault: repository.isGitRepo ? 'enforced' : 'n/a',
      recommendations: recommendation,
    },
    technology: {
      packageManagers: tooling.packageManagers,
      languageSignals: tooling.languageStack,
      nativeSignals: tooling.nativeSignals,
    },
    capabilityModel: {
      policyId: 'seis-project-intake-policy-v0',
      defaultDecision: commandPolicy.default,
      scopedActions: commandPolicy.scopedActions,
      secretExposedFiles: secretHits.length,
    },
    warnings: warningMessages,
    evidence: {
      secretFlags: secretHits.map((file) => ({ path: file })),
      integrity: {
        generatedAt,
        commandPolicyVersion: commandPolicy.version || 'seis-policy-v0',
      },
    },
    notes: {
      platformHint: 'cli-first-with-macos-evidence-path',
      nextPhaseReadiness: {
        permissionKernel: 'required',
        projectIntakeValidation: 'required',
        modelRuntime: 'deferred',
      },
    },
  };
}

function renderMarkdownReport(report) {
  const safeWarnings = report.warnings.length ? report.warnings.map((warning) => `- ${warning}`).join('\n') : '- none';
  const instructions = report.intake.instructionFiles.map((item) => `- ${item}`).join('\n') || '- no tracked files';
  const packageManagers = report.technology.packageManagers.join(', ') || 'none detected';
  const languageSignals = report.technology.languageSignals.join(', ') || 'none detected';
  const nativeSignals = Object.entries(report.technology.nativeSignals)
    .map(([key, value]) => `- ${key}: ${value}`)
    .join('\n');

  return `# SEIS Project Intake Report\n\n` +
    `Generated at: ${report.generatedAt}\n\n` +
    `## Repository\n` +
    `- Root: ${report.repository.workspaceRoot}\n` +
    `- Is Git repo: ${report.repository.isGitRepo}\n` +
    `- Branch: ${report.repository.branch || 'unknown'}\n` +
    `- Remote: ${report.repository.remote || 'not set'}\n` +
    `- Worktree clean: ${String(report.repository.worktreeClean)}\n\n` +
    `## Intake Evidence\n` +
    `- Workspace root: ${report.intake.workspaceRoot}\n` +
    `- AGENTS present: ${report.intake.hasAgents}\n` +
    `- Command policy: ${report.intake.commandPolicy.default}\n` +
    `- Required instruction files:\n${instructions}\n\n` +
    `## Technology\n` +
    `- Package managers: ${packageManagers}\n` +
    `- Language signals: ${languageSignals}\n` +
    `- Native signals:\n${nativeSignals}\n\n` +
    `## Capability Model\n` +
    `- Policy ID: ${report.capabilityModel.policyId}\n` +
    `- Default decision: ${report.capabilityModel.defaultDecision}\n` +
    `- Secret-hit count: ${report.capabilityModel.secretExposedFiles}\n\n` +
    `## Warnings\n${safeWarnings}\n`;
}
