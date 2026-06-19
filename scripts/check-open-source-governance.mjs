import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, '..');
const failures = [];

function read(relativePath) {
  const absolutePath = resolve(root, relativePath);
  if (!existsSync(absolutePath)) {
    failures.push(`missing ${relativePath}`);
    return '';
  }
  return readFileSync(absolutePath, 'utf8');
}

function requireIncludes(file, text, reason = text) {
  const contents = read(file);
  if (!contents.includes(text)) {
    failures.push(`${file} must include ${reason}`);
  }
}

function requireNotIncludes(file, text, reason = text) {
  const contents = read(file);
  if (contents.includes(text)) {
    failures.push(`${file} must not include ${reason}`);
  }
}

function requireStartsWith(file, text) {
  const contents = read(file);
  if (!contents.startsWith(text)) {
    failures.push(`${file} must start with ${JSON.stringify(text)}`);
  }
}

requireStartsWith('README.md', '# SEIS\n');
for (const required of [
  'AI-native open source platform',
  '`main` is the only permanent branch',
  'MCP servers',
  'skills',
  'plugins',
  'LLM workflows',
  'first-run-quickstart.md',
  'GitHub Growth Strategy',
  'SUPPORT.md',
  'GitHub adoption model',
  'Unused SDKs, runtimes, and language toolchains are not installed by default',
  'Apple first',
  'Repository Metadata',
  'plugins/seis-ai-agent',
  'Do not add filler code',
  'ARCHITECTURE.md',
  'ROADMAP.md',
  'SEIS Master Prompt',
  'docs/governance/seis-master-prompt.md',
  'OpenAI Codex / ChatGPT',
  'Claude',
]) {
  requireIncludes('README.md', required);
}
requireNotIncludes('README.md', '# SEIS CLOSED CODE', 'closed-code title');

for (const [file, required] of [
  ['CONTRIBUTING.md', '`main` is the only permanent branch'],
  ['CONTRIBUTING.md', 'first-run quickstart'],
  ['CONTRIBUTING.md', 'Do not ask contributors to install every language toolchain'],
  ['CONTRIBUTING.md', 'Discussions'],
  ['CONTRIBUTING.md', 'AI tools are allowed'],
  ['AGENTS.md', 'Master Prompt'],
  ['AGENTS.md', 'docs/governance/seis-master-prompt.md'],
  ['CODEX.md', 'GitHub -> Codex Cloud -> Branch -> Commit -> Pull Request -> Review -> Merge'],
  ['CODEX.md', 'SEIS-Agent'],
  ['CODEX.md', 'Ed25519'],
  ['CODEX.md', 'least privilege'],
  ['CLAUDE.md', 'Claude Code Guide'],
  ['SECURITY.md', 'Do not open a public issue for a vulnerability'],
  ['SECURITY.md', 'MCP tools, plugins, and agent workflows'],
  ['SECURITY.md', 'GitHub CodeQL code scanning'],
  ['SECURITY.md', 'JavaScript'],
  ['SECURITY.md', 'TypeScript, and Python surfaces'],
  ['SUPPORT.md', 'Discussions Q&A'],
  ['SUPPORT.md', 'first-run quickstart'],
  ['SUPPORT.md', 'Security reports must stay private'],
  ['SUPPORT.md', 'Do not install every language runtime'],
  ['SUPPORT.md', 'AI-Assisted Support'],
  ['docs/development/first-run-quickstart.md', 'git status --short'],
  ['docs/development/first-run-quickstart.md', 'npm run quality'],
  ['docs/development/first-run-quickstart.md', './script/build_and_run.sh --verify'],
  ['docs/development/first-run-quickstart.md', '.codex/environments/environment.toml'],
  ['docs/development/first-run-quickstart.md', 'Do not install Swift, Xcode, Android Studio'],
  ['docs/development/first-run-quickstart.md', 'Codex / ChatGPT'],
  ['docs/development/first-run-quickstart.md', 'Claude'],
  ['apps/macos/README.md', './script/build_and_run.sh'],
  ['apps/macos/README.md', 'SeisAppleNativeShell'],
  ['CODE_OF_CONDUCT.md', 'Contributor Covenant'],
  ['CONTRIBUTORS.md', 'OpenAI Codex / ChatGPT'],
  ['CONTRIBUTORS.md', 'Claude'],
  ['CONTRIBUTORS.md', 'do not imply sponsorship'],
  ['ARCHITECTURE.md', '# SEIS Architecture'],
  ['ARCHITECTURE.md', 'AI-native creative engineering operating system'],
  ['ARCHITECTURE.md', 'Agent Orchestration Layer'],
  ['ARCHITECTURE.md', 'Security Layer'],
  ['ARCHITECTURE.md', 'Cloud and Environment Layer'],
  ['ROADMAP.md', '# SEIS Roadmap'],
  ['ROADMAP.md', 'Phase 1: Foundation'],
  ['ROADMAP.md', 'Phase 10: Enterprise / Supreme Direction'],
  ['ROADMAP.md', 'Roadmap Rule'],
  ['CHANGELOG.md', '# Changelog'],
  ['CHANGELOG.md', '## Unreleased'],
  ['CHANGELOG.md', 'Do not record secrets'],
  ['docs/governance/branch-policy.md', '`main` is the only permanent branch'],
  ['docs/governance/open-source-governance.md', 'GitHub Update Rule'],
  ['docs/governance/open-source-governance.md', 'Repository description, homepage, and topics'],
  ['docs/governance/open-source-governance.md', '.github/workflows/codeql.yml'],
  ['docs/governance/open-source-governance.md', 'SUPPORT.md'],
  ['docs/governance/open-source-governance.md', 'first-run-quickstart.md'],
  ['docs/governance/github-market-readiness.md', 'GitHub discovery and adoption model'],
  ['docs/governance/github-market-readiness.md', 'first-run-quickstart.md'],
  ['docs/governance/github-market-readiness.md', 'Stars are an outcome'],
  [
    'docs/governance/github-market-readiness.md',
    'Do not install unused language runtimes by default',
  ],
  ['docs/governance/seis-master-prompt.md', '# SEIS Master Prompt'],
  ['docs/governance/seis-master-prompt.md', 'Protect user work'],
  ['docs/governance/seis-master-prompt.md', 'Prioritize security and privacy'],
  ['docs/governance/seis-master-prompt.md', 'Preserve architectural integrity'],
  ['docs/governance/seis-master-prompt.md', 'Standard Workflow'],
  ['docs/governance/seis-master-prompt.md', 'Inspect'],
  ['docs/governance/seis-master-prompt.md', 'Analyze'],
  ['docs/governance/seis-master-prompt.md', 'Plan'],
  ['docs/governance/seis-master-prompt.md', 'Implement'],
  ['docs/governance/seis-master-prompt.md', 'Validate'],
  ['docs/governance/seis-master-prompt.md', 'Document'],
  ['docs/governance/seis-master-prompt.md', 'Summarize'],
  ['docs/governance/seis-master-prompt.md', 'least privilege'],
  [
    'docs/governance/seis-master-prompt.md',
    'Do not deploy, merge, push, delete, or rewrite history without explicit user approval',
  ],
  ['docs/polyglot/language-balance-plan.md', 'Apple / Swift ecosystem'],
  [
    'docs/polyglot/language-balance-plan.md',
    'Do not add filler code only to change language percentages',
  ],
  ['docs/polyglot/language-balance-plan.md', 'reports/language-distribution.md'],
  ['.github/workflows/codeql.yml', 'CodeQL'],
  ['.github/workflows/codeql.yml', 'security-events: write'],
  ['.github/workflows/codeql.yml', 'javascript-typescript'],
  ['.github/workflows/codeql.yml', 'python'],
  ['.github/workflows/codeql.yml', 'github/codeql-action/init'],
  ['.github/workflows/codeql.yml', 'github/codeql-action/analyze'],
  ['.github/PULL_REQUEST_TEMPLATE.md', 'Architecture Fit'],
  ['.github/PULL_REQUEST_TEMPLATE.md', 'Does not install unused SDKs'],
  ['.github/ISSUE_TEMPLATE/config.yml', 'blank_issues_enabled: false'],
  ['.github/ISSUE_TEMPLATE/config.yml', 'SUPPORT.md'],
  ['.github/ISSUE_TEMPLATE/config.yml', 'https://github.com/emirhankudun-ux/SEIS/discussions'],
  ['.github/ISSUE_TEMPLATE/feature_request.md', 'Maintenance Cost'],
  ['.github/ISSUE_TEMPLATE/bug_report.md', 'follow `SECURITY.md`'],
  ['.github/ISSUE_TEMPLATE/custom.md', 'Architecture or governance request'],
  ['.github/DISCUSSION_TEMPLATE/ideas.yml', 'Platform lane'],
  ['.github/DISCUSSION_TEMPLATE/ideas.yml', 'Maintenance cost'],
  ['.github/DISCUSSION_TEMPLATE/q-a.yml', 'Safety check'],
  ['.github/DISCUSSION_TEMPLATE/show-and-tell.yml', 'Sharing check'],
]) {
  requireIncludes(file, required);
}

const license = read('LICENSE');
if (!license.startsWith('MIT License')) {
  failures.push('LICENSE must remain MIT unless the maintainer explicitly changes it');
}

const packageJson = JSON.parse(read('package.json') || '{}');
if (packageJson.name !== 'seis') {
  failures.push('package.json name must stay aligned with SEIS repository identity');
}
if (
  packageJson.scripts?.['check:open-source-governance'] !==
  'node scripts/check-open-source-governance.mjs'
) {
  failures.push('package.json must expose check:open-source-governance');
}

for (const workflow of [
  '.github/workflows/ci.yml',
  '.github/workflows/foundation-check.yml',
  '.github/workflows/seis-open-source-governance.yml',
]) {
  requireIncludes(workflow, 'main');
  requireNotIncludes(workflow, 'UIXAppTTR', 'legacy UIXAppTTR branch trigger');
}

for (const workflow of readdirSync(resolve(root, '.github/workflows')).filter(
  name => name.endsWith('.yml') || name.endsWith('.yaml'),
)) {
  const file = `.github/workflows/${workflow}`;
  const contents = read(file);
  for (const line of contents.split('\n')) {
    const match = line.match(/uses:\s*([^@\s]+)@([^\s#]+)/);
    if (!match) {
      continue;
    }
    const reference = match[2];
    if (!/^[a-f0-9]{40}$/i.test(reference)) {
      failures.push(
        `${file} must pin GitHub Action ${match[1]} to a full commit SHA, got ${reference}`,
      );
    }
  }
}

if (failures.length > 0) {
  console.error('SEIS open source governance check failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('SEIS open source governance check passed.');
