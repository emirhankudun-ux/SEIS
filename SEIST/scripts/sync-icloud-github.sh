#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_DIR="/Users/emirhan/Library/Mobile Documents/com~apple~CloudDocs/Github/seis-digital-experience-foundation"

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

