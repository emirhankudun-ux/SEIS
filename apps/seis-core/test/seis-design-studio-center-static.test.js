import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "design-studio-center.html"), "utf8");
const css = fs.readFileSync(path.join(root, "design-studio-center.css"), "utf8");
const js = fs.readFileSync(path.join(root, "design-studio-center.js"), "utf8");

test("Design Studio Center exposes required design-tool UX markers", () => {
  [
    "SEIS Design Studio Center",
    "data-seis-design-studio=\"browser-local\"",
    "Canvas",
    "Design tokens",
    "Typography scale",
    "Accent color",
    "Component cards",
    "Prototype preview",
    "AI design assistant mock/safe mode",
    "Mock vs real status",
    "providerCallStarted: false",
    "assetUploaded: false",
    "exportWritten: false",
    "networkRequested: false",
    "<main id=\"main\"",
    "aria-live=\"polite\"",
  ].forEach((marker) => assert.ok(html.includes(marker), `missing HTML marker: ${marker}`));
});

test("Design Studio Center keeps design state browser-local", () => {
  [
    "localStorage",
    "seis.design.studio.center.v1",
    "providerCallStarted: false",
    "assetUploaded: false",
    "exportWritten: false",
    "networkRequested: false",
    "layers",
    "components",
    "suggestions",
    "saveSnapshot",
    "prepareExport",
    "applyAiSuggestion",
  ].forEach((marker) => assert.ok(js.includes(marker), `missing JS marker: ${marker}`));
});

test("Design Studio Center does not include network, provider, upload, or secret access patterns", () => {
  const forbiddenPatterns = [
    /fetch\s*\(/i,
    /XMLHttpRequest/i,
    /WebSocket/i,
    /EventSource/i,
    /navigator\.sendBeacon/i,
    /OPENAI_API_KEY/i,
    /GITHUB_TOKEN/i,
    /BEGIN OPENSSH/i,
    /PRIVATE KEY/i,
    /new\s+File\s*\(/i,
    /new\s+Blob\s*\(/i,
  ];

  forbiddenPatterns.forEach((pattern) => {
    assert.equal(pattern.test(js), false, `forbidden JS pattern found: ${pattern}`);
    assert.equal(pattern.test(html), false, `forbidden HTML pattern found: ${pattern}`);
  });
});

test("Design Studio Center CSS includes responsive, accessible, and premium studio rules", () => {
  [
    "prefers-reduced-motion",
    "skip-link",
    "canvas-stage",
    "prototype-card",
    "component-grid",
    "token-grid",
    "@media",
    "focus-visible",
    "--surface",
    "--accent",
  ].forEach((marker) => assert.ok(css.includes(marker), `missing CSS marker: ${marker}`));
});
