import fs from "node:fs";
import path from "node:path";

export function validateExpectedBundleTree({ repositoryRoot, bundleRootRelative, expectedFilePaths }) {
  const root = path.resolve(repositoryRoot);
  const rootStat = fs.lstatSync(root);
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) {
    throw new Error("SEIS public bundle tree: repository root must be a regular directory");
  }

  const bundleRoot = normalizeRelative(bundleRootRelative, "bundle root");
  const expectedFiles = new Set(expectedFilePaths.map((file) => normalizeRelative(file, "expected file")));
  if (expectedFiles.size !== expectedFilePaths.length) {
    throw new Error("SEIS public bundle tree: expected file list contains duplicates");
  }
  for (const file of expectedFiles) {
    if (!file.startsWith(`${bundleRoot}/`)) {
      throw new Error(`SEIS public bundle tree: expected file is outside the bundle root: ${file}`);
    }
  }

  const expectedDirectories = new Set([bundleRoot]);
  for (const file of expectedFiles) {
    let directory = path.posix.dirname(file);
    while (directory !== "." && directory.startsWith(bundleRoot)) {
      expectedDirectories.add(directory);
      if (directory === bundleRoot) break;
      directory = path.posix.dirname(directory);
    }
  }

  const absoluteBundleRoot = path.resolve(root, bundleRoot);
  assertWithin(root, absoluteBundleRoot, bundleRoot);
  const actualFiles = new Set();
  const actualDirectories = new Set();
  visit(absoluteBundleRoot, bundleRoot, actualFiles, actualDirectories);

  const missingFiles = difference(expectedFiles, actualFiles);
  const extraFiles = difference(actualFiles, expectedFiles);
  const missingDirectories = difference(expectedDirectories, actualDirectories);
  const extraDirectories = difference(actualDirectories, expectedDirectories);
  if (missingFiles.length || extraFiles.length || missingDirectories.length || extraDirectories.length) {
    const details = [
      formatDifference("missing files", missingFiles),
      formatDifference("extra files", extraFiles),
      formatDifference("missing directories", missingDirectories),
      formatDifference("extra directories", extraDirectories),
    ].filter(Boolean).join("; ");
    throw new Error(`SEIS public bundle tree: generated tree differs from the closed-world allowlist: ${details}`);
  }

  return {
    fileCount: actualFiles.size,
    directoryCount: actualDirectories.size,
  };
}

function visit(absoluteDirectory, relativeDirectory, files, directories) {
  const stat = fs.lstatSync(absoluteDirectory);
  if (!stat.isDirectory() || stat.isSymbolicLink()) {
    throw new Error(`SEIS public bundle tree: expected a regular directory: ${relativeDirectory}`);
  }
  directories.add(relativeDirectory);
  for (const entry of fs.readdirSync(absoluteDirectory).sort()) {
    const absoluteChild = path.join(absoluteDirectory, entry);
    const relativeChild = path.posix.join(relativeDirectory, entry);
    const childStat = fs.lstatSync(absoluteChild);
    if (childStat.isSymbolicLink()) {
      throw new Error(`SEIS public bundle tree: symbolic links are forbidden: ${relativeChild}`);
    }
    if (childStat.isDirectory()) {
      visit(absoluteChild, relativeChild, files, directories);
    } else if (childStat.isFile()) {
      files.add(relativeChild);
    } else {
      throw new Error(`SEIS public bundle tree: special filesystem entries are forbidden: ${relativeChild}`);
    }
  }
}

function normalizeRelative(value, label) {
  if (typeof value !== "string" || !value || path.isAbsolute(value)) {
    throw new Error(`SEIS public bundle tree: invalid ${label}: ${String(value)}`);
  }
  const normalized = value.replaceAll("\\", "/").replace(/^\.\//, "");
  const parts = normalized.split("/");
  if (parts.some((part) => !part || part === "." || part === "..")) {
    throw new Error(`SEIS public bundle tree: invalid ${label}: ${value}`);
  }
  return parts.join("/");
}

function assertWithin(root, target, label) {
  const relative = path.relative(root, target);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`SEIS public bundle tree: path escapes repository root: ${label}`);
  }
}

function difference(left, right) {
  return [...left].filter((value) => !right.has(value)).sort();
}

function formatDifference(label, values) {
  return values.length ? `${label}: ${values.join(", ")}` : "";
}
