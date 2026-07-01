#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";

const args = parseArgs(process.argv.slice(2));
const write = Boolean(args.write);
const check = Boolean(args.check);
const outputJson = args.output || "reports/seis-ssh-oracle-cloud-init-handoff.json";
const outputMarkdown = args.markdown || "reports/seis-ssh-oracle-cloud-init-handoff.md";
const outputYaml = args.yaml || "reports/seis-ssh-oracle-cloud-init-handoff.yaml";
const publicKeyPath = expandHome(args["public-key"] || process.env.SEIS_SSH_PUBLIC_KEY_FILE || "~/.ssh/id_ed25519_seis_codex.pub");
const remoteUser = args["remote-user"] || process.env.SEIS_ORACLE_REMOTE_USER || "aiuser";
const repoUrl = args["repo-url"] || process.env.SEIS_ORACLE_REPO_URL || "https://github.com/emirhankudun-ux/SEIS.git";
const repoDir = args["repo-dir"] || process.env.SEIS_ORACLE_REPO_DIR || "/opt/seis/SEIS";
const sshPort = String(args["ssh-port"] || process.env.SEIS_ORACLE_SSH_PORT || "22");

if (args.help) {
  printHelp();
  process.exit(0);
}

const report = buildReport();

if (write) {
  writeFile(outputJson, `${JSON.stringify(withoutYaml(report), null, 2)}\n`);
  writeFile(outputMarkdown, renderMarkdown(report));
  writeFile(outputYaml, report.cloudInitYaml);
}

if (!write) {
  console.log(JSON.stringify(withoutYaml(report), null, 2));
}

if (check && report.integrityBlockers.length > 0) process.exit(1);

function buildReport() {
  const integrityBlockers = [];
  const packageJson = readJson("package.json", integrityBlockers);
  const contract = readJson("deploy/seis-ssh-oracle-free-tier-direct-cloud-plan.json", integrityBlockers);
  const matrix = readJson("deploy/seis-ssh-direct-cloud-provider-matrix.json", integrityBlockers);
  const publicKey = readPublicKey(publicKeyPath);

  if (packageJson?.scripts?.["check:seis-ssh-oracle-cloud-init-handoff"] !== "node scripts/create-seis-ssh-oracle-cloud-init-handoff.mjs --check") {
    integrityBlockers.push("package script check:seis-ssh-oracle-cloud-init-handoff must be declared");
  }
  if (packageJson?.scripts?.["cloud:ssh:oracle-cloud-init:handoff"] !== "node scripts/create-seis-ssh-oracle-cloud-init-handoff.mjs --write") {
    integrityBlockers.push("package script cloud:ssh:oracle-cloud-init:handoff must be declared");
  }
  if (contract?.cloudInitHandoff?.script !== "scripts/create-seis-ssh-oracle-cloud-init-handoff.mjs") {
    integrityBlockers.push("Oracle plan must link cloud-init handoff script");
  }
  if (contract?.cloudInitHandoff?.writesSshConfig !== false || contract?.cloudInitHandoff?.callsProviderApis !== false) {
    integrityBlockers.push("Oracle cloud-init handoff must remain local-only and non-mutating");
  }
  if (matrix?.oracleCloudInitHandoff?.script !== "scripts/create-seis-ssh-oracle-cloud-init-handoff.mjs") {
    integrityBlockers.push("provider matrix must link Oracle cloud-init handoff script");
  }
  if (!/^[A-Za-z_][A-Za-z0-9_.-]*$/.test(remoteUser)) integrityBlockers.push("remote user must be a safe Linux user name");
  if (!/^[0-9]+$/.test(sshPort) || Number(sshPort) < 1 || Number(sshPort) > 65535) integrityBlockers.push("SSH port must be 1-65535");
  if (!publicKey.present) integrityBlockers.push("SEIS public key is required for Oracle cloud-init handoff");
  if (publicKey.present && !isSshPublicKey(publicKey.value)) integrityBlockers.push("public key file must contain one SSH public key");

  const cloudInitYaml = publicKey.present
    ? renderCloudInit(publicKey.value)
    : "#cloud-config\n# Blocked: SEIS public key is missing.\n";

  return {
    id: "seis-ssh-oracle-cloud-init-handoff",
    generatedAt: new Date().toISOString(),
    ok: integrityBlockers.length === 0,
    status: publicKey.present ? "cloud-init-handoff-ready-for-owner-review" : "blocked-missing-public-key",
    mode: "local-report-only-no-provider-api-no-live-ssh-no-config-write",
    targetAlias: "SEIS-SSH",
    providerId: "oracle-cloud-free-tier",
    remoteUser,
    repoUrl,
    repoDir,
    sshPort,
    publicKey: {
      present: publicKey.present,
      path: redactHome(publicKeyPath),
      fingerprint: publicKey.fingerprint,
      comment: publicKey.comment
    },
    cloudInit: {
      outputYaml,
      containsPublicKey: publicKey.present,
      containsPrivateKey: false,
      containsSecrets: false,
      createsRemoteUser: remoteUser,
      disablesPasswordAuth: true,
      permitRootLogin: "prohibit-password",
      clonesRepo: repoUrl,
      repoDir,
      liveProviderApiCalled: false,
      liveSshAttempted: false
    },
    commands: {
      writeHandoff: "npm run cloud:ssh:oracle-cloud-init:handoff",
      checkHandoff: "npm run check:seis-ssh-oracle-cloud-init-handoff",
      oracleLogin: "oci session authenticate --region eu-frankfurt-1 --no-browser --profile-name SEIS",
      ownerAfterVmBoots: `npm run cloud:ssh:direct-cloud:activate -- --public-ip <PUBLIC_IP> --direct-user ${remoteUser}`,
      strictProbe: "npm run cloud:ssh:mobile-direct:probe:strict",
      strictDoctor: "npm run cloud:ssh:mobile-direct:doctor:strict"
    },
    readinessBlockers: [
      ...(!publicKey.present ? ["SEIS public key is missing"] : []),
      "Oracle account session, tenancy, compartment, and VM capacity are still owner-side steps",
      "Generated cloud-init must be pasted into Oracle user-data before VM first boot",
      "Generated cloud-init does not prove the VM exists or is reachable",
      "Strict direct-cloud probe and doctor still need a real endpoint"
    ],
    integrityBlockers,
    nextActions: [
      "Review the generated YAML locally before pasting it into Oracle user-data.",
      "Create the Oracle Always Free VM outside git and paste the generated cloud-init YAML at first boot.",
      "After Oracle assigns a public endpoint, activate SEIS-SSH with the generated remote user.",
      "Run strict probe and doctor before claiming ChatGPT mobile/Codex 24x7 readiness."
    ],
    safety: [
      "This generator reads the SSH public key only; it never reads private key material.",
      "The generated YAML is local-only and ignored because it embeds the public key.",
      "No OCI config, token, OCID, hostname, public IP, or session data is read or printed.",
      "No provider API is called, no VM is created, no SSH session is opened, and ~/.ssh/config is not written."
    ],
    outputs: {
      json: outputJson,
      markdown: outputMarkdown,
      yaml: outputYaml
    },
    cloudInitYaml
  };
}

function renderCloudInit(publicKey) {
  const repoParent = dirname(repoDir);
  return `#cloud-config
package_update: true
packages:
  - ca-certificates
  - curl
  - git
  - openssh-server
  - python3
  - nodejs
  - npm

users:
  - default
  - name: ${yamlScalar(remoteUser)}
    shell: /bin/bash
    lock_passwd: true
    ssh_authorized_keys:
      - ${yamlScalar(publicKey)}

write_files:
  - path: /etc/ssh/sshd_config.d/99-seis-mobile-direct-cloud.conf
    owner: root:root
    permissions: "0644"
    content: |
      Port ${sshPort}
      PubkeyAuthentication yes
      PasswordAuthentication no
      PermitRootLogin prohibit-password
      ClientAliveInterval 60
      ClientAliveCountMax 3
      X11Forwarding no
      AllowTcpForwarding no
  - path: /etc/profile.d/seis-mobile-direct-cloud.sh
    owner: root:root
    permissions: "0644"
    content: |
      export SEIS_REPO_DIR="${repoDir}"
      alias seis='cd "${repoDir}"'
      alias seis-status='cd "${repoDir}" && git status --short'
  - path: /etc/seis/README.md
    owner: root:root
    permissions: "0644"
    content: |
      SEIS direct-cloud runtime marker.
      Keep real provider secrets outside git and outside cloud-init user-data.

runcmd:
  - [ sh, -lc, ${yamlScalar(`install -d -m 755 ${shellQuote(repoParent)}`)} ]
  - [ sh, -lc, ${yamlScalar(`test -d ${shellQuote(`${repoDir}/.git`)} || git clone ${shellQuote(repoUrl)} ${shellQuote(repoDir)}`)} ]
  - [ sh, -lc, ${yamlScalar(`chown -R ${shellQuote(remoteUser)}:${shellQuote(remoteUser)} ${shellQuote(repoDir)} || true`)} ]
  - [ sh, -lc, "sshd -t" ]
  - [ sh, -lc, "systemctl enable --now ssh || systemctl enable --now sshd || true" ]
  - [ sh, -lc, "systemctl restart ssh || systemctl restart sshd || true" ]
  - [ sh, -lc, ${yamlScalar(`install -d -m 700 -o ${shellQuote(remoteUser)} -g ${shellQuote(remoteUser)} ${shellQuote(`/home/${remoteUser}/.seis`)}`)} ]
  - [ sh, -lc, ${yamlScalar(`date -Iseconds > ${shellQuote(`/home/${remoteUser}/.seis/mobile-direct-cloud-ready`)}`)} ]
`;
}

function renderMarkdown(report) {
  return `# SEIS SSH Oracle Cloud-Init Handoff

Generated: ${report.generatedAt}

Status: ${report.status}
Mode: ${report.mode}
Alias: ${report.targetAlias}
Provider: ${report.providerId}

## Local Output

| Artifact | Path |
| --- | --- |
| JSON | ${report.outputs.json} |
| Markdown | ${report.outputs.markdown} |
| Cloud-init YAML | ${report.outputs.yaml} |

## Public Key

| Field | Value |
| --- | --- |
| Present | ${report.publicKey.present ? "yes" : "no"} |
| Path | ${report.publicKey.path} |
| Fingerprint | ${report.publicKey.fingerprint || "none"} |
| Comment | ${report.publicKey.comment || "none"} |

## VM Bootstrap Shape

| Field | Value |
| --- | --- |
| Remote user | ${report.remoteUser} |
| Repo URL | ${report.repoUrl} |
| Repo dir | ${report.repoDir} |
| SSH port | ${report.sshPort} |
| Password auth disabled | ${report.cloudInit.disablesPasswordAuth ? "yes" : "no"} |
| Root login | ${report.cloudInit.permitRootLogin} |
| Provider API called | no |
| Live SSH attempted | no |

## Owner Use

1. Review \`${report.outputs.yaml}\` locally.
2. Paste it into Oracle Cloud custom cloud-init/user-data when creating the VM.
3. Wait for the VM public endpoint.
4. Run:

\`\`\`bash
${report.commands.ownerAfterVmBoots}
${report.commands.strictProbe}
${report.commands.strictDoctor}
\`\`\`

## Readiness Blockers

${renderList(report.readinessBlockers, "none")}

## Integrity Blockers

${renderList(report.integrityBlockers, "none")}

## Safety

${renderList(report.safety, "none")}
`;
}

function readPublicKey(file) {
  if (!existsSync(file)) return { present: false, value: "", fingerprint: null, comment: null };
  const value = readFileSync(file, "utf8").trim();
  const parts = value.split(/\s+/);
  return {
    present: true,
    value,
    fingerprint: fingerprintPublicKey(value),
    comment: parts.slice(2).join(" ") || null
  };
}

function isSshPublicKey(value) {
  return /^(ssh-ed25519|ssh-rsa|ecdsa-sha2-nistp(?:256|384|521)|sk-ssh-ed25519@openssh.com|sk-ecdsa-sha2-nistp256@openssh.com)\s+[A-Za-z0-9+/=]+(?:\s+.*)?$/.test(value);
}

function fingerprintPublicKey(value) {
  const parts = String(value || "").split(/\s+/);
  if (parts.length < 2) return null;
  try {
    const digest = createHash("sha256").update(Buffer.from(parts[1], "base64")).digest("base64").replace(/=+$/g, "");
    return `SHA256:${digest}`;
  } catch {
    return null;
  }
}

function yamlScalar(value) {
  return JSON.stringify(String(value));
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function readJson(file, failures) {
  if (!existsSync(file)) {
    failures.push(`missing ${file}`);
    return null;
  }
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    failures.push(`${file} must contain valid JSON: ${error.message}`);
    return null;
  }
}

function withoutYaml(report) {
  const { cloudInitYaml, ...rest } = report;
  return rest;
}

function renderList(values, fallback) {
  if (!Array.isArray(values) || values.length === 0) return `- ${fallback}`;
  return values.map((value) => `- ${value}`).join("\n");
}

function writeFile(file, content) {
  const absolute = resolve(file);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, content, "utf8");
}

function expandHome(value) {
  const text = String(value || "");
  if (text === "~") return homedir();
  if (text.startsWith("~/")) return `${homedir()}/${text.slice(2)}`;
  return text;
}

function redactHome(value) {
  return String(value || "").replaceAll(homedir(), "~");
}

function parseArgs(tokens) {
  const parsed = {};
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === "--") continue;
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    if (["write", "check", "help"].includes(key)) {
      parsed[key] = true;
      continue;
    }
    const value = tokens[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for --${key}`);
    parsed[key] = value;
    index += 1;
  }
  return parsed;
}

function printHelp() {
  console.log(`Usage:
  npm run cloud:ssh:oracle-cloud-init:handoff
  npm run check:seis-ssh-oracle-cloud-init-handoff
  node scripts/create-seis-ssh-oracle-cloud-init-handoff.mjs --write

Options:
  --write              Write JSON, Markdown, and YAML artifacts.
  --check              Validate wiring and local public-key readiness.
  --public-key PATH    SSH public key path. Default: ~/.ssh/id_ed25519_seis_codex.pub.
  --remote-user USER   Remote runtime user. Default: aiuser.
  --repo-url URL       Repo URL cloned by cloud-init.
  --repo-dir PATH      Remote repo directory. Default: /opt/seis/SEIS.
  --ssh-port PORT      SSH port. Default: 22.
  --output PATH        JSON output path.
  --markdown PATH      Markdown output path.
  --yaml PATH          Cloud-init YAML output path.
`);
}
