#!/usr/bin/env -S jq -rf
# SEIS translations audit — jq filter for locale key parity and empty-value detection.
#
# Reads apps/web/translations.json (locale → key → value).
# Reports:
#   FAIL  — keys present in some locales but absent in others (structural gap)
#   PASS  — all locales share the same key set
#   info  — keys whose value is "" in some locales (may be intentional)
#
# Usage: jq -rf polyglot/jq/seis_translations_audit.jq apps/web/translations.json
# Exit:  always 0 (jq native); [FAIL] prefix signals failure to the shell caller.

. as $t |
(keys | sort) as $locales |

# Union of all keys across every locale
([ $locales[] | $t[.] | keys[] ] | unique | sort) as $all_keys |

# Gaps: keys present in at least one locale but absent in another
(
  [ $locales[] |
    . as $loc |
    ($all_keys | map(select(in($t[$loc]) | not))) as $missing |
    if ($missing | length) > 0
    then { locale: $loc, missing: $missing }
    else empty
    end
  ]
) as $gaps |

# Empty values: advisory only — some languages legitimately omit a fragment
(
  [ $locales[] |
    . as $loc |
    ([ $t[$loc] | to_entries[] | select(.value == "") | .key ] | sort) as $empty |
    if ($empty | length) > 0
    then { locale: $loc, empty: $empty }
    else empty
    end
  ]
) as $empties |

# Summary line — FAIL only on structural gaps
(
  if ($gaps | length) == 0
  then
    "[PASS] jq-translations  \($locales | length) locales × \($all_keys | length) keys — no key gaps"
  else
    "[FAIL] jq-translations  \($gaps | length) locale(s) with missing keys"
  end
),

# Gap details (FAIL cause)
($gaps[] |
  "       missing in '\(.locale)': \(.missing | length) key(s) — \(.missing[:3] | join(", "))\(if (.missing | length) > 3 then " …" else "" end)"
),

# Advisory: empty values per locale (informational)
( if ($empties | length) > 0 then
    "       info: empty-value keys (may be intentional): \( $empties | map("\(.locale)=\(.empty | length)") | join(", ") )"
  else empty
  end
)
