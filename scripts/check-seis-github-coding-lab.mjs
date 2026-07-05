import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const HTML_FILE = path.join(ROOT, "apps", "web", "seis-github-coding-lab.html");
const ROUTES_FILE = path.join(ROOT, "apps", "web", "src", "config", "routes.json");
const SERVICE_WORKER_FILE = path.join(ROOT, "apps", "web", "service-worker.js");
const SITEMAP_FILE = path.join(ROOT, "apps", "web", "sitemap.xml");
const DOC_FILE = path.join(ROOT, "docs", "product", "seis-github-coding-lab.md");

const failures = [];

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

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

function ensureIncludes(text, expected, sourceLabel) {
  ensure(text.includes(expected), `${sourceLabel} must include ${JSON.stringify(expected)}`);
}

const html = readText(HTML_FILE);
const routes = readJson(ROUTES_FILE);
const serviceWorker = readText(SERVICE_WORKER_FILE);
const sitemap = readText(SITEMAP_FILE);
const doc = readText(DOC_FILE);

ensureIncludes(html, "SEIS GitHub Coding Lab", "HTML");
ensureIncludes(html, "data-seis-github-coding-lab=\"local-demo\"", "HTML");
ensureIncludes(html, "Local Demo · GitHub-safe · No provider keys", "HTML");
ensureIncludes(html, "data-action=\"build-plan\"", "HTML");
ensureIncludes(html, "data-action=\"copy-plan\"", "HTML");
ensureIncludes(html, "data-action=\"reset-plan\"", "HTML");
ensureIncludes(html, "data-field=\"goal\"", "HTML");
ensureIncludes(html, "data-field=\"lane\"", "HTML");
ensureIncludes(html, "data-field=\"risk\"", "HTML");
ensureIncludes(html, "localStorage", "HTML");
ensureIncludes(html, "navigator.clipboard.writeText", "HTML");
ensureIncludes(html, "No secrets", "HTML");
ensureIncludes(html, "No provider keys", "HTML");
ensureIncludes(html, "No SSH", "HTML");

const externalRuntimePatterns = [
  /<script\s+[^>]*src=["']https?:\/\//i,
  /<link\s+[^>]*href=["']https?:\/\//i,
  /@import\s+url\(["']?https?:\/\//i,
  /fetch\(["']https?:\/\//i
];

for (const pattern of externalRuntimePatterns) {
  ensure(!pattern.test(html), `HTML must not add external runtime dependency matching ${pattern}`);
}

const route = routes?.routes?.find((candidate) => candidate.path === "/seis-github-coding-lab.html");
ensure(Boolean(route), "routes.json must register /seis-github-coding-lab.html");
ensure(route?.status === "github-coding-lab-local-demo", "GitHub Coding Lab route must use local-demo status");

for (const section of ["idea-intake", "branch-plan", "validation", "pull-request-brief", "safety-boundaries"]) {
  ensure(route?.sections?.includes(section), `GitHub Coding Lab route must include ${section} section`);
}

ensureIncludes(serviceWorker, "seis-product-foundation-v14", "service-worker");
ensureIncludes(serviceWorker, "./seis-github-coding-lab.html", "service-worker");
ensureIncludes(sitemap, "seis-github-coding-lab.html", "sitemap");
ensureIncludes(doc, "SEIS GitHub Coding Lab", "documentation");
ensureIncludes(doc, "node scripts/check-seis-github-coding-lab.mjs", "documentation");
ensureIncludes(doc, "no provider keys", "documentation");
ensureIncludes(doc, "no SSH execution", "documentation");
ensureIncludes(doc, "no GitHub mutation from the browser", "documentation");

if (failures.length > 0) {
  console.error("SEIS GitHub Coding Lab check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEIS GitHub Coding Lab static check passed.");
