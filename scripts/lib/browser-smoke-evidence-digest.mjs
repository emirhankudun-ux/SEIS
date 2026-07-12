import { createHash } from "node:crypto";

export const sourcePaths = [
  "apps/web/desktop.js",
  "content/development/seis-second-brain-system.json",
  "scripts/check-seis-second-brain-browser-smoke.mjs"
];

export function createSourceDigest(readText) {
  if (typeof readText !== "function") {
    throw new TypeError("createSourceDigest requires a readText function.");
  }
  const hash = createHash("sha256");
  for (const filePath of sourcePaths) {
    hash.update(`${filePath}\n${readText(filePath)}\n`);
  }
  return `sha256:${hash.digest("hex")}`;
}
