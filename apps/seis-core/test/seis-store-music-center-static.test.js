import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "store-music-center.html"), "utf8");
const css = fs.readFileSync(path.join(root, "store-music-center.css"), "utf8");
const js = fs.readFileSync(path.join(root, "store-music-center.js"), "utf8");

test("Store + Music Center exposes required marketplace and media UX markers", () => {
  [
    "SEIS Store + Music Center",
    "data-seis-store-music=\"browser-local\"",
    "SEIS Store",
    "SEIS Music",
    "Apps",
    "Plugins",
    "AI Agents",
    "Themes",
    "Developer tools",
    "Design tools",
    "AI recommendations mock/safe mode",
    "Mock vs real status",
    "paymentExecuted: false",
    "licenseIssued: false",
    "streamingStarted: false",
    "networkRequested: false",
    "<main id=\"main\"",
  ].forEach((marker) => assert.ok(html.includes(marker), `missing marker: ${marker}`));
});

test("Store + Music Center keeps state browser-local", () => {
  [
    "localStorage",
    "seis.store.music.center.v1",
    "paymentExecuted: false",
    "licenseIssued: false",
    "streamingStarted: false",
    "networkRequested: false",
    "catalog",
    "playlists",
    "tracks",
    "togglePackage",
    "playNext",
    "playPrevious",
  ].forEach((marker) => assert.ok(js.includes(marker), `missing JS marker: ${marker}`));
});

test("Store + Music Center does not include commerce, network, audio, or secret access patterns", () => {
  const forbiddenPatterns = [
    /fetch\s*\(/i,
    /XMLHttpRequest/i,
    /WebSocket/i,
    /EventSource/i,
    /navigator\.sendBeacon/i,
    /new\s+Audio\s*\(/i,
    /<audio/i,
    /stripe/i,
    /paypal/i,
    /checkout/i,
    /OPENAI_API_KEY/i,
    /GITHUB_TOKEN/i,
    /BEGIN OPENSSH/i,
    /PRIVATE KEY/i,
  ];

  forbiddenPatterns.forEach((pattern) => {
    assert.equal(pattern.test(js), false, `forbidden JS pattern found: ${pattern}`);
    assert.equal(pattern.test(html), false, `forbidden HTML pattern found: ${pattern}`);
  });
});

test("Store + Music Center CSS includes premium responsive and accessibility rules", () => {
  [
    "prefers-reduced-motion",
    "skip-link",
    "catalog-grid",
    "player-panel",
    "waveform",
    "@media",
    "focus-visible",
    "--surface",
    "--cyan",
  ].forEach((marker) => assert.ok(css.includes(marker), `missing CSS marker: ${marker}`));
});
