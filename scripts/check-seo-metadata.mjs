import { existsSync, readFileSync } from "node:fs";

const metadataPath = "content/site/metadata.json";
const sitemapPath = "apps/web/sitemap.xml";
const robotsPath = "apps/web/robots.txt";
const homePath = "apps/web/index.html";
const caseStudyPath = "apps/web/case-studies/seis-foundation.html";

const placeholderPatterns = [
  /example\.com/i,
  /localhost/i,
  /127\.0\.0\.1/i,
  /your-domain/i,
  /placeholder\.(?:com|dev|test|local)/i
];

const failures = [];

for (const path of [metadataPath, sitemapPath, robotsPath, homePath, caseStudyPath]) {
  if (!existsSync(path)) {
    failures.push(`missing SEO source file: ${path}`);
  }
}

const metadata = readJson(metadataPath);
const seoPolicy = metadata?.seoPolicy || {};
const canonicalBase = normalizeBase(seoPolicy.canonicalBase);
const sitemapUrl = seoPolicy.sitemapUrl;

if (!canonicalBase) {
  failures.push("metadata seoPolicy.canonicalBase must be a valid https URL");
}

if (!sitemapUrl || !isHttpsUrl(sitemapUrl)) {
  failures.push("metadata seoPolicy.sitemapUrl must be a valid https URL");
}

if (seoPolicy.placeholderUrlsAllowed !== false) {
  failures.push("metadata seoPolicy.placeholderUrlsAllowed must be false");
}

if (canonicalBase && sitemapUrl && !sitemapUrl.startsWith(`${canonicalBase}/`)) {
  failures.push("metadata sitemapUrl must live under canonicalBase");
}

const sitemap = readText(sitemapPath);
const robots = readText(robotsPath);
const homeHtml = readText(homePath);
const caseStudyHtml = readText(caseStudyPath);
const expectedHomeUrl = canonicalBase ? `${canonicalBase}/` : null;
const expectedCaseStudyUrl = canonicalBase
  ? `${canonicalBase}/case-studies/seis-foundation.html`
  : null;
const allSeoText = [
  [metadataPath, JSON.stringify(metadata)],
  [sitemapPath, sitemap],
  [robotsPath, robots]
];

for (const [path, text] of allSeoText) {
  for (const pattern of placeholderPatterns) {
    if (pattern.test(text)) {
      failures.push(`placeholder URL pattern ${pattern} found in ${path}`);
    }
  }
}

const sitemapLocs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1].trim());

if (sitemapLocs.length < 2) {
  failures.push("sitemap must include home and case study URLs");
}

if (expectedHomeUrl && !sitemapLocs.includes(expectedHomeUrl)) {
  failures.push("sitemap must include the metadata canonical home URL");
}

if (expectedCaseStudyUrl && !sitemapLocs.includes(expectedCaseStudyUrl)) {
  failures.push("sitemap must include the SEIS Foundation case study URL");
}

for (const loc of sitemapLocs) {
  if (!isHttpsUrl(loc)) {
    failures.push(`sitemap loc must be https: ${loc}`);
  }
  if (canonicalBase && !loc.startsWith(canonicalBase)) {
    failures.push(`sitemap loc must use canonicalBase: ${loc}`);
  }
}

if (sitemapUrl && !robots.includes(`Sitemap: ${sitemapUrl}`)) {
  failures.push("robots.txt sitemap URL must match metadata seoPolicy.sitemapUrl");
}

if (!homeHtml.includes('<meta name="robots" content="noindex, nofollow">')) {
  failures.push("home page must remain noindex before final production domain confirmation");
}

if (
  expectedHomeUrl &&
  !homeHtml.includes(`<link rel="canonical" href="${expectedHomeUrl}">`)
) {
  failures.push("home page canonical URL must match metadata seoPolicy.canonicalBase");
}

if (
  expectedHomeUrl &&
  !homeHtml.includes(`<meta property="og:url" content="${expectedHomeUrl}">`)
) {
  failures.push("home page Open Graph URL must match metadata seoPolicy.canonicalBase");
}

if (
  canonicalBase &&
  !homeHtml.includes(`<meta property="og:image" content="${canonicalBase}/og-seis.png">`)
) {
  failures.push("home page Open Graph image must use metadata seoPolicy.canonicalBase");
}

if (!caseStudyHtml.includes('<meta name="robots" content="noindex, nofollow">')) {
  failures.push("case study page must remain noindex before final production domain confirmation");
}

if (failures.length > 0) {
  console.error("SEIS SEO metadata check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  canonicalBase,
  sitemapUrl,
  sitemapUrls: sitemapLocs.length,
  robotsMode: "pre-production-noindex"
}, null, 2));

function readJson(path) {
  if (!existsSync(path)) return null;

  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    failures.push(`invalid JSON in ${path}: ${error.message}`);
    return null;
  }
}

function readText(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function normalizeBase(value) {
  if (!value || !isHttpsUrl(value)) return null;
  return value.replace(/\/$/, "");
}

function isHttpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
}
