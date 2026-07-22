#!/usr/bin/env node

import { createHash, randomBytes } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const TOOL_ID = "seis-public-marketplace-switch";
const CANONICAL_PUBLIC_PLUGIN_ID = "seis-ai-agent@seis-repo";
const DEFAULT_CONFIG_PATH = path.join(os.homedir(), ".codex", "config.toml");
const PERSONAL_SEIS_PLUGIN_PATTERN = /^seis(?:-[a-z0-9]+(?:-[a-z0-9]+)*)?@personal$/;
const PUBLIC_SEIS_PLUGIN_PATTERN = /^seis(?:-[a-z0-9]+(?:-[a-z0-9]+)*)?@seis-repo$/;
const OPTIONAL_BUNDLE_INSTALL_PATTERN = /^seis-(?:application|topic)-bundle-\d{2}@seis-repo$/;
const EMBEDDED_MODULE_NAME_PATTERN = /^seis(?:-[a-z0-9]+(?:-[a-z0-9]+)*)?$/;
const MAX_CONFIG_BYTES = 4 * 1024 * 1024;
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const unifiedSuitePath = path.join(repoRoot, "plugins", "seis-ai-agent", "assets", "unified-suite.json");
const generalPluginFamilyPath = path.join(repoRoot, "content", "development", "seis-public-plugin-family.json");

const args = parseArguments(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

const configPath = path.resolve(args.configPath || DEFAULT_CONFIG_PATH);

if (args.restorePath) {
  runRestore({ args, configPath });
} else {
  runSwitch({ args, configPath });
}

function runSwitch({ args, configPath }) {
  assertApplyTargetAllowed(configPath, args.apply);
  const original = readRegularText(configPath);
  const inspection = inspectPluginConfig(original.text);
  assertCanonicalPublicPlugin(inspection);

  const action = args.action || "remove-personal";
  const canonicalDefaultProfile = action === "canonicalize-public" ? readCanonicalDefaultProfile() : null;
  const tenGeneralPluginProfile = action === "converge-ten-general-plugins" ? readTenGeneralPluginProfile() : null;
  const targetRecords = targetRecordsFor(action, inspection, canonicalDefaultProfile, tenGeneralPluginProfile);
  const before = summarizeInspection(inspection, canonicalDefaultProfile);
  const plannedChangeCount = changeCountFor(action, targetRecords);
  const baseReport = createReport({
    mode: args.apply ? "apply" : "plan",
    action,
    configPath,
    before,
    canonicalDefaultProfile: describeCanonicalDefaultProfile(inspection, canonicalDefaultProfile),
    tenGeneralPluginProfile: describeTenGeneralPluginProfile(inspection, tenGeneralPluginProfile),
    plannedChangeCount,
    canonicalEnabled: true,
  });

  if (!args.apply) {
    printJson({
      ...baseReport,
      status: plannedChangeCount === 0 ? "already-public-only" : "planned",
      writesPerformed: false,
      backupCreated: false,
      nextAction: plannedChangeCount === 0
        ? noChangeMessage(action)
        : `Review the plan, then run: node scripts/manage-seis-public-marketplace-switch.mjs --apply --${action}`,
    });
    return;
  }

  if (plannedChangeCount === 0) {
    printJson({
      ...baseReport,
      status: "already-public-only",
      writesPerformed: false,
      backupCreated: false,
      nextAction: noChangeMessage(action),
    });
    return;
  }

  const transformedText = transformConfig({ action, inspection, targetRecords });
  if (transformedText === original.text) {
    fail("a requested migration reported changes but produced no configuration diff");
  }

  const backupPath = createBackup(configPath, original);
  try {
    assertUnchangedSinceRead(configPath, original);
    assertCanonicalDefaultProfileUnchanged(canonicalDefaultProfile);
    assertTenGeneralPluginProfileUnchanged(tenGeneralPluginProfile);
    writeAtomicFile(configPath, transformedText, original.mode);
    const after = readRegularText(configPath);
    const afterInspection = inspectPluginConfig(after.text);
    assertCanonicalPublicPlugin(afterInspection);
    assertActionPostcondition(action, afterInspection, canonicalDefaultProfile, tenGeneralPluginProfile);

    printJson({
      ...baseReport,
      status: "applied",
      writesPerformed: true,
      backupCreated: true,
      backupFileName: path.basename(backupPath),
      after: summarizeInspection(afterInspection, canonicalDefaultProfile),
      canonicalDefaultProfile: describeCanonicalDefaultProfile(afterInspection, canonicalDefaultProfile),
      tenGeneralPluginProfile: describeTenGeneralPluginProfile(afterInspection, tenGeneralPluginProfile),
      nextAction: action === "converge-ten-general-plugins"
        ? "Restart or refresh Codex and verify the ten concise SEIS Repo general plugins. Retired numbered bundle and embedded direct-source records were removed; source folders and caches were not removed."
        : action === "canonicalize-public"
        ? "Restart or refresh Codex and verify the one canonical SEIS-Agent default. Optional bundle records, source folders, and caches were not removed."
        : "Restart or refresh Codex and verify that the SEIS cards are labeled seis-repo. Source folders and caches were not removed.",
    });
  } catch (error) {
    let rollbackError = null;
    try {
      writeAtomicFile(configPath, original.text, original.mode);
      const restored = readRegularText(configPath);
      if (restored.digest !== original.digest) fail("automatic rollback content verification failed");
    } catch (candidate) {
      rollbackError = candidate;
    }
    const detail = error instanceof Error ? error.message : String(error);
    const rollbackDetail = rollbackError
      ? ` Automatic rollback also failed: ${rollbackError instanceof Error ? rollbackError.message : String(rollbackError)}`
      : " Automatic rollback restored the original configuration from memory; the on-disk backup was retained.";
    fail(`migration verification failed: ${detail}.${rollbackDetail}`);
  }
}

function runRestore({ args, configPath }) {
  assertApplyTargetAllowed(configPath, true);
  const current = readRegularText(configPath);
  const backupPath = path.isAbsolute(args.restorePath)
    ? path.resolve(args.restorePath)
    : path.resolve(path.dirname(configPath), args.restorePath);
  assertApprovedBackupPath(backupPath, configPath);
  const backup = readRegularText(backupPath);
  inspectPluginConfig(backup.text);

  assertUnchangedSinceRead(configPath, current);
  writeAtomicFile(configPath, backup.text, current.mode);
  const restored = readRegularText(configPath);
  if (digest(restored.text) !== digest(backup.text)) {
    fail("backup restore verification failed");
  }

  const inspection = inspectPluginConfig(restored.text);
  printJson({
    schemaVersion: 1,
    id: TOOL_ID,
    mode: "restore",
    status: "restored",
    config: describeConfigTarget(configPath),
    writesPerformed: true,
    backupCreated: false,
    restoredFromFileName: path.basename(backupPath),
    after: summarizeInspection(inspection),
    nextAction: "Restart or refresh Codex and confirm the restored plugin state in the UI.",
  });
}

function parseArguments(argv) {
  const result = {
    action: null,
    apply: false,
    configPath: null,
    help: false,
    plan: false,
    restorePath: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    switch (argument) {
      case "--help":
      case "-h":
        result.help = true;
        break;
      case "--plan":
        result.plan = true;
        break;
      case "--apply":
        result.apply = true;
        break;
      case "--remove-personal":
        setAction(result, "remove-personal");
        break;
      case "--disable-personal":
        setAction(result, "disable-personal");
        break;
      case "--canonicalize-public":
        setAction(result, "canonicalize-public");
        break;
      case "--converge-ten-general-plugins":
        setAction(result, "converge-ten-general-plugins");
        break;
      case "--config":
        result.configPath = requireValue(argv, index, argument);
        index += 1;
        break;
      case "--restore":
        result.restorePath = requireValue(argv, index, argument);
        index += 1;
        break;
      default:
        fail(`unsupported argument: ${argument}`);
    }
  }

  if (result.help) return result;
  if (result.apply && result.plan) fail("--plan and --apply cannot be combined");
  if (result.restorePath && !result.apply) fail("--restore requires --apply");
  if (result.restorePath && result.action) fail("--restore cannot be combined with a migration action");
  if (result.apply && !result.restorePath && !result.action) {
    fail("--apply requires exactly one of --remove-personal, --disable-personal, --canonicalize-public, or --converge-ten-general-plugins");
  }
  return result;
}

function setAction(result, action) {
  if (result.action && result.action !== action) {
    fail("choose only one personal-plugin action");
  }
  result.action = action;
}

function requireValue(argv, index, flag) {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) fail(`${flag} requires a value`);
  return value;
}

function assertApplyTargetAllowed(configPath, apply) {
  if (!apply) return;
  const defaultTarget = path.resolve(DEFAULT_CONFIG_PATH);
  if (configPath === defaultTarget || isWithinDirectory(os.tmpdir(), configPath)) return;
  fail("--apply only permits the default Codex config or a temporary test fixture");
}

function isWithinDirectory(directory, target) {
  const relative = path.relative(path.resolve(directory), path.resolve(target));
  return relative !== "" && !relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative);
}

function readRegularText(filePath) {
  let descriptor;
  try {
    const linkStatus = fs.lstatSync(filePath);
    if (!linkStatus.isFile() || linkStatus.isSymbolicLink()) {
      fail("configuration and backup targets must be regular non-symbolic files");
    }
    if (linkStatus.size > MAX_CONFIG_BYTES) fail("configuration file exceeds the safe size limit");
    descriptor = fs.openSync(filePath, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0));
    const status = fs.fstatSync(descriptor);
    if (!status.isFile() || status.size > MAX_CONFIG_BYTES) fail("configuration target is not a bounded regular file");
    const text = fs.readFileSync(descriptor, "utf8");
    return {
      dev: status.dev,
      digest: digest(text),
      ino: status.ino,
      mode: status.mode & 0o777,
      size: status.size,
      text,
    };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("SEIS public marketplace switch:")) throw error;
    fail(`could not safely read configuration: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
  }
}

function inspectPluginConfig(text) {
  const document = splitTomlDocument(text);
  const tableHeaders = [];
  const pluginHeaders = [];

  for (let index = 0; index < document.lines.length; index += 1) {
    const line = document.lines[index];
    if (isTomlTableHeader(line)) tableHeaders.push(index);
    const pluginId = readPluginHeader(line);
    if (pluginId !== null) pluginHeaders.push({ index, pluginId });
  }

  const records = pluginHeaders.map((header) => {
    const nextHeader = tableHeaders.find((candidate) => candidate > header.index) ?? document.lines.length;
    const sectionLines = document.lines.slice(header.index, nextHeader);
    const enabledLines = [];
    sectionLines.forEach((line, relativeIndex) => {
      const match = line.match(/^\s*enabled\s*=\s*(true|false)\s*(?:#.*)?$/);
      if (match) enabledLines.push({ index: header.index + relativeIndex, value: match[1] === "true" });
    });
    return {
      end: nextHeader,
      enabledLines,
      id: header.pluginId,
      start: header.index,
    };
  });

  const personalSeisPluginRecords = records.filter((record) => PERSONAL_SEIS_PLUGIN_PATTERN.test(record.id));
  const publicSeisPluginRecords = records.filter((record) => PUBLIC_SEIS_PLUGIN_PATTERN.test(record.id));
  const canonicalRecords = records.filter((record) => record.id === CANONICAL_PUBLIC_PLUGIN_ID);
  assertUniqueTargetRecords(personalSeisPluginRecords, "personal SEIS plugin");
  if (canonicalRecords.length !== 1) fail("exactly one canonical public SEIS-Agent plugin table is required");
  assertSingleEnabledField(canonicalRecords[0], CANONICAL_PUBLIC_PLUGIN_ID);
  for (const record of personalSeisPluginRecords) assertSingleEnabledField(record, record.id);
  for (const record of publicSeisPluginRecords) assertSingleEnabledField(record, record.id);

  return {
    ...document,
    canonicalRecord: canonicalRecords[0],
    personalSeisPluginRecords,
    publicSeisPluginRecords,
    records,
  };
}

function splitTomlDocument(text) {
  if (text.includes("\r") && !text.includes("\r\n")) fail("bare carriage returns are not supported");
  const newline = text.includes("\r\n") ? "\r\n" : "\n";
  const withoutCrLf = text.replace(/\r\n/g, "");
  if (newline === "\r\n" && withoutCrLf.includes("\n")) fail("mixed newline styles are not supported");
  const hasTerminalNewline = text.endsWith(newline);
  const body = hasTerminalNewline ? text.slice(0, -newline.length) : text;
  return {
    hasTerminalNewline,
    lines: body === "" ? [] : body.split(newline),
    newline,
  };
}

function isTomlTableHeader(line) {
  const match = line.match(/^\s*(\[\[?)([A-Za-z0-9_-]+(?:\.(?:[A-Za-z0-9_-]+|"(?:[^"\\]|\\.)*"))*)(\]\]?)\s*(?:#.*)?$/);
  if (!match) return false;
  return (match[1] === "[" && match[3] === "]") || (match[1] === "[[" && match[3] === "]]" );
}

function readPluginHeader(line) {
  const match = line.match(/^\s*\[plugins\."([^"\\]+)"\]\s*(?:#.*)?$/);
  return match ? match[1] : null;
}

function assertUniqueTargetRecords(records, label) {
  const ids = new Set();
  for (const record of records) {
    if (ids.has(record.id)) fail(`duplicate ${label} table: ${record.id}`);
    ids.add(record.id);
  }
}

function assertSingleEnabledField(record, label) {
  if (record.enabledLines.length !== 1) {
    fail(`${label} must contain exactly one literal enabled = true|false field`);
  }
}

function assertCanonicalPublicPlugin(inspection) {
  if (!inspection.canonicalRecord.enabledLines[0].value) {
    fail("the canonical public SEIS-Agent must be enabled before a personal migration can proceed");
  }
}

function summarizeInspection(inspection, canonicalDefaultProfile = null) {
  const personalEnabled = inspection.personalSeisPluginRecords.filter((record) => record.enabledLines[0].value).length;
  const publicEnabled = inspection.publicSeisPluginRecords.filter((record) => record.enabledLines[0].value).length;
  const summary = {
    canonicalPublicPluginId: CANONICAL_PUBLIC_PLUGIN_ID,
    canonicalPublicPluginEnabled: inspection.canonicalRecord.enabledLines[0].value,
    personalSeisPluginEnabledCount: personalEnabled,
    personalSeisPluginRecordCount: inspection.personalSeisPluginRecords.length,
    seisRepoPluginEnabledCount: publicEnabled,
    seisRepoPluginRecordCount: inspection.publicSeisPluginRecords.length,
  };
  if (canonicalDefaultProfile) {
    summary.embeddedPublicSourceRecordCount = targetRecordsFor("canonicalize-public", inspection, canonicalDefaultProfile).length;
  }
  return summary;
}

function targetRecordsFor(action, inspection, canonicalDefaultProfile = null, tenGeneralPluginProfile = null) {
  if (action === "remove-personal" || action === "disable-personal") return inspection.personalSeisPluginRecords;
  if (action === "canonicalize-public") {
    if (!canonicalDefaultProfile) fail("canonical public profile is unavailable");
    return inspection.publicSeisPluginRecords.filter((record) => canonicalDefaultProfile.embeddedPublicInstallIds.has(record.id));
  }
  if (action === "converge-ten-general-plugins") {
    if (!tenGeneralPluginProfile) fail("ten-general-plugin profile is unavailable");
    return inspection.publicSeisPluginRecords.filter((record) => !tenGeneralPluginProfile.allowedInstallIds.has(record.id));
  }
  fail(`unsupported migration action: ${action}`);
}

function changeCountFor(action, targetRecords) {
  if (action === "remove-personal" || action === "canonicalize-public" || action === "converge-ten-general-plugins") return targetRecords.length;
  if (action === "disable-personal") {
    return targetRecords.filter((record) => record.enabledLines[0].value).length;
  }
  fail(`unsupported migration action: ${action}`);
}

function transformConfig({ action, inspection, targetRecords }) {
  if (action === "remove-personal" || action === "canonicalize-public" || action === "converge-ten-general-plugins") return removeSections(inspection, targetRecords);
  if (action === "disable-personal") return disablePersonalSections(inspection);
  fail(`unsupported migration action: ${action}`);
}

function removeSections(inspection, records) {
  const removeLines = new Set();
  for (const record of records) {
    for (let index = record.start; index < record.end; index += 1) removeLines.add(index);
  }
  return joinTomlDocument(inspection, inspection.lines.filter((_line, index) => !removeLines.has(index)));
}

function disablePersonalSections(inspection) {
  const mutableLines = [...inspection.lines];
  for (const record of inspection.personalSeisPluginRecords) {
    const enabled = record.enabledLines[0];
    if (!enabled.value) continue;
    mutableLines[enabled.index] = mutableLines[enabled.index].replace(
      /^(\s*enabled\s*=\s*)true(\s*(?:#.*)?)$/,
      "$1false$2",
    );
  }
  return joinTomlDocument(inspection, mutableLines);
}

function joinTomlDocument(document, lines) {
  const body = lines.join(document.newline);
  return document.hasTerminalNewline ? `${body}${document.newline}` : body;
}

function assertActionPostcondition(action, inspection, canonicalDefaultProfile = null, tenGeneralPluginProfile = null) {
  if (action === "remove-personal" && inspection.personalSeisPluginRecords.length !== 0) {
    fail("personal SEIS plugin tables remain after removal");
  }
  if (action === "disable-personal" && inspection.personalSeisPluginRecords.some((record) => record.enabledLines[0].value)) {
    fail("an enabled personal SEIS plugin remains after disable mode");
  }
  if (action === "canonicalize-public" && targetRecordsFor(action, inspection, canonicalDefaultProfile).length !== 0) {
    fail("embedded direct public SEIS source tables remain after canonicalization");
  }
  if (action === "converge-ten-general-plugins") {
    if (targetRecordsFor(action, inspection, null, tenGeneralPluginProfile).length !== 0) {
      fail("retired public SEIS records remain after ten-general-plugin convergence");
    }
    if (inspection.publicSeisPluginRecords.some((record) => !tenGeneralPluginProfile.allowedInstallIds.has(record.id))) {
      fail("an unknown public SEIS record remains after ten-general-plugin convergence");
    }
  }
}

function readTenGeneralPluginProfile() {
  const source = readRepositoryText(generalPluginFamilyPath);
  let family;
  try {
    family = JSON.parse(source.text);
  } catch (error) {
    fail(`ten-general-plugin profile is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
  const generalPlugins = family?.generalPlugins;
  if (
    family?.marketplace?.publicPluginCount !== 10
    || family?.marketplace?.generalPluginCount !== 10
    || family?.marketplace?.internalPackageCount !== 30
    || family?.marketplace?.internalPackageMarketplaceCardCount !== 0
    || !Array.isArray(generalPlugins)
    || generalPlugins.length !== 10
  ) fail("ten-general-plugin profile does not declare the exact active 10/30 distribution");
  const allowedInstallIds = new Set();
  for (const plugin of generalPlugins) {
    if (typeof plugin?.name !== "string" || typeof plugin?.installId !== "string" || plugin.installId !== `${plugin.name}@seis-repo`) {
      fail("ten-general-plugin profile contains an invalid general plugin install id");
    }
    if (allowedInstallIds.has(plugin.installId)) fail("ten-general-plugin profile contains duplicate install ids");
    allowedInstallIds.add(plugin.installId);
  }
  if (!allowedInstallIds.has(CANONICAL_PUBLIC_PLUGIN_ID)) fail("ten-general-plugin profile must include canonical SEIS-Agent");
  return { allowedInstallIds, generalPluginCount: generalPlugins.length, sourceDigest: source.digest };
}

function readCanonicalDefaultProfile() {
  const source = readRepositoryText(unifiedSuitePath);
  let suite;
  try {
    suite = JSON.parse(source.text);
  } catch (error) {
    fail(`canonical public profile is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (suite?.canonicalInstall?.installId !== CANONICAL_PUBLIC_PLUGIN_ID) {
    fail("canonical public profile does not declare the expected SEIS-Agent install id");
  }
  const modules = suite?.sourceDiscovery?.embeddedModuleNames;
  if (!Array.isArray(modules) || modules.length < 2) {
    fail("canonical public profile must declare at least one embedded source module");
  }
  const moduleNames = new Set();
  for (const moduleName of modules) {
    if (typeof moduleName !== "string" || !EMBEDDED_MODULE_NAME_PATTERN.test(moduleName)) {
      fail("canonical public profile contains an invalid embedded module name");
    }
    if (moduleNames.has(moduleName)) fail("canonical public profile contains a duplicate embedded module name");
    moduleNames.add(moduleName);
  }
  if (!moduleNames.has("seis-ai-agent")) {
    fail("canonical public profile must embed the SEIS-Agent orchestrator");
  }

  const embeddedPublicInstallIds = new Set(
    [...moduleNames]
      .filter((moduleName) => moduleName !== "seis-ai-agent")
      .map((moduleName) => `${moduleName}@seis-repo`),
  );
  if (embeddedPublicInstallIds.size === 0) {
    fail("canonical public profile contains no removable embedded public source records");
  }

  return {
    embeddedModuleCount: moduleNames.size,
    embeddedPublicInstallIds,
    sourceDigest: source.digest,
  };
}

function readRepositoryText(filePath) {
  try {
    const relative = path.relative(repoRoot, filePath);
    if (relative.startsWith(`..${path.sep}`) || relative === ".." || path.isAbsolute(relative)) {
      fail("canonical public profile must remain inside the repository root");
    }
    const status = fs.lstatSync(filePath);
    if (!status.isFile() || status.isSymbolicLink() || status.size > MAX_CONFIG_BYTES) {
      fail("canonical public profile must be a bounded regular repository file");
    }
    const text = fs.readFileSync(filePath, "utf8");
    return { digest: digest(text), text };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("SEIS public marketplace switch:")) throw error;
    fail(`could not safely read canonical public profile: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function assertCanonicalDefaultProfileUnchanged(profile) {
  if (!profile) return;
  const current = readRepositoryText(unifiedSuitePath);
  if (current.digest !== profile.sourceDigest) {
    fail("canonical public profile changed after inspection; refusing to apply a stale migration plan");
  }
}

function assertTenGeneralPluginProfileUnchanged(profile) {
  if (!profile) return;
  const current = readRepositoryText(generalPluginFamilyPath);
  if (current.digest !== profile.sourceDigest) {
    fail("ten-general-plugin profile changed after inspection; refusing to apply a stale migration plan");
  }
}

function describeCanonicalDefaultProfile(inspection, profile) {
  if (!profile) return null;
  const embeddedSourceRecords = targetRecordsFor("canonicalize-public", inspection, profile);
  const otherPublicRecords = inspection.publicSeisPluginRecords.filter((record) => (
    record.id !== CANONICAL_PUBLIC_PLUGIN_ID && !profile.embeddedPublicInstallIds.has(record.id)
  ));
  return {
    canonicalDefaultInstallId: CANONICAL_PUBLIC_PLUGIN_ID,
    embeddedModuleCount: profile.embeddedModuleCount,
    embeddedDirectPublicRecordCount: embeddedSourceRecords.length,
    preservedOptionalBundleRecordCount: otherPublicRecords.filter((record) => OPTIONAL_BUNDLE_INSTALL_PATTERN.test(record.id)).length,
    unmanagedPublicRecordCount: otherPublicRecords.filter((record) => !OPTIONAL_BUNDLE_INSTALL_PATTERN.test(record.id)).length,
    optionalBundlesPreserved: true,
  };
}

function describeTenGeneralPluginProfile(inspection, profile) {
  if (!profile) return null;
  const retiredRecords = targetRecordsFor("converge-ten-general-plugins", inspection, null, profile);
  return {
    allowedGeneralPluginRecordCount: profile.generalPluginCount,
    retiredPublicRecordCount: retiredRecords.length,
    retiredNumberedBundleRecordCount: retiredRecords.filter((record) => OPTIONAL_BUNDLE_INSTALL_PATTERN.test(record.id)).length,
    retainedGeneralPluginRecordCount: inspection.publicSeisPluginRecords.filter((record) => profile.allowedInstallIds.has(record.id)).length,
  };
}

function noChangeMessage(action) {
  if (action === "converge-ten-general-plugins") {
    return "No retired public SEIS record needs a change. Only current ten-general-plugin records remain in the local config.";
  }
  if (action === "canonicalize-public") {
    return "No embedded direct public SEIS source record needs a change. The canonical SEIS-Agent default remains enabled and optional bundles remain untouched.";
  }
  return "No personal SEIS plugin record needs a change. Refresh Codex only if its UI is stale.";
}

function createBackup(configPath, original) {
  const fileName = `${path.basename(configPath)}.${TOOL_ID}-${timestamp()}-${process.pid}-${randomBytes(6).toString("hex")}.bak`;
  const backupPath = path.join(path.dirname(configPath), fileName);
  writeAtomicFile(backupPath, original.text, original.mode);
  const backup = readRegularText(backupPath);
  if (digest(backup.text) !== original.digest) fail("backup verification failed");
  return backupPath;
}

function timestamp() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z").replace(/[-:]/g, "");
}

function assertUnchangedSinceRead(configPath, original) {
  const current = readRegularText(configPath);
  if (
    current.dev !== original.dev ||
    current.ino !== original.ino ||
    current.size !== original.size ||
    current.digest !== original.digest
  ) {
    fail("configuration changed after inspection; refusing to overwrite a concurrent update");
  }
}

function writeAtomicFile(filePath, text, mode) {
  const directory = path.dirname(filePath);
  const parent = fs.lstatSync(directory);
  if (!parent.isDirectory() || parent.isSymbolicLink()) fail("configuration parent must be a regular directory");
  const temporaryPath = path.join(directory, `.${path.basename(filePath)}.${TOOL_ID}.${process.pid}.${randomBytes(6).toString("hex")}.tmp`);
  let descriptor;
  try {
    descriptor = fs.openSync(temporaryPath, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL, mode);
    fs.writeFileSync(descriptor, text, "utf8");
    fs.fsyncSync(descriptor);
    fs.closeSync(descriptor);
    descriptor = undefined;
    fs.renameSync(temporaryPath, filePath);
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
    if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath);
  }
}

function assertApprovedBackupPath(backupPath, configPath) {
  if (path.dirname(backupPath) !== path.dirname(configPath)) {
    fail("backup must be in the same directory as the selected config");
  }
  const escapedBaseName = escapeRegExp(path.basename(configPath));
  const pattern = new RegExp(`^${escapedBaseName}\\.${TOOL_ID}-\\d{8}T\\d{6}Z-\\d+-[a-f0-9]{12}\\.bak$`);
  if (!pattern.test(path.basename(backupPath))) {
    fail("backup name is not owned by this migration tool");
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function createReport({ mode, action, configPath, before, canonicalDefaultProfile, tenGeneralPluginProfile, plannedChangeCount, canonicalEnabled }) {
  return {
    schemaVersion: 1,
    id: TOOL_ID,
    mode,
    action,
    config: describeConfigTarget(configPath),
    before,
    canonicalDefaultProfile,
    tenGeneralPluginProfile,
    plannedChangeCount,
    publicBoundary: {
      canonicalPublicPluginId: CANONICAL_PUBLIC_PLUGIN_ID,
      canonicalPublicPluginEnabled: canonicalEnabled,
      networkAccess: false,
      sourceDirectoriesRemoved: false,
      cacheDirectoriesRemoved: false,
      otherPluginRecordsModified: false,
      optionalBundleRecordsModified: action === "converge-ten-general-plugins",
    },
  };
}

function describeConfigTarget(configPath) {
  return {
    kind: configPath === path.resolve(DEFAULT_CONFIG_PATH) ? "default-codex-config" : "temporary-test-fixture",
    pathDisclosed: false,
    regularFileRequired: true,
  };
}

function digest(text) {
  return createHash("sha256").update(text).digest("hex");
}

function printHelp() {
  console.log([
    "Usage:",
    "  node scripts/manage-seis-public-marketplace-switch.mjs --plan [--remove-personal|--disable-personal|--canonicalize-public|--converge-ten-general-plugins]",
    "  node scripts/manage-seis-public-marketplace-switch.mjs --apply --remove-personal",
    "  node scripts/manage-seis-public-marketplace-switch.mjs --apply --disable-personal",
    "  node scripts/manage-seis-public-marketplace-switch.mjs --apply --canonicalize-public",
    "  node scripts/manage-seis-public-marketplace-switch.mjs --apply --converge-ten-general-plugins",
    "  node scripts/manage-seis-public-marketplace-switch.mjs --apply --restore <approved-backup>",
    "",
    "Plan is read-only. Apply only accepts the default Codex config or a temporary test fixture.",
    "Remove deletes only seis...@personal configuration tables after a verified backup; it does not delete plugin source or cache directories.",
    "Disable retains those tables but changes their enabled flag to false.",
    "Canonicalize removes only direct seis-repo source records already embedded in SEIS-Agent; curated optional bundle records are preserved.",
    "Converge removes retired direct-source and numbered-bundle seis-repo records while retaining only the current ten general plugin install ids from the reviewed family profile.",
  ].join("\n"));
}

function printJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function fail(message) {
  throw new Error(`SEIS public marketplace switch: ${message}`);
}
