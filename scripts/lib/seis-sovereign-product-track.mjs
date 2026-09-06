export const SEIS_SOVEREIGN_TRACK_CONTRACT_ID = 'seis-sovereign-product-track-v1';

const REQUIRED_OWNED_DOMAINS = new Set([
  'desktop-runtime',
  'ai-core-orchestration',
  'supervised-agent-runtime',
  'tool-and-mcp-governance',
  'workspace-and-vfs',
  'apple-native-platform',
  'security-and-release-evidence',
  'project-and-second-brain-memory',
]);

const REQUIRED_NON_OWNERS = new Set([
  'eleni-neferi',
  'pantechnoepistemonoesis',
  'pantechnosyni',
]);

const ALLOWED_TRACK_STATUSES = new Set(['active', 'planned', 'blocked', 'review']);
const SENSITIVE_KEY = /(api.?key|access.?token|password|private.?key|client.?secret|credential|secret)/i;
const SENSITIVE_VALUE = /(?:^|[^A-Za-z0-9])(ghp_|github_pat_|sk-[A-Za-z0-9]{12,}|BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY)/;

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function safePath(value) {
  return typeof value === 'string'
    && value.length > 0
    && !value.startsWith('/')
    && !value.includes('\\')
    && !value.split('/').includes('..')
    && !/^[a-z][a-z0-9+.-]*:\/\//i.test(value);
}

function uniqueStringArray(value, label, errors, minimum = 1) {
  if (!Array.isArray(value) || value.length < minimum) {
    errors.push(`${label} must contain at least ${minimum} item(s)`);
    return [];
  }
  const seen = new Set();
  value.forEach((item, index) => {
    if (typeof item !== 'string' || item.trim() !== item || item.length === 0) {
      errors.push(`${label}[${index}] must be a non-empty trimmed string`);
      return;
    }
    if (seen.has(item)) errors.push(`${label} contains duplicate value: ${item}`);
    seen.add(item);
  });
  return value;
}

function scanSensitive(value, trail, errors) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanSensitive(item, [...trail, String(index)], errors));
    return;
  }
  if (isObject(value)) {
    for (const [key, child] of Object.entries(value)) {
      if (SENSITIVE_KEY.test(key)) errors.push(`sensitive-shaped key is forbidden: ${[...trail, key].join('.')}`);
      scanSensitive(child, [...trail, key], errors);
    }
    return;
  }
  if (typeof value === 'string' && SENSITIVE_VALUE.test(value)) {
    errors.push(`sensitive-shaped value is forbidden: ${trail.join('.') || 'root'}`);
  }
}

export function validateSeisSovereignProductTrack(track, { pathExists = () => true } = {}) {
  const errors = [];
  if (!isObject(track)) return { ok: false, errors: ['track must be an object'] };
  scanSensitive(track, [], errors);

  if (track.schemaVersion !== 1) errors.push('schemaVersion must be 1');
  if (track.contractId !== SEIS_SOVEREIGN_TRACK_CONTRACT_ID) errors.push(`contractId must be ${SEIS_SOVEREIGN_TRACK_CONTRACT_ID}`);
  if (track.project?.id !== 'seis') errors.push('project.id must be seis');
  if (track.project?.displayName !== 'SEIS') errors.push('project.displayName must be SEIS');
  if (track.project?.repository !== 'emirhankudun-ux/SEIS') errors.push('project.repository is incorrect');
  if (track.project?.visibility !== 'public') errors.push('project.visibility must be public');
  if (track.project?.productClass !== 'apple-first-creative-engineering-operating-system') errors.push('project.productClass is incorrect');
  if (track.project?.canonicalOwner !== true) errors.push('project.canonicalOwner must be true');
  if (typeof track.mission !== 'string' || track.mission.trim().length < 50) errors.push('mission is too short');

  const ownedDomains = uniqueStringArray(track.ownedDomains, 'ownedDomains', errors, REQUIRED_OWNED_DOMAINS.size);
  for (const domain of REQUIRED_OWNED_DOMAINS) {
    if (!ownedDomains.includes(domain)) errors.push(`missing owned domain: ${domain}`);
  }

  if (!Array.isArray(track.explicitNonOwnership)) {
    errors.push('explicitNonOwnership must be an array');
  } else {
    const seenProjects = new Set();
    for (const entry of track.explicitNonOwnership) {
      if (!isObject(entry) || typeof entry.projectId !== 'string') {
        errors.push('each non-ownership entry must contain projectId');
        continue;
      }
      if (seenProjects.has(entry.projectId)) errors.push(`duplicate non-ownership project: ${entry.projectId}`);
      seenProjects.add(entry.projectId);
      uniqueStringArray(entry.domains, `explicitNonOwnership.${entry.projectId}.domains`, errors, 2);
    }
    for (const projectId of REQUIRED_NON_OWNERS) {
      if (!seenProjects.has(projectId)) errors.push(`missing non-ownership boundary: ${projectId}`);
    }
    if (seenProjects.size !== REQUIRED_NON_OWNERS.size) errors.push('explicitNonOwnership must contain exactly the three sibling boundaries');
  }

  if (!Array.isArray(track.deliveryTracks) || track.deliveryTracks.length < 4) {
    errors.push('deliveryTracks must contain at least four tracks');
  } else {
    const ids = new Set();
    for (const delivery of track.deliveryTracks) {
      if (!isObject(delivery) || typeof delivery.id !== 'string') {
        errors.push('delivery track is malformed');
        continue;
      }
      if (ids.has(delivery.id)) errors.push(`duplicate delivery track id: ${delivery.id}`);
      ids.add(delivery.id);
      if (!ALLOWED_TRACK_STATUSES.has(delivery.status)) errors.push(`${delivery.id}: unsupported status ${delivery.status}`);
      if (typeof delivery.purpose !== 'string' || delivery.purpose.length < 30) errors.push(`${delivery.id}: purpose is too short`);
      if (typeof delivery.nextAction !== 'string' || delivery.nextAction.length < 30) errors.push(`${delivery.id}: nextAction is too short`);
      const evidence = uniqueStringArray(delivery.evidence, `${delivery.id}.evidence`, errors, 1);
      for (const evidencePath of evidence) {
        if (!safePath(evidencePath)) errors.push(`${delivery.id}: unsafe evidence path ${evidencePath}`);
        else if (!pathExists(evidencePath)) errors.push(`${delivery.id}: missing evidence path ${evidencePath}`);
      }
    }
  }

  const expectedInterop = {
    mode: 'contract-only',
    sourceRepositoriesRemainCanonical: true,
    crossRepositoryWrites: false,
    sourceCodeImport: false,
    runtimeAuthorityTransfer: false,
  };
  for (const [key, expected] of Object.entries(expectedInterop)) {
    if (track.interoperability?.[key] !== expected) errors.push(`interoperability.${key} must be ${JSON.stringify(expected)}`);
  }

  const expectedPolicy = {
    appleFirst: true,
    swiftFirstWhenNative: true,
    humanApprovalRequired: true,
    liveProviderExecution: false,
    externalWrites: false,
    automaticDeployment: false,
    automaticClaims: false,
  };
  for (const [key, expected] of Object.entries(expectedPolicy)) {
    if (track.policy?.[key] !== expected) errors.push(`policy.${key} must be ${expected}`);
  }

  return { ok: errors.length === 0, errors };
}

export function summarizeSeisSovereignProductTrack(track) {
  const result = validateSeisSovereignProductTrack(track);
  if (!result.ok) throw new Error(`Invalid ${SEIS_SOVEREIGN_TRACK_CONTRACT_ID}:\n- ${result.errors.join('\n- ')}`);
  return {
    contractId: track.contractId,
    project: track.project,
    ownedDomainCount: track.ownedDomains.length,
    nonOwnershipProjectCount: track.explicitNonOwnership.length,
    deliveryTrackCount: track.deliveryTracks.length,
    activeTrackCount: track.deliveryTracks.filter((entry) => entry.status === 'active').length,
    policy: track.policy,
  };
}
