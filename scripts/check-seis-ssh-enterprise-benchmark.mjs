#!/usr/bin/env node

import fs from "node:fs";
import { spawnSync } from "node:child_process";

const args = parseArgs(process.argv.slice(2));
const includeLive = args.live;
const asJson = args.json;
const host = args.host || "SEIS-SSH";

if (args.help) {
  printHelp();
  process.exit(0);
}

const root = process.cwd();

const checks = [];
let score = 0;
let weightTotal = 0;

const evidence = [];

const accessModel = readJson("deploy/seis-ssh-access-model.json", true);
const roadmap = readJson("deploy/seis-ssh-cloud-roadmap.json", true);
const contract = readJson("deploy/seis-ssh-closed-runtime-contract.json", true);
const publicAccessContract = readJson("deploy/seis-ssh-public-access-contract.json", true);
const liveReadinessEvidence = readJson("content/development/seis-ssh-live-readiness-evidence.json", true);
const packageJson = readJson("package.json", true);
const installSh = readText("server/cloud/ssh-ai-shell/install.sh");
const daemonService = readText("server/cloud/ssh-ai-shell/systemd/ssh-ai.service");
const onlineScript = readText("scripts/check-seis-cloud-ssh-online.mjs");
const toolsScript = readText("server/cloud/ssh-ai-shell/tools.py");
const pluginLoader = readText("server/cloud/ssh-ai-shell/plugin_loader.py");
const sandboxScript = readText("server/cloud/ssh-ai-shell/sandbox.py");
const enterpriseBenchmark = readJson("deploy/seis-ssh-5-year-enterprise-benchmark.json", true)
  || roadmap?.enterpriseBenchmark;

addCheck({
  id: "seis-ssh-single-alias",
  label: "Tek giriş yüzeyi: sadece SEIS-SSH",
  category: "identity",
  weight: 12,
  pass: accessModel?.visibility?.activeAliases?.length === 1
    && accessModel.visibility.activeAliases[0] === "SEIS-SSH",
  evidence: {
    source: "deploy/seis-ssh-access-model.json",
    value: accessModel?.visibility?.activeAliases,
  },
  summary: "SEIS-SSH tek aktif alias değilse, picker drift olur.",
});

addCheck({
  id: "seis-ssh-cloud-only",
  label: "Yerel/MAC/LAN bağımlılığı yok",
  category: "network",
  weight: 14,
  pass: !accessModel?.visibility?.localMachineHostsAllowed
    && accessModel?.visibility?.forbiddenVisibleAliases?.some((item) => item.includes("local"))
    && accessModel?.visibility?.directVpsAliasesAllowedInCodexPicker === false,
  evidence: {
    source: "deploy/seis-ssh-access-model.json",
    value: {
      localMachineHostsAllowed: accessModel?.visibility?.localMachineHostsAllowed,
      forbiddenAliases: accessModel?.visibility?.forbiddenVisibleAliases,
      directVpsAliasesAllowedInCodexPicker: accessModel?.visibility?.directVpsAliasesAllowedInCodexPicker,
    },
  },
  summary: "Apple ve büyük AI operasyonlarında yerel bilgisayar kimliği ile cloud yerine bağlantı kalıcı çözülenir.",
});

addCheck({
  id: "seis-ssh-capability-check",
  label: "Online tanımı sadece ping değil hazır olma olmalı",
  category: "readiness",
  weight: 16,
  pass: accessModel?.longTermDevelopment?.pickerCompatibilityCheck === "npm run check:seis-ssh-picker-compatibility",
  evidence: {
    source: "deploy/seis-ssh-access-model.json",
    value: accessModel?.longTermDevelopment?.promotionGates?.[0],
  },
  summary: "Google stilinde readiness, sadece bağlantı değil işlevsel hazır olmayı doğrular.",
});

addCheck({
  id: "seis-ssh-roadmap-closed-runtime",
  label: "Geliştirici tarafı kapalı runtime sözleşmesi bağlı",
  category: "control-plane",
  weight: 12,
  pass: roadmap?.closedDeveloperRuntime?.contract === "deploy/seis-ssh-closed-runtime-contract.json"
    && contract?.handoffManifestSpec?.secretDisclosureMustEqual === "none",
  evidence: {
    source: [
      "deploy/seis-ssh-cloud-roadmap.json",
      "deploy/seis-ssh-closed-runtime-contract.json",
    ],
    value: {
      contract: roadmap?.closedDeveloperRuntime?.contract,
      secretDisclosure: contract?.handoffManifestSpec?.secretDisclosureMustEqual,
    },
  },
  summary: "Büyük firmalar hassas çalışma yüzeyini açık artifact içine taşımaz.",
});

addCheck({
  id: "seis-ssh-check-coverage",
  label: "Check katmanı (governance) yeterli",
  category: "governance",
  weight: 12,
  pass: Boolean(packageJson?.scripts?.["check:seis-ssh-access-model"])
    && Boolean(packageJson?.scripts?.["check:seis-ssh-picker-compatibility"])
    && Boolean(packageJson?.scripts?.["check:seis-ssh-public-access"])
    && Boolean(packageJson?.scripts?.["check:seis-ssh-public-onboarding"])
    && Boolean(packageJson?.scripts?.["check:seis-ssh-public-contributor-doctor"])
    && Boolean(packageJson?.scripts?.["check:seis-ssh-live-readiness-evidence"])
    && Boolean(packageJson?.scripts?.["check:seis-ssh-closed-runtime"])
    && Boolean(packageJson?.scripts?.["check:seis-ssh-cloud-roadmap"]),
  evidence: {
    source: "package.json",
    value: {
      accessModel: packageJson?.scripts?.["check:seis-ssh-access-model"],
      picker: packageJson?.scripts?.["check:seis-ssh-picker-compatibility"],
      publicAccess: packageJson?.scripts?.["check:seis-ssh-public-access"],
      publicOnboarding: packageJson?.scripts?.["check:seis-ssh-public-onboarding"],
      publicContributorDoctor: packageJson?.scripts?.["check:seis-ssh-public-contributor-doctor"],
      liveReadinessEvidence: packageJson?.scripts?.["check:seis-ssh-live-readiness-evidence"],
      closedRuntime: packageJson?.scripts?.["check:seis-ssh-closed-runtime"],
      roadmap: packageJson?.scripts?.["check:seis-ssh-cloud-roadmap"],
    },
  },
  summary: "Birden fazla denetim birikimi; tek noktadan onay yerine kontrollü guardrail seti.",
});

addCheck({
  id: "seis-ssh-public-github-access",
  label: "Public GitHub access keeps server and port stable",
  category: "governance",
  weight: 8,
  pass: publicAccessContract?.id === "seis-ssh-public-access-contract"
    && publicAccessContract?.targetAlias === "SEIS-SSH"
    && publicAccessContract?.serverAndPortPolicy?.mode === "preserve-existing-server-and-port"
    && publicAccessContract?.serverAndPortPolicy?.englishInvariant === "Keep the same server and port."
    && (publicAccessContract?.approvalGates || []).includes("change-server-or-port")
    && (publicAccessContract?.requiredCommands || []).includes("npm run check:seis-ssh-public-onboarding")
    && (publicAccessContract?.requiredCommands || []).includes("npm run check:seis-ssh-public-contributor-doctor")
    && (publicAccessContract?.requiredCommands || []).includes("npm run check:seis-ssh-live-readiness-evidence")
    && (publicAccessContract?.evidenceSurfaces || []).includes("scripts/create-seis-ssh-public-onboarding-pack.mjs")
    && (publicAccessContract?.evidenceSurfaces || []).includes("scripts/check-seis-ssh-public-contributor-doctor.mjs")
    && (publicAccessContract?.evidenceSurfaces || []).includes("content/development/seis-ssh-live-readiness-evidence.json")
    && liveReadinessEvidence?.targetAlias === "SEIS-SSH"
    && liveReadinessEvidence?.serverAndPortPolicy?.serverOrPortChanged === false
    && accessModel?.publicAccessContract === "deploy/seis-ssh-public-access-contract.json"
    && roadmap?.publicAccessContract === "deploy/seis-ssh-public-access-contract.json",
  evidence: {
    source: [
      "deploy/seis-ssh-public-access-contract.json",
      "deploy/seis-ssh-access-model.json",
      "deploy/seis-ssh-cloud-roadmap.json",
    ],
    value: {
      alias: publicAccessContract?.targetAlias,
      invariant: publicAccessContract?.serverAndPortPolicy?.englishInvariant,
      policy: publicAccessContract?.serverAndPortPolicy?.mode,
      approvalGate: "change-server-or-port",
      onboardingGate: "npm run check:seis-ssh-public-onboarding",
      contributorDoctorGate: "npm run check:seis-ssh-public-contributor-doctor",
      liveEvidenceStatus: liveReadinessEvidence?.status,
    },
  },
  summary: "GitHub'da herkesin kullanabilecegi SSH deneyimi, alias sadeligi kadar mevcut sunucu ve portun izinsiz degismemesine de bagli.",
});

addCheck({
  id: "seis-ssh-key-only-sshd",
  label: "Passwordless SSH (public key default)",
  category: "identity",
  weight: 12,
  pass: /PasswordAuthentication\s+no/i.test(installSh || "")
    && /AuthenticationMethods\s+publickey/i.test(installSh || "")
    && /PubkeyAuthentication\s+yes/i.test(installSh || ""),
  evidence: {
    source: "server/cloud/ssh-ai-shell/install.sh",
    value: pickLines(installSh, [
      "PasswordAuthentication",
      "AuthenticationMethods",
      "PubkeyAuthentication",
    ]),
  },
  summary: "Büyük firmalar default olarak password ile SSH açmaz.",
});

addCheck({
  id: "seis-ssh-5-year-enterprise-contract",
  label: "5 yıllık enterprise benchmark manifesti mevcut",
  category: "roadmap",
  weight: 6,
  pass: Boolean(
    enterpriseBenchmark &&
    enterpriseBenchmark.id === "seis-ssh-5-year-enterprise-benchmark" &&
    enterpriseBenchmark.version === 1
  ),
  evidence: {
    source: "deploy/seis-ssh-5-year-enterprise-benchmark.json",
    value: {
      id: enterpriseBenchmark?.id,
      version: enterpriseBenchmark?.version,
      title: enterpriseBenchmark?.title,
    },
  },
  summary: "5 yıllık hedefin kanıtlanabilir bir manifesti olmadan uzun dönem güvenlik yalnızca niyet seviyesinde kalır.",
});

addCheck({
  id: "seis-ssh-5-year-official-reference-baseline",
  label: "Resmi kaynak bazlı enterprise dayanak",
  category: "roadmap",
  weight: 8,
  pass: hasOfficialReferences([
    "nist-zero-trust",
    "apple-managed-device-attestation",
    "google-beyondcorp",
    "microsoft-zero-trust",
    "openssh-forcecommand",
    "github-ssh-ca",
    "aws-session-manager",
  ]),
  evidence: {
    source: "deploy/seis-ssh-5-year-enterprise-benchmark.json",
    value: enterpriseBenchmark?.officialReferenceBaseline?.map((item) => item.id),
  },
  summary: "Apple/big-tech/AI-company modeli resmi zero trust, device trust, SSH confinement, SSH CA ve brokered-session kaynaklarına bağlanmalı.",
});

addCheck({
  id: "seis-ssh-5-year-control-plane",
  label: "5. yıl hedefi identity-aware broker",
  category: "control-plane",
  weight: 8,
  pass: enterpriseBenchmark?.targetControlPlane?.year5Default === "identity-aware-ssh-broker"
    && (enterpriseBenchmark?.targetControlPlane?.accessMethodOrder || []).includes("short-lived-ssh-certificates")
    && (enterpriseBenchmark?.targetControlPlane?.nonGoals || []).includes("long-lived-shared-private-keys")
    && accessModel?.longTermDevelopment?.enterpriseBenchmarkSource === "deploy/seis-ssh-5-year-enterprise-benchmark.json"
    && roadmap?.enterpriseBenchmarkSource === "deploy/seis-ssh-5-year-enterprise-benchmark.json",
  evidence: {
    source: [
      "deploy/seis-ssh-5-year-enterprise-benchmark.json",
      "deploy/seis-ssh-access-model.json",
      "deploy/seis-ssh-cloud-roadmap.json",
    ],
    value: {
      year5Default: enterpriseBenchmark?.targetControlPlane?.year5Default,
      accessMethodOrder: enterpriseBenchmark?.targetControlPlane?.accessMethodOrder,
      accessModelSource: accessModel?.longTermDevelopment?.enterpriseBenchmarkSource,
      roadmapSource: roadmap?.enterpriseBenchmarkSource,
    },
  },
  summary: "Direct-cloud SSH picker uyumluluğu için ara adımdır; 5 yıllık hedef kimlik farkındalığı olan broker + kısa ömürlü sertifikadır.",
});

addCheck({
  id: "seis-ssh-5-year-company-patterns",
  label: "Apple/Google/Büyük AI karşılaştırması modele gömülü",
  category: "roadmap",
  weight: 6,
  pass: Boolean(
    enterpriseBenchmark?.referenceCompanyPatterns?.length >= 3 &&
    enterpriseBenchmark.referenceCompanyPatterns.some((item) => item.name === "Apple") &&
    enterpriseBenchmark.referenceCompanyPatterns.some((item) => item.name === "Google") &&
    enterpriseBenchmark.referenceCompanyPatterns.some((item) => item.name === "Large AI Companies")
  ),
  evidence: {
    source: "deploy/seis-ssh-5-year-enterprise-benchmark.json",
    value: enterpriseBenchmark?.referenceCompanyPatterns?.map((item) => item.name),
  },
  summary: "Büyük şirket referansı yalnızca metin seviyesinde değil, kaliteye bağlanmış şirket modelinde olmalı.",
});

addCheck({
  id: "seis-ssh-5-year-phase-maturity",
  label: "Yıl 1–5 olgunluk fazları tanımlı",
  category: "roadmap",
  weight: 10,
  pass: Array.isArray(enterpriseBenchmark?.years)
    && enterpriseBenchmark.years.length === 5
    && enterpriseBenchmark.years.every((phase, index) =>
      phase.year === index + 1
      && phase.expectedControls?.length >= 4
      && phase.minimumKPIs
      && phase.deliverables?.length >= 2
    ),
  evidence: {
    source: "deploy/seis-ssh-5-year-enterprise-benchmark.json",
    value: enterpriseBenchmark?.years?.map((phase) => ({
      year: phase.year,
      name: phase.name,
      controls: phase.expectedControls?.length || 0,
      deliverables: phase.deliverables?.length || 0,
    })),
  },
  summary: "5 yıllık plan, her yılın teknik ve operasyonel hedefini açıkça taşımalı.",
});

addCheck({
  id: "seis-ssh-5-year-kpi-gates",
  label: "KPI kapıları açıkça tanımlanmış",
  category: "governance",
  weight: 10,
  pass: Boolean(
    enterpriseBenchmark?.kpiFramework?.overallTarget
    && enterpriseBenchmark?.kpiFramework?.gateThresholds
    && enterpriseBenchmark.kpiFramework.gateThresholds.year1
    && enterpriseBenchmark.kpiFramework.gateThresholds.year3
    && enterpriseBenchmark.kpiFramework.gateThresholds.year5
  ),
  evidence: {
    source: "deploy/seis-ssh-5-year-enterprise-benchmark.json",
    value: {
      overallTarget: enterpriseBenchmark?.kpiFramework?.overallTarget,
      gateThresholds: Object.keys(enterpriseBenchmark?.kpiFramework?.gateThresholds || {}),
    },
  },
  summary: "Büyük teknoloji ölçüm yaklaşımında her yolun net kabul eşiği olur; metin değil kontrat önemli.",
});

addCheck({
  id: "seis-ssh-daemon-hardening",
  label: "Daemon izolasyon ayarları",
  category: "platform",
  weight: 12,
  pass: /ProtectSystem=strict/i.test(daemonService || "")
    && /NoNewPrivileges=true/i.test(daemonService || "")
    && /RestrictAddressFamilies=AF_INET AF_INET6/i.test(daemonService || "")
    && /EnvironmentFile=/.test(daemonService || ""),
  evidence: {
    source: "server/cloud/ssh-ai-shell/systemd/ssh-ai.service",
    value: pickLines(daemonService, [
      "ProtectSystem",
      "NoNewPrivileges",
      "RestrictAddressFamilies",
      "EnvironmentFile",
    ]),
  },
  summary: "Büyük teknoloji yaklaşımı, servisi containerized-like izolasyona iter.",
});

addCheck({
  id: "seis-ssh-tool-hardening-alignment",
  label: "Tool/plugin yüzeyi kontrol edilebilir",
  category: "tooling",
  weight: 10,
  pass: /TOOL_DEFINITIONS/.test(toolsScript || "")
    && /def dispatch/.test(pluginLoader || "")
    && /def run/.test(sandboxScript || "")
    && /ssh-config-not-cloud-only/.test(onlineScript || "")
    && /ssh-picker-not-compatible/.test(onlineScript || ""),
  evidence: {
    source: [
      "scripts/check-seis-ssh-access-model.mjs",
      "server/cloud/ssh-ai-shell",
    ],
    value: {
      checkScriptHasToolingRefs: /ssh-config-not-cloud-only/.test(onlineScript || "")
        && /ssh-picker-not-compatible/.test(onlineScript || ""),
      toolingFileExists: Boolean(fs.existsSync("server/cloud/ssh-ai-shell/tools.py")),
    },
  },
  summary: "Sandbox ve tool whitelist, AI ajanlı terminalde kritik bir güvenlik kalkanıdır.",
});

if (includeLive) {
  addLiveCheck({
    id: "seis-ssh-online-live",
    label: "Canlı online readiness (opsiyonel, --live)",
    category: "readiness",
    weight: 12,
    command: [
      "npm",
      "run",
      "cloud:ssh:online:strict",
      "--",
      "--host",
      host,
      "--require-ready",
    ],
    rationale: "Canlı çevrimde remote repo, codex ve transport durumuna bakar.",
  });
}

const result = {
  timestamp: new Date().toISOString(),
  mode: includeLive ? "live+static" : "static-only",
  score: Math.round(score / weightTotal * 100),
  status: score >= 85 ? "strong" : score >= 65 ? "needs-work" : "weak",
  checks,
  summary: {
    pass: checks.filter((check) => check.status === "pass").length,
    warning: checks.filter((check) => check.status === "warning").length,
    fail: checks.filter((check) => check.status === "fail").length,
  },
  actionPlan: suggestActions(),
};

if (asJson) {
  console.log(JSON.stringify(result, null, 2));
} else {
  printHuman(result);
}

if (result.summary.fail > 0) {
  process.exit(1);
}

function addCheck({ id, label, category, weight, pass, evidence, summary }) {
  const status = pass ? "pass" : "fail";
  weightTotal += weight;
  score += pass ? weight : 0;
  checks.push({
    id,
    category,
    label,
    status,
    weight,
    summary,
    evidence,
  });
}

function addLiveCheck({ id, label, category, weight, command, rationale }) {
  const [cmd, ...cmdArgs] = command;
  const run = spawnSync(cmd, cmdArgs, { encoding: "utf8", timeout: 45000 });
  const pass = run.status === 0;
  const out = (run.stdout || "").trim();
  const err = (run.stderr || "").trim();
  weightTotal += weight;
  score += pass ? weight : 0;
  checks.push({
    id,
    category,
    label,
    status: pass ? "pass" : "fail",
    weight,
    summary: pass ? "Canlı online readiness başarılı." : `Başarısız: ${err || "command exit > 0"}`,
    evidence: {
      command,
      output: out,
      stderr: err || null,
      rationale,
    },
  });
}

function suggestActions() {
  const next = [];
  const failed = checks.filter((check) => check.status === "fail").map((check) => check.id);
  if (failed.includes("seis-ssh-single-alias")) {
    next.push("npm run cloud:ssh-config:install -- --transport codespace");
  }
  if (failed.includes("seis-ssh-cloud-only")) {
    next.push("Kullanıcı alias'ında local/mac/lan hedefleri kalmamalı; tekrar kurulumla tek hedef modeli doğrula.");
  }
  if (failed.includes("seis-ssh-key-only-sshd")) {
    next.push("install.sh'nin ForceCommand bloğunda PasswordAuthentication no + public key zorunluluğu olsun.");
  }
  if (failed.some((id) => id.startsWith("seis-ssh-5-year"))) {
    next.push("deploy/seis-ssh-5-year-enterprise-benchmark.json dosyasını güncelleyin; Yıl 1–5 olgunluk, kontrol ve KPI eşiği açık kalmalı.");
  }
  if (failed.includes("seis-ssh-daemon-hardening")) {
    next.push("systemd servisine NoNewPrivileges, ProtectSystem=strict, private users ve system call korumasını ekle.");
  }
  if (!next.length) {
    next.push("Geçiş puanı güçlü. Büyük şirket standardı için canlı readiness + secret-rotation cadence eklenebilir.");
  }
  return next;
}

function printHuman(result) {
  const lines = [];
  lines.push("SEIS SSH Enterprise Benchmark");
  lines.push(`Status: ${result.status.toUpperCase()}`);
  lines.push(`Score: ${result.score}/100 (${result.mode})`);
  lines.push(`Pass/Fail: ${result.summary.pass}/${result.summary.fail}`);
  lines.push("");

  const groups = new Map();
  for (const check of result.checks) {
    if (!groups.has(check.category)) groups.set(check.category, []);
    groups.get(check.category).push(check);
  }
  for (const [name, list] of groups) {
    lines.push(`- ${name}`);
    for (const check of list) {
      const mark = check.status === "pass" ? "✓" : "✗";
      lines.push(`  ${mark} ${check.label} [${check.id}]`);
      if (check.summary) {
        lines.push(`    ${check.summary}`);
      }
      if (check.evidence?.value !== undefined) {
        lines.push(`    evidence: ${JSON.stringify(check.evidence.value)}`);
      }
    }
  }

  lines.push("");
  lines.push("Recommended next:");
  for (const action of result.actionPlan) {
    lines.push(`- ${action}`);
  }
  console.log(lines.join("\n"));
}

function readText(filePath) {
  const absolute = `${root}/${filePath}`;
  if (!fs.existsSync(absolute)) {
    return "";
  }
  return fs.readFileSync(absolute, "utf8");
}

function readJson(filePath, allowMissing = false) {
  const absolute = `${root}/${filePath}`;
  if (!fs.existsSync(absolute)) {
    if (!allowMissing) {
      evidence.push(`Missing: ${filePath}`);
    }
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(absolute, "utf8"));
  } catch {
    evidence.push(`Invalid JSON: ${filePath}`);
    return null;
  }
}

function pickLines(content, keys) {
  const lines = (content || "").split("\n");
  return keys.flatMap((key) => lines.filter((line) => line.includes(key)));
}

function hasOfficialReferences(requiredIds) {
  const refs = new Map((enterpriseBenchmark?.officialReferenceBaseline || []).map((item) => [item.id, item]));
  return requiredIds.every((id) => {
    const item = refs.get(id);
    return item && item.url && item.source && item.principle;
  });
}

function parseArgs(tokens) {
  const parsed = {};
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === "--") continue;
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    if (key === "help" || key === "live" || key === "json") {
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
  npm run check:seis-ssh-enterprise-benchmark
  npm run check:seis-ssh-enterprise-benchmark -- --live
  npm run check:seis-ssh-enterprise-benchmark -- --live --host SEIS-SSH --json

Options:
  --host HOST       SSH alias to probe for live readiness (default: SEIS-SSH).
  --live            Include live online readiness test.
  --json            Force JSON output format.
`);
}
