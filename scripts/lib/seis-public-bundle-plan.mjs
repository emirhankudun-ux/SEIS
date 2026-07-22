/**
 * The public SEIS distribution has two deliberately different layers:
 *
 * - ten concise, usable marketplace plugins;
 * - thirty internal source packages, each capped at fifteen capabilities.
 *
 * The internal packages are implementation and selection units. They are not
 * extra marketplace cards, so a user never has to browse or install hundreds
 * of source modules.
 */

const DEFAULT_PACKAGE_SIZE = 15;

const INTERNAL_PACKAGE_FAMILIES = Object.freeze([
  family("ai-model-intelligence", "AI & Model Intelligence", "Artificial Intelligence", 3, ["AI"], ["Artificial Intelligence"]),
  family("automation-workflows", "Automation & Workflows", "Developer", 2, [], ["Automation"]),
  family("cloud-devops", "Cloud & DevOps", "Developer", 2, [], ["Cloud Computing"]),
  family("creative-production", "Creative Production", "Design", 2, [], ["Creative Production"]),
  family("security-assurance", "Security & Assurance", "Security", 3, ["Security"], ["Cybersecurity"]),
  family("data-knowledge", "Data & Knowledge", "Data", 2, ["Data"], ["Data"]),
  family("design-experience", "Design & Experience", "Design", 2, ["Design"], ["Design"]),
  family("eleni-visual", "Eleni-Neferi Visual Experience", "Design", 1, [], ["ELENI-NEFERI"]),
  family("graphics-rendering", "Graphics & Rendering", "Design", 1, [], ["Graphics"]),
  family("knowledge-research", "Knowledge & Research", "Research", 2, [], ["Knowledge"]),
  family("product-governance-delivery", "Product, Governance & Delivery", "Productivity", 2, ["Governance", "Observability", "Productivity"], ["Project Management"]),
  family("engineering-development", "Engineering & Development", "Developer", 6, ["Developer"], ["Software Engineering"]),
  family("platform-ecosystem", "Platform & Ecosystem", "Developer", 2, [], ["Desktop", "PANTECHNOEPISTEMONOESIS", "SEIS"]),
]);

const GENERAL_PLUGIN_PROFILES = Object.freeze([
  profile("ai-intelligence", "seis-ai-agent", "SEIS-Agent", "Developer", "The default SEIS AI, agent, model, context, retrieval, and routing experience.", [
    ref("ai-model-intelligence", 1),
    ref("ai-model-intelligence", 2),
    ref("ai-model-intelligence", 3),
  ], ["ai", "agents", "models", "routing", "context", "retrieval"]),
  profile("automation-delivery", "seis-general-automation-delivery", "SEIS Automation & Delivery", "Developer", "Automation, workflows, product planning, and delivery coordination without bulk installation.", [
    ref("automation-workflows", 1),
    ref("automation-workflows", 2),
    ref("product-governance-delivery", 1),
  ], ["automation", "workflows", "delivery", "product", "planning"]),
  profile("cloud-devsecops", "seis-general-cloud-devsecops", "SEIS Cloud & DevOps", "Developer", "Cloud, infrastructure, DevOps, reliability, and DevSecOps planning.", [
    ref("cloud-devops", 1),
    ref("cloud-devops", 2),
    ref("security-assurance", 1),
  ], ["cloud", "infrastructure", "devops", "devsecops", "reliability"]),
  profile("security-governance", "seis-general-security-governance", "SEIS Security & Governance", "Security", "Security, identity, compliance, governance, permissions, and risk review.", [
    ref("security-assurance", 2),
    ref("security-assurance", 3),
    ref("product-governance-delivery", 2),
  ], ["security", "identity", "compliance", "governance", "risk"]),
  profile("data-knowledge", "seis-general-data-knowledge", "SEIS Data & Knowledge", "Data", "Data architecture, analytics, search, memory, knowledge, and research workflows.", [
    ref("data-knowledge", 1),
    ref("data-knowledge", 2),
    ref("knowledge-research", 1),
  ], ["data", "analytics", "databases", "knowledge", "research"]),
  profile("design-creative", "seis-general-design-creative", "SEIS Design & Creative", "Design", "Design systems, UX, accessibility, creative production, and visual experience work.", [
    ref("design-experience", 1),
    ref("design-experience", 2),
    ref("creative-production", 1),
  ], ["design", "ux", "accessibility", "creative", "frontend"]),
  profile("eleni-visual", "seis-general-eleni-visual", "SEIS Eleni & Visual", "Design", "Eleni-Neferi, visual identity, graphics, rendering, media, and storytelling work.", [
    ref("eleni-visual", 1),
    ref("graphics-rendering", 1),
    ref("creative-production", 2),
  ], ["eleni-neferi", "graphics", "rendering", "media", "storytelling"]),
  profile("research-ecosystem", "seis-general-research-ecosystem", "SEIS Research & Ecosystem", "Research", "Research, platform strategy, desktop surfaces, SEIS, and Pantechnoesis ecosystem work.", [
    ref("knowledge-research", 2),
    ref("platform-ecosystem", 1),
    ref("platform-ecosystem", 2),
  ], ["research", "desktop", "seis", "pantechnoesis", "platform"]),
  profile("engineering-foundations", "seis-general-engineering-foundations", "SEIS Engineering Foundations", "Developer", "Frontend, client, architecture, systems, and core software engineering foundations.", [
    ref("engineering-development", 1),
    ref("engineering-development", 2),
    ref("engineering-development", 3),
  ], ["engineering", "development", "frontend", "architecture", "systems"]),
  profile("engineering-delivery", "seis-general-engineering-delivery", "SEIS Engineering Delivery", "Developer", "Backend, testing, build, release, developer tooling, and repository delivery work.", [
    ref("engineering-development", 4),
    ref("engineering-development", 5),
    ref("engineering-development", 6),
  ], ["engineering", "development", "backend", "testing", "release", "devtools"]),
]);

export const SEIS_PUBLIC_BUNDLE_SIZE = DEFAULT_PACKAGE_SIZE;
export const SEIS_INTERNAL_PACKAGE_TARGET = 30;
export const SEIS_GENERAL_PLUGIN_TARGET = 10;
export const SEIS_PUBLIC_MARKETPLACE_CARD_COUNT = 10;
export const SEIS_PUBLIC_MARKETPLACE_MIN_CARD_COUNT = SEIS_PUBLIC_MARKETPLACE_CARD_COUNT;
export const SEIS_PUBLIC_MARKETPLACE_MAX_CARD_COUNT = SEIS_PUBLIC_MARKETPLACE_CARD_COUNT;
export const SEIS_APPLICATION_BUNDLE_PREFIX = "seis-internal";
export const SEIS_TOPIC_BUNDLE_PREFIX = "seis-internal";
export const SEIS_PUBLIC_BUNDLE_ROOT = "plugins/seis-bundles";
export const SEIS_GENERAL_PLUGIN_ROOT = "plugins/seis-general";

export function buildSeisPublicBundlePlan({ applicationPlugins, topicPlugins, bundleSize = DEFAULT_PACKAGE_SIZE }) {
  assertPositiveInteger(bundleSize, "package size");
  const applicationMembers = normalizeMembers(applicationPlugins, "application");
  const topicMembers = normalizeMembers(topicPlugins, "topic");
  const members = [...applicationMembers, ...topicMembers];
  const packages = [];
  const assignedNames = new Set();
  const assignedPaths = new Set();

  for (const definition of INTERNAL_PACKAGE_FAMILIES) {
    const familyMembers = members.filter((member) => matchesFamily(member, definition));
    if (familyMembers.length === 0) {
      throw new Error("SEIS public package plan: internal family " + definition.id + " has no source members");
    }
    if (familyMembers.length > definition.packageCount * bundleSize) {
      throw new Error("SEIS public package plan: internal family " + definition.id + " exceeds its bounded package capacity");
    }
    const chunks = balancedChunks(familyMembers, definition.packageCount);
    chunks.forEach((chunk, index) => {
      const part = index + 1;
      const id = "seis-internal-" + definition.id + "-" + String(part).padStart(2, "0");
      for (const member of chunk) {
        if (assignedNames.has(member.name) || assignedPaths.has(member.sourcePath)) {
          throw new Error("SEIS public package plan: source member is assigned more than once: " + member.name);
        }
        assignedNames.add(member.name);
        assignedPaths.add(member.sourcePath);
      }
      packages.push({
        id,
        name: id,
        family: "internal",
        familyId: definition.id,
        familyLabel: definition.label,
        journeyId: definition.id,
        journeyLabel: definition.label,
        journeyPart: part,
        journeyPartCount: definition.packageCount,
        displayName: "SEIS Package: " + definition.label + (definition.packageCount > 1 ? " " + String(part).padStart(2, "0") + " of " + String(definition.packageCount).padStart(2, "0") : ""),
        shortDescription: String(chunk.length) + " retained " + definition.label + " source capabilities.",
        longDescription: definition.label + " is an internal, read-only SEIS capability package with " + String(chunk.length) + " retained source capabilities. It is selected through a general SEIS plugin and is never an extra marketplace card or automatic install target.",
        category: definition.category,
        categoryLabels: [...new Set(chunk.map((member) => member.category))],
        sourcePath: "./" + SEIS_PUBLIC_BUNDLE_ROOT + "/" + id,
        memberCount: chunk.length,
        members: chunk,
      });
    });
  }

  if (packages.length !== SEIS_INTERNAL_PACKAGE_TARGET) {
    throw new Error("SEIS public package plan: expected " + String(SEIS_INTERNAL_PACKAGE_TARGET) + " internal packages; received " + String(packages.length));
  }
  if (assignedNames.size !== members.length || assignedPaths.size !== members.length) {
    throw new Error("SEIS public package plan: application and topic source coverage is not exact-once");
  }
  if (packages.some((candidate) => candidate.memberCount < 1 || candidate.memberCount > bundleSize)) {
    throw new Error("SEIS public package plan: an internal package violates the configured member cap");
  }

  const packagesByReference = new Map(packages.map((candidate) => [candidate.familyId + ":" + String(candidate.journeyPart), candidate]));
  const generalPlugins = GENERAL_PLUGIN_PROFILES.map((definition) => {
    const internalPackages = definition.packageRefs.map((reference) => {
      const candidate = packagesByReference.get(reference.familyId + ":" + String(reference.part));
      if (!candidate) {
        throw new Error("SEIS public package plan: general plugin " + definition.id + " refers to an unknown internal package");
      }
      return candidate;
    });
    return {
      id: definition.id,
      name: definition.pluginName,
      displayName: definition.displayName,
      category: definition.category,
      sourcePath: definition.pluginName === "seis-ai-agent"
        ? "./plugins/seis-ai-agent"
        : "./" + SEIS_GENERAL_PLUGIN_ROOT + "/" + definition.pluginName,
      canonical: definition.pluginName === "seis-ai-agent",
      status: "release-ready-not-published",
      shortDescription: definition.summary,
      longDescription: definition.summary + " It exposes exactly three bounded internal packages, never their member modules as separate marketplace cards.",
      keywords: definition.keywords,
      internalPackageIds: internalPackages.map((candidate) => candidate.id),
      internalPackageCount: internalPackages.length,
    };
  });

  const generalPackageIds = generalPlugins.flatMap((plugin) => plugin.internalPackageIds);
  if (
    generalPlugins.length !== SEIS_GENERAL_PLUGIN_TARGET
    || generalPackageIds.length !== packages.length
    || new Set(generalPackageIds).size !== packages.length
    || packages.some((candidate) => !generalPackageIds.includes(candidate.id))
    || generalPlugins.some((plugin) => plugin.internalPackageCount !== 3)
  ) {
    throw new Error("SEIS public package plan: ten general plugin profiles must partition the thirty internal packages three-at-a-time");
  }

  return {
    bundleSize,
    maximumBundleSize: bundleSize,
    internalPackages: packages,
    bundles: packages,
    generalPlugins,
    applicationBundles: packages.filter((candidate) => candidate.members.some((member) => member.origin === "application")),
    topicBundles: packages.filter((candidate) => candidate.members.some((member) => member.origin === "topic")),
    applicationBundleCount: packages.filter((candidate) => candidate.members.some((member) => member.origin === "application")).length,
    topicBundleCount: packages.filter((candidate) => candidate.members.some((member) => member.origin === "topic")).length,
    publicBundleCardCount: 0,
    internalPackageCount: packages.length,
    generalPluginCount: generalPlugins.length,
    targetMarketplaceCardCount: generalPlugins.length,
  };
}

export function buildSeisPublicApplicationBundles({ applicationPlugins, bundleSize = DEFAULT_PACKAGE_SIZE }) {
  return buildSeisPublicBundlePlan({ applicationPlugins, topicPlugins: [], bundleSize }).internalPackages;
}

export function buildSeisPublicTopicBundles({ applicationPlugins = [], topicPlugins, bundleSize = DEFAULT_PACKAGE_SIZE }) {
  return buildSeisPublicBundlePlan({ applicationPlugins, topicPlugins, bundleSize }).internalPackages;
}

function family(id, label, category, packageCount, applicationCategories, topicCategories) {
  return Object.freeze({
    id,
    label,
    category,
    packageCount,
    applicationCategories: Object.freeze(applicationCategories),
    topicCategories: Object.freeze(topicCategories),
  });
}

function profile(id, pluginName, displayName, category, summary, packageRefs, keywords) {
  return Object.freeze({
    id,
    pluginName,
    displayName,
    category,
    summary,
    packageRefs: Object.freeze(packageRefs),
    keywords: Object.freeze(keywords),
  });
}

function ref(familyId, part) {
  return Object.freeze({ familyId, part });
}

function matchesFamily(member, definition) {
  return (member.origin === "application" && definition.applicationCategories.includes(member.category))
    || (member.origin === "topic" && definition.topicCategories.includes(member.category));
}

function normalizeMembers(plugins, origin) {
  if (!Array.isArray(plugins)) {
    throw new Error("SEIS public package plan: " + origin + " plugins must be an array");
  }
  const names = new Set();
  const paths = new Set();
  return [...plugins]
    .map((plugin) => {
      const name = String(plugin && plugin.name || "").trim().toLowerCase();
      const sourcePath = String(plugin && plugin.sourcePath || "").trim();
      const category = cleanLabel(plugin && plugin.category);
      if (!/^[a-z0-9][a-z0-9-]{0,127}$/.test(name)) {
        throw new Error("SEIS public package plan: invalid " + origin + " plugin name");
      }
      if (!sourcePath.startsWith("./plugins/") || sourcePath.includes("..")) {
        throw new Error("SEIS public package plan: invalid " + origin + " source path for " + name);
      }
      if (!category) {
        throw new Error("SEIS public package plan: missing " + origin + " category for " + name);
      }
      if (names.has(name) || paths.has(sourcePath)) {
        throw new Error("SEIS public package plan: duplicate " + origin + " source member: " + name);
      }
      names.add(name);
      paths.add(sourcePath);
      return {
        name,
        displayName: cleanLabel(plugin && plugin.displayName) || name,
        sourcePath,
        category,
        origin,
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}

function balancedChunks(members, chunkCount) {
  if (!Number.isInteger(chunkCount) || chunkCount < 1 || members.length < chunkCount) {
    throw new Error("SEIS public package plan: family cannot be split into the requested package count");
  }
  const baseSize = Math.floor(members.length / chunkCount);
  const largerChunkCount = members.length % chunkCount;
  const chunks = [];
  let cursor = 0;
  for (let index = 0; index < chunkCount; index += 1) {
    const size = baseSize + (index < largerChunkCount ? 1 : 0);
    chunks.push(members.slice(cursor, cursor + size));
    cursor += size;
  }
  return chunks;
}

function cleanLabel(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function assertPositiveInteger(value, label) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error("SEIS public package plan: " + label + " must be a positive integer");
  }
}
