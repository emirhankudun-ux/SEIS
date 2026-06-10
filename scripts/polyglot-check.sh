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
  python3 polyglot/python/seis_image_audit.py
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
    go test ./... )
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
  ruby polyglot/ruby/i18n_stats.rb
}

php_lane() {
  php -l polyglot/php/contact-endpoint.php >/dev/null &&
  php polyglot/php/contact-endpoint.php --self-test
}

java_lane() {
  java polyglot/java/DrawingsChecksum.java --self-test &&
  java polyglot/java/DrawingsChecksum.java verify \
    apps/web/public/media/drawings polyglot/java/drawings.sha256
}

perl_lane() {
  perl polyglot/perl/hygiene_lint.pl --self-test &&
  perl polyglot/perl/hygiene_lint.pl "${WEB_FILES[@]}"
}

echo "SEIS polyglot audit — $REPO_ROOT"
echo ""
run_lane "python (image+icon)"      python3 python_lane
run_lane "rust   (link audit)"      cargo   rust_lane
run_lane "go     (serve+contract)"  go      go_lane
run_lane "c      (utf-8)"           gcc     c_lane
run_lane "c++    (translations)"    g++     cpp_lane
run_lane "ruby   (i18n stats)"      ruby    ruby_lane
run_lane "php    (contact)"         php     php_lane
run_lane "java   (checksums)"       java    java_lane
run_lane "perl   (hygiene)"         perl    perl_lane

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
