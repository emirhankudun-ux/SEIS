import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";

import { resolveRepoRoot, resolveWebRoot, resolveInside } from "../src/lib/repo.mjs";

let tmpRoot;

function makeTmpRoot(files = {}) {
  tmpRoot = path.join(tmpdir(), `seis-repo-test-${process.pid}-${Date.now()}`);
  mkdirSync(tmpRoot, { recursive: true });
  for (const [name, content] of Object.entries(files)) {
    const abs = path.join(tmpRoot, name);
    mkdirSync(path.dirname(abs), { recursive: true });
    writeFileSync(abs, content, "utf8");
  }
  return tmpRoot;
}

afterEach(() => {
  if (tmpRoot) rmSync(tmpRoot, { recursive: true, force: true });
  tmpRoot = undefined;
  delete process.env.SEIS_REPO_ROOT;
  delete process.env.SEIS_WEB_ROOT;
});

describe("resolveInside — path traversal guard", () => {
  it("returns the absolute path for a safe relative path", () => {
    makeTmpRoot();
    const abs = resolveInside(tmpRoot, "apps/web/index.html");
    assert.equal(abs, path.join(tmpRoot, "apps", "web", "index.html"));
  });

  it("allows the root itself", () => {
    makeTmpRoot();
    assert.equal(resolveInside(tmpRoot, "."), tmpRoot);
  });

  it("throws on ../ escape", () => {
    makeTmpRoot();
    assert.throws(() => resolveInside(tmpRoot, "../outside.txt"), /escapes repository root/);
  });

  it("throws on deep ../../ escape", () => {
    makeTmpRoot();
    assert.throws(() => resolveInside(tmpRoot, "apps/../../../../etc/passwd"), /escapes repository root/);
  });

  it("throws on absolute path outside the root", () => {
    makeTmpRoot();
    assert.throws(() => resolveInside(tmpRoot, "/etc/passwd"), /escapes repository root/);
  });

  it("allows an absolute path that is inside the root", () => {
    makeTmpRoot();
    const inside = path.join(tmpRoot, "apps", "web");
    assert.equal(resolveInside(tmpRoot, inside), inside);
  });
});

describe("resolveRepoRoot", () => {
  it("honours SEIS_REPO_ROOT", () => {
    makeTmpRoot();
    process.env.SEIS_REPO_ROOT = tmpRoot;
    assert.equal(resolveRepoRoot("/somewhere/else"), tmpRoot);
  });

  it("walks up to the directory containing .git", () => {
    makeTmpRoot({ ".git/HEAD": "ref: refs/heads/main" });
    const nested = path.join(tmpRoot, "packages", "seis-ai", "src");
    mkdirSync(nested, { recursive: true });
    assert.equal(resolveRepoRoot(nested), tmpRoot);
  });

  it("falls back to startDir when no .git is found", () => {
    makeTmpRoot();
    // tmpdir ancestry has no .git
    assert.equal(resolveRepoRoot(tmpRoot), tmpRoot);
  });
});

describe("resolveWebRoot", () => {
  it("honours SEIS_WEB_ROOT", () => {
    makeTmpRoot();
    process.env.SEIS_WEB_ROOT = tmpRoot;
    assert.equal(resolveWebRoot("/ignored"), tmpRoot);
  });

  it("finds apps/web when translations.json lives there", () => {
    makeTmpRoot({ "apps/web/translations.json": "{}" });
    assert.equal(resolveWebRoot(tmpRoot), path.join(tmpRoot, "apps", "web"));
  });

  it("falls back to the repo root when it holds translations.json", () => {
    makeTmpRoot({ "translations.json": "{}" });
    assert.equal(resolveWebRoot(tmpRoot), tmpRoot);
  });
});
