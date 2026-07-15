#!/usr/bin/env node

import { aiCorePluginRegistryStatus } from "../src/lib/plugin-registry.mjs";
import { resolveRepoRoot } from "../src/lib/repo.mjs";

const args = process.argv.slice(2);
const queryIndex = args.indexOf("--query");
const limitIndex = args.indexOf("--limit");
const query = queryIndex >= 0 ? args[queryIndex + 1] : undefined;
const limit = limitIndex >= 0 ? Number(args[limitIndex + 1]) : undefined;
const includeFullRegistry = args.includes("--full");

if (args.includes("--help") || args.includes("-h")) {
  console.log(`seis-plugin-registry — inspect the canonical SEIS AI Core plugin registry

Usage:
  node packages/seis-ai/bin/seis-plugin-registry.mjs
  node packages/seis-ai/bin/seis-plugin-registry.mjs --query security --limit 20
  node packages/seis-ai/bin/seis-plugin-registry.mjs --full
`);
  process.exit(0);
}

const result = aiCorePluginRegistryStatus(resolveRepoRoot(), { query, limit, includeFullRegistry });
console.log(JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 1);
