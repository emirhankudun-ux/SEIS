import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const policyPath = path.join(repoRoot, 'content/development/seis-universal-language-atlas.json');
const outputPath = path.join(repoRoot, 'content/development/seis-github-linguist-language-atlas.generated.json');

const DEFAULT_SOURCE_URL = 'https://raw.githubusercontent.com/github-linguist/linguist/main/lib/linguist/languages.yml';

function hasFlag(name) {
  return process.argv.includes(name);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function parseScalar(value) {
  const trimmed = value.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  return trimmed.replace(/^"|"$/g, '');
}

function parseLanguagesYaml(text) {
  const lines = text.split(/\r?\n/);
  const languages = [];
  let current = null;
  let currentListKey = null;

  for (const rawLine of lines) {
    if (!rawLine.trim() || rawLine.trim().startsWith('#') || rawLine.trim() === '---') {
      continue;
    }

    const topLevel = rawLine.match(/^([^\s][^:]*):\s*$/);
    if (topLevel) {
      if (current) languages.push(current);
      current = { name: topLevel[1], type: 'unknown', aliases: [], extensions: [], filenames: [], interpreters: [] };
      currentListKey = null;
      continue;
    }

    if (!current) continue;

    const keyValue = rawLine.match(/^\s{2}([A-Za-z0-9_]+):\s*(.*)$/);
    if (keyValue) {
      const [, key, value] = keyValue;
      if (value === '') {
        currentListKey = key;
        if (!Array.isArray(current[currentListKey])) current[currentListKey] = [];
      } else {
        current[key] = parseScalar(value);
        currentListKey = null;
      }
      continue;
    }

    const listItem = rawLine.match(/^\s+-\s+(.+)$/);
    if (listItem && currentListKey) {
      if (!Array.isArray(current[currentListKey])) current[currentListKey] = [];
      current[currentListKey].push(parseScalar(listItem[1]));
    }
  }

  if (current) languages.push(current);
  return languages.map((language) => ({
    name: language.name,
    type: language.type ?? 'unknown',
    color: language.color ?? null,
    group: language.group ?? null,
    languageId: language.language_id ?? null,
    aceMode: language.ace_mode ?? null,
    tmScope: language.tm_scope ?? null,
    aliases: language.aliases ?? [],
    extensions: language.extensions ?? [],
    filenames: language.filenames ?? [],
    interpreters: language.interpreters ?? [],
  }));
}

function summarizeLanguages(languages) {
  const byType = languages.reduce((acc, language) => {
    acc[language.type] = (acc[language.type] ?? 0) + 1;
    return acc;
  }, {});

  const withExtensions = languages.filter((language) => language.extensions.length > 0).length;
  const withFilenames = languages.filter((language) => language.filenames.length > 0).length;
  const withAliases = languages.filter((language) => language.aliases.length > 0).length;
  const grouped = languages.filter((language) => language.group).length;

  return {
    languageCount: languages.length,
    byType,
    withExtensions,
    withFilenames,
    withAliases,
    grouped,
  };
}

function makeAtlas({ policy, languages, sourceUrl, sourceMode }) {
  const summary = summarizeLanguages(languages);
  const activeCore = new Set(policy.activationTiers.find((tier) => tier.id === 'tier-0-active-core')?.examples ?? []);
  const readyExtension = new Set(policy.activationTiers.find((tier) => tier.id === 'tier-1-ready-extension')?.examples ?? []);
  const contractOnly = new Set(policy.activationTiers.find((tier) => tier.id === 'tier-2-contract-only')?.examples ?? []);
  const referenceOnly = new Set(policy.activationTiers.find((tier) => tier.id === 'tier-3-reference-only')?.examples ?? []);
  const blocked = new Set(policy.activationTiers.find((tier) => tier.id === 'tier-4-blocked-until-explicit-approval')?.examples ?? []);

  const normalized = languages.map((language) => {
    let activationTier = 'tier-3-reference-only';
    if (activeCore.has(language.name)) activationTier = 'tier-0-active-core';
    else if (readyExtension.has(language.name)) activationTier = 'tier-1-ready-extension';
    else if (contractOnly.has(language.name)) activationTier = 'tier-2-contract-only';
    else if (referenceOnly.has(language.name)) activationTier = 'tier-3-reference-only';
    else if (blocked.has(language.name)) activationTier = 'tier-4-blocked-until-explicit-approval';

    return {
      ...language,
      activationTier,
      safeDefaultMode: activationTier === 'tier-0-active-core' ? 'recognize-and-current-runtime' : 'recognize-document-parse-metadata-only',
    };
  });

  return {
    schemaVersion: 1,
    id: 'seis-github-linguist-language-atlas-generated',
    generatedAt: new Date().toISOString(),
    sourceUrl,
    sourceMode,
    policySource: 'content/development/seis-universal-language-atlas.json',
    summary,
    safetyBoundary: {
      languageRecognition: 'allowed',
      languageExecution: 'blocked unless explicit approval, sandbox, dependency plan, tests, and rollback exist',
      dependencyInstallation: 'blocked by default',
      sshDeploymentDatabaseProviderActions: 'blocked by default',
    },
    languages: normalized,
  };
}

async function fetchSourceText(sourceUrl) {
  if (typeof fetch !== 'function') {
    throw new Error('global fetch is unavailable in this Node.js runtime');
  }

  const response = await fetch(sourceUrl, {
    headers: {
      'user-agent': 'seis-language-atlas-sync',
      accept: 'text/plain',
    },
  });

  if (!response.ok) {
    throw new Error(`failed to fetch ${sourceUrl}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

const shouldWrite = hasFlag('--write');
const allowRemote = hasFlag('--sync-linguist');
const sourceUrlArgIndex = process.argv.indexOf('--source-url');
const sourceUrl = sourceUrlArgIndex >= 0 ? process.argv[sourceUrlArgIndex + 1] : DEFAULT_SOURCE_URL;

const policy = JSON.parse(await readFile(policyPath, 'utf8'));
assert(policy.id === 'seis-universal-language-atlas', 'policy id mismatch');
assert(policy.officialSource?.syncScript === 'scripts/sync-seis-github-linguist-language-atlas.mjs', 'sync script path mismatch');
assert(Array.isArray(policy.visibleSeedLanguagesFromUserScreenshots), 'visible seed languages must exist');
assert(policy.visibleSeedLanguagesFromUserScreenshots.length >= 100, 'visible seed language list must contain at least 100 supplied/screenshot seed languages');

let sourceMode = 'policy-visible-seed-offline';
let languages = policy.visibleSeedLanguagesFromUserScreenshots.map((name) => ({
  name,
  type: 'seed-reference',
  color: null,
  group: null,
  languageId: null,
  aceMode: null,
  tmScope: null,
  aliases: [],
  extensions: [],
  filenames: [],
  interpreters: [],
}));

if (allowRemote) {
  const sourceText = await fetchSourceText(sourceUrl);
  languages = parseLanguagesYaml(sourceText);
  sourceMode = 'github-linguist-remote-sync';
  assert(languages.length > 500, 'GitHub Linguist sync should return more than 500 language records');
}

const atlas = makeAtlas({ policy, languages, sourceUrl, sourceMode });
assert(atlas.summary.languageCount >= 100, 'language atlas must contain at least 100 language records');
assert(atlas.languages.some((language) => language.name === 'JavaScript'), 'atlas must include JavaScript');
assert(atlas.languages.some((language) => language.name === 'Python'), 'atlas must include Python');
assert(atlas.languages.some((language) => language.name === 'Rust'), 'atlas must include Rust');
assert(atlas.languages.some((language) => language.name === 'C++'), 'atlas must include C++');
assert(atlas.safetyBoundary.languageExecution.includes('blocked'), 'language execution must be blocked by default');

if (shouldWrite) {
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(atlas, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${path.relative(repoRoot, outputPath)} with ${atlas.summary.languageCount} language records (${sourceMode}).`);
} else {
  console.log(`SEIS universal language atlas check passed with ${atlas.summary.languageCount} language records (${sourceMode}).`);
}
