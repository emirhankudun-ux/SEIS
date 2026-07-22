const DEFAULT_BUNDLE_SIZE = 15;

const APPLICATION_JOURNEYS = Object.freeze([
  Object.freeze({ id: "ai-data", label: "AI and Data", categories: Object.freeze(["AI", "Data"]) }),
  Object.freeze({
    id: "product-design-operations",
    label: "Product Design and Operations",
    categories: Object.freeze(["Design", "Productivity", "Governance", "Observability"]),
  }),
  Object.freeze({ id: "security", label: "Security", categories: Object.freeze(["Security"]) }),
  Object.freeze({ id: "developer-engineering", label: "Developer Engineering", categories: Object.freeze(["Developer"]) }),
]);

const TOPIC_JOURNEYS = Object.freeze([
  "Artificial Intelligence",
  "Automation",
  "Cloud Computing",
  "Creative Production",
  "Cybersecurity",
  "Data",
  "Design",
  "Desktop",
  "ELENI-NEFERI",
  "Graphics",
  "Knowledge",
  "PANTECHNOEPISTEMONOESIS",
  "Project Management",
  "SEIS",
  "Software Engineering",
].map((category) => Object.freeze({
  id: normalizeToken(category),
  label: category,
  categories: Object.freeze([category]),
})));

export const SEIS_PUBLIC_BUNDLE_SIZE = DEFAULT_BUNDLE_SIZE;
export const SEIS_PUBLIC_MARKETPLACE_MIN_CARD_COUNT = 30;
export const SEIS_PUBLIC_MARKETPLACE_MAX_CARD_COUNT = 50;
export const SEIS_APPLICATION_BUNDLE_PREFIX = "seis-application-bundle";
export const SEIS_TOPIC_BUNDLE_PREFIX = "seis-topic-bundle";
export const SEIS_PUBLIC_BUNDLE_ROOT = "plugins/seis-bundles";

export function buildSeisPublicBundlePlan({ applicationPlugins, topicPlugins, bundleSize = DEFAULT_BUNDLE_SIZE }) {
  assertPositiveInteger(bundleSize, "bundle size");

  const applicationBundles = buildSeisPublicApplicationBundles({ applicationPlugins, bundleSize });
  const topicBundles = buildSeisPublicTopicBundles({ topicPlugins, bundleSize });
  const bundles = [...applicationBundles, ...topicBundles];
  const allMembers = bundles.flatMap((bundle) => bundle.members);
  const allNames = allMembers.map((member) => member.name);
  const allPaths = allMembers.map((member) => member.sourcePath);
  const sourceCount = applicationPlugins.length + topicPlugins.length;
  if (allMembers.length !== sourceCount || new Set(allNames).size !== sourceCount || new Set(allPaths).size !== sourceCount) {
    throw new Error("SEIS public bundle plan: combined application and topic source coverage is not exact-once");
  }
  const targetMarketplaceCardCount = 1 + bundles.length;

  if (targetMarketplaceCardCount < SEIS_PUBLIC_MARKETPLACE_MIN_CARD_COUNT
      || targetMarketplaceCardCount > SEIS_PUBLIC_MARKETPLACE_MAX_CARD_COUNT) {
    throw new Error(
      `SEIS public bundle plan: marketplace card count ${targetMarketplaceCardCount} is outside the reviewed ${SEIS_PUBLIC_MARKETPLACE_MIN_CARD_COUNT}-${SEIS_PUBLIC_MARKETPLACE_MAX_CARD_COUNT} range`,
    );
  }

  return {
    bundleSize,
    maximumBundleSize: bundleSize,
    applicationBundles,
    topicBundles,
    bundles,
    applicationBundleCount: applicationBundles.length,
    topicBundleCount: topicBundles.length,
    publicBundleCardCount: bundles.length,
    targetMarketplaceCardCount,
  };
}

export function buildSeisPublicApplicationBundles({ applicationPlugins, bundleSize = DEFAULT_BUNDLE_SIZE }) {
  return buildBundleFamily({
    family: "application",
    plugins: applicationPlugins,
    prefix: SEIS_APPLICATION_BUNDLE_PREFIX,
    bundleSize,
    fallbackCategory: "Developer",
    journeys: APPLICATION_JOURNEYS,
  });
}

export function buildSeisPublicTopicBundles({ topicPlugins, bundleSize = DEFAULT_BUNDLE_SIZE }) {
  return buildBundleFamily({
    family: "topic",
    plugins: topicPlugins,
    prefix: SEIS_TOPIC_BUNDLE_PREFIX,
    bundleSize,
    fallbackCategory: "Knowledge",
    journeys: TOPIC_JOURNEYS,
  });
}

export function buildBundleFamily({ family, plugins, prefix, bundleSize = DEFAULT_BUNDLE_SIZE, fallbackCategory, journeys }) {
  if (family !== "application" && family !== "topic") {
    throw new Error(`SEIS public bundle plan: unsupported bundle family: ${family}`);
  }
  assertPositiveInteger(bundleSize, "bundle size");
  const members = normalizeMembers(plugins, family, fallbackCategory);
  if (members.length === 0) {
    throw new Error(`SEIS public bundle plan: ${family} source inventory is empty`);
  }

  const normalizedJourneys = normalizeJourneys(journeys, family);
  const knownCategories = new Set(normalizedJourneys.flatMap((journey) => journey.categories));
  const uncoveredCategories = [...new Set(members.map((member) => member.category))]
    .filter((category) => !knownCategories.has(category));
  if (uncoveredCategories.length > 0) {
    throw new Error(`SEIS public bundle plan: unassigned ${family} categories: ${uncoveredCategories.join(", ")}`);
  }

  const grouped = normalizedJourneys.flatMap((journey) => {
    const journeyMembers = members.filter((member) => journey.categories.includes(member.category));
    if (journeyMembers.length === 0) {
      throw new Error(`SEIS public bundle plan: ${family} journey ${journey.id} has no members`);
    }
    const chunks = balancedChunks(journeyMembers, bundleSize);
    return chunks.map((bundleMembers, index) => ({
      journey,
      bundleMembers,
      part: index + 1,
      partCount: chunks.length,
    }));
  });

  const coveredNames = grouped.flatMap((group) => group.bundleMembers.map((member) => member.name));
  if (coveredNames.length !== members.length || new Set(coveredNames).size !== members.length) {
    throw new Error(`SEIS public bundle plan: ${family} source coverage is not exact-once`);
  }

  return grouped.map(({ journey, bundleMembers, part, partCount }, index) => {
    const id = `${prefix}-${String(index + 1).padStart(2, "0")}`;
    const categories = [...new Set(bundleMembers.map((member) => member.category))];
    const partLabel = partCount > 1 ? ` ${String(part).padStart(2, "0")} of ${String(partCount).padStart(2, "0")}` : "";
    const familyLabel = family === "application" ? "Application" : "Topic";
    return {
      id,
      name: id,
      family,
      journeyId: journey.id,
      journeyLabel: journey.label,
      journeyPart: part,
      journeyPartCount: partCount,
      displayName: `SEIS ${familyLabel}: ${journey.label}${partLabel}`,
      shortDescription: `${bundleMembers.length} ${journey.label} source capabilities.`,
      longDescription: `${journey.label} ${family} selection bundle with ${bundleMembers.length} retained SEIS source capabilities. It provides local, read-only member discovery and planning; it does not bulk-install members or grant external access.`,
      category: categories.length === 1 ? categories[0] : fallbackCategory,
      categoryLabels: categories,
      sourcePath: `./${SEIS_PUBLIC_BUNDLE_ROOT}/${id}`,
      memberCount: bundleMembers.length,
      members: bundleMembers,
    };
  });
}

function normalizeMembers(plugins, family, fallbackCategory) {
  if (!Array.isArray(plugins)) {
    throw new Error(`SEIS public bundle plan: ${family} plugins must be an array`);
  }

  const seenNames = new Set();
  const seenPaths = new Set();
  return [...plugins]
    .map((plugin) => {
      const name = String(plugin?.name || "").trim().toLowerCase();
      const sourcePath = String(plugin?.sourcePath || "").trim();
      if (!/^[a-z0-9][a-z0-9-]{0,127}$/.test(name)) {
        throw new Error(`SEIS public bundle plan: invalid ${family} plugin name`);
      }
      if (!sourcePath.startsWith("./plugins/") || sourcePath.includes("..")) {
        throw new Error(`SEIS public bundle plan: invalid ${family} source path for ${name}`);
      }
      if (seenNames.has(name)) {
        throw new Error(`SEIS public bundle plan: duplicate ${family} plugin name: ${name}`);
      }
      if (seenPaths.has(sourcePath)) {
        throw new Error(`SEIS public bundle plan: duplicate ${family} plugin source path: ${sourcePath}`);
      }
      seenNames.add(name);
      seenPaths.add(sourcePath);
      const category = cleanLabel(plugin?.category) || fallbackCategory;
      const displayName = cleanLabel(plugin?.displayName) || name;
      return { name, displayName, sourcePath, category };
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}

function normalizeJourneys(journeys, family) {
  if (!Array.isArray(journeys) || journeys.length === 0) {
    throw new Error(`SEIS public bundle plan: ${family} journeys must be a non-empty array`);
  }
  const seenIds = new Set();
  const seenCategories = new Set();
  return journeys.map((journey) => {
    const id = normalizeToken(journey?.id);
    const label = cleanLabel(journey?.label);
    const categories = Array.isArray(journey?.categories) ? journey.categories.map(cleanLabel).filter(Boolean) : [];
    if (!id || !label || categories.length === 0 || seenIds.has(id)) {
      throw new Error(`SEIS public bundle plan: invalid ${family} journey`);
    }
    for (const category of categories) {
      if (seenCategories.has(category)) {
        throw new Error(`SEIS public bundle plan: category ${category} belongs to multiple ${family} journeys`);
      }
      seenCategories.add(category);
    }
    seenIds.add(id);
    return { id, label, categories };
  });
}

function balancedChunks(members, maximumSize) {
  const chunkCount = Math.ceil(members.length / maximumSize);
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

function normalizeToken(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function assertPositiveInteger(value, label) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`SEIS public bundle plan: ${label} must be a positive integer`);
  }
}
