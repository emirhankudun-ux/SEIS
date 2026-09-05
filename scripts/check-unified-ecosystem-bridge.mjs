import fs from 'node:fs';

const path = 'content/ecosystem/unified-bridge.json';
const raw = fs.readFileSync(path, 'utf8');
const data = JSON.parse(raw);

const fail = (message) => {
  console.error(`unified-ecosystem-bridge: ${message}`);
  process.exit(1);
};

if (data.schemaVersion !== 1) fail('schemaVersion must be 1');
if (data.contractId !== 'unified-ecosystem-bridge-v1') fail('unexpected contractId');
if (!data.project?.id || !data.project?.role || !data.project?.sourceRepository) fail('project identity is incomplete');
if (data.federation?.mode !== 'curated') fail('federation mode must remain curated');
if (data.federation?.sourceRemainsCanonical !== true) fail('source repository must remain canonical');
if (data.federation?.crossRepositoryWrites !== false) fail('cross-repository writes must remain disabled');
if (data.federation?.historyImportRequired !== false) fail('history import must not be required');

const requiredPeers = new Set(['seis', 'eleni-neferi', 'pantechnoepistemonoesis', 'portfolio-surface']);
for (const peer of data.peers ?? []) requiredPeers.delete(peer.id);
if (requiredPeers.size) fail(`missing peers: ${[...requiredPeers].join(', ')}`);

const requiredContracts = ['agent-runtime', 'intelligence-router', 'tool-and-mcp-boundary', 'knowledge-exchange', 'design-system-tokens', 'evidence-and-verification'];
for (const contract of requiredContracts) {
  if (!data.sharedContracts?.includes(contract)) fail(`missing shared contract: ${contract}`);
}

if (data.publicExport?.forbidSecrets !== true) fail('public export must forbid secrets');
if (data.publicExport?.forbidPrivateClientData !== true) fail('public export must forbid private client data');
if (data.publicExport?.forbidUnverifiedCapabilityClaims !== true) fail('public export must forbid unverified capability claims');

const forbiddenKey = /(api[_-]?key|token|password|private[_-]?key|secret)/i;
const scan = (value, trail = []) => {
  if (Array.isArray(value)) return value.forEach((item, index) => scan(item, [...trail, index]));
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    if (forbiddenKey.test(key) && !['forbidSecrets'].includes(key)) fail(`secret-like field is not allowed: ${[...trail, key].join('.')}`);
    scan(child, [...trail, key]);
  }
};
scan(data);

console.log(`unified-ecosystem-bridge: ok (${data.project.id}, ${data.sharedContracts.length} shared contracts, ${data.peers.length} peers)`);
