import { existsSync, readFileSync } from "node:fs";

const requiredFiles = [
  "server/node/static-server.mjs",
  "server/php/health.php",
  "server/php/router.php",
  "server/nginx/seis-static.conf",
  "server/apache/.htaccess",
  "server/python/verify_release.py",
  "server/edge/cloudflare-worker.js",
  "server/docker/Dockerfile",
  "server/docker/compose.yaml"
];

const requiredSnippets = [
  ["server/node/static-server.mjs", "_server/health"],
  ["server/php/health.php", "application/json"],
  ["server/nginx/seis-static.conf", "try_files"],
  ["server/apache/.htaccess", "RewriteEngine On"],
  ["server/python/verify_release.py", "sha256"],
  ["server/edge/cloudflare-worker.js", "_server/health"],
  ["server/docker/Dockerfile", "SEIS_STATIC_ROOT"]
];

const failures = [];

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    failures.push(`missing server adapter file: ${file}`);
  }
}

for (const [file, snippet] of requiredSnippets) {
  if (!existsSync(file)) continue;
  if (!readFileSync(file, "utf8").includes(snippet)) {
    failures.push(`missing "${snippet}" in ${file}`);
  }
}

if (failures.length > 0) {
  console.error("SEIS server adapter check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEIS server adapter check passed.");
