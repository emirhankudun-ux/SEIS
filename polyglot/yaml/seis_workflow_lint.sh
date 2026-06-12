#!/usr/bin/env bash
# SEIS CI workflow linter — yq-based governance checks for all workflow files.
#
# Every CI workflow should declare:
#   • on: triggers (what fires it)
#   • timeout-minutes on every job (prevents runaway billing)
#   • a readable job name
#
# Checking these with yq (jq-compatible YAML processor) catches governance
# drift that is invisible to regular CI checks.
#
# Usage: bash polyglot/yaml/seis_workflow_lint.sh [--self-test]
# Exit:  0 PASS, 1 FAIL

set -u

REPO_ROOT="${REPO_ROOT:-$(cd "$(dirname "$0")/../.." && pwd)}"
WORKFLOW_DIR="$REPO_ROOT/.github/workflows"
FINDINGS=()

fail() { FINDINGS+=("$1"); }

check_workflow() {
  local file="$1"
  local base
  base=$(basename "$file")

  # 1. Valid YAML (yq returns exit 1 on parse error)
  if ! yq -r '.' "$file" >/dev/null 2>&1; then
    fail "$base: invalid YAML"
    return
  fi

  # 2. Has 'on:' trigger section
  local has_triggers
  has_triggers=$(yq -r 'has("on")' "$file" 2>/dev/null)
  if [ "$has_triggers" != "true" ]; then
    fail "$base: missing 'on:' trigger section"
  fi

  # 3. Every job has timeout-minutes
  local missing_timeouts
  missing_timeouts=$(yq -r '.jobs | to_entries[] | select(.value | has("timeout-minutes") | not) | .key' "$file" 2>/dev/null)
  if [ -n "$missing_timeouts" ]; then
    while IFS= read -r job; do
      fail "$base: job '$job' missing timeout-minutes"
    done <<< "$missing_timeouts"
  fi

  # 4. Every job has a name
  local missing_names
  missing_names=$(yq -r '.jobs | to_entries[] | select(.value | has("name") | not) | .key' "$file" 2>/dev/null)
  if [ -n "$missing_names" ]; then
    while IFS= read -r job; do
      fail "$base: job '$job' missing name"
    done <<< "$missing_names"
  fi
}

self_test() {
  local pass=0
  local total=0

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
  dir=$(mktemp -d /tmp/seis_wf_XXXXXX)

  # Good workflow — all checks pass
  cat > "$dir/good.yml" <<'YAML'
name: good
on:
  push:
    branches: [main]
jobs:
  check:
    name: Run checks
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - run: echo ok
YAML
  FINDINGS=()
  check_workflow "$dir/good.yml"
  assert "good workflow has 0 findings" "${#FINDINGS[@]}" "0"

  # Missing timeout
  cat > "$dir/no_timeout.yml" <<'YAML'
name: no-timeout
on: [push]
jobs:
  check:
    name: Run checks
    runs-on: ubuntu-latest
    steps:
      - run: echo ok
YAML
  FINDINGS=()
  check_workflow "$dir/no_timeout.yml"
  assert "missing timeout is caught" "${#FINDINGS[@]}" "1"

  # Missing trigger (on:)
  cat > "$dir/no_trigger.yml" <<'YAML'
name: no-trigger
jobs:
  check:
    name: Run checks
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - run: echo ok
YAML
  FINDINGS=()
  check_workflow "$dir/no_trigger.yml"
  assert "missing trigger is caught" "${#FINDINGS[@]}" "1"

  # Missing job name
  cat > "$dir/no_name.yml" <<'YAML'
name: no-name
on: [push]
jobs:
  check:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - run: echo ok
YAML
  FINDINGS=()
  check_workflow "$dir/no_name.yml"
  assert "missing job name is caught" "${#FINDINGS[@]}" "1"

  rm -rf "$dir"

  if [ "$pass" -eq "$total" ]; then
    echo "[PASS] yq-workflow-lint  $total/$total self-tests passed"
    return 0
  fi
  echo "[FAIL] yq-workflow-lint  $pass/$total self-tests passed"
  return 1
}

main() {
  if [ "${1:-}" = "--self-test" ]; then
    self_test
    return
  fi

  if [ ! -d "$WORKFLOW_DIR" ]; then
    echo "[SKIP] yq-workflow-lint  no .github/workflows/ directory"
    return 0
  fi

  local count=0
  FINDINGS=()
  for wf in "$WORKFLOW_DIR"/*.yml "$WORKFLOW_DIR"/*.yaml; do
    [ -f "$wf" ] || continue
    check_workflow "$wf"
    count=$((count + 1))
  done

  if [ "${#FINDINGS[@]}" -eq 0 ]; then
    echo "[PASS] yq-workflow-lint  $count workflow(s) — all have triggers, timeouts, and job names"
    return 0
  fi

  echo "[FAIL] yq-workflow-lint  ${#FINDINGS[@]} governance finding(s) across $count workflow(s):"
  for f in "${FINDINGS[@]}"; do
    echo "       $f"
  done
  return 1
}

main "$@"
