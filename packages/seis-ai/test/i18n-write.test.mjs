import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";

import { i18nAddKey, i18nRenameKey } from "../src/lib/i18n-write.mjs";

let webRoot;

const BASE_TRANSLATIONS = {
  tr: { "hero.title": "Başlık", "nav.home": "Ana Sayfa", "fm.send": "Gönder" },
  en: { "hero.title": "Title", "nav.home": "Home", "fm.send": "Send" },
  fr: { "hero.title": "Titre", "nav.home": "Accueil", "fm.send": "Envoyer" },
  it: { "hero.title": "Titolo", "nav.home": "Home", "fm.send": "Invia" },
  de: { "hero.title": "Titel", "nav.home": "Startseite", "fm.send": "Senden" },
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

describe("i18nRenameKey", () => {
  beforeEach(() => {
    setup();
    writeFileSync(
      path.join(webRoot, "index.html"),
      `<h1 data-i18n="hero.title">x</h1>
<input data-i18n-placeholder="fm.send" data-i18n-aria-label="fm.send">
<a data-i18n="nav.home">y</a>`,
      "utf8"
    );
    writeFileSync(
      path.join(webRoot, "script.js"),
      `var a = getT("fm.send", lang);\nvar b = getT( "fm.send", lang);\nvar c = getT("nav.home", lang);`,
      "utf8"
    );
  });
  afterEach(teardown);

  it("renames the key in every locale, preserving values and position", () => {
    i18nRenameKey(webRoot, "nav.home", "nav.start");
    const t = loadFile();
    for (const locale of Object.keys(BASE_TRANSLATIONS)) {
      assert.ok(!("nav.home" in t[locale]));
      assert.equal(t[locale]["nav.start"], BASE_TRANSLATIONS[locale]["nav.home"]);
    }
    // Position preserved: nav.start is still the 2nd key in tr.
    assert.deepEqual(Object.keys(t.tr), ["hero.title", "nav.start", "fm.send"]);
  });

  it("rewrites data-i18n* attributes and getT() calls, returning counts", () => {
    const r = i18nRenameKey(webRoot, "fm.send", "fm.submit");
    assert.equal(r.referencesUpdated.html, 2); // placeholder + aria-label
    assert.equal(r.referencesUpdated.js, 2); // both getT spacings
    const html = readFileSync(path.join(webRoot, "index.html"), "utf8");
    const js = readFileSync(path.join(webRoot, "script.js"), "utf8");
    assert.ok(!html.includes("fm.send"));
    assert.ok(html.includes('data-i18n-placeholder="fm.submit"'));
    assert.ok(!js.includes('"fm.send"'));
    assert.ok(js.includes('getT("fm.submit"'));
    assert.ok(js.includes('getT( "fm.submit"'));
  });

  it("does not touch sibling keys that share a prefix", () => {
    i18nAddKey(webRoot, "fm.send.now", {
      tr: "Şimdi", en: "Now", fr: "Maintenant", it: "Ora", de: "Jetzt",
    });
    i18nRenameKey(webRoot, "fm.send", "fm.submit");
    const t = loadFile();
    assert.ok("fm.send.now" in t.tr); // untouched
    assert.ok("fm.submit" in t.tr);
  });

  it("skips file rewrites with updateReferences:false", () => {
    const r = i18nRenameKey(webRoot, "fm.send", "fm.submit", { updateReferences: false });
    assert.deepEqual(r.referencesUpdated, { html: 0, js: 0 });
    const html = readFileSync(path.join(webRoot, "index.html"), "utf8");
    assert.ok(html.includes('data-i18n-placeholder="fm.send"'));
  });

  it("throws when the old key is missing in any locale", () => {
    assert.throws(() => i18nRenameKey(webRoot, "ghost.key", "new.key"), /missing in locale/);
  });

  it("throws when the new key already exists", () => {
    assert.throws(() => i18nRenameKey(webRoot, "nav.home", "hero.title"), /already exists/);
  });

  it("throws when old and new are identical", () => {
    assert.throws(() => i18nRenameKey(webRoot, "nav.home", "nav.home"), /identical/);
  });
});
