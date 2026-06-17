import { translateKey } from "./i18n-system.js";

const WEEKLY_USAGE_SOURCE = "./content/lab/weekly-usage-governor.json";

let cachedWeeklyUsage = null;

export function initWeeklyUsageGovernor() {
  const section = document.querySelector("[data-weekly-usage]");
  const grid = document.querySelector("[data-weekly-usage-grid]");
  const status = document.querySelector("[data-weekly-usage-status]");
  if (!section || !grid || !status) return;

  const render = payload => {
    const signals = Array.isArray(payload?.signals) ? payload.signals : [];
    if (!signals.length) {
      status.textContent = translateKey("weekly.status.fallback");
      return;
    }

    grid.replaceChildren(...signals.map(createWeeklyUsageCard));
    const summary = translateKey(payload.summaryKey || "weekly.status.ready");
    status.textContent = `${summary} · ${payload.mode || "weekly"}`;
  };

  fetch(WEEKLY_USAGE_SOURCE, { cache: "no-cache" })
    .then(response => {
      if (!response.ok) throw new Error("weekly usage governor unavailable");
      return response.json();
    })
    .then(payload => {
      cachedWeeklyUsage = payload;
      render(payload);
    })
    .catch(() => {
      status.textContent = translateKey("weekly.status.fallback");
    });

  document.addEventListener("seis:locale-change", () => {
    if (cachedWeeklyUsage) render(cachedWeeklyUsage);
  });
}

function createWeeklyUsageCard(signal) {
  const article = document.createElement("article");
  article.className = `weekly-card weekly-card--${signal.status || "active"}`;

  const meta = document.createElement("span");
  meta.className = "weekly-card__meta";
  meta.textContent = translateKey(signal.labelKey);

  const value = document.createElement("strong");
  value.className = "weekly-card__value";
  value.textContent = String(signal.value || "");

  const title = document.createElement("h3");
  title.textContent = translateKey(signal.titleKey);

  const copy = document.createElement("p");
  copy.textContent = translateKey(signal.copyKey);

  article.append(meta, value, title, copy);
  return article;
}
