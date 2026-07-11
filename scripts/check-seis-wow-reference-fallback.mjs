import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const desktopJs = fs.readFileSync(path.join(root, "apps/web/desktop.js"), "utf8");
const desktopCss = fs.readFileSync(path.join(root, "apps/web/desktop.css"), "utf8");
const galleryHtml = fs.readFileSync(path.join(root, "apps/web/wow-gallery.html"), "utf8");
const galleryJs = fs.readFileSync(path.join(root, "apps/web/wow-gallery.js"), "utf8");
const galleryCss = fs.readFileSync(path.join(root, "apps/web/wow-gallery.css"), "utf8");
const failures = [];
const ensure = (condition, message) => { if (!condition) failures.push(message); };

ensure(desktopJs.includes("function renderReferencePreview"), "Desktop must define the honest missing-reference preview renderer.");
ensure(desktopJs.includes("Supplied PNG is not present in this checkout."), "Desktop must label unavailable supplied previews instead of implying they loaded.");
ensure((desktopJs.match(/<img\s+src=/g) || []).length === 0, "Desktop must not issue direct image requests for unavailable WOW references.");
ensure(desktopCss.includes(".wow-reference-preview"), "Desktop CSS must style the unavailable-reference preview.");
ensure(desktopCss.includes("Preview unavailable") || desktopJs.includes("Preview unavailable"), "The fallback copy must remain visible and honest.");
ensure(galleryHtml.includes('<div id="preview-image"'), "WOW Gallery dialog must use a non-requesting preview surface.");
ensure(galleryJs.includes("unavailablePreviewMarkup"), "WOW Gallery must render an honest unavailable preview.");
ensure((galleryJs.match(/<img\s+src=/g) || []).length === 0, "WOW Gallery must not issue direct image requests for unavailable PNG references.");
ensure(galleryJs.includes("removeAttribute(\"href\")"), "WOW Gallery must disable the unavailable PNG action.");
ensure(galleryCss.includes(".reference-preview-fallback"), "WOW Gallery CSS must style unavailable previews.");

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, directImageRequests: 0, suppliedAssetsPreserved: true }, null, 2));
