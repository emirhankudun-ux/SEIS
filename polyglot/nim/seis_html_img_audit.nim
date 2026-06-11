# SEIS HTML img tag completeness auditor — Nim single-file program.
#
# Reads apps/web/index.html, finds every <img ...> tag, and checks that:
#   • alt attribute is present (empty string is fine for decorative images)
#   • loading attribute is present (for resource-hinting best practice)
#
# A missing alt attribute is an accessibility failure (WCAG 1.1.1).
# A missing loading attribute is a minor advisory (lazy vs eager is fine
# either way, but the attribute should be explicitly set).
#
# Usage: nim r polyglot/nim/seis_html_img_audit.nim [--self-test] [html-file]
# Exit:  0 PASS, 1 FAIL

import strutils, os

const defaultHtml = "apps/web/index.html"

# ─── extraction ──────────────────────────────────────────────────────────────

proc extractImgTags(html: string): seq[string] =
  ## Extract all <img ...> opening tags from HTML source.
  result = @[]
  var pos = 0
  let lc = html.toLowerAscii()
  while pos < html.len:
    let start = lc.find("<img", pos)
    if start < 0: break
    # find closing >
    let finish = html.find('>', start)
    if finish < 0: break
    result.add(html[start .. finish])
    pos = finish + 1

proc hasAttr(tag: string, attrName: string): bool =
  ## True when attrName= appears inside the tag (case-insensitive).
  tag.toLowerAscii().contains(attrName.toLowerAscii() & "=")

# ─── self-tests ──────────────────────────────────────────────────────────────

proc selfTest(): bool =
  var passCount = 0
  var total     = 0

  template check(label: string, cond: bool) =
    inc total
    if cond:
      inc passCount
    else:
      echo "  [FAIL] self-test: " & label

  let html1 = """<img src="a.jpg" alt="cat" loading="lazy">"""
  let tags1 = extractImgTags(html1)
  check("single img extracted", tags1.len == 1)
  check("single img content correct", tags1[0].contains("a.jpg"))

  let html2 = """<IMG SRC="b.png" ALT="" LOADING="eager">"""
  let tags2 = extractImgTags(html2)
  check("uppercase img tag extracted", tags2.len == 1)

  let html3 = """<img src="a.jpg" alt="x"><img src="b.jpg" alt="y">"""
  let tags3 = extractImgTags(html3)
  check("two imgs extracted", tags3.len == 2)

  let html4 = """<p>no images here</p>"""
  check("no imgs in plain html", extractImgTags(html4).len == 0)

  let imgWithAlt = """<img src="x.jpg" alt="desc" loading="lazy">"""
  check("hasAttr detects alt",     hasAttr(imgWithAlt, "alt"))
  check("hasAttr detects loading", hasAttr(imgWithAlt, "loading"))

  let imgNoAlt = """<img src="x.jpg" loading="lazy">"""
  check("hasAttr returns false for missing alt", not hasAttr(imgNoAlt, "alt"))

  let imgUpper = """<IMG SRC="x.jpg" ALT="test">"""
  check("hasAttr case-insensitive", hasAttr(imgUpper, "alt"))

  # data: URI src (lazy-load placeholder)
  let dataImg = """<img class="lazy-media" src="data:image/gif;base64,abc" data-src="x.jpg" alt="">"""
  let dataTag = extractImgTags(dataImg)
  check("data: URI img extracted", dataTag.len == 1)
  check("data: URI img has alt",   hasAttr(dataTag[0], "alt"))

  let passed = passCount == total
  echo (if passed: "[PASS]" else: "[FAIL]") & " html-img-audit  " &
       $passCount & "/" & $total & " self-tests passed"
  return passed

# ─── main ────────────────────────────────────────────────────────────────────

proc main() =
  let args = commandLineParams()

  if "--self-test" in args:
    quit(if selfTest(): 0 else: 1)

  let path = if args.len > 0 and args[0] != "--self-test": args[0]
             else: defaultHtml

  if not fileExists(path):
    echo "[FAIL] html-img-audit  " & path & " not found"
    quit(1)

  let html = readFile(path)
  let tags = extractImgTags(html)

  if tags.len == 0:
    echo "[FAIL] html-img-audit  no <img> tags found in " & path
    quit(1)

  var missingAlt: seq[string] = @[]
  var missingLoading: seq[string] = @[]

  for tag in tags:
    if not hasAttr(tag, "alt"):
      missingAlt.add(tag[0 .. min(60, tag.len - 1)])
    if not hasAttr(tag, "loading"):
      missingLoading.add(tag[0 .. min(60, tag.len - 1)])

  echo "       " & path & ": " & $tags.len & " <img> tag(s) found"

  if missingAlt.len > 0:
    echo "[FAIL] html-img-audit  " & $missingAlt.len & " img(s) missing alt attribute:"
    for t in missingAlt:
      echo "       " & t & "…"
    quit(1)

  if missingLoading.len > 0:
    echo "       advisory: " & $missingLoading.len & " img(s) missing loading attribute"

  echo "[PASS] html-img-audit  all " & $tags.len & " img(s) have alt attribute"

main()
