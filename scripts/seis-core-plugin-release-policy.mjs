export const APP_PLUGIN_RELEASE_TRAIN_PATH = "content/development/seis-core-plugin-release-train.json";
export const APP_PLUGIN_RELEASE_SEED_LABEL = "0.000000001";
export const APP_PLUGIN_RELEASE_INITIAL_LABEL = "0.00000001";
export const APP_PLUGIN_RELEASE_MAX_LABEL = "45.0000";
export const APP_PLUGIN_RELEASE_MAX_MAJOR = 45;
export const APP_PLUGIN_RELEASE_MAX_REVISION = 9999;
export const APP_PLUGIN_RELEASE_MAX_MICRO_UNITS = 999999999;
export const APP_PLUGIN_RELEASE_KINDS = new Set(["bootstrap", "initial", "major", "annual", "large-code-change"]);

const STANDARD_LABEL = /^(\d+)\.(\d{4})$/;
const MICRO_LABEL = /^0\.(\d{1,9})$/;

export function parseReleaseLabel(input) {
  const label = String(input || "").trim();
  const microMatch = MICRO_LABEL.exec(label);
  if (microMatch) {
    const microUnits = Number(microMatch[1].padEnd(9, "0"));
    if (!Number.isSafeInteger(microUnits) || microUnits < 1 || microUnits > APP_PLUGIN_RELEASE_MAX_MICRO_UNITS) {
      throw new Error(`Micro release must be between ${APP_PLUGIN_RELEASE_SEED_LABEL} and 0.999999999; received ${label}.`);
    }
    const canonicalLabel = formatMicroLabel(microUnits);
    return {
      inputLabel: label,
      label: canonicalLabel,
      legacyLabel: canonicalLabel === label ? null : label,
      semver: `0.0.${microUnits}`,
      major: 0,
      minor: 0,
      patch: microUnits,
      revision: 0,
      microUnits,
      isSeed: microUnits === 1,
      isMicro: true,
    };
  }

  const standardMatch = STANDARD_LABEL.exec(label);
  if (!standardMatch) {
    throw new Error(`Release label must be ${APP_PLUGIN_RELEASE_SEED_LABEL}, ${APP_PLUGIN_RELEASE_INITIAL_LABEL}, or <major>.<revision-padded-4>; received ${label}.`);
  }

  const major = Number(standardMatch[1]);
  const revision = Number(standardMatch[2]);
  if (!Number.isSafeInteger(major) || major < 1 || major > APP_PLUGIN_RELEASE_MAX_MAJOR) {
    throw new Error(`Release major must be between 1 and ${APP_PLUGIN_RELEASE_MAX_MAJOR}; received ${label}.`);
  }
  if (!Number.isSafeInteger(revision) || revision < 0 || revision > APP_PLUGIN_RELEASE_MAX_REVISION) {
    throw new Error(`Release revision must be between 0000 and 9999; received ${label}.`);
  }

  const canonicalLabel = `${major}.${String(revision).padStart(4, "0")}`;
  return {
    inputLabel: label,
    label: canonicalLabel,
    legacyLabel: null,
    semver: `${major}.0.${revision}`,
    major,
    minor: 0,
    patch: revision,
    revision,
    microUnits: null,
    isSeed: false,
    isMicro: false,
  };
}

export function formatMicroLabel(microUnits) {
  if (!Number.isSafeInteger(microUnits) || microUnits < 1 || microUnits > APP_PLUGIN_RELEASE_MAX_MICRO_UNITS) {
    throw new Error(`Micro release units must be between 1 and ${APP_PLUGIN_RELEASE_MAX_MICRO_UNITS}.`);
  }
  return `0.${String(microUnits).padStart(9, "0")}`.replace(/0+$/, "");
}

export function compareReleases(left, right) {
  const a = typeof left === "string" ? parseReleaseLabel(left) : left;
  const b = typeof right === "string" ? parseReleaseLabel(right) : right;
  const aRank = releaseRank(a);
  const bRank = releaseRank(b);
  return aRank < bRank ? -1 : aRank > bRank ? 1 : 0;
}

export function nextMajorRelease(current) {
  const parsed = typeof current === "string" ? parseReleaseLabel(current) : current;
  if (parsed.isMicro) return parseReleaseLabel("1.0000");
  if (parsed.major >= APP_PLUGIN_RELEASE_MAX_MAJOR) {
    throw new Error(`The app plugin release train stops at ${APP_PLUGIN_RELEASE_MAX_LABEL}.`);
  }
  return parseReleaseLabel(`${parsed.major + 1}.0000`);
}

export function nextLargeCodeRelease(current) {
  const parsed = typeof current === "string" ? parseReleaseLabel(current) : current;
  if (parsed.isMicro) {
    if (parsed.microUnits >= APP_PLUGIN_RELEASE_MAX_MICRO_UNITS) return parseReleaseLabel("1.0000");
    return parseReleaseLabel(formatMicroLabel(parsed.microUnits + 1));
  }
  if (parsed.major === APP_PLUGIN_RELEASE_MAX_MAJOR) {
    throw new Error(`The app plugin release train stops at ${APP_PLUGIN_RELEASE_MAX_LABEL}.`);
  }
  if (parsed.revision >= APP_PLUGIN_RELEASE_MAX_REVISION) {
    throw new Error(`Release ${parsed.label} has exhausted its code-revision slots; promote the next major release.`);
  }
  return parseReleaseLabel(`${parsed.major}.${String(parsed.revision + 1).padStart(4, "0")}`);
}

export function assertReleaseKind(kind) {
  if (!APP_PLUGIN_RELEASE_KINDS.has(kind)) {
    throw new Error(`Unsupported app plugin release kind: ${kind}.`);
  }
  return kind;
}

export function releaseRecord(parsed, kind, metadata = {}) {
  assertReleaseKind(kind);
  return {
    label: parsed.label,
    semver: parsed.semver,
    major: parsed.major,
    minor: parsed.minor,
    patch: parsed.patch,
    revision: parsed.revision,
    microUnits: parsed.microUnits ?? null,
    kind,
    ...metadata,
  };
}

function releaseRank(parsed) {
  if (parsed.isMicro) return BigInt(parsed.microUnits);
  const majorOffset = BigInt(APP_PLUGIN_RELEASE_MAX_MICRO_UNITS + 1);
  const majorWidth = BigInt(APP_PLUGIN_RELEASE_MAX_REVISION + 1);
  return majorOffset + (BigInt(parsed.major - 1) * majorWidth) + BigInt(parsed.revision);
}
