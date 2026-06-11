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

  const role = matchRoleFromIntent(text, options?.preferredRole);
  if (role && ROLE_HINTS[role]?.tool) {
    return ROLE_HINTS[role].tool;
  }

  for (const route of ROUTE_HINTS) {
    if (route.hints.some((hint) => text.includes(hint))) {
      return route.tool;
    }
  }

  return "seis-agent";
}

module.exports = { chooseAutoTool };
