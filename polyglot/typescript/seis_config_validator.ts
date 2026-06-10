#!/usr/bin/env ts-node
// SEIS TypeScript config validator — strict type-checking for JSON configs.
//
// Validates manifest.json (PWA spec), site-config.json, and locale parity
// in translations.json. TypeScript interfaces make invalid states a compile
// error; the runtime layer checks values that types alone cannot enforce
// (hex format, icon dimensions, locale key counts).
//
// Usage: ts-node polyglot/typescript/seis_config_validator.ts [--self-test]
// Exit:  0 PASS, 1 FAIL, 2 wrong invocation

/* --- Node globals without @types/node --- */
declare const require: (m: string) => any;
declare const process: {
  argv: string[];
  exit: (code: number) => never;
  cwd: () => string;
};

const fs = require("fs") as {
  readFileSync: (path: string, enc: string) => string;
  existsSync: (path: string) => boolean;
};
const path = require("path") as {
  join: (...parts: string[]) => string;
  resolve: (...parts: string[]) => string;
};

/* --- Domain interfaces --- */

interface ManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: string;
}

interface WebManifest {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  display: "standalone" | "fullscreen" | "minimal-ui" | "browser";
  background_color: string;
  theme_color: string;
  lang: string;
  icons: ManifestIcon[];
  categories?: string[];
}

interface SiteConfig {
  contactEndpoint: string;
  contactEmail: string;
}

type LocaleMap = Record<string, Record<string, string>>;

/* --- Validation helpers --- */

interface Finding {
  file: string;
  message: string;
}

const HEX_COLOR = /^#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?$/;
const EMAIL_RE  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ICON_SIZE = /^\d+x\d+$/;

function validateManifest(m: WebManifest, _iconDir: string): Finding[] {
  const out: Finding[] = [];
  const f = (msg: string) => out.push({ file: "manifest.json", message: msg });

  if (!m.name || m.name.trim().length === 0)          f("name is empty");
  if (!m.short_name || m.short_name.trim().length === 0) f("short_name is empty");
  if (!m.start_url)                                    f("start_url missing");
  if (!HEX_COLOR.test(m.background_color))            f(`background_color '${m.background_color}' is not a valid hex color`);
  if (!HEX_COLOR.test(m.theme_color))                 f(`theme_color '${m.theme_color}' is not a valid hex color`);
  if (!m.lang || m.lang.trim().length === 0)           f("lang is empty");

  if (!Array.isArray(m.icons) || m.icons.length === 0) {
    f("icons array is empty or missing");
  } else {
    for (const icon of m.icons) {
      if (!icon.src || icon.src.trim().length === 0)  f("icon missing src");
      if (!ICON_SIZE.test(icon.sizes))                f(`icon '${icon.src}' has invalid sizes format '${icon.sizes}'`);
      if (!icon.type.startsWith("image/"))            f(`icon '${icon.src}' has invalid type '${icon.type}'`);
    }
  }
  return out;
}

function validateSiteConfig(cfg: SiteConfig): Finding[] {
  const out: Finding[] = [];
  const f = (msg: string) => out.push({ file: "site-config.json", message: msg });

  if (typeof cfg.contactEmail !== "string") {
    f("contactEmail field missing");
  } else if (cfg.contactEmail.length > 0 && !EMAIL_RE.test(cfg.contactEmail)) {
    f(`contactEmail '${cfg.contactEmail}' is not a valid email address`);
  }
  if (typeof cfg.contactEndpoint !== "string") {
    f("contactEndpoint field missing");
  }
  return out;
}

function validateTranslations(t: LocaleMap): Finding[] {
  const out: Finding[] = [];
  const f = (msg: string) => out.push({ file: "translations.json", message: msg });

  const locales = Object.keys(t);
  if (locales.length === 0) { f("no locales found"); return out; }

  const keySets = locales.map((l) => new Set(Object.keys(t[l])));
  const union   = new Set<string>();
  keySets.forEach((s) => s.forEach((k) => union.add(k)));

  for (const locale of locales) {
    const missing = [...union].filter((k) => !keySets[locales.indexOf(locale)].has(k));
    if (missing.length > 0)
      f(`locale '${locale}' missing ${missing.length} key(s): ${missing.slice(0, 3).join(", ")}${missing.length > 3 ? "…" : ""}`);
  }

  const counts = locales.map((l) => Object.keys(t[l]).length);
  const min = Math.min(...counts), max = Math.max(...counts);
  if (max > min) f(`locale key-count mismatch: min=${min} max=${max}`);
  return out;
}

/* --- Self-test (pure TypeScript — no file I/O) --- */

function selfTest(): boolean {
  let passed = 0;
  const assert = (label: string, ok: boolean) => {
    if (ok) { passed++; return; }
    console.error(`  [FAIL] self-test: ${label}`);
  };

  // Valid manifest passes
  const goodManifest: WebManifest = {
    name: "Test", short_name: "T", description: "d",
    start_url: "/", display: "standalone",
    background_color: "#0a0a0a", theme_color: "#c8a96e",
    lang: "en",
    icons: [{ src: "icon.png", sizes: "192x192", type: "image/png" }],
  };
  assert("valid manifest has 0 findings", validateManifest(goodManifest, "").length === 0);

  // Bad hex color
  const badColor = { ...goodManifest, background_color: "black" };
  assert("bad hex color is caught", validateManifest(badColor, "").length > 0);

  // Empty name
  const noName = { ...goodManifest, name: "" };
  assert("empty name is caught", validateManifest(noName, "").length > 0);

  // Bad icon sizes format
  const badIcon: WebManifest = {
    ...goodManifest,
    icons: [{ src: "i.png", sizes: "192", type: "image/png" }],
  };
  assert("bad icon sizes caught", validateManifest(badIcon, "").length > 0);

  // Valid site config
  const goodCfg: SiteConfig = { contactEndpoint: "", contactEmail: "a@b.com" };
  assert("valid site config passes", validateSiteConfig(goodCfg).length === 0);

  // Empty email is allowed (optional field)
  const emptyCfg: SiteConfig = { contactEndpoint: "", contactEmail: "" };
  assert("empty email is allowed", validateSiteConfig(emptyCfg).length === 0);

  // Bad email
  const badEmail: SiteConfig = { contactEndpoint: "", contactEmail: "not-an-email" };
  assert("bad email is caught", validateSiteConfig(badEmail).length > 0);

  // Locale parity: balanced
  const balanced: LocaleMap = { en: { a: "A", b: "B" }, tr: { a: "A", b: "B" } };
  assert("balanced locales pass", validateTranslations(balanced).length === 0);

  // Locale parity: missing key
  const unbalanced: LocaleMap = { en: { a: "A", b: "B" }, tr: { a: "A" } };
  assert("missing key is caught", validateTranslations(unbalanced).length > 0);

  const total = 9;
  if (passed === total) {
    console.log(`[PASS] ts-config-validator  ${total}/${total} self-tests passed`);
    return true;
  }
  console.error(`[FAIL] ts-config-validator  ${passed}/${total} self-tests passed`);
  return false;
}

/* --- Main --- */

function main(): void {
  const args = process.argv.slice(2);
  const selfTestMode = args.includes("--self-test");

  if (selfTestMode) {
    process.exit(selfTest() ? 0 : 1);
  }

  const webRoot = path.resolve(process.cwd(), "apps/web");
  const findings: Finding[] = [];

  // manifest.json
  const manifestPath = path.join(webRoot, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    findings.push({ file: "manifest.json", message: "file not found" });
  } else {
    const m = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as WebManifest;
    findings.push(...validateManifest(m, webRoot));
  }

  // site-config.json
  const cfgPath = path.join(webRoot, "site-config.json");
  if (!fs.existsSync(cfgPath)) {
    findings.push({ file: "site-config.json", message: "file not found" });
  } else {
    const c = JSON.parse(fs.readFileSync(cfgPath, "utf8")) as SiteConfig;
    findings.push(...validateSiteConfig(c));
  }

  // translations.json
  const transPath = path.join(webRoot, "translations.json");
  if (!fs.existsSync(transPath)) {
    findings.push({ file: "translations.json", message: "file not found" });
  } else {
    const t = JSON.parse(fs.readFileSync(transPath, "utf8")) as LocaleMap;
    findings.push(...validateTranslations(t));
  }

  if (findings.length === 0) {
    console.log("[PASS] ts-config-validator  manifest + site-config + translations OK");
    process.exit(0);
  }

  console.log(`[FAIL] ts-config-validator  ${findings.length} finding(s):`);
  for (const f of findings) {
    console.log(`       ${f.file}: ${f.message}`);
  }
  process.exit(1);
}

main();
