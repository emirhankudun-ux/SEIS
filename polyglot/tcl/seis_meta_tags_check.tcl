#!/usr/bin/env tclsh
# SEIS HTML meta-tag completeness checker — Tcl 8.6
#
# Reads apps/web/index.html and verifies the required meta tags for SEO,
# social sharing, and PWA are present:
#   <title>, meta description, meta viewport, link canonical
#   Open Graph: og:title / og:description / og:url / og:image
#   Twitter Card: twitter:card / twitter:title / twitter:description / twitter:image
#
# Usage: tclsh polyglot/tcl/seis_meta_tags_check.tcl [--self-test]
# Exit:  0 PASS, 1 FAIL

# ─── matchers ─────────────────────────────────────────────────────────────────

proc has_title {html} {
    regexp -nocase -- {<title>[^<]+</title>} $html
}

# <meta name="NAME" content="..."> or reversed attribute order
proc has_meta_name {html name} {
    set p1 [format {<meta[^>]+name=['"]%s['"][^>]+content=['"][^'"]+['"][^>]*>} $name]
    set p2 [format {<meta[^>]+content=['"][^'"]+['"][^>]+name=['"]%s['"][^>]*>} $name]
    expr { [regexp -nocase -- $p1 $html] || [regexp -nocase -- $p2 $html] }
}

# <meta property="og:PROP" content="..."> or reversed
proc has_og {html prop} {
    set p1 [format {<meta[^>]+property=['"]og:%s['"][^>]+content=['"][^'"]+['"][^>]*>} $prop]
    set p2 [format {<meta[^>]+content=['"][^'"]+['"][^>]+property=['"]og:%s['"][^>]*>} $prop]
    expr { [regexp -nocase -- $p1 $html] || [regexp -nocase -- $p2 $html] }
}

# <meta name="twitter:NAME" content="..."> or reversed
proc has_twitter {html name} {
    set p1 [format {<meta[^>]+name=['"]twitter:%s['"][^>]+content=['"][^'"]+['"][^>]*>} $name]
    set p2 [format {<meta[^>]+content=['"][^'"]+['"][^>]+name=['"]twitter:%s['"][^>]*>} $name]
    expr { [regexp -nocase -- $p1 $html] || [regexp -nocase -- $p2 $html] }
}

# <link rel="canonical" href="...">
proc has_canonical {html} {
    regexp -nocase -- {<link[^>]+rel=['"]canonical['"][^>]+href=['"][^'"]+['"][^>]*>} $html
}

# ─── audit ────────────────────────────────────────────────────────────────────

proc audit_meta {html} {
    set findings {}

    if {![has_title $html]}                    { lappend findings "missing: title" }
    if {![has_meta_name $html description]}    { lappend findings "missing: meta description" }
    if {![has_meta_name $html viewport]}       { lappend findings "missing: meta viewport" }
    if {![has_canonical $html]}                { lappend findings "missing: link canonical" }
    if {![has_og $html title]}                 { lappend findings "missing: og:title" }
    if {![has_og $html description]}           { lappend findings "missing: og:description" }
    if {![has_og $html url]}                   { lappend findings "missing: og:url" }
    if {![has_og $html image]}                 { lappend findings "missing: og:image" }
    if {![has_twitter $html card]}             { lappend findings "missing: twitter:card" }
    if {![has_twitter $html title]}            { lappend findings "missing: twitter:title" }
    if {![has_twitter $html description]}      { lappend findings "missing: twitter:description" }
    if {![has_twitter $html image]}            { lappend findings "missing: twitter:image" }

    set total 12
    set missing_count [llength $findings]
    return [dict create \
        ok       [expr {$missing_count == 0}] \
        findings $findings \
        pass     [expr {$total - $missing_count}] \
        total    $total]
}

# ─── self-test ────────────────────────────────────────────────────────────────

proc self_test {} {
    set pass 0
    set total 0

    set good {
        <title>Test Site — Designer</title>
        <meta name="description" content="A portfolio.">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="canonical" href="https://example.com/">
        <meta property="og:title" content="Test Site">
        <meta property="og:description" content="Portfolio">
        <meta property="og:url" content="https://example.com/">
        <meta property="og:image" content="https://example.com/og.jpg">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="Test Site">
        <meta name="twitter:description" content="Portfolio">
        <meta name="twitter:image" content="https://example.com/og.jpg">
    }

    # full good set passes
    set r [audit_meta $good]
    if {[dict get $r ok]} { incr pass }
    incr total

    # 12 checks run
    if {[dict get $r total] == 12} { incr pass }
    incr total

    # missing title detected
    set no_title {<meta name="description" content="x">}
    set r2 [audit_meta $no_title]
    if {![dict get $r2 ok]} { incr pass }
    incr total

    # several missing
    if {[dict get $r2 pass] < [dict get $r2 total]} { incr pass }
    incr total

    # individual matchers
    if {[has_title {<title>Hi</title>}]}               { incr pass }; incr total
    if {![has_title {<h1>Hi</h1>}]}                   { incr pass }; incr total
    if {[has_meta_name {<meta name="description" content="hi">} description]} { incr pass }; incr total
    if {[has_og {<meta property="og:title" content="T">} title]}   { incr pass }; incr total
    if {[has_twitter {<meta name="twitter:card" content="summary">} card]} { incr pass }; incr total
    if {[has_canonical {<link rel="canonical" href="https://x.com/">}]} { incr pass }; incr total

    if {$pass == $total} {
        puts "\[PASS\] tcl-meta-tags  $total/$total self-tests passed"
        return 1
    }
    puts "\[FAIL\] tcl-meta-tags  $pass/$total self-tests passed"
    return 0
}

# ─── main ─────────────────────────────────────────────────────────────────────

if {[lindex $argv 0] eq "--self-test"} {
    exit [expr {[self_test] ? 0 : 1}]
}

set html_path "apps/web/index.html"

if {![file exists $html_path]} {
    puts "\[FAIL\] tcl-meta-tags  $html_path not found"
    exit 1
}

set f [open $html_path r]
fconfigure $f -encoding utf-8
set html [read $f]
close $f

set r [audit_meta $html]
set bytes [string length $html]

puts "       checking: $html_path ($bytes bytes)"

if {[dict get $r ok]} {
    set np [dict get $r pass]
    set nt [dict get $r total]
    puts "\[PASS\] tcl-meta-tags  $np/$nt required meta tags present"
} else {
    set findings [dict get $r findings]
    set nf [llength $findings]
    puts "\[FAIL\] tcl-meta-tags  $nf missing tag(s):"
    foreach f $findings {
        puts "       $f"
    }
    exit 1
}
