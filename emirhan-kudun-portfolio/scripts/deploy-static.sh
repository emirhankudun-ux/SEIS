#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_DIR="${ROOT_DIR}/apps/static-fallback/"
DRY_RUN="--dry-run"

if [[ "${1:-}" == "--live" ]]; then
  DRY_RUN=""
fi

required=(
  "DEPLOY_HOST"
  "DEPLOY_USER"
  "DEPLOY_PATH"
)

for key in "${required[@]}"; do
  if [[ -z "${!key:-}" ]]; then
    echo "Missing ${key}. Export it outside git before deploying." >&2
    exit 1
  fi
done

if [[ ! -f "${SOURCE_DIR}index.html" ]]; then
  echo "Static fallback is missing at ${SOURCE_DIR}index.html" >&2
  exit 1
fi

echo "Deploying static fallback to ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}"
echo "Mode: ${DRY_RUN:---live}"

rsync -az ${DRY_RUN} --delete "${SOURCE_DIR}" "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}"
