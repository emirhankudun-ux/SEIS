#!/usr/bin/env bun
/**
 * SEIS JavaScript code quality auditor — Bun TypeScript runtime.
 *
 * Audits apps/web/script.js for production code quality issues:
 *   1. no-eval          — eval() in non-comment code
 *   2. no-doc-write     — document.write() call
 *   3. no-unsafe-inner  — innerHTML/outerHTML with concatenation or interpolation
 *   4. no-console-log   — console.log() in production source
 *   5. no-todo          — TODO / FIXME / HACK / XXX comment markers
 *
 * Usage: bun polyglot/bun/seis_js_quality_audit.ts [--self-test]
 * Exit:  0 PASS, 1 FAIL
 */

import { existsSync, readFileSync } from "fs";
import { join } from "path";

interface Finding {
  line: number;
  rule: string;
  text: string;
}

// ---------------------------------------------------------------------------
// Predicates — each receives the raw line string
// ---------------------------------------------------------------------------

function isCommentLine(raw: string): boolean {
  return /^\s*\/\//.test(raw) || /^\s*\*/.test(raw);
}

function stripLineComment(raw: string): string {
  // Remove // comment suffix but preserve string content crudely
  return raw.replace(/\/\/.*$/, "");
}

function checkEval(raw: string): boolean {
  if (isCommentLine(raw)) return false;
  const code = stripLineComment(raw);
  // \beval\( but NOT e.g. "evaluate(" or "preeval"
  return /(?<![A-Za-z0-9_$])eval\s*\(/.test(code);
}

function checkDocWrite(raw: string): boolean {
  if (isCommentLine(raw)) return false;
  return /\bdocument\.write\s*\(/.test(stripLineComment(raw));
}

function checkUnsafeInnerHTML(raw: string): boolean {
  if (isCommentLine(raw)) return false;
  const code = stripLineComment(raw);
  // innerHTML += anything is always risky
  if (/\b(?:inner|outer)HTML\s*\+=/.test(code)) return true;
  // innerHTML = <expr> where expr contains + (concat) or ${ (interpolation)
  const assign = /\b(?:inner|outer)HTML\s*=(?!=)\s*(.+)/.exec(code);
  if (!assign) return false;
  const rhs = assign[1];
  // Allow purely static string literals: "..." or '...' or `...` with no ${
  if (/^['"`][^'"`]*['"`]\s*[;,)]*$/.test(rhs) && !rhs.includes("${")) return false;
  // Flag if there's concatenation or template interpolation
  return /\+/.test(rhs) || /\$\{/.test(rhs);
}

function checkConsoleLog(raw: string): boolean {
  // Flag console.log even inside comments (dev forgot to remove)
  return /\bconsole\.log\s*\(/.test(raw);
}

function checkTodoComment(raw: string): boolean {
  return /\/\/.*\b(?:TODO|FIXME|HACK|XXX)\b/i.test(raw) ||
         /\/\*.*\b(?:TODO|FIXME|HACK|XXX)\b/i.test(raw);
}

// ---------------------------------------------------------------------------
// Audit runner
// ---------------------------------------------------------------------------

function audit(source: string): Finding[] {
  const findings: Finding[] = [];
  const lines = source.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const n = i + 1;
    const snip = raw.trim().slice(0, 90);
    if (checkEval(raw))            findings.push({ line: n, rule: "no-eval",         text: snip });
    if (checkDocWrite(raw))        findings.push({ line: n, rule: "no-doc-write",    text: snip });
    if (checkUnsafeInnerHTML(raw)) findings.push({ line: n, rule: "no-unsafe-inner", text: snip });
    if (checkConsoleLog(raw))      findings.push({ line: n, rule: "no-console-log",  text: snip });
    if (checkTodoComment(raw))     findings.push({ line: n, rule: "no-todo",         text: snip });
  }
  return findings;
}

// ---------------------------------------------------------------------------
// Self-test
// ---------------------------------------------------------------------------

function selfTest(): boolean {
  let pass = 0, total = 0;
  const assert = (label: string, got: boolean, want: boolean = true) => {
    total++;
    if (got === want) { pass++; }
    else { console.error(`  [FAIL] self-test: ${label} (got ${got}, want ${want})`); }
  };

  // eval
  assert("eval() caught",           checkEval("const x = eval('1+1');"));
  assert("eval not in 'evaluate'",  checkEval("const evaluate = (x: number) => x * 2;"), false);
  assert("eval not in comment",      checkEval("// eval('bad')"), false);

  // document.write
  assert("document.write caught",   checkDocWrite("document.write('<p>hi</p>');"));
  assert("document.write not in comment", checkDocWrite("// document.write(x)"), false);

  // innerHTML
  assert("innerHTML += caught",     checkUnsafeInnerHTML("el.innerHTML += '<li>' + item;"));
  assert("innerHTML concat caught", checkUnsafeInnerHTML("el.innerHTML = '<b>' + name + '</b>';"));
  assert("innerHTML tmpl caught",   checkUnsafeInnerHTML("el.innerHTML = `<b>${name}</b>`;"));
  assert("innerHTML static ok",     checkUnsafeInnerHTML("el.innerHTML = '<b>OK</b>';"), false);

  // console.log
  assert("console.log caught",      checkConsoleLog("  console.log('debug', x);"));
  assert("console.error ok",        checkConsoleLog("  console.error('err');"), false);
  assert("console.warn ok",         checkConsoleLog("  console.warn('warn');"), false);

  // TODO comments
  assert("TODO caught",             checkTodoComment("// TODO: remove this"));
  assert("FIXME caught",            checkTodoComment("// FIXME: broken logic"));
  assert("HACK caught",             checkTodoComment("  /* HACK: workaround */"));
  assert("Normal comment ok",       checkTodoComment("// This validates input"), false);

  if (pass === total) {
    console.log(`[PASS] bun-js-quality  ${total}/${total} self-tests passed`);
    return true;
  }
  console.log(`[FAIL] bun-js-quality  ${pass}/${total} self-tests passed`);
  return false;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);

if (args[0] === "--self-test") {
  process.exit(selfTest() ? 0 : 1);
}

const repoRoot = process.cwd();
const jsPath = join(repoRoot, "apps", "web", "script.js");

if (!existsSync(jsPath)) {
  console.log("[FAIL] bun-js-quality  apps/web/script.js not found");
  process.exit(1);
}

const source = readFileSync(jsPath, "utf8");
const lineCount = source.split("\n").length;
const findings = audit(source);

console.log(`       auditing: apps/web/script.js (${lineCount} lines)`);

if (findings.length === 0) {
  console.log("[PASS] bun-js-quality  no code quality issues found");
} else {
  console.log(`[FAIL] bun-js-quality  ${findings.length} finding(s):`);
  for (const f of findings) {
    console.log(`       L${f.line} [${f.rule}] ${f.text}`);
  }
  process.exit(1);
}
