import { existsSync } from "node:fs";
import path from "node:path";

/**
 * Resolve the SEIS repository root by walking up from a starting directory
 * until a `.git` directory is found. `SEIS_REPO_ROOT` overrides detection.
 */
export function resolveRepoRoot(startDir = process.cwd()) {
  if (process.env.SEIS_REPO_ROOT) {
    return path.resolve(process.env.SEIS_REPO_ROOT);
  }
  let dir = path.resolve(startDir);
  for (;;) {
    if (existsSync(path.join(dir, ".git"))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      return path.resolve(startDir);
    }
    dir = parent;
  }
}

/**
 * Resolve the portfolio web root (where index.html / translations.json live).
 * `SEIS_WEB_ROOT` overrides detection.
 */
export function resolveWebRoot(repoRoot = resolveRepoRoot()) {
  if (process.env.SEIS_WEB_ROOT) {
    return path.resolve(process.env.SEIS_WEB_ROOT);
  }
  const candidates = [path.join(repoRoot, "apps", "web"), repoRoot];
  for (const candidate of candidates) {
    if (existsSync(path.join(candidate, "translations.json"))) {
      return candidate;
    }
  }
  return candidates[0];
}

/**
 * Resolve a user-supplied path and refuse anything that escapes the root.
 * Returns the absolute path or throws.
 */
export function resolveInside(root, userPath) {
  const abs = path.resolve(root, userPath);
  const rel = path.relative(root, abs);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error(`Path escapes repository root: ${userPath}`);
  }
  return abs;
}
