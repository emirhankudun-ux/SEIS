#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="${1:-/workspaces/SEIS}"

cd "$REPO_DIR"

printf "\n== SEIS Cloud bootstrap ==\n"
printf "Repository: %s\n" "$(pwd)" 

echo "\n== Git state =="
git status --short

git branch --show-current

git remote -v

echo "\n== Toolchain =="
node --version
npm --version

echo "\n== Baseline checks =="
npm run check:open-source-governance
npm run check:foundation
npm run check:workspace

if command -v swift >/dev/null 2>&1; then
  echo "\n== Swift check =="
  npm run check:seis-platform-kernel
else
  echo "\nSkipping Swift-dependent kernel check (swift binary not present in this container)."
fi

if [ -f package.json ]; then
  echo "\n== Web/quality smoke =="
  npm run seis:check
fi

printf "\n== Done ==\n"
