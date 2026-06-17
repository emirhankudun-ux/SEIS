#!/usr/bin/env bash
set -euo pipefail

OWNER="${OWNER:-emirhankudun-ux}"
TARGET_REPO="${TARGET_REPO:-SEIS}"
TARGET_BRANCH="${TARGET_BRANCH:-UIXAppTTR}"
TARGET_URL="${TARGET_URL:-https://github.com/${OWNER}/${TARGET_REPO}.git}"
DRY_RUN="${DRY_RUN:-1}"
SKIP_FETCH_ERRORS="${SKIP_FETCH_ERRORS:-0}"
DELETE_SOURCE_REPOS="${DELETE_SOURCE_REPOS:-0}"
WORKDIR="${WORKDIR:-$(mktemp -d)}"

SOURCE_REPOS=(
  "UIX-Apps:UIXAppTTR"
  "emirhan-kudun-portfolio:codex/seis-ux-cinematic-premium-foundation"
  "github-unified-source:main"
  "seis-trusted-marketplace-plugin:main"
  "gemini-cli:main"
  "DeepSeek-Coder:main"
  "claude-code:main"
  "docs:main"
  "awesome-deepseek-agent:main"
)

if ! command -v git >/dev/null 2>&1; then
  echo "git is required." >&2
  exit 1
fi

if [[ "$DELETE_SOURCE_REPOS" == "1" ]] && ! command -v gh >/dev/null 2>&1; then
  echo "DELETE_SOURCE_REPOS=1 requires GitHub CLI (gh)." >&2
  exit 1
fi

target_dir="${WORKDIR%/}/${TARGET_REPO}"
sources_dir="${WORKDIR%/}/sources"
mkdir -p "$sources_dir"

echo "Owner: ${OWNER}"
echo "Target: ${TARGET_URL}"
echo "Target branch: ${TARGET_BRANCH}"
echo "Workdir: ${WORKDIR}"
echo "Dry run: ${DRY_RUN}"
echo "Skip fetch errors: ${SKIP_FETCH_ERRORS}"

if [[ ! -d "$target_dir/.git" ]]; then
  git clone "$TARGET_URL" "$target_dir"
fi

git -C "$target_dir" fetch origin "$TARGET_BRANCH"
git -C "$target_dir" checkout "$TARGET_BRANCH"
git -C "$target_dir" pull --ff-only origin "$TARGET_BRANCH"
git -C "$target_dir" config user.name "${GIT_AUTHOR_NAME:-SEIS Migration Bot}"
git -C "$target_dir" config user.email "${GIT_AUTHOR_EMAIL:-seis-migration@example.invalid}"

for entry in "${SOURCE_REPOS[@]}"; do
  repo="${entry%%:*}"
  default_branch="${entry#*:}"
  source_url="https://github.com/${OWNER}/${repo}.git"
  source_dir="${sources_dir}/${repo}"
  remote_name="source-${repo}"
  import_dir="${target_dir}/repositories/${repo}"

  echo
  echo "Preparing ${repo} (${default_branch})"

  if [[ ! -d "$source_dir/.git" ]]; then
    if ! git clone "$source_url" "$source_dir"; then
      if [[ "$SKIP_FETCH_ERRORS" == "1" ]]; then
        echo "Skipping ${repo}; clone failed."
        continue
      fi

      echo "Clone failed for ${repo}. Authenticate git/gh, then rerun." >&2
      exit 1
    fi
  fi

  if ! git -C "$source_dir" fetch --all --tags; then
    if [[ "$SKIP_FETCH_ERRORS" == "1" ]]; then
      echo "Skipping ${repo}; fetch failed."
      continue
    fi

    echo "Fetch failed for ${repo}. Authenticate git/gh, then rerun." >&2
    exit 1
  fi

  if git -C "$target_dir" remote get-url "$remote_name" >/dev/null 2>&1; then
    git -C "$target_dir" remote set-url "$remote_name" "$source_url"
  else
    git -C "$target_dir" remote add "$remote_name" "$source_url"
  fi

  git -C "$target_dir" fetch "$remote_name" '+refs/heads/*:refs/remotes/'"$remote_name"'/*'

  while read -r branch sha; do
    [[ -z "$branch" || -z "$sha" ]] && continue
    target_ref="refs/heads/sources/${repo}/${branch}"

    if [[ "$DRY_RUN" == "1" ]]; then
      echo "Would force-update ${target_ref} to ${sha}"
    else
      git -C "$target_dir" push origin "+${sha}:${target_ref}"
    fi
  done < <(git -C "$target_dir" for-each-ref --format='%(refname:lstrip=3) %(objectname)' "refs/remotes/${remote_name}")

  echo "Importing tracked files from ${repo}/${default_branch}"
  rm -rf "$import_dir"
  mkdir -p "$import_dir"
  git -C "$source_dir" archive --format=tar "$default_branch" | tar -x -C "$import_dir"

  cat > "${import_dir}/.seis-source.json" <<EOF
{
  "source_repository": "${OWNER}/${repo}",
  "source_default_branch": "${default_branch}",
  "seis_namespace": "repositories/${repo}",
  "source_branch_namespace": "sources/${repo}/*",
  "imported_at": "2026-06-05"
}
EOF
done

git -C "$target_dir" add repositories

if git -C "$target_dir" diff --cached --quiet; then
  echo
  echo "No repository file changes to commit."
else
  echo
  staged_count="$(git -C "$target_dir" diff --cached --name-only | wc -l | tr -d ' ')"
  echo "Staged repository snapshot files: ${staged_count}"
  git -C "$target_dir" status --short | sed -n '1,80p'

  if [[ "$DRY_RUN" == "1" ]]; then
    echo "Dry run: repository snapshots are staged locally but not committed or pushed."
  else
    git -C "$target_dir" commit -m "chore: import source repositories into SEIS depot"
    git -C "$target_dir" push origin "$TARGET_BRANCH"
  fi
fi

if [[ "$DELETE_SOURCE_REPOS" == "1" ]]; then
  if [[ "$DRY_RUN" == "1" ]]; then
    echo "Dry run: would delete source repositories after verification."
  else
    echo
    echo "Deleting source repositories. This is irreversible."
    gh auth status

    for entry in "${SOURCE_REPOS[@]}"; do
      repo="${entry%%:*}"
      gh repo delete "${OWNER}/${repo}" --yes
    done
  fi
fi

echo "Done."
