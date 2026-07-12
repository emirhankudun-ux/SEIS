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

  function isImportedWowPngPath(path) {
    return typeof path === "string"
      && path.startsWith("./wow-pages/imported/")
      && path.includes("/png/")
      && path.endsWith(".png");
  }

  function inferWowHtmlReference(path) {
    return isImportedWowPngPath(path)
      ? path.replace("/png/", "/html/").replace(/\.png$/u, ".html")
      : "";
  }

  function buildWowPlaceholderDataUri(title, lines) {
    const safeTitle = escapeHtml(title || "SEIS WOW");
    const detailLines = (lines || []).map((line) => escapeHtml(String(line || "").trim())).filter(Boolean).slice(0, 3);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" role="img" aria-label="${safeTitle} reference placeholder">
      <defs>
        <linearGradient id="wow-bg" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#020617" />
          <stop offset="50%" stop-color="#111827" />
          <stop offset="100%" stop-color="#1e293b" />
        </linearGradient>
        <linearGradient id="wow-panel" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.28" />
          <stop offset="100%" stop-color="#a855f7" stop-opacity="0.12" />
        </linearGradient>
      </defs>
      <rect width="1280" height="720" fill="url(#wow-bg)" />
      <rect x="52" y="52" width="1176" height="616" rx="28" fill="#0f172a" stroke="#94a3b8" stroke-opacity="0.35" />
      <rect x="88" y="88" width="320" height="18" rx="9" fill="#38bdf8" fill-opacity="0.72" />
      <rect x="88" y="138" width="1104" height="210" rx="22" fill="url(#wow-panel)" stroke="#38bdf8" stroke-opacity="0.35" />
      <rect x="88" y="384" width="348" height="228" rx="22" fill="#0f172a" fill-opacity="0.88" stroke="#94a3b8" stroke-opacity="0.16" />
      <rect x="466" y="384" width="348" height="228" rx="22" fill="#0f172a" fill-opacity="0.88" stroke="#94a3b8" stroke-opacity="0.16" />
      <rect x="844" y="384" width="348" height="228" rx="22" fill="#0f172a" fill-opacity="0.88" stroke="#94a3b8" stroke-opacity="0.16" />
      <text x="88" y="190" fill="#38bdf8" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="700">SEIS WOW imported reference</text>
      <text x="88" y="258" fill="#f8fafc" font-family="Inter, Arial, sans-serif" font-size="58" font-weight="800">${safeTitle}</text>
      ${detailLines.map((line, index) => `<text x="88" y="${318 + (index * 42)}" fill="#cbd5e1" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="500">${line}</text>`).join("")}
    </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function normalizeWowPage(page) {
    const htmlReference = page.html || inferWowHtmlReference(page.image);
    const hasImagePreviewAsset = !isImportedWowPngPath(page.image);
    return {
      ...page,
      html: htmlReference,
      previewImage: hasImagePreviewAsset ? page.image : buildWowPlaceholderDataUri(page.title, [
        page.collection,
        "PNG preview missing in import",
        htmlReference ? "HTML reference preserved" : "Imported visual reference"
      ]),
      hasImagePreviewAsset
    };
  }

  function uniqueTags(pages) {
    return [...new Set(pages.flatMap((page) => page.tags || []))].sort();
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
        <img src="${escapeHtml(page.previewImage)}" alt="${escapeHtml(page.title)} preview" loading="lazy">
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
    els.previewImage.src = page.previewImage;
    els.previewImage.alt = `${page.title} preview`;
    els.previewTitle.textContent = page.title;
    els.previewCollection.textContent = page.collection;
    els.previewNote.textContent = page.hasImagePreviewAsset
      ? "Imported visual reference. Use it for SEIS design comparison, not as evidence of live implementation."
      : "PNG preview is missing in the imported pack. The HTML reference remains preserved for SEIS design comparison.";
    if (page.hasImagePreviewAsset) {
      els.previewImageLink.href = page.image;
      els.previewImageLink.classList.remove("is-hidden");
    } else {
      els.previewImageLink.classList.add("is-hidden");
    }
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
      state.pages = Array.isArray(catalog.pages) ? catalog.pages.map(normalizeWowPage) : [];
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
