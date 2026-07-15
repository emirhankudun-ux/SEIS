#!/usr/bin/env node

import {
  APP_PLUGIN_RELEASE_INITIAL_LABEL,
  APP_PLUGIN_RELEASE_MAX_LABEL,
  APP_PLUGIN_RELEASE_SEED_LABEL,
  compareReleases,
  formatMicroLabel,
  nextLargeCodeRelease,
  nextMajorRelease,
  parseReleaseLabel,
} from "./seis-core-plugin-release-policy.mjs";

const failures = [];

check("seed parses as the first micro unit", () => {
  const release = parseReleaseLabel(APP_PLUGIN_RELEASE_SEED_LABEL);
  ensure(release.microUnits === 1, `expected seed micro unit 1, received ${release.microUnits}`);
  ensure(release.semver === "0.0.1", `expected seed semver 0.0.1, received ${release.semver}`);
});

check("initial baseline is a canonical micro release", () => {
  const release = parseReleaseLabel(APP_PLUGIN_RELEASE_INITIAL_LABEL);
  ensure(release.label === APP_PLUGIN_RELEASE_INITIAL_LABEL, "initial label is not canonical");
  ensure(release.microUnits === 10, `expected initial micro unit 10, received ${release.microUnits}`);
  ensure(release.semver === "0.0.10", `expected initial semver 0.0.10, received ${release.semver}`);
});

check("large-code changes advance one micro unit", () => {
  expectNextLarge(APP_PLUGIN_RELEASE_SEED_LABEL, "0.000000002");
  expectNextLarge(APP_PLUGIN_RELEASE_INITIAL_LABEL, "0.000000011");
  expectNextLarge("0.999999998", "0.999999999");
});

check("micro ladder crosses into major zero revision", () => {
  expectNextLarge("0.999999999", "1.0000");
  ensure(compareReleases("0.999999999", "1.0000") < 0, "micro-to-major transition is not monotonic");
});

check("major and revision ladder advance one slot", () => {
  expectNextMajor(APP_PLUGIN_RELEASE_SEED_LABEL, "1.0000");
  expectNextMajor("1.0000", "2.0000");
  expectNextLarge("1.0000", "1.0001");
  expectNextMajor("44.9999", APP_PLUGIN_RELEASE_MAX_LABEL);
  expectThrows(() => nextLargeCodeRelease("44.9999"), /exhausted its code-revision slots/);
});

check("maximum release blocks every automatic promotion", () => {
  expectThrows(() => nextLargeCodeRelease(APP_PLUGIN_RELEASE_MAX_LABEL), /stops at 45\.0000/);
  expectThrows(() => nextMajorRelease(APP_PLUGIN_RELEASE_MAX_LABEL), /stops at 45\.0000/);
});

check("invalid and bulk-like labels are rejected", () => {
  for (const label of ["0.000000000", "0.0000000001", "1.000", "46.0000", "45.00000", "1.0001.0000"]) {
    expectThrows(() => parseReleaseLabel(label), /Release label|Micro release|Release major/);
  }
  ensure(formatMicroLabel(10) === APP_PLUGIN_RELEASE_INITIAL_LABEL, "micro formatter does not preserve the initial label");
});

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, id: "seis-core-plugin-release-policy", failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  id: "seis-core-plugin-release-policy",
  seed: APP_PLUGIN_RELEASE_SEED_LABEL,
  initial: APP_PLUGIN_RELEASE_INITIAL_LABEL,
  maximum: APP_PLUGIN_RELEASE_MAX_LABEL,
  checks: 7,
  transitions: {
    microStep: "0.00000001 -> 0.000000011",
    annualMajorStep: "0.00000001 -> 1.0000",
    postMajorCodeStep: "1.0000 -> 1.0001",
    ceiling: "45.0000",
  },
}, null, 2));

function check(name, callback) {
  try {
    callback();
  } catch (error) {
    failures.push({ name, error: error.message });
  }
}

function expectNextLarge(current, expected) {
  const actual = nextLargeCodeRelease(current).label;
  ensure(actual === expected, `expected ${current} -> ${expected}, received ${actual}`);
}

function expectNextMajor(current, expected) {
  const actual = nextMajorRelease(current).label;
  ensure(actual === expected, `expected annual ${current} -> ${expected}, received ${actual}`);
}

function expectThrows(callback, pattern) {
  let thrown = false;
  try {
    callback();
  } catch (error) {
    thrown = true;
    ensure(pattern.test(error.message), `unexpected error: ${error.message}`);
  }
  ensure(thrown, "expected the operation to throw");
}

function ensure(condition, message) {
  if (!condition) throw new Error(message);
}
