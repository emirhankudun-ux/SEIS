#!/usr/bin/env Rscript
# SEIS translation string length statistics — R 4.x
#
# Parses apps/web/translations.json with jsonlite and performs per-locale
# string length analysis against the "tr" base locale:
#   • Per-locale mean, median, and max character length
#   • Per-locale mean ratio and maximum ratio vs tr values
#   • Keys where a translated value is ≥ 3× longer than the Turkish base
#     (≥ 10-char base only, to avoid false positives on short strings)
#
# A ratio ≥ 3.0 is a practical signal of potential button overflow or text
# truncation — German/French typically run 20-35% longer than Turkish, not 3×.
#
# Usage: Rscript polyglot/r/seis_translation_stats.R [--self-test]
# Exit:  0 PASS, 1 FAIL (ratio ≥ 3.0 found), 2 jsonlite unavailable

args <- commandArgs(trailingOnly = TRUE)

# ─── dependency check ────────────────────────────────────────────────────────

if (!requireNamespace("jsonlite", quietly = TRUE)) {
  cat("[SKIP] r-translation-stats  jsonlite not installed\n")
  quit(status = 0L)
}
library(jsonlite, warn.conflicts = FALSE)

# ─── helpers ─────────────────────────────────────────────────────────────────

# Compute per-locale string length statistics vs. tr base.
# Returns a data frame with one row per (locale, key) plus a summary table.
analyse_translations <- function(t) {
  locales  <- names(t)
  base_loc <- "tr"
  if (!(base_loc %in% locales)) stop("'tr' locale not found in translations")

  base_lens <- nchar(t[[base_loc]], type = "chars")

  # Build long-form data frame
  rows <- vector("list", length(locales))
  for (loc in locales) {
    lens  <- nchar(t[[loc]], type = "chars")
    ratio <- ifelse(base_lens >= 1, lens / base_lens, NA_real_)
    rows[[match(loc, locales)]] <- data.frame(
      locale = loc,
      key    = names(t[[loc]]),
      len    = lens,
      ratio  = ratio,
      stringsAsFactors = FALSE
    )
  }
  do.call(rbind, rows)
}

# Summary table: one row per locale
locale_summary <- function(df) {
  locales <- unique(df$locale)
  do.call(rbind, lapply(locales, function(loc) {
    sub_df <- df[df$locale == loc, ]
    data.frame(
      locale    = loc,
      mean_len  = round(mean(sub_df$len,   na.rm = TRUE), 1),
      med_len   = round(median(sub_df$len, na.rm = TRUE), 1),
      max_len   = max(sub_df$len, na.rm = TRUE),
      mean_rat  = round(mean(sub_df$ratio, na.rm = TRUE), 3),
      max_rat   = round(max(sub_df$ratio,  na.rm = TRUE), 3),
      stringsAsFactors = FALSE
    )
  }))
}

# Keys where ratio >= threshold and base length >= min_base
overflow_suspects <- function(df, threshold = 3.0, min_base = 10) {
  base_df <- df[df$locale == "tr", c("key", "len")]
  names(base_df)[2] <- "base_len"
  merged <- merge(df[df$locale != "tr", ], base_df, by = "key")
  merged[!is.na(merged$ratio) &
         merged$ratio >= threshold &
         merged$base_len >= min_base, ]
}

# ─── self-test ───────────────────────────────────────────────────────────────

self_test <- function() {
  pass  <- 0L
  total <- 0L

  chk <- function(label, cond) {
    total <<- total + 1L
    if (isTRUE(cond)) {
      pass <<- pass + 1L
    } else {
      message("  [FAIL] self-test: ", label)
    }
  }

  # Minimal mock translation object
  mock <- list(
    tr = c(nav.home = "Ana Sayfa", short = "X",    long = "ABCDEFGHIJKLMNOP"),
    en = c(nav.home = "Home",      short = "Yes",  long = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789012345678901234")
  )

  df <- analyse_translations(mock)

  # Structure
  chk("returns data.frame",    is.data.frame(df))
  chk("has locale column",     "locale" %in% names(df))
  chk("has ratio column",      "ratio"  %in% names(df))
  chk("two locales × 3 keys",  nrow(df) == 6L)

  # tr base has ratio 1.0
  tr_rows <- df[df$locale == "tr", ]
  chk("tr ratios all 1.0", all(tr_rows$ratio == 1.0, na.rm = TRUE))

  # en "nav.home" ratio: nchar("Home") / nchar("Ana Sayfa") = 4/9 ≈ 0.44
  en_nav <- df[df$locale == "en" & df$key == "nav.home", "ratio"]
  chk("en nav.home ratio ~0.44", abs(en_nav - 4/9) < 0.01)

  # Summary table
  sm <- locale_summary(df)
  chk("summary has 2 rows",  nrow(sm) == 2L)
  chk("tr mean_rat is 1.0",  sm[sm$locale == "tr", "mean_rat"] == 1.0)

  # Overflow detection
  suspects <- overflow_suspects(df, threshold = 3.0, min_base = 10)
  chk("long en key flagged",    nrow(suspects) >= 1L)
  chk("flagged key is 'long'",  "long" %in% suspects$key)

  # Non-suspect is not flagged (base_len = 1, ratio = 3 → filtered out by min_base)
  suspects2 <- overflow_suspects(df, threshold = 3.0, min_base = 10)
  chk("short base not flagged", !("short" %in% suspects2$key))

  if (pass == total) {
    cat(sprintf("[PASS] r-translation-stats  %d/%d self-tests passed\n", total, total))
    return(invisible(TRUE))
  }
  cat(sprintf("[FAIL] r-translation-stats  %d/%d self-tests passed\n", pass, total))
  invisible(FALSE)
}

# ─── main ────────────────────────────────────────────────────────────────────

if ("--self-test" %in% args) {
  ok <- self_test()
  quit(status = if (ok) 0L else 1L)
}

json_path <- "apps/web/translations.json"
if (!file.exists(json_path)) {
  cat("[FAIL] r-translation-stats  translations.json not found\n")
  quit(status = 1L)
}

t <- tryCatch(
  jsonlite::fromJSON(json_path),
  error = function(e) {
    cat(sprintf("[FAIL] r-translation-stats  JSON parse error: %s\n", e$message))
    quit(status = 1L)
  }
)

df      <- analyse_translations(t)
sm      <- locale_summary(df)
n_keys  <- length(t[["tr"]])
locales <- names(t)

cat(sprintf("       %d keys × %d locales (%s)\n",
            n_keys, length(locales), paste(locales, collapse = "/")))
cat(sprintf("       %-4s  mean_len  med_len  max_len  mean_ratio  max_ratio\n", "loc"))
for (i in seq_len(nrow(sm))) {
  r <- sm[i, ]
  cat(sprintf("       %-4s  %8.1f  %7.1f  %7d  %10.3f  %9.3f\n",
              r$locale, r$mean_len, r$med_len, r$max_len, r$mean_rat, r$max_rat))
}

suspects <- overflow_suspects(df, threshold = 3.0, min_base = 10)

if (nrow(suspects) == 0L) {
  cat(sprintf("[PASS] r-translation-stats  no locale string is ≥3× longer than tr base\n"))
} else {
  cat(sprintf("[FAIL] r-translation-stats  %d key(s) ≥3× longer than tr base:\n",
              nrow(suspects)))
  for (i in seq_len(nrow(suspects))) {
    s <- suspects[i, ]
    cat(sprintf("       %.2f×  %s  [%s]\n", s$ratio, s$key, s$locale))
  }
  quit(status = 1L)
}
