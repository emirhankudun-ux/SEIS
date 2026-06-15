import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { localeDirection, supportedLocales, translations } from "../apps/web/src/i18n/locales.js";

const outputRoot = "dist";
const staticDir = join(outputRoot, "seis-static");
const archivePath = join(outputRoot, "seis-static.zip");

rmSync(staticDir, { recursive: true, force: true });
mkdirSync(staticDir, { recursive: true });

copyDir("apps/web", staticDir);
copyFile("packages/design-tokens/seis.tokens.css", join(staticDir, "assets/styles/seis.tokens.css"));
copyDir("docs/reports", join(staticDir, "docs/reports"));
copyDir("docs/deployment", join(staticDir, "docs/deployment"));
copyDir("docs/polyglot", join(staticDir, "docs/polyglot"));
copyDir("docs/server", join(staticDir, "docs/server"));
copyDir("docs/strategy", join(staticDir, "docs/strategy"));
copyDir("docs/governance", join(staticDir, "docs/governance"));
copyDir("content", join(staticDir, "content"));
copyDir("polyglot/contracts", join(staticDir, "contracts/polyglot"));
copyFile("deploy/server-targets.json", join(staticDir, "_deploy/server-targets.json"));
copyServerFallbacks(staticDir);

const indexPath = join(staticDir, "index.html");
const rewrittenIndex = readFileSync(indexPath, "utf8")
  .replace("../../packages/design-tokens/seis.tokens.css", "./assets/styles/seis.tokens.css")
  .replace("../../docs/reports/zip-analysis-2026-05-24.md", "./docs/reports/zip-analysis-2026-05-24.md");
writeFileSync(indexPath, rewrittenIndex);
rewriteCaseStudyRoutes(staticDir);

writeReleaseFiles(staticDir);
writeLocalizedRoutes(staticDir, rewrittenIndex);
writeSitemap(staticDir);

rmSync(archivePath, { force: true });
createArchive();

console.log(`Static server package ready: ${archivePath}`);

function copyDir(source, target) {
  cpSync(source, target, {
    recursive: true,
    force: true,
    filter: path => !path.includes(".DS_Store")
  });
}

function copyFile(source, target) {
  mkdirSync(dirname(target), { recursive: true });
  if (!existsSync(source)) {
    throw new Error(`Missing source file: ${source}`);
  }
  copyFileSync(source, target);
}

function copyServerFallbacks(targetDir) {
  copyFile("server/apache/.htaccess", join(targetDir, ".htaccess"));
  copyFile("server/php/health.php", join(targetDir, "_server/health.php"));
}

function writeReleaseFiles(targetDir) {
  const drawingDir = join(targetDir, "public/media/drawings");
  const drawings = readdirSync(drawingDir).filter(name => name.endsWith(".jpg"));
  const drawingBytes = drawings.reduce((total, name) => total + statSync(join(drawingDir, name)).size, 0);
  const release = {
    version: 1,
    name: "seis-static",
    generatedAt: new Date().toISOString(),
    locales: supportedLocales,
    routeCount: supportedLocales.length + 1,
    curatedDrawingCount: drawings.length,
    curatedDrawingBytes: drawingBytes,
    labOperatingModel: existsSync(join(targetDir, "content/lab/operating-system.json")),
    deployTargetRegistry: existsSync(join(targetDir, "_deploy/server-targets.json")),
    polyglotContract: existsSync(join(targetDir, "contracts/polyglot/seis-experience-contract.json")),
    reducedMotion: true,
    serviceWorker: true
  };

  writeFileSync(join(targetDir, "release.json"), `${JSON.stringify(release, null, 2)}\n`);
  writeFileSync(join(targetDir, "health.json"), `${JSON.stringify({ ok: true, ...release }, null, 2)}\n`);
}

function writeLocalizedRoutes(targetDir, baseIndex) {
  for (const locale of supportedLocales) {
    const localeDir = join(targetDir, locale);
    mkdirSync(localeDir, { recursive: true });
    const direction = localeDirection[locale] || "ltr";
    const title = translations[locale]?.["meta.title"] || translations.tr["meta.title"];
    const localizedIndex = rewriteForLocaleRoute(baseIndex, locale, direction, title);
    writeFileSync(join(localeDir, "index.html"), localizedIndex);
  }
}

function rewriteCaseStudyRoutes(targetDir) {
  const caseStudyDir = join(targetDir, "case-studies");
  if (!existsSync(caseStudyDir)) return;

  for (const name of readdirSync(caseStudyDir)) {
    if (!name.endsWith(".html")) continue;
    const path = join(caseStudyDir, name);
    const rewritten = readFileSync(path, "utf8")
      .replace("../../../packages/design-tokens/seis.tokens.css", "../assets/styles/seis.tokens.css");
    writeFileSync(path, rewritten);
  }
}

function rewriteForLocaleRoute(html, locale, direction, title) {
  return html
    .replace(/<html lang="[^"]+"([^>]*)>/, `<html lang="${locale}" dir="${direction}"$1>`)
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replaceAll('href="./favicon.svg"', 'href="../favicon.svg"')
    .replaceAll('href="./manifest.webmanifest"', 'href="../manifest.webmanifest"')
    .replaceAll('href="./public/', 'href="../public/')
    .replaceAll('href="./assets/', 'href="../assets/')
    .replaceAll('href="./src/', 'href="../src/')
    .replaceAll('href="./docs/', 'href="../docs/')
    .replaceAll('src="./src/', 'src="../src/');
}

function writeSitemap(targetDir) {
  const siteUrl = (process.env.SEIS_SITE_URL || "https://example.com").replace(/\/$/, "");
  const routes = ["", ...supportedLocales.map(locale => `/${locale}/`)];
  const urls = routes.map(route => [
    "  <url>",
    `    <loc>${siteUrl}${route || "/"}</loc>`,
    "    <priority>0.8</priority>",
    "  </url>"
  ].join("\n")).join("\n");
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  writeFileSync(join(targetDir, "sitemap.xml"), sitemap);
}

function createArchive() {
  const zip = spawnSync("zip", ["-qr", "seis-static.zip", "seis-static"], {
    cwd: outputRoot,
    stdio: "inherit"
  });

  if (zip.status === 0) return;

  const ditto = spawnSync("ditto", ["-c", "-k", "--sequesterRsrc", "--keepParent", "seis-static", "seis-static.zip"], {
    cwd: outputRoot,
    stdio: "inherit"
  });

  if (ditto.status !== 0) {
    throw new Error("Failed to create static archive with zip or ditto.");
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}
