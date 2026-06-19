const fs = require("node:fs");
const path = require("node:path");

const TOKEN_PATTERN = /[a-z0-9_-]{2,}/g;
const SEIS_AGENT_ROUTER_ARTIFACT_PATH = path.join(
  __dirname,
  "..",
  "packages",
  "seis-ai",
  "models",
  "agent-router-seed-v0.json"
);

const SEIS_LANE_RISK_ORDER = Object.freeze({
  seis: 0,
  "seis-design": 1,
  "seis-data": 2,
  "seis-product": 3,
  "seis-research": 4,
  "seis-automation": 5,
  "seis-code": 6,
  "seis-governance": 7,
  "seis-security": 8,
  "seis-cloud": 9
});

const SEIS_SAFETY_KEYWORDS = Object.freeze({
  "seis-cloud": ["cloud", "deploy", "deployment", "provider", "ssh", "vpn", "wireguard", "bootstrap", "rollback", "cost"],
  "seis-governance": ["release", "security", "license", "quality", "ci", "github", "handoff", "policy", "governance", "status", "check", "validation"],
  "seis-design": ["design", "ui", "ux", "accessibility", "responsive", "motion", "visual", "layout"],
  "seis-data": ["data", "dataset", "schema", "memory", "provenance", "training", "report", "rag"],
  "seis-security": ["threat", "vulnerability", "secret", "secrets", "credential", "token", "redaction", "permission", "permissions", "hardening", "exposure", "risk", "private-key", "access-control"],
  "seis-research": ["research", "official", "source", "sources", "standards", "version", "compatibility", "documentation", "docs", "api-docs"],
  "seis-automation": ["automation", "workflow", "workflows", "runbook", "scheduled", "idempotent", "dry-run", "generator", "repeatable", "failure-handling"],
  "seis-product": ["requirements", "acceptance", "launch", "outcome", "milestone", "roadmap-slice", "user-jobs", "non-goals"],
  "seis-code": ["code", "script", "runtime", "test", "tests", "mcp", "tool", "bug", "package", "node"],
  seis: ["architecture", "roadmap", "scope", "plan", "ecosystem", "model-family", "universe"]
});

const ROUTE_HINTS = [
  {
    tool: "seis-agent",
    hints: [
      "release",
      "governance",
      "policy",
      "karar",
      "safety",
      "security",
      "compliance",
      "audit",
      "deployment",
      "deploy"
    ]
  },
  {
    tool: "codex",
    hints: ["codex", "primary execution", "repo execution lane"]
  },
  {
    tool: "antigravity-ide",
    hints: ["antigravity ide", "ag ide", "agentic ide workspace"]
  },
  {
    tool: "antigravity",
    hints: ["antigravity 2.0", "antigravity app", "google antigravity", "agentic workspace"]
  },
  {
    tool: "cursor",
    hints: ["cursor", "cursor editor", "cursor review", "secondary ai editor"]
  },
  {
    tool: "xcode",
    hints: ["xcode", "swiftui", "apple signing", "ios simulator", "macos build"]
  },
  {
    tool: "ollama",
    hints: ["local", "offline", "private", "on-device", "llama", "ollama"]
  },
  {
    tool: "qwen",
    hints: ["qwen", "alternative reasoning", "cross-check", "ikinci görüş"]
  },
  {
    tool: "gemini",
    hints: ["browser", "search", "research", "compare docs", "web", "source lookup"]
  },
  {
    tool: "interpreter",
    hints: ["csv", "spreadsheet", "dataset", "json transform", "log analysis", "trace"]
  },
  {
    tool: "aider",
    hints: ["quick patch", "repo patch", "small patch", "refactor", "rename", "edit existing file", "diff"]
  },
  {
    tool: "opencode",
    hints: ["opencode", "terminal coding", "terminal agent"]
  },
  {
    tool: "hermes",
    hints: ["hermes", "hermes agent", "agent gateway", "tool gateway", "mcp gateway"]
  },
  {
    tool: "goose",
    hints: ["goose", "desktop agent", "general agent", "automation agent"]
  },
  {
    tool: "open-design",
    hints: ["open design", "opendesign", "design artifact", "visual prototype", "design system preview"]
  },
  {
    tool: "claude",
    hints: ["brainstorm", "naming", "ux copy", "editorial", "narrative", "strategy memo"]
  },
  {
    tool: "kimi",
    hints: ["translation", "translate", "localize", "multilingual", "polyglot", "çeviri"]
  },
  {
    tool: "openai",
    hints: ["openai", "summarize", "summary", "özet", "analysis", "analiz"]
  }
];

const ROLE_HINTS = {
  designer: {
    tool: "claude",
    hints: ["designer", "tasarım", "tasarim", "ui", "ux", "mikrocopy", "brand", "copy", "narrative"]
  },
  engineer: {
    tool: "aider",
    hints: ["engineer", "mühendis", "muhendis", "bug", "patch", "refactor", "build", "repo", "debug", "lint"]
  },
  software: {
    tool: "openai",
    hints: ["software", "yazılım", "mimari", "plan", "requirement", "roadmap", "performans", "scalability"]
  }
};

function normalizeIntent(userIntent) {
  return String(userIntent || "").trim().toLowerCase();
}

function normalizeRoleHint(roleHint) {
  const normalized = normalizeIntent(roleHint);
  if (!normalized) return null;
  if (normalized === "designer") return "designer";
  if (normalized === "engineer") return "engineer";
  if (normalized === "software" || normalized === "product") return "software";
  return null;
}

function matchRoleFromIntent(text, preferredRole) {
  const normalized = normalizeIntent(text);
  const preferred = normalizeRoleHint(preferredRole);
  const roleAliasMatch = /^(designer|engineer|software)\s*:\s*/.exec(normalized);
  if (roleAliasMatch) return roleAliasMatch[1];
  if (preferred) return preferred;

  const scores = { designer: 0, engineer: 0, software: 0 };
  for (const [role, config] of Object.entries(ROLE_HINTS)) {
    for (const hint of config.hints) {
      if (normalized.includes(hint)) scores[role] += 1;
    }
  }

  const ordered = Object.entries(scores).sort((left, right) => right[1] - left[1]);
  return ordered[0][1] === 0 ? null : ordered[0][0];
}

function chooseAutoTool(userIntent, options = {}) {
  const text = normalizeIntent(userIntent);
  if (!text) {
    const preferred = normalizeRoleHint(options?.preferredRole);
    return preferred ? ROLE_HINTS[preferred].tool : "seis-agent";
  }

  const explicitRole = normalizeRoleHint(options?.preferredRole) || /^(designer|engineer|software)\s*:/.exec(text)?.[1];
  if (explicitRole && ROLE_HINTS[explicitRole]?.tool) {
    return ROLE_HINTS[explicitRole].tool;
  }

  for (const route of ROUTE_HINTS) {
    if (route.hints.some((hint) => text.includes(hint))) {
      return route.tool;
    }
  }

  const role = matchRoleFromIntent(text);
  if (role && ROLE_HINTS[role]?.tool) {
    return ROLE_HINTS[role].tool;
  }

  return "seis-agent";
}

function chooseAutoRoute(userIntent, options = {}) {
  const route = predictSeisAgentLane(userIntent, options);
  const selectedTool = chooseAutoTool(userIntent, options);

  return {
    tool: selectedTool,
    selectedTool,
    intent: String(userIntent || "").trim(),
    laneId: route.laneId,
    learnedLaneId: route.learnedLaneId,
    safetyLaneId: route.safetyLaneId,
    safetyAdjusted: route.safetyAdjusted,
    defaultGate: route.defaultGate,
    integrationTool: route.toolName,
    routeSource: route.routeSource,
    reasons: route.reasons
  };
}

function predictSeisAgentLane(userIntent, options = {}) {
  const artifact = readSeisAgentRouterArtifact();
  const model = artifact?.model;
  const fallback = {
    laneId: "seis",
    learnedLaneId: "seis",
    safetyLaneId: "seis",
    safetyAdjusted: false,
    toolName: "seis_plugin_integration",
    defaultGate: "npm run check:seis-ai-agent",
    routeSource: "fallback",
    reasons: ["selected seis", "agent router artifact unavailable"]
  };

  if (!model || !Array.isArray(model.labels)) {
    return fallback;
  }

  const features = extractSeisRouteFeatures(userIntent, options);
  const scores = scoreSeisRoute(model, features);
  const learnedLaneId = maxScoreLane(scores);
  const safetyLaneId = classifySeisRouteWithSafetyFloor(userIntent, options);
  const laneId = boundedSeisLaneDecision(learnedLaneId, safetyLaneId, features);
  const defaults = model.laneDefaults?.[laneId] || {};

  return {
    laneId,
    learnedLaneId,
    safetyLaneId,
    safetyAdjusted: laneId !== learnedLaneId,
    toolName: defaults.toolName || "seis_plugin_integration",
    defaultGate: defaults.defaultGate || null,
    routeSource: artifact.artifactId || model.modelId || "seis-agent-router-seed-v0",
    scores,
    features,
    reasons: buildSeisRouteReasons(laneId, safetyLaneId, features)
  };
}

function readSeisAgentRouterArtifact() {
  try {
    return JSON.parse(fs.readFileSync(SEIS_AGENT_ROUTER_ARTIFACT_PATH, "utf8"));
  } catch {
    return null;
  }
}

function extractSeisRouteFeatures(userIntent, options = {}) {
  const text = [
    userIntent,
    options?.preferredRole ? `preferred role ${options.preferredRole}` : "",
    ...(Array.isArray(options?.signals) ? options.signals : [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const tokens = (text.match(TOKEN_PATTERN) || []).map(token => `text:${token}`);
  const tokenSet = new Set(tokens.map(token => token.replace(/^text:/, "")));
  const flagFeatures = [];

  for (const [laneId, keywords] of Object.entries(SEIS_SAFETY_KEYWORDS)) {
    if (keywords.some(keyword => tokenSet.has(keyword))) {
      flagFeatures.push(`flag:${laneId}`);
    }
  }

  if (/\b(secret|credential|token|key|redaction)\b/.test(text)) {
    flagFeatures.push("flag:secret_sensitive", "flag:seis-security", "flag:seis-governance");
  }
  if (/\b(push|release|publish|ci)\b/.test(text)) {
    flagFeatures.push("flag:release_sensitive");
  }
  if (/\b(external|provider|cloud|deploy|ssh|vpn)\b/.test(text)) {
    flagFeatures.push("flag:external_runtime");
  }

  return [...new Set(["bias", ...tokens, ...flagFeatures])].sort();
}

function scoreSeisRoute(model, features) {
  return Object.fromEntries(
    model.labels.map(label => {
      const weights = model.classFeatureWeights?.[label] || {};
      let score = features.reduce(
        (sum, feature) => sum + (weights[feature] || 0),
        model.priors?.[label] || 0
      );
      if (features.includes(`flag:${label}`)) score += 6;
      if (label === "seis-cloud" && features.includes("flag:external_runtime")) score += 2;
      if (label === "seis-governance" && features.includes("flag:release_sensitive")) score += 2;
      if (label === "seis-security" && features.includes("flag:secret_sensitive")) score += 2;
      return [label, Number(score.toFixed(6))];
    })
  );
}

function maxScoreLane(scores) {
  return Object.entries(scores).sort((left, right) => {
    const delta = right[1] - left[1];
    if (delta !== 0) return delta;
    return (SEIS_LANE_RISK_ORDER[right[0]] || 0) - (SEIS_LANE_RISK_ORDER[left[0]] || 0);
  })[0][0];
}

function classifySeisRouteWithSafetyFloor(userIntent, options = {}) {
  const text = [
    userIntent,
    options?.preferredRole ? `preferred role ${options.preferredRole}` : "",
    ...(Array.isArray(options?.signals) ? options.signals : [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const tokenSet = new Set(text.match(TOKEN_PATTERN) || []);
  const cloudMatched = SEIS_SAFETY_KEYWORDS["seis-cloud"].some(keyword => tokenSet.has(keyword));
  const securityHardMatched = /\b(threat|vulnerability|permission|permissions|hardening|exposure|redaction)\b/.test(text)
    || /\bsecurity[- ]risk\b/.test(text)
    || tokenSet.has("private-key")
    || tokenSet.has("access-control");
  const secretMatched = /\b(secret|credential|token|key)\b/.test(text);

  if (securityHardMatched || (secretMatched && !cloudMatched)) return "seis-security";
  if (cloudMatched) return "seis-cloud";
  if (SEIS_SAFETY_KEYWORDS["seis-design"].some(keyword => tokenSet.has(keyword))) return "seis-design";
  if (SEIS_SAFETY_KEYWORDS["seis-research"].some(keyword => tokenSet.has(keyword))) return "seis-research";
  if (SEIS_SAFETY_KEYWORDS["seis-data"].some(keyword => tokenSet.has(keyword))) return "seis-data";
  if (SEIS_SAFETY_KEYWORDS["seis-automation"].some(keyword => tokenSet.has(keyword))) return "seis-automation";
  if (SEIS_SAFETY_KEYWORDS["seis-product"].some(keyword => tokenSet.has(keyword))) return "seis-product";
  if (/\b(release|security|license|quality|ci|github|handoff|policy|governance)\b/.test(text)) return "seis-governance";
  if (SEIS_SAFETY_KEYWORDS["seis-code"].some(keyword => tokenSet.has(keyword))) return "seis-code";
  return "seis";
}

function boundedSeisLaneDecision(learnedLaneId, safetyLaneId, features = []) {
  if (learnedLaneId === safetyLaneId) return learnedLaneId;
  if (safetyLaneId === "seis") {
    return features.includes(`flag:${learnedLaneId}`) ? learnedLaneId : safetyLaneId;
  }
  return safetyLaneId;
}

function buildSeisRouteReasons(laneId, safetyLaneId, features = []) {
  const reasons = [`selected ${laneId}`];
  for (const feature of features.filter(item => item.startsWith("flag:"))) {
    reasons.push(feature.replace("flag:", "matched "));
  }
  if (laneId !== safetyLaneId) {
    reasons.push(`learned route retained over safety floor ${safetyLaneId}`);
  }
  return [...new Set(reasons)];
}

module.exports = { chooseAutoTool, chooseAutoRoute, predictSeisAgentLane };
