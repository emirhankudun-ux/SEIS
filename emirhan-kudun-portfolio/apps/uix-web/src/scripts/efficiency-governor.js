import { translateKey } from "./i18n-system.js";

const GOVERNOR_SOURCE = "./content/lab/efficiency-governor.json";

let cachedGovernor = null;

export function initEfficiencyGovernor() {
  const section = document.querySelector("[data-efficiency-governor]");
  const grid = document.querySelector("[data-efficiency-grid]");
  const status = document.querySelector("[data-efficiency-status]");
  if (!section || !grid || !status) return;

  const render = payload => {
    const cards = Array.isArray(payload?.cards) ? payload.cards : [];
    if (!cards.length) {
      status.textContent = translateKey("efficiency.status.fallback");
      return;
    }

    grid.replaceChildren(...cards.map(createEfficiencyCard));
    status.textContent = `${translateKey("efficiency.status.ready")} · ${payload.operatingMode || "local"}`;
  };

  fetch(GOVERNOR_SOURCE, { cache: "no-cache" })
    .then(response => {
      if (!response.ok) throw new Error("efficiency governor unavailable");
      return response.json();
    })
    .then(payload => {
      cachedGovernor = payload;
      render(payload);
    })
    .catch(() => {
      status.textContent = translateKey("efficiency.status.fallback");
    });

  document.addEventListener("seis:locale-change", () => {
    if (cachedGovernor) render(cachedGovernor);
  });
}

function createEfficiencyCard(card) {
  const article = document.createElement("article");
  article.className = `efficiency-card efficiency-card--${card.status || "bounded"}`;

  const meta = document.createElement("span");
  meta.className = "efficiency-card__meta";
  meta.textContent = translateKey(card.labelKey);

  const value = document.createElement("strong");
  value.className = "efficiency-card__value";
  value.textContent = String(card.value || "");

  const title = document.createElement("h3");
  title.textContent = translateKey(card.titleKey);

  const copy = document.createElement("p");
  copy.textContent = translateKey(card.copyKey);

  article.append(meta, value, title, copy);
  return article;
}
