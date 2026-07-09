import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const htmlPath = path.join(repoRoot, 'apps/web/universal-language-selector.html');
const policyPath = path.join(repoRoot, 'content/development/seis-universal-language-atlas.json');
const syncScriptPath = path.join(repoRoot, 'scripts/sync-seis-github-linguist-language-atlas.mjs');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function extractArray(scriptText, variableName) {
  const pattern = new RegExp(`const\\s+${variableName}\\s*=\\s*(\\[[\\s\\S]*?\\]);`);
  const match = scriptText.match(pattern);
  assert(match, `missing ${variableName} array`);
  return vm.runInNewContext(match[1], Object.create(null));
}

function extractObject(scriptText, variableName) {
  const pattern = new RegExp(`const\\s+${variableName}\\s*=\\s*(\\{[\\s\\S]*?\\});`);
  const match = scriptText.match(pattern);
  assert(match, `missing ${variableName} object`);
  return vm.runInNewContext(`(${match[1]})`, Object.create(null));
}

const html = await readFile(htmlPath, 'utf8');
const policy = JSON.parse(await readFile(policyPath, 'utf8'));
const syncScript = await readFile(syncScriptPath, 'utf8');

assert(html.includes('<title>SEIS Universal Language Selector</title>'), 'page title missing');
assert(html.includes('Search every language. Activate only what is safe.'), 'hero message missing');
assert(html.includes('data-search'), 'search input missing');
assert(html.includes('data-filters'), 'filter group missing');
assert(html.includes('data-catalog'), 'catalog grid missing');
assert(html.includes('no auto-run'), 'runtime safety chip missing');
assert(html.includes('External calls</span><strong>0</strong>'), 'external call zero status missing');
assert(!/fetch\s*\(/.test(html), 'selector page must not fetch remote or local data at runtime');
assert(!/https?:\/\//.test(html), 'selector page must not contain external http links');

const tiers = extractObject(html, 'tiers');
for (const requiredTier of ['active', 'ready', 'contract', 'reference', 'blocked']) {
  assert(tiers[requiredTier], `missing tier ${requiredTier}`);
  assert(typeof tiers[requiredTier].label === 'string', `tier ${requiredTier} label missing`);
  assert(typeof tiers[requiredTier].mode === 'string', `tier ${requiredTier} mode missing`);
}

const seedLanguages = extractArray(html, 'seedLanguages');
assert(seedLanguages.length >= 140, 'selector must expose at least 140 local seed languages');
for (const requiredLanguage of ['JavaScript', 'Python', 'Rust', 'C++', 'Cuda', 'Assembly', 'Swift', 'Kotlin', 'ABAP', 'Coq', 'CodeQL', 'Dockerfile']) {
  assert(seedLanguages.includes(requiredLanguage), `selector seed list missing ${requiredLanguage}`);
}

assert(policy.id === 'seis-universal-language-atlas', 'atlas policy id mismatch');
assert(policy.corePolicy.some((line) => line.includes('must not activate every language')), 'atlas policy must block all-language runtime activation');
assert(Array.isArray(policy.activationTiers) && policy.activationTiers.length === 5, 'atlas policy must contain five activation tiers');
assert(Array.isArray(policy.visibleSeedLanguagesFromUserScreenshots) && policy.visibleSeedLanguagesFromUserScreenshots.length >= 100, 'atlas policy seed list too small');

assert(syncScript.includes('DEFAULT_SOURCE_URL'), 'sync script must define upstream source URL');
assert(syncScript.includes('github-linguist/linguist'), 'sync script must mention GitHub Linguist upstream');
assert(syncScript.includes('languageExecution'), 'sync script must preserve language execution boundary');
assert(syncScript.includes('--sync-linguist'), 'sync script must keep remote sync opt-in');

console.log('SEIS universal language selector check passed.');
console.log(`Validated ${seedLanguages.length} selector seed languages and ${policy.activationTiers.length} atlas activation tiers.`);
