#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
USER_HOME="${HOME:-$(dscl . -read /Users/$(whoami) NFSHomeDirectory | awk '{print $2}')}"
TARGET_ROOT="${SEIS_ICLOUD_ROOT:-${USER_HOME}/Library/Mobile\ Documents/com~apple~CloudDocs/Github}"
TARGET_DIR="${TARGET_ROOT}/seis-digital-experience-foundation"

mkdir -p "$TARGET_DIR"

rsync -a \
  --exclude ".git" \
  --exclude ".playwright-mcp" \
  --exclude "node_modules" \
  --exclude ".next" \
  --exclude "apps/seis-nextjs-foundation/.next" \
  "$ROOT_DIR/" \
  "$TARGET_DIR/"

echo "Synced SEIS foundation to: $TARGET_DIR"
