import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  SEIS_CORE_ECOSYSTEM_SNAPSHOT_PATH,
  buildSeisEcosystemCapabilitySnapshot,
} from "../packages/seis-ai/src/model/ecosystem-capability-snapshot.mjs";

const repoRoot = process.cwd();
const outputPath = path.join(repoRoot, ...SEIS_CORE_ECOSYSTEM_SNAPSHOT_PATH.split("/"));
const expected = `${JSON.stringify(buildSeisEcosystemCapabilitySnapshot(repoRoot), null, 2)}\n`;
const write = process.argv.includes("--write");
const check = process.argv.includes("--check");

if (write && check) {
  throw new Error("Choose either --write or --check for the SEIS Core ecosystem snapshot.");
}

if (write) {
  await writeFile(outputPath, expected, "utf8");
  console.log(`Wrote ${SEIS_CORE_ECOSYSTEM_SNAPSHOT_PATH}`);
} else if (check) {
  const current = await readFile(outputPath, "utf8").catch(() => "");
  if (current !== expected) {
    console.error(`SEIS Core ecosystem snapshot is stale: ${SEIS_CORE_ECOSYSTEM_SNAPSHOT_PATH}`);
    console.error("Run npm run automation:seis-core-ecosystem-registry and review the generated diff.");
    process.exitCode = 1;
  } else {
    console.log("SEIS Core ecosystem snapshot check passed.");
  }
} else {
  console.log(expected.trimEnd());
}
