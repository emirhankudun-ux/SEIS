#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/../.." && pwd)"
WORKSPACE_ROOT="${WORKSPACE_ROOT:-${SEIS_ROOT:-${REPO_ROOT}}}"
PLUGIN_ROOT="${PLUGIN_ROOT:-${REPO_ROOT}/plugins/seis}"
MARKETPLACE_JSON="${MARKETPLACE_JSON:-${HOME}/.agents/plugins/marketplace.json}"
SEIS_REPO="${SEIS_REPO:-emirhankudun-ux/SEIS}"
SEIS_BRANCH="${SEIS_BRANCH:-main}"

echo "SEIS Codex Plugin Status"
echo "Workspace: ${WORKSPACE_ROOT}"
echo "Plugin: ${PLUGIN_ROOT}"
echo "Marketplace: ${MARKETPLACE_JSON}"
echo "Canonical repo: ${SEIS_REPO}"
echo "Canonical branch: ${SEIS_BRANCH}"
echo

if [[ -f "${PLUGIN_ROOT}/.codex-plugin/plugin.json" ]]; then
  echo "Plugin manifest: present"
else
  echo "Plugin manifest: missing"
fi

if [[ -f "${MARKETPLACE_JSON}" ]]; then
  echo "Personal marketplace: present"
else
  echo "Personal marketplace: missing"
fi

if command -v git >/dev/null 2>&1; then
  echo "git: $(command -v git)"
else
  echo "git: missing"
fi

if command -v gh >/dev/null 2>&1; then
  echo "gh: $(command -v gh)"
else
  echo "gh: missing"
fi

echo
echo "Local SEIS-related directories:"
find "${WORKSPACE_ROOT}" -maxdepth 2 -type d \
  \( -name 'SEIS' -o -name '_SEIS_WORKSPACE' -o -name 'UIX-Apps' -o -name 'seis-digital-experience-foundation' \) \
  -print 2>/dev/null | sort

echo
echo "Migration status files:"
find "${WORKSPACE_ROOT}" -maxdepth 3 -type f \
  \( -name 'migrate-repositories-to-seis-depot.sh' -o -name 'migrate-github-branches-to-seis.sh' -o -name 'github-branch-migration-audit.md' \) \
  -print 2>/dev/null | sort
