#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const failures = [];

const matrix = readJson("content/development/seis-public-readiness-status.json");
const packageJson = readJson("package.json");

const lanes = [
  {
    id: "apple-first",
    expectedStatus: "scaffolded-validator-backed",
    evidence: [
      "SEIS_APPLE_FIRST.md",
      "apps/apple/README.md",
      "packages/seis_platform_swift/README.md",
      "docs/apple/APPLE_PUBLIC_READINESS.md"
    ],
    checks: [
      "swift test --package-path packages/seis_platform_swift",
      "npm run check:seis-public-readiness-lanes"
    ],
    scripts: [
      ["check:seis-apple-native-snapshot", "node scripts/check-seis-apple-native-snapshot.mjs"]
    ],
    docs: [
      {
        file: "SEIS_APPLE_FIRST.md",
        snippets: [
          "Apple-first does not mean copying Apple apps",
          "The web app remains the public demo",
          "Do not add meaningless Swift files",
          "Public-Safe Rule"
        ]
      },
      {
        file: "apps/apple/README.md",
        snippets: [
          "packages/seis_platform_swift",
          "Platform Roles",
          "No-Key Policy",
          "SEIS-SSH metadata panels"
        ]
      },
      {
        file: "docs/apple/APPLE_PUBLIC_READINESS.md",
        snippets: [
          "Swift Package verification is run when Swift code changes",
          "fake live AI claims",
          "fake live SSH claims",
          "build passed without evidence"
        ]
      },
      {
        file: "packages/seis_platform_swift/README.md",
        snippets: [
          "no-key public demo",
          "provider, SSH, deployment, or private-vault bridge",
          "npm run check:seis-apple-native-snapshot"
        ]
      }
    ]
  },
  {
    id: "second-brain",
    expectedStatus: "validator-backed-local-demo",
    evidence: [
      "docs/OBSIDIAN_SECOND_BRAIN.md",
      "seis-brain/README.md",
      "docs/product/seis-second-brain.md",
      "docs/product/seis-obsidian-bridge-safe-import.md"
    ],
    checks: [
      "npm run check:seis-brain-context-packs",
      "npm run check:seis-second-brain",
      "npm run check:seis-second-brain-readiness-contracts",
      "npm run check:seis-public-readiness-lanes"
    ],
    scripts: [
      ["check:seis-brain-context-packs", "node scripts/check-seis-brain-context-packs.mjs"],
      ["check:seis-second-brain", "node scripts/check-seis-second-brain.mjs"],
      [
        "check:seis-second-brain-readiness-contracts",
        "node scripts/check-seis-second-brain-readiness-contracts.mjs"
      ]
    ],
    docs: [
      {
        file: "docs/OBSIDIAN_SECOND_BRAIN.md",
        snippets: [
          "public-safe Obsidian-compatible",
          "not a private vault import feature",
          "Do not commit private note bodies",
          "Future Import Gate"
        ]
      },
      {
        file: "seis-brain/README.md",
        snippets: [
          "visibility: public",
          "public-safe",
          "not a private Obsidian vault import",
          "npm run check:seis-brain-context-packs"
        ]
      },
      {
        file: "seis-brain/vault/13_Public_Private_Boundaries/Public Safe Boundary.md",
        snippets: [
          "Real API keys",
          "SSH private keys",
          "Private Obsidian note bodies",
          "Unreviewed assistant output"
        ]
      }
    ]
  },
  {
    id: "seis-ssh",
    expectedStatus: "metadata-only-strict-live-gated",
    evidence: [
      "docs/SEIS_SSH_SETUP.md",
      "docs/operations/seis-cloud-foundation.md",
      "server/cloud/ssh-ai-shell/README.md"
    ],
    checks: [
      "npm run check:seis-ssh-access-model",
      "npm run check:seis-ssh-picker-compatibility",
      "npm run check:seis-ssh-cloud-roadmap",
      "npm run check:seis-public-readiness-lanes"
    ],
    scripts: [
      ["check:seis-ssh-access-model", "node scripts/check-seis-ssh-access-model.mjs"],
      ["check:seis-ssh-picker-compatibility", "node scripts/check-seis-ssh-picker-compatibility.mjs"],
      ["check:seis-ssh-cloud-roadmap", "node scripts/check-seis-ssh-cloud-roadmap.mjs"]
    ],
    docs: [
      {
        file: "docs/SEIS_SSH_SETUP.md",
        snippets: [
          "credential-free",
          "must not contain real SSH private keys",
          "Live Claim Gate",
          "Do not use passing docs checks as proof of a live SSH session"
        ]
      },
      {
        file: "deploy/seis-ssh-access-model.json",
        json: {
          id: "seis-ssh-access-model",
          defaultVisibleAlias: "SEIS-SSH"
        }
      },
      {
        file: "deploy/seis-ssh-cloud-roadmap.json",
        json: {
          id: "seis-ssh-cloud-roadmap",
          targetAlias: "SEIS-SSH"
        }
      }
    ]
  }
];

ensure(
  packageJson?.scripts?.["check:seis-public-readiness-lanes"] ===
    "node scripts/check-seis-public-readiness-lanes.mjs",
  "package.json must expose check:seis-public-readiness-lanes"
);

for (const lane of lanes) {
  validateLane(lane);
}

if (failures.length > 0) {
  console.error("SEIS public readiness lane check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `SEIS public readiness lane check passed: ${lanes.length} lanes guarded (Apple-first, SEIS Brain, SEIS-SSH).`
);

function validateLane(lane) {
  const surface = (matrix?.surfaces || []).find((candidate) => candidate.id === lane.id);
  ensure(Boolean(surface), `matrix missing ${lane.id} surface`);
  ensure(surface?.status === lane.expectedStatus, `${lane.id} status must be ${lane.expectedStatus}`);
  ensure(surface?.publicSafe === true, `${lane.id} must stay public-safe`);
  ensure(surface?.liveClaimAllowed === false, `${lane.id} must block live claims`);

  for (const evidence of lane.evidence) {
    ensure((surface?.evidence || []).includes(evidence), `${lane.id} evidence must include ${evidence}`);
    ensureFile(evidence, `${lane.id} evidence`);
  }

  for (const check of lane.checks) {
    ensure((surface?.requiredChecks || []).includes(check), `${lane.id} required checks must include ${check}`);
  }

  for (const [scriptName, expectedCommand] of lane.scripts) {
    ensure(
      packageJson?.scripts?.[scriptName] === expectedCommand,
      `package.json must expose ${scriptName} as ${expectedCommand}`
    );
  }

  for (const doc of lane.docs) {
    if (doc.snippets) {
      const text = readText(doc.file);
      validateNoSensitivePatterns(doc.file, text);
      for (const snippet of doc.snippets) {
        ensure(text.includes(snippet), `${doc.file} must include ${snippet}`);
      }
    }

    if (doc.json) {
      const value = readJson(doc.file);
      for (const [key, expected] of Object.entries(doc.json)) {
        ensure(value?.[key] === expected, `${doc.file} must set ${key} to ${expected}`);
      }
      validateNoSensitivePatterns(doc.file, JSON.stringify(value || {}));
    }
  }

  ensure(
    (surface?.blockers || []).some((blocker) => /live|Private|credential|claim|approval|unclaimed|GitHub/i.test(blocker)),
    `${lane.id} must retain explicit live/private/claim blockers`
  );
}

function ensureFile(file, label) {
  if (!existsSync(resolve(root, file))) {
    failures.push(`${label} missing: ${file}`);
  }
}

function readText(file) {
  const absolutePath = resolve(root, file);
  if (!existsSync(absolutePath)) {
    failures.push(`missing ${file}`);
    return "";
  }
  return readFileSync(absolutePath, "utf8");
}

function readJson(file) {
  const text = readText(file);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    failures.push(`${file} must be valid JSON: ${error.message}`);
    return null;
  }
}

function ensure(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function validateNoSensitivePatterns(label, text) {
  const patterns = [
    ["SSH private key block", /BEGIN (OPENSSH|RSA|EC) PRIVATE KEY/],
    ["GitHub token", /ghp_|github_pat_/],
    ["OpenAI key value", /OPENAI_API_KEY=.+/],
    ["Anthropic key value", /ANTHROPIC_API_KEY=.+/],
    ["Gemini key value", /GEMINI_API_KEY=.+/],
    ["Private key value", /PRIVATE_KEY=.+/],
    ["AWS secret key value", /AWS_SECRET_ACCESS_KEY=.+/],
    ["password value", /password=.+/i],
    ["token value", /token=.+/i],
    ["sk-style provider key", /\bsk-[A-Za-z0-9_-]{12,}/]
  ];

  for (const [kind, pattern] of patterns) {
    ensure(!pattern.test(text), `${label} must not include ${kind}`);
  }
}
