#!/usr/bin/env bash
# SEIS bc-powered performance budget checker.
#
# Reads actual file sizes and passes them to the bc library for precise
# percentage-of-budget arithmetic. bc's arbitrary precision avoids the
# integer-rounding errors that shell arithmetic produces on large byte counts.
#
# Budgets (aligned with the JS seis-check perf lane):
#   HTML    ≤  80 KB    CSS   ≤  60 KB    JS    ≤ 150 KB
#   Each image ≤ 300 KB    Product media total ≤ 10 MB
#
# Usage: bash polyglot/bc/seis_budget_check.sh [--self-test]
# Exit:  0 PASS, 1 FAIL

set -uo pipefail

REPO_ROOT="${REPO_ROOT:-$(cd "$(dirname "$0")/../.." && pwd)}"
BC_LIB="$REPO_ROOT/polyglot/bc/seis_budget_check.bc"
FINDINGS=()

fail() { FINDINGS+=("$1"); }

# Run bc expression against the library; print result
bc_eval() {
  bc -q "$BC_LIB" <<< "$1"
}

check_file_budget() {
  local file="$1" limit_kb="$2" label="$3"
  [ -f "$file" ] || return

  local bytes
  bytes=$(wc -c < "$file")

  local pct over
  pct=$(bc_eval "budget_pct($bytes, $limit_kb)")
  over=$(bc_eval "over_budget($bytes, $limit_kb)")

  local kb_actual
  kb_actual=$(bc_eval "kb($bytes)")

  printf "        %-28s %6s KB / %d KB  (%s%%)\n" "$label" "$kb_actual" "$limit_kb" "$pct"

  if [ "$over" = "1" ]; then
    fail "$label: ${kb_actual} KB exceeds ${limit_kb} KB budget (${pct}%)"
  fi
}

check_media_total() {
  local media_dir="$1" limit_kb="$2"
  [ -d "$media_dir" ] || return

  local total_bytes=0
  while IFS= read -r f; do
    local sz
    sz=$(wc -c < "$f")
    total_bytes=$((total_bytes + sz))
  done < <(find "$media_dir" -type f \( -name "*.jpg" -o -name "*.jpeg" \
              -o -name "*.png" -o -name "*.webp" -o -name "*.gif" \) 2>/dev/null)

  local pct over kb_actual
  pct=$(bc_eval "budget_pct($total_bytes, $limit_kb)")
  over=$(bc_eval "over_budget($total_bytes, $limit_kb)")
  kb_actual=$(bc_eval "kb($total_bytes)")

  printf "        %-28s %6s KB / %d KB  (%s%%)\n" "media/ total" "$kb_actual" "$limit_kb" "$pct"
  if [ "$over" = "1" ]; then
    fail "media total: ${kb_actual} KB exceeds ${limit_kb} KB budget (${pct}%)"
  fi
}

self_test() {
  local result
  result=$(bc_eval "selftest()")

  if [ "$result" = "6" ]; then
    echo "[PASS] bc-budget  6/6 arithmetic self-tests passed"
    return 0
  fi
  echo "[FAIL] bc-budget  $result/6 arithmetic self-tests passed"
  return 1
}

main() {
  if [ "${1:-}" = "--self-test" ]; then
    self_test
    return
  fi

  local web="$REPO_ROOT/apps/web"

  echo "       budget report:"
  check_file_budget "$web/index.html"         80   "index.html"
  check_file_budget "$web/style.css"          60   "style.css"
  check_file_budget "$web/script.js"         150   "script.js"
  check_file_budget "$web/translations.json"  60   "translations.json"
  check_media_total "$web/public/media"    10240   # 10 MB product media budget

  if [ "${#FINDINGS[@]}" -eq 0 ]; then
    echo "[PASS] bc-budget  all assets within budget"
    return 0
  fi

  echo "[FAIL] bc-budget  ${#FINDINGS[@]} budget breach(es):"
  for f in "${FINDINGS[@]}"; do
    echo "       $f"
  done
  return 1
}

main "$@"
