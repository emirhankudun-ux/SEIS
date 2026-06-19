#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];

const files = {
  architecture: 'ARCHITECTURE.md',
  roadmap: 'ROADMAP.md',
  readme: 'README.md',
  changelog: 'CHANGELOG.md',
  vision: 'docs/governance/seis-supreme-vision.md',
  manifesto: 'docs/governance/seis-architecture-manifesto.md',
  governance: 'docs/governance/seis-god-mode-developer.md',
  runState: 'docs/governance/seis-god-mode-run-state.md',
  commandCenterReadme: 'apps/seis-core/README.md',
  commandCenterHtml: 'apps/seis-core/index.html',
  commandCenterJs: 'apps/seis-core/script.js',
  commandCenterCss: 'apps/seis-core/styles.css',
  commandCenterTest: 'apps/seis-core/test/seis-core-static.test.js',
  commandCenterRouterArtifact: 'apps/seis-core/data/seis-router-routes.json',
  appHtml: 'apps/seis-demo-web/index.html',
  appJs: 'apps/seis-demo-web/script.js',
  appCss: 'apps/seis-demo-web/styles.css',
  serviceWorker: 'apps/seis-demo-web/service-worker.js',
  webContract: 'apps/seis-demo-web/contracts/seis-demo-contract.json',
  nativeContract:
    'packages/seis_platform_swift/Sources/SeisAppleNativeShell/Resources/seis-demo-contract.json',
  learningContract: 'content/development/seis-god-mode-developer-contract.json',
  pluginManifest: 'plugins/seis/.codex-plugin/plugin.json',
  pluginReadme: 'plugins/seis/README.md',
  skill: 'plugins/seis/skills/seis-god-mode-developer/SKILL.md',
  agent: 'plugins/seis/skills/seis-god-mode-developer/agents/openai.yaml',
  packageJson: 'package.json',
};

for (const file of Object.values(files)) {
  read(file);
}

for (const [file, token] of [
  [files.architecture, '# SEIS Architecture'],
  [files.architecture, 'Agent Orchestration Layer'],
  [files.architecture, 'Cloud and Environment Layer'],
  [files.architecture, 'Security Layer'],
  [files.architecture, 'Data Flow'],
  [files.architecture, 'God Mode Operating Discipline'],
  [files.roadmap, 'God Mode Development Rule'],
  [files.readme, 'SEIS God Mode Developer'],
  [files.changelog, 'God Mode governance lane'],
  [files.vision, '## God Mode Developer'],
  [files.manifesto, '## God Mode Developer Rule'],
  [files.governance, '# SEIS God Mode Developer'],
  [files.governance, 'Two-layer minimum'],
  [files.governance, 'No secrets, tokens, private keys'],
  [files.governance, 'npm run check:seis-god-mode-developer'],
  [files.runState, '# SEIS God Mode Run State'],
  [files.runState, 'Dirty Tree Policy'],
  [files.runState, 'do not stage the entire tree'],
  [files.commandCenterReadme, '10-lane SEIS router'],
  [files.commandCenterHtml, '10-Lane SEIS Router'],
  [files.commandCenterHtml, 'seis-router-lanes'],
  [files.commandCenterHtml, 'agent-routing-matrix'],
  [files.commandCenterJs, 'fallbackSeisRouterLanes'],
  [files.commandCenterJs, 'renderSeisRouter'],
  [files.commandCenterJs, 'data/seis-router-routes.json'],
  [files.commandCenterRouterArtifact, 'agent-router-seed-v0'],
  [files.commandCenterCss, 'router-lane-card'],
  [files.commandCenterCss, 'routing-matrix-row'],
  [files.commandCenterTest, 'SEIS Command Center exposes 10-lane router contract'],
  [files.appHtml, 'god-mode-panel'],
  [files.appHtml, 'god-mode-toggle'],
  [files.appHtml, 'god-mode-signals'],
  [files.appJs, 'godModeStorageKey'],
  [files.appJs, 'loadGodMode'],
  [files.appJs, 'setGodMode'],
  [files.appJs, 'seis_demo_god_mode_changed'],
  [files.appJs, 'is-god-mode'],
  [files.appCss, '.god-mode-panel'],
  [files.appCss, 'body.is-god-mode'],
  [files.serviceWorker, 'seis-demo-web-v'],
  [files.webContract, 'seis_demo_god_mode_changed'],
  [files.nativeContract, 'seis_demo_god_mode_changed'],
  [files.learningContract, 'seis-god-mode-developer-contract'],
  [files.learningContract, 'requiredLayerLift'],
  [files.learningContract, 'qualityGate'],
  [files.pluginManifest, 'SEIS God Mode Developer cross-layer lane'],
  [files.pluginManifest, 'Use SEIS God Mode Developer'],
  [files.pluginReadme, 'skills/seis-god-mode-developer/SKILL.md'],
  [files.skill, 'name: seis-god-mode-developer'],
  [files.skill, 'npm run check:seis-god-mode-developer'],
  [files.agent, 'display_name: "SEIS God Mode Developer"'],
  [files.packageJson, '"check:seis-god-mode-developer"'],
  [files.packageJson, 'npm run check:seis-god-mode-developer'],
]) {
  requireIncludes(file, token);
}

const webContract = readJson(files.webContract);
const nativeContract = readJson(files.nativeContract);
const learningContract = readJson(files.learningContract);
const packageJson = readJson(files.packageJson);

const requiredGodModeLayers = [
  'product-experience',
  'application-platform',
  'ai-agi-learning',
  'cloud-security',
  'governance-quality',
];

const requiredRouterLanes = [
  'seis',
  'seis-governance',
  'seis-cloud',
  'seis-code',
  'seis-design',
  'seis-data',
  'seis-security',
  'seis-research',
  'seis-automation',
  'seis-product',
];

const commandCenterJs = read(files.commandCenterJs);
for (const lane of requiredRouterLanes) {
  requireIncludes(files.commandCenterJs, `laneId: "${lane}"`);
}
for (const token of ['tool:', 'defaultGate:', 'integrationTool:', 'handoff:']) {
  requireIncludes(files.commandCenterJs, token);
}

const laneCount = (commandCenterJs.match(/laneId: "/g) || []).length;
ensure(laneCount >= requiredRouterLanes.length, 'Command Center router must expose at least ten lane records');

if (webContract && nativeContract) {
  const webEvents = eventNames(webContract);
  const nativeEvents = eventNames(nativeContract);

  ensure(
    webEvents.includes('seis_demo_god_mode_changed'),
    'web contract must expose God Mode telemetry event',
  );
  ensure(
    nativeEvents.includes('seis_demo_god_mode_changed'),
    'native contract must expose God Mode telemetry event',
  );

  ensure(
    JSON.stringify([...new Set(webEvents)].sort()) === JSON.stringify([...new Set(nativeEvents)].sort()),
    'web and native demo contract event sets must stay in parity',
  );

  ensure(
    requiredFieldsSatisfied(eventByName(webContract, 'seis_demo_god_mode_changed'), [
      'event_id',
      'occurred_at',
      'session_id',
      'route',
      'details',
    ]),
    'God Mode telemetry event must include required base fields in web contract',
  );

  ensure(
    requiredFieldsSatisfied(eventByName(nativeContract, 'seis_demo_god_mode_changed'), [
      'event_id',
      'occurred_at',
      'session_id',
      'route',
      'details',
    ]),
    'God Mode telemetry event must include required base fields in native contract',
  );

  const appEvent = eventByName(webContract, 'seis_demo_god_mode_changed');
  ensure(
    Array.isArray(appEvent.required_fields) && appEvent.required_fields.length >= 3,
    'God Mode contract event should declare schema fields',
  );
}

if (learningContract) {
  ensure(learningContract.id === 'seis-god-mode-developer-contract', 'Learning contract id must be seis-god-mode-developer-contract');
  ensure(learningContract.status === 'active', 'God Mode learning contract must be active');
  ensure(
    learningContract.feature?.telemetryEvent === 'seis_demo_god_mode_changed',
    'God Mode contract must bind telemetry event',
  );

  const layerList = learningContract.requiredLayerLift;
  ensure(
    Array.isArray(layerList) && layerList.length === requiredGodModeLayers.length,
    'God Mode learning contract must define five required layer lifts',
  );

  for (const layer of requiredGodModeLayers) {
    ensure(layerList?.includes(layer), `God Mode required layer missing: ${layer}`);
  }

  ensure(
    Array.isArray(learningContract.operatingBehavior) && learningContract.operatingBehavior.length >= 5,
    'God Mode contract must define at least five operating behaviors',
  );
  ensure(
    learningContract.qualityGate === 'npm run check:seis-god-mode-developer',
    'Learning contract quality gate must be npm run check:seis-god-mode-developer',
  );
}

if (packageJson) {
  ensure(
    packageJson.scripts?.['check:seis-god-mode-developer'] ===
      'node scripts/check-seis-god-mode-developer.mjs',
    'package.json must expose check:seis-god-mode-developer',
  );
  ensure(
    String(packageJson.scripts?.['quality:governance'] || '').includes(
      'npm run check:seis-god-mode-developer',
    ),
    'quality:governance must include God Mode check',
  );
}

if (failures.length > 0) {
  console.error('SEIS God Mode Developer check failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('SEIS God Mode Developer check passed.');

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!existsSync(absolutePath)) {
    failures.push(`missing file: ${relativePath}`);
    return '';
  }
  return readFileSync(absolutePath, 'utf8');
}

function readJson(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!existsSync(absolutePath)) return null;
  try {
    return JSON.parse(read(relativePath));
  } catch {
    failures.push(`invalid JSON: ${relativePath}`);
    return null;
  }
}

function requireIncludes(file, token) {
  const text = read(file);
  if (!text.includes(token)) {
    failures.push(`${file} must include ${token}`);
  }
}

function requiredFieldsSatisfied(event, fields) {
  if (!event || !Array.isArray(event.required_fields)) return false;
  return fields.every((field) => event.required_fields.includes(field));
}

function eventByName(contract, name) {
  return (contract?.analytics_events || []).find((event) => event?.name === name);
}

function eventNames(contract) {
  return (contract?.analytics_events || []).map((event) => event?.name);
}

function ensure(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}
