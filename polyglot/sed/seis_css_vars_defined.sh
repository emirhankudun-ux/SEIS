#!/usr/bin/env bash
# SEIS CSS custom-property definition auditor — sed-powered.
#
# The AWK histogram shows how often each var(--x) is *used*.
# This tool inspects the *definition* side: every "--name: value" declaration
# in the CSS.  It then cross-checks the two sides:
#
#   FAIL  — any var(--x) used in the CSS is NOT declared in :root
#   WARN  — any declared property that is never used (dead token)
#   PASS  — definitions and usages are fully aligned
#
# GNU sed extracts both sides; bash handles the set arithmetic.
#
# Usage: bash polyglot/sed/seis_css_vars_defined.sh [--self-test]
# Exit:  0 PASS, 1 FAIL

set -uo pipefail

REPO_ROOT="${REPO_ROOT:-$(cd "$(dirname "$0")/../.." && pwd)}"
CSS_FILE="$REPO_ROOT/apps/web/style.css"

# Extract defined custom property names (--foo-bar) from CSS.
# A line may declare multiple properties; sed replaces each '--name:' with a
# newline+token so every definition on a line is captured independently.
extract_defined() {
  local file="$1"
  # Insert a sentinel before every '--name:' occurrence, then print each match
  sed 's/\(--[A-Za-z0-9_-]*\)[[:space:]]*:/\nDEF\1/g' "$file" \
    | sed -n 's/^DEF\(--[A-Za-z0-9_-]*\).*/\1/p' \
    | sort -u
}

# Extract used property names from var(--foo-bar) calls
extract_used() {
  local file="$1"
  # Replace each var(--name) on a line; print one per line
  sed 's/var(--[A-Za-z0-9_-]*/\nMATCH&/g' "$file" \
    | sed -n 's/^MATCHvar(\(--[A-Za-z0-9_-]*\).*/\1/p' \
    | sort -u
}

self_test() {
  local pass=0 total=0
  assert() {
    total=$((total + 1))
    if [ "$2" = "$3" ]; then pass=$((pass+1))
    else echo "  [FAIL] self-test: $1 (got '$2', want '$3')"; fi
  }

  local dir
  dir=$(mktemp -d /tmp/seis_sed_XXXXXX)

  # Good: defined matches used exactly
  cat > "$dir/good.css" <<'CSS'
:root {
  --color: #111;
  --size: 16px;
}
body { color: var(--color); font-size: var(--size); }
CSS
  defined=$(extract_defined "$dir/good.css" | tr '\n' ',')
  used=$(extract_used "$dir/good.css" | tr '\n' ',')
  assert "good.css defined set" "$defined" "--color,--size,"
  assert "good.css used set"    "$used"    "--color,--size,"

  # Missing definition: var(--unknown) used but never defined
  cat > "$dir/missing.css" <<'CSS'
:root { --color: #111; }
body { color: var(--unknown); }
CSS
  used_m=$(extract_used "$dir/missing.css" | tr '\n' ',')
  def_m=$(extract_defined "$dir/missing.css" | tr '\n' ',')
  assert "missing.css used has --unknown" "$(echo "$used_m" | grep -c 'unknown')" "1"
  assert "missing.css defined has no --unknown" "$(echo "$def_m" | grep -c 'unknown')" "0"

  # Dead token: defined but never used
  cat > "$dir/dead.css" <<'CSS'
:root { --used: #111; --dead: red; }
body { color: var(--used); }
CSS
  dead_def=$(extract_defined "$dir/dead.css" | tr '\n' ',')
  dead_used=$(extract_used "$dir/dead.css" | tr '\n' ',')
  assert "dead.css defined has --dead" "$(echo "$dead_def" | grep -c 'dead')" "1"
  assert "dead.css used has no --dead" "$(echo "$dead_used" | grep -c 'dead')" "0"

  rm -rf "$dir"

  if [ "$pass" -eq "$total" ]; then
    echo "[PASS] sed-css-vars  $total/$total self-tests passed"
    return 0
  fi
  echo "[FAIL] sed-css-vars  $pass/$total self-tests passed"
  return 1
}

main() {
  if [ "${1:-}" = "--self-test" ]; then
    self_test
    return
  fi

  [ -f "$CSS_FILE" ] || { echo "[FAIL] sed-css-vars  style.css not found"; return 1; }

  # Extract both sets
  local tmp_def tmp_used
  tmp_def=$(mktemp /tmp/seis_cssdef_XXXXXX)
  tmp_used=$(mktemp /tmp/seis_cssused_XXXXXX)
  extract_defined "$CSS_FILE" > "$tmp_def"
  extract_used    "$CSS_FILE" > "$tmp_used"

  local n_def n_used
  n_def=$(wc -l < "$tmp_def")
  n_used=$(wc -l < "$tmp_used")

  # Undefined: used but not defined
  local undefined
  undefined=$(comm -13 "$tmp_def" "$tmp_used")

  # Dead: defined but never used
  local dead
  dead=$(comm -23 "$tmp_def" "$tmp_used")

  rm -f "$tmp_def" "$tmp_used"

  local exit_code=0

  if [ -n "$undefined" ]; then
    echo "[FAIL] sed-css-vars  undefined token(s) in var() — $n_def defined, $n_used used:"
    while IFS= read -r v; do echo "       undefined: $v"; done <<< "$undefined"
    exit_code=1
  fi

  if [ -n "$dead" ]; then
    # Advisory only — dead tokens are not a failure
    if [ "$exit_code" -eq 0 ]; then
      echo "[PASS] sed-css-vars  $n_def defined, $n_used used, no undefined tokens"
    fi
    echo "       info: declared-but-unused tokens (dead):"
    while IFS= read -r v; do echo "       dead: $v"; done <<< "$dead"
  elif [ "$exit_code" -eq 0 ]; then
    echo "[PASS] sed-css-vars  $n_def defined, $n_used used — all tokens defined and used"
  fi

  return "$exit_code"
}

main "$@"
