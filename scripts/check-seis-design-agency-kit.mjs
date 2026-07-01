import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const KIT_FILE = path.join(ROOT, "content", "development", "seis-design-agency-kit.json");
const DOC_FILE = path.join(ROOT, "docs", "design-system", "seis-design-agency-kit.md");
const PACKAGE_FILE = path.join(ROOT, "package.json");
const DESIGN_PAGE_FILE = path.join(ROOT, "apps", "web", "website", "seis-design.html");
const WEBSITE_RUNTIME_FILE = path.join(ROOT, "apps", "web", "website", "product-page.js");
const WEBSITE_CSS_FILE = path.join(ROOT, "apps", "web", "website", "product-page.css");
const BROWSER_SMOKE_FILE = path.join(ROOT, "scripts", "check-seis-design-agency-kit-browser-smoke.mjs");
const SEIS_CODE_HTML_FILE = path.join(ROOT, "apps", "web", "seis-code.html");
const SEIS_CODE_RUNTIME_FILE = path.join(ROOT, "apps", "web", "seis-code.js");
const SEIS_CODE_CSS_FILE = path.join(ROOT, "apps", "web", "seis-code.css");
const failures = [];

const REQUIRED_NOT_CLAIMS = [
  "not a guaranteed replacement for every professional designer",
  "not a live client services marketplace",
  "not an automated logo generator",
  "not a paid media buying system",
  "not a trademark clearance service",
  "not a production print vendor",
  "not a platform spec guarantee",
  "not a guaranteed cost saving",
  "not fabricated evidence",
  "not a persuasion guarantee",
  "not a downloadable archive",
  "not a trademark license",
  "not a stakeholder consensus guarantee",
  "not a verified customer case study",
  "not licensed asset approval",
  "not final logo approval",
  "not market research",
  "not a font license",
  "not accessibility certification",
  "not print proof approval",
  "not legal copy approval",
  "not social media scheduling",
  "not model release approval",
  "not a business strategy guarantee",
  "not a conversion guarantee",
  "not procurement advice",
  "not a delivery date guarantee",
  "not a client contract",
];

const REQUIRED_WORKFLOW_IDS = ["intake", "discovery-intake", "strategy-workshop", "proposal", "comparison", "cost-control", "design-sprint-timeline", "positioning", "messaging", "typography", "color-system", "print-production", "rationale", "moodboard", "asset-shot-list", "logo-evaluation", "identity", "usage", "web", "landing-blueprint", "portfolio", "campaign", "review", "revision", "feedback", "visual-qa", "approval", "export-index", "provenance", "handoff"];

const REQUIRED_EDITABLE_FIELD_IDS = ["audience", "offer", "clientDiscoveryIntakeFocus", "brandStrategyWorkshopFocus", "format", "landingPageBlueprintFocus", "scope", "budgetBand", "quoteBaseline", "agencyCostControlFocus", "designSprintTimelineFocus", "internalProductionPath", "competitivePositioningFocus", "messagingVoiceFocus", "typographyHierarchyFocus", "colorSystemFocus", "rationaleFocus", "moodboardDirectionFocus", "creativeAssetShotListFocus", "logoConceptFocus", "usageGuidelineFocus", "revisionRound", "feedbackTriageFocus", "caseStudyFocus", "deliveryStandard", "printProductionFocus", "visualEvidenceTarget", "exportIndexTarget", "channels", "contentCalendarFocus", "approvalCheckpoint", "deadline", "approvalOwner"];

const REQUIRED_DELIVERABLE_IDS = [
  "creative-brief",
  "client-discovery-intake-matrix",
  "brand-strategy-workshop-matrix",
  "proposal-scope-estimator",
  "agency-quote-comparator",
  "agency-cost-control-matrix",
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
  "revision-round-plan",
  "client-feedback-triage-board",
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
  "case-study-layout",
  "cinematic-showcase-package",
  "component-inventory",
  "asset-provenance-sheet",
  "social-campaign-brief",
  "social-content-calendar-matrix",
  "social-variant-set",
  "presentation-cover-system",
  "presentation-system-map",
  "handoff-checklist",
];

const REQUIRED_GENERATED_OUTPUT_IDS = [
  "creative-brief",
  "client-discovery-intake-matrix",
  "brand-strategy-workshop-matrix",
  "proposal-scope-estimator",
  "agency-quote-comparator",
  "agency-cost-control-matrix",
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

const REQUIRED_WORKBOARD_IDS = [
  "brand-audit-scorecard",
  "client-discovery-intake-matrix",
  "brand-strategy-workshop-matrix",
  "landing-page-blueprint-matrix",
  "proposal-scope-estimator",
  "agency-quote-comparator",
  "agency-cost-control-matrix",
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

const REQUIRED_VALIDATION = [
  "npm run check:seis-design-agency-kit",
  "npm run check:design-component-inventory",
  "npm run check:video-hero-showcase",
  "npm run check:video-hero-performance-budget",
  "npm run check:seis-public-readiness",
];

const REQUIRED_DOC_PHRASES = [
  "agency-grade",
  "no-key",
  "asset provenance",
  "human review before publication",
  "not a guaranteed replacement",
  "browser-local",
  "creative brief",
  "client discovery intake",
  "not a client contract",
  "brand strategy workshop",
  "not a business strategy guarantee",
  "landing page blueprint",
  "not a conversion guarantee",
  "proposal scope",
  "budget boundary",
  "not a binding quote",
  "agency quote comparator",
  "not a guaranteed cost saving",
  "agency cost control",
  "not procurement advice",
  "design sprint timeline",
  "not a delivery date guarantee",
  "competitive positioning matrix",
  "not market research",
  "brand voice",
  "not legal copy approval",
  "social content calendar",
  "not social media scheduling",
  "typography pairing",
  "not a font license",
  "color system accessibility matrix",
  "not accessibility certification",
  "print production readiness",
  "not print proof approval",
  "brand rationale deck",
  "not a persuasion guarantee",
  "visual reference moodboard",
  "not licensed asset approval",
  "creative asset shot list",
  "not model release approval",
  "logo concept evaluation",
  "not final logo approval",
  "brand usage guideline",
  "not a trademark license",
  "client-ready export index",
  "not a downloadable archive",
  "creative director qa",
  "revision plan",
  "client feedback triage",
  "not a stakeholder consensus guarantee",
  "case study layout",
  "not a verified customer case study",
  "production file manifest",
  "asset size spec sheet",
  "client approval packet",
  "not an endless revision loop",
  "not a platform spec guarantee",
  "visual qa evidence ledger",
  "not fabricated evidence",
  "build agency pack",
  "export to seis code",
  "visible workboards",
  "handoff-checklist",
  "seis code",
  "brand audit",
  "launch asset",
  "social variant",
  "presentation system",
  "approval owner",
];

const SENSITIVE_PATTERNS = [
  { label: "OpenSSH private key", pattern: /BEGIN OPENSSH PRIVATE KEY/ },
  { label: "RSA private key", pattern: /BEGIN RSA PRIVATE KEY/ },
  { label: "EC private key", pattern: /BEGIN EC PRIVATE KEY/ },
  { label: "GitHub classic token", pattern: /ghp_[A-Za-z0-9_]+/ },
  { label: "GitHub fine-grained token", pattern: /github_pat_[A-Za-z0-9_]+/ },
  { label: "OpenAI-style secret key", pattern: /sk-[A-Za-z0-9_-]{12,}/ },
  { label: "provider API key assignment", pattern: /\b(?:OPENAI|ANTHROPIC|GEMINI)_API_KEY\s*=/ },
  { label: "private key assignment", pattern: /\bPRIVATE_KEY\s*=/ },
  { label: "AWS secret assignment", pattern: /\bAWS_SECRET_ACCESS_KEY\s*=/ },
  { label: "password assignment", pattern: /\bpassword\s*=/i },
  { label: "token assignment", pattern: /\btoken\s*=/i },
];

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function readText(file) {
  if (!fs.existsSync(file)) {
    failures.push(`Missing ${path.relative(ROOT, file)}`);
    return "";
  }
  return fs.readFileSync(file, "utf8");
}

function readJson(file) {
  const text = readText(file);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    failures.push(`Invalid JSON in ${path.relative(ROOT, file)}: ${error.message}`);
    return null;
  }
}

function commandExists(command, packageScripts) {
  const npmScript = String(command).match(/^npm run ([^\s]+)/)?.[1];
  const nodeScript = String(command).match(/^node (scripts\/[^\s]+)/)?.[1];
  if (npmScript) return packageScripts.has(npmScript);
  if (nodeScript) return fs.existsSync(path.join(ROOT, nodeScript));
  return false;
}

function ensureRelativeExistingPath(label, relativePath) {
  ensure(!String(relativePath).startsWith("/"), `${label} path must be repository-relative: ${relativePath}`);
  ensure(!String(relativePath).includes(".."), `${label} path must not traverse directories: ${relativePath}`);
  ensure(fs.existsSync(path.join(ROOT, relativePath)), `${label} evidence path does not exist: ${relativePath}`);
}

function ensureIncludesAll(values, requiredValues, label) {
  const set = new Set(values || []);
  for (const value of requiredValues) ensure(set.has(value), `${label} missing ${value}`);
}

function scanSensitiveText(relativePath, text) {
  for (const { label, pattern } of SENSITIVE_PATTERNS) {
    ensure(!pattern.test(text), `${relativePath} contains sensitive pattern category: ${label}`);
  }
}

const kitText = readText(KIT_FILE);
const docText = readText(DOC_FILE);
const designPageText = readText(DESIGN_PAGE_FILE);
const websiteRuntimeText = readText(WEBSITE_RUNTIME_FILE);
const websiteCssText = readText(WEBSITE_CSS_FILE);
const browserSmokeText = readText(BROWSER_SMOKE_FILE);
const seisCodeHtmlText = readText(SEIS_CODE_HTML_FILE);
const seisCodeRuntimeText = readText(SEIS_CODE_RUNTIME_FILE);
const seisCodeCssText = readText(SEIS_CODE_CSS_FILE);
const packageJson = readJson(PACKAGE_FILE);
const kit = readJson(KIT_FILE);
const packageScripts = new Set(Object.keys(packageJson?.scripts || {}));

if (kitText) scanSensitiveText(path.relative(ROOT, KIT_FILE), kitText);
if (docText) scanSensitiveText(path.relative(ROOT, DOC_FILE), docText);
if (designPageText) scanSensitiveText(path.relative(ROOT, DESIGN_PAGE_FILE), designPageText);
if (websiteRuntimeText) scanSensitiveText(path.relative(ROOT, WEBSITE_RUNTIME_FILE), websiteRuntimeText);

if (kit) {
  ensure(kit.schemaVersion === 1, "kit schemaVersion must be 1");
  ensure(kit.id === "seis-design-agency-kit", "kit id must remain seis-design-agency-kit");
  ensure(kit.status === "agency-kit-foundation", "kit status must remain agency-kit-foundation");
  ensure(kit.mode === "no_key_design_production_system", "kit mode must remain no_key_design_production_system");
  ensure(typeof kit.purpose === "string" && kit.purpose.includes("agency-grade"), "kit purpose must describe agency-grade intent");

  ensureIncludesAll(kit.notClaims, REQUIRED_NOT_CLAIMS, "notClaims");
  ensureIncludesAll(kit.qualityPrinciples, ["asset provenance before publication"], "qualityPrinciples");
  ensureIncludesAll(kit.minimumValidation, REQUIRED_VALIDATION, "minimumValidation");

  ensure(Array.isArray(kit.workflow), "workflow must be an array");
  ensureIncludesAll(
    kit.workflow?.map((step) => step?.id),
    REQUIRED_WORKFLOW_IDS,
    "workflow",
  );

  const workflowIds = new Set();
  for (const step of kit.workflow || []) {
    const label = step?.id || "unknown workflow step";
    ensure(!workflowIds.has(step?.id), `duplicate workflow id: ${step?.id}`);
    workflowIds.add(step?.id);
    ensure(typeof step?.title === "string" && step.title.length > 0, `${label} must define title`);
    ensure(typeof step?.status === "string" && step.status.length > 0, `${label} must define status`);
    ensure(typeof step?.output === "string" && step.output.length >= 20, `${label} must define output`);
    ensure(Array.isArray(step?.evidence) && step.evidence.length > 0, `${label} must define evidence`);
    for (const evidencePath of step?.evidence || []) ensureRelativeExistingPath(`${label} workflow`, evidencePath);
  }

  ensure(Array.isArray(kit.deliverables), "deliverables must be an array");
  ensure(kit.deliverables?.length >= REQUIRED_DELIVERABLE_IDS.length, "kit must define all required deliverables");
  ensureIncludesAll(
    kit.deliverables?.map((deliverable) => deliverable?.id),
    REQUIRED_DELIVERABLE_IDS,
    "deliverables",
  );

  const deliverableIds = new Set();
  for (const deliverable of kit.deliverables || []) {
    const label = deliverable?.id || "unknown deliverable";
    ensure(!deliverableIds.has(deliverable?.id), `duplicate deliverable id: ${deliverable?.id}`);
    deliverableIds.add(deliverable?.id);
    ensure(typeof deliverable?.category === "string" && deliverable.category.length > 0, `${label} must define category`);
    ensure(typeof deliverable?.agencyEquivalent === "string" && deliverable.agencyEquivalent.length > 0, `${label} must define agencyEquivalent`);
    ensure(typeof deliverable?.seisOutput === "string" && deliverable.seisOutput.length >= 20, `${label} must define seisOutput`);
    ensure(Array.isArray(deliverable?.requiredEvidence) && deliverable.requiredEvidence.length > 0, `${label} must define requiredEvidence`);
    ensure(Array.isArray(deliverable?.validationCommands) && deliverable.validationCommands.length > 0, `${label} must define validationCommands`);

    for (const evidencePath of deliverable?.requiredEvidence || []) ensureRelativeExistingPath(`${label} deliverable`, evidencePath);
    for (const command of deliverable?.validationCommands || []) {
      ensure(commandExists(command, packageScripts), `${label} references missing validation command: ${command}`);
    }
  }

  ensure(kit.securityBoundary?.requiresApiKeys === false, "securityBoundary.requiresApiKeys must be false");
  ensure(kit.securityBoundary?.allowsClientSecrets === false, "securityBoundary.allowsClientSecrets must be false");
  ensure(kit.securityBoundary?.allowsPrivateAssets === false, "securityBoundary.allowsPrivateAssets must be false");
  ensure(kit.securityBoundary?.requiresHumanReviewBeforePublication === true, "securityBoundary.requiresHumanReviewBeforePublication must be true");
  ensure(kit.securityBoundary?.requiresAssetProvenance === true, "securityBoundary.requiresAssetProvenance must be true");

  ensure(kit.browserWorkflow?.status === "browser-local-draft-workflow", "browserWorkflow.status must be browser-local-draft-workflow");
  ensure(kit.browserWorkflow?.route === "apps/web/website/seis-design.html", "browserWorkflow.route must point to the SEIS Design page");
  ensure(kit.browserWorkflow?.runtime === "apps/web/website/product-page.js", "browserWorkflow.runtime must point to product-page.js");
  ensure(kit.browserWorkflow?.styles === "apps/web/website/product-page.css", "browserWorkflow.styles must point to product-page.css");
  ensure(kit.browserWorkflow?.smokeCheck === "scripts/check-seis-design-agency-kit-browser-smoke.mjs", "browserWorkflow.smokeCheck must point to the browser smoke script");
  ensure(kit.browserWorkflow?.storageKey === "seis.design.agencyPack.v1", "browserWorkflow.storageKey must remain public-safe and specific");
  ensure(kit.browserWorkflow?.handoffStorageKey === "seis.design.agencyPack.handoff.v1", "browserWorkflow.handoffStorageKey must remain public-safe and specific");
  ensure(kit.browserWorkflow?.handoffPath === "/workspace/Design/seis-design-agency-pack.md", "browserWorkflow.handoffPath must stay inside SEIS Code /workspace");
  ensure(kit.browserWorkflow?.crossRouteSmoke?.enabled === true, "browserWorkflow.crossRouteSmoke.enabled must be true");
  ensure(kit.browserWorkflow?.crossRouteSmoke?.designRoute === "apps/web/website/seis-design.html", "browserWorkflow.crossRouteSmoke.designRoute must point to SEIS Design");
  ensure(kit.browserWorkflow?.crossRouteSmoke?.codeRoute === "apps/web/seis-code.html", "browserWorkflow.crossRouteSmoke.codeRoute must point to SEIS Code");
  ensure(kit.browserWorkflow?.crossRouteSmoke?.reviewPath === "/workspace/Design/seis-design-agency-pack-review.md", "browserWorkflow.crossRouteSmoke.reviewPath must stay inside the SEIS Code Design workspace");
  ensureIncludesAll(
    kit.browserWorkflow?.crossRouteSmoke?.verifies,
    ["exported pack visible in SEIS Code", "Design Handoff activity opens pack", "review note created in SEIS Code IndexedDB", "no host filesystem write claim"],
    "browserWorkflow.crossRouteSmoke.verifies",
  );
  ensureIncludesAll(kit.browserWorkflow?.actions, ["data-build-agency-pack", "data-export-agency-pack", "data-copy-agency-pack"], "browserWorkflow.actions");
  ensureIncludesAll(kit.browserWorkflow?.editableFieldIds, REQUIRED_EDITABLE_FIELD_IDS, "browserWorkflow.editableFieldIds");
  ensureIncludesAll(
    kit.browserWorkflow?.generatedOutputIds,
    REQUIRED_GENERATED_OUTPUT_IDS,
    "browserWorkflow.generatedOutputIds",
  );
  ensureIncludesAll(kit.browserWorkflow?.workboardIds, REQUIRED_WORKBOARD_IDS, "browserWorkflow.workboardIds");
  ensureIncludesAll(
    kit.browserWorkflow?.notClaims,
    ["not automatic publication", "not client approval", "not binding quote", "not endless revision loop", "not live provider generation", "not guaranteed cost saving", "not fabricated evidence", "not a persuasion guarantee", "not downloadable archive"],
    "browserWorkflow.notClaims",
  );
  ensureIncludesAll(
    kit.browserWorkflow?.notClaims,
    ["not market research"],
    "browserWorkflow.notClaims",
  );
  ensureIncludesAll(
    kit.browserWorkflow?.notClaims,
    ["not a business strategy guarantee"],
    "browserWorkflow.notClaims",
  );
  ensureIncludesAll(
    kit.browserWorkflow?.notClaims,
    ["not a conversion guarantee"],
    "browserWorkflow.notClaims",
  );
  ensureIncludesAll(
    kit.browserWorkflow?.notClaims,
    ["not procurement advice"],
    "browserWorkflow.notClaims",
  );
  ensureIncludesAll(
    kit.browserWorkflow?.notClaims,
    ["not a delivery date guarantee"],
    "browserWorkflow.notClaims",
  );
  ensureIncludesAll(
    kit.browserWorkflow?.notClaims,
    ["not a client contract"],
    "browserWorkflow.notClaims",
  );
  ensureIncludesAll(
    kit.browserWorkflow?.notClaims,
    ["not legal copy approval"],
    "browserWorkflow.notClaims",
  );
  ensureIncludesAll(
    kit.browserWorkflow?.notClaims,
    ["not social media scheduling"],
    "browserWorkflow.notClaims",
  );
  ensureIncludesAll(
    kit.browserWorkflow?.notClaims,
    ["not model release approval"],
    "browserWorkflow.notClaims",
  );
  ensureIncludesAll(
    kit.browserWorkflow?.notClaims,
    ["not a font license"],
    "browserWorkflow.notClaims",
  );
  ensureIncludesAll(
    kit.browserWorkflow?.notClaims,
    ["not accessibility certification"],
    "browserWorkflow.notClaims",
  );
  ensureIncludesAll(
    kit.browserWorkflow?.notClaims,
    ["not print proof approval"],
    "browserWorkflow.notClaims",
  );
  ensureIncludesAll(
    kit.browserWorkflow?.notClaims,
    ["not trademark license", "not stakeholder consensus guarantee", "not verified customer case study"],
    "browserWorkflow.notClaims",
  );
  ensureIncludesAll(
    kit.browserWorkflow?.notClaims,
    ["not licensed asset approval"],
    "browserWorkflow.notClaims",
  );
  ensureIncludesAll(
    kit.browserWorkflow?.notClaims,
    ["not final logo approval"],
    "browserWorkflow.notClaims",
  );
  ensureIncludesAll(
    kit.browserWorkflow?.notClaims,
    ["not host filesystem write", "not Git commit", "not deployment"],
    "browserWorkflow.notClaims",
  );
  ensureIncludesAll(
    kit.browserWorkflow?.validationCommands,
    ["npm run check:seis-design-agency-kit", "npm run check:seis-design-agency-kit-browser-smoke"],
    "browserWorkflow.validationCommands",
  );
  for (const command of kit.browserWorkflow?.validationCommands || []) {
    ensure(commandExists(command, packageScripts), `browserWorkflow references missing validation command: ${command}`);
  }
  const reviewSurface = kit.browserWorkflow?.reviewSurface;
  ensure(reviewSurface?.route === "apps/web/seis-code.html", "browserWorkflow.reviewSurface.route must point to SEIS Code");
  ensure(reviewSurface?.runtime === "apps/web/seis-code.js", "browserWorkflow.reviewSurface.runtime must point to SEIS Code runtime");
  ensure(reviewSurface?.styles === "apps/web/seis-code.css", "browserWorkflow.reviewSurface.styles must point to SEIS Code styles");
  ensure(reviewSurface?.view === "design", "browserWorkflow.reviewSurface.view must remain design");
  ensure(reviewSurface?.reviewPath === "/workspace/Design/seis-design-agency-pack-review.md", "browserWorkflow.reviewSurface.reviewPath must stay inside the SEIS Code Design workspace");
  ensureRelativeExistingPath("reviewSurface route", reviewSurface?.route || "");
  ensureRelativeExistingPath("reviewSurface runtime", reviewSurface?.runtime || "");
  ensureRelativeExistingPath("reviewSurface styles", reviewSurface?.styles || "");
  ensureIncludesAll(reviewSurface?.actions, ["open-design-handoff", "import-design-handoff", "create-design-review-note"], "browserWorkflow.reviewSurface.actions");
  ensureIncludesAll(reviewSurface?.notClaims, ["not host filesystem write", "not Git commit", "not deployment", "not client approval"], "browserWorkflow.reviewSurface.notClaims");
  for (const marker of kit.browserWorkflow?.requiredMarkers || []) {
    ensure(websiteRuntimeText.includes(marker), `website runtime missing browser workflow marker: ${marker}`);
  }
  for (const action of kit.browserWorkflow?.actions || []) {
    ensure(websiteRuntimeText.includes(action), `website runtime missing action marker: ${action}`);
  }
  for (const fieldId of kit.browserWorkflow?.editableFieldIds || []) {
    ensure(websiteRuntimeText.includes(fieldId), `website runtime missing editable field id: ${fieldId}`);
    ensure(browserSmokeText.includes(fieldId), `browser smoke missing editable field id: ${fieldId}`);
  }
  for (const outputId of kit.browserWorkflow?.generatedOutputIds || []) {
    ensure(websiteRuntimeText.includes(outputId), `website runtime missing generated output id: ${outputId}`);
  }
  ensure(designPageText.includes('data-page="seis-design"'), "SEIS Design page must declare data-page=\"seis-design\"");
  ensure(websiteRuntimeText.includes("agencyKit"), "website runtime must define agencyKit data");
  ensure(websiteRuntimeText.includes("collectAgencyBriefFields"), "website runtime must collect editable brief fields");
  ensure(websiteRuntimeText.includes("data-agency-field"), "website runtime must render editable brief fields");
  ensure(websiteRuntimeText.includes("## Client Template"), "website runtime must include client template section in generated pack");
  ensure(websiteRuntimeText.includes("## Client Discovery Intake Matrix"), "website runtime must include client discovery intake matrix section in generated pack");
  ensure(websiteRuntimeText.includes("not a client contract"), "website runtime must avoid client contract claims in generated pack");
  ensure(websiteRuntimeText.includes("## Brand Strategy Workshop Matrix"), "website runtime must include brand strategy workshop matrix section in generated pack");
  ensure(websiteRuntimeText.includes("not a business strategy guarantee"), "website runtime must avoid business strategy guarantee claims in generated pack");
  ensure(websiteRuntimeText.includes("## Landing Page Blueprint Matrix"), "website runtime must include landing page blueprint matrix section in generated pack");
  ensure(websiteRuntimeText.includes("not a conversion guarantee"), "website runtime must avoid conversion guarantee claims in generated pack");
  ensure(websiteRuntimeText.includes("## Proposal Scope Estimate"), "website runtime must include proposal scope estimate section in generated pack");
  ensure(websiteRuntimeText.includes("not a binding quote"), "website runtime must avoid binding quote claims in generated pack");
  ensure(websiteRuntimeText.includes("## Agency Quote Comparator"), "website runtime must include agency quote comparator section in generated pack");
  ensure(websiteRuntimeText.includes("not a guaranteed cost saving"), "website runtime must avoid guaranteed savings claims in generated pack");
  ensure(websiteRuntimeText.includes("## Agency Cost Control Matrix"), "website runtime must include agency cost control matrix section in generated pack");
  ensure(websiteRuntimeText.includes("not procurement advice"), "website runtime must avoid procurement advice claims in generated pack");
  ensure(websiteRuntimeText.includes("## Design Sprint Timeline Matrix"), "website runtime must include design sprint timeline matrix section in generated pack");
  ensure(websiteRuntimeText.includes("not a delivery date guarantee"), "website runtime must avoid delivery date guarantee claims in generated pack");
  ensure(websiteRuntimeText.includes("## Competitive Positioning Matrix"), "website runtime must include competitive positioning matrix section in generated pack");
  ensure(websiteRuntimeText.includes("not market research"), "website runtime must avoid market research claims in generated pack");
  ensure(websiteRuntimeText.includes("## Brand Voice & Messaging Matrix"), "website runtime must include brand voice messaging matrix section in generated pack");
  ensure(websiteRuntimeText.includes("not legal copy approval"), "website runtime must avoid legal copy approval claims in generated pack");
  ensure(websiteRuntimeText.includes("## Typography Pairing & Hierarchy Matrix"), "website runtime must include typography pairing hierarchy section in generated pack");
  ensure(websiteRuntimeText.includes("not a font license"), "website runtime must avoid font license claims in generated pack");
  ensure(websiteRuntimeText.includes("## Color System Accessibility Matrix"), "website runtime must include color system accessibility matrix section in generated pack");
  ensure(websiteRuntimeText.includes("not accessibility certification"), "website runtime must avoid accessibility certification claims in generated pack");
  ensure(websiteRuntimeText.includes("## Print Production Readiness Matrix"), "website runtime must include print production readiness matrix section in generated pack");
  ensure(websiteRuntimeText.includes("not print proof approval"), "website runtime must avoid print proof approval claims in generated pack");
  ensure(websiteRuntimeText.includes("## Social Content Calendar Matrix"), "website runtime must include social content calendar matrix section in generated pack");
  ensure(websiteRuntimeText.includes("not social media scheduling"), "website runtime must avoid social media scheduling claims in generated pack");
  ensure(websiteRuntimeText.includes("## Brand Rationale Deck"), "website runtime must include brand rationale deck section in generated pack");
  ensure(websiteRuntimeText.includes("not a persuasion guarantee"), "website runtime must avoid persuasion guarantee claims in generated pack");
  ensure(websiteRuntimeText.includes("## Visual Reference Moodboard"), "website runtime must include visual reference moodboard section in generated pack");
  ensure(websiteRuntimeText.includes("not licensed asset approval"), "website runtime must avoid licensed asset approval claims in generated pack");
  ensure(websiteRuntimeText.includes("## Creative Asset Shot List Matrix"), "website runtime must include creative asset shot list matrix section in generated pack");
  ensure(websiteRuntimeText.includes("not model release approval"), "website runtime must avoid model release approval claims in generated pack");
  ensure(websiteRuntimeText.includes("## Logo Concept Evaluation Matrix"), "website runtime must include logo concept evaluation matrix section in generated pack");
  ensure(websiteRuntimeText.includes("not final logo approval"), "website runtime must avoid final logo approval claims in generated pack");
  ensure(websiteRuntimeText.includes("## Brand Usage Guideline"), "website runtime must include brand usage guideline section in generated pack");
  ensure(websiteRuntimeText.includes("not a trademark license"), "website runtime must avoid trademark license claims in generated pack");
  ensure(websiteRuntimeText.includes("## Creative Director QA"), "website runtime must include creative director QA section in generated pack");
  ensure(websiteRuntimeText.includes("## Revision Plan"), "website runtime must include revision plan section in generated pack");
  ensure(websiteRuntimeText.includes("## Client Feedback Triage Board"), "website runtime must include client feedback triage board section in generated pack");
  ensure(websiteRuntimeText.includes("not a stakeholder consensus guarantee"), "website runtime must avoid stakeholder consensus guarantee claims in generated pack");
  ensure(websiteRuntimeText.includes("## Case Study Layout Board"), "website runtime must include case study layout section in generated pack");
  ensure(websiteRuntimeText.includes("not a verified customer case study"), "website runtime must avoid verified customer case study claims in generated pack");
  ensure(websiteRuntimeText.includes("## Visual QA Evidence Ledger"), "website runtime must include visual QA evidence ledger section in generated pack");
  ensure(websiteRuntimeText.includes("do not fabricate screenshot evidence"), "website runtime must avoid fabricated visual QA evidence claims in generated pack");
  ensure(websiteRuntimeText.includes("## Production File Manifest"), "website runtime must include production file manifest section in generated pack");
  ensure(websiteRuntimeText.includes("## Asset Size Spec Sheet"), "website runtime must include asset size spec sheet section in generated pack");
  ensure(websiteRuntimeText.includes("## Client Approval Packet"), "website runtime must include client approval packet section in generated pack");
  ensure(websiteRuntimeText.includes("## Client-Ready Export Index"), "website runtime must include client-ready export index section in generated pack");
  ensure(websiteRuntimeText.includes("not a downloadable archive"), "website runtime must avoid downloadable archive delivery claims in generated pack");
  ensure(websiteRuntimeText.includes("verify current platform or vendor specs"), "website runtime must avoid platform spec guarantee claims in generated pack");
  ensure(websiteRuntimeText.includes("not an endless revision loop"), "website runtime must avoid endless revision loop claims in generated pack");
  ensure(websiteRuntimeText.includes("## Agency Workboards"), "website runtime must include agency workboards in generated pack");
  ensure(websiteRuntimeText.includes("agencyKit.workboards"), "website runtime must render agency workboards from structured data");
  ensure(websiteRuntimeText.includes("data-agency-workboard"), "website runtime must render visible agency workboard cards");
  ensure(websiteRuntimeText.includes("agency-workboard-list"), "website runtime must expose the visible agency workboard list");
  ensure(websiteRuntimeText.includes("## Handoff"), "website runtime must include SEIS Code handoff section in generated pack");
  ensure(websiteRuntimeText.includes("formatAgencyPack"), "website runtime must format the agency pack");
  ensure(websiteRuntimeText.includes("createAgencyHandoffManifest"), "website runtime must create a handoff manifest");
  ensure(websiteRuntimeText.includes("saveAgencyPackToCodeWorkspace"), "website runtime must save the agency pack to the SEIS Code workspace");
  ensure(websiteRuntimeText.includes("localStorage.setItem(agencyHandoffKey"), "website runtime must persist the handoff manifest locally");
  ensure(websiteRuntimeText.includes("localStorage.setItem(agencyStorageKey"), "website runtime must persist agency pack locally");
  ensure(websiteRuntimeText.includes(kit.browserWorkflow?.storageKey), "website runtime must use the declared agency storage key");
  ensure(websiteRuntimeText.includes(kit.browserWorkflow?.handoffStorageKey), "website runtime must use the declared handoff storage key");
  ensure(websiteRuntimeText.includes(kit.browserWorkflow?.handoffPath), "website runtime must use the declared SEIS Code handoff path");
  ensure(websiteCssText.includes(".agency-kit-section"), "website CSS must style agency kit section");
  ensure(websiteCssText.includes(".agency-workflow-column"), "website CSS must style the visible agency workflow column");
  ensure(websiteCssText.includes(".agency-workboard-list"), "website CSS must style visible agency workboards");
  ensure(websiteCssText.includes(".agency-field-grid"), "website CSS must style agency kit editable fields");
  ensure(websiteCssText.includes("[data-export-agency-pack]"), "website CSS must style agency kit export action");
  ensure(websiteCssText.includes("[data-agency-pack-output]"), "website CSS must style agency pack output");
  ensure(browserSmokeText.includes("data-build-agency-pack"), "browser smoke must click the build agency pack control");
  ensure(browserSmokeText.includes("data-export-agency-pack"), "browser smoke must click the export agency pack control");
  ensure(browserSmokeText.includes("data-copy-agency-pack"), "browser smoke must click the copy agency pack control");
  ensure(browserSmokeText.includes(kit.browserWorkflow?.handoffStorageKey), "browser smoke must verify handoff storage key");
  ensure(browserSmokeText.includes(kit.browserWorkflow?.handoffPath), "browser smoke must verify SEIS Code handoff path");
  for (const workboardId of REQUIRED_WORKBOARD_IDS) {
    ensure(websiteRuntimeText.includes(workboardId), `website runtime missing workboard id: ${workboardId}`);
    ensure(browserSmokeText.includes(workboardId), `browser smoke missing workboard id: ${workboardId}`);
  }
  ensure(browserSmokeText.includes("smokeSeisCodeReview"), "browser smoke must include the cross-route SEIS Code review flow");
  ensure(browserSmokeText.includes("codeReviewStateExpression"), "browser smoke must inspect SEIS Code review state");
  ensure(browserSmokeText.includes(kit.browserWorkflow?.crossRouteSmoke?.reviewPath), "browser smoke must verify the declared review note path");
  ensure(browserSmokeText.includes(kit.browserWorkflow?.crossRouteSmoke?.screenshot), "browser smoke must capture the SEIS Code review screenshot");
  ensure(seisCodeHtmlText.includes(reviewSurface?.activityMarker || ""), "SEIS Code HTML must expose the Design Handoff activity marker");
  ensure(seisCodeHtmlText.includes(reviewSurface?.panelMarker || ""), "SEIS Code HTML must expose the Design Handoff panel marker");
  ensure(seisCodeRuntimeText.includes("renderDesignHandoff"), "SEIS Code runtime must render the Design Handoff review surface");
  ensure(seisCodeRuntimeText.includes("openDesignHandoff"), "SEIS Code runtime must open the exported agency pack");
  ensure(seisCodeRuntimeText.includes("createDesignReviewNote"), "SEIS Code runtime must create a review note from the agency pack");
  ensure(seisCodeRuntimeText.includes(kit.browserWorkflow?.handoffStorageKey), "SEIS Code runtime must read the declared handoff storage key");
  ensure(seisCodeRuntimeText.includes(kit.browserWorkflow?.handoffPath), "SEIS Code runtime must use the declared agency pack path");
  ensure(seisCodeRuntimeText.includes(reviewSurface?.reviewPath || ""), "SEIS Code runtime must use the declared review note path");
  ensure(seisCodeCssText.includes(".design-handoff-review"), "SEIS Code CSS must style the Design Handoff review surface");
  ensure(seisCodeCssText.includes(".handoff-preview"), "SEIS Code CSS must style the Design Handoff preview");
  ensure(browserSmokeText.includes("Independent studio operators"), "browser smoke must verify custom editable field values");
  ensure(browserSmokeText.includes("seis-design.html"), "browser smoke must open the SEIS Design website page");
}

if (docText) {
  const normalizedDoc = docText.toLowerCase();
  for (const phrase of REQUIRED_DOC_PHRASES) {
    ensure(normalizedDoc.includes(phrase), `doc must include phrase: ${phrase}`);
  }
  for (const deliverableId of REQUIRED_DELIVERABLE_IDS) {
    ensure(docText.includes(deliverableId), `doc must mention deliverable id: ${deliverableId}`);
  }
}

ensure(packageScripts.has("check:seis-design-agency-kit"), "package.json must expose check:seis-design-agency-kit");
ensure(packageScripts.has("check:seis-design-agency-kit-browser-smoke"), "package.json must expose check:seis-design-agency-kit-browser-smoke");

if (failures.length > 0) {
  console.error("SEIS design agency kit check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS design agency kit check passed.");
