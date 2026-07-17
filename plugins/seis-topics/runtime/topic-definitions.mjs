import fs from "node:fs";
import path from "node:path";

export const TOPIC_OBJECTIVE_PATH = "content/development/seis-topic-plugin-objective.json";
export const TOPIC_PLUGIN_SOURCE_ROOT = "plugins/seis-topics";
export const TOPIC_PLUGIN_TARGET = 300;

export function readTopicObjective(root = process.cwd()) {
  const filePath = path.join(root, TOPIC_OBJECTIVE_PATH);
  if (!fs.existsSync(filePath)) {
    throw new Error(`SEIS topic objective is missing: ${TOPIC_OBJECTIVE_PATH}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function flattenTopicObjective(objective) {
  const topics = [];
  for (const group of objective?.groups || []) {
    const categoryId = slugify(group.id || group.displayName);
    topics.push(createTopic(group, {
      displayName: group.displayName,
      sourceText: group.displayName,
      order: 0,
      kind: "group-heading",
    }, categoryId, true));
    for (const item of group.topics || []) {
      const sourceText = typeof item === "string" ? item : item.sourceText || item.displayName;
      const displayName = typeof item === "string" ? item : item.displayName;
      topics.push(createTopic(group, {
        displayName,
        sourceText,
        order: item.order || topics.length,
        kind: item.directive ? "directive-normalized-topic" : "objective-topic",
        directive: item.directive === true,
      }, categoryId, false));
    }
  }
  return topics;
}

export function assertTopicObjective(objective, topics = flattenTopicObjective(objective)) {
  if (objective?.source?.groupCount !== objective?.groups?.length) {
    throw new Error("SEIS topic objective group count does not match its groups");
  }
  if (objective?.source?.sourceLineCount !== topics.length) {
    throw new Error(`SEIS topic objective must produce ${objective?.source?.sourceLineCount} records; found ${topics.length}`);
  }
  if (topics.length !== TOPIC_PLUGIN_TARGET) {
    throw new Error(`SEIS topic objective must produce ${TOPIC_PLUGIN_TARGET} records; found ${topics.length}`);
  }
  const ids = new Set();
  for (const topic of topics) {
    if (ids.has(topic.id)) throw new Error(`Duplicate SEIS topic plugin id: ${topic.id}`);
    ids.add(topic.id);
  }
  return true;
}

function createTopic(group, item, categoryId, groupHeading) {
  const topicId = groupHeading
    ? `seis-topic-${categoryId}`
    : `seis-topic-${categoryId}-${slugify(item.displayName)}`;
  return {
    id: topicId,
    displayName: item.displayName,
    sourceText: item.sourceText,
    category: group.displayName,
    categoryId,
    order: item.order,
    kind: item.kind,
    directive: item.directive === true,
    sourcePath: `./${TOPIC_PLUGIN_SOURCE_ROOT}/${topicId}`,
    status: "public-repository-preview",
    maturity: "prototype",
    license: "MIT",
    audience: "everyone",
    marketplace: "seis-repo",
    installId: `${topicId}@seis-repo`,
  };
}

export function slugify(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}
