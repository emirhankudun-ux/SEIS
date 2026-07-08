import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const file = "apps/web/seis-linux-replica.html";
const failures = [];

function ensure(condition, message) {
  if (!condition) failures.push(message);
}

const absolute = join(root, file);
ensure(existsSync(absolute), `missing required file: ${file}`);
const html = existsSync(absolute) ? readFileSync(absolute, "utf8") : "";

for (const marker of [
  "data-mission-strip",
  "Live mission strip",
  "SEIS demo path",
  "seis.linuxMissionStrip.v1",
  "MISSION_STRIP_ACTIONS",
  "data-mission-strip-app=\"search\"",
  "data-mission-strip-app=\"reference-vault\"",
  "data-mission-strip-app=\"terminal\"",
  "data-mission-strip-route=\"./seis-code.html\"",
  "data-mission-strip-route=\"./website/seis-ai.html\"",
  "missionStripReady",
  "missionStripState",
  "No SSH",
  "provider calls",
  "219 supplied modules"
]) {
  ensure(html.includes(marker), `Linux replica mission strip marker missing: ${marker}`);
}

for (const forbidden of [
  "ghp_",
  "github_pat_",
  "AKIA",
  ["BEGIN", "OPENSSH", "PRIVATE KEY"].join(" "),
  ["BEGIN", "RSA", "PRIVATE KEY"].join(" ")
]) {
  ensure(!html.includes(forbidden), `Linux replica mission strip file contains sensitive marker: ${forbidden}`);
}

ensure(!/sk-[A-Za-z0-9]{20,}/.test(html), "Linux replica mission strip file contains OpenAI-style secret marker.");

ensure(html.includes("openDemoTour()"), "mission strip must open the guided live tour.");
ensure(html.includes("openApp(id)"), "mission strip must use existing app opener for in-shell apps.");
ensure(html.includes("openReplicaRoute(route"), "mission strip must use existing route opener for packaged pages.");
ensure(html.includes("localStorage.setItem(MISSION_STRIP_KEY"), "mission strip must persist only browser-local progress.");
ensure(html.includes("aria-expanded"), "mission strip collapse control must expose aria-expanded.");
ensure(html.includes("@media (max-width:860px){.mission-strip"), "mission strip must include mobile fallback CSS.");

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  file,
  state: "browser-local",
  actions: 6,
  liveClaims: "none"
}, null, 2));
