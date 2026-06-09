import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";

import { i18nAddKey } from "../src/lib/i18n-write.mjs";

let webRoot;

const BASE_TRANSLATIONS = {
  tr: { "hero.title": "Başlık" },
  en: { "hero.title": "Title" },
  fr: { "hero.title": "Titre" },
  it: { "hero.title": "Titolo" },
  de: { "hero.title": "Titel" },
};

function setup() {
  webRoot = path.join(tmpdir(), `seis-i18n-test-${process.pid}-${Date.now()}`);
  mkdirSync(webRoot, { recursive: true });
  writeFileSync(
    path.join(webRoot, "translations.json"),
    JSON.stringify(BASE_TRANSLATIONS, null, 2),
    "utf8"
  );
}

function teardown() {
  rmSync(webRoot, { recursive: true, force: true });
}

function loadFile() {
  return JSON.parse(readFileSync(path.join(webRoot, "translations.json"), "utf8"));
}

describe("i18nAddKey", () => {
  beforeEach(setup);
  afterEach(teardown);

  it("adds a new key to all five locales", () => {
    i18nAddKey(webRoot, "new.key", {
      tr: "Yeni",
      en: "New",
      fr: "Nouveau",
      it: "Nuovo",
      de: "Neu",
    });
    const t = loadFile();
    assert.equal(t.tr["new.key"], "Yeni");
    assert.equal(t.en["new.key"], "New");
    assert.equal(t.fr["new.key"], "Nouveau");
    assert.equal(t.it["new.key"], "Nuovo");
    assert.equal(t.de["new.key"], "Neu");
  });

  it("preserves existing keys", () => {
    i18nAddKey(webRoot, "new.key", {
      tr: "Yeni", en: "New", fr: "Nouveau", it: "Nuovo", de: "Neu",
    });
    const t = loadFile();
    assert.equal(t.tr["hero.title"], "Başlık");
  });

  it("throws when a locale value is missing", () => {
    assert.throws(
      () =>
        i18nAddKey(webRoot, "partial.key", {
          tr: "Değer",
          en: "Value",
          fr: "Valeur",
          // missing it and de
        }),
      /Missing value for locale/i
    );
  });

  it("throws when a locale value is empty string", () => {
    assert.throws(
      () =>
        i18nAddKey(webRoot, "empty.key", {
          tr: "Değer", en: "Value", fr: "Valeur", it: "", de: "Wert",
        }),
      /Empty value for locale/i
    );
  });

  it("throws on overwrite by default", () => {
    assert.throws(
      () =>
        i18nAddKey(webRoot, "hero.title", {
          tr: "Y", en: "Y", fr: "Y", it: "Y", de: "Y",
        }),
      /already exists/i
    );
  });

  it("allows overwrite with option", () => {
    i18nAddKey(
      webRoot,
      "hero.title",
      { tr: "Yeni Başlık", en: "New Title", fr: "Nouveau Titre", it: "Nuovo Titolo", de: "Neuer Titel" },
      { overwrite: true }
    );
    const t = loadFile();
    assert.equal(t.tr["hero.title"], "Yeni Başlık");
  });
});
