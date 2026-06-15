(function () {
  "use strict";

  var SUPPORTED_LANGS = ["tr", "en", "fr", "it", "de"];
  var DEFAULT_LANG = "en";
  var SITE_CONFIG_PATH = "site-config.json";
  var LANG_STORAGE_KEY = "ek_site_lang";
  var COOKIE_STORAGE_KEY = "ek_cookie_consent";
  var FORM_DRAFT_STORAGE_KEY = "ek_contact_form_draft_v1";
  var MOTION_STORAGE_KEY = "ek_motion_mode";
  var REDUCED_MOTION = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var FINE_POINTER = !!(window.matchMedia && window.matchMedia("(pointer: fine)").matches);
  var COARSE_POINTER = !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
  var CAN_HOVER = !!(window.matchMedia && window.matchMedia("(hover: hover)").matches);
  var MIN_MESSAGE_LENGTH = 12;
  var BEHANCE_EAGER_COUNT = 9;

  var translations = null;
  var currentLang = DEFAULT_LANG;
  var languageChangeHooks = [];
  var toastTimer = null;
  var userMotionMode = "standard";
  var LANGUAGE_LABELS = {
    tr: "Turkce",
    en: "English",
    fr: "Francais",
    it: "Italiano",
    de: "Deutsch"
  };
  var DRAWING_MEDIA_RE = /^(?:\.\/)?public\/media\/drawings\/[a-z0-9-]+\.jpe?g$/i;
  var BEHANCE_EMBED_HOSTS = ["behance.net", "www.behance.net"];

  function parseHttpUrl(value) {
    try {
      var url = new URL(String(value || ""), window.location.href);
      if (url.protocol !== "https:" && url.protocol !== "http:") {
        return null;
      }
      if (url.username || url.password) {
        return null;
      }
      return url;
    } catch (err) {
      return null;
    }
  }

  function normalizeDrawingMediaSrc(value) {
    var rawValue = String(value || "").trim();
    if (!rawValue) {
      return "";
    }
    if (DRAWING_MEDIA_RE.test(rawValue)) {
      return rawValue;
    }
    var url = parseHttpUrl(rawValue);
    if (!url || url.origin !== window.location.origin) {
      return "";
    }
    var relativePath = url.pathname.replace(/^\/+/, "");
    return DRAWING_MEDIA_RE.test(relativePath) ? url.href : "";
  }

  function assignDrawingMediaSrc(image, attrName) {
    if (!image) {
      return false;
    }
    var source = image.getAttribute(attrName || "data-src");
    var safeSource = normalizeDrawingMediaSrc(source);
    if (!safeSource) {
      return false;
    }
    image.setAttribute("src", safeSource);
    if (attrName && attrName !== "src") {
      image.removeAttribute(attrName);
    }
    return true;
  }

  function normalizeBehanceEmbedSrc(value) {
    var url = parseHttpUrl(value);
    if (!url || BEHANCE_EMBED_HOSTS.indexOf(url.hostname.toLowerCase()) === -1) {
      return "";
    }
    var projectMatch = url.pathname.match(/^\/embed\/project\/(\d+)$/);
    if (!projectMatch) {
      return "";
    }
    var safeUrl = "https://www.behance.net/embed/project/" + projectMatch[1];
    var safeParams = [];
    var ilo = url.searchParams.get("ilo0");
    var retry = url.searchParams.get("ek_retry");
    if (ilo && /^\d+$/.test(ilo)) {
      safeParams.push("ilo0=" + encodeURIComponent(ilo));
    }
    if (retry && /^\d+$/.test(retry)) {
      safeParams.push("ek_retry=" + encodeURIComponent(retry));
    }
    return safeParams.length ? safeUrl + "?" + safeParams.join("&") : safeUrl;
  }

  function assignBehanceIframeSrc(iframe, attrName) {
    if (!iframe) {
      return false;
    }
    var source = iframe.getAttribute(attrName || "data-src");
    var safeSource = normalizeBehanceEmbedSrc(source);
    if (!safeSource) {
      return false;
    }
    iframe.setAttribute("src", safeSource);
    if (attrName && attrName !== "src") {
      iframe.removeAttribute(attrName);
    }
    return true;
  }

  function readStoredMotionMode() {
    try {
      var stored = String(window.localStorage.getItem(MOTION_STORAGE_KEY) || "").toLowerCase();
      return stored === "low" ? "low" : "standard";
    } catch (err) {
      return "standard";
    }
  }

  function isReducedMotion() {
    return REDUCED_MOTION || userMotionMode === "low";
  }

  function applyMotionMode(mode, options) {
    var settings = options || {};
    var normalized = String(mode || "").toLowerCase() === "low" ? "low" : "standard";
    userMotionMode = normalized;
    document.documentElement.setAttribute("data-motion", normalized);
    document.body.setAttribute("data-motion", normalized);
    qa(".motion-btn").forEach(function (button) {
      var active = button.getAttribute("data-motion") === normalized;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
    if (settings.persist !== false) {
      try {
        window.localStorage.setItem(MOTION_STORAGE_KEY, normalized);
      } catch (err) {
        /* noop */
      }
    }
    if (settings.toast) {
      var toastKey = normalized === "low" ? "motion.toast.low" : "motion.toast.standard";
      showToast(getT(toastKey, currentLang) || (normalized === "low" ? "Low motion enabled." : "Standard motion enabled."));
    }
  }

  function resolveInitialLang() {
    var urlLang = getUrlLang();
    var storedLang = normalizeLang((function () {
      try {
        return window.localStorage.getItem(LANG_STORAGE_KEY);
      } catch (err) {
        return null;
      }
    })());
    var htmlLang = normalizeLang(document.documentElement.getAttribute("lang"));
    return {
      lang: urlLang || storedLang || htmlLang || DEFAULT_LANG,
      fromUrl: !!urlLang
    };
  }

  function readGlobalTranslations() {
    var payload = window.__EK_TRANSLATIONS;
    if (!payload || typeof payload !== "object") {
      return null;
    }
    return payload;
  }

  function loadTranslations() {
    var globalPayload = readGlobalTranslations();
    if (globalPayload) {
      return Promise.resolve(globalPayload);
    }
    return fetch("translations.json", { cache: "no-cache" })
      .then(function (res) {
        if (!res.ok) {
          throw new Error("translations.json not found");
        }
        return res.json();
      });
  }

  function loadSiteConfig() {
    return fetch(SITE_CONFIG_PATH, { cache: "no-cache" })
      .then(function (res) {
        if (!res.ok) {
          return {};
        }
        return res.json();
      })
      .catch(function () {
        return {};
      });
  }

  function applySiteConfig(config) {
    var payload = (config && typeof config === "object") ? config : {};
    var endpoint = String(payload.contactEndpoint || "").trim();
    var email = String(payload.contactEmail || "").trim();
    window.__CONTACT_ENDPOINT__ = endpoint;
    window.__CONTACT_EMAIL__ = email;
    applyContactEmail(email);
  }

  function applyContactEmail(email) {
    var safeEmail = String(email || "").trim();
    if (!safeEmail) {
      return;
    }
    var emailLink = q("#contact-email-link");
    if (emailLink) {
      emailLink.textContent = safeEmail;
      emailLink.setAttribute("href", "mailto:" + safeEmail);
    }
  }

  function trackMetric(name, payload) {
    if (!name) {
      return;
    }
    var entry = {
      name: name,
      payload: payload || {},
      at: new Date().toISOString()
    };
    if (!Array.isArray(window.__EK_METRICS__)) {
      window.__EK_METRICS__ = [];
    }
    window.__EK_METRICS__.push(entry);
    try {
      window.dispatchEvent(new CustomEvent("ek:metric", { detail: entry }));
    } catch (err) {
      /* noop */
    }
  }

  function showToast(message) {
    var toast = q("#site-toast");
    if (!toast || !message) {
      return;
    }
    toast.textContent = String(message);
    toast.classList.add("visible");
    if (toastTimer) {
      window.clearTimeout(toastTimer);
    }
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("visible");
    }, 2200);
  }

  function q(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function applyTemplate(template, params) {
    if (typeof template !== "string") {
      return "";
    }
    return template.replace(/\{(\w+)\}/g, function (_, key) {
      return Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : "";
    });
  }

  function onLanguageChange(callback) {
    if (typeof callback === "function") {
      languageChangeHooks.push(callback);
    }
  }

  function supportsLang(value) {
    return SUPPORTED_LANGS.indexOf(String(value || "").toLowerCase()) > -1;
  }

  function normalizeLang(value) {
    var normalized = String(value || "").toLowerCase();
    return supportsLang(normalized) ? normalized : null;
  }

  function getUrlLang() {
    try {
      return normalizeLang(new URLSearchParams(window.location.search).get("lang"));
    } catch (err) {
      return null;
    }
  }

  function setUrlLang(lang) {
    try {
      var safeLang = normalizeLang(lang);
      if (!safeLang) {
        return;
      }
      var url = new URL(window.location.href);
      url.searchParams.set("lang", safeLang);
      window.history.replaceState({}, "", url.toString());
    } catch (err) {
      /* noop */
    }
  }

  function getT(key, lang) {
    var safeLang = normalizeLang(lang) || currentLang || DEFAULT_LANG;
    if (translations && translations[safeLang] && Object.prototype.hasOwnProperty.call(translations[safeLang], key)) {
      return translations[safeLang][key];
    }
    if (translations && translations[DEFAULT_LANG] && Object.prototype.hasOwnProperty.call(translations[DEFAULT_LANG], key)) {
      return translations[DEFAULT_LANG][key];
    }
    return null;
  }

  function applyI18nToDom(lang) {
    qa("[data-i18n]").forEach(function (node) {
      var value = getT(node.getAttribute("data-i18n"), lang);
      if (typeof value === "string") {
        node.textContent = value;
      }
    });

    qa("[data-i18n-placeholder]").forEach(function (node) {
      var value = getT(node.getAttribute("data-i18n-placeholder"), lang);
      if (typeof value === "string") {
        node.setAttribute("placeholder", value);
      }
    });

    qa("[data-i18n-aria-label]").forEach(function (node) {
      var value = getT(node.getAttribute("data-i18n-aria-label"), lang);
      if (typeof value === "string") {
        node.setAttribute("aria-label", value);
      }
    });

    qa("[data-i18n-alt]").forEach(function (node) {
      var value = getT(node.getAttribute("data-i18n-alt"), lang);
      if (typeof value === "string") {
        node.setAttribute("alt", value);
      }
    });
  }

  function applyMetaTranslations(lang) {
    var map = [
      { key: "meta.title", type: "title" },
      { key: "meta.description", selector: 'meta[name="description"]' },
      { key: "meta.ogTitle", selector: 'meta[property="og:title"]' },
      { key: "meta.ogDescription", selector: 'meta[property="og:description"]' },
      { key: "meta.twitterTitle", selector: 'meta[name="twitter:title"]' },
      { key: "meta.twitterDescription", selector: 'meta[name="twitter:description"]' }
    ];

    map.forEach(function (item) {
      var value = getT(item.key, lang);
      if (typeof value !== "string") {
        return;
      }
      if (item.type === "title") {
        document.title = value;
        return;
      }
      var el = q(item.selector);
      if (el) {
        el.setAttribute("content", value);
      }
    });
  }

  function setLangButtonState(lang) {
    qa(".lang-btn").forEach(function (btn) {
      var active = btn.getAttribute("data-lang") === lang;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
      btn.setAttribute("tabindex", active ? "0" : "-1");
    });
  }

  function updateLanguageChip(lang) {
    var chip = q("#lang-chip");
    if (!chip) {
      return;
    }
    chip.textContent = LANGUAGE_LABELS[lang] || String(lang || "").toUpperCase();
  }

  function initChoiceGroupKeyboard(selector) {
    var buttons = qa(selector);
    if (!buttons.length) {
      return;
    }

    buttons.forEach(function (button, index) {
      button.addEventListener("keydown", function (event) {
        var key = event.key;
        if (key !== "ArrowRight" && key !== "ArrowLeft" && key !== "Home" && key !== "End") {
          return;
        }
        event.preventDefault();
        var nextIndex = index;
        if (key === "ArrowRight") {
          nextIndex = (index + 1) % buttons.length;
        } else if (key === "ArrowLeft") {
          nextIndex = (index - 1 + buttons.length) % buttons.length;
        } else if (key === "Home") {
          nextIndex = 0;
        } else if (key === "End") {
          nextIndex = buttons.length - 1;
        }
        var nextButton = buttons[nextIndex];
        if (nextButton) {
          nextButton.focus();
          nextButton.click();
        }
      });
    });
  }

  function setLanguage(lang, options) {
    var settings = options || {};
    var safeLang = normalizeLang(lang) || DEFAULT_LANG;
    currentLang = safeLang;

    document.documentElement.setAttribute("lang", safeLang);
    document.documentElement.setAttribute("data-lang", safeLang);

    applyI18nToDom(safeLang);
    applyMetaTranslations(safeLang);
    setLangButtonState(safeLang);
    updateLanguageChip(safeLang);
    languageChangeHooks.forEach(function (callback) {
      try {
        callback(safeLang);
      } catch (err) {
        /* noop */
      }
    });

    if (settings.persist !== false) {
      try {
        window.localStorage.setItem(LANG_STORAGE_KEY, safeLang);
      } catch (err) {
        /* noop */
      }
    }
    if (settings.updateUrl) {
      setUrlLang(safeLang);
    }
  }

  function collectDomI18nKeys() {
    var keys = [];
    qa("[data-i18n]").forEach(function (n) { keys.push(n.getAttribute("data-i18n")); });
    qa("[data-i18n-placeholder]").forEach(function (n) { keys.push(n.getAttribute("data-i18n-placeholder")); });
    qa("[data-i18n-aria-label]").forEach(function (n) { keys.push(n.getAttribute("data-i18n-aria-label")); });
    qa("[data-i18n-alt]").forEach(function (n) { keys.push(n.getAttribute("data-i18n-alt")); });
    return Array.from(new Set(keys.filter(Boolean)));
  }

  function reportMissingTranslationKeys() {
    if (!translations) {
      return;
    }
    var required = collectDomI18nKeys();
    SUPPORTED_LANGS.forEach(function (lang) {
      var dict = translations[lang] || {};
      var missing = required.filter(function (key) {
        return !Object.prototype.hasOwnProperty.call(dict, key);
      });
      if (missing.length > 0) {
        console.warn("Missing translation keys for language:", lang, missing);
      }
    });
  }

  function initLanguageSwitcher() {
    initChoiceGroupKeyboard(".lang-btn");
    qa(".lang-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var lang = normalizeLang(btn.getAttribute("data-lang"));
        if (lang && lang !== currentLang) {
          setLanguage(lang, { persist: true, updateUrl: true });
          var messageTemplate = getT("ui.toast.lang", lang) || "Language switched to {lang}.";
          showToast(applyTemplate(messageTemplate, { lang: String(lang).toUpperCase() }));
          trackMetric("lang_change", { lang: lang });
        }
      });
    });
  }

  function initMotionSwitcher() {
    initChoiceGroupKeyboard(".motion-btn");
    qa(".motion-btn").forEach(function (button) {
      button.addEventListener("click", function () {
        var mode = button.getAttribute("data-motion");
        if (!mode || mode === userMotionMode) {
          return;
        }
        applyMotionMode(mode, { persist: true, toast: true });
        trackMetric("motion_mode", { mode: mode });
      });
    });
  }

  function initMobileNav() {
    var hamburger = q("#hamburger");
    var navLinks = q("#nav-links");
    var navOverlay = q("#nav-overlay");
    var body = document.body;
    var lastFocusedElement = null;
    if (!hamburger || !navLinks || !navOverlay) {
      return { close: function () {}, isOpen: function () { return false; } };
    }

    function getMenuFocusableItems() {
      return qa("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])", navLinks).filter(function (el) {
        return !el.hasAttribute("disabled");
      });
    }

    function closeMenu() {
      navLinks.classList.remove("open");
      navOverlay.classList.remove("open");
      hamburger.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
      body.style.overflow = "";
      if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
        lastFocusedElement.focus();
      }
      lastFocusedElement = null;
    }

    function openMenu() {
      lastFocusedElement = document.activeElement;
      navLinks.classList.add("open");
      navOverlay.classList.add("open");
      hamburger.classList.add("open");
      hamburger.setAttribute("aria-expanded", "true");
      body.style.overflow = "hidden";
      var focusable = getMenuFocusableItems();
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    }

    hamburger.addEventListener("click", function () {
      if (navLinks.classList.contains("open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    navOverlay.addEventListener("click", closeMenu);
    qa(".nav-links a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key !== "Tab" || !navLinks.classList.contains("open")) {
        return;
      }
      var focusable = getMenuFocusableItems();
      if (!focusable.length) {
        return;
      }
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    return {
      close: closeMenu,
      isOpen: function () { return navLinks.classList.contains("open"); }
    };
  }

  function initScrollProgress() {
    var bar = q("#scroll-progress");
    if (!bar) {
      return;
    }

    function update() {
      var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = scrollHeight > 0 ? (window.pageYOffset / scrollHeight) * 100 : 0;
      bar.style.width = Math.max(0, Math.min(100, progress)) + "%";
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  function resolveHashAlias(hash) {
    if (hash === "#tech-stack") {
      return "#drawings";
    }
    return hash;
  }

  function scrollToHash(hash, behavior) {
    if (!hash || hash.charAt(0) !== "#") {
      return;
    }
    var resolvedHash = resolveHashAlias(hash);
    var target = q(resolvedHash);
    if (!target) {
      return;
    }
    var nav = q("#navbar");
    var navOffset = nav ? nav.offsetHeight + 14 : 0;
    var top = target.getBoundingClientRect().top + window.pageYOffset - navOffset;
    var resolvedBehavior = behavior || (isReducedMotion() ? "auto" : "smooth");
    window.scrollTo({ top: Math.max(0, top), behavior: resolvedBehavior });
  }

  function initAnchorScroll(menuApi) {
    qa('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (event) {
        var hash = link.getAttribute("href");
        var resolvedHash = resolveHashAlias(hash);
        if (!hash || hash === "#" || link.classList.contains("skip-link") || !q(resolvedHash)) {
          return;
        }
        event.preventDefault();
        scrollToHash(resolvedHash, "smooth");
        try {
          var url = new URL(window.location.href);
          url.hash = resolvedHash;
          window.history.replaceState({}, "", url.toString());
        } catch (err) {
          window.location.hash = resolvedHash;
        }
        if (menuApi && typeof menuApi.close === "function") {
          menuApi.close();
        }
      });
    });

    window.addEventListener("hashchange", function () {
      scrollToHash(window.location.hash, "smooth");
    });

    if (window.location.hash && q(resolveHashAlias(window.location.hash))) {
      window.setTimeout(function () { scrollToHash(window.location.hash, "auto"); }, 50);
    }
  }

  function initAnchorPrefetchHints() {
    qa('.nav-links a[href^="#"]').forEach(function (link) {
      function prefetchTarget() {
        var hash = resolveHashAlias(link.getAttribute("href") || "");
        var target = q(hash);
        if (!target) {
          return;
        }
        var lazyImage = q(".lazy-media[data-src]", target);
        if (lazyImage) {
          assignDrawingMediaSrc(lazyImage, "data-src");
        }
        if (hash === "#work") {
          qa(".behance-grid iframe[data-src]").slice(0, 4).forEach(function (pendingFrame) {
            hydrateBehanceIframe(pendingFrame);
          });
        }
      }
      link.addEventListener("mouseenter", prefetchTarget, { passive: true });
      link.addEventListener("focus", prefetchTarget);
    });
  }

  function initActiveNavAndScrollState() {
    var navbar = q("#navbar");
    var navLinks = qa('.nav-links a[href^="#"]');
    var sections = qa("main section[id]");
    var scrollTopBtn = q("#scroll-top");
    var lastActiveId = "";
    var ticking = false;

    function update() {
      var y = window.pageYOffset || 0;
      if (navbar) {
        navbar.classList.toggle("scrolled", y > 16);
      }
      if (scrollTopBtn) {
        scrollTopBtn.classList.toggle("visible", y > 520);
      }
      if (sections.length && navLinks.length) {
        var navHeight = navbar ? navbar.offsetHeight : 90;
        var marker = y + navHeight + 28;
        var currentId = null;
        sections.forEach(function (section) {
          if (section.offsetTop <= marker) {
            currentId = section.id;
          }
        });
        navLinks.forEach(function (link) {
          var isActive = link.getAttribute("href") === "#" + currentId;
          link.classList.toggle("active", isActive);
          if (isActive) {
            link.setAttribute("aria-current", "page");
          } else {
            link.removeAttribute("aria-current");
          }
        });
        if (currentId && currentId !== lastActiveId) {
          lastActiveId = currentId;
          try {
            var url = new URL(window.location.href);
            if (url.hash !== "#" + currentId) {
              url.hash = "#" + currentId;
              window.history.replaceState({}, "", url.toString());
            }
          } catch (err) {
            /* noop */
          }
        }
      }
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    if (scrollTopBtn) {
      scrollTopBtn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  function initRevealAnimations() {
    var revealItems = qa(".reveal");
    if (!revealItems.length) {
      return;
    }
    if (!("IntersectionObserver" in window) || isReducedMotion()) {
      revealItems.forEach(function (el) { el.classList.add("visible"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries, io) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -48px 0px" });

    revealItems.forEach(function (el) { observer.observe(el); });
  }

  function initCookieBar() {
    var cookieBar = q("#cookie-bar");
    var acceptBtn = q("#cookie-accept");
    var declineBtn = q("#cookie-decline");
    if (!cookieBar || !acceptBtn || !declineBtn) {
      return;
    }

    function hide() { cookieBar.classList.remove("visible"); }
    function setConsent(value) {
      try {
        window.localStorage.setItem(COOKIE_STORAGE_KEY, value);
      } catch (err) {
        /* noop */
      }
      hide();
    }

    var stored = null;
    try { stored = window.localStorage.getItem(COOKIE_STORAGE_KEY); } catch (err) { stored = null; }
    if (!stored) {
      window.setTimeout(function () { cookieBar.classList.add("visible"); }, 650);
    }
    acceptBtn.addEventListener("click", function () { setConsent("accepted"); });
    declineBtn.addEventListener("click", function () { setConsent("declined"); });
  }

  function initInstallPrompt() {
    var bar = q("#install-bar");
    if (!bar) { return; }
    var acceptBtn = q("#install-accept");
    var dismissBtn = q("#install-dismiss");
    var bodyEl = q("#install-body");
    var deferredPrompt = null;
    var DISMISS_KEY = "ek-pwa-install-dismissed";

    function alreadyInstalled() {
      try {
        return (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
          window.navigator.standalone === true;
      } catch (err) { return false; }
    }
    function isDismissed() {
      try { return window.localStorage.getItem(DISMISS_KEY) === "1"; } catch (err) { return false; }
    }
    function rememberDismiss() {
      try { window.localStorage.setItem(DISMISS_KEY, "1"); } catch (err) { /* noop */ }
    }
    function localize() {
      var title = q("#install-title");
      if (title) { title.textContent = getT("pwa.install.title", currentLang) || title.textContent; }
      if (bodyEl) { bodyEl.textContent = getT("pwa.install.body", currentLang) || bodyEl.textContent; }
      if (acceptBtn) { acceptBtn.textContent = getT("pwa.install.accept", currentLang) || acceptBtn.textContent; }
      if (dismissBtn) { dismissBtn.textContent = getT("pwa.install.dismiss", currentLang) || dismissBtn.textContent; }
    }
    function show() {
      if (alreadyInstalled() || isDismissed()) { return; }
      localize();
      bar.hidden = false;
      window.setTimeout(function () { bar.classList.add("visible"); }, 60);
    }
    function hide() {
      bar.classList.remove("visible");
      window.setTimeout(function () { bar.hidden = true; }, 450);
    }

    var isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent || "") && !window.MSStream;

    window.addEventListener("beforeinstallprompt", function (event) {
      event.preventDefault();
      deferredPrompt = event;
      show();
    });

    if (acceptBtn) {
      acceptBtn.addEventListener("click", function () {
        if (deferredPrompt && typeof deferredPrompt.prompt === "function") {
          deferredPrompt.prompt();
          if (deferredPrompt.userChoice && typeof deferredPrompt.userChoice.then === "function") {
            deferredPrompt.userChoice.then(function () { deferredPrompt = null; });
          }
          hide();
        } else if (isIOS && bodyEl) {
          bodyEl.textContent = getT("pwa.install.ios", currentLang) || "Paylaş → Ana Ekrana Ekle";
          acceptBtn.hidden = true;
        }
      });
    }
    if (dismissBtn) {
      dismissBtn.addEventListener("click", function () { rememberDismiss(); hide(); });
    }

    if (isIOS && !alreadyInstalled() && !isDismissed()) {
      if (bodyEl) { bodyEl.textContent = getT("pwa.install.ios", currentLang) || bodyEl.textContent; }
      if (acceptBtn) { acceptBtn.hidden = true; }
      show();
    }

    window.addEventListener("appinstalled", function () { rememberDismiss(); hide(); });
  }

  function emitBehanceStateChange() {
    try {
      window.dispatchEvent(new CustomEvent("ek:behance-state"));
    } catch (err) {
      /* noop */
    }
  }

  function extractBehanceProjectId(url) {
    var value = String(url || "");
    var match = value.match(/\/project\/(\d+)/i) || value.match(/\/gallery\/(\d+)/i);
    return match && match[1] ? match[1] : "";
  }

  function resolveBehanceProjectUrl(iframe) {
    if (!iframe) {
      return "https://www.behance.net/emirhankudun";
    }
    var source = normalizeBehanceEmbedSrc(iframe.getAttribute("data-embed-base"))
      || normalizeBehanceEmbedSrc(iframe.getAttribute("src"))
      || normalizeBehanceEmbedSrc(iframe.getAttribute("data-src"));
    var projectId = extractBehanceProjectId(source);
    if (projectId) {
      return "https://www.behance.net/gallery/" + projectId;
    }
    return "https://www.behance.net/emirhankudun";
  }

  function retryBehanceIframe(iframe, options) {
    if (!iframe) {
      return;
    }
    var settings = options || {};
    var source = normalizeBehanceEmbedSrc(iframe.getAttribute("data-embed-base"))
      || normalizeBehanceEmbedSrc(iframe.getAttribute("src"))
      || normalizeBehanceEmbedSrc(iframe.getAttribute("data-src"));
    if (!source) {
      return;
    }
    var cleanSource = normalizeBehanceEmbedSrc(String(source).replace(/[?&]ek_retry=\d+/g, ""));
    if (!cleanSource) {
      return;
    }
    iframe.setAttribute("data-embed-base", cleanSource);
    iframe.removeAttribute("data-src");
    iframe.removeAttribute("src");
    var separator = cleanSource.indexOf("?") === -1 ? "?" : "&";
    iframe.setAttribute("src", cleanSource + separator + "ek_retry=" + Date.now());
    if (typeof iframe.__ekStartFailWatch === "function") {
      iframe.__ekStartFailWatch();
    }
    if (settings.fromRetry) {
      trackMetric("behance_retry", { source: "card_retry", project: extractBehanceProjectId(cleanSource) });
    }
    emitBehanceStateChange();
  }

  function setupIframe(iframe) {
    if (!iframe) {
      return;
    }
    var parent = iframe.closest(".b-item");
    function setStatus(status) {
      if (!parent) {
        return;
      }
      var key = "wk.embed.loading";
      var fallback = "yukleniyor";
      if (status === "failed") {
        key = "wk.embed.failed";
        fallback = "Yuklenemedi. Behance'de acin.";
      } else if (status === "delayed") {
        key = "wk.embed.slow";
        fallback = "Yukleme beklenenden uzun suruyor.";
      }
      parent.setAttribute("data-status", getT(key, currentLang) || fallback);
      parent.classList.toggle("failed", status === "failed");
      if (status !== "loaded") {
        parent.classList.remove("loaded");
      }
      parent.setAttribute("data-load-state", status);
      if (status === "failed") {
        parent.setAttribute("tabindex", "0");
        parent.setAttribute("role", "button");
      } else {
        parent.removeAttribute("tabindex");
        parent.removeAttribute("role");
      }
      emitBehanceStateChange();
    }

    if (parent && !iframe.__ekBindDone) {
      var embedBase = normalizeBehanceEmbedSrc(iframe.getAttribute("src"))
        || normalizeBehanceEmbedSrc(iframe.getAttribute("data-src"));
      if (embedBase) {
        iframe.setAttribute("data-embed-base", embedBase);
      }

      var actionRow = document.createElement("div");
      actionRow.className = "b-item-actions";

      var meta = document.createElement("span");
      meta.className = "b-item-meta";
      meta.textContent = iframe.getAttribute("title") || "Project";

      var links = document.createElement("span");
      links.className = "b-item-links";

      var retryButton = document.createElement("button");
      retryButton.type = "button";
      retryButton.className = "b-mini-btn b-retry";
      retryButton.textContent = getT("wk.embed.retry", currentLang) || "Retry";
      retryButton.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        retryBehanceIframe(iframe, { fromRetry: true });
      });

      var openLink = document.createElement("a");
      openLink.className = "b-mini-btn b-open";
      openLink.setAttribute("target", "_blank");
      openLink.setAttribute("rel", "noopener noreferrer");
      openLink.href = resolveBehanceProjectUrl(iframe);
      openLink.textContent = getT("wk.embed.open", currentLang) || "Open";
      openLink.addEventListener("click", function () {
        trackMetric("behance_click", { source: "card_open", href: openLink.href });
      });

      links.appendChild(retryButton);
      links.appendChild(openLink);
      actionRow.appendChild(meta);
      actionRow.appendChild(links);
      parent.appendChild(actionRow);

      iframe.__ekRetryButton = retryButton;
      iframe.__ekOpenLink = openLink;
      iframe.__ekMeta = meta;

      setStatus("loading");
      function startFailWatch() {
        if (iframe.__ekFailTimer) {
          window.clearTimeout(iframe.__ekFailTimer);
        }
        if (iframe.__ekSlowTimer) {
          window.clearTimeout(iframe.__ekSlowTimer);
        }
        setStatus("loading");
        iframe.__ekSlowTimer = window.setTimeout(function () {
          if (!parent.classList.contains("loaded") && !parent.classList.contains("failed")) {
            setStatus("delayed");
          }
        }, 2200);
        iframe.__ekFailTimer = window.setTimeout(function () {
          if (!parent.classList.contains("loaded")) {
            setStatus("failed");
          }
        }, 8000);
      }
      iframe.__ekStartFailWatch = startFailWatch;
      if (iframe.getAttribute("src")) {
        startFailWatch();
      }

      iframe.addEventListener("load", function () {
        if (iframe.__ekFailTimer) {
          window.clearTimeout(iframe.__ekFailTimer);
          iframe.__ekFailTimer = null;
        }
        if (iframe.__ekSlowTimer) {
          window.clearTimeout(iframe.__ekSlowTimer);
          iframe.__ekSlowTimer = null;
        }
        parent.classList.remove("failed");
        parent.classList.add("loaded");
        parent.setAttribute("data-load-state", "loaded");
        if (iframe.__ekOpenLink) {
          iframe.__ekOpenLink.href = resolveBehanceProjectUrl(iframe);
        }
        emitBehanceStateChange();
      });

      iframe.addEventListener("error", function () {
        if (iframe.__ekFailTimer) {
          window.clearTimeout(iframe.__ekFailTimer);
          iframe.__ekFailTimer = null;
        }
        if (iframe.__ekSlowTimer) {
          window.clearTimeout(iframe.__ekSlowTimer);
          iframe.__ekSlowTimer = null;
        }
        setStatus("failed");
      });

      parent.addEventListener("click", function () {
        if (!parent.classList.contains("failed")) {
          return;
        }
        var href = resolveBehanceProjectUrl(iframe);
        trackMetric("behance_click", { source: "failed_embed", href: href });
        window.open(href, "_blank", "noopener,noreferrer");
      });
      parent.addEventListener("keydown", function (event) {
        if (!parent.classList.contains("failed")) {
          return;
        }
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          var href = resolveBehanceProjectUrl(iframe);
          trackMetric("behance_click", { source: "failed_embed_keyboard", href: href });
          window.open(href, "_blank", "noopener,noreferrer");
        }
      });

      iframe.__ekBindDone = true;
    }

    if (iframe.getAttribute("src")) {
      iframe.setAttribute("loading", "eager");
      return;
    }
    iframe.setAttribute("loading", "lazy");
  }

  function hydrateBehanceIframe(iframe) {
    if (!iframe || iframe.getAttribute("src")) {
      return;
    }
    if (assignBehanceIframeSrc(iframe, "data-src")) {
      if (typeof iframe.__ekStartFailWatch === "function") {
        iframe.__ekStartFailWatch();
      }
    }
  }

  function initBehanceLazyLoad() {
    var iframes = qa(".behance-grid iframe");
    var progressNode = q("#behance-progress");
    var retryFailedButton = q("#behance-retry-failed");
    var loadAllButton = q("#behance-load-all");
    var filterButtons = qa(".behance-filter-btn[data-behance-filter]");
    var workSection = q("#work");
    var activeBehanceFilter = "all";
    if (!iframes.length) {
      return;
    }

    function loadPendingIframes(limit) {
      var pending = qa(".behance-grid iframe[data-src]");
      var max = typeof limit === "number" ? Math.min(Math.max(limit, 0), pending.length) : pending.length;
      for (var i = 0; i < max; i += 1) {
        hydrateBehanceIframe(pending[i]);
      }
      return max;
    }

    function updateLoadAllButton() {
      if (!loadAllButton) {
        return;
      }
      var pendingCount = qa(".behance-grid iframe[data-src]").length;
      if (pendingCount > 0) {
        loadAllButton.disabled = false;
        loadAllButton.textContent = getT("wk.embed.loadAll", currentLang) || "Load all embeds";
      } else {
        loadAllButton.disabled = true;
        loadAllButton.textContent = getT("wk.embed.loadAll.done", currentLang) || "All embeds ready";
      }
    }

    function syncBehanceFilterState() {
      filterButtons.forEach(function (button) {
        var active = button.getAttribute("data-behance-filter") === activeBehanceFilter;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }

    function applyBehanceFilter(filterValue, options) {
      var settings = options || {};
      var nextFilter = filterValue === "failed" ? "failed" : "all";
      activeBehanceFilter = nextFilter;
      qa(".behance-grid .b-item").forEach(function (item) {
        var visible = nextFilter !== "failed" || item.classList.contains("failed");
        item.classList.toggle("is-status-hidden", !visible);
      });
      syncBehanceFilterState();
      if (!settings.silent) {
        trackMetric("behance_filter", { filter: nextFilter });
      }
    }

    function updateBehanceProgress() {
      if (!progressNode) {
        return;
      }
      var loaded = qa(".behance-grid .b-item.loaded").length;
      var failed = qa(".behance-grid .b-item.failed").length;
      var pending = Math.max(0, iframes.length - loaded - failed);
      var template = getT("wk.embed.progress", currentLang) || "Behance {loaded}/{total} · pending {pending} · failed {failed}";
      progressNode.textContent = applyTemplate(template, {
        loaded: loaded,
        total: iframes.length,
        failed: failed,
        pending: pending
      });
      updateLoadAllButton();
    }

    function syncBehanceActionLabels() {
      iframes.forEach(function (iframe) {
        if (iframe.__ekRetryButton) {
          iframe.__ekRetryButton.textContent = getT("wk.embed.retry", currentLang) || "Retry";
        }
        if (iframe.__ekOpenLink) {
          iframe.__ekOpenLink.textContent = getT("wk.embed.open", currentLang) || "Open";
          iframe.__ekOpenLink.href = resolveBehanceProjectUrl(iframe);
        }
      });
      if (retryFailedButton) {
        retryFailedButton.textContent = getT("wk.embed.retry.all", currentLang) || "Retry failed embeds";
      }
      updateLoadAllButton();
      updateBehanceProgress();
    }

    window.addEventListener("ek:behance-state", function () {
      updateBehanceProgress();
      applyBehanceFilter(activeBehanceFilter, { silent: true });
    });

    iframes.forEach(function (iframe, index) {
      setupIframe(iframe);
      if (index < 3) {
        iframe.setAttribute("fetchpriority", "high");
      }
      if (index < BEHANCE_EAGER_COUNT) {
        hydrateBehanceIframe(iframe);
      }
    });

    var lazyIframes = iframes.filter(function (iframe, index) {
      return index >= BEHANCE_EAGER_COUNT && !!iframe.getAttribute("data-src");
    });

    if (lazyIframes.length) {
      if (!("IntersectionObserver" in window)) {
        lazyIframes.forEach(hydrateBehanceIframe);
      } else {
        var observer = new IntersectionObserver(function (entries, io) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              hydrateBehanceIframe(entry.target);
              io.unobserve(entry.target);
            }
          });
        }, { threshold: 0.08, rootMargin: "420px 0px 420px 0px" });
        lazyIframes.forEach(function (iframe) { observer.observe(iframe); });
      }
    }

    if (workSection) {
      if (!("IntersectionObserver" in window)) {
        loadPendingIframes(8);
      } else {
        var sectionWarmup = new IntersectionObserver(function (entries, io) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              loadPendingIframes(8);
              io.unobserve(entry.target);
            }
          });
        }, { threshold: 0.05, rootMargin: "360px 0px 360px 0px" });
        sectionWarmup.observe(workSection);
      }
    }

    if (window.location.hash === "#work") {
      loadPendingIframes(10);
    }

    onLanguageChange(function () {
      qa(".behance-grid .b-item").forEach(function (item) {
        if (item.classList.contains("loaded")) {
          return;
        }
        var failed = item.classList.contains("failed");
        var delayed = item.getAttribute("data-load-state") === "delayed";
        var key = failed ? "wk.embed.failed" : (delayed ? "wk.embed.slow" : "wk.embed.loading");
        var fallback = failed ? "Yuklenemedi. Behance'de acin." : (delayed ? "Yukleme beklenenden uzun suruyor." : "yukleniyor");
        item.setAttribute("data-status", getT(key, currentLang) || fallback);
      });
      syncBehanceActionLabels();
    });

    initChoiceGroupKeyboard(".behance-filter-btn[data-behance-filter]");
    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        applyBehanceFilter(button.getAttribute("data-behance-filter"));
      });
    });

    if (retryFailedButton) {
      retryFailedButton.addEventListener("click", function () {
        var failedIframes = qa(".behance-grid .b-item.failed iframe");
        if (!failedIframes.length) {
          showToast(getT("wk.embed.retry.none", currentLang) || "No failed embeds to retry.");
          return;
        }
        failedIframes.forEach(function (iframe) {
          retryBehanceIframe(iframe, { fromRetry: true });
        });
        trackMetric("behance_retry", { source: "batch_retry", count: failedIframes.length });
      });
    }

    if (loadAllButton) {
      loadAllButton.addEventListener("click", function () {
        var hydrated = loadPendingIframes();
        if (hydrated > 0) {
          showToast(getT("wk.embed.loadAll.toast", currentLang) || "Remaining embeds are loading.");
          trackMetric("behance_load_all", { hydrated: hydrated });
        } else {
          showToast(getT("wk.embed.loadAll.done", currentLang) || "All embeds ready.");
        }
        updateLoadAllButton();
        updateBehanceProgress();
      });
    }

    applyBehanceFilter(activeBehanceFilter, { silent: true });
    syncBehanceActionLabels();
    updateBehanceProgress();

    qa("#work .btn-secondary[href*='behance.net']").forEach(function (link) {
      link.addEventListener("click", function () {
        trackMetric("behance_click", { source: "work_cta" });
      });
    });
  }

  function initLazyMediaViewportTrigger() {
    var items = qa(".lazy-media[data-src]");
    if (!items.length) {
      return;
    }

    function loadMedia(el) {
      assignDrawingMediaSrc(el, "data-src");
    }

    if (!("IntersectionObserver" in window)) {
      items.forEach(loadMedia);
      return;
    }

    var observer = new IntersectionObserver(function (entries, io) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          loadMedia(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: "200px 0px 200px 0px" });

    items.forEach(function (el) { observer.observe(el); });
  }

  function initDrawingsQuickHydration() {
    var section = q("#drawings");
    if (!section) {
      return;
    }

    function hydrateAllDrawings() {
      qa("#drawings img[data-src]").forEach(function (img) {
        assignDrawingMediaSrc(img, "data-src");
      });
    }

    if (!("IntersectionObserver" in window)) {
      hydrateAllDrawings();
      return;
    }

    var observer = new IntersectionObserver(function (entries, io) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          hydrateAllDrawings();
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.01, rootMargin: "360px 0px 360px 0px" });

    observer.observe(section);
  }

  function initDrawingsGallery() {
    var cards = qa(".drawing-card[data-category][data-index]");
    var groups = qa(".drawings-group");
    var filterButtons = qa(".draw-filter-btn[data-filter]");
    var emptyState = q("#drawings-empty");
    var summaryNode = q("#drawings-summary");
    var lightbox = q("#drawing-lightbox");
    var lightboxPanel = q(".lightbox-panel", lightbox);
    var lightboxImage = q("#lightbox-image");
    var lightboxCaption = q("#lightbox-caption");
    var lightboxCounter = q("#lightbox-counter");
    var closeButton = q("#lightbox-close");
    var prevButton = q("#lightbox-prev");
    var nextButton = q("#lightbox-next");
    var backdrop = q(".lightbox-backdrop", lightbox);
    if (!cards.length || !lightbox || !lightboxPanel || !lightboxImage || !lightboxCaption || !lightboxCounter || !closeButton || !prevButton || !nextButton || !backdrop) {
      return;
    }
    initChoiceGroupKeyboard(".draw-filter-btn[data-filter]");

    var visibleCards = cards.slice();
    var activeIndex = -1;
    var lastTrigger = null;
    var currentFilter = "all";
    var touchArmedCard = null;
    var touchStartX = 0;
    var touchStartY = 0;

    function categoryKey(category) {
      return category === "karakalem" ? "filters.karakalem" : "filters.color";
    }

    function categoryFallback(category) {
      return category === "karakalem" ? "Karakalem" : "Kuru Boya";
    }

    function getFilterLabel(filterValue, lang) {
      if (filterValue === "karakalem") {
        return getT("filters.karakalem", lang) || categoryFallback("karakalem");
      }
      if (filterValue === "kuru-boya") {
        return getT("filters.color", lang) || categoryFallback("kuru-boya");
      }
      return getT("filters.all", lang) || "All";
    }

    function readCardImage(card) {
      var image = q("img", card);
      if (!image) {
        return null;
      }
      var dataSrc = image.getAttribute("data-src");
      if (dataSrc) {
        assignDrawingMediaSrc(image, "data-src");
      }
      return image;
    }

    function buildCardLabel(card, lang) {
      var category = card.getAttribute("data-category") || "renk";
      var index = card.getAttribute("data-index") || "";
      var categoryLabel = getT(categoryKey(category), lang) || categoryFallback(category);
      var template = getT("gallery.alt.template", lang) || "{category} - {index}";
      return applyTemplate(template, {
        category: categoryLabel,
        index: String(index)
      }).trim();
    }

    function refreshCardLabels(lang) {
      cards.forEach(function (card) {
        var image = q("img", card);
        var label = buildCardLabel(card, lang);
        if (image) {
          image.setAttribute("alt", label);
        }
        card.setAttribute("aria-label", label);
      });
      if (!lightbox.hidden) {
        updateLightbox();
      }
      updateSummary();
    }

    function updateSummary() {
      if (!summaryNode) {
        return;
      }
      var template = getT("draw.summary.template", currentLang) || "{visible}/{total} visible · {filter}";
      summaryNode.textContent = applyTemplate(template, {
        visible: visibleCards.length,
        total: cards.length,
        filter: getFilterLabel(currentFilter, currentLang)
      });
    }

    function updateCounter() {
      if (!lightboxCounter || activeIndex < 0 || !visibleCards.length) {
        return;
      }
      var template = getT("lightbox.counter", currentLang) || "{current} / {total}";
      lightboxCounter.textContent = applyTemplate(template, {
        current: activeIndex + 1,
        total: visibleCards.length
      });
    }

    function updateLightbox() {
      var card = visibleCards[activeIndex];
      if (!card) {
        return;
      }
      var image = readCardImage(card);
      if (!image) {
        return;
      }
      lightboxImage.setAttribute("src", normalizeDrawingMediaSrc(image.getAttribute("src")) || "");
      lightboxImage.setAttribute("alt", image.getAttribute("alt") || "");
      lightboxCaption.textContent = image.getAttribute("alt") || "";
      updateCounter();
    }

    function disarmTouchCard() {
      if (!touchArmedCard) {
        return;
      }
      touchArmedCard.classList.remove("is-armed");
      touchArmedCard = null;
    }

    function armTouchCard(card) {
      if (touchArmedCard && touchArmedCard !== card) {
        touchArmedCard.classList.remove("is-armed");
      }
      touchArmedCard = card;
      card.classList.add("is-armed");
    }

    function applyFilter(filterValue) {
      var previousFilter = currentFilter;
      currentFilter = filterValue || "all";
      cards.forEach(function (card) {
        var category = card.getAttribute("data-category") || "";
        var visible = currentFilter === "all" || category === currentFilter;
        card.classList.toggle("is-filter-hidden", !visible);
      });

      groups.forEach(function (group) {
        var visibleCount = qa(".drawing-card:not(.is-filter-hidden)", group).length;
        group.hidden = visibleCount === 0;
      });

      visibleCards = cards.filter(function (card) {
        return !card.classList.contains("is-filter-hidden");
      });

      filterButtons.forEach(function (button) {
        var active = button.getAttribute("data-filter") === currentFilter;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });

      if (emptyState) {
        emptyState.hidden = visibleCards.length > 0;
      }
      if (touchArmedCard && touchArmedCard.classList.contains("is-filter-hidden")) {
        disarmTouchCard();
      }
      if (!lightbox.hidden && visibleCards.length === 0) {
        closeLightbox();
      }
      updateSummary();
      if (previousFilter !== currentFilter) {
        trackMetric("gallery_filter", { filter: currentFilter, count: visibleCards.length });
      }
    }

    function openLightbox(card) {
      activeIndex = visibleCards.indexOf(card);
      if (activeIndex < 0) {
        return;
      }
      disarmTouchCard();
      lastTrigger = card;
      updateLightbox();
      lightbox.hidden = false;
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("lightbox-open");
      closeButton.focus();
      trackMetric("gallery_open", {
        category: card.getAttribute("data-category") || "",
        index: card.getAttribute("data-index") || ""
      });
    }

    function closeLightbox() {
      if (lightbox.hidden) {
        return;
      }
      lightbox.hidden = true;
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lightbox-open");
      if (lastTrigger) {
        lastTrigger.focus();
      }
    }

    function stepLightbox(direction) {
      if (!visibleCards.length) {
        return;
      }
      activeIndex = (activeIndex + direction + visibleCards.length) % visibleCards.length;
      updateLightbox();
    }

    cards.forEach(function (card) {
      card.addEventListener("click", function (event) {
        visibleCards = cards.filter(function (candidate) {
          return !candidate.classList.contains("is-filter-hidden");
        });
        if (COARSE_POINTER && touchArmedCard !== card) {
          event.preventDefault();
          armTouchCard(card);
          return;
        }
        openLightbox(card);
      });
    });

    document.addEventListener("pointerdown", function (event) {
      if (!COARSE_POINTER || !touchArmedCard || lightbox.contains(event.target)) {
        return;
      }
      if (!event.target.closest(".drawing-card")) {
        disarmTouchCard();
      }
    });

    closeButton.addEventListener("click", closeLightbox);
    backdrop.addEventListener("click", closeLightbox);
    prevButton.addEventListener("click", function () { stepLightbox(-1); });
    nextButton.addEventListener("click", function () { stepLightbox(1); });

    document.addEventListener("keydown", function (event) {
      if (lightbox.hidden) {
        return;
      }
      if (event.key === "Escape") {
        closeLightbox();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        stepLightbox(-1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        stepLightbox(1);
      }
      if (event.key === "Tab") {
        var focusables = qa("#lightbox-close, #lightbox-prev, #lightbox-next");
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (!first || !last) {
          return;
        }
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    lightboxPanel.addEventListener("touchstart", function (event) {
      if (!event.touches || !event.touches[0]) {
        return;
      }
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    }, { passive: true });

    lightboxPanel.addEventListener("touchend", function (event) {
      if (!event.changedTouches || !event.changedTouches[0]) {
        return;
      }
      var deltaX = event.changedTouches[0].clientX - touchStartX;
      var deltaY = event.changedTouches[0].clientY - touchStartY;
      if (Math.abs(deltaX) < 52 || Math.abs(deltaX) < Math.abs(deltaY)) {
        return;
      }
      stepLightbox(deltaX > 0 ? -1 : 1);
    }, { passive: true });

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        applyFilter(button.getAttribute("data-filter"));
      });
    });

    onLanguageChange(refreshCardLabels);
    refreshCardLabels(currentLang);
    applyFilter(currentFilter);
  }

  function initStatsCounter() {
    var counterEls = qa(".stat-num");
    if (!counterEls.length || isReducedMotion()) {
      return;
    }

    function animateCounter(el) {
      var suffixNode = el.querySelector("span");
      var suffix = suffixNode ? suffixNode.textContent : "";
      var target = parseInt(el.textContent, 10);
      if (!target || Number.isNaN(target)) {
        return;
      }
      var start = null;
      var duration = 1400;

      function step(timestamp) {
        if (!start) {
          start = timestamp;
        }
        var progress = Math.min((timestamp - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (suffix) {
          var span = document.createElement("span");
          span.textContent = suffix;
          el.appendChild(span);
        }
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      }

      window.requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) {
      counterEls.forEach(animateCounter);
      return;
    }

    var observer = new IntersectionObserver(function (entries, io) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    counterEls.forEach(function (el) { observer.observe(el); });
  }

  function initLanguageBars() {
    var fills = qa(".lang-fill");
    if (!fills.length || isReducedMotion()) {
      return;
    }

    fills.forEach(function (fill) {
      var width = fill.style.width || "0";
      fill.setAttribute("data-target-width", width);
      fill.style.width = "0";
    });

    if (!("IntersectionObserver" in window)) {
      fills.forEach(function (fill) { fill.style.width = fill.getAttribute("data-target-width") || "0"; });
      return;
    }

    var observer = new IntersectionObserver(function (entries, io) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var fill = entry.target;
          fill.style.width = fill.getAttribute("data-target-width") || "0";
          io.unobserve(fill);
        }
      });
    }, { threshold: 0.5 });

    fills.forEach(function (fill) { observer.observe(fill); });
  }

  function initMarqueePause() {
    var marquee = q(".marquee-track");
    if (!marquee) {
      return;
    }

    function pause() {
      marquee.style.animationPlayState = "paused";
    }

    function resume() {
      marquee.style.animationPlayState = "running";
    }

    marquee.addEventListener("mouseenter", pause);
    marquee.addEventListener("mouseleave", resume);
    marquee.addEventListener("focusin", pause);
    marquee.addEventListener("focusout", resume);

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        pause();
      } else {
        resume();
      }
    });
  }

  function initMagneticEffects() {
    if (isReducedMotion() || !FINE_POINTER) {
      return;
    }

    qa(".service-card").forEach(function (card) {
      card.addEventListener("mousemove", function (event) {
        var rect = card.getBoundingClientRect();
        var x = (event.clientX - rect.left - rect.width / 2) * 0.04;
        var y = (event.clientY - rect.top - rect.height / 2) * 0.04;
        card.style.transform = "translate(" + x + "px," + (y - 4) + "px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });

    qa(".b-item").forEach(function (card) {
      card.addEventListener("mousemove", function (event) {
        var rect = card.getBoundingClientRect();
        var rx = ((event.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -2.8;
        var ry = ((event.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 2.8;
        card.style.transform = "perspective(700px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) translateY(-3px)";
        card.style.transition = "transform .1s ease";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
        card.style.transition = "transform .45s cubic-bezier(0.16,1,0.3,1)";
      });
    });

    qa(".btn-primary, .form-submit").forEach(function (btn) {
      btn.addEventListener("mousemove", function (event) {
        var rect = btn.getBoundingClientRect();
        var x = (event.clientX - rect.left - rect.width / 2) * 0.12;
        var y = (event.clientY - rect.top - rect.height / 2) * 0.12;
        btn.style.transform = "translate(" + x + "px," + y + "px)";
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "";
      });
    });
  }

  function setFieldInvalidState(input, invalid) {
    var group = input ? input.closest(".form-group") : null;
    if (group) {
      group.classList.toggle("invalid", !!invalid);
    }
    if (input) {
      input.setAttribute("aria-invalid", invalid ? "true" : "false");
    }
  }

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value || "").trim());
  }

  function isValidName(value) {
    return String(value || "").trim().length > 1;
  }

  function isValidMessage(value) {
    return String(value || "").trim().length >= MIN_MESSAGE_LENGTH;
  }

  function validateContactForm(form) {
    var nameInput = q("#f-name", form);
    var emailInput = q("#f-email", form);
    var messageInput = q("#f-msg", form);
    var valid = true;

    if (nameInput) {
      var nameOk = isValidName(nameInput.value);
      setFieldInvalidState(nameInput, !nameOk);
      valid = valid && nameOk;
    }
    if (emailInput) {
      var emailOk = validateEmail(emailInput.value);
      setFieldInvalidState(emailInput, !emailOk);
      valid = valid && emailOk;
    }
    if (messageInput) {
      var messageOk = isValidMessage(messageInput.value);
      setFieldInvalidState(messageInput, !messageOk);
      valid = valid && messageOk;
    }
    return valid;
  }

  function resolveServerMessage(message, ok) {
    var map = {
      "Required fields are missing": "fm.server.required",
      "Invalid email": "fm.server.email",
      "Mail could not be sent": "fm.server.mail",
      "Method not allowed": "fm.server.method",
      "Spam ignored": "fm.server.spam"
    };
    var key = map[String(message || "")] || (ok ? "fm.ok" : "fm.server.generic");
    var translated = getT(key, currentLang);
    return typeof translated === "string" ? translated : String(message || "");
  }

  function showFormMessage(text, success) {
    var box = q("#form-ok");
    if (!box) {
      return;
    }
    box.textContent = text;
    box.style.color = success ? "#4ade80" : "#f87171";
    box.classList.add("visible");
  }

  function initContactForm() {
    var form = q("#contact-form");
    var submitButton = q("#form-submit");
    if (!form || !submitButton) {
      return;
    }

    var nameInput = q("#f-name", form);
    var emailInput = q("#f-email", form);
    var serviceInput = q("#f-svc", form);
    var messageInput = q("#f-msg", form);
    var messageCount = q("#f-msg-count", form);
    var draftNote = q("#form-draft-note", form);
    var briefButtons = qa(".brief-btn[data-brief]", form);
    var restoreButton = q("#draft-restore", form);
    var resetButton = q("#draft-reset", form);

    var activeDraftNoteKey = "";
    var noteTimer = null;

    var briefTemplateKeys = {
      scope: "fm.quick.tpl.scope",
      timeline: "fm.quick.tpl.timeline",
      budget: "fm.quick.tpl.budget"
    };

    function validateSingleField(input) {
      if (!input) {
        return true;
      }
      if (input === nameInput) {
        var nameOk = isValidName(nameInput.value);
        setFieldInvalidState(nameInput, !nameOk);
        return nameOk;
      }
      if (input === emailInput) {
        var emailOk = validateEmail(emailInput.value);
        setFieldInvalidState(emailInput, !emailOk);
        return emailOk;
      }
      if (input === messageInput) {
        var messageOk = isValidMessage(messageInput.value);
        setFieldInvalidState(messageInput, !messageOk);
        return messageOk;
      }
      return true;
    }

    function focusFirstInvalidField() {
      var firstInvalid = q(".form-group.invalid input, .form-group.invalid textarea, .form-group.invalid select", form);
      if (!firstInvalid) {
        return;
      }
      firstInvalid.focus();
      if (typeof firstInvalid.scrollIntoView === "function") {
        firstInvalid.scrollIntoView({ behavior: isReducedMotion() ? "auto" : "smooth", block: "center" });
      }
    }

    function updateMessageCount() {
      if (!messageInput || !messageCount) {
        return;
      }
      var value = String(messageInput.value || "").trim();
      var template = getT("fm.msg.count", currentLang) || "{count} / {min}";
      messageCount.textContent = applyTemplate(template, {
        count: value.length,
        min: MIN_MESSAGE_LENGTH
      });
    }

    function autoGrowMessage() {
      if (!messageInput) {
        return;
      }
      messageInput.style.height = "auto";
      messageInput.style.height = Math.max(130, messageInput.scrollHeight) + "px";
    }

    function canSubmit() {
      return validateEmail(emailInput ? emailInput.value : "") &&
        isValidName(nameInput ? nameInput.value : "") &&
        isValidMessage(messageInput ? messageInput.value : "");
    }

    function updateSubmitState() {
      var disabled = !canSubmit();
      submitButton.disabled = disabled;
      submitButton.classList.toggle("is-disabled", disabled);
    }

    function showDraftNote(noteKey) {
      if (!draftNote || !noteKey) {
        return;
      }
      activeDraftNoteKey = noteKey;
      draftNote.textContent = getT(noteKey, currentLang) || "";
      draftNote.classList.add("visible");
      if (noteTimer) {
        window.clearTimeout(noteTimer);
      }
      noteTimer = window.setTimeout(function () {
        draftNote.textContent = "";
        draftNote.classList.remove("visible");
      }, 2400);
    }

    function saveDraft() {
      if (!nameInput || !emailInput || !serviceInput || !messageInput) {
        return;
      }
      var payload = {
        name: String(nameInput.value || ""),
        email: String(emailInput.value || ""),
        service: String(serviceInput.value || ""),
        message: String(messageInput.value || ""),
        updatedAt: Date.now()
      };
      try {
        window.localStorage.setItem(FORM_DRAFT_STORAGE_KEY, JSON.stringify(payload));
      } catch (err) {
        /* noop */
      }
    }

    function readDraftPayload() {
      var raw = null;
      try {
        raw = window.localStorage.getItem(FORM_DRAFT_STORAGE_KEY);
      } catch (err) {
        raw = null;
      }
      if (!raw) {
        return null;
      }
      try {
        return JSON.parse(raw);
      } catch (err) {
        clearDraft();
        return null;
      }
    }

    function clearDraft() {
      try {
        window.localStorage.removeItem(FORM_DRAFT_STORAGE_KEY);
      } catch (err) {
        /* noop */
      }
    }

    function loadDraft(options) {
      var settings = options || {};
      if (!nameInput || !emailInput || !serviceInput || !messageInput) {
        return false;
      }
      var parsed = readDraftPayload();
      if (!parsed) {
        return false;
      }
      var force = settings.force === true;
      if ((force || !String(nameInput.value || "").trim()) && parsed.name) {
        nameInput.value = parsed.name;
      }
      if ((force || !String(emailInput.value || "").trim()) && parsed.email) {
        emailInput.value = parsed.email;
      }
      if ((force || !String(serviceInput.value || "").trim()) && parsed.service) {
        serviceInput.value = parsed.service;
      }
      if ((force || !String(messageInput.value || "").trim()) && parsed.message) {
        messageInput.value = parsed.message;
      }
      autoGrowMessage();
      showDraftNote(settings.force ? "fm.draft.restored" : "fm.draft.loaded");
      return true;
    }

    function appendBriefTemplate(type) {
      if (!messageInput) {
        return;
      }
      if (type === "clear") {
        messageInput.value = "";
        setFieldInvalidState(messageInput, false);
        saveDraft();
        autoGrowMessage();
        updateMessageCount();
        updateSubmitState();
        showDraftNote("fm.draft.cleared");
        messageInput.focus();
        return;
      }
      var templateKey = briefTemplateKeys[type];
      if (!templateKey) {
        return;
      }
      var template = getT(templateKey, currentLang) || "";
      if (!template) {
        return;
      }
      var current = String(messageInput.value || "").trim();
      messageInput.value = current ? current + "\n" + template : template;
      saveDraft();
      showDraftNote("fm.quick.inserted");
      setFieldInvalidState(messageInput, false);
      autoGrowMessage();
      updateMessageCount();
      updateSubmitState();
      messageInput.focus();
    }

    [nameInput, emailInput, messageInput].forEach(function (input) {
      if (!input) {
        return;
      }
      input.addEventListener("input", function () {
        setFieldInvalidState(input, false);
        saveDraft();
        autoGrowMessage();
        updateMessageCount();
        updateSubmitState();
      });
      input.addEventListener("blur", function () {
        validateSingleField(input);
      });
    });
    if (serviceInput) {
      serviceInput.addEventListener("change", saveDraft);
    }

    if (restoreButton) {
      restoreButton.addEventListener("click", function () {
        if (!loadDraft({ force: true })) {
          showDraftNote("fm.draft.none");
        }
        updateMessageCount();
        updateSubmitState();
      });
    }

    if (resetButton) {
      resetButton.addEventListener("click", function () {
        form.reset();
        [nameInput, emailInput, messageInput].forEach(function (input) {
          setFieldInvalidState(input, false);
        });
        clearDraft();
        showDraftNote("fm.draft.reset.done");
        autoGrowMessage();
        updateMessageCount();
        updateSubmitState();
        if (nameInput) {
          nameInput.focus();
        }
      });
    }

    briefButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        appendBriefTemplate(button.getAttribute("data-brief"));
      });
    });

    onLanguageChange(function () {
      if (draftNote && draftNote.classList.contains("visible") && activeDraftNoteKey) {
        draftNote.textContent = getT(activeDraftNoteKey, currentLang) || "";
      }
      updateMessageCount();
      updateSubmitState();
    });

    loadDraft();
    autoGrowMessage();
    updateMessageCount();
    updateSubmitState();

    function resolveSubmitEndpoint() {
      var candidateList = [
        String(window.__CONTACT_ENDPOINT__ || "").trim(),
        String(form.getAttribute("data-endpoint") || "").trim(),
        String(form.getAttribute("action") || "").trim(),
        "contact.php"
      ];
      for (var i = 0; i < candidateList.length; i += 1) {
        var endpoint = candidateList[i];
        if (!endpoint || endpoint === "#" || endpoint === "#contact") {
          continue;
        }
        return endpoint;
      }
      return "";
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (submitButton.classList.contains("loading")) {
        return;
      }
      var statusBox = q("#form-ok");
      if (statusBox) {
        statusBox.classList.remove("visible");
      }
      if (!validateContactForm(form)) {
        focusFirstInvalidField();
        showToast(getT("fm.server.required", currentLang) || "Lütfen zorunlu alanları doldurun.");
        return;
      }

      submitButton.classList.add("loading");
      submitButton.disabled = true;

      var submitEndpoint = resolveSubmitEndpoint();
      if (!submitEndpoint) {
        var fallbackEmail = String(window.__CONTACT_EMAIL__ || "emirhan@kudun.com").trim();
        var mailName = nameInput ? String(nameInput.value || "").trim() : "";
        var mailUserEmail = emailInput ? String(emailInput.value || "").trim() : "";
        var mailServiceEl = serviceInput ? serviceInput.options[serviceInput.selectedIndex] : null;
        var mailService = mailServiceEl ? String(mailServiceEl.text || "").trim() : "";
        var mailMessage = messageInput ? String(messageInput.value || "").trim() : "";
        var mailSubject = "[Portfolio] " + (mailName || "İletişim");
        var mailBody = [
          "Ad Soyad: " + mailName,
          "E-posta: " + mailUserEmail,
          mailService && mailService !== (getT("fm.svc.o", currentLang) || "Seçin...") ? ("Hizmet: " + mailService) : "",
          "",
          "Mesaj:",
          mailMessage
        ].filter(Boolean).join("\n");
        var mailtoHref = "mailto:" + encodeURIComponent(fallbackEmail) +
          "?subject=" + encodeURIComponent(mailSubject) +
          "&body=" + encodeURIComponent(mailBody);
        window.open(mailtoHref, "_blank", "noopener,noreferrer");
        submitButton.classList.remove("loading");
        updateSubmitState();
        showToast(getT("fm.mailto.opening", currentLang) || "E-posta uygulaması açılıyor...");
        trackMetric("form_submit", { result: "mailto_fallback" });
        return;
      }

      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        showFormMessage(getT("fm.server.generic", currentLang) || "Bir hata oluştu. Lütfen tekrar deneyin.", false);
        submitButton.classList.remove("loading");
        updateSubmitState();
        trackMetric("form_submit", { result: "offline", endpoint: submitEndpoint });
        return;
      }

      var supportsAbort = typeof AbortController === "function";
      var submitController = supportsAbort ? new AbortController() : null;
      var submitTimeout = window.setTimeout(function () {
        if (submitController) {
          submitController.abort();
        }
      }, 15000);

      fetch(submitEndpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
        signal: submitController ? submitController.signal : undefined
      })
        .then(function (response) {
          var contentType = response.headers.get("content-type") || "";
          if (contentType.indexOf("application/json") > -1) {
            return response.json().then(function (json) {
              return { response: response, body: json };
            });
          }
          return response.text().then(function (text) {
            return { response: response, body: { ok: false, message: text || "Unexpected response" } };
          });
        })
        .then(function (result) {
          var response = result.response;
          var body = result.body || {};
          var ok = !!(response.ok && body.ok && body.message !== "Spam ignored");
          var message = resolveServerMessage(body.message, ok);
          if (ok) {
            form.reset();
            qa(".form-group.invalid", form).forEach(function (group) { group.classList.remove("invalid"); });
            clearDraft();
            autoGrowMessage();
            updateMessageCount();
            updateSubmitState();
            showDraftNote("fm.draft.cleared");
            showFormMessage(message, true);
            trackMetric("form_submit", { result: "success", endpoint: submitEndpoint });
            window.setTimeout(function () {
              var box = q("#form-ok");
              if (box) { box.classList.remove("visible"); }
            }, 6000);
          } else {
            showFormMessage(message, false);
            trackMetric("form_submit", { result: "error", endpoint: submitEndpoint, message: String(body.message || "") });
          }
        })
        .catch(function () {
          showFormMessage(resolveServerMessage("", false), false);
          trackMetric("form_submit", { result: "network_error", endpoint: submitEndpoint });
        })
        .finally(function () {
          window.clearTimeout(submitTimeout);
          submitButton.classList.remove("loading");
          updateSubmitState();
        });
    });

    if (messageInput) {
      messageInput.addEventListener("keydown", function (event) {
        if (!(event.ctrlKey || event.metaKey) || event.key !== "Enter") {
          return;
        }
        event.preventDefault();
        if (!canSubmit()) {
          validateContactForm(form);
          focusFirstInvalidField();
          showToast(getT("fm.shortcut.invalid", currentLang) || "Önce gerekli alanları tamamlayın.");
          return;
        }
        showToast(getT("fm.shortcut.submit", currentLang) || "Mesaj gönderiliyor...");
        if (typeof form.requestSubmit === "function") {
          form.requestSubmit(submitButton);
        } else {
          submitButton.click();
        }
      });
    }
  }

  function initContactConversionEnhancements() {
    applyContactEmail(window.__CONTACT_EMAIL__ || "");

    var copyBtn = q("#copy-email-btn");
    var emailLink = q("#contact-email-link");
    if (!copyBtn || !emailLink) {
      return;
    }

    function fallbackCopyText(text) {
      var helper = document.createElement("textarea");
      helper.value = text;
      helper.setAttribute("readonly", "");
      helper.style.position = "absolute";
      helper.style.left = "-9999px";
      document.body.appendChild(helper);
      helper.select();
      helper.setSelectionRange(0, helper.value.length);
      var success = false;
      try {
        success = !!document.execCommand("copy");
      } catch (err) {
        success = false;
      }
      document.body.removeChild(helper);
      return success;
    }

    copyBtn.addEventListener("click", function () {
      var text = String(emailLink.textContent || "").trim();
      if (!text) {
        showToast(getT("ct.copy.fail", currentLang) || "Could not copy e-mail.");
        return;
      }
      if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
        if (fallbackCopyText(text)) {
          showToast(getT("ct.copy.ok", currentLang) || "E-mail copied.");
          trackMetric("copy_email", { email: text, method: "execCommand" });
        } else {
          showToast(getT("ct.copy.fail", currentLang) || "Could not copy e-mail.");
        }
        return;
      }
      navigator.clipboard.writeText(text).then(function () {
        showToast(getT("ct.copy.ok", currentLang) || "E-mail copied.");
        trackMetric("copy_email", { email: text, method: "clipboard" });
      }).catch(function () {
        if (fallbackCopyText(text)) {
          showToast(getT("ct.copy.ok", currentLang) || "E-mail copied.");
          trackMetric("copy_email", { email: text, method: "execCommand" });
          return;
        }
        showToast(getT("ct.copy.fail", currentLang) || "Could not copy e-mail.");
      });
    });
  }

  function initCursor() {
    var dot = q("#cursor-dot");
    var ring = q("#cursor-ring");
    if (!dot || !ring) {
      return;
    }
    if (!FINE_POINTER || !CAN_HOVER || isReducedMotion()) {
      dot.style.display = "none";
      ring.style.display = "none";
      document.body.style.cursor = "auto";
      return;
    }

    var mouseX = window.innerWidth / 2;
    var mouseY = window.innerHeight / 2;
    var ringX = mouseX;
    var ringY = mouseY;
    var hovering = false;

    function hideCursors() {
      dot.style.display = "none";
      ring.style.display = "none";
    }

    document.addEventListener("touchstart", hideCursors, { once: true, passive: true });

    function animate() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      dot.style.left = mouseX + "px";
      dot.style.top = mouseY + "px";
      ring.style.left = ringX + "px";
      ring.style.top = ringY + "px";
      ring.style.width = (hovering ? 44 : 30) + "px";
      ring.style.height = (hovering ? 44 : 30) + "px";
      window.requestAnimationFrame(animate);
    }

    window.addEventListener("mousemove", function (event) {
      mouseX = event.clientX;
      mouseY = event.clientY;
    });

    qa("a, button, input, textarea, select, .service-card, .b-item, .drawing-card").forEach(function (el) {
      el.addEventListener("mouseenter", function () { hovering = true; });
      el.addEventListener("mouseleave", function () { hovering = false; });
    });

    animate();
  }

  function initPageLoadFade() {
    if (isReducedMotion()) {
      return;
    }
    document.body.style.opacity = "0";
    document.body.style.transition = "opacity .45s ease";
    window.setTimeout(function () {
      document.body.style.opacity = "1";
    }, 40);
  }

  function initEscapeToCloseMenu(menuApi) {
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menuApi && typeof menuApi.isOpen === "function" && menuApi.isOpen()) {
        menuApi.close();
      }
    });
  }

  function initServiceWorker() {
    if (!("serviceWorker" in navigator)) { return; }
    window.addEventListener("load", function () {
      navigator.serviceWorker
        .register("service-worker.js", { scope: "./" })
        .catch(function () { /* Enhancement only */ });
    });
  }

  function init() {
    initServiceWorker();
    userMotionMode = readStoredMotionMode();
    applyMotionMode(userMotionMode, { persist: false });
    initPageLoadFade();
    loadSiteConfig().then(applySiteConfig);

    var menuApi = initMobileNav();
    initMotionSwitcher();
    initEscapeToCloseMenu(menuApi);
    initScrollProgress();
    initAnchorScroll(menuApi);
    initAnchorPrefetchHints();
    initActiveNavAndScrollState();
    initRevealAnimations();
    initCookieBar();
    initInstallPrompt();
    initDrawingsGallery();
    initDrawingsQuickHydration();
    initLazyMediaViewportTrigger();
    initBehanceLazyLoad();
    initStatsCounter();
    initLanguageBars();
    initMarqueePause();
    initMagneticEffects();
    initContactForm();
    initContactConversionEnhancements();
    initCursor();

    loadTranslations()
      .then(function (data) {
        translations = data || {};
        reportMissingTranslationKeys();
        initLanguageSwitcher();
        var resolved = resolveInitialLang();
        setLanguage(resolved.lang, { persist: true, updateUrl: resolved.fromUrl });
        try {
          window.dispatchEvent(new CustomEvent("ek:ready"));
        } catch (err) {
          /* noop */
        }
      })
      .catch(function () {
        initLanguageSwitcher();
        var resolved = resolveInitialLang();
        currentLang = resolved.lang;
        document.documentElement.setAttribute("lang", resolved.lang);
        document.documentElement.setAttribute("data-lang", resolved.lang);
        setLangButtonState(resolved.lang);
        updateLanguageChip(resolved.lang);
        if (resolved.fromUrl) {
          setUrlLang(resolved.lang);
        }
        try {
          window.dispatchEvent(new CustomEvent("ek:ready"));
        } catch (err) {
          /* noop */
        }
      });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
