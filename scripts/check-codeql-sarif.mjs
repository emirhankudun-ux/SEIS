import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const target = process.argv[2];
const failOnFindings = process.env.SEIS_CODEQL_FAIL_ON_FINDINGS === '1';

const failures = [];

function collectSarifFiles(path) {
  if (!existsSync(path)) {
    failures.push(`missing SARIF path: ${path}`);
    return [];
  }

  const stats = statSync(path);
  if (stats.isFile()) {
    return path.endsWith('.sarif') || path.endsWith('.sarif.json') ? [path] : [];
  }

  const files = [];
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    const next = join(path, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectSarifFiles(next));
    } else if (
      entry.isFile() &&
      (entry.name.endsWith('.sarif') || entry.name.endsWith('.sarif.json'))
    ) {
      files.push(next);
    }
  }
  return files;
}

function formatLocation(result) {
  const location = result.locations?.[0]?.physicalLocation;
  const uri = location?.artifactLocation?.uri;
  const line = location?.region?.startLine;
  return uri ? `${uri}${line ? `:${line}` : ''}` : 'unknown location';
}

if (!target) {
  failures.push('usage: node scripts/check-codeql-sarif.mjs <sarif-file-or-directory>');
}

const sarifFiles = target ? collectSarifFiles(resolve(target)) : [];
if (target && sarifFiles.length === 0) {
  failures.push(`no SARIF files found under ${target}`);
}

const findings = [];

for (const file of sarifFiles) {
  let sarif;
  try {
    sarif = JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    failures.push(`invalid SARIF JSON in ${file}: ${error.message}`);
    continue;
  }

  if (!Array.isArray(sarif.runs)) {
    failures.push(`SARIF file has no runs array: ${file}`);
    continue;
  }

  for (const run of sarif.runs) {
    for (const result of run.results || []) {
      findings.push({
        file,
        ruleId: result.ruleId || result.rule?.id || 'unknown-rule',
        level: result.level || 'warning',
        message: result.message?.text || 'No message provided.',
        location: formatLocation(result),
      });
    }
  }
}

if (failures.length > 0) {
  console.error('CodeQL SARIF validation failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`CodeQL SARIF validation passed for ${sarifFiles.length} file(s).`);
console.log(`CodeQL SARIF findings: ${findings.length}`);

for (const finding of findings.slice(0, 20)) {
  console.log(`- [${finding.level}] ${finding.ruleId} at ${finding.location}: ${finding.message}`);
}

if (findings.length > 20) {
  console.log(`... ${findings.length - 20} additional finding(s) omitted from log output.`);
}

if (findings.length > 0 && failOnFindings) {
  console.error('CodeQL findings exist and SEIS_CODEQL_FAIL_ON_FINDINGS=1.');
  process.exit(1);
}
