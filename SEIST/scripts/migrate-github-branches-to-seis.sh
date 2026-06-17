#!/usr/bin/env bash
set -euo pipefail

OWNER="${OWNER:-emirhankudun-ux}"
TARGET_REPO="${TARGET_REPO:-SEIS}"
TARGET_URL="${TARGET_URL:-https://github.com/${OWNER}/${TARGET_REPO}.git}"
DRY_RUN="${DRY_RUN:-1}"
DELETE_SOURCE_REPOS="${DELETE_SOURCE_REPOS:-0}"
SKIP_FETCH_ERRORS="${SKIP_FETCH_ERRORS:-0}"
WORKDIR="${WORKDIR:-$(mktemp -d)}"

SOURCE_REPOS=(
  "UIX-Apps"
  "emirhan-kudun-portfolio"
  "github-unified-source"
  "seis-trusted-marketplace-plugin"
  "gemini-cli"
  "DeepSeek-Coder"
  "claude-code"
  "docs"
  "awesome-deepseek-agent"
)

if ! command -v git >/dev/null 2>&1; then
  echo "git is required." >&2
  exit 1
fi

if [[ "$DELETE_SOURCE_REPOS" == "1" ]] && ! command -v gh >/dev/null 2>&1; then
  echo "DELETE_SOURCE_REPOS=1 requires GitHub CLI (gh)." >&2
  exit 1
fi

mirror="${WORKDIR%/}/${TARGET_REPO}.git"

echo "Owner: ${OWNER}"
echo "Target: ${TARGET_URL}"
echo "Workdir: ${WORKDIR}"
echo "Dry run: ${DRY_RUN}"
echo "Skip fetch errors: ${SKIP_FETCH_ERRORS}"

if [[ ! -d "$mirror" ]]; then
  git clone --mirror "$TARGET_URL" "$mirror"
fi

for repo in "${SOURCE_REPOS[@]}"; do
  source_url="https://github.com/${OWNER}/${repo}.git"
  remote_name="source-${repo}"

  echo
  echo "Fetching ${repo}"

  if git -C "$mirror" remote get-url "$remote_name" >/dev/null 2>&1; then
    git -C "$mirror" remote set-url "$remote_name" "$source_url"
  else
    git -C "$mirror" remote add "$remote_name" "$source_url"
  fi

  if ! git -C "$mirror" fetch "$remote_name" '+refs/heads/*:refs/remotes/'"$remote_name"'/*'; then
    if [[ "$SKIP_FETCH_ERRORS" == "1" ]]; then
      echo "Skipping ${repo}; fetch failed."
      continue
    fi

    echo "Fetch failed for ${repo}. Authenticate git/gh, then rerun." >&2
    exit 1
  fi

  while read -r branch sha; do
    [[ -z "$branch" || -z "$sha" ]] && continue
    target_ref="refs/heads/sources/${repo}/${branch}"

    if [[ "$DRY_RUN" == "1" ]]; then
      echo "Would force-update ${repo}/${branch} -> ${target_ref} (${sha})"
    else
      git -C "$mirror" push origin "+${sha}:${target_ref}"
    fi
  done < <(git -C "$mirror" for-each-ref --format='%(refname:lstrip=3) %(objectname)' "refs/remotes/${remote_name}")
done

echo
echo "Verifying target refs"
git -C "$mirror" ls-remote --heads origin 'sources/*'

if [[ "$DELETE_SOURCE_REPOS" == "1" ]]; then
  echo
  echo "Deleting source repositories. This is irreversible."
  gh auth status

  for repo in "${SOURCE_REPOS[@]}"; do
    gh repo delete "${OWNER}/${repo}" --yes
  done
fi

echo "Done."
