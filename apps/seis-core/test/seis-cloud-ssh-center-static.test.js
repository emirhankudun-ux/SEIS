import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

const root = new URL("../", import.meta.url);
const read = (file) => readFile(new URL(file, root), "utf8");
const repoRoot = new URL("../../../", import.meta.url);
const readRepo = (file) => readFile(new URL(file, repoRoot), "utf8");

test("SEIS Cloud SSH Center exposes explicit safe states", async () => {
  const html = await read("cloud-ssh-center.html");
  for (const marker of [
    "SEIS Cloud / SSH Center",
    "data-seis-cloud-ssh=\"browser-local-readiness\"",
    "No live SSH - metadata-only control plane",
    "Cloud surfaces",
    "Safety state",
    "connected",
    "mock",
    "disabled",
    "planned",
    "unknown",
    "Credential read",
    "Server / port",
    "unchanged placeholder"
  ]) {
    assert.match(html, new RegExp(marker));
  }
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /<main id="main"/);
});

test("SEIS Cloud SSH Center script stays browser-local and non-mutating", async () => {
  const script = await read("cloud-ssh-center.js");
  for (const marker of [
    "localStorage",
    "seis.cloud.ssh.center.v1",
    "remoteConnected: false",
    "sshExecuted: false",
    "deployExecuted: false",
    "credentialRead: false",
    "secretStored: false",
    "serverPortChanged: false",
    "rollbackRequired: true"
  ]) {
    assert.match(script, new RegExp(marker));
  }
  for (const forbidden of [
    "fetch(",
    "XMLHttpRequest",
    "WebSocket",
    "EventSource",
    "ssh ",
    "scp ",
    "rsync ",
    "OPENAI_API_KEY",
    "GITHUB_TOKEN",
    "BEGIN OPENSSH",
    "PRIVATE KEY"
  ]) {
    assert.equal(script.includes(forbidden), false, `${forbidden} must not appear`);
  }
});

test("SEIS Cloud SSH Center styles include responsive and reduced-motion support", async () => {
  const css = await read("cloud-ssh-center.css");
  for (const marker of ["prefers-reduced-motion", "skip-link", "status-grid", "surface-grid", "evidence-log", "@media (max-width: 940px)", "--cyan", "--blue", "--radius"]) {
    assert.match(css, new RegExp(marker.replace(/[()]/g, "\\$&")));
  }
});

test("SEIS Cloud SSH Center fixture stays synchronized with safe demo states", async () => {
  const fixturePath = "content/development/seis-cloud-ssh-center-readiness.json";
  const fixture = JSON.parse(await readRepo(fixturePath));
  const script = await read("cloud-ssh-center.js");
  assert.equal(fixture.qualityGate, "npm run check:seis-cloud-ssh-center-readiness");
  assert.equal(fixture.liveExecutionAllowed, false);
  assert.equal(fixture.remoteConnectedByDefault, false);
  assert.equal(fixture.sshExecutedByDefault, false);
  assert.equal(fixture.deployExecutedByDefault, false);
  assert.equal(fixture.credentialReadByDefault, false);
  assert.equal(fixture.serverPortChangedByDefault, false);
  assert.equal(fixture.surfaces.length, 10);
  for (const surface of fixture.surfaces) {
    assert.equal(surface.remoteMutationAllowed, false);
    assert.match(script, new RegExp(surface.name));
    assert.match(script, new RegExp(surface.status));
  }
});
