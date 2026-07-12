import { existsSync, lstatSync, readFileSync, realpathSync } from 'node:fs';

import { assertNoCredentialLikeJsonContent } from './credential-safety.mjs';
import { resolveInside } from './repo.mjs';

export const DEFAULT_SAFE_JSON_MAX_BYTES = 2 * 1024 * 1024;

export function readSafeJsonInside(repoRoot, relativePath, options = {}) {
  const label = options.label || 'JSON file';
  const maxBytes = options.maxBytes ?? DEFAULT_SAFE_JSON_MAX_BYTES;
  const filePath = resolveInside(repoRoot, relativePath);

  if (!existsSync(filePath)) throw new Error(`${label} missing: ${relativePath}`);

  const fileStat = lstatSync(filePath);
  if (fileStat.isSymbolicLink()) throw new Error(`${label} must not be a symbolic link`);
  if (!fileStat.isFile()) throw new Error(`${label} must be a regular file`);
  if (!Number.isSafeInteger(maxBytes) || maxBytes <= 0) {
    throw new TypeError('safe JSON maxBytes must be a positive safe integer');
  }
  if (fileStat.size > maxBytes) {
    throw new Error(`${label} exceeds the ${maxBytes} byte safety limit`);
  }

  const realRoot = realpathSync(repoRoot);
  const realFile = realpathSync(filePath);
  resolveInside(realRoot, realFile);

  const raw = readFileSync(realFile, 'utf8');
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`${label} contains invalid JSON`);
  }
  assertNoCredentialLikeJsonContent(raw, parsed, { label });
  return parsed;
}
