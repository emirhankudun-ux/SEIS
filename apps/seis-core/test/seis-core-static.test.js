import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

const root = new URL("../", import.meta.url);

test("SEIS Core shell exposes required modules", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  for (const label of ["Dashboard", "Goals", "Repositories", "Documentation", "Agents", "Architecture", "Knowledge"]) {
    assert.match(html, new RegExp(`>${label}<`));
  }
  assert.match(html, /id="command-dialog"/);
  assert.match(html, /id="settings-dialog"/);
});

test("SEIS Core script implements local workflows", async () => {
  const script = await readFile(new URL("script.js", root), "utf8");
  assert.match(script, /localStorage/);
  assert.match(script, /goal-form/);
  assert.match(script, /repositoryFilter/);
  assert.match(script, /activeAgent/);
  assert.match(script, /openCommandPalette/);
});

test("SEIS Core design system preserves required tokens", async () => {
  const css = await readFile(new URL("styles.css", root), "utf8");
  for (const token of ["--sidebar", "--accent", "--surface", "--radius"]) {
    assert.match(css, new RegExp(token));
  }
  assert.match(css, /@media \(max-width: 900px\)/);
  assert.match(css, /prefers-reduced-motion/);
});
