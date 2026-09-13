import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const resolve = (p) => path.join(root, p);
const readJson = (p) => JSON.parse(fs.readFileSync(resolve(p), 'utf8'));
const assert = (condition, message) => {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exitCode = 1;
  }
};

const registry = readJson('content/development/seis-full-technology-registry.json');
const engines = readJson('content/development/seis-engine-capability-registry.json');
const cube = readJson('content/development/seis-cube-runtime-contract.json');
const composer = readJson('content/development/seis-workbench-composer.json');
const catalog = readJson('content/development/seis-technology-tool-catalog.json');
const commandCenter = readJson('content/development/seis-full-technology-command-center.json');
const acceptance = readJson('content/development/seis-full-technology-demo-acceptance.json');
const toolSchema = readJson('schemas/seis-technology-tool.schema.json');

assert(registry.id === 'seis-full-technology-registry', 'registry ID must be canonical');
assert(registry.summary?.domainCount === 16, 'registry must declare 16 domains');
assert(registry.domains?.length === 16, 'registry must contain 16 domains');
assert(registry.summary?.capabilityCount === 96, 'registry must declare 96 first-wave capabilities');
assert(registry.canonicalGoalBinding?.status === 'unresolved', 'missing canonical SEIS-GOAL-021 must remain unresolved');
assert(registry.safetyBoundary?.defaultNetwork === 'deny', 'network must default deny');
assert(registry.safetyBoundary?.defaultWrite === 'deny', 'writes must default deny');
assert(registry.safetyBoundary?.credentialsInRegistry === false, 'credentials cannot live in registry');

const domainIds = new Set(registry.domains.map((domain) => domain.id));
const domainCapabilityMap = new Map(registry.domains.map((domain) => [domain.id, new Set(domain.capabilities)]));
assert(domainIds.size === 16, 'domain IDs must be unique');
for (const domain of registry.domains) {
  assert(Array.isArray(domain.capabilities) && domain.capabilities.length === 6, `${domain.id} must expose six first-wave capabilities`);
}

const expectedEngines = ['seis-game-engine', 'seis-reality-engine', 'seis-3d-engine', 'seis-digital-human'];
const engineIds = new Set(engines.engines?.map((engine) => engine.id));
for (const id of expectedEngines) assert(engineIds.has(id), `missing engine record: ${id}`);
for (const engine of engines.engines ?? []) assert(Array.isArray(engine.capabilities) && engine.capabilities.length >= 15, `${engine.id} needs a substantial capability contract`);
assert(engines.safety?.proprietaryCopying === 'forbidden', 'proprietary implementation copying must be forbidden');

assert(cube.truthBoundary?.rendererMayInferRuntimeTruth === false, 'Cube renderer cannot infer runtime truth');
assert(cube.truthBoundary?.canonicalSourceRequiredForVerifiedState === true, 'verified Cube state needs canonical evidence');
assert(cube.accessibility?.keyboardTraversal === 'required', 'Cube keyboard traversal is required');
assert(cube.accessibility?.screenReaderTree === 'required', 'Cube screen-reader tree is required');
assert(cube.performance?.pauseWhenHidden === true, 'Cube must pause when hidden');

assert(composer.mode === 'deterministic-local-demo', 'Workbench Composer must remain deterministic local demo');
assert(Array.isArray(composer.presets) && composer.presets.length >= 12, 'Workbench Composer must have at least 12 focused presets');
assert(composer.rules?.maxVisiblePrimaryTools <= 10, 'Workbench must cap visible primary tools');
assert(composer.rules?.autoExecuteTools === false, 'Workbench cannot auto-execute tools');
assert(composer.rules?.permissionsResolvedBeforeToolActivation === true, 'permissions must resolve before activation');
for (const preset of composer.presets ?? []) {
  assert(preset.tools.length >= composer.rules.minimumPrimaryTools, `${preset.id} has too few tools`);
  assert(preset.tools.length <= composer.rules.maxVisiblePrimaryTools, `${preset.id} exposes too many tools`);
  for (const domain of preset.domains ?? []) assert(domainIds.has(domain), `${preset.id} references unknown domain ${domain}`);
}

assert(toolSchema.title === 'SEIS Technology Tool Record', 'tool schema identity must stay stable');
assert(catalog.id === 'seis-technology-tool-catalog', 'tool catalog ID must stay stable');
assert(catalog.toolCount === 48 && catalog.tools?.length === 48, 'first-wave tool catalog must contain 48 tools');
const toolIds = new Set(catalog.tools.map((tool) => tool.id));
assert(toolIds.size === 48, 'tool IDs must be unique');

const allowedImplementationClasses = new Set(registry.summary.implementationClasses);
const allowedMaturity = new Set(registry.summary.maturityStates);
const toolCountsByDomain = new Map();
for (const tool of catalog.tools ?? []) {
  assert(domainIds.has(tool.domain), `${tool.id} references unknown domain ${tool.domain}`);
  assert(domainCapabilityMap.get(tool.domain)?.has(tool.capability), `${tool.id} references capability ${tool.capability} outside domain ${tool.domain}`);
  assert(allowedImplementationClasses.has(tool.implementationClass), `${tool.id} has invalid implementation class`);
  assert(allowedMaturity.has(tool.maturity), `${tool.id} has invalid maturity`);
  assert(tool.permissions?.externalWrite === false, `${tool.id} cannot enable external writes in the first-wave catalog`);
  assert(tool.permissions?.secrets !== 'approval-required', `${tool.id} cannot require secrets in the first-wave catalog`);
  assert(tool.validationState !== 'runtime-validated', `${tool.id} cannot claim runtime validation without runtime evidence`);
  toolCountsByDomain.set(tool.domain, (toolCountsByDomain.get(tool.domain) ?? 0) + 1);
}
for (const domain of domainIds) assert(toolCountsByDomain.get(domain) === 3, `${domain} must expose exactly three first-wave tools`);

assert(commandCenter.version === 2, 'Command Center projection must use the implemented experience contract');
assert(commandCenter.status === 'browser-local-prototype', 'Command Center maturity must remain browser-local prototype');
assert(commandCenter.summary?.domainCount === registry.domains.length, 'Command Center domain count must come from registry');
assert(commandCenter.summary?.capabilityCount === registry.summary.capabilityCount, 'Command Center capability count must match registry');
assert(commandCenter.summary?.toolCount === catalog.tools.length, 'Command Center tool count must match catalog');
assert(commandCenter.summary?.engineFamilyCount === engines.engines.length, 'Command Center engine count must match engine registry');
assert(commandCenter.summary?.workbenchCount === composer.presets.length, 'Command Center workbench count must match composer');
assert(commandCenter.summary?.cubeFaceCount === 6, 'Command Center must expose the six-face Cube projection');
assert(commandCenter.summary?.browserLocalExperienceCount === 5, 'Command Center must record five validated browser-local experiences');
assert(commandCenter.summary?.verifiedRuntimeClaims === 0, 'prototype projection cannot claim verified engine runtime behavior');
assert(commandCenter.summary?.offlineMode === 'same-origin-cache-fallback', 'offline mode must remain scoped and explicit');
assert(commandCenter.truthBoundary?.browserLocalInteractionValidated === true, 'browser-local interaction must be explicitly validated');
assert(commandCenter.truthBoundary?.engineRuntimeValidated === false, 'engine runtime must remain unvalidated');
assert(commandCenter.truthBoundary?.runtimeMetricsFabricated === false, 'runtime metrics must never be fabricated');
assert(commandCenter.truthBoundary?.offlineCacheStoresCredentials === false, 'offline cache must not store credentials');
assert(commandCenter.experienceRules?.preferListsTablesInspectorsOverCards === true, 'Command Center must avoid generic card-dashboard sprawl');
assert(commandCenter.experienceRules?.autoExecuteTools === false, 'Command Center cannot auto-execute Workbench tools');
for (const evidencePath of commandCenter.evidenceSources ?? []) {
  assert(fs.existsSync(resolve(evidencePath)), `missing Command Center evidence source: ${evidencePath}`);
}

assert(acceptance.id === 'seis-full-technology-demo-acceptance', 'demo acceptance ID must be stable');
assert(acceptance.status === 'validated-browser-local-prototype', 'demo acceptance must describe the verified scope precisely');
assert(acceptance.canonicalGoalBinding === 'unresolved', 'demo acceptance cannot fabricate the canonical Goal binding');
assert(Array.isArray(acceptance.acceptedCapabilities) && acceptance.acceptedCapabilities.length >= 10, 'demo acceptance needs the complete browser-local capability set');
assert(acceptance.acceptedCapabilities.every((item) => item.status === 'validated'), 'accepted capabilities must all be validator-backed');
assert(Array.isArray(acceptance.blockedCapabilities) && acceptance.blockedCapabilities.length >= 6, 'blocked native and release capabilities must remain visible');
assert(acceptance.blockedCapabilities.every((item) => item.status === 'blocked' && item.reason), 'blocked capabilities require explicit reasons');
assert(acceptance.securityBoundary?.externalWrites === false, 'demo acceptance cannot authorize external writes');
assert(acceptance.securityBoundary?.providerCalls === false, 'demo acceptance cannot claim provider calls');
assert(acceptance.securityBoundary?.credentialsRead === false, 'demo acceptance cannot claim credential reads');
assert(acceptance.securityBoundary?.crossOriginCaching === false, 'offline cache cannot cross origin boundaries');
assert(acceptance.securityBoundary?.nonGetCaching === false, 'offline cache cannot cache write methods');
assert(acceptance.releaseBoundary?.mergeAuthorized === false, 'demo acceptance cannot authorize merge');
assert(acceptance.releaseBoundary?.deploymentAuthorized === false, 'demo acceptance cannot authorize deployment');
for (const item of acceptance.acceptedCapabilities ?? []) {
  for (const evidencePath of item.evidence ?? []) assert(fs.existsSync(resolve(evidencePath)), `${item.id} references missing evidence: ${evidencePath}`);
}

if (!process.exitCode) {
  console.log(`PASS: SEIS Full Technology experience validated (${registry.domains.length} domains, ${catalog.tools.length} tools, ${composer.presets.length} workbenches, ${engines.engines.length} engine families, ${acceptance.acceptedCapabilities.length} accepted browser-local capabilities).`);
}
