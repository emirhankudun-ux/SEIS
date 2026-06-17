import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentPath = path.join(root, "packages/content/src/data.json");
const decisionQuestionsPath = path.join(root, "packages/content/src/decision-questions.json");
const content = JSON.parse(fs.readFileSync(contentPath, "utf8"));
const decisionQuestions = JSON.parse(fs.readFileSync(decisionQuestionsPath, "utf8"));
const requiredLocales = ["tr", "en", "fr", "it", "de"];
const requiredDictionaryKeys = [
  "behanceTitle",
  "behanceLead",
  "behanceOpen",
  "behanceVisualsTitle",
  "behanceVisualsLead",
  "qaTitle",
  "qaLead",
  "socialTitle",
  "navLab",
  "evolutionTitle",
  "evolutionLead",
  "qualityTitle",
  "qualityLead",
  "drawingFilterAll",
  "drawingFilterFeatured",
  "drawingFilterGraphite",
  "drawingFilterColor",
  "drawingArchiveLead",
  "portfolioIndexTitle",
  "portfolioIndexLead",
  "portfolioFilterAll",
  "portfolioFilterFeatured",
  "portfolioFilterBehance",
  "portfolioFilterDrawings",
  "portfolioFilterWork",
  "portfolioSearchLabel",
  "portfolioSearchPlaceholder",
  "primaryNavigationLabel",
  "languageSelectorLabel",
  "portfolioOpenItem",
  "portfolioIndexEmpty",
  "portfolioCollectionsTitle",
  "portfolioCollectionsLead",
  "portfolioCollectionsEyebrow",
  "portfolioCollectionProof",
  "portfolioCollectionOpen",
  "portfolioFlowEyebrow",
  "portfolioFlowTitle",
  "portfolioFlowLead",
  "portfolioFlowBehanceLead",
  "portfolioFlowDrawingsLead",
  "portfolioFlowWorksLead",
  "portfolioFlowAction",
  "portfolioFlowBehanceAction",
  "portfolioFlowDrawingsAction",
  "portfolioFlowWorksAction",
  "portfolioMetricBehance",
  "portfolioMetricDrawings",
  "portfolioMetricWorks",
  "portfolioMetricCollections",
  "portfolioMetricEmbeds",
  "portfolioPageEyebrow",
  "portfolioPageTitle",
  "drawingPageTitle",
  "skipPortfolio",
  "servicesEyebrow",
  "studioEyebrow",
  "portfolioEyebrow",
  "behancePortfolioEyebrow",
  "drawingArchiveEyebrow",
  "contactEyebrow",
  "contactDirectEyebrow",
  "behanceVisualsEyebrow",
  "behanceEmbedEyebrow",
  "portfolioIndexEyebrow",
  "evolutionEyebrow",
  "qualityEyebrow",
  "projectDetailOpen",
  "studioRailLabel",
  "portfolioMotionGalleryLabel",
  "portfolioDrawingHighlightsLabel",
  "featuredDrawingsLabel",
  "portfolioIndexFiltersLabel",
  "portfolioSourceDrawing",
  "portfolioSourceWork",
  "copyEmbed",
  "copied",
  "copyFailed",
  "externalLinkLabel",
  "qaEyebrow",
  "briefScopePlaceholder",
  "briefTimelinePlaceholder",
  "briefBudgetPlaceholder",
  "briefPriorityCalm",
  "briefPriorityNear",
  "briefPriorityUrgent",
  "skipContent",
  "projectDetailSkip",
  "projectNavigationLabel",
  "projectDetailEyebrow",
  "detailSignalTitle",
  "detailImpactTitle",
  "detailExecutionTitle",
  "detailExecutionLead",
  "startBrief",
  "languagesTitle",
  "languagesLead",
  "deployTitle",
  "deployLead"
];
const validLanguageStatuses = new Set(["active", "planned"]);
const validEvolutionStatuses = new Set(["live", "next", "planned"]);
const validDrawingCategories = new Set(["graphite", "color"]);

const errors = [];

for (const locale of requiredLocales) {
  if (!content.locales.includes(locale)) {
    errors.push(`Missing locale: ${locale}`);
  }
  if (!content.dictionary[locale]) {
    errors.push(`Missing dictionary: ${locale}`);
    continue;
  }
  for (const key of requiredDictionaryKeys) {
    if (!content.dictionary[locale][key]) {
      errors.push(`Missing dictionary key ${locale}.${key}`);
    }
  }
}

for (const drawing of content.drawings) {
  const rel = drawing.src.replace(/^\//, "");
  const nextAsset = path.join(root, "apps/site-next/public", rel);
  const viteAsset = path.join(root, "apps/site-vite/public", rel);
  if (!fs.existsSync(nextAsset)) errors.push(`Missing Next drawing asset: ${drawing.src}`);
  if (!fs.existsSync(viteAsset)) errors.push(`Missing Vite drawing asset: ${drawing.src}`);
  if (!validDrawingCategories.has(drawing.category)) {
    errors.push(`${drawing.id}: invalid drawing category ${drawing.category}`);
  }
  if (!drawing.archiveRole || typeof drawing.sortIndex !== "number") {
    errors.push(`${drawing.id}: drawing archiveRole and sortIndex are required.`);
  }
}

if (content.works.length < 3) errors.push("Expected at least 3 works.");
if (content.services.length < 3) errors.push("Expected at least 3 services.");
if (!content.site.email.includes("@")) errors.push("Invalid contact email.");

if (!Array.isArray(content.behanceEmbeds) || content.behanceEmbeds.length < 3) {
  errors.push("Expected at least 3 Behance embed records.");
}

if (!Array.isArray(content.behanceVisuals) || content.behanceVisuals.length < 6) {
  errors.push("Expected at least 6 Behance visual records.");
}

for (const visual of content.behanceVisuals || []) {
  if (!visual.id || !visual.projectId || !visual.title || !visual.category || !visual.image || !visual.href || !visual.embedUrl || !visual.embedCode) {
    errors.push("Behance visual item is missing required fields.");
  }
  if (!visual.href.startsWith("https://www.behance.net/")) {
    errors.push(`${visual.id}: Behance visual href must stay on behance.net.`);
  }
  if (!visual.embedUrl.startsWith(`https://www.behance.net/embed/project/${visual.projectId}`)) {
    errors.push(`${visual.id}: Behance visual embedUrl must use the official project embed route.`);
  }
  if (!visual.embedCode.includes(visual.embedUrl) || !visual.embedCode.includes("<iframe")) {
    errors.push(`${visual.id}: Behance visual embedCode must include its iframe embedUrl.`);
  }
  if (!visual.image.startsWith("https://mir-s3-cdn-cf.behance.net/")) {
    errors.push(`${visual.id}: Behance visual image must use the Behance CDN.`);
  }
}

for (const embed of content.behanceEmbeds || []) {
  if (!embed.id || !embed.projectId || !embed.title || !embed.url || !embed.embedUrl || !embed.category || !embed.embedCode) {
    errors.push("Behance embed is missing required fields.");
  }
  if (!embed.url.startsWith("https://www.behance.net/")) {
    errors.push(`${embed.id}: Behance URL must stay on behance.net.`);
  }
  if (!embed.embedUrl.startsWith(`https://www.behance.net/embed/project/${embed.projectId}`)) {
    errors.push(`${embed.id}: embedUrl must use the official Behance project embed route.`);
  }
  if (!embed.embedCode.includes(embed.embedUrl) || !embed.embedCode.includes("<iframe")) {
    errors.push(`${embed.id}: embedCode must include the Behance iframe embedUrl.`);
  }
}

if (!Array.isArray(content.portfolioCollections) || content.portfolioCollections.length < 4) {
  errors.push("Expected at least 4 portfolio collection records.");
}

for (const collection of content.portfolioCollections || []) {
  if (!collection.id || !collection.title || !collection.summary || !collection.tone || !collection.href) {
    errors.push("Portfolio collection is missing required fields.");
  }
  if (!Array.isArray(collection.images) || collection.images.length < 3) {
    errors.push(`${collection.id}: portfolio collection needs at least 3 images.`);
  }
  for (const image of collection.images || []) {
    const isLocalDrawing = image.startsWith("/drawings/");
    const isBehanceImage = image.startsWith("https://mir-s3-cdn-cf.behance.net/");
    if (!isLocalDrawing && !isBehanceImage) {
      errors.push(`${collection.id}: invalid collection image ${image}`);
    }
  }
  if (!Array.isArray(collection.proof) || collection.proof.length < 3) {
    errors.push(`${collection.id}: portfolio collection needs at least 3 proof items.`);
  }
  if (!["gold", "teal", "ivory"].includes(collection.accent)) {
    errors.push(`${collection.id}: invalid portfolio collection accent ${collection.accent}`);
  }
}

if (!Array.isArray(content.socialLinks) || content.socialLinks.length < 4) {
  errors.push("Expected at least 4 social links.");
}

if (!Array.isArray(content.contactQa) || content.contactQa.length < 4) {
  errors.push("Expected at least 4 contact Q&A records.");
}

if (!Array.isArray(content.evolutionTracks) || content.evolutionTracks.length < 4) {
  errors.push("Expected at least 4 evolution track records.");
}

for (const track of content.evolutionTracks || []) {
  if (!track.id || !track.title || !track.timeframe || !track.summary || !Array.isArray(track.focus)) {
    errors.push("Evolution track is missing required fields.");
  }
  if (!validEvolutionStatuses.has(track.status)) {
    errors.push(`${track.id}: invalid evolution status ${track.status}`);
  }
  if ((track.focus || []).length < 2) {
    errors.push(`${track.id}: expected at least 2 focus items.`);
  }
}

if (!Array.isArray(content.qualityStandards) || content.qualityStandards.length < 4) {
  errors.push("Expected at least 4 quality standard records.");
}

for (const standard of content.qualityStandards || []) {
  if (!standard.id || !standard.title || !standard.metric || !standard.summary) {
    errors.push("Quality standard is missing required fields.");
  }
}

if (!Array.isArray(content.softwareLanguages) || content.softwareLanguages.length < 8) {
  errors.push("Expected at least 8 software language records.");
}

for (const language of content.softwareLanguages || []) {
  if (!language.id || !language.name || !language.layer || !language.role) {
    errors.push("Software language item is missing required fields.");
  }
  if (!validLanguageStatuses.has(language.status)) {
    errors.push(`${language.id}: invalid software language status ${language.status}`);
  }
}

const decisionQuestionCount = decisionQuestions.reduce((total, group) => total + group.questions.length, 0);
if (decisionQuestionCount !== 100) {
  errors.push(`Expected exactly 100 decision questions, found ${decisionQuestionCount}.`);
}

for (const group of decisionQuestions) {
  if (!group.id || !group.title || !Array.isArray(group.questions) || group.questions.length !== 10) {
    errors.push(`${group.id || "unknown"}: decision question group must have 10 questions.`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Content check passed: ${content.locales.length} locales, ${content.works.length} works, ${content.drawings.length} drawings, ${content.behanceVisuals.length} Behance visuals, ${content.behanceEmbeds.length} Behance embeds, ${content.portfolioCollections.length} portfolio collections, ${content.evolutionTracks.length} evolution tracks, ${content.qualityStandards.length} quality standards, ${content.softwareLanguages.length} software languages, ${decisionQuestionCount} decision questions.`);
