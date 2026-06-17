import { translateKey } from "./i18n-system.js";

const HANDOFF_SOURCE = "./content/lab/handoff-checklist.json";
const STORAGE_KEY = "seis-handoff-reviewed";

let cachedHandoff = null;
let reviewedItems = readReviewedItems();

export function initHandoffSystem() {
  const section = document.querySelector("[data-handoff-system]");
  const list = document.querySelector("[data-handoff-list]");
  const summary = document.querySelector("[data-handoff-summary]");
  if (!section || !list || !summary) return;

  const render = payload => {
    const items = Array.isArray(payload?.items) ? payload.items : [];
    list.replaceChildren(...items.map(createHandoffItem));
    renderSummary(summary, items);
  };

  fetch(HANDOFF_SOURCE, { cache: "no-cache" })
    .then(response => {
      if (!response.ok) throw new Error("handoff checklist unavailable");
      return response.json();
    })
    .then(payload => {
      cachedHandoff = payload;
      render(payload);
    })
    .catch(() => {
      summary.textContent = translateKey("handoff.status.fallback");
    });

  list.addEventListener("click", event => {
    const button = event.target.closest("[data-handoff-review]");
    if (!button) return;
    toggleReviewedItem(button.dataset.handoffReview);
    if (cachedHandoff) render(cachedHandoff);
  });

  document.addEventListener("seis:locale-change", () => {
    if (cachedHandoff) render(cachedHandoff);
  });
}

function createHandoffItem(item) {
  const reviewed = reviewedItems.has(item.id);
  const article = document.createElement("article");
  article.className = `handoff-item handoff-item--${item.status || "queued"}`;

  const meta = document.createElement("span");
  meta.className = "handoff-item__meta";
  meta.textContent = translateKey(item.labelKey);

  const title = document.createElement("h3");
  title.textContent = translateKey(item.titleKey);

  const copy = document.createElement("p");
  copy.textContent = translateKey(item.copyKey);

  const button = document.createElement("button");
  button.type = "button";
  button.className = "handoff-item__check";
  button.dataset.handoffReview = item.id;
  button.setAttribute("aria-pressed", reviewed ? "true" : "false");
  button.textContent = reviewed ? translateKey("handoff.reviewed") : translateKey("handoff.review");

  article.append(meta, title, copy, button);
  return article;
}

function renderSummary(node, items) {
  const reviewedCount = items.filter(item => reviewedItems.has(item.id)).length;
  const blockedCount = items.filter(item => item.status === "blocked").length;
  node.textContent = `${translateKey("handoff.status.ready")} ${reviewedCount}/${items.length} · ${translateKey("handoff.status.blocked")} ${blockedCount}`;
}

function toggleReviewedItem(id) {
  if (!id) return;
  reviewedItems = new Set(reviewedItems);
  if (reviewedItems.has(id)) {
    reviewedItems.delete(id);
  } else {
    reviewedItems.add(id);
  }
  persistReviewedItems();
}

function readReviewedItems() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch (_error) {
    return new Set();
  }
}

function persistReviewedItems() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(reviewedItems)));
  } catch (_error) {
    /* localStorage can be unavailable in strict browser modes. */
  }
}
