#!/usr/bin/env bash
# SEIS Bash static auditor — syntax checks and best-practice gates for all
# shell scripts in the repository.
#
# Checks per script:
#   1. bash -n  : syntax well-formed
#   2. shebang  : first line is #!/usr/bin/env bash or #!/bin/bash
#   3. set -u   : unset-variable guard present (set -u, set -eu, set -euo, etc.)
#
# Advisory (not a failure):
#   • scripts that declare 'set -e' without 'set -u' are noted
#
# Usage: bash polyglot/bash/seis_shell_audit.sh [--self-test]
# Exit:  0 PASS, 1 FAIL

set -uo pipefail

REPO_ROOT="${REPO_ROOT:-$(cd "$(dirname "$0")/../.." && pwd)}"
FINDINGS=()
SCRIPTS_CHECKED=0

fail() { FINDINGS+=("$1"); }

# Patterns that satisfy the set -u requirement:
#   set -u / set -eu / set -ue / set -euo / set -euox / set -u pipefail …
SET_U_RE='set[[:space:]]+-[a-zA-Z]*u[a-zA-Z]*'

check_script() {
  local file="$1"
  local base="${file#"$REPO_ROOT/"}"
  SCRIPTS_CHECKED=$((SCRIPTS_CHECKED + 1))

  # 1. Syntax
  if ! bash -n "$file" 2>/dev/null; then
    fail "$base: syntax error (bash -n)"
    return
  fi

  # 2. Shebang
  local shebang
  shebang=$(head -1 "$file")
  case "$shebang" in
    "#!/usr/bin/env bash"|"#!/bin/bash"|"#!/usr/bin/bash") ;;
    "#!/usr/bin/env sh"|"#!/bin/sh") ;;
    \#!*) fail "$base: non-bash shebang: '$shebang'" ;;
    *)    fail "$base: missing shebang" ;;
  esac

  # 3. set -u guard (first 20 lines cover all realistic preamble sizes)
  if ! head -20 "$file" | grep -qE "$SET_U_RE"; then
    fail "$base: missing 'set -u' (unset-variable guard)"
  fi
}

self_test() {
  local pass=0 total=0
  assert() {
    total=$((total + 1))
    local label="$1" result="$2" expected="$3"
    if [ "$result" = "$expected" ]; then
      pass=$((pass + 1))
    else
      echo "  [FAIL] self-test: $label (got '$result', want '$expected')"
    fi
  }

  local dir
  dir=$(mktemp -d /tmp/seis_bash_XXXXXX)

  # Good script
  cat > "$dir/good.sh" <<'SH'
#!/usr/bin/env bash
set -euo pipefail
echo "ok"
SH
  FINDINGS=(); SCRIPTS_CHECKED=0
  check_script "$dir/good.sh"
  assert "good script has 0 findings" "${#FINDINGS[@]}" "0"

  # Syntax error
  cat > "$dir/bad_syntax.sh" <<'SH'
#!/usr/bin/env bash
set -u
if [ then
SH
  FINDINGS=(); SCRIPTS_CHECKED=0
  check_script "$dir/bad_syntax.sh"
  assert "syntax error is caught" "${#FINDINGS[@]}" "1"

  # Missing shebang
  cat > "$dir/no_shebang.sh" <<'SH'
set -u
echo "ok"
SH
  FINDINGS=(); SCRIPTS_CHECKED=0
  check_script "$dir/no_shebang.sh"
  assert "missing shebang is caught" "${#FINDINGS[@]}" "1"

  # Missing set -u
  cat > "$dir/no_set_u.sh" <<'SH'
#!/usr/bin/env bash
echo "ok"
SH
  FINDINGS=(); SCRIPTS_CHECKED=0
  check_script "$dir/no_set_u.sh"
  assert "missing set -u is caught" "${#FINDINGS[@]}" "1"

  # set -eu counts as set -u
  cat > "$dir/set_eu.sh" <<'SH'
#!/usr/bin/env bash
set -eu
echo "ok"
SH
  FINDINGS=(); SCRIPTS_CHECKED=0
  check_script "$dir/set_eu.sh"
  assert "set -eu satisfies set -u requirement" "${#FINDINGS[@]}" "0"

  rm -rf "$dir"

  if [ "$pass" -eq "$total" ]; then
    echo "[PASS] bash-shell-audit  $total/$total self-tests passed"
    return 0
  fi
  echo "[FAIL] bash-shell-audit  $pass/$total self-tests passed"
  return 1
}

main() {
  if [ "${1:-}" = "--self-test" ]; then
    self_test
    return
  fi

  # Audit all shell scripts in the repo (excluding node_modules and build dirs)
  while IFS= read -r -d '' script; do
    check_script "$script"
  done < <(find "$REPO_ROOT" \
    -not \( -path "*/node_modules/*" -o -path "*/.git/*" \
         -o -path "*/target/*" -o -path "*/__pycache__/*" \) \
    -name "*.sh" -print0 2>/dev/null)

  if [ "$SCRIPTS_CHECKED" -eq 0 ]; then
    echo "[SKIP] bash-shell-audit  no .sh files found"
    return 0
  fi

  if [ "${#FINDINGS[@]}" -eq 0 ]; then
    echo "[PASS] bash-shell-audit  $SCRIPTS_CHECKED script(s) — syntax OK, shebangs OK, set -u OK"
    return 0
  fi

  echo "[FAIL] bash-shell-audit  ${#FINDINGS[@]} finding(s) across $SCRIPTS_CHECKED script(s):"
  for f in "${FINDINGS[@]}"; do
    echo "       $f"
  done
  return 1
}

main "$@"
