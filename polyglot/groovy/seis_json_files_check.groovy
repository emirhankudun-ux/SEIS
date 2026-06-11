#!/usr/bin/env groovy
// SEIS JSON files validator — Groovy script.
//
// Parses every JSON file under apps/web/ and reports any that fail to parse.
// Uses Groovy's built-in JsonSlurper (no extra dependencies).
// Also verifies expected top-level keys in the three well-known files:
//   manifest.json  — must have "name", "icons", "start_url"
//   site-config.json — must have "contactEndpoint", "contactEmail"
//   translations.json — must have keys "tr", "en", "fr", "it", "de"
//
// Usage: groovy polyglot/groovy/seis_json_files_check.groovy [--self-test]
// Exit:  0 PASS, 1 FAIL

import groovy.json.JsonSlurper

def DEFAULT_WEB_DIR = "apps/web"

// ─── helpers ─────────────────────────────────────────────────────────────────

def tryParse(String text) {
    try {
        new JsonSlurper().parseText(text)
        return null  // no error
    } catch (Exception e) {
        return e.message ?: "parse error"
    }
}

def checkManifest(parsed) {
    def missing = ["name", "icons", "start_url"].findAll { !parsed.containsKey(it) }
    return missing.isEmpty() ? null : "missing keys: ${missing.join(', ')}"
}

def checkSiteConfig(parsed) {
    def missing = ["contactEndpoint", "contactEmail"].findAll { !parsed.containsKey(it) }
    return missing.isEmpty() ? null : "missing keys: ${missing.join(', ')}"
}

def checkTranslations(parsed) {
    def missing = ["tr", "en", "fr", "it", "de"].findAll { !parsed.containsKey(it) }
    return missing.isEmpty() ? null : "missing locales: ${missing.join(', ')}"
}

// ─── self-tests ───────────────────────────────────────────────────────────────

def selfTest() {
    def pass = 0
    def total = 0
    def check = { label, ok ->
        total++
        if (ok) {
            pass++
        } else {
            println "  [FAIL] self-test: ${label}"
        }
    }

    // tryParse
    check("valid JSON parses OK",       tryParse('{"a":1}') == null)
    check("invalid JSON returns error", tryParse('{bad json}') != null)
    check("empty object parses OK",     tryParse('{}') == null)
    check("array parses OK",            tryParse('[1,2,3]') == null)

    // checkManifest
    def goodManifest = [name: "SEIS", icons: [], start_url: "/"]
    check("checkManifest passes good data", checkManifest(goodManifest) == null)
    def badManifest = [name: "SEIS"]
    def manifestErr = checkManifest(badManifest)
    check("checkManifest detects missing icons",    manifestErr?.contains("icons"))
    check("checkManifest detects missing start_url", manifestErr?.contains("start_url"))

    // checkTranslations
    def goodTrans = [tr: [:], en: [:], fr: [:], it: [:], de: [:]]
    check("checkTranslations passes good data", checkTranslations(goodTrans) == null)
    def badTrans = [tr: [:], en: [:]]
    def transErr = checkTranslations(badTrans)
    check("checkTranslations detects missing locales", transErr?.contains("fr"))

    // checkSiteConfig
    def goodConfig = [contactEndpoint: "", contactEmail: "a@b.com"]
    check("checkSiteConfig passes good data", checkSiteConfig(goodConfig) == null)
    check("checkSiteConfig detects missing fields", checkSiteConfig([:]) != null)

    def passed = pass == total
    println "[${passed ? 'PASS' : 'FAIL'}] json-files-check  ${pass}/${total} self-tests passed"
    return passed
}

// ─── main ─────────────────────────────────────────────────────────────────────

if ("--self-test" in args) {
    System.exit(selfTest() ? 0 : 1)
}

def webDir = new File(DEFAULT_WEB_DIR)
if (!webDir.exists()) {
    println "[FAIL] json-files-check  ${DEFAULT_WEB_DIR} not found"
    System.exit(1)
}

def jsonFiles = webDir.listFiles({ f -> f.name.endsWith(".json") } as FileFilter)?.sort { it.name }
if (!jsonFiles) {
    println "[FAIL] json-files-check  no .json files found in ${DEFAULT_WEB_DIR}"
    System.exit(1)
}

def failures = []

jsonFiles.each { file ->
    def text   = file.text
    def parsed = null
    def parseErr = tryParse(text)
    if (parseErr) {
        failures << "${file.name}: ${parseErr}"
        return
    }
    parsed = new JsonSlurper().parseText(text)

    def structErr = null
    switch (file.name) {
        case "manifest.json":    structErr = checkManifest(parsed); break
        case "site-config.json": structErr = checkSiteConfig(parsed); break
        case "translations.json": structErr = checkTranslations(parsed); break
    }
    if (structErr) {
        failures << "${file.name}: ${structErr}"
    }
}

println "       ${DEFAULT_WEB_DIR}: ${jsonFiles.size()} JSON file(s) checked"

if (failures) {
    println "[FAIL] json-files-check  ${failures.size()} file(s) failed:"
    failures.each { println "       ${it}" }
    System.exit(1)
} else {
    println "[PASS] json-files-check  all ${jsonFiles.size()} JSON file(s) valid"
}
