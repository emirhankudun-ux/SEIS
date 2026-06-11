#!/usr/bin/env kotlinc-jvm -script
// SEIS CSS font-family audit — Kotlin script.
//
// Reads apps/web/style.css and verifies every --font-* CSS custom property:
//   • Each value must include a generic-family fallback keyword
//     (serif, sans-serif, monospace, cursive, fantasy, system-ui,
//      ui-serif, ui-sans-serif, ui-monospace, ui-rounded)
//   • Catches web-font stacks that lack a system-safe fallback.
//
// Usage: kotlinc-jvm -script polyglot/kotlin/seis_css_font_audit.kts [--self-test]
// Exit:  0 PASS, 1 FAIL

import java.io.File

val GENERIC_FAMILIES = setOf(
    "serif", "sans-serif", "monospace", "cursive", "fantasy",
    "system-ui", "ui-serif", "ui-sans-serif", "ui-monospace", "ui-rounded"
)

val DEFAULT_CSS = "apps/web/style.css"

fun extractFontVars(css: String): Map<String, String> {
    val re = Regex("""(--font-[\w-]+)\s*:\s*([^;{]+);""")
    return re.findAll(css).associate { m ->
        m.groupValues[1].trim() to m.groupValues[2].trim()
    }
}

fun hasGenericFallback(value: String): Boolean {
    return value.split(",").map {
        it.trim().toLowerCase().replace(Regex("['\"]"), "")
    }.any { GENERIC_FAMILIES.contains(it) }
}

fun auditFontVars(css: String): List<String> {
    return extractFontVars(css)
        .filterValues { !hasGenericFallback(it) }
        .map { (name, value) -> "$name: '$value' — missing generic-family fallback" }
        .sorted()
}

fun selfTest(): Boolean {
    var pass  = 0
    var total = 0
    fun check(label: String, ok: Boolean) {
        total++
        if (ok) pass++
        else println("  [FAIL] self-test: $label")
    }

    check("extractFontVars finds one var",
        extractFontVars("--font-sans: 'DM Sans', sans-serif;").size == 1)

    check("extractFontVars key is --font-sans",
        extractFontVars("--font-sans: 'DM Sans', sans-serif;").containsKey("--font-sans"))

    check("extractFontVars value preserved",
        extractFontVars("--font-mono: 'DM Mono', monospace;")["--font-mono"]?.contains("monospace") == true)

    check("extractFontVars ignores non-font vars",
        !extractFontVars("--color-bg: #fff; --font-mono: 'DM Mono', monospace;").containsKey("--color-bg"))

    check("hasGenericFallback true for serif",
        hasGenericFallback("'Cormorant Garamond', Georgia, serif"))

    check("hasGenericFallback true for sans-serif",
        hasGenericFallback("'DM Sans', sans-serif"))

    check("hasGenericFallback true for monospace",
        hasGenericFallback("'DM Mono', monospace"))

    check("hasGenericFallback false when no generic",
        !hasGenericFallback("'DM Sans', Arial"))

    check("hasGenericFallback case-insensitive",
        hasGenericFallback("'DM Sans', Sans-Serif"))

    check("auditFontVars empty for good CSS",
        auditFontVars("--font-sans: 'DM Sans', sans-serif; --font-mono: 'DM Mono', monospace;").isEmpty())

    check("auditFontVars flags missing fallback",
        auditFontVars("--font-sans: 'DM Sans', Arial;").isNotEmpty())

    val passed = pass == total
    println("[${if (passed) "PASS" else "FAIL"}] css-font-audit  $pass/$total self-tests passed")
    return passed
}

val argList = args.toList()
if ("--self-test" in argList) {
    System.exit(if (selfTest()) 0 else 1)
}

val cssFile = File(DEFAULT_CSS)
if (!cssFile.exists()) {
    println("[FAIL] css-font-audit  $DEFAULT_CSS not found")
    System.exit(1)
}

val css   = cssFile.readText(Charsets.UTF_8)
val vars  = extractFontVars(css)
val fails = auditFontVars(css)

println("       $DEFAULT_CSS: ${vars.size} --font-* variable(s) checked")

if (fails.isNotEmpty()) {
    println("[FAIL] css-font-audit  ${fails.size} font variable(s) missing generic fallback:")
    fails.forEach { println("       $it") }
    System.exit(1)
} else {
    println("[PASS] css-font-audit  all ${vars.size} --font-* variable(s) have generic-family fallbacks")
}
