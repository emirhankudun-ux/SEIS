/**
 * Canonical release metadata for the public SEIS plugin distribution.
 *
 * A structural marketplace change must move this version forward and record the
 * predecessor here. Generated checks compare these values, so a large update
 * cannot silently keep the previous release version.
 */

export const PREVIOUS_SEIS_PUBLIC_RELEASE_VERSION = "0.4.0+codex.20260722";
export const CURRENT_SEIS_PUBLIC_RELEASE_VERSION = "0.5.0+codex.20260722";
export const SEIS_PUBLIC_RELEASE_CHANGE_KIND = "major-autopilot-evidence-governance";
export const SEIS_PUBLIC_RELEASE_CHANGE_ID = "truthful-foreground-autopilot-evidence-for-ten-general-plugins";

export function parseSemver(value) {
  const match = String(value || "").match(/^(\d+)\.(\d+)\.(\d+)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/);
  if (!match) throw new Error("SEIS public release version is not valid semver: " + String(value));
  return match.slice(1, 4).map((part) => Number(part));
}

export function compareSemver(left, right) {
  const leftParts = parseSemver(left);
  const rightParts = parseSemver(right);
  for (let index = 0; index < leftParts.length; index += 1) {
    if (leftParts[index] > rightParts[index]) return 1;
    if (leftParts[index] < rightParts[index]) return -1;
  }
  return 0;
}

export function assertStructuralReleaseVersion() {
  if (compareSemver(CURRENT_SEIS_PUBLIC_RELEASE_VERSION, PREVIOUS_SEIS_PUBLIC_RELEASE_VERSION) <= 0) {
    throw new Error("SEIS public structural distribution release must increase its semver");
  }
}
