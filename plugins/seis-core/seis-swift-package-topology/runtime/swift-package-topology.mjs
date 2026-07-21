import fs from "node:fs";
import path from "node:path";

export const SWIFT_PACKAGE_TOPOLOGY_ID = "seis-swift-package-topology";
export const SWIFT_PACKAGE_TOPOLOGY_SCOPE = Object.freeze({
  manifestPath: "packages/seis_platform_swift/Package.swift",
});
export const SWIFT_PACKAGE_TOPOLOGY_LIMITS = Object.freeze({
  maxManifestBytes: 128 * 1024,
  maxPlatforms: 8,
  maxProducts: 32,
  maxTargets: 64,
  maxDependencies: 128,
  maxResources: 128,
});

const SUPPORTED_PLATFORM_NAMES = new Set(["macOS", "iOS"]);
const SUPPORTED_PRODUCT_KINDS = new Set(["library", "executable"]);
const TARGET_KIND_MAP = Object.freeze({
  target: "target",
  executableTarget: "executable-target",
  testTarget: "test-target",
});
const SAFE_IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;
const SAFE_VERSION = /^v[0-9]+(?:_[0-9]+)*$/;
const SAFE_RESOURCE_PATH = /^(?:[A-Za-z0-9_.-]+\/)*[A-Za-z0-9_.-]+$/;
const MACHINE_PATH_PATTERN = /(?:\/Users\/|\/home\/|[A-Za-z]:\\|[A-Za-z]:\/(?!\/))/g;
const CREDENTIAL_ASSIGNMENT_PATTERN = /\b(?:api[_-]?key|access[_-]?token|auth(?:entication)?[_-]?token|password|secret)\b\s*[:=]\s*["'][^"'\r\n]+["']/gi;

export function auditSwiftPackageTopology(rootPath) {
  const findings = [];
  const counters = {
    boundedManifestByteCount: 0,
    machineSpecificPathMarkerCount: 0,
    credentialAssignmentFindingCount: 0,
  };
  const root = resolveRoot(rootPath);
  let topology = emptyTopology();
  let manifestReadable = false;

  if (!root) {
    findings.push(error("invalid-repository-root"));
  } else if (!isSafeDirectory(root)) {
    findings.push(error("repository-root-unsafe"));
  } else {
    const manifestPath = resolveBoundedPath(root, SWIFT_PACKAGE_TOPOLOGY_SCOPE.manifestPath);
    if (!manifestPath) {
      findings.push(error("fixed-manifest-path-escaped"));
    } else {
      const manifest = readBoundedManifest(manifestPath);
      if (!manifest.ok) {
        findings.push(error(manifest.code));
      } else {
        manifestReadable = true;
        counters.boundedManifestByteCount = manifest.byteCount;
        counters.machineSpecificPathMarkerCount = countMatches(manifest.source, MACHINE_PATH_PATTERN);
        counters.credentialAssignmentFindingCount = countMatches(manifest.source, CREDENTIAL_ASSIGNMENT_PATTERN);
        if (counters.machineSpecificPathMarkerCount > 0) {
          findings.push(attention("machine-path-marker-redacted", counters.machineSpecificPathMarkerCount));
        }
        if (counters.credentialAssignmentFindingCount > 0) {
          findings.push(error("credential-assignment-marker-found", counters.credentialAssignmentFindingCount));
        }
        const parsed = parseManifestTopology(manifest.source);
        for (const code of parsed.errors) findings.push(error(code));
        if (parsed.errors.length === 0 && counters.credentialAssignmentFindingCount === 0) {
          topology = parsed.topology;
        }
      }
    }
  }

  const errorCount = findings.filter((finding) => finding.severity === "error").length;
  const attentionCount = findings.filter((finding) => finding.severity === "attention").length;
  return {
    state: errorCount > 0 || attentionCount > 0 ? "attention" : "ready",
    ok: errorCount === 0,
    mode: "swift-package-manifest-topology-static-read-only",
    classification: "bounded-static-swift-package-manifest-topology",
    plugin: SWIFT_PACKAGE_TOPOLOGY_ID,
    summary: {
      manifestRelativePath: SWIFT_PACKAGE_TOPOLOGY_SCOPE.manifestPath,
      manifestReadable,
      boundedManifestByteCount: counters.boundedManifestByteCount,
      topologyAvailable: manifestReadable && errorCount === 0,
      declaredPlatformCount: topology.platforms.length,
      productCount: topology.products.length,
      targetCount: topology.targets.length,
      targetDependencyEdgeCount: topology.targetDependencies.length,
      testTargetDependencyCount: topology.testTargetDependencies.length,
      executableResourceCount: topology.executableResources.length,
    },
    topology,
    findings,
    errorCount,
    warningCount: attentionCount,
    limits: SWIFT_PACKAGE_TOPOLOGY_LIMITS,
    permissions: {
      read: [
        "one fixed checked-in Swift Package manifest",
        "bounded derived package topology metadata",
      ],
      write: [],
      network: [],
      secrets: [],
    },
    outputBoundary: {
      rawManifestReturned: false,
      rawMatchedValuesReturned: false,
      absolutePathsReturned: false,
      machineSpecificPathsReturned: false,
    },
    safety: {
      regularFileRequired: true,
      symlinkRefusal: true,
      machineSpecificPathMarkerCount: counters.machineSpecificPathMarkerCount,
      credentialAssignmentFindingCount: counters.credentialAssignmentFindingCount,
      resolvesSwiftPackages: false,
      compilesSwift: false,
      runsSwiftTests: false,
      startsNativeApplication: false,
      installsPlugins: false,
      publicReleaseAllowed: false,
    },
    limitations: [
      "This audit reads one bounded static Swift Package manifest and does not resolve, describe, compile, test, or run SwiftPM.",
      "Declared relationships do not prove package graph validity, dependency availability, compiler diagnostics, test success, runtime behavior, signing, installation, deployment, or release readiness.",
      "Unsupported or malformed syntax is reported as attention without guessing topology or returning raw manifest content.",
      "The audit never follows symlinks, writes files, uses a network, reads credentials, or calls providers.",
    ],
  };
}

function parseManifestTopology(source) {
  const errors = [];
  const platforms = parsePlatforms(source, errors);
  const products = parseProducts(source, errors);
  const targets = parseTargets(source, errors);
  if (errors.length > 0) return { errors: unique(errors), topology: emptyTopology() };

  const topology = {
    platforms: sortRecords(platforms, ["name", "version"]),
    products: sortRecords(products, ["name", "kind"]),
    targets: sortRecords(targets.map((target) => ({ name: target.name, kind: target.kind })), ["name", "kind"]),
    targetDependencies: sortRecords(
      targets
        .filter((target) => target.kind !== "test-target")
        .flatMap((target) => target.dependencies.map((dependency) => ({ from: target.name, to: dependency }))),
      ["from", "to"],
    ),
    testTargetDependencies: sortRecords(
      targets
        .filter((target) => target.kind === "test-target")
        .flatMap((target) => target.dependencies.map((dependency) => ({ from: target.name, to: dependency }))),
      ["from", "to"],
    ),
    executableResources: sortRecords(
      targets
        .filter((target) => target.kind === "executable-target")
        .flatMap((target) => target.resources.map((resource) => ({ target: target.name, resource }))),
      ["target", "resource"],
    ),
  };
  if (topology.platforms.length > SWIFT_PACKAGE_TOPOLOGY_LIMITS.maxPlatforms) errors.push("platform-count-limit-exceeded");
  if (topology.products.length > SWIFT_PACKAGE_TOPOLOGY_LIMITS.maxProducts) errors.push("product-count-limit-exceeded");
  if (topology.targets.length > SWIFT_PACKAGE_TOPOLOGY_LIMITS.maxTargets) errors.push("target-count-limit-exceeded");
  if (topology.targetDependencies.length + topology.testTargetDependencies.length > SWIFT_PACKAGE_TOPOLOGY_LIMITS.maxDependencies) errors.push("dependency-count-limit-exceeded");
  if (topology.executableResources.length > SWIFT_PACKAGE_TOPOLOGY_LIMITS.maxResources) errors.push("resource-count-limit-exceeded");
  return errors.length > 0 ? { errors: unique(errors), topology: emptyTopology() } : { errors: [], topology };
}

function parsePlatforms(source, errors) {
  const section = findNamedArray(source, "platforms");
  if (!section.ok) {
    errors.push(section.code);
    return [];
  }
  const calls = parseCallList(section.value);
  if (!calls.ok) {
    errors.push("malformed-platform-declaration");
    return [];
  }
  const platforms = [];
  for (const call of calls.calls) {
    if (!SUPPORTED_PLATFORM_NAMES.has(call.name)) {
      errors.push("unsupported-platform-declaration");
      continue;
    }
    const version = /^\s*\.([A-Za-z][A-Za-z0-9_]*)\s*$/.exec(call.arguments)?.[1] || null;
    if (!version || !SAFE_VERSION.test(version)) {
      errors.push("malformed-platform-declaration");
      continue;
    }
    platforms.push({ name: call.name, version });
  }
  if (platforms.length === 0 || new Set(platforms.map((platform) => platform.name)).size !== platforms.length) {
    errors.push("invalid-platform-declarations");
  }
  return platforms;
}

function parseProducts(source, errors) {
  const section = findNamedArray(source, "products");
  if (!section.ok) {
    errors.push(section.code);
    return [];
  }
  const calls = parseCallList(section.value);
  if (!calls.ok) {
    errors.push("malformed-product-declaration");
    return [];
  }
  const products = [];
  for (const call of calls.calls) {
    if (!SUPPORTED_PRODUCT_KINDS.has(call.name)) {
      errors.push("unsupported-product-declaration");
      continue;
    }
    const parameters = parseNamedArguments(call.arguments);
    if (!parameters.ok || !hasOnlyKeys(parameters.values, ["name", "targets"])) {
      errors.push("malformed-product-declaration");
      continue;
    }
    const name = parseIdentifierString(parameters.values.name);
    const targets = parseIdentifierArray(parameters.values.targets);
    if (!name || !targets.ok || targets.values.length === 0) {
      errors.push("malformed-product-declaration");
      continue;
    }
    products.push({ kind: call.name, name, targets: [...targets.values].sort() });
  }
  if (products.length === 0 || new Set(products.map((product) => product.name)).size !== products.length) {
    errors.push("invalid-product-declarations");
  }
  return products;
}

function parseTargets(source, errors) {
  const section = findNamedArray(source, "targets");
  if (!section.ok) {
    errors.push(section.code);
    return [];
  }
  const calls = parseCallList(section.value);
  if (!calls.ok) {
    errors.push("malformed-target-declaration");
    return [];
  }
  const targets = [];
  for (const call of calls.calls) {
    const kind = TARGET_KIND_MAP[call.name];
    if (!kind) {
      errors.push("unsupported-target-declaration");
      continue;
    }
    const parameters = parseNamedArguments(call.arguments);
    const permittedKeys = kind === "executable-target" ? ["name", "dependencies", "resources"] : ["name", "dependencies"];
    if (!parameters.ok || !hasOnlyKeys(parameters.values, permittedKeys)) {
      errors.push("malformed-target-declaration");
      continue;
    }
    const name = parseIdentifierString(parameters.values.name);
    const dependencies = parameters.values.dependencies === undefined
      ? { ok: true, values: [] }
      : parseIdentifierArray(parameters.values.dependencies);
    if (!name || !dependencies.ok) {
      errors.push(parameters.values.dependencies === undefined ? "malformed-target-declaration" : "unsupported-target-dependency-syntax");
      continue;
    }
    const resources = kind === "executable-target"
      ? parseResourceArray(parameters.values.resources)
      : { ok: parameters.values.resources === undefined, values: [] };
    if (!resources.ok) {
      errors.push("malformed-resource-declaration");
      continue;
    }
    targets.push({ kind, name, dependencies: [...dependencies.values].sort(), resources: [...resources.values].sort() });
  }
  if (targets.length === 0 || new Set(targets.map((target) => target.name)).size !== targets.length) {
    errors.push("invalid-target-declarations");
  }
  return targets;
}

function parseResourceArray(value) {
  if (value === undefined) return { ok: true, values: [] };
  const array = unwrapArray(value);
  if (!array.ok) return { ok: false, values: [] };
  const calls = parseCallList(array.value);
  if (!calls.ok) return { ok: false, values: [] };
  const resources = [];
  for (const call of calls.calls) {
    if (call.name !== "copy") return { ok: false, values: [] };
    const resource = parseResourceString(call.arguments);
    if (!resource) return { ok: false, values: [] };
    resources.push(resource);
  }
  return { ok: true, values: resources };
}

function findNamedArray(source, name) {
  const packageOpen = findPackageOpen(source);
  const index = packageOpen < 0 ? -1 : findOuterPackageLabel(source, packageOpen, name);
  if (index < 0) return { ok: false, code: `${name}-section-missing` };
  let cursor = skipWhitespaceAndComments(source, index + name.length);
  if (source[cursor] !== ":") return { ok: false, code: `${name}-section-malformed` };
  cursor = skipWhitespaceAndComments(source, cursor + 1);
  if (source[cursor] !== "[") return { ok: false, code: `${name}-section-malformed` };
  const end = findMatching(source, cursor, "[", "]");
  if (end < 0) return { ok: false, code: `${name}-section-malformed` };
  return { ok: true, value: source.slice(cursor + 1, end) };
}

function findPackageOpen(source) {
  for (let index = 0; index <= source.length - "Package".length; index += 1) {
    if (source.slice(index, index + "Package".length) !== "Package") continue;
    const before = source[index - 1] || "";
    const after = source[index + "Package".length] || "";
    if (isIdentifierCharacter(before) || isIdentifierCharacter(after)) continue;
    const cursor = skipWhitespaceAndComments(source, index + "Package".length);
    if (source[cursor] === "(") return cursor;
  }
  return -1;
}

function findOuterPackageLabel(source, packageOpen, token) {
  let parentheses = 1;
  let brackets = 0;
  let braces = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (let index = packageOpen + 1; index <= source.length - token.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];
    if (lineComment) {
      if (character === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (character === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }
    if (character === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === "(") {
      parentheses += 1;
      continue;
    }
    if (character === ")") {
      parentheses -= 1;
      if (parentheses <= 0) return -1;
      continue;
    }
    if (character === "[") {
      brackets += 1;
      continue;
    }
    if (character === "]") {
      brackets -= 1;
      continue;
    }
    if (character === "{") {
      braces += 1;
      continue;
    }
    if (character === "}") {
      braces -= 1;
      continue;
    }
    if (parentheses !== 1 || brackets !== 0 || braces !== 0) continue;
    if (source.slice(index, index + token.length) !== token) continue;
    const before = source[index - 1] || "";
    const after = source[index + token.length] || "";
    if (isIdentifierCharacter(before) || isIdentifierCharacter(after)) continue;
    const cursor = skipWhitespaceAndComments(source, index + token.length);
    if (source[cursor] === ":") return index;
  }
  return -1;
}

function parseCallList(value) {
  const calls = [];
  let cursor = 0;
  while (true) {
    cursor = skipWhitespaceAndComments(value, cursor);
    if (cursor >= value.length) return { ok: true, calls };
    if (value[cursor] !== ".") return { ok: false, calls: [] };
    const nameStart = cursor + 1;
    let nameEnd = nameStart;
    while (isIdentifierCharacter(value[nameEnd] || "")) nameEnd += 1;
    const name = value.slice(nameStart, nameEnd);
    if (!name) return { ok: false, calls: [] };
    cursor = skipWhitespaceAndComments(value, nameEnd);
    if (value[cursor] !== "(") return { ok: false, calls: [] };
    const end = findMatching(value, cursor, "(", ")");
    if (end < 0) return { ok: false, calls: [] };
    calls.push({ name, arguments: value.slice(cursor + 1, end) });
    cursor = skipWhitespaceAndComments(value, end + 1);
    if (cursor >= value.length) return { ok: true, calls };
    if (value[cursor] !== ",") return { ok: false, calls: [] };
    cursor += 1;
  }
}

function parseNamedArguments(value) {
  const segments = splitTopLevel(value);
  if (!segments.ok) return { ok: false, values: {} };
  const values = {};
  for (const segment of segments.values) {
    if (!segment.trim()) continue;
    const match = /^\s*([A-Za-z][A-Za-z0-9_]*)\s*:\s*([\s\S]+)$/.exec(segment);
    if (!match || Object.hasOwn(values, match[1])) return { ok: false, values: {} };
    values[match[1]] = match[2].trim();
  }
  return { ok: true, values };
}

function parseIdentifierString(value) {
  const match = /^\s*"([A-Za-z_][A-Za-z0-9_]*)"\s*$/.exec(value || "");
  return match && SAFE_IDENTIFIER.test(match[1]) ? match[1] : null;
}

function parseIdentifierArray(value) {
  const array = unwrapArray(value);
  if (!array.ok) return { ok: false, values: [] };
  const parts = splitTopLevel(array.value);
  if (!parts.ok) return { ok: false, values: [] };
  const values = [];
  for (const part of parts.values) {
    if (!part.trim()) continue;
    const parsed = parseIdentifierString(part);
    if (!parsed) return { ok: false, values: [] };
    values.push(parsed);
  }
  return { ok: true, values };
}

function parseResourceString(value) {
  const match = /^\s*"([A-Za-z0-9_.\/-]+)"\s*$/.exec(value || "");
  if (!match || !SAFE_RESOURCE_PATH.test(match[1]) || match[1].startsWith(".") || match[1].includes("..") || match[1].startsWith("/")) return null;
  return match[1];
}

function unwrapArray(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) return { ok: false, value: "" };
  const end = findMatching(trimmed, 0, "[", "]");
  return end === trimmed.length - 1 ? { ok: true, value: trimmed.slice(1, -1) } : { ok: false, value: "" };
}

function splitTopLevel(value) {
  const values = [];
  let start = 0;
  let parentheses = 0;
  let brackets = 0;
  let braces = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    const next = value[index + 1];
    if (lineComment) {
      if (character === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (character === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }
    if (character === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === "(") parentheses += 1;
    else if (character === ")") parentheses -= 1;
    else if (character === "[") brackets += 1;
    else if (character === "]") brackets -= 1;
    else if (character === "{") braces += 1;
    else if (character === "}") braces -= 1;
    else if (character === "," && parentheses === 0 && brackets === 0 && braces === 0) {
      values.push(value.slice(start, index));
      start = index + 1;
    }
    if (parentheses < 0 || brackets < 0 || braces < 0) return { ok: false, values: [] };
  }
  if (quote || blockComment || parentheses !== 0 || brackets !== 0 || braces !== 0) return { ok: false, values: [] };
  values.push(value.slice(start));
  return { ok: true, values };
}

function findMatching(value, start, open, close) {
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (let index = start; index < value.length; index += 1) {
    const character = value[index];
    const next = value[index + 1];
    if (lineComment) {
      if (character === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (character === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }
    if (character === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === open) depth += 1;
    else if (character === close) {
      depth -= 1;
      if (depth === 0) return index;
      if (depth < 0) return -1;
    }
  }
  return -1;
}

function skipWhitespaceAndComments(value, start) {
  let cursor = start;
  while (cursor < value.length) {
    if (/\s/.test(value[cursor])) {
      cursor += 1;
      continue;
    }
    if (value[cursor] === "/" && value[cursor + 1] === "/") {
      cursor += 2;
      while (cursor < value.length && value[cursor] !== "\n") cursor += 1;
      continue;
    }
    if (value[cursor] === "/" && value[cursor + 1] === "*") {
      const end = value.indexOf("*/", cursor + 2);
      return end < 0 ? value.length : skipWhitespaceAndComments(value, end + 2);
    }
    break;
  }
  return cursor;
}

function resolveRoot(rootPath) {
  return typeof rootPath === "string" && rootPath.trim() ? path.resolve(rootPath) : null;
}

function isSafeDirectory(directory) {
  try {
    const stat = fs.lstatSync(directory);
    return stat.isDirectory() && !stat.isSymbolicLink();
  } catch {
    return false;
  }
}

function resolveBoundedPath(root, relativePath) {
  const resolved = path.resolve(root, relativePath);
  return resolved.startsWith(root + path.sep) ? resolved : null;
}

function readBoundedManifest(manifestPath) {
  try {
    const stat = fs.lstatSync(manifestPath);
    if (stat.isSymbolicLink() || !stat.isFile()) return { ok: false, code: "manifest-not-regular-file" };
    if (stat.size > SWIFT_PACKAGE_TOPOLOGY_LIMITS.maxManifestBytes) return { ok: false, code: "manifest-byte-limit-exceeded" };
    return { ok: true, byteCount: stat.size, source: fs.readFileSync(manifestPath, "utf8") };
  } catch (error) {
    return { ok: false, code: error?.code === "ENOENT" ? "manifest-missing" : "manifest-unreadable" };
  }
}

function emptyTopology() {
  return {
    platforms: [],
    products: [],
    targets: [],
    targetDependencies: [],
    testTargetDependencies: [],
    executableResources: [],
  };
}

function sortRecords(records, keys) {
  return [...records].sort((left, right) => {
    for (const key of keys) {
      const comparison = String(left[key]).localeCompare(String(right[key]));
      if (comparison !== 0) return comparison;
    }
    return 0;
  });
}

function hasOnlyKeys(values, allowedKeys) {
  return Object.hasOwn(values, "name") && Object.keys(values).every((key) => allowedKeys.includes(key));
}

function isIdentifierCharacter(value) {
  return /[A-Za-z0-9_]/.test(value);
}

function countMatches(value, pattern) {
  const expression = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`);
  return [...value.matchAll(expression)].length;
}

function unique(values) {
  return [...new Set(values)];
}

function error(code, count = 1) {
  return { severity: "error", code, count };
}

function attention(code, count = 1) {
  return { severity: "attention", code, count };
}
