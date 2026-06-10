import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

/**
 * Add (or overwrite with `overwrite: true`) one key across every locale in
 * translations.json. `values` must supply a string for each locale; the file
 * is rewritten with 2-space indent and key appended at the end of each
 * locale block, matching the existing file style.
 */
export function i18nAddKey(webRoot, key, values, { overwrite = false } = {}) {
  if (!key || typeof key !== "string") {
    throw new Error("key is required");
  }
  const file = path.join(webRoot, "translations.json");
  const translations = JSON.parse(readFileSync(file, "utf8"));
  const locales = Object.keys(translations);

  const missingValues = locales.filter((l) => typeof values?.[l] !== "string");
  if (missingValues.length) {
    throw new Error(`Missing value for locale(s): ${missingValues.join(", ")}`);
  }
  const emptyValues = locales.filter((l) => values[l].trim() === "");
  if (emptyValues.length) {
    throw new Error(`Empty value for locale(s): ${emptyValues.join(", ")} — every locale must have a non-empty string`);
  }
  const exists = locales.filter((l) => key in translations[l]);
  if (exists.length && !overwrite) {
    throw new Error(`Key "${key}" already exists in: ${exists.join(", ")} (pass overwrite to replace)`);
  }

  for (const locale of locales) {
    translations[locale][key] = values[locale];
  }
  writeFileSync(file, JSON.stringify(translations, null, 2) + "\n");
  return { key, locales, overwritten: exists.length > 0 };
}

/**
 * Rename one key in every locale, preserving its position in each locale
 * block, and (by default) rewrite all references: data-i18n* attributes in
 * index.html and literal getT("...") calls in script.js. Returns per-file
 * replacement counts so the caller can verify the rename took effect.
 */
export function i18nRenameKey(webRoot, oldKey, newKey, { updateReferences = true } = {}) {
  if (!oldKey || !newKey || typeof oldKey !== "string" || typeof newKey !== "string") {
    throw new Error("oldKey and newKey are required");
  }
  if (oldKey === newKey) {
    throw new Error("oldKey and newKey are identical");
  }
  const file = path.join(webRoot, "translations.json");
  const translations = JSON.parse(readFileSync(file, "utf8"));
  const locales = Object.keys(translations);

  const missingOld = locales.filter((l) => !(oldKey in translations[l]));
  if (missingOld.length) {
    throw new Error(`Key "${oldKey}" missing in locale(s): ${missingOld.join(", ")}`);
  }
  const existsNew = locales.filter((l) => newKey in translations[l]);
  if (existsNew.length) {
    throw new Error(`Key "${newKey}" already exists in: ${existsNew.join(", ")}`);
  }

  for (const locale of locales) {
    const rebuilt = {};
    for (const [k, v] of Object.entries(translations[locale])) {
      rebuilt[k === oldKey ? newKey : k] = v;
    }
    translations[locale] = rebuilt;
  }
  writeFileSync(file, JSON.stringify(translations, null, 2) + "\n");

  const referencesUpdated = { html: 0, js: 0 };
  if (updateReferences) {
    const htmlPath = path.join(webRoot, "index.html");
    if (existsSync(htmlPath)) {
      const html = readFileSync(htmlPath, "utf8");
      const re = new RegExp(`(data-i18n(?:-[a-z-]+)?=")${escapeRe(oldKey)}(")`, "g");
      const next = html.replace(re, (_, p1, p2) => {
        referencesUpdated.html += 1;
        return p1 + newKey + p2;
      });
      if (referencesUpdated.html) writeFileSync(htmlPath, next);
    }
    const jsPath = path.join(webRoot, "script.js");
    if (existsSync(jsPath)) {
      const js = readFileSync(jsPath, "utf8");
      const re = new RegExp(`(getT\\(\\s*")${escapeRe(oldKey)}(")`, "g");
      const next = js.replace(re, (_, p1, p2) => {
        referencesUpdated.js += 1;
        return p1 + newKey + p2;
      });
      if (referencesUpdated.js) writeFileSync(jsPath, next);
    }
  }

  return { oldKey, newKey, locales, referencesUpdated };
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
