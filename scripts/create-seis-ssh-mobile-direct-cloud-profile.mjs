#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const reportsDir = path.join(repoRoot, "reports");
fs.mkdirSync(reportsDir, { recursive: true });

const env = process.env;
const strict = process.argv.includes("--strict") || process.argv.includes("--require-ready");

const profile = {
  generatedAt: new Date().toISOString(),
  name: "SEIS SSH Mobile Direct Cloud Profile",
  status: "blocked",
  transport: "direct-cloud-ssh",
  alias: env.SEIS_SSH_ALIAS || "SEIS-SSH",
  host: env.SEIS_SSH_HOST || env.SEIS_CLOUD_HOST || "",
  port: Number(env.SEIS_SSH_PORT || "22"),
  user: env.SEIS_SSH_USER || "aiuser",
  identityFile: env.SEIS_SSH_IDENTITY_FILE || "~/.ssh/id_ed25519_seis_codex",
  repoUrl: env.SEIS_REPO_URL || "git@github.com:emirhankudun-ux/SEIS.git",
  remoteRepoDir: env.SEIS_REMOTE_REPO_DIR || "/opt/seis/SEIS",
  bootstrapScript: "scripts/bootstrap-seis-ssh-mobile-direct-cloud.sh",
  runbook: "docs/operations/seis-ssh-mobile-24x7.md",
  mobileContract: {
    chatgptMobileCodex: true,
    localMacRequired: false,
    codespacesTransportAllowedFor24x7: false,
    alwaysOnCloudVmRequired: true,
    publicSshEndpointRequired: true,
    secretsInGitAllowed: false,
  },
  blockers: [],
  sshConfig: "",
  commands: {},
};

if (!profile.host) {
  profile.blockers.push({
    id: "missing-public-direct-cloud-host",
    message: "Set SEIS_SSH_HOST to an always-on public VM IP address or DNS name.",
  });
}

if (!Number.isInteger(profile.port) || profile.port < 1 || profile.port > 65535) {
  profile.blockers.push({
    id: "invalid-ssh-port",
    message: "SEIS_SSH_PORT must be a TCP port between 1 and 65535.",
  });
}

if (!profile.blockers.length) {
  profile.status = "ready";
}

const hostForConfig = profile.host || "<always-on-public-ip-or-dns>";
profile.sshConfig = [
  `Host ${profile.alias}`,
  `  HostName ${hostForConfig}`,
  `  User ${profile.user}`,
  `  Port ${profile.port}`,
  `  IdentityFile ${profile.identityFile}`,
  "  IdentitiesOnly yes",
  "  ServerAliveInterval 30",
  "  ServerAliveCountMax 3",
  "  TCPKeepAlive yes",
  "  RequestTTY force",
  "",
].join("\n");

profile.commands = {
  generateProfile: "npm run cloud:ssh:mobile-direct:profile",
  strictProfile: "npm run cloud:ssh:mobile-direct:profile -- --strict",
  bootstrapRemote:
    "scp scripts/bootstrap-seis-ssh-mobile-direct-cloud.sh root@HOST:/tmp/seis-bootstrap.sh && ssh root@HOST 'bash /tmp/seis-bootstrap.sh'",
  connectMobile: `ssh ${profile.alias}`,
  remoteRepo: `ssh ${profile.alias} 'cd ${profile.remoteRepoDir} && git status --short'`,
};

const jsonPath = path.join(reportsDir, "seis-ssh-mobile-direct-cloud-profile.json");
const mdPath = path.join(reportsDir, "seis-ssh-mobile-direct-cloud-profile.md");

fs.writeFileSync(jsonPath, `${JSON.stringify(profile, null, 2)}\n`);
fs.writeFileSync(mdPath, renderMarkdown(profile));

console.log(`Wrote ${path.relative(repoRoot, jsonPath)}`);
console.log(`Wrote ${path.relative(repoRoot, mdPath)}`);
console.log(`Status: ${profile.status}`);

if (strict && profile.status !== "ready") {
  process.exitCode = 1;
}

function renderMarkdown(data) {
  const blockers = data.blockers.length
    ? data.blockers.map((blocker) => `- ${blocker.id}: ${blocker.message}`).join("\n")
    : "- none";

  return `# SEIS SSH Mobile Direct Cloud Profile

Generated: ${data.generatedAt}

Status: ${data.status}

This profile is for running SEIS over SSH from ChatGPT mobile/Codex without depending on the local Mac.

## Contract

- Transport: ${data.transport}
- Alias: ${data.alias}
- Host: ${data.host || "not configured"}
- Port: ${data.port}
- User: ${data.user}
- Remote repository: ${data.remoteRepoDir}
- Local Mac required: ${data.mobileContract.localMacRequired}
- Codespaces accepted for 24x7: ${data.mobileContract.codespacesTransportAllowedFor24x7}
- Always-on cloud VM required: ${data.mobileContract.alwaysOnCloudVmRequired}
- Secrets in git allowed: ${data.mobileContract.secretsInGitAllowed}

## Blockers

${blockers}

## SSH config

\`\`\`sshconfig
${data.sshConfig}\`\`\`

## Commands

\`\`\`bash
${Object.values(data.commands).join("\n")}
\`\`\`
`;
}
