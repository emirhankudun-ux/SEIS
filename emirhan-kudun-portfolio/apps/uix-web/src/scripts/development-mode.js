import { translateKey } from "./i18n-system.js";

const DEVELOPMENT_MODE_SOURCE = "./content/lab/development-mode.json";

let cachedDevelopmentMode = null;

export function initDevelopmentMode() {
  const section = document.querySelector("[data-development-mode]");
  const grid = document.querySelector("[data-development-mode-grid]");
  const status = document.querySelector("[data-development-mode-status]");
  if (!section || !grid || !status) return;

  const render = payload => {
    const stages = Array.isArray(payload?.stages) ? payload.stages : [];
    if (!stages.length) {
      status.textContent = translateKey("devmode.status.fallback");
      return;
    }

    grid.replaceChildren(...stages.map(createDevelopmentModeCard));
    status.textContent = `${translateKey("devmode.status.ready")} · ${payload.mode || "local"}`;
  };

  fetch(DEVELOPMENT_MODE_SOURCE, { cache: "no-cache" })
    .then(response => {
      if (!response.ok) throw new Error("development mode unavailable");
      return response.json();
    })
    .then(payload => {
      cachedDevelopmentMode = payload;
      render(payload);
    })
    .catch(() => {
      status.textContent = translateKey("devmode.status.fallback");
    });

  document.addEventListener("seis:locale-change", () => {
    if (cachedDevelopmentMode) render(cachedDevelopmentMode);
  });
}

function createDevelopmentModeCard(stage) {
  const article = document.createElement("article");
  article.className = `devmode-card devmode-card--${stage.status || "active"}`;

  const meta = document.createElement("span");
  meta.className = "devmode-card__meta";
  meta.textContent = translateKey(stage.labelKey);

  const value = document.createElement("strong");
  value.className = "devmode-card__value";
  value.textContent = String(stage.value || "");

  const title = document.createElement("h3");
  title.textContent = translateKey(stage.titleKey);

  const copy = document.createElement("p");
  copy.textContent = translateKey(stage.copyKey);

  article.append(meta, value, title, copy);
  return article;
}
