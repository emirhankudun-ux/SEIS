import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "files-terminal-center.html"), "utf8");
const css = fs.readFileSync(path.join(root, "files-terminal-center.css"), "utf8");
const js = fs.readFileSync(path.join(root, "files-terminal-center.js"), "utf8");

test("Files + Terminal Center exposes required browser-local UX markers", () => {
  [
    "SEIS Files + Terminal Center",
    "data-seis-files-terminal=\"browser-local\"",
    "SEIS Files",
    "SEIS Terminal",
    "Recent files",
    "Safe command palette",
    "Mock vs real status",
    "commandExecuted: false",
    "sshExecuted: false",
    "filesystemMutated: false",
    "credentialRead: false",
    "<main id=\"main\"",
    "aria-live=\"polite\"",
  ].forEach((marker) => assert.ok(html.includes(marker), `missing marker: ${marker}`));
});

test("Files + Terminal Center keeps state and commands browser-local", () => {
  [
    "localStorage",
    "seis.files.terminal.center.v1",
    "seedFolders",
    "seedFiles",
    "allowedCommands",
    "Files Agent",
    "Terminal Agent",
    "Security Agent",
    "commandExecuted: false",
    "sshExecuted: false",
    "filesystemMutated: false",
    "credentialRead: false",
  ].forEach((marker) => assert.ok(js.includes(marker), `missing JS marker: ${marker}`));
});

test("Files + Terminal Center does not include host execution or secret access patterns", () => {
  const forbiddenPatterns = [
    /child_process/i,
    /\bexec\s*\(/i,
    /\bspawn\s*\(/i,
    /fetch\s*\(/i,
    /XMLHttpRequest/i,
    /WebSocket/i,
    /EventSource/i,
    /ssh\s+/i,
    /rm -rf/i,
    /OPENAI_API_KEY/i,
    /GITHUB_TOKEN/i,
    /BEGIN OPENSSH/i,
    /PRIVATE KEY/i,
  ];

  forbiddenPatterns.forEach((pattern) => {
    assert.equal(pattern.test(js), false, `forbidden pattern found: ${pattern}`);
  });
});

test("Files + Terminal Center CSS includes responsive and accessible shell rules", () => {
  [
    "prefers-reduced-motion",
    "skip-link",
    "file-grid",
    "terminal-panel",
    "@media",
    "--surface",
    "--cyan",
    "focus-visible",
  ].forEach((marker) => assert.ok(css.includes(marker), `missing CSS marker: ${marker}`));
});
