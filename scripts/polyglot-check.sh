#!/usr/bin/env bash
# SEIS polyglot check — one entry point for every non-JS toolchain.
#
# Each language contributes a real, tested tool; this script runs them
# all and prints one PASS/FAIL/SKIP table. A toolchain that is not
# installed is SKIPped, never failed, so the suite degrades gracefully
# on minimal machines while CI (which has them all) enforces everything.
#
# Usage: scripts/polyglot-check.sh        (from the repo root)

set -u

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

WEB_FILES=(
  apps/web/index.html apps/web/script.js apps/web/style.css
  apps/web/translations.json apps/web/manifest.json
  apps/web/service-worker.js apps/web/site-config.json
)

declare -a NAMES STATES
FAILED=0

record() { # name state
  NAMES+=("$1"); STATES+=("$2")
  [ "$2" = "FAIL" ] && FAILED=1
  return 0
}

run_lane() { # name toolchain-cmd command...
  local name="$1" tool="$2"; shift 2
  if ! command -v "$tool" >/dev/null 2>&1; then
    record "$name" "SKIP"
    echo "[SKIP] $name ($tool not installed)"
    return 0
  fi
  echo "--- $name ---"
  if "$@"; then
    record "$name" "PASS"
  else
    record "$name" "FAIL"
  fi
}

python_lane() {
  python3 polyglot/python/test_seis_image_audit.py -v 2>&1 | tail -1 &&
  python3 polyglot/python/test_seis_icon_gen.py -v 2>&1 | tail -1 &&
  python3 polyglot/python/seis_image_audit.py &&
  python3 polyglot/python/seis_color_contrast.py --self-test &&
  python3 polyglot/python/seis_color_contrast.py &&
  python3 polyglot/python/seis_sw_cache_audit.py --self-test &&
  python3 polyglot/python/seis_sw_cache_audit.py
}

rust_lane() {
  ( cd polyglot/rust/seis-link-audit &&
    cargo test --quiet 2>&1 | tail -2 &&
    cargo run --quiet -- "$REPO_ROOT/apps/web" )
}

go_lane() {
  ( cd polyglot/go &&
    test -z "$(gofmt -l .)" &&
    go vet ./... &&
    go test ./... &&
    go run ./cmd/seis-jsonld --self-test &&
    go run ./cmd/seis-jsonld "$REPO_ROOT/apps/web/index.html" )
}

c_lane() {
  local bin
  bin="$(mktemp /tmp/seis_utf8_XXXXXX)" &&
  gcc -std=c11 -Wall -Wextra -Werror -O2 -o "$bin" polyglot/c/seis_utf8_check.c &&
  "$bin" --self-test &&
  "$bin" "${WEB_FILES[@]}" &&
  rm -f "$bin"
}

cpp_lane() {
  local bin
  bin="$(mktemp /tmp/seis_trlint_XXXXXX)" &&
  g++ -std=c++17 -Wall -Wextra -Werror -O2 -o "$bin" polyglot/cpp/seis_translations_lint.cpp &&
  "$bin" --self-test &&
  "$bin" apps/web/translations.json &&
  rm -f "$bin"
}

ruby_lane() {
  ruby polyglot/ruby/test_i18n_stats.rb 2>&1 | tail -1 &&
  ruby polyglot/ruby/i18n_stats.rb &&
  ruby polyglot/ruby/test_html_heading_audit.rb 2>&1 | tail -1 &&
  ruby polyglot/ruby/html_heading_audit.rb
}

php_lane() {
  php -l polyglot/php/contact-endpoint.php >/dev/null &&
  php polyglot/php/contact-endpoint.php --self-test
}

java_lane() {
  java polyglot/java/DrawingsChecksum.java --self-test &&
  java polyglot/java/DrawingsChecksum.java verify \
    apps/web/public/media/drawings polyglot/java/drawings.sha256 &&
  java polyglot/java/CssMediaQueryAudit.java --self-test &&
  java polyglot/java/CssMediaQueryAudit.java
}

perl_lane() {
  perl polyglot/perl/hygiene_lint.pl --self-test &&
  perl polyglot/perl/hygiene_lint.pl "${WEB_FILES[@]}"
}

awk_lane() {
  awk -f polyglot/awk/css_var_histogram.awk apps/web/style.css
}

# sqlite3 may not be installed on minimal machines; the schema file is
# tested in CI when sqlite3 is present, skipped otherwise.
sql_lane() {
  sqlite3 :memory: < polyglot/sql/audit_ledger.sqlite.sql
}

typescript_lane() {
  ts-node --project polyglot/typescript/tsconfig.json \
    polyglot/typescript/seis_config_validator.ts --self-test &&
  ts-node --project polyglot/typescript/tsconfig.json \
    polyglot/typescript/seis_config_validator.ts
}

jq_lane() {
  local out
  out=$(jq -rf polyglot/jq/seis_translations_audit.jq apps/web/translations.json 2>&1)
  echo "$out"
  [[ "$out" != *"[FAIL]"* ]]
}

xml_lane() {
  bash polyglot/xml/seis_sitemap_check.sh --self-test &&
  bash polyglot/xml/seis_sitemap_check.sh
}

sed_lane() {
  bash polyglot/sed/seis_css_vars_defined.sh --self-test &&
  bash polyglot/sed/seis_css_vars_defined.sh
}

yaml_lane() {
  bash polyglot/yaml/seis_workflow_lint.sh --self-test &&
  bash polyglot/yaml/seis_workflow_lint.sh
}

bash_lane() {
  bash polyglot/bash/seis_shell_audit.sh --self-test &&
  bash polyglot/bash/seis_shell_audit.sh
}

bc_lane() {
  bash polyglot/bc/seis_budget_check.sh --self-test &&
  bash polyglot/bc/seis_budget_check.sh
}

bun_lane() {
  bun polyglot/bun/seis_js_quality_audit.ts --self-test &&
  bun polyglot/bun/seis_js_quality_audit.ts
}

lua_lane() {
  lua5.4 polyglot/lua/seis_i18n_attr_audit.lua --self-test &&
  lua5.4 polyglot/lua/seis_i18n_attr_audit.lua
}

tcl_lane() {
  tclsh polyglot/tcl/seis_meta_tags_check.tcl --self-test &&
  tclsh polyglot/tcl/seis_meta_tags_check.tcl
}

r_lane() {
  Rscript polyglot/r/seis_translation_stats.R --self-test &&
  Rscript polyglot/r/seis_translation_stats.R
}

echo "SEIS polyglot audit — $REPO_ROOT"
echo ""
run_lane "python     (image+icon)"      python3   python_lane
run_lane "rust       (link audit)"      cargo     rust_lane
run_lane "go         (serve+contract)"  go        go_lane
run_lane "c          (utf-8)"           gcc       c_lane
run_lane "c++        (translations)"    g++       cpp_lane
run_lane "ruby       (i18n stats)"      ruby      ruby_lane
run_lane "php        (contact)"         php       php_lane
run_lane "java       (checksums)"       java      java_lane
run_lane "perl       (hygiene)"         perl      perl_lane
run_lane "awk        (css-vars)"        awk       awk_lane
run_lane "sql        (audit schema)"    sqlite3   sql_lane
run_lane "typescript (config-valid)"    ts-node   typescript_lane
run_lane "jq         (translations)"    jq        jq_lane
run_lane "xml        (sitemap)"         xmllint   xml_lane
run_lane "sed        (css-vars-def)"    sed       sed_lane
run_lane "yaml       (workflow-lint)"   yq        yaml_lane
run_lane "bash       (shell-audit)"    bash      bash_lane
run_lane "bc         (budget-check)"   bc        bc_lane
run_lane "bun        (js-quality)"     bun       bun_lane
run_lane "lua        (i18n-attrs)"     lua5.4    lua_lane
run_lane "tcl        (meta-tags)"      tclsh     tcl_lane
run_lane "r          (translation-stats)" Rscript r_lane

echo ""
echo "── polyglot summary ──────────────────────"
for i in "${!NAMES[@]}"; do
  printf "  [%s] %s\n" "${STATES[$i]}" "${NAMES[$i]}"
done
echo "──────────────────────────────────────────"

if [ "$FAILED" -ne 0 ]; then
  echo "Polyglot checks FAILED."
  exit 1
fi
echo "All polyglot checks passed."
