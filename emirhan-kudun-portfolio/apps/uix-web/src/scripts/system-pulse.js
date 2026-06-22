import { translateKey } from "./i18n-system.js";

const PULSE_SOURCE = "./content/lab/system-pulse.json";
const EFFICIENCY_SOURCE = "./content/lab/efficiency-mode.json";

let cachedPulse = null;

export function initSystemPulse() {
  const section = document.querySelector("[data-system-pulse]");
  const grid = document.querySelector("[data-system-pulse-grid]");
  const status = document.querySelector("[data-system-pulse-status]");
  const efficiency = document.querySelector("[data-efficiency-system], [data-efficiency-governor]");
  const efficiencyGrid = document.querySelector("[data-efficiency-grid]");
  const efficiencyStatus = document.querySelector("[data-efficiency-status]");
  if ((!section || !grid || !status) && (!efficiency || !efficiencyGrid || !efficiencyStatus)) return;

  const renderStatus = key => {
    if (!status) return;
    status.textContent = translateKey(key);
  };

  const renderPulse = payload => {
    const cards = Array.isArray(payload?.cards) ? payload.cards : [];
    if (!cards.length) {
      renderStatus("pulse.status.fallback");
      return;
    }

    grid.replaceChildren(...cards.map(createPulseCard));
    renderStatus("pulse.status.ready");
  };

  fetch(PULSE_SOURCE, { cache: "no-cache" })
    .then(response => {
      if (!response.ok) throw new Error("system pulse unavailable");
      return response.json();
    })
    .then(payload => {
      cachedPulse = payload;
      renderPulse(payload);
    })
    .catch(() => {
      renderStatus("pulse.status.fallback");
    });

  document.addEventListener("seis:locale-change", () => {
    if (cachedPulse) renderPulse(cachedPulse);
  });

  if (!efficiency || !efficiencyGrid || !efficiencyStatus) return;

  fetch(EFFICIENCY_SOURCE, { cache: "no-cache" })
    .then(response => {
      if (!response.ok) throw new Error("efficiency contract unavailable");
      return response.json();
    })
    .then(payload => {
      const principles = Array.isArray(payload?.principles) ? payload.principles : [];
      if (!principles.length) {
        efficiencyStatus.textContent = "Efficiency contract unavailable.";
        return;
      }
      efficiencyGrid.replaceChildren(...principles.map(createEfficiencyCard));
      efficiencyStatus.textContent = `${payload.summary?.status || "active"} · ${payload.summary?.computerPressure || "low"} pressure · ${payload.summary?.runtimeBudget || "static-first"}`;
    })
    .catch(() => {
      efficiencyStatus.textContent = "Efficiency contract unavailable.";
    });
}

function createPulseCard(card) {
  const article = document.createElement("article");
  article.className = `pulse-card pulse-card--${card.status || "ready"}`;

  const meta = document.createElement("span");
  meta.className = "pulse-card__meta";
  meta.textContent = translateKey(card.labelKey);

  const value = document.createElement("strong");
  value.className = "pulse-card__value";
  value.textContent = String(card.value || "");

  const title = document.createElement("h3");
  title.textContent = translateKey(card.titleKey);

  const copy = document.createElement("p");
  copy.textContent = translateKey(card.copyKey);

  article.append(meta, value, title, copy);
  return article;
}

function createEfficiencyCard(item) {
  const article = document.createElement("article");
  article.className = "efficiency-card";

  const meta = document.createElement("span");
  meta.className = "efficiency-card__meta";
  meta.textContent = item.status || "active";

  const title = document.createElement("h3");
  title.textContent = item.label || "";

  const signal = document.createElement("p");
  signal.textContent = item.signal || "";

  const guardrail = document.createElement("strong");
  guardrail.textContent = item.guardrail || "";

  article.append(meta, title, signal, guardrail);
  return article;
}
