import { existsSync, readFileSync } from "node:fs";

const registryPath = "content/lab/long-development-roadmap.json";
const documentPath = "docs/plans/long-development-roadmap.md";
const webShellPath = "apps/web/index.html";

const failures = [];

for (const path of [registryPath, documentPath]) {
  if (!existsSync(path)) {
    failures.push(`missing ${path}`);
  }
}

const registry = existsSync(registryPath)
  ? JSON.parse(readFileSync(registryPath, "utf8"))
  : null;
const documentText = existsSync(documentPath)
  ? readFileSync(documentPath, "utf8")
  : "";
const webShell = existsSync(webShellPath)
  ? readFileSync(webShellPath, "utf8")
  : "";

if (registry) {
  if (registry.mode !== "phased-low-power") {
    failures.push("long roadmap must stay in phased-low-power mode");
  }

  const phases = registry.phases || [];
  if (phases.length < 6) {
    failures.push("long roadmap must define at least six phases");
  }

  if (!phases.some(phase => phase.status === "active")) {
    failures.push("long roadmap must keep one active phase");
  }

  if (!phases.some(phase => phase.status === "blocked_on_input")) {
    failures.push("long roadmap must name blocked input-dependent work");
  }

  const actions = registry.nextLongRunActions || [];
  if (!actions.some(action => action.status === "blocked_on_auth")) {
    failures.push("long roadmap must preserve the GitHub auth blocker");
  }
}

for (const requiredText of [
  "Long Development Roadmap",
  "Foundation hardening",
  "Framework decision",
  "UIXAppTTR",
  "GitHub authentication"
]) {
  if (!documentText.includes(requiredText)) {
    failures.push(`missing "${requiredText}" in ${documentPath}`);
  }
}

if (!webShell.includes('id="roadmap"')) {
  failures.push("web shell must expose the long roadmap section");
}

if (failures.length > 0) {
  console.error("SEIS long development roadmap check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS long development roadmap check passed.");
