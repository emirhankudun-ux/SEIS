import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const contractPath = path.join(repoRoot, 'content/development/seis-programming-language-purpose-matrix.json');
const pagePath = path.join(repoRoot, 'apps/web/language-matrix.html');
const docsPath = path.join(repoRoot, 'docs/architecture/seis-programming-language-purpose-matrix.md');

const requiredPurposeGroups = [
  'web-sites-and-product-ui',
  'desktop-applications',
  'operating-systems-and-system-ux',
  'mobile-applications',
  'game-3d-and-interactive-worlds',
  'ai-ml-and-data-science',
  'backend-api-and-enterprise-services',
  'devops-cloud-and-automation',
  'security-and-governance',
];

const requiredRoutes = [
  'apps/web',
  'scripts',
  'server/node',
  'docs/architecture',
  'future/apple-first',
  'future/backend-java',
  'future/ai-data',
  'future/system-lab',
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertString(value, field) {
  assert(typeof value === 'string' && value.trim().length > 0, `${field} must be a non-empty string`);
}

function assertStringArray(value, field) {
  assert(Array.isArray(value), `${field} must be an array`);
  assert(value.length > 0, `${field} must not be empty`);
  value.forEach((item, index) => assertString(item, `${field}[${index}]`));
}

async function readText(filePath) {
  await access(filePath);
  return readFile(filePath, 'utf8');
}

const contractText = await readText(contractPath);
const contract = JSON.parse(contractText);

assert(contract.schemaVersion === 1, 'schemaVersion must be 1');
assert(contract.id === 'seis-programming-language-purpose-matrix', 'id mismatch');
assert(contract.status === 'reference-intake-ready-for-local-demo', 'unexpected status');
assertString(contract.sourceBoundary, 'sourceBoundary');
assert(contract.sourceBoundary.includes('not treated as live market statistics'), 'sourceBoundary must prevent live-stat claims');
assertString(contract.goal, 'goal');
assertStringArray(contract.priorityModel, 'priorityModel');

assert(contract.currentCore && typeof contract.currentCore === 'object', 'currentCore must exist');
assertStringArray(contract.currentCore.webDemo, 'currentCore.webDemo');
assertStringArray(contract.currentCore.repoAutomation, 'currentCore.repoAutomation');
assertStringArray(contract.currentCore.contractsAndDocs, 'currentCore.contractsAndDocs');
assertStringArray(contract.currentCore.dataAndStoragePlanning, 'currentCore.dataAndStoragePlanning');
assertStringArray(contract.currentCore.futureNativePriority, 'currentCore.futureNativePriority');

assert(contract.currentCore.webDemo.includes('JavaScript'), 'webDemo must include JavaScript');
assert(contract.currentCore.repoAutomation.includes('Python'), 'repoAutomation must include Python');
assert(contract.currentCore.dataAndStoragePlanning.includes('SQL'), 'dataAndStoragePlanning must include SQL');
assert(contract.currentCore.futureNativePriority.includes('Swift'), 'futureNativePriority must include Swift');

assert(Array.isArray(contract.purposeGroups), 'purposeGroups must be an array');
const purposeIds = new Set(contract.purposeGroups.map((group) => group.id));
for (const requiredId of requiredPurposeGroups) {
  assert(purposeIds.has(requiredId), `missing purpose group: ${requiredId}`);
}

for (const group of contract.purposeGroups) {
  assertString(group.id, 'purposeGroup.id');
  assertString(group.label, `${group.id}.label`);
  assertStringArray(group.languages, `${group.id}.languages`);
  assertString(group.seisUse, `${group.id}.seisUse`);
  assertString(group.state, `${group.id}.state`);
  assertString(group.nextAction, `${group.id}.nextAction`);
}

assert(contract.referencePopularitySignals && typeof contract.referencePopularitySignals === 'object', 'referencePopularitySignals must exist');
for (const [snapshotId, snapshot] of Object.entries(contract.referencePopularitySignals)) {
  assertString(snapshot.note, `${snapshotId}.note`);
  assert(snapshot.note.includes('not live stats'), `${snapshotId}.note must mark values as not live stats`);
  assert(Array.isArray(snapshot.items) && snapshot.items.length > 0, `${snapshotId}.items must not be empty`);
  for (const item of snapshot.items) {
    assertString(item.language, `${snapshotId}.item.language`);
    assert(typeof item.value === 'number', `${snapshotId}.item.value must be numeric`);
  }
}

assert(Array.isArray(contract.seisLanguageRouting), 'seisLanguageRouting must be an array');
const routeIds = new Set(contract.seisLanguageRouting.map((route) => route.route));
for (const requiredRoute of requiredRoutes) {
  assert(routeIds.has(requiredRoute), `missing language route: ${requiredRoute}`);
}
for (const route of contract.seisLanguageRouting) {
  assertString(route.route, 'route.route');
  assertStringArray(route.priorityLanguages, `${route.route}.priorityLanguages`);
  assertString(route.reason, `${route.route}.reason`);
}

assert(Array.isArray(contract.implementationSlices), 'implementationSlices must be an array');
assert(contract.implementationSlices.length >= 4, 'implementationSlices must contain at least four slices');
for (const slice of contract.implementationSlices) {
  assertString(slice.id, 'slice.id');
  assertString(slice.title, `${slice.id}.title`);
  assertString(slice.deliverable, `${slice.id}.deliverable`);
  assert(typeof slice.safeNow === 'boolean', `${slice.id}.safeNow must be boolean`);
}

assertStringArray(contract.blockedWithoutApproval, 'blockedWithoutApproval');
for (const requiredBoundary of ['provider', 'database', 'SSH', 'deploying', 'dependencies']) {
  assert(
    contract.blockedWithoutApproval.some((item) => item.toLowerCase().includes(requiredBoundary.toLowerCase())),
    `blockedWithoutApproval must mention ${requiredBoundary}`,
  );
}

const pageText = await readText(pagePath);
assert(pageText.includes('SEIS Language Purpose Matrix'), 'language matrix page must include title');
assert(pageText.includes('Not every language belongs everywhere.'), 'language matrix page must include hero statement');
assert(pageText.includes('../content/development/seis-programming-language-purpose-matrix.json'), 'language matrix page must link JSON contract');
assert(pageText.includes('Provider, SSH, database, deployment stay gated'), 'language matrix page must render production gate boundary');

const docsText = await readText(docsPath);
assert(docsText.includes('# SEIS Programming Language Purpose Matrix'), 'docs page must include expected heading');
assert(docsText.includes('SEIS should be polyglot, but not chaotic.'), 'docs page must include core rule');
assert(docsText.includes('feat: add SEIS language purpose center'), 'docs page must include follow-up PR title');

console.log('SEIS programming language purpose matrix check passed.');
console.log(`Validated ${contract.purposeGroups.length} purpose groups, ${contract.seisLanguageRouting.length} routes, and ${contract.implementationSlices.length} slices.`);
