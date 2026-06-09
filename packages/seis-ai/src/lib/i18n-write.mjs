import { readFileSync, writeFileSync } from "node:fs";
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
