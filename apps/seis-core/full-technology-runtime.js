export const CUBE_FACES = Object.freeze([
  Object.freeze({
    id: 'intelligence',
    label: 'Intelligence',
    signal: 'AI, agents and digital-life intelligence.',
    accent: 'violet',
    domains: Object.freeze(['intelligence', 'digital-life'])
  }),
  Object.freeze({
    id: 'software',
    label: 'Software',
    signal: 'Code, platform and cross-device engineering.',
    accent: 'blue',
    domains: Object.freeze(['software', 'platform'])
  }),
  Object.freeze({
    id: 'creation',
    label: 'Creation',
    signal: 'Design, 3D, cinema and audio production.',
    accent: 'gold',
    domains: Object.freeze(['creation', 'cinema-audio'])
  }),
  Object.freeze({
    id: 'reality',
    label: 'Reality',
    signal: 'Game, world, rendering and simulation foundations.',
    accent: 'cyan',
    domains: Object.freeze(['reality', 'game'])
  }),
  Object.freeze({
    id: 'infrastructure',
    label: 'Infrastructure',
    signal: 'Data, cloud, security and operational systems.',
    accent: 'green',
    domains: Object.freeze(['data-knowledge', 'cloud-distributed', 'security-privacy'])
  }),
  Object.freeze({
    id: 'science',
    label: 'Science & Future',
    signal: 'Science, engineering, robotics, hardware and governance.',
    accent: 'amber',
    domains: Object.freeze(['science-math', 'engineering-manufacturing', 'robotics-autonomy', 'hardware-electronics', 'governance-research'])
  })
]);

const SECTIONS = Object.freeze(['atlas', 'cube', 'workbenches', 'engines', 'evidence']);

function fail(message) {
  throw new Error(`SEIS Full Technology runtime: ${message}`);
}

function requireArray(value, name) {
  if (!Array.isArray(value)) fail(`${name} must be an array`);
  return value;
}

export function validateProjection(data) {
  const registry = data?.registry;
  const catalog = data?.catalog;
  const composer = data?.composer;
  const engines = data?.engines;
  const commandCenter = data?.commandCenter;

  const domains = requireArray(registry?.domains, 'registry.domains');
  const tools = requireArray(catalog?.tools, 'catalog.tools');
  const workbenches = requireArray(composer?.presets, 'composer.presets');
  const engineFamilies = requireArray(engines?.engines, 'engines.engines');
  const summary = commandCenter?.summary;

  const capabilityCount = domains.reduce((total, domain) => total + requireArray(domain.capabilities, `${domain.id}.capabilities`).length, 0);
  const actual = {
    domainCount: domains.length,
    capabilityCount,
    toolCount: tools.length,
    workbenchCount: workbenches.length,
    engineFamilyCount: engineFamilies.length,
    verifiedRuntimeClaims: summary?.verifiedRuntimeClaims
  };

  const valid = actual.domainCount === summary?.domainCount
    && actual.capabilityCount === summary?.capabilityCount
    && actual.toolCount === summary?.toolCount
    && actual.workbenchCount === summary?.workbenchCount
    && actual.engineFamilyCount === summary?.engineFamilyCount
    && actual.verifiedRuntimeClaims === 0;

  if (!valid) fail('Command Center projection is stale or inconsistent with canonical records');
  return actual;
}

export function buildCubeProjection(registry, activeFaceId = CUBE_FACES[0].id) {
  const domains = requireArray(registry?.domains, 'registry.domains');
  const domainMap = new Map(domains.map((domain) => [domain.id, domain]));
  const canonicalIds = new Set(domainMap.keys());
  const projectedIds = CUBE_FACES.flatMap((face) => face.domains);

  if (projectedIds.length !== canonicalIds.size || new Set(projectedIds).size !== canonicalIds.size) {
    fail('Cube faces must cover each canonical domain exactly once');
  }
  for (const id of projectedIds) {
    if (!canonicalIds.has(id)) fail(`Cube face references unknown domain ${id}`);
  }

  const faces = CUBE_FACES.map((face) => ({
    ...face,
    domains: [...face.domains],
    domainRecords: face.domains.map((id) => domainMap.get(id))
  }));
  const activeFace = faces.find((face) => face.id === activeFaceId) ?? faces[0];

  return { faces, activeFace };
}

export function composeWorkbench(composer, id) {
  const presets = requireArray(composer?.presets, 'composer.presets');
  const preset = presets.find((item) => item.id === id);
  if (!preset) fail(`Unknown Workbench: ${id}`);

  const tools = requireArray(preset.tools, `${id}.tools`);
  const maxTools = composer?.rules?.maxVisiblePrimaryTools ?? 10;
  const minTools = composer?.rules?.minimumPrimaryTools ?? 1;
  if (tools.length < minTools || tools.length > maxTools) fail(`${id} exceeds Workbench tool bounds`);

  return {
    id: preset.id,
    intent: preset.intent,
    domains: [...preset.domains],
    tools: [...tools],
    requiresApprovalForExternalActions: composer?.rules?.externalActionsRequireApproval === true,
    executionTruth: {
      toolsExecuted: 0,
      externalWrites: 0,
      providerCalls: 0,
      credentialsRead: 0
    }
  };
}

function isSelectedRecordValid(selected, data, activeWorkbenchId) {
  if (!selected || typeof selected !== 'object') return false;
  const { recordType, id } = selected;
  if (typeof id !== 'string') return false;
  if (recordType === 'domain') return data.registry.domains.some((item) => item.id === id);
  if (recordType === 'tool') return data.catalog.tools.some((item) => item.id === id);
  if (recordType === 'workbench') return data.composer.presets.some((item) => item.id === id);
  if (recordType === 'engine') return data.engines.engines.some((item) => item.id === id);
  if (recordType === 'cube') return CUBE_FACES.some((item) => item.id === id);
  if (recordType === 'workbench-tool') {
    const workbench = data.composer.presets.find((item) => item.id === activeWorkbenchId);
    return Boolean(workbench?.tools.includes(id));
  }
  return false;
}

export function normalizeExperienceState(input = {}, data) {
  validateProjection(data);
  const section = SECTIONS.includes(input.section) ? input.section : 'atlas';
  const domain = data.registry.domains.some((item) => item.id === input.domain) ? input.domain : 'all';
  const activeCubeFace = CUBE_FACES.some((item) => item.id === input.activeCubeFace) ? input.activeCubeFace : CUBE_FACES[0].id;
  const activeWorkbenchId = data.composer.presets.some((item) => item.id === input.activeWorkbenchId) ? input.activeWorkbenchId : null;
  const selected = isSelectedRecordValid(input.selected, data, activeWorkbenchId) ? { ...input.selected } : null;

  return { section, domain, activeCubeFace, activeWorkbenchId, selected };
}

export function createReviewSnapshot({ data, state, now = new Date().toISOString() }) {
  const summary = validateProjection(data);
  const activeWorkbench = state?.activeWorkbenchId
    ? composeWorkbench(data.composer, state.activeWorkbenchId)
    : null;
  const activeCubeFace = CUBE_FACES.some((item) => item.id === state?.activeCubeFace)
    ? state.activeCubeFace
    : CUBE_FACES[0].id;
  const selectedRecord = isSelectedRecordValid(state?.selected, data, activeWorkbench?.id)
    ? { ...state.selected }
    : null;

  return {
    version: 1,
    id: 'seis-full-technology-review-snapshot',
    generatedAt: now,
    mode: 'browser-local-review',
    sources: [...data.commandCenter.sourceOfTruth],
    summary,
    activeCubeFace,
    activeWorkbench,
    selectedRecord,
    executionTruth: {
      toolsExecuted: 0,
      externalWrites: 0,
      providerCalls: 0,
      credentialsRead: 0
    }
  };
}
