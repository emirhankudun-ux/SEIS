const EFFICIENCY_SOURCE = "./content/lab/efficiency-mode.json";

export function initEfficiencySystem() {
  const root = document.querySelector("[data-efficiency-system]");
  const grid = document.querySelector("[data-efficiency-grid]");
  const status = document.querySelector("[data-efficiency-status]");
  if (!root || !grid || !status) return;

  fetch(EFFICIENCY_SOURCE, { cache: "no-cache" })
    .then(response => {
      if (!response.ok) throw new Error("efficiency mode unavailable");
      return response.json();
    })
    .then(payload => renderEfficiency(payload, grid, status))
    .catch(() => {
      status.textContent = "Efficiency contract unavailable; static fallback remains visible.";
    });
}

function renderEfficiency(payload, grid, status) {
  const principles = Array.isArray(payload?.principles) ? payload.principles : [];
  if (!principles.length) {
    status.textContent = "Efficiency contract unavailable; static fallback remains visible.";
    return;
  }

  grid.replaceChildren(...principles.map(createPrincipleCard));
  status.textContent = `${payload.summary?.status || "active"} · ${payload.summary?.computerPressure || "low"} pressure · ${payload.summary?.runtimeBudget || "static-first"}`;
}

function createPrincipleCard(principle) {
  const card = document.createElement("article");
  card.className = "efficiency-card";

  const meta = document.createElement("span");
  meta.className = "efficiency-card__meta";
  meta.textContent = principle.status || "active";

  const title = document.createElement("h3");
  title.textContent = principle.label || "";

  const signal = document.createElement("p");
  signal.textContent = principle.signal || "";

  const guardrail = document.createElement("strong");
  guardrail.textContent = principle.guardrail || "";

  card.append(meta, title, signal, guardrail);
  return card;
}
