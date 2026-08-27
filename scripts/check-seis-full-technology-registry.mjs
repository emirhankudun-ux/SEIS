import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const file = path.join(root, 'content/development/seis-full-technology-registry.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const fail = (message) => {
  console.error(`SEIS Full Technology registry check failed: ${message}`);
  process.exit(1);
};

if (data.id !== 'seis-full-technology-registry') fail('unexpected registry id');
if (data.goalId !== 'SEIS-GOAL-021') fail('registry must bind to SEIS-GOAL-021');
if (!Array.isArray(data.domains) || data.domains.length !== 16) fail('expected exactly 16 top-level domains');

const ids = data.domains.map((domain) => domain.id);
if (new Set(ids).size !== ids.length) fail('duplicate domain ids');
for (const domain of data.domains) {
  if (!domain.name || !Array.isArray(domain.capabilities) || domain.capabilities.length < 4) {
    fail(`invalid domain contract: ${domain.id}`);
  }
}

for (const field of ['implementationClasses', 'maturityStates']) {
  if (!Array.isArray(data.summary?.[field]) || data.summary[field].length === 0) fail(`missing ${field}`);
}

if (!Array.isArray(data.universalFrameworks) || data.universalFrameworks.length < 10) fail('universal frameworks are incomplete');
if (!Array.isArray(data.coreSystems) || !data.coreSystems.includes('seis-workbench-composer')) fail('workbench composer must be a core system');

const boundary = data.safetyBoundary ?? {};
if (boundary.defaultNetwork !== 'deny') fail('network must be deny-by-default');
if (boundary.defaultWrite !== 'deny') fail('write must be deny-by-default');
if (boundary.externalMutationRequiresApproval !== true) fail('external mutation must require approval');
if (boundary.credentialsInRegistry !== false) fail('credentials must not be stored in the registry');

console.log(`SEIS Full Technology registry check passed (${data.domains.length} domains).`);
