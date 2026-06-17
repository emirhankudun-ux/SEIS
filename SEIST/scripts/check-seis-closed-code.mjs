import { existsSync } from 'node:fs';

const required = [
  'SEIS_CLOSED_CODE.md',
  'LICENSE',
  'README.md',
  'docs/platform/seis-closed-code-architecture.md',
  'docs/platform/google-workspace-ops.md',
  'docs/platform/plugin-stack.md',
  'docs/platform/installed-plugin-operating-model.md',
  'docs/platform/openai-first-plugin-policy.md',
  'docs/platform/openai-curated-build-workbench.md',
  'docs/repository-visibility-and-main-sync.md',
  'integrations/google-workspace.json',
  'roadmap/seis-closed-code-backlog.md',
  'apps/android/README.md',
  'apps/web/README.md',
  'apps/web/openai-curated-cockpit.md',
  'apps/macos/README.md',
  'apps/fullstack/README.md',
  'packages/core/README.md',
  'packages/ui/README.md',
  'packages/data/README.md',
  'data/github-zip-import-inventory.json',
  'data/repository-visibility-audit-2026-06-05.json',
  'data/installed-codex-plugins-2026-06-05.json',
  'data/plugin-install-pass-2026-06-05.json',
  'data/openai-plugin-priority-2026-06-05.json',
  'data/openai-curated-build-workbench-2026-06-05.json',
  'data/openai-curated-install-verification-2026-06-05.json',
  'data/github-main-only-branch-cleanup-2026-06-05.json',
  'data/codex-sources-plugin-usage-2026-06-05.json',
  'plugins/seis/.codex-plugin/plugin.json',
  'plugins/seis/scripts/seis-installed-plugin-audit.sh',
];

const missing = required.filter((path) => !existsSync(path));

if (missing.length > 0) {
  console.error('SEIS CLOSED CODE governance check failed. Missing files:');
  for (const path of missing) {
    console.error(`- ${path}`);
  }
  process.exit(1);
}

console.log(`SEIS CLOSED CODE governance check passed (${required.length} files).`);
