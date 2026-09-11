import fs from 'node:fs';
import { validateSeisSovereignProductTrack } from './lib/seis-sovereign-product-track.mjs';

const path = 'content/development/seis-sovereign-product-track.json';
const track = JSON.parse(fs.readFileSync(path, 'utf8'));
const result = validateSeisSovereignProductTrack(track, { pathExists: fs.existsSync });

if (!result.ok) {
  console.error('seis-sovereign-product-track: failed');
  for (const error of result.errors) console.error(`- ${error}`);
  process.exit(1);
}

const manifest = fs.readFileSync('project.ecosystem.yaml', 'utf8');
if (!manifest.includes('canonical_owner_repo: seis')) {
  console.error('seis-sovereign-product-track: project manifest must preserve SEIS ownership');
  process.exit(1);
}
if (!manifest.includes('sovereign-product-runtime') || manifest.includes('ecosystem-coordinator')) {
  console.error('seis-sovereign-product-track: project manifest must declare sovereign runtime without umbrella coordination');
  process.exit(1);
}

console.log(`seis-sovereign-product-track: ok (${track.ownedDomains.length} owned domains, ${track.deliveryTracks.length} delivery tracks)`);
