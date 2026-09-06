import fs from 'node:fs';
import { summarizeSeisSovereignProductTrack, validateSeisSovereignProductTrack } from './lib/seis-sovereign-product-track.mjs';

const track = JSON.parse(fs.readFileSync('content/development/seis-sovereign-product-track.json', 'utf8'));
const validation = validateSeisSovereignProductTrack(track, { pathExists: fs.existsSync });
if (!validation.ok) throw new Error(validation.errors.join('\n'));
const [command = 'summary'] = process.argv.slice(2);

switch (command) {
  case 'summary': {
    const summary = summarizeSeisSovereignProductTrack(track);
    console.log(`SEIS Sovereign Track — ${summary.ownedDomainCount} owned domains, ${summary.activeTrackCount}/${summary.deliveryTrackCount} active delivery tracks`);
    break;
  }
  case 'json':
    console.log(JSON.stringify(track, null, 2));
    break;
  case 'domains':
    console.log(JSON.stringify(track.ownedDomains, null, 2));
    break;
  case 'tracks':
    console.log(JSON.stringify(track.deliveryTracks, null, 2));
    break;
  case 'boundaries':
    console.log(JSON.stringify(track.explicitNonOwnership, null, 2));
    break;
  default:
    throw new Error(`unknown command: ${command}`);
}
