(function () {
  "use strict";

  const COPY = {
    en: {
      heroEyebrow: "AI-native creative engineering operating system",
      heroTitle: "SEIS",
      heroSubtitle: "A runnable local demo that connects SEIS AI Core, Desktop OS, SEIS Code, SEIS Design, SEIS Cloud, Search, SSH boundaries, and the five-year sub-agent plan.",
      navBrief: "Brief",
      navSystem: "System",
      navFlow: "Flow",
      navProof: "Proof",
      navLaunch: "Launch",
      openSeis: "Open SEIS",
      openDemoFlightDeck: "Open Demo Flight Deck",
      openOs: "Open the OS",
      openAiCenter: "Open AI Center",
      openSeisCode: "Open SEIS Code",
      launchDeckLabel: "Demo package",
      launchDeckStatus: "Reviewer deck",
      launchDeckTitle: "SEIS Flight Deck",
      launchDeckBody: "Open one browser-local launch board for the live OS, reviewer entry, Code, AI, Design, Search, Cloud, Store, and supplied modules.",
      copySummaryButton: "Copy one-line summary",
      metricOne: "One ecosystem",
      metricTwo: "Demo doors",
      metricThree: "Core cloud keys required",
      oneSentence: "SEIS is not a chatbot or a dashboard; it is a working local operating-system demo for AI, code, design, cloud readiness, search, creative websites, and human-governed sub-agent evolution.",
      mapEyebrow: "Start here",
      mapTitle: "Understand SEIS by role.",
      mapBody: "Choose the path closest to why you came here. Every card jumps to a real section or product surface.",
      mapVisitorLabel: "Visitor",
      mapVisitorTitle: "What is SEIS?",
      mapVisitorBody: "Read the plain-language brief before opening the full OS.",
      mapBuilderLabel: "Builder",
      mapBuilderTitle: "What can I use?",
      mapBuilderBody: "See the pillars: Desktop, Code, AI Core, Creative Worlds, and governance.",
      mapOperatorLabel: "Operator",
      mapOperatorTitle: "What is real today?",
      mapOperatorBody: "Check maturity, no-key mode, and approval boundaries before trusting a claim.",
      mapLaunchLabel: "Try it",
      mapLaunchTitle: "Where do I click?",
      mapLaunchBody: "Open the seven routes into the ecosystem from one launch grid.",
      briefEyebrow: "60-second brief",
      briefTitle: "SEIS makes complex AI work understandable, usable, and governed.",
      briefBody: "It is a public-facing website, a local Desktop OS demo, a browser IDE, and an AI governance layer moving toward one coherent creative engineering platform.",
      briefCardOneLabel: "What it is",
      briefCardOneBody: "A calm operating layer for product ideas, code, design systems, agents, plugins, docs, security, cloud readiness, and research.",
      briefCardTwoLabel: "Why it matters",
      briefCardTwoBody: "Instead of scattered demos and prompts, SEIS gives every surface a role, status, proof point, and safe next action.",
      briefCardThreeLabel: "Try first",
      briefCardThreeBody: "Open the OS for the full ecosystem, SEIS Code for building, or AI Center for provider-neutral AI governance.",
      consoleMissionLabel: "Mission",
      consoleMission: "Turn AI Core, code, design, cloud, search, SSH, and product demos into one governed operating system.",
      consoleModeLabel: "Mode",
      consoleMode: "Local-first",
      consoleModeBody: "No provider key needed for core.",
      consoleAiLabel: "AI Core",
      consoleAi: "Router ready",
      consoleAiBody: "Provider-neutral by design.",
      consoleEvidenceLabel: "Evidence",
      consoleEvidence: "Validated surfaces",
      consoleEvidenceBody: "Desktop, Code, Gacha, Video Heroes.",
      consoleOrbitLabel: "3D Demo",
      consoleOrbit: "AI Core orbit",
      consoleOrbitBody: "Code, Design, Cloud, SSH, and sub-agents.",
      consoleGovernanceLabel: "Governance",
      consoleGovernance: "Human-gated",
      consoleGovernanceBody: "No fake deploy or model claims.",
      systemEyebrow: "What it unifies",
      systemTitle: "A single page for the whole SEIS idea.",
      systemBody: "Visitors should understand the product without reading a constitution. The site now explains the ecosystem through six concrete pillars.",
      pillarCommandTitle: "Command Center",
      pillarCommandBody: "Goals, repositories, evidence, approvals, releases, docs, and health signals in one calm operating view.",
      pillarAiTitle: "AI Core",
      pillarAiBody: "Provider-neutral model routing, prompt versions, bounded agents, tool permissions, and local-first fallback.",
      pillarCodeTitle: "SEIS Code",
      pillarCodeBody: "A browser IDE foundation with Monaco, terminal workflows, virtual files, and local demo AI behavior.",
      pillarDesktopTitle: "Desktop OS",
      pillarDesktopBody: "A web-based workspace with Files, Terminal, apps, shared persistence, notifications, and responsive shell behavior.",
      pillarCreativeTitle: "Creative Worlds",
      pillarCreativeBody: "Cinematic Video Heroes and Mythic Gacha show how SEIS can ship artistic, interactive product experiences.",
      pillarResearchTitle: "Universe Research",
      pillarResearchBody: "A responsible long-term path toward SEIS-owned model research without pretending prompts are model weights.",
      flowEyebrow: "How it works",
      flowTitle: "From idea to governed output.",
      flowOneLabel: "Sense",
      flowOneTitle: "Collect the signal",
      flowOneBody: "Turn goals, repo state, docs, UI surfaces, and risks into evidence instead of noise.",
      flowTwoLabel: "Route",
      flowTwoTitle: "Choose the right lane",
      flowTwoBody: "Design, code, docs, AI, security, and release work follow bounded rules and clear ownership.",
      flowThreeLabel: "Build",
      flowThreeTitle: "Ship local-first slices",
      flowThreeBody: "The core product keeps working without cloud keys, provider claims, or unsafe automation.",
      flowFourLabel: "Validate",
      flowFourTitle: "Promote with proof",
      flowFourBody: "Smoke checks, audits, status matrices, and human approvals decide what is ready.",
      proofEyebrow: "Current proof",
      proofTitle: "Real surfaces, honest maturity.",
      proofBody: "The site does not claim production deployment or a trained frontier model. It points to visible browser-local foundations that can be opened today.",
      selectedSignal: "Selected signal",
      statusDesktopTitle: "Desktop OS",
      statusDesktopBody: "Browser-local foundation",
      statusCodeTitle: "SEIS Code",
      statusCodeBody: "Monaco + terminal foundation",
      statusAiTitle: "AI Core",
      statusAiBody: "Provider-neutral governance",
      statusCreativeTitle: "Creative demos",
      statusCreativeBody: "Gacha + cinematic showcases",
      launchEyebrow: "Try the ecosystem",
      launchTitle: "One website, seven doors into SEIS.",
      launchDesktopLabel: "Workspace",
      launchDesktopStatus: "Local demo",
      launchDesktopTitle: "SEIS Desktop",
      launchDesktopBody: "Open the Linux/macOS/Windows-style operating workspace, launcher, search, apps, files, and terminal.",
      launchAiLabel: "AI Core",
      launchAiStatus: "No-key core",
      launchAiTitle: "AI Center Route",
      launchAiBody: "Open provider-neutral AI Core, local demo behavior, model-router, prompt-engine, and agent-runtime signals.",
      launchCodeLabel: "Builder",
      launchCodeStatus: "Browser IDE",
      launchCodeTitle: "SEIS Code",
      launchCodeBody: "Open the browser IDE.",
      launchDesignLabel: "Design",
      launchDesignStatus: "OS route",
      launchDesignTitle: "SEIS Design",
      launchDesignBody: "Open the design handoff and cinematic website surface inside the OS demo.",
      launchCloudLabel: "Cloud",
      launchCloudStatus: "Approval-gated",
      launchCloudTitle: "SEIS Cloud",
      launchCloudBody: "Open cloud and SSH readiness as a safe, approval-gated local demo.",
      launchGachaLabel: "Creative",
      launchGachaStatus: "Playable",
      launchGachaTitle: "Mythic Gacha",
      launchGachaBody: "Open the collectible lore game.",
      launchVideoLabel: "Cinematic",
      launchVideoStatus: "Showcase",
      launchVideoTitle: "Video Heroes",
      launchVideoBody: "Open the immersive showcase set.",
      finalTitle: "SEIS makes the whole ecosystem legible.",
      finalBody: "One page to understand it. One operating layer to build it. Clear status instead of hype.",
      viewGoals: "View goals",
      footerBody: "AI-native creative engineering ecosystem. Local-first core. Human-governed automation.",
      copied: "SEIS summary copied.",
      language: "Turkish copy enabled.",
      languageToEnglish: "English copy enabled.",
      languageToTurkish: "Turkish copy enabled.",
      motionOn: "Reduced motion enabled.",
      motionOff: "Standard motion enabled."
    },
    tr: {
      heroEyebrow: "AI-native yaratici muhendislik isletim sistemi",
      heroTitle: "SEIS",
      heroSubtitle: "SEIS AI Core, Desktop OS, SEIS Code, SEIS Design, SEIS Cloud, arama, SSH sinirlari ve bes yillik alt-ajan planini baglayan calisir yerel demo.",
      navBrief: "Ozet",
      navSystem: "Sistem",
      navFlow: "Akis",
      navProof: "Kanit",
      navLaunch: "Ac",
      openSeis: "SEIS'i Ac",
      openDemoFlightDeck: "Demo Flight Deck'i Ac",
      openOs: "OS'i Ac",
      openAiCenter: "AI Center'i Ac",
      openSeisCode: "SEIS Code'u Ac",
      launchDeckLabel: "Demo paketi",
      launchDeckStatus: "Inceleme paketi",
      launchDeckTitle: "SEIS Flight Deck",
      launchDeckBody: "Canli OS, review girdi, Code, AI, Design, Search, Cloud, Store ve saglanan moduller icin tek bir browser-lokal acilis paneli ac.",
      copySummaryButton: "Tek satir ozeti kopyala",
      metricOne: "Tek ekosistem",
      metricTwo: "Demo kapilari",
      metricThree: "Cekirdek bulut anahtari gerekmez",
      oneSentence: "SEIS bir chatbot ya da pano degil; AI, kod, tasarim, cloud hazirligi, arama, yaratici websiteler ve insan onayli alt-ajan evrimi icin calisan yerel isletim sistemi demosudur.",
      mapEyebrow: "Buradan basla",
      mapTitle: "SEIS'i role gore anla.",
      mapBody: "Neden geldiginize en yakin yolu secin. Her kart gercek bir bolume ya da urun yuzeyine gider.",
      mapVisitorLabel: "Ziyaretci",
      mapVisitorTitle: "SEIS nedir?",
      mapVisitorBody: "Tum OS'i acmadan once sade dille yazilmis ozeti oku.",
      mapBuilderLabel: "Builder",
      mapBuilderTitle: "Neyi kullanabilirim?",
      mapBuilderBody: "Desktop, Code, AI Core, Creative Worlds ve governance sutunlarini gor.",
      mapOperatorLabel: "Operator",
      mapOperatorTitle: "Bugun ne gercek?",
      mapOperatorBody: "Bir iddiaya guvenmeden once olgunluk, keysiz mod ve onay sinirlarini kontrol et.",
      mapLaunchLabel: "Dene",
      mapLaunchTitle: "Nereye tiklarim?",
      mapLaunchBody: "Tek launch grid uzerinden ekosisteme acilan yedi rotayi ac.",
      briefEyebrow: "60 saniyelik ozet",
      briefTitle: "SEIS karmasik AI islerini anlasilir, kullanilabilir ve yonetilebilir hale getirir.",
      briefBody: "Herkese acik tek sayfa website, yerel Desktop OS demosu, browser IDE ve AI yonetisim katmani ayni yaratici muhendislik platformuna baglanir.",
      briefCardOneLabel: "Ne bu?",
      briefCardOneBody: "Urun fikirleri, kod, tasarim sistemleri, ajanlar, eklentiler, dokumanlar, guvenlik, cloud hazirligi ve arastirma icin sakin bir isletim katmani.",
      briefCardTwoLabel: "Neden onemli?",
      briefCardTwoBody: "Dagilmis demolar ve promptlar yerine her yuzeye rol, durum, kanit noktasi ve guvenli sonraki adim verir.",
      briefCardThreeLabel: "Once ne acilmali?",
      briefCardThreeBody: "Tum ekosistem icin OS'i, gelistirme icin SEIS Code'u, provider-neutral AI yonetisimi icin AI Center'i ac.",
      consoleMissionLabel: "Misyon",
      consoleMission: "AI Core, kod, tasarim, cloud, arama, SSH ve urun demolarini tek yonetilen isletim sistemine bagla.",
      consoleModeLabel: "Mod",
      consoleMode: "Local-first",
      consoleModeBody: "Cekirdek icin provider key gerekmez.",
      consoleAiLabel: "AI Core",
      consoleAi: "Router hazir",
      consoleAiBody: "Provider-neutral tasarlandi.",
      consoleEvidenceLabel: "Kanit",
      consoleEvidence: "Dogrulanmis yuzeyler",
      consoleEvidenceBody: "Desktop, Code, Gacha, Video Heroes.",
      consoleOrbitLabel: "3D Demo",
      consoleOrbit: "AI Core yoresi",
      consoleOrbitBody: "Code, Design, Cloud, SSH ve alt ajanlar.",
      consoleGovernanceLabel: "Yonetisim",
      consoleGovernance: "Insan onayli",
      consoleGovernanceBody: "Sahte deploy ya da model iddiasi yok.",
      systemEyebrow: "Neyi birlestirir",
      systemTitle: "Tum SEIS fikri icin tek sayfa.",
      systemBody: "Ziyaretci anayasayi okumadan urunu anlamali. Site ekosistemi alti somut sutunla anlatiyor.",
      pillarCommandTitle: "Command Center",
      pillarCommandBody: "Hedefler, repolar, kanit, onaylar, release, dokumanlar ve saglik sinyalleri tek sakin isletim gorunumunde.",
      pillarAiTitle: "AI Core",
      pillarAiBody: "Provider-neutral model routing, prompt surumleri, sinirli ajanlar, arac izinleri ve local-first fallback.",
      pillarCodeTitle: "SEIS Code",
      pillarCodeBody: "Monaco, terminal akislari, sanal dosyalar ve yerel demo AI davranisi olan browser IDE temeli.",
      pillarDesktopTitle: "Desktop OS",
      pillarDesktopBody: "Files, Terminal, uygulamalar, ortak kalicilik, bildirimler ve responsive shell davranisi olan web workspace.",
      pillarCreativeTitle: "Creative Worlds",
      pillarCreativeBody: "Cinematic Video Heroes ve Mythic Gacha, SEIS'in sanatsal ve etkilesimli urun deneyimleri sunabilecegini gosterir.",
      pillarResearchTitle: "Universe Research",
      pillarResearchBody: "Promptlari model agirligi gibi gostermeden SEIS-owned model arastirmasina sorumlu uzun vadeli yol.",
      flowEyebrow: "Nasil calisir",
      flowTitle: "Fikirden yonetilen ciktiya.",
      flowOneLabel: "Algila",
      flowOneTitle: "Sinyali topla",
      flowOneBody: "Hedefleri, repo durumunu, dokumanlari, UI yuzeylerini ve riskleri gurultu yerine kanita cevir.",
      flowTwoLabel: "Yonlendir",
      flowTwoTitle: "Dogru hatti sec",
      flowTwoBody: "Tasarim, kod, docs, AI, guvenlik ve release isi sinirli kurallar ve net sahiplikle ilerler.",
      flowThreeLabel: "Insaa et",
      flowThreeTitle: "Local-first parcalar ship et",
      flowThreeBody: "Cekirdek urun cloud key, provider iddiasi veya guvensiz otomasyon olmadan calisir.",
      flowFourLabel: "Dogrula",
      flowFourTitle: "Kanitla yuksel",
      flowFourBody: "Smoke check, audit, status matrisleri ve insan onaylari neyin hazir olduguna karar verir.",
      proofEyebrow: "Guncel kanit",
      proofTitle: "Gercek yuzeyler, durust olgunluk.",
      proofBody: "Site production deployment ya da egitilmis frontier model iddiasi yapmaz. Bugun acilabilen browser-local temellere isaret eder.",
      selectedSignal: "Secilen sinyal",
      statusDesktopTitle: "Desktop OS",
      statusDesktopBody: "Browser-local temel",
      statusCodeTitle: "SEIS Code",
      statusCodeBody: "Monaco + terminal temeli",
      statusAiTitle: "AI Core",
      statusAiBody: "Provider-neutral yonetisim",
      statusCreativeTitle: "Creative demolar",
      statusCreativeBody: "Gacha + cinematic showcase",
      launchEyebrow: "Ekosistemi dene",
      launchTitle: "Tek website, SEIS'e yedi kapi.",
      launchDesktopLabel: "Workspace",
      launchDesktopStatus: "Yerel demo",
      launchDesktopTitle: "SEIS Desktop",
      launchDesktopBody: "Isletim workspace'i, launcher, arama, uygulamalar, dosyalar ve terminali ac.",
      launchAiLabel: "AI Core",
      launchAiStatus: "Keysiz cekirdek",
      launchAiTitle: "AI Center Rotasi",
      launchAiBody: "Provider-neutral AI Core, local demo davranisi, model-router, prompt-engine ve agent-runtime sinyallerini ac.",
      launchCodeLabel: "Builder",
      launchCodeStatus: "Browser IDE",
      launchCodeTitle: "SEIS Code",
      launchCodeBody: "Browser IDE'yi ac.",
      launchDesignLabel: "Tasarim",
      launchDesignStatus: "OS rotasi",
      launchDesignTitle: "SEIS Design",
      launchDesignBody: "OS demosu icindeki design handoff ve cinematic website yuzeyini ac.",
      launchCloudLabel: "Cloud",
      launchCloudStatus: "Onay kapili",
      launchCloudTitle: "SEIS Cloud",
      launchCloudBody: "Cloud ve SSH hazirligini guvenli, onay kapili yerel demo olarak ac.",
      launchGachaLabel: "Creative",
      launchGachaStatus: "Oynanabilir",
      launchGachaTitle: "Mythic Gacha",
      launchGachaBody: "Koleksiyon ve lore oyununu ac.",
      launchVideoLabel: "Cinematic",
      launchVideoStatus: "Showcase",
      launchVideoTitle: "Video Heroes",
      launchVideoBody: "Immersive showcase setini ac.",
      finalTitle: "SEIS tum ekosistemi okunur hale getirir.",
      finalBody: "Anlamak icin tek sayfa. Insaa etmek icin tek isletim katmani. Hype yerine net durum.",
      viewGoals: "Hedefleri gor",
      footerBody: "AI-native yaratici muhendislik ekosistemi. Local-first cekirdek. Insan onayli otomasyon.",
      copied: "SEIS ozeti kopyalandi.",
      language: "English copy enabled.",
      languageToEnglish: "Ingilizce metin acildi.",
      languageToTurkish: "Turkce metin acildi.",
      motionOn: "Dusuk hareket modu acildi.",
      motionOff: "Standart hareket modu acildi."
    }
  };

  const PROOF = {
    en: {
      desktop: {
        title: "Desktop OS",
        body: "The SEIS desktop shell demonstrates the ecosystem as a Linux/macOS/Windows-style workspace: files, terminal, launchable apps, shared persistence, search, and responsive interaction.",
        href: "desktop.html",
        label: "Open Desktop OS"
      },
      code: {
        title: "SEIS Code",
        body: "The browser IDE gives SEIS a build surface with Monaco editing, multi-view navigation, a virtual terminal, and no-key local demo behavior.",
        href: "seis-code.html",
        label: "Open SEIS Code"
      },
      ai: {
        title: "SEIS AI Core",
        body: "The AI Core route keeps provider identity honest while surfacing model-router, prompt-engine, agent-runtime, SEIS Code, SEIS Design, SEIS Cloud, and SSH boundaries inside the local Desktop OS demo.",
        href: "desktop.html#seis-ai",
        label: "Open AI Center"
      },
      creative: {
        title: "Creative demos",
        body: "Video Heroes and Mythic Gacha prove that SEIS can present polished, interactive, artistic product experiences without live AI keys for players.",
        href: "mythic-gacha.html",
        label: "Open Mythic Gacha"
      }
    },
    tr: {
      desktop: {
        title: "Desktop OS",
        body: "SEIS desktop shell; dosyalar, terminal, acilabilir uygulamalar, ortak kalicilik, arama ve responsive etkilesimle ekosistemi calisan workspace olarak gosterir.",
        href: "desktop.html",
        label: "Desktop OS'i Ac"
      },
      code: {
        title: "SEIS Code",
        body: "Browser IDE; Monaco editing, coklu gorunum, sanal terminal ve key gerektirmeyen yerel AI demo davranisi icin build yuzeyi verir.",
        href: "seis-code.html",
        label: "SEIS Code'u Ac"
      },
      ai: {
        title: "SEIS AI Core",
        body: "AI Core rotasi; model-router, prompt-engine, agent-runtime, SEIS Code, SEIS Design, SEIS Cloud ve SSH sinirlarini Desktop OS demosu icinde durust provider kimligiyle gosterir.",
        href: "desktop.html#seis-ai",
        label: "AI Center'i Ac"
      },
      creative: {
        title: "Creative demolar",
        body: "Video Heroes ve Mythic Gacha, SEIS'in live AI key istemeden oyunculara polished ve sanatsal urun deneyimleri sunabilecegini kanitlar.",
        href: "mythic-gacha.html",
        label: "Mythic Gacha'yi Ac"
      }
    }
  };

  const LANG_STORAGE_KEY = "seis.site.lang.v1";

  const state = {
    lang: "en",
    reducedMotion: false,
    toastTimer: null,
    frame: 0,
    canvasLoopActive: false
  };

  const header = document.getElementById("site-header");
  const progress = document.getElementById("scroll-progress");
  const toast = document.getElementById("toast");
  const languageToggle = document.getElementById("language-toggle");
  const motionToggle = document.getElementById("motion-mode") || document.getElementById("motion-toggle");
  const copyButton = document.getElementById("copy-summary");
  const proofCopy = document.getElementById("proof-copy");
  const canvas = document.getElementById("signal-canvas");

  function showToast(message) {
    if (!toast || !message) {
      return;
    }
    toast.textContent = message;
    toast.classList.add("visible");
    if (state.toastTimer) {
      window.clearTimeout(state.toastTimer);
    }
    state.toastTimer = window.setTimeout(function () {
      toast.classList.remove("visible");
    }, 2200);
  }

  // The static build publishes one route per locale (/tr/, /de/, ...), but this
  // page renders only the two languages COPY actually contains. Resolution order
  // mirrors src/scripts/i18n-system.js: explicit ?lang wins, then the route
  // segment, then a stored preference, then the served <html lang>.
  function resolveInitialLanguage() {
    const fromQuery = new URLSearchParams(window.location.search).get("lang");
    if (isSupportedLanguage(fromQuery)) {
      return fromQuery;
    }

    const fromRoute = window.location.pathname.split("/").filter(Boolean).find(isSupportedLanguage);
    if (isSupportedLanguage(fromRoute)) {
      return fromRoute;
    }

    const stored = readStoredLanguage();
    if (isSupportedLanguage(stored)) {
      return stored;
    }

    const served = (document.documentElement.lang || "").slice(0, 2).toLowerCase();
    return isSupportedLanguage(served) ? served : "en";
  }

  function isSupportedLanguage(value) {
    return value === "en" || value === "tr";
  }

  function readStoredLanguage() {
    try {
      return window.localStorage.getItem(LANG_STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function storeLanguage(lang) {
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch (error) {
      /* storage unavailable (private mode, blocked site data) -- non-fatal */
    }
  }

  function applyLanguage(lang, persist) {
    const nextLang = lang === "tr" ? "tr" : "en";
    state.lang = nextLang;
    document.documentElement.lang = nextLang;
    if (persist) {
      storeLanguage(nextLang);
    }
    document.querySelectorAll("[data-copy-key]").forEach(function (node) {
      const key = node.getAttribute("data-copy-key");
      if (COPY[nextLang][key]) {
        node.textContent = COPY[nextLang][key];
      }
    });
    if (languageToggle) {
      languageToggle.textContent = nextLang === "en" ? "TR" : "EN";
      languageToggle.setAttribute("aria-label", nextLang === "en" ? "Switch to Turkish" : "Switch to English");
    }
    const activeProof = document.querySelector(".status-row.active");
    if (activeProof && proofCopy) {
      updateProof(activeProof.getAttribute("data-focus"));
    }
  }

  function setMotion(reduced) {
    state.reducedMotion = !!reduced;
    document.body.classList.toggle("reduced-motion", state.reducedMotion);
    if (motionToggle) {
      motionToggle.setAttribute("aria-pressed", state.reducedMotion ? "true" : "false");
    }
    window.dispatchEvent(new CustomEvent("seis:motion-change", { detail: { reduced: state.reducedMotion } }));
    showToast(state.reducedMotion ? COPY[state.lang].motionOn : COPY[state.lang].motionOff);
  }

  function updateScrollState() {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const ratio = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    if (progress) {
      progress.style.width = `${ratio * 100}%`;
    }
    if (header) {
      header.classList.toggle("is-scrolled", window.scrollY > 18);
    }
  }

  function setActiveNav() {
    const sections = ["brief", "system", "flow", "proof", "launch"];
    let active = "";
    sections.forEach(function (id) {
      const section = document.getElementById(id);
      if (section && section.getBoundingClientRect().top < window.innerHeight * 0.45) {
        active = id;
      }
    });
    document.querySelectorAll(".primary-nav a").forEach(function (link) {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${active}`);
    });
  }

  function updateProof(key) {
    const proofSet = PROOF[state.lang] || PROOF.en;
    const data = proofSet[key] || proofSet.desktop;
    document.querySelectorAll(".status-row").forEach(function (button) {
      const active = button.getAttribute("data-focus") === key;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
    if (!proofCopy) {
      return;
    }
    proofCopy.innerHTML = [
      `<p class="eyebrow">${COPY[state.lang].selectedSignal}</p>`,
      `<h3>${data.title}</h3>`,
      `<p>${data.body}</p>`,
      `<a href="${data.href}">${data.label}</a>`
    ].join("");
  }

  function copySummary() {
    const text = COPY[state.lang].oneSentence;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast(COPY[state.lang].copied);
      }).catch(function () {
        fallbackCopy(text);
      });
      return;
    }
    fallbackCopy(text);
  }

  function fallbackCopy(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "readonly");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      showToast(COPY[state.lang].copied);
    } catch (error) {
      showToast(text);
    }
    textarea.remove();
  }

  function setupReveal() {
    const nodes = document.querySelectorAll(".map-copy, .map-card, .pillar-card, .flow-step, .launch-tile, .section-heading, .proof-layout, .final-cta");
    nodes.forEach(function (node) {
      node.classList.add("reveal");
    });
    if (!("IntersectionObserver" in window)) {
      nodes.forEach(function (node) {
        node.classList.add("is-visible");
      });
      return;
    }
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16 });
    nodes.forEach(function (node) {
      observer.observe(node);
    });
  }

  function setupCanvas() {
    if (!canvas) {
      return;
    }
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const points = Array.from({ length: 42 }, function (_, index) {
      return {
        x: (index * 97) % 1000,
        y: (index * 193) % 700,
        r: 1.2 + (index % 5) * 0.42,
        speed: 0.22 + (index % 7) * 0.035,
        hue: index % 3
      };
    });

    function resize() {
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * ratio));
      canvas.height = Math.max(1, Math.floor(rect.height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function color(point, alpha) {
      const palette = [
        `rgba(94, 234, 212, ${alpha})`,
        `rgba(139, 92, 246, ${alpha})`,
        `rgba(245, 199, 107, ${alpha})`
      ];
      return palette[point.hue] || palette[0];
    }

    function draw() {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      context.clearRect(0, 0, width, height);
      context.fillStyle = "rgba(7, 9, 15, 0.18)";
      context.fillRect(0, 0, width, height);

      points.forEach(function (point, index) {
        const drift = state.frame * point.speed;
        const x = (point.x + drift) % Math.max(1, width);
        const y = (point.y + Math.sin((state.frame + index * 11) / 80) * 34) % Math.max(1, height);
        point.liveX = x;
        point.liveY = y < 0 ? y + height : y;
      });

      for (let i = 0; i < points.length; i += 1) {
        for (let j = i + 1; j < points.length; j += 1) {
          const a = points[i];
          const b = points[j];
          const dx = a.liveX - b.liveX;
          const dy = a.liveY - b.liveY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 150) {
            context.strokeStyle = `rgba(168, 173, 186, ${0.14 * (1 - distance / 150)})`;
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(a.liveX, a.liveY);
            context.lineTo(b.liveX, b.liveY);
            context.stroke();
          }
        }
      }

      points.forEach(function (point) {
        context.fillStyle = color(point, 0.76);
        context.beginPath();
        context.arc(point.liveX, point.liveY, point.r, 0, Math.PI * 2);
        context.fill();
      });

      state.frame += state.reducedMotion ? 0 : 1;
      if (!state.reducedMotion) {
        state.canvasLoopActive = true;
        window.requestAnimationFrame(draw);
      } else {
        state.canvasLoopActive = false;
      }
    }

    function startLoop() {
      if (state.reducedMotion) {
        draw();
        return;
      }
      if (state.canvasLoopActive) return;
      state.canvasLoopActive = true;
      window.requestAnimationFrame(draw);
    }

    resize();
    startLoop();
    window.addEventListener("resize", function () {
      resize();
      if (state.reducedMotion) {
        draw();
      }
    });
    window.addEventListener("seis:motion-change", function () {
      if (state.reducedMotion) {
        draw();
      } else {
        startLoop();
      }
    });
  }

  function bindEvents() {
    window.addEventListener("scroll", function () {
      updateScrollState();
      setActiveNav();
    }, { passive: true });

    if (languageToggle) {
      languageToggle.addEventListener("click", function () {
        const nextLang = state.lang === "en" ? "tr" : "en";
        applyLanguage(nextLang, true);
        showToast(nextLang === "tr" ? COPY[state.lang].languageToTurkish : COPY[state.lang].languageToEnglish);
      });
    }

    if (motionToggle) {
      motionToggle.addEventListener("click", function () {
        setMotion(!state.reducedMotion);
      });
    }

    if (copyButton) {
      copyButton.addEventListener("click", copySummary);
    }

    document.querySelectorAll(".status-row").forEach(function (button) {
      button.setAttribute("aria-pressed", button.classList.contains("active") ? "true" : "false");
      button.addEventListener("click", function () {
        updateProof(button.getAttribute("data-focus"));
      });
    });
  }

  function init() {
    const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    state.reducedMotion = !!prefersReduced;
    document.body.classList.toggle("reduced-motion", state.reducedMotion);
    if (motionToggle) {
      motionToggle.setAttribute("aria-pressed", state.reducedMotion ? "true" : "false");
    }
    bindEvents();
    applyLanguage(resolveInitialLanguage(), false);
    updateScrollState();
    setActiveNav();
    setupReveal();
    setupCanvas();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}());
