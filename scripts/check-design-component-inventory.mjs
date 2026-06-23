import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const INVENTORY_FILE = path.join(ROOT, "content", "development", "seis-design-component-inventory.json");
const PACKAGE_FILE = path.join(ROOT, "package.json");
const failures = [];

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function readText(file) {
  if (!fs.existsSync(file)) {
    failures.push(`Missing ${path.relative(ROOT, file)}`);
    return "";
  }
  return fs.readFileSync(file, "utf8");
}

function readJson(file) {
  try {
    return JSON.parse(readText(file));
  } catch (error) {
    failures.push(`Invalid JSON in ${path.relative(ROOT, file)}: ${error.message}`);
    return null;
  }
}

function commandExists(command, packageScripts) {
  const npmScript = String(command).match(/^npm run ([^\s]+)/)?.[1];
  const nodeScript = String(command).match(/^node (scripts\/[^\s]+)/)?.[1];
  if (npmScript) return packageScripts.has(npmScript);
  if (nodeScript) return fs.existsSync(path.join(ROOT, nodeScript));
  return false;
}

function selectorExists(selector, sourceTexts) {
  if (selector.startsWith("[") || selector.includes("=")) {
    const attribute = selector.match(/\[([^=\]]+)/)?.[1];
    const value = selector.match(/="([^"]+)"/)?.[1];
    return sourceTexts.some((text) => {
      if (value) return text.includes(`${attribute}="${value}"`);
      return text.includes(attribute);
    });
  }
  return sourceTexts.some((text) => text.includes(selector));
}

const inventory = readJson(INVENTORY_FILE);
const packageJson = readJson(PACKAGE_FILE);
const packageScripts = new Set(Object.keys(packageJson?.scripts || {}));
const statusVocabulary = new Set(inventory?.statusVocabulary || []);

if (inventory) {
  ensure(inventory.id === "seis-design-component-inventory", "inventory id must remain seis-design-component-inventory");
  ensure(inventory.schemaVersion === 1, "inventory schemaVersion must be 1");
  ensure(Array.isArray(inventory.statusVocabulary) && inventory.statusVocabulary.length >= 5, "inventory must define statusVocabulary");
  ensure(Array.isArray(inventory.components) && inventory.components.length >= 10, "inventory must define at least ten components");

  const ids = new Set();
  for (const component of inventory.components || []) {
    const label = component?.id || "unknown component";
    ensure(!ids.has(component?.id), `duplicate component id: ${component?.id}`);
    ids.add(component?.id);
    ensure(typeof component?.id === "string" && component.id.length > 0, "component id is required");
    ensure(typeof component?.surface === "string" && component.surface.length > 0, `${label} must define surface`);
    ensure(statusVocabulary.has(component?.status), `${label} has unsupported status: ${component?.status}`);
    ensure(Array.isArray(component?.sourceFiles) && component.sourceFiles.length > 0, `${label} must define sourceFiles`);
    ensure(Array.isArray(component?.selectors) && component.selectors.length > 0, `${label} must define selectors`);
    ensure(typeof component?.accessibility === "string" && component.accessibility.length >= 20, `${label} must define accessibility note`);
    ensure(typeof component?.motionPolicy === "string" && component.motionPolicy.length >= 10, `${label} must define motion policy`);
    ensure(Array.isArray(component?.validationCommands) && component.validationCommands.length > 0, `${label} must define validationCommands`);

    const sourceTexts = [];
    for (const sourceFile of component?.sourceFiles || []) {
      ensure(!String(sourceFile).startsWith("/"), `${label} source path must be repository-relative: ${sourceFile}`);
      ensure(!String(sourceFile).includes(".."), `${label} source path must not traverse directories: ${sourceFile}`);
      const fullPath = path.join(ROOT, sourceFile);
      ensure(fs.existsSync(fullPath), `${label} source file does not exist: ${sourceFile}`);
      sourceTexts.push(readText(fullPath));
    }

    for (const selector of component?.selectors || []) {
      ensure(selectorExists(selector, sourceTexts), `${label} selector not found in source files: ${selector}`);
    }

    for (const command of component?.validationCommands || []) {
      ensure(commandExists(command, packageScripts), `${label} references missing validation command: ${command}`);
    }
  }
}

if (failures.length > 0) {
  console.error("SEIS design component inventory check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS design component inventory check passed.");
