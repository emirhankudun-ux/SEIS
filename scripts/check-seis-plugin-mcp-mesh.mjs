#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";

import { probeSeisPluginMcpMesh } from "../packages/seis-ai/src/lib/plugin-mcp-mesh.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const result = probeSeisPluginMcpMesh(repoRoot);

console.log(JSON.stringify(result, null, 2));
if (!result.ok) {
  process.exitCode = 1;
}
