import { readFileSync, writeFileSync } from "node:fs";

const filePath = "deploy/server-targets.json";
const [targetId, ...rawArgs] = process.argv.slice(2);

if (!targetId || targetId === "--help") {
  printUsage();
  process.exit(targetId ? 0 : 1);
}

const config = parseArgs(rawArgs);
const registry = JSON.parse(readFileSync(filePath, "utf8"));
const target = (registry.candidates || []).find(candidate => candidate.id === targetId);

if (!target) {
  throw new Error(`Unknown server target: ${targetId}`);
}

const missing = (target.requiredInput || []).filter(key => !config[key]);
if (missing.length > 0) {
  throw new Error(`Missing required input for ${targetId}: ${missing.join(", ")}`);
}

registry.activeTarget = targetId;
registry.targetConfig = {
  id: targetId,
  type: target.type,
  configuredAt: new Date().toISOString(),
  values: config
};

writeFileSync(filePath, `${JSON.stringify(registry, null, 2)}\n`);
console.log(`Configured server target: ${targetId}`);

function parseArgs(args) {
  const output = {};
  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const value = args[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }
    output[key] = value;
    index += 1;
  }
  return output;
}

function printUsage() {
  console.log("Usage:");
  console.log("  node scripts/configure-server-target.mjs hostinger-static --domain example.com");
  console.log("  node scripts/configure-server-target.mjs generic-sftp --host example.com --path /public_html --auth_method ssh");
  console.log("  node scripts/configure-server-target.mjs apache-shared-hosting --domain example.com --document_root public_html");
  console.log("  node scripts/configure-server-target.mjs ssh-wireguard-vps --ssh_target seis@HOST --ssh_user seis --vpn wireguard --vpn_admin_peer 'admin|CLIENT_PUBLIC_KEY|10.44.0.2/32' --origin ssh://seis-cloud-vpn --path /opt/seis --rollback_contact repository-maintainer");
}
