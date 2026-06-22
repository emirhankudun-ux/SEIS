import { localeDirection, localeLabels, supportedLocales, translations } from "../i18n/locales.js";

const STORAGE_KEY = "seis-locale";
const DEFAULT_LOCALE = "tr";
let currentLocale = DEFAULT_LOCALE;

export function initI18n() {
  const switcher = document.querySelector("[data-locale-switcher]");
  const initialLocale = resolveInitialLocale();

  if (switcher) {
    switcher.replaceChildren(...supportedLocales.map(locale => createLocaleButton(locale)));
    switcher.addEventListener("click", event => {
      const button = event.target.closest("[data-locale-option]");
      if (!button) return;
      applyLocale(button.dataset.localeOption, true);
    });
  }

  applyLocale(initialLocale, false);
}

function resolveInitialLocale() {
  const fromUrl = new URLSearchParams(window.location.search).get("lang");
  if (supportedLocales.includes(fromUrl)) return fromUrl;

  const routeLocale = window.location.pathname.split("/").filter(Boolean).find(segment => supportedLocales.includes(segment));
  if (supportedLocales.includes(routeLocale)) return routeLocale;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (supportedLocales.includes(stored)) return stored;
  } catch {
    /* ignored */
  }

  const browserLocale = (navigator.language || "").slice(0, 2).toLowerCase();
  return supportedLocales.includes(browserLocale) ? browserLocale : DEFAULT_LOCALE;
}

function createLocaleButton(locale) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "locale-chip";
  button.dataset.localeOption = locale;
  button.setAttribute("aria-pressed", "false");
  button.textContent = localeLabels[locale] || locale.toUpperCase();
  return button;
}

function applyLocale(locale, persist) {
  const activeLocale = supportedLocales.includes(locale) ? locale : DEFAULT_LOCALE;
  const dictionary = translations[activeLocale] || translations[DEFAULT_LOCALE];
  currentLocale = activeLocale;

  document.documentElement.lang = activeLocale;
  document.documentElement.dir = localeDirection[activeLocale] || "ltr";
  document.title = dictionary["meta.title"] || translations[DEFAULT_LOCALE]["meta.title"];

  document.querySelectorAll("[data-i18n]").forEach(node => {
    const value = dictionary[node.dataset.i18n] || translations[DEFAULT_LOCALE][node.dataset.i18n];
    if (value) node.textContent = value;
  });

  document.querySelectorAll("[data-locale-option]").forEach(button => {
    const active = button.dataset.localeOption === activeLocale;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });

  if (persist) {
    try {
      window.localStorage.setItem(STORAGE_KEY, activeLocale);
    } catch {
      /* ignored */
    }
  }

  document.dispatchEvent(new CustomEvent("seis:locale-change", {
    detail: { locale: activeLocale }
  }));
}

export function translateKey(key) {
  return translations[currentLocale]?.[key] || translations[DEFAULT_LOCALE]?.[key] || key;
}
