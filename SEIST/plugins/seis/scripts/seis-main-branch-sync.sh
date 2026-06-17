#!/usr/bin/env bash
set -euo pipefail

OWNER="${OWNER:-emirhankudun-ux}"
REPO="${REPO:-SEIS}"
REMOTE_URL="${REMOTE_URL:-https://github.com/${OWNER}/${REPO}.git}"
SOURCE_BRANCH="${SOURCE_BRANCH:-UIXAppTTR}"
TARGET_BRANCH="${TARGET_BRANCH:-main}"
DRY_RUN="${DRY_RUN:-1}"

if ! command -v git >/dev/null 2>&1; then
  echo "git is required." >&2
  exit 1
fi

source_sha="$(git ls-remote "$REMOTE_URL" "refs/heads/${SOURCE_BRANCH}" | awk '{print $1}')"
target_sha="$(git ls-remote "$REMOTE_URL" "refs/heads/${TARGET_BRANCH}" | awk '{print $1}')"

if [[ -z "$source_sha" ]]; then
  echo "Source branch not found: ${SOURCE_BRANCH}" >&2
  exit 1
fi

echo "SEIS Main Branch Sync"
echo "remote: ${REMOTE_URL}"
echo "source: ${SOURCE_BRANCH} ${source_sha}"
echo "target: ${TARGET_BRANCH} ${target_sha:-missing}"

if [[ "$source_sha" == "$target_sha" ]]; then
  echo "Already synced."
  exit 0
fi

if [[ "$DRY_RUN" == "1" ]]; then
  echo "Dry run: would force-update ${TARGET_BRANCH} to ${source_sha}."
  exit 0
fi

git push "$REMOTE_URL" "+${source_sha}:refs/heads/${TARGET_BRANCH}"
echo "Updated ${TARGET_BRANCH} to ${source_sha}."
