(function () {
  "use strict";

  const state = {
    pages: [],
    collections: [],
    kimiReferences: [],
    search: "",
    collection: "all",
    tag: "all"
  };

  const els = {
    pageCount: document.getElementById("page-count"),
    kimiGrid: document.getElementById("kimi-grid"),
    collectionGrid: document.getElementById("collection-grid"),
    galleryGrid: document.getElementById("gallery-grid"),
    resultCount: document.getElementById("result-count"),
    search: document.getElementById("gallery-search"),
    collectionFilter: document.getElementById("collection-filter"),
    tagFilter: document.getElementById("tag-filter"),
    dialog: document.getElementById("preview-dialog"),
    previewImage: document.getElementById("preview-image"),
    previewTitle: document.getElementById("preview-title"),
    previewCollection: document.getElementById("preview-collection"),
    previewNote: document.getElementById("preview-note"),
    previewHtml: document.getElementById("preview-html"),
    previewImageLink: document.getElementById("preview-image-link")
  };

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function uniqueTags(pages) {
    return [...new Set(pages.flatMap((page) => page.tags || []))].sort();
  }

  function unavailablePreviewMarkup(title, source) {
    return `<strong>Preview unavailable</strong>
      <small>Supplied PNG is not present in this checkout.</small>
      <code>${escapeHtml(source || `${title} PNG`)}</code>`;
  }

  function renderKimiReferences() {
    els.kimiGrid.innerHTML = state.kimiReferences.map((ref) => `<article class="reference-card">
      <p class="eyebrow">${escapeHtml(ref.status)}</p>
      <h3>${escapeHtml(ref.title)}</h3>
      <p>Observed title: ${escapeHtml(ref.observedTitle || "External reference")}. Opens outside the local SEIS demo.</p>
      <div class="card-actions">
        <a class="primary-link" href="${escapeHtml(ref.url)}" target="_blank" rel="noopener">Open external reference</a>
      </div>
    </article>`).join("");
  }

  function renderCollections() {
    els.collectionFilter.innerHTML = `<option value="all">All collections</option>${state.collections.map((collection) => (
      `<option value="${escapeHtml(collection.id)}">${escapeHtml(collection.label)}</option>`
    )).join("")}`;

    els.collectionGrid.innerHTML = state.collections.map((collection) => `<article class="collection-card">
      <p class="eyebrow">${escapeHtml(collection.id)}</p>
      <h3>${escapeHtml(collection.label)}</h3>
      <p>${collection.pngCount} PNG screens, ${collection.htmlCount} HTML references, ${collection.copiedFiles} imported runtime files.</p>
      <div class="meta-row">
        <span class="chip">${escapeHtml(collection.zipName)}</span>
        <span class="chip">${escapeHtml(collection.sourceFolder)}</span>
      </div>
    </article>`).join("");
  }

  function renderTagFilter() {
    els.tagFilter.innerHTML = `<option value="all">All tags</option>${uniqueTags(state.pages).map((tag) => (
      `<option value="${escapeHtml(tag)}">${escapeHtml(tag)}</option>`
    )).join("")}`;
  }

  function filteredPages() {
    const query = state.search.trim().toLowerCase();
    return state.pages.filter((page) => {
      const text = `${page.title} ${page.collection} ${(page.tags || []).join(" ")}`.toLowerCase();
      const matchesQuery = !query || text.includes(query);
      const matchesCollection = state.collection === "all" || page.collectionId === state.collection;
      const matchesTag = state.tag === "all" || (page.tags || []).includes(state.tag);
      return matchesQuery && matchesCollection && matchesTag;
    });
  }

  function renderGallery() {
    const pages = filteredPages();
    els.pageCount.textContent = String(state.pages.length);
    els.resultCount.textContent = `${pages.length} of ${state.pages.length} shown`;
    els.galleryGrid.innerHTML = pages.map((page) => `<article class="gallery-card">
      <button type="button" class="gallery-thumb-button" data-action="preview-page" data-page-id="${escapeHtml(page.id)}">
        <span class="reference-preview-fallback" role="img" aria-label="${escapeHtml(`${page.title} preview unavailable`)}">${unavailablePreviewMarkup(page.title, page.image)}</span>
      </button>
      <div class="gallery-card-body">
        <div>
          <p class="eyebrow">${escapeHtml(page.collection)}</p>
          <h3>${escapeHtml(page.title)}</h3>
          <p>${escapeHtml(page.status)}. Page ${escapeHtml(page.number)}.</p>
        </div>
        <div class="meta-row">
          ${(page.tags || []).map((tag) => `<span class="chip">${escapeHtml(tag)}</span>`).join("")}
        </div>
        <div class="card-actions">
          <button type="button" class="secondary-link" data-action="preview-page" data-page-id="${escapeHtml(page.id)}">Preview</button>
          ${page.html ? `<a class="secondary-link" href="${escapeHtml(page.html)}" target="_blank" rel="noopener">HTML</a>` : ""}
        </div>
      </div>
    </article>`).join("") || `<p>No pages match the current filters.</p>`;
  }

  function showPreview(pageId) {
    const page = state.pages.find((item) => item.id === pageId);
    if (!page) return;
    els.previewImage.innerHTML = unavailablePreviewMarkup(page.title, page.image);
    els.previewImage.setAttribute("aria-label", `${page.title} preview unavailable`);
    els.previewTitle.textContent = page.title;
    els.previewCollection.textContent = page.collection;
    els.previewNote.textContent = "The supplied PNG is not present in this checkout. The imported HTML reference remains available for comparison and is not proof of live implementation.";
    els.previewImageLink.removeAttribute("href");
    els.previewImageLink.classList.add("is-hidden");
    if (page.html) {
      els.previewHtml.href = page.html;
      els.previewHtml.classList.remove("is-hidden");
    } else {
      els.previewHtml.classList.add("is-hidden");
    }
    if (typeof els.dialog.showModal === "function") {
      els.dialog.showModal();
    } else {
      els.dialog.setAttribute("open", "");
    }
  }

  function closePreview() {
    if (typeof els.dialog.close === "function" && els.dialog.open) {
      els.dialog.close();
    } else {
      els.dialog.removeAttribute("open");
    }
  }

  function bindEvents() {
    els.search.addEventListener("input", (event) => {
      state.search = event.target.value;
      renderGallery();
    });
    els.collectionFilter.addEventListener("change", (event) => {
      state.collection = event.target.value;
      renderGallery();
    });
    els.tagFilter.addEventListener("change", (event) => {
      state.tag = event.target.value;
      renderGallery();
    });
    document.addEventListener("click", (event) => {
      const actionNode = event.target.closest("[data-action]");
      if (!actionNode) return;
      const action = actionNode.dataset.action;
      if (action === "preview-page") showPreview(actionNode.dataset.pageId);
      if (action === "close-preview") closePreview();
      if (action === "focus-search") els.search.focus();
      if (action === "reset-filters") {
        state.search = "";
        state.collection = "all";
        state.tag = "all";
        els.search.value = "";
        els.collectionFilter.value = "all";
        els.tagFilter.value = "all";
        renderGallery();
      }
    });
    els.dialog.addEventListener("click", (event) => {
      if (event.target === els.dialog) closePreview();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && els.dialog.open) closePreview();
    });
  }

  async function init() {
    bindEvents();
    try {
      const response = await fetch("./wow-pages/wow-catalog.json", { cache: "no-cache" });
      if (!response.ok) throw new Error(`Catalog HTTP ${response.status}`);
      const catalog = await response.json();
      state.pages = Array.isArray(catalog.pages) ? catalog.pages : [];
      state.collections = Array.isArray(catalog.collections) ? catalog.collections : [];
      state.kimiReferences = Array.isArray(catalog.kimiReferences) ? catalog.kimiReferences : [];
      renderKimiReferences();
      renderCollections();
      renderTagFilter();
      renderGallery();
    } catch (error) {
      els.pageCount.textContent = "0";
      els.resultCount.textContent = "Catalog failed to load";
      els.galleryGrid.innerHTML = `<p>WOW catalog could not load. ${escapeHtml(error.message)}</p>`;
    }
  }

  init();
})();
