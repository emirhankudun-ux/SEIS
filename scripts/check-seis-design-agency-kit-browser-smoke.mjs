import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, normalize, resolve } from "node:path";
import { tmpdir } from "node:os";

const ROOT = process.cwd();
const WEB_ROOT = join(ROOT, "apps", "web");
const SCREENSHOT_DIR = join(ROOT, "dist", "qa", "design-agency-kit-smoke");
const HOST = "127.0.0.1";
const DEBUG_HOST = "127.0.0.1";
const STORAGE_KEY = "seis.design.agencyPack.v1";
const HANDOFF_STORAGE_KEY = "seis.design.agencyPack.handoff.v1";
const HANDOFF_PATH = "/workspace/Design/seis-design-agency-pack.md";
const REVIEW_PATH = "/workspace/Design/seis-design-agency-pack-review.md";
const REQUIRED_OUTPUTS = [
  "creative-brief",
  "client-discovery-intake-matrix",
  "brand-offer-naming-matrix",
  "brand-strategy-workshop-matrix",
  "proposal-scope-estimator",
  "agency-quote-comparator",
  "agency-cost-control-matrix",
  "agency-cost-defense-calculator",
  "design-sprint-timeline-matrix",
  "competitive-positioning-matrix",
  "brand-voice-messaging-matrix",
  "typography-hierarchy-matrix",
  "color-system-accessibility-matrix",
  "brand-rationale-deck",
  "visual-reference-moodboard",
  "creative-asset-shot-list-matrix",
  "logo-concept-evaluation",
  "brand-usage-guideline",
  "creative-director-review",
  "design-review-decision-matrix",
  "approval-state-transition-ledger",
  "revision-round-plan",
  "client-feedback-triage-board",
  "case-study-layout",
  "visual-qa-evidence-ledger",
  "production-file-manifest",
  "asset-size-spec-sheet",
  "print-production-readiness-matrix",
  "client-approval-packet",
  "client-ready-export-index",
  "brand-token-map",
  "brand-audit-scorecard",
  "landing-page-direction",
  "landing-page-blueprint-matrix",
  "launch-asset-matrix",
  "social-campaign-brief",
  "social-content-calendar-matrix",
  "social-variant-set",
  "asset-provenance-sheet",
  "presentation-cover-system",
  "presentation-system-map",
  "handoff-checklist",
];
const REQUIRED_WORKBOARDS = [
  "brand-audit-scorecard",
  "client-discovery-intake-matrix",
  "brand-offer-naming-matrix",
  "brand-strategy-workshop-matrix",
  "landing-page-blueprint-matrix",
  "proposal-scope-estimator",
  "agency-quote-comparator",
  "agency-cost-control-matrix",
  "agency-cost-defense-calculator",
  "design-sprint-timeline-matrix",
  "competitive-positioning-matrix",
  "brand-voice-messaging-matrix",
  "typography-hierarchy-matrix",
  "color-system-accessibility-matrix",
  "brand-rationale-deck",
  "visual-reference-moodboard",
  "creative-asset-shot-list-matrix",
  "logo-concept-evaluation",
  "brand-usage-guideline",
  "creative-director-review",
  "design-review-decision-matrix",
  "approval-state-transition-ledger",
  "revision-round-plan",
  "client-feedback-triage-board",
  "case-study-layout",
  "visual-qa-evidence-ledger",
  "production-file-manifest",
  "asset-size-spec-sheet",
  "print-production-readiness-matrix",
  "client-approval-packet",
  "client-ready-export-index",
  "launch-asset-matrix",
  "social-content-calendar-matrix",
  "social-variant-set",
  "presentation-system-map",
];
const CUSTOM_FIELD_VALUES = {
  audience: "Independent studio operators",
  offer: "Agency-grade launch kit without live provider calls",
  clientDiscoveryIntakeFocus: "Decision maker, success metric, existing assets, missing inputs, channel needs, legal blockers, private asset boundary, and next evidence request",
  brandOfferNamingFocus: "Literal, coined, descriptive, editorial, and system-style names with offer phrase, pronunciation, memorability, domain/social availability notes, trademark blocker, and decision owner",
  brandStrategyWorkshopFocus: "Business goal, audience promise, stakeholder priorities, must-say and must-not-say rules, proof gaps, unresolved questions, and decision owner",
  format: "Landing page, social set, proof deck, and handoff checklist",
  landingPageBlueprintFocus: "Hero promise, section order, proof blocks, objection handling, CTA ladder, responsive priority, accessibility notes, analytics questions, and owner",
  scope: "Brand sprint plus launch kit",
  budgetBand: "Avoid unchecked agency retainer",
  quoteBaseline: "Outside agency quote with vague deliverables and monthly retainer",
  agencyCostControlFocus: "Line item, SEIS in-house route, external-buy trigger, quality risk, evidence requirement, decision owner, and approval gate",
  agencyCostDefenseFocus: "Quoted line item, replaceable deliverables, in-house coverage index, must-buy trigger, risk owner, validation proof, and next spend decision",
  designSprintTimelineFocus: "Discovery day, strategy freeze, production block, review checkpoint, revision window, QA pass, handoff day, owner, and blocker rule",
  internalProductionPath: "SEIS draft pack plus validation before buying external help",
  competitivePositioningFocus: "Direct competitors, aspirational references, category cues, visual territory, differentiation, evidence gaps, and decision owner",
  messagingVoiceFocus: "Tagline options, message hierarchy, tone rules, proof points, CTA language, channel adaptations, claim risk, and copy review owner",
  typographyHierarchyFocus: "Display, text, UI, mono, fallback roles, scale, contrast, readability, language support, font license blocker, and implementation owner",
  colorSystemFocus: "Primary, accent, surface, text, status colors, contrast pairs, dark mode behavior, token mapping, accessibility risk, and review owner",
  rationaleFocus: "Audience, offer, hierarchy, proof, token choices, objections, and review action",
  moodboardDirectionFocus: "Reference themes, color mood, type attitude, imagery cues, motion tone, provenance notes, rejected directions, and review owner",
  creativeAssetShotListFocus: "Scene, composition, crop, lighting, prop, format, motion need, source/provenance status, release risk, and production owner",
  logoConceptFocus: "Wordmark, symbol, lockup, small-size readability, monochrome use, misuse risk, trademark blocker, and decision owner",
  usageGuidelineFocus: "Logo spacing, color use, type hierarchy, imagery rules, do and don't examples, accessibility, and escalation owner",
  designReviewDecisionFocus: "Approve, revise, or hold decision, severity, visual debt, blocking fixes, polish queue, evidence links, publication blocker, owner, and next action",
  approvalStateTransitionFocus: "Draft, review-ready, revise, hold, approved-for-handoff, evidence link, reviewer, blocker, validation command, rollback note, and next action",
  revisionRound: "One decision round plus one polish round",
  feedbackTriageFocus: "Decision fixes, polish, out-of-scope requests, risk notes, owner, and next review action",
  caseStudyFocus: "Context, challenge, response, proof, accessibility, quality path, and publication boundary",
  deliveryStandard: "Source paths, export specs, provenance, accessibility notes, and rollback",
  printProductionFocus: "Trim size, bleed, safe zone, color mode, resolution, export format, paper/vendor notes, proof status, and review owner",
  visualEvidenceTarget: "Desktop, mobile, SEIS Code review, reduced motion, and overflow evidence",
  exportIndexTarget: "Client-ready index of included files, review state, source paths, blockers, and excluded work",
  channels: "Website hero, wide preview, square post, vertical story, deck cover, and thumbnail",
  contentCalendarFocus: "Launch themes, channel cadence, publish dates, asset format, caption hook, CTA, asset owner, review state, and scheduling boundary",
  approvalCheckpoint: "Hold until proof, exclusions, risk, and export readiness are reviewed",
  deadline: "Friday design review",
  approvalOwner: "SEIS design reviewer",
};
const failures = [];

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function contentType(file) {
  if (file.endsWith(".html")) return "text/html; charset=utf-8";
  if (file.endsWith(".css")) return "text/css; charset=utf-8";
  if (file.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (file.endsWith(".json")) return "application/json; charset=utf-8";
  if (file.endsWith(".svg")) return "image/svg+xml";
  if (file.endsWith(".ico")) return "image/x-icon";
  if (file.endsWith(".png")) return "image/png";
  if (file.endsWith(".jpg") || file.endsWith(".jpeg")) return "image/jpeg";
  if (file.endsWith(".webmanifest")) return "application/manifest+json";
  return "application/octet-stream";
}

function createStaticServer() {
  return createServer((request, response) => {
    const requestUrl = new URL(request.url || "/", `http://${HOST}`);
    const decodedPath = decodeURIComponent(requestUrl.pathname);
    const relativePath = decodedPath === "/" ? "/index.html" : decodedPath;
    const filePath = normalize(join(WEB_ROOT, relativePath));

    if (!filePath.startsWith(WEB_ROOT)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, { "Content-Type": contentType(filePath) });
    response.end(readFileSync(filePath));
  });
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);

  return candidates.find((candidate) => existsSync(candidate));
}

async function delay(ms) {
  await new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
}

async function fetchJsonWithRetry(url, options = {}, timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return await response.json();
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await delay(150);
  }

  throw lastError || new Error(`Timed out waiting for ${url}`);
}

class CdpClient {
  constructor(wsUrl) {
    this.nextId = 1;
    this.pending = new Map();
    this.events = [];
    this.ws = new WebSocket(wsUrl);
  }

  async open() {
    await new Promise((resolveOpen, rejectOpen) => {
      this.ws.addEventListener("open", resolveOpen, { once: true });
      this.ws.addEventListener("error", rejectOpen, { once: true });
    });

    this.ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolvePending, rejectPending } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) {
          rejectPending(new Error(`${message.error.message}: ${message.error.data || ""}`));
        } else {
          resolvePending(message.result || {});
        }
        return;
      }
      if (message.method) this.events.push(message);
    });
  }

  send(method, params = {}, timeoutMs = 10000) {
    const id = this.nextId++;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolvePending, rejectPending) => {
      this.pending.set(id, { resolvePending, rejectPending });
      setTimeout(() => {
        if (!this.pending.has(id)) return;
        this.pending.delete(id);
        rejectPending(new Error(`CDP command timed out: ${method}`));
      }, timeoutMs);
    });
  }

  close() {
    this.ws.close();
  }
}

async function newTab(debugPort) {
  await fetchJsonWithRetry(`http://${DEBUG_HOST}:${debugPort}/json/version`, {}, 20000);
  const target = await fetchJsonWithRetry(`http://${DEBUG_HOST}:${debugPort}/json/new?about:blank`, { method: "PUT" }, 20000);
  const client = new CdpClient(target.webSocketDebuggerUrl);
  await client.open();
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Log.enable");
  await client.send("Network.enable");
  return client;
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
    userGesture: true,
  });

  if (result.exceptionDetails) {
    throw new Error(`Evaluation failed: ${result.exceptionDetails.text}`);
  }

  return result.result?.value;
}

async function goto(client, url) {
  await client.send("Page.navigate", { url }, 30000);
  const deadline = Date.now() + 12000;

  while (Date.now() < deadline) {
    const readyState = await evaluate(client, "document.readyState").catch(() => "loading");
    if (readyState === "interactive" || readyState === "complete") return;
    await delay(100);
  }

  throw new Error(`Timed out loading ${url}`);
}

async function clickSelector(client, selector) {
  const clicked = await evaluate(client, `(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return { ok: false, reason: "missing" };
    element.scrollIntoView({ block: "center", inline: "center" });
    const rect = element.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return { ok: false, reason: "not-visible" };
    element.click();
    return { ok: true };
  })()`);

  if (!clicked?.ok) {
    throw new Error(`Cannot click selector: ${selector} (${clicked?.reason || "unknown"})`);
  }
  await delay(250);
}

async function waitFor(client, expression, timeoutMs = 12000) {
  const deadline = Date.now() + timeoutMs;
  let lastValue;

  while (Date.now() < deadline) {
    try {
      lastValue = await evaluate(client, expression);
      if (lastValue) return lastValue;
    } catch (error) {
      lastValue = error.message;
    }
    await delay(150);
  }

  throw new Error(`Timed out waiting for expression: ${expression}. Last value: ${JSON.stringify(lastValue)}`);
}

async function screenshot(client, name) {
  const result = await client.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
  }, 30000);
  const file = join(SCREENSHOT_DIR, name);
  writeFileSync(file, Buffer.from(result.data, "base64"));
  return file;
}

function collectRelevantIssues(events) {
  return events
    .filter((event) => {
      if (event.method === "Log.entryAdded") return event.params?.entry?.level === "error";
      if (event.method === "Network.loadingFailed") return !String(event.params?.errorText || "").includes("net::ERR_ABORTED");
      return false;
    })
    .map((event) => ({ method: event.method, params: event.params }));
}

const stateExpression = `(() => {
  const output = document.querySelector("[data-agency-pack-output]");
  const outputIds = [...document.querySelectorAll("[data-agency-output]")]
    .map((item) => item.getAttribute("data-agency-output"));
  const workboardIds = [...document.querySelectorAll("[data-agency-workboard]")]
    .map((item) => item.getAttribute("data-agency-workboard"));
  const buildButton = document.querySelector("[data-build-agency-pack]");
  const exportButton = document.querySelector("[data-export-agency-pack]");
  const copyButton = document.querySelector("[data-copy-agency-pack]");
  const localPack = localStorage.getItem(${JSON.stringify(STORAGE_KEY)}) || "";
  const localHandoff = localStorage.getItem(${JSON.stringify(HANDOFF_STORAGE_KEY)}) || "";
  let handoffManifest = null;
  try {
    handoffManifest = localHandoff ? JSON.parse(localHandoff) : null;
  } catch (_error) {}
  const fieldValues = Object.fromEntries([...document.querySelectorAll("[data-agency-field]")]
    .map((input) => [input.getAttribute("data-agency-field"), input.value]));
  return {
    title: document.title,
    h1: document.querySelector("h1")?.textContent.trim() || "",
    workflowFound: Boolean(document.querySelector("[data-agency-kit-workflow]")),
    outputIds,
    workboardIds,
    buildButtonText: buildButton?.textContent.trim() || "",
    exportButtonText: exportButton?.textContent.trim() || "",
    copyButtonText: copyButton?.textContent.trim() || "",
    outputText: output?.textContent.trim() || "",
    localPack,
    localHandoff,
    handoffManifest,
    fieldValues,
    status: document.querySelector("[data-page-status]")?.textContent.trim() || "",
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollWidth: document.documentElement.scrollWidth
    }
  };
})()`;

async function inspectWorkspaceFile(client, filePath) {
  return evaluate(client, `new Promise((resolve) => {
    const request = indexedDB.open('seis-code-workspace-v1', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('files')) db.createObjectStore('files', { keyPath: 'path' });
    };
    request.onerror = () => resolve({ ok: false, error: String(request.error?.message || request.error) });
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('files', 'readonly');
      const get = tx.objectStore('files').get(${JSON.stringify(filePath)});
      get.onerror = () => resolve({ ok: false, error: String(get.error?.message || get.error) });
      get.onsuccess = () => {
        const file = get.result || null;
        db.close();
        resolve({
          ok: true,
          found: Boolean(file),
          path: file?.path || "",
          type: file?.type || "",
          language: file?.language || "",
          content: file?.content || ""
        });
      };
    };
  })`);
}

async function inspectAgencyWorkspaceHandoff(client) {
  return inspectWorkspaceFile(client, HANDOFF_PATH);
}

const codeReviewStateExpression = `(() => {
  const diagnostics = window.__SEIS_CODE__;
  return {
    title: document.title,
    ready: Boolean(diagnostics),
    activePath: diagnostics?.activePath?.() || "",
    filePaths: diagnostics?.filePaths?.() || [],
    openTabs: diagnostics?.openTabs?.() || [],
    activeView: diagnostics?.activeView?.() || "",
    designHandoffText: diagnostics?.designHandoffText?.() || "",
    designHandoffPreview: diagnostics?.designHandoffPreview?.() || "",
    outputText: diagnostics?.outputText?.() || "",
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollWidth: document.documentElement.scrollWidth
    }
  };
})()`;

async function smokeDesktop(client, baseUrl) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 1280,
    height: 820,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await goto(client, `${baseUrl}/website/seis-design.html`);
  await delay(500);

  const before = await evaluate(client, stateExpression);
  ensure(before.title === "SEIS Design - SEIS Website", "Design page title must be set by runtime");
  ensure(before.h1 === "SEIS Design", "Design page must render SEIS Design H1");
  ensure(before.workflowFound, "agency kit workflow must be rendered");
  ensure(before.outputIds.length === REQUIRED_OUTPUTS.length, "agency kit must render all required outputs");
  for (const outputId of REQUIRED_OUTPUTS) {
    ensure(before.outputIds.includes(outputId), `agency kit output missing: ${outputId}`);
  }
  ensure(before.workboardIds.length === REQUIRED_WORKBOARDS.length, "agency kit must render all required visible workboards");
  for (const workboardId of REQUIRED_WORKBOARDS) {
    ensure(before.workboardIds.includes(workboardId), `agency kit visible workboard missing: ${workboardId}`);
  }
  ensure(before.buildButtonText === "Build agency pack", "Build agency pack button must render");
  ensure(before.exportButtonText === "Export to SEIS Code", "Export to SEIS Code button must render");
  ensure(before.copyButtonText === "Copy pack", "Copy pack button must render");
  for (const fieldId of Object.keys(CUSTOM_FIELD_VALUES)) {
    ensure(Object.hasOwn(before.fieldValues, fieldId), `editable field must render: ${fieldId}`);
  }
  ensure(!before.horizontalOverflow, "desktop design page must not horizontally overflow before generation");

  await evaluate(client, `(() => {
    const values = ${JSON.stringify(CUSTOM_FIELD_VALUES)};
    for (const [id, value] of Object.entries(values)) {
      const input = document.querySelector('[data-agency-field="' + id + '"]');
      if (!input) return false;
      input.value = value;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
    return true;
  })()`);

  await clickSelector(client, "[data-build-agency-pack]");
  const afterBuild = await evaluate(client, stateExpression);
  ensure(afterBuild.outputText.includes("# SEIS Design Agency Pack"), "generated pack must include Markdown title");
  ensure(afterBuild.outputText.includes("creative-brief"), "generated pack must include creative brief output");
  ensure(afterBuild.outputText.includes("client-discovery-intake-matrix"), "generated pack must include client discovery intake output");
  ensure(afterBuild.outputText.includes("brand-offer-naming-matrix"), "generated pack must include brand and offer naming output");
  ensure(afterBuild.outputText.includes("brand-strategy-workshop-matrix"), "generated pack must include brand strategy workshop output");
  ensure(afterBuild.outputText.includes("proposal-scope-estimator"), "generated pack must include proposal scope estimator output");
  ensure(afterBuild.outputText.includes("agency-quote-comparator"), "generated pack must include agency quote comparator output");
  ensure(afterBuild.outputText.includes("agency-cost-control-matrix"), "generated pack must include agency cost control output");
  ensure(afterBuild.outputText.includes("agency-cost-defense-calculator"), "generated pack must include agency cost defense output");
  ensure(afterBuild.outputText.includes("design-sprint-timeline-matrix"), "generated pack must include design sprint timeline output");
  ensure(afterBuild.outputText.includes("competitive-positioning-matrix"), "generated pack must include competitive positioning matrix output");
  ensure(afterBuild.outputText.includes("brand-voice-messaging-matrix"), "generated pack must include brand voice messaging matrix output");
  ensure(afterBuild.outputText.includes("typography-hierarchy-matrix"), "generated pack must include typography hierarchy matrix output");
  ensure(afterBuild.outputText.includes("color-system-accessibility-matrix"), "generated pack must include color system accessibility matrix output");
  ensure(afterBuild.outputText.includes("brand-rationale-deck"), "generated pack must include brand rationale deck output");
  ensure(afterBuild.outputText.includes("visual-reference-moodboard"), "generated pack must include visual reference moodboard output");
  ensure(afterBuild.outputText.includes("creative-asset-shot-list-matrix"), "generated pack must include creative asset shot list output");
  ensure(afterBuild.outputText.includes("logo-concept-evaluation"), "generated pack must include logo concept evaluation output");
  ensure(afterBuild.outputText.includes("creative-director-review"), "generated pack must include creative director review output");
  ensure(afterBuild.outputText.includes("design-review-decision-matrix"), "generated pack must include design review decision output");
  ensure(afterBuild.outputText.includes("approval-state-transition-ledger"), "generated pack must include approval state transition output");
  ensure(afterBuild.outputText.includes("revision-round-plan"), "generated pack must include revision round plan output");
  ensure(afterBuild.outputText.includes("visual-qa-evidence-ledger"), "generated pack must include visual QA evidence ledger output");
  ensure(afterBuild.outputText.includes("production-file-manifest"), "generated pack must include production file manifest output");
  ensure(afterBuild.outputText.includes("asset-size-spec-sheet"), "generated pack must include asset size spec output");
  ensure(afterBuild.outputText.includes("print-production-readiness-matrix"), "generated pack must include print production readiness output");
  ensure(afterBuild.outputText.includes("client-approval-packet"), "generated pack must include client approval packet output");
  ensure(afterBuild.outputText.includes("client-ready-export-index"), "generated pack must include client-ready export index output");
  ensure(afterBuild.outputText.includes("brand-audit-scorecard"), "generated pack must include brand audit output");
  ensure(afterBuild.outputText.includes("landing-page-blueprint-matrix"), "generated pack must include landing page blueprint output");
  ensure(afterBuild.outputText.includes("launch-asset-matrix"), "generated pack must include launch asset matrix output");
  ensure(afterBuild.outputText.includes("social-content-calendar-matrix"), "generated pack must include social content calendar matrix output");
  ensure(afterBuild.outputText.includes("social-variant-set"), "generated pack must include social variant output");
  ensure(afterBuild.outputText.includes("presentation-system-map"), "generated pack must include presentation system output");
  ensure(afterBuild.outputText.includes("## Client Discovery Intake Matrix"), "generated pack must include client discovery intake matrix section");
  ensure(afterBuild.outputText.includes("not a client contract"), "generated pack must avoid client contract claims");
  ensure(afterBuild.outputText.includes("## Brand & Offer Naming Matrix"), "generated pack must include brand and offer naming matrix section");
  ensure(afterBuild.outputText.includes("not a brand name clearance"), "generated pack must avoid brand name clearance claims");
  ensure(afterBuild.outputText.includes("## Brand Strategy Workshop Matrix"), "generated pack must include brand strategy workshop matrix section");
  ensure(afterBuild.outputText.includes("not a business strategy guarantee"), "generated pack must avoid business strategy guarantee claims");
  ensure(afterBuild.outputText.includes("## Landing Page Blueprint Matrix"), "generated pack must include landing page blueprint matrix section");
  ensure(afterBuild.outputText.includes("not a conversion guarantee"), "generated pack must avoid conversion guarantee claims");
  ensure(afterBuild.outputText.includes("## Proposal Scope Estimate"), "generated pack must include proposal scope estimate section");
  ensure(afterBuild.outputText.includes("not a binding quote"), "generated pack must avoid binding quote claims");
  ensure(afterBuild.outputText.includes("## Agency Quote Comparator"), "generated pack must include agency quote comparator section");
  ensure(afterBuild.outputText.includes("not a guaranteed cost saving"), "generated pack must avoid guaranteed savings claims");
  ensure(afterBuild.outputText.includes("## Agency Cost Control Matrix"), "generated pack must include agency cost control matrix section");
  ensure(afterBuild.outputText.includes("not procurement advice"), "generated pack must avoid procurement advice claims");
  ensure(afterBuild.outputText.includes("## Agency Cost Defense Calculator"), "generated pack must include agency cost defense calculator section");
  ensure(afterBuild.outputText.includes("Coverage index:"), "generated pack must include computed coverage index");
  ensure(afterBuild.outputText.includes("not financial advice"), "generated pack must avoid financial advice claims");
  ensure(afterBuild.outputText.includes("## Design Sprint Timeline Matrix"), "generated pack must include design sprint timeline matrix section");
  ensure(afterBuild.outputText.includes("not a delivery date guarantee"), "generated pack must avoid delivery date guarantee claims");
  ensure(afterBuild.outputText.includes("## Competitive Positioning Matrix"), "generated pack must include competitive positioning matrix section");
  ensure(afterBuild.outputText.includes("not market research"), "generated pack must avoid market research claims");
  ensure(afterBuild.outputText.includes("## Brand Voice & Messaging Matrix"), "generated pack must include brand voice messaging matrix section");
  ensure(afterBuild.outputText.includes("not legal copy approval"), "generated pack must avoid legal copy approval claims");
  ensure(afterBuild.outputText.includes("## Typography Pairing & Hierarchy Matrix"), "generated pack must include typography pairing hierarchy section");
  ensure(afterBuild.outputText.includes("not a font license"), "generated pack must avoid font license claims");
  ensure(afterBuild.outputText.includes("## Color System Accessibility Matrix"), "generated pack must include color system accessibility matrix section");
  ensure(afterBuild.outputText.includes("not accessibility certification"), "generated pack must avoid accessibility certification claims");
  ensure(afterBuild.outputText.includes("## Brand Rationale Deck"), "generated pack must include brand rationale deck section");
  ensure(afterBuild.outputText.includes("not a persuasion guarantee"), "generated pack must avoid persuasion guarantee claims");
  ensure(afterBuild.outputText.includes("## Visual Reference Moodboard"), "generated pack must include visual reference moodboard section");
  ensure(afterBuild.outputText.includes("not licensed asset approval"), "generated pack must avoid licensed asset approval claims");
  ensure(afterBuild.outputText.includes("## Creative Asset Shot List Matrix"), "generated pack must include creative asset shot list matrix section");
  ensure(afterBuild.outputText.includes("not model release approval"), "generated pack must avoid model release approval claims");
  ensure(afterBuild.outputText.includes("## Logo Concept Evaluation Matrix"), "generated pack must include logo concept evaluation section");
  ensure(afterBuild.outputText.includes("not final logo approval"), "generated pack must avoid final logo approval claims");
  ensure(afterBuild.outputText.includes("## Brand Usage Guideline"), "generated pack must include brand usage guideline section");
  ensure(afterBuild.outputText.includes("not a trademark license"), "generated pack must avoid trademark license claims");
  ensure(afterBuild.outputText.includes("## Creative Director QA"), "generated pack must include creative director QA section");
  ensure(afterBuild.outputText.includes("## Design Review Decision Matrix"), "generated pack must include design review decision matrix section");
  ensure(afterBuild.outputText.includes("not creative director approval"), "generated pack must avoid creative director approval claims");
  ensure(afterBuild.outputText.includes("## Approval State Transition Ledger"), "generated pack must include approval state transition ledger section");
  ensure(afterBuild.outputText.includes("not automatic signoff"), "generated pack must avoid automatic signoff claims");
  ensure(afterBuild.outputText.includes("## Revision Plan"), "generated pack must include revision plan section");
  ensure(afterBuild.outputText.includes("## Client Feedback Triage Board"), "generated pack must include client feedback triage board section");
  ensure(afterBuild.outputText.includes("not a stakeholder consensus guarantee"), "generated pack must avoid stakeholder consensus guarantee claims");
  ensure(afterBuild.outputText.includes("## Case Study Layout Board"), "generated pack must include case study layout section");
  ensure(afterBuild.outputText.includes("not a verified customer case study"), "generated pack must avoid verified customer case study claims");
  ensure(afterBuild.outputText.includes("## Visual QA Evidence Ledger"), "generated pack must include visual QA evidence ledger section");
  ensure(afterBuild.outputText.includes("do not fabricate screenshot evidence"), "generated pack must avoid fabricated visual evidence claims");
  ensure(afterBuild.outputText.includes("## Production File Manifest"), "generated pack must include production file manifest section");
  ensure(afterBuild.outputText.includes("## Asset Size Spec Sheet"), "generated pack must include asset size spec sheet section");
  ensure(afterBuild.outputText.includes("## Print Production Readiness Matrix"), "generated pack must include print production readiness matrix section");
  ensure(afterBuild.outputText.includes("not print proof approval"), "generated pack must avoid print proof approval claims");
  ensure(afterBuild.outputText.includes("## Client Approval Packet"), "generated pack must include client approval packet section");
  ensure(afterBuild.outputText.includes("## Client-Ready Export Index"), "generated pack must include client-ready export index section");
  ensure(afterBuild.outputText.includes("not a downloadable archive"), "generated pack must avoid downloadable archive delivery claims");
  ensure(afterBuild.outputText.includes("## Social Content Calendar Matrix"), "generated pack must include social content calendar matrix section");
  ensure(afterBuild.outputText.includes("not social media scheduling"), "generated pack must avoid social media scheduling claims");
  ensure(afterBuild.outputText.includes("verify current platform or vendor specs"), "generated pack must avoid platform spec guarantee claims");
  ensure(afterBuild.outputText.includes("not an endless revision loop"), "generated pack must avoid endless revision loop claims");
  ensure(afterBuild.outputText.includes("## Agency Workboards"), "generated pack must include agency workboards");
  ensure(afterBuild.outputText.includes("asset-provenance-sheet"), "generated pack must include asset provenance output");
  ensure(afterBuild.outputText.includes("npm run check:seis-design-agency-kit"), "generated pack must include validation command");
  ensure(afterBuild.outputText.includes("no API keys"), "generated pack must preserve no-key boundary");
  ensure(afterBuild.outputText.includes("Independent studio operators"), "generated pack must include custom audience field");
  ensure(afterBuild.outputText.includes("Agency-grade launch kit without live provider calls"), "generated pack must include custom offer field");
  ensure(afterBuild.outputText.includes("Decision maker, success metric, existing assets, missing inputs, channel needs, legal blockers, private asset boundary, and next evidence request"), "generated pack must include custom client discovery intake field");
  ensure(afterBuild.outputText.includes("Literal, coined, descriptive, editorial, and system-style names with offer phrase, pronunciation, memorability, domain/social availability notes, trademark blocker, and decision owner"), "generated pack must include custom brand offer naming field");
  ensure(afterBuild.outputText.includes("Business goal, audience promise, stakeholder priorities, must-say and must-not-say rules, proof gaps, unresolved questions, and decision owner"), "generated pack must include custom brand strategy workshop field");
  ensure(afterBuild.outputText.includes("Hero promise, section order, proof blocks, objection handling, CTA ladder, responsive priority, accessibility notes, analytics questions, and owner"), "generated pack must include custom landing page blueprint field");
  ensure(afterBuild.outputText.includes("Brand sprint plus launch kit"), "generated pack must include custom scope field");
  ensure(afterBuild.outputText.includes("Avoid unchecked agency retainer"), "generated pack must include custom budget band field");
  ensure(afterBuild.outputText.includes("Outside agency quote with vague deliverables and monthly retainer"), "generated pack must include custom quote baseline field");
  ensure(afterBuild.outputText.includes("Line item, SEIS in-house route, external-buy trigger, quality risk, evidence requirement, decision owner, and approval gate"), "generated pack must include custom agency cost control field");
  ensure(afterBuild.outputText.includes("Quoted line item, replaceable deliverables, in-house coverage index, must-buy trigger, risk owner, validation proof, and next spend decision"), "generated pack must include custom agency cost defense field");
  ensure(afterBuild.outputText.includes("Discovery day, strategy freeze, production block, review checkpoint, revision window, QA pass, handoff day, owner, and blocker rule"), "generated pack must include custom design sprint timeline field");
  ensure(afterBuild.outputText.includes("SEIS draft pack plus validation before buying external help"), "generated pack must include custom internal production path field");
  ensure(afterBuild.outputText.includes("Direct competitors, aspirational references, category cues, visual territory, differentiation, evidence gaps, and decision owner"), "generated pack must include custom competitive positioning field");
  ensure(afterBuild.outputText.includes("Display, text, UI, mono, fallback roles, scale, contrast, readability, language support, font license blocker, and implementation owner"), "generated pack must include custom typography hierarchy field");
  ensure(afterBuild.outputText.includes("Primary, accent, surface, text, status colors, contrast pairs, dark mode behavior, token mapping, accessibility risk, and review owner"), "generated pack must include custom color system field");
  ensure(afterBuild.outputText.includes("Audience, offer, hierarchy, proof, token choices, objections, and review action"), "generated pack must include custom rationale focus field");
  ensure(afterBuild.outputText.includes("Reference themes, color mood, type attitude, imagery cues, motion tone, provenance notes, rejected directions, and review owner"), "generated pack must include custom moodboard direction field");
  ensure(afterBuild.outputText.includes("Wordmark, symbol, lockup, small-size readability, monochrome use, misuse risk, trademark blocker, and decision owner"), "generated pack must include custom logo concept field");
  ensure(afterBuild.outputText.includes("Logo spacing, color use, type hierarchy, imagery rules, do and don't examples, accessibility, and escalation owner"), "generated pack must include custom usage guideline focus field");
  ensure(afterBuild.outputText.includes("Approve, revise, or hold decision, severity, visual debt, blocking fixes, polish queue, evidence links, publication blocker, owner, and next action"), "generated pack must include custom design review decision field");
  ensure(afterBuild.outputText.includes("Draft, review-ready, revise, hold, approved-for-handoff, evidence link, reviewer, blocker, validation command, rollback note, and next action"), "generated pack must include custom approval state transition field");
  ensure(afterBuild.outputText.includes("One decision round plus one polish round"), "generated pack must include custom revision round field");
  ensure(afterBuild.outputText.includes("Decision fixes, polish, out-of-scope requests, risk notes, owner, and next review action"), "generated pack must include custom feedback triage focus field");
  ensure(afterBuild.outputText.includes("Context, challenge, response, proof, accessibility, quality path, and publication boundary"), "generated pack must include custom case study focus field");
  ensure(afterBuild.outputText.includes("Source paths, export specs, provenance, accessibility notes, and rollback"), "generated pack must include custom delivery standard field");
  ensure(afterBuild.outputText.includes("Desktop, mobile, SEIS Code review, reduced motion, and overflow evidence"), "generated pack must include custom visual evidence target field");
  ensure(afterBuild.outputText.includes("Client-ready index of included files, review state, source paths, blockers, and excluded work"), "generated pack must include custom export index target field");
  ensure(afterBuild.outputText.includes("Website hero, wide preview, square post, vertical story, deck cover, and thumbnail"), "generated pack must include custom channel field");
  ensure(afterBuild.outputText.includes("Hold until proof, exclusions, risk, and export readiness are reviewed"), "generated pack must include custom approval checkpoint field");
  ensure(afterBuild.outputText.includes("Friday design review"), "generated pack must include custom deadline field");
  ensure(afterBuild.outputText.includes("SEIS design reviewer"), "generated pack must include custom approval owner field");
  ensure(afterBuild.localPack === afterBuild.outputText, "generated pack must persist to localStorage");
  ensure(afterBuild.status === "Agency pack generated locally.", "generation status must be truthful");

  await clickSelector(client, "[data-export-agency-pack]");
  const afterExport = await evaluate(client, stateExpression);
  ensure(afterExport.outputText.includes("## Handoff"), "exported pack must include handoff section");
  ensure(afterExport.outputText.includes(HANDOFF_PATH), "exported pack must include SEIS Code handoff path");
  ensure(afterExport.handoffManifest?.path === HANDOFF_PATH, "handoff manifest must include SEIS Code path");
  ensure(afterExport.handoffManifest?.content === afterExport.outputText, "handoff manifest must include generated pack content");
  ensure(afterExport.handoffManifest?.requiresHumanReviewBeforePublication === true, "handoff manifest must preserve human-review gate");
  ensure(afterExport.handoffManifest?.notClaims?.includes("not host filesystem write"), "handoff manifest must not claim host filesystem writes");
  ensure(afterExport.handoffManifest?.notClaims?.includes("not Git commit"), "handoff manifest must not claim Git commits");
  ensure(afterExport.handoffManifest?.notClaims?.includes("not deployment"), "handoff manifest must not claim deployment");
  ensure(/^(SEIS Code handoff saved locally\.|Handoff manifest saved locally; SEIS Code workspace unavailable\.)$/.test(afterExport.status), "export action must report local handoff truthfully");

  const workspaceHandoff = await inspectAgencyWorkspaceHandoff(client);
  ensure(workspaceHandoff.ok, "SEIS Code IndexedDB workspace must be inspectable after export");
  ensure(workspaceHandoff.found, "Export to SEIS Code must write the agency pack into the browser-local SEIS Code workspace");
  ensure(workspaceHandoff.path === HANDOFF_PATH, "workspace handoff must use the declared SEIS Code path");
  ensure(workspaceHandoff.language === "markdown", "workspace handoff must use markdown language metadata");
  ensure(workspaceHandoff.content.includes("# SEIS Design Agency Pack"), "workspace handoff content must include pack title");
  ensure(workspaceHandoff.content.includes("not host filesystem"), "workspace handoff content must preserve no-host boundary");

  await clickSelector(client, "[data-copy-agency-pack]");
  const afterCopy = await evaluate(client, stateExpression);
  ensure(/^Agency pack (copied|saved locally)\.$/.test(afterCopy.status), "copy action must report copied or saved locally");
  ensure(!afterCopy.horizontalOverflow, "desktop design page must not horizontally overflow after generation");

  return {
    outputCount: afterBuild.outputIds.length,
    generatedBytes: afterBuild.outputText.length,
    handoffPath: workspaceHandoff.path,
    status: afterCopy.status,
    screenshot: await screenshot(client, "desktop-design-agency-kit.png"),
  };
}

async function smokeMobile(client, baseUrl) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 760,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await goto(client, `${baseUrl}/website/seis-design.html`);
  await delay(500);
  await clickSelector(client, "[data-build-agency-pack]");
  const state = await evaluate(client, stateExpression);
  ensure(state.workflowFound, "mobile agency workflow must render");
  ensure(state.outputIds.length === REQUIRED_OUTPUTS.length, "mobile agency workflow must render all outputs");
  ensure(state.workboardIds.length === REQUIRED_WORKBOARDS.length, "mobile agency workflow must render all visible workboards");
  ensure(state.outputText.includes("handoff-checklist"), "mobile generated pack must include handoff checklist");
  ensure(!state.horizontalOverflow, `mobile design page must not horizontally overflow: ${JSON.stringify(state.viewport)}`);

  return {
    outputCount: state.outputIds.length,
    workboardCount: state.workboardIds.length,
    generatedBytes: state.outputText.length,
    viewport: state.viewport,
    screenshot: await screenshot(client, "mobile-design-agency-kit.png"),
  };
}

async function smokeSeisCodeReview(client, baseUrl) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 1280,
    height: 820,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await goto(client, `${baseUrl}/seis-code.html`);
  await waitFor(client, "Boolean(window.__SEIS_CODE__)", 18000);
  await waitFor(client, `window.__SEIS_CODE__.filePaths().includes(${JSON.stringify(HANDOFF_PATH)})`, 8000);

  await clickSelector(client, "[data-view-button=\"design\"]");
  const beforeOpen = await evaluate(client, codeReviewStateExpression);
  ensure(beforeOpen.title === "SEIS Code", "SEIS Code route title must render for cross-route handoff review");
  ensure(beforeOpen.activeView === "design", "SEIS Code Design Handoff activity view must activate");
  ensure(beforeOpen.designHandoffText.includes("Workspace file ready"), "SEIS Code Design Handoff view must detect exported pack");
  ensure(beforeOpen.designHandoffText.includes("Browser-local review only"), "SEIS Code Design Handoff must preserve browser-local boundary");
  ensure(beforeOpen.designHandoffPreview.includes("# SEIS Design Agency Pack"), "SEIS Code Design Handoff preview must show the agency pack");
  ensure(!beforeOpen.horizontalOverflow, "SEIS Code Design Handoff desktop view must not horizontally overflow before review note");

  await clickSelector(client, "[data-action=\"open-design-handoff\"]");
  await waitFor(client, `window.__SEIS_CODE__.activePath() === ${JSON.stringify(HANDOFF_PATH)}`, 8000);
  const afterOpen = await evaluate(client, codeReviewStateExpression);
  ensure(afterOpen.openTabs.includes(HANDOFF_PATH), "SEIS Code must open the exported agency pack as a tab");
  ensure(afterOpen.outputText.includes("Opened Design Agency Kit handoff"), "SEIS Code must report handoff opening in output");

  await clickSelector(client, "[data-action=\"create-design-review-note\"]");
  await waitFor(client, `window.__SEIS_CODE__.filePaths().includes(${JSON.stringify(REVIEW_PATH)})`, 8000);
  await waitFor(client, `window.__SEIS_CODE__.activePath() === ${JSON.stringify(REVIEW_PATH)}`, 8000);
  const afterReview = await evaluate(client, codeReviewStateExpression);
  ensure(afterReview.openTabs.includes(REVIEW_PATH), "SEIS Code must open the generated Design Handoff review note");
  ensure(afterReview.outputText.includes("Design Agency Kit review note"), "SEIS Code must report review note creation in output");
  ensure(!afterReview.horizontalOverflow, "SEIS Code Design Handoff desktop view must not horizontally overflow after review note");

  const reviewFile = await inspectWorkspaceFile(client, REVIEW_PATH);
  ensure(reviewFile.ok, "SEIS Code IndexedDB workspace must be inspectable after review note creation");
  ensure(reviewFile.found, "SEIS Code must persist the browser-local Design Handoff review note");
  ensure(reviewFile.language === "markdown", "Design Handoff review note must use markdown language metadata");
  ensure(reviewFile.content.includes("# SEIS Design Agency Pack Review"), "Design Handoff review note must include review title");
  ensure(reviewFile.content.includes("No host filesystem write"), "Design Handoff review note must preserve no-host boundary");
  ensure(reviewFile.content.includes("Client template"), "Design Handoff review note must include review checklist");

  return {
    handoffPath: HANDOFF_PATH,
    reviewPath: REVIEW_PATH,
    reviewBytes: reviewFile.content.length,
    activePath: afterReview.activePath,
    screenshot: await screenshot(client, "desktop-seis-code-design-handoff-review.png"),
  };
}

async function main() {
  const chromePath = findChrome();
  if (!chromePath) {
    throw new Error("No Chrome or Chromium executable found. Set CHROME_PATH to run the SEIS Design Agency Kit browser smoke.");
  }

  rmSync(SCREENSHOT_DIR, { recursive: true, force: true });
  mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const staticServer = createStaticServer();
  await new Promise((resolveListen) => staticServer.listen(0, HOST, resolveListen));
  const appPort = staticServer.address().port;
  const debugPort = 9823 + Math.floor(Math.random() * 300);
  const userDataDir = join(tmpdir(), `seis-design-agency-kit-chrome-${Date.now()}`);
  const chrome = spawn(chromePath, [
    "--headless=new",
    `--remote-debugging-port=${debugPort}`,
    "--remote-allow-origins=*",
    `--user-data-dir=${userDataDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "about:blank",
  ], { stdio: "ignore" });

  let client;

  try {
    client = await newTab(debugPort);
    const baseUrl = `http://${HOST}:${appPort}`;
    const desktop = await smokeDesktop(client, baseUrl);
    const seisCodeReview = await smokeSeisCodeReview(client, baseUrl);
    const mobile = await smokeMobile(client, baseUrl);
    const relevantIssues = collectRelevantIssues(client.events);
    ensure(relevantIssues.length === 0, `browser console/network issues detected: ${JSON.stringify(relevantIssues)}`);

    if (failures.length > 0) {
      console.error("SEIS Design Agency Kit browser smoke failed:");
      for (const failure of failures) console.error(`- ${failure}`);
      process.exitCode = 1;
      return;
    }

    console.log(JSON.stringify({
      ok: true,
      browser: chromePath,
      appPort,
      screenshotDir: resolve(SCREENSHOT_DIR),
      desktop,
      seisCodeReview,
      mobile,
    }, null, 2));
  } finally {
    if (client) client.close();
    chrome.kill("SIGTERM");
    staticServer.close();
    setTimeout(() => rmSync(userDataDir, { recursive: true, force: true, maxRetries: 2, retryDelay: 100 }), 500);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
