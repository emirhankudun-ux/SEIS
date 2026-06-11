#!/usr/bin/awk -f
# SEIS CSS custom-property histogram — usage frequency of var(--x).
#
# style_audit (JS) proves every var(--x) is *defined*; this lane shows
# how the design-token vocabulary is actually *used*: a frequency table
# plus single-use tokens, which are candidates for inlining or naming
# review when the token adds no reuse value.
#
# Usage: awk -f polyglot/awk/css_var_histogram.awk apps/web/style.css
# Exit:  always 0 (informational lane); 2 when no var() found at all.

{
  line = $0
  while (match(line, /var\(--[A-Za-z0-9_-]+/)) {
    name = substr(line, RSTART + 6, RLENGTH - 6)
    count[name]++
    total++
    line = substr(line, RSTART + RLENGTH)
  }
}

END {
  if (total == 0) {
    print "[FAIL] css-vars  no var(--x) usage found — wrong file?"
    exit 2
  }
  n = 0
  for (name in count) n++
  printf "[PASS] css-vars  %d tokens, %d total uses\n", n, total

  # top of the histogram: most-used design tokens
  shown = 0
  for (c = total; c > 0 && shown < 6; c--)
    for (name in count)
      if (count[name] == c && shown < 6) {
        printf "        %3dx --%s\n", c, name
        shown++
      }

  singles = ""
  for (name in count)
    if (count[name] == 1)
      singles = singles (singles == "" ? "" : ", ") "--" name
  if (singles != "")
    printf "        info: single-use tokens: %s\n", singles
}
