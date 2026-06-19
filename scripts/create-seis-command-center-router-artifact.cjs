#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { chooseAutoRoute } = require("./ai-routing-policy.cjs");

const root = path.join(__dirname, "..");
const outputPath = path.join(root, "apps", "seis-core", "data", "seis-router-routes.json");
const checkOnly = process.argv.includes("--check");

const laneProfiles = [
  {
    laneId: "seis",
    label: "SEIS Hub",
    owner: "Architect Agent",
    status: "Ready",
    sampleIntent: "Create the God Mode architecture roadmap scope ecosystem coordination plan.",
    signal: "Architecture, roadmap, ecosystem coordination, and God Mode scope.",
    handoff: "Frame the mission, risk boundary, validation evidence, and rollback path."
  },
  {
    laneId: "seis-governance",
    label: "Governance",
    owner: "Documentation Agent",
    status: "Ready",
    sampleIntent: "Prepare release quality license governance policy handoff evidence.",
    signal: "Release readiness, quality gates, license posture, and handoff evidence.",
    handoff: "Attach governance proof before commit, push, or completion claims."
  },
  {
    laneId: "seis-cloud",
    label: "Cloud",
    owner: "DevOps Agent",
    status: "Review",
    sampleIntent: "Check cloud deployment provider ssh vpn rollback cost readiness.",
    signal: "Cloud, SSH, VPN, deployment, rollback, cost, and provider readiness.",
    handoff: "Keep local, GitHub, and SEIS Cloud boundaries explicit before access changes."
  },
  {
    laneId: "seis-code",
    label: "Code",
    owner: "Frontend Agent",
    status: "Ready",
    sampleIntent: "Use codex primary execution for code MCP tool runtime bug tests package patch.",
    signal: "Code changes, MCP tools, runtime fixes, tests, and package scripts.",
    handoff: "Implement the smallest durable slice and leave validation hooks visible."
  },
  {
    laneId: "seis-design",
    label: "Design",
    owner: "Design System Agent",
    status: "Ready",
    sampleIntent: "Open design visual prototype for UI UX accessibility responsive motion layout.",
    signal: "UI hierarchy, accessibility, motion, responsive behavior, and design tokens.",
    handoff: "Preserve calm density while making the operational state easier to scan."
  },
  {
    laneId: "seis-data",
    label: "Data",
    owner: "AI Systems Agent",
    status: "Ready",
    sampleIntent: "Transform dataset memory schema provenance training report RAG quality evidence.",
    signal: "Datasets, memory, provenance, schemas, training evidence, and quality signals.",
    handoff: "Keep synthetic data, source policy, and redaction boundaries attached."
  },
  {
    laneId: "seis-security",
    label: "Security",
    owner: "Security Agent",
    status: "Ready",
    sampleIntent: "Audit secret token credential redaction vulnerability permission hardening exposure security risk.",
    signal: "Secrets, private keys, vulnerabilities, hardening, permissions, and risk.",
    handoff: "Apply the safety floor before any lower-risk lane can execute."
  },
  {
    laneId: "seis-research",
    label: "Research",
    owner: "Research Agent",
    status: "Active",
    sampleIntent: "Browser research official documentation standards version compatibility source quality.",
    signal: "Official docs, standards, compatibility, source quality, and evidence checks.",
    handoff: "Convert external assumptions into cited evidence before architecture decisions."
  },
  {
    laneId: "seis-automation",
    label: "Automation",
    owner: "DevOps Agent",
    status: "Ready",
    sampleIntent: "Prepare idempotent dry-run automation workflow scheduled runbook generator repeatable failure-handling validation output.",
    signal: "Idempotent workflows, schedules, runbooks, dry-runs, and rollback steps.",
    handoff: "Make every automated action explainable, reversible, and evidence-producing."
  },
  {
    laneId: "seis-product",
    label: "Product",
    owner: "Architect Agent",
    status: "Active",
    sampleIntent: "Define product requirements acceptance launch outcome milestone roadmap-slice user-jobs non-goals.",
    signal: "Requirements, acceptance criteria, launch readiness, user outcomes, and non-goals.",
    handoff: "Translate strategy into one shippable roadmap slice with explicit boundaries."
  }
];

function buildArtifact() {
  const routes = laneProfiles.map((profile) => {
    const route = chooseAutoRoute(profile.sampleIntent);
    return {
      laneId: route.laneId,
      expectedLaneId: profile.laneId,
      label: profile.label,
      owner: profile.owner,
      status: profile.status,
      intent: route.intent,
      signal: profile.signal,
      handoff: profile.handoff,
      tool: route.tool,
      selectedTool: route.selectedTool,
      integrationTool: route.integrationTool,
      defaultGate: route.defaultGate,
      routeSource: route.routeSource,
      learnedLaneId: route.learnedLaneId,
      safetyLaneId: route.safetyLaneId,
      safetyAdjusted: route.safetyAdjusted,
      reasons: route.reasons
    };
  });

  const mismatches = routes.filter((route) => route.laneId !== route.expectedLaneId);
  if (mismatches.length > 0) {
    throw new Error(
      `SEIS router artifact lane mismatch: ${mismatches
        .map((route) => `${route.expectedLaneId}->${route.laneId}`)
        .join(", ")}`
    );
  }

  return {
    artifactId: "seis-command-center-router-routes",
    schemaVersion: "1.0.0",
    generatedBy: "scripts/create-seis-command-center-router-artifact.cjs",
    sourcePolicy: "scripts/ai-routing-policy.cjs#chooseAutoRoute",
    sourceModel: "packages/seis-ai/models/agent-router-seed-v0.json",
    routeCount: routes.length,
    summary: {
      lanes: routes.length,
      ready: routes.filter((route) => route.status === "Ready").length,
      safetyFloor: "seis-security",
      routeSources: [...new Set(routes.map((route) => route.routeSource))]
    },
    routes
  };
}

function serializeArtifact(artifact) {
  return `${JSON.stringify(artifact, null, 2)}\n`;
}

const nextContent = serializeArtifact(buildArtifact());

if (checkOnly) {
  const currentContent = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, "utf8") : "";
  if (currentContent !== nextContent) {
    throw new Error(`SEIS Command Center router artifact is stale: ${path.relative(root, outputPath)}`);
  }
  console.log(`SEIS Command Center router artifact is current: ${path.relative(root, outputPath)}`);
} else {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, nextContent);
  console.log(`SEIS Command Center router artifact written: ${path.relative(root, outputPath)}`);
}
