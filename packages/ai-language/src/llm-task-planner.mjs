export const PLAN_VERSION = "0.3.0";

const ROLE_KEYWORDS = {
  designer: {
    profile: "Tasarım odaklı ve metin/mimari düzenleme isteği için",
    hints: [
      "tasarım",
      "tasarim",
      "ui",
      "ux",
      "copy",
      "narrative",
      "anlatı",
      "anlatım",
      "story",
      "renk",
      "tipografi",
      "wireframe",
      "mikrocopy",
      "metin",
      "content",
      "copywriter",
      "strateji",
      "editorial",
      "branding"
    ],
    preferredLane: "claude"
  },
  engineer: {
    profile: "Uygulama kodu, patch ve refactor için",
    hints: [
      "repo",
      "kod",
      "patch",
      "refactor",
      "lint",
      "debug",
      "bug",
      "fix",
      "rename",
      "dosya",
      "build",
      "test",
      "lint",
      "frontend",
      "backend",
      "api",
      "ci",
      "pipeline",
      "deploy",
      "refactor",
      "kod yaz",
      "kodla",
      "javascript",
      "typescript",
      "react"
    ],
    preferredLane: "aider"
  },
  software: {
    profile: "Ürün mimarisi, entegrasyon ve planlama odaklı işler için",
    hints: [
      "software",
      "yazılım",
      "mimari",
      "architecture",
      "system",
      "spec",
      "requirement",
      "requirements",
      "roadmap",
      "doküman",
      "spec",
      "product",
      "strategy",
      "süreç",
      "planlama",
      "scalability",
      "performans"
    ],
    preferredLane: "openai"
  },
};

const KEYWORDS = {
  local: ["local", "offline", "deney", "test", "deneme", "çalıştır", "çaliştir", "fallback", "private", "yerel", "ofline", "on-device"],
  gemini: ["research", "araştırma", "paper", "makale", "inceleme", "karşılaştır", "benchmark", "doküman", "doc", "compare", "tarayı", "kaynak", "dokümant"],
  claude: ["copy", "narrative", "ux", "story", "strat", "strateji", "edit", "anlatım", "naming", "mimari", "document"],
  openai: [ "openai", "summarize", "özet", "analysis", "analiz", "karar", "inceleme", "özetle" ],
  translation: ["çeviri", "çevir", "translate", "translation", "multilingual", "localize", "dil", "tercüme", "yerelleştir"],
  repo: ["repo", "kod", "patch", "refactor", "diff", "lint", "debug", "bug", "fix", "rename", "dosya", "build", "pr", "issue", "ticket", "commit"],
  orchestrate: [ "governance", "policy", "karar", "release", "deployment", "deploy", "review", "audit", "safety", "security", "policy", "governance check" ]
};

const ROLE_SIGNALS = {
  explicitDesigner: ["designer", "tasarımcı", "tasarım", "ui", "ux", "creatif", "design"],
  explicitEngineer: ["engineer", "mühendis", "muhendis", "mühendislik", "engineer" , "geliştirici", "developer", "yazılımcı", "software engineer"],
  explicitSoftware: ["software", "yazılım", "software engineer", "sistem", "software", "ürün", "ürün yönetimi", "product"]
};

function uniqueLower(value) {
  const normalized = (value || "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "");
  return normalized;
}

function includesAny(lower, tokens) {
  return tokens.some((token) => lower.includes(uniqueLower(token)));
}

function detectRole(text, preferredRole) {
  const lower = uniqueLower(text);
  const roleScores = {
    designer: 0,
    engineer: 0,
    software: 0
  };

  if (preferredRole) {
    const normalized = uniqueLower(preferredRole);
    if (normalized === "designer") roleScores.designer += 3;
    if (normalized === "engineer") roleScores.engineer += 3;
    if (normalized === "software") roleScores.software += 3;
  }

  for (const [role, tokens] of Object.entries(ROLE_SIGNALS)) {
    const roleName = role.replace("explicit", "").toLowerCase();
    if (includesAny(lower, tokens)) {
      roleScores[roleName] += 2;
    }
  }

  for (const [role, config] of Object.entries(ROLE_KEYWORDS)) {
    const matched = config.hints.filter((token) => lower.includes(token));
    if (matched.length > 0) {
      roleScores[role] += matched.length;
    }
  }

  const ordered = Object.entries(roleScores)
    .map(([role, score]) => ({ role, score }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  if (ordered.length === 0) {
    return {
      role: "auto",
      confidence: 0.0,
      signals: []
    };
  }

  const [winner] = ordered;
  return {
    role: winner.role,
    confidence: Math.min(1, winner.score / 10),
    signals: ordered.map((entry) => `${entry.role}:${entry.score}`)
  };
}

function laneByRole(role, text) {
  if (role === "designer") return { lane: "claude", rationale: "tasarım/senaryo odaklı sinyal bulundu" };
  if (role === "engineer") return { lane: "aider", rationale: "repo/patik/patch odaklı sinyal bulundu" };
  if (role === "software") return { lane: "openai", rationale: "software/product planlama sinyalleri bulundu" };
  if (includesAny(text, KEYWORDS.translation)) return { lane: "kimi", rationale: "çeviri/multilingual sinyali var" };
  if (includesAny(text, KEYWORDS.local)) return { lane: "ollama", rationale: "offline/local odaklı sinyal var" };
  if (includesAny(text, KEYWORDS.gemini)) return { lane: "gemini", rationale: "dokümantasyon/sorgu araştırma sinyali var" };
  if (includesAny(text, KEYWORDS.claude)) return { lane: "claude", rationale: "tasarım/narratif sinyali var" };
  if (includesAny(text, KEYWORDS.repo)) return { lane: "aider", rationale: "repo/diff/patch sinyali var" };
  if (includesAny(text, KEYWORDS.openai)) return { lane: "openai", rationale: "özet/analiz sinyali var" };
  return { lane: "seis-agent", rationale: "genel karar/komuta sinyali veya açık eşleşme yok" };
}

function pickLane(text) {
  if (includesAny(text, KEYWORDS.orchestrate)) {
    return { lane: "seis-agent", rationale: "governance/security/release odağında remote orchestration gerekli", alternatives: ["openai", "ollama"] };
  }

  if (includesAny(text, KEYWORDS.local)) {
    return { lane: "ollama", rationale: "local/offline odağında" , alternatives: ["seis-agent"] };
  }

  if (includesAny(text, KEYWORDS.translation)) {
    return { lane: "kimi", rationale: "çeviri/multilingual odaklı", alternatives: ["gemini", "openai"] };
  }

  const roleProfile = detectRole(text);
  const roleLane = laneByRole(roleProfile.role, text);
  if (roleLane.lane && roleLane.lane !== "seis-agent") {
    return { lane: roleLane.lane, rationale: roleLane.rationale, alternatives: ["ollama", "seis-agent"] };
  }

  if (includesAny(text, KEYWORDS.gemini)) {
    return { lane: "gemini", rationale: "araştırma/doküman odaklı", alternatives: ["openai", "seis-agent"] };
  }

  if (includesAny(text, KEYWORDS.claude)) {
    return { lane: "claude", rationale: "narratif/strateji odaklı", alternatives: ["openai", "seis-agent"] };
  }

  if (includesAny(text, KEYWORDS.repo)) {
    return { lane: "aider", rationale: "repo patch/edit odaklı", alternatives: ["openai", "seis-agent"] };
  }

  if (includesAny(text, KEYWORDS.openai)) {
    return { lane: "openai", rationale: "analiz/özet odaklı", alternatives: ["seis-agent"] };
  }

  return {
    lane: "seis-agent",
    rationale: "varsayılan remote orchestration",
    alternatives: ["openai", "aider", "claude"]
  };
}

function suggestRoleLaneHint(input) {
  const role = detectRole(input);
  const roleDefaults = {
    designer: { primary: "claude", backup: ["gemini", "openai"] },
    engineer: { primary: "aider", backup: ["interpreter", "ollama"] },
    software: { primary: "openai", backup: ["gemini", "seis-agent"] },
    auto: { primary: "seis-agent", backup: ["openai", "ollama"] }
  };

  return roleDefaults[role.role];
}

export function isRemoteLane(lane) {
  return lane === "seis-agent";
}

export function planTask(input, options = {}) {
  const text = typeof input === "string" ? input.trim() : (typeof input?.request === "string" ? input.request.trim() : "");
  const preferredRole = options?.role || options?.preferredRole;

  if (!text) {
    return {
      status: "empty",
      suggestedLane: "seis-agent",
      warnings: ["empty request"],
      role: "auto",
      roleConfidence: 0,
      roleSignals: [],
      policyHint: "empty input does not require a lane"
    };
  }

  const normalized = uniqueLower(text);
  const roleProfile = detectRole(text, preferredRole);
  const chosen = pickLane(normalized);
  const roleHints = suggestRoleLaneHint(normalized);

  return {
    status: "planned",
    suggestedLane: chosen.lane,
    laneType: isRemoteLane(chosen.lane) ? "remote-orchestrator" : "local-helper",
    requestLength: text.length,
    policyHint: "local helpers first, SEIS Agent only as remote orchestrator",
    router: {
      primary: chosen.lane,
      requiresRemote: isRemoteLane(chosen.lane),
      fallback: "seis-agent"
    },
    role: roleProfile.role,
    roleConfidence: roleProfile.confidence,
    roleSignals: roleProfile.signals,
    routerRationale: chosen.rationale,
    suggestedAlternatives: chosen.alternatives,
    roleProfile: {
      primary: roleHints.primary,
      backup: roleHints.backup,
      profile: ROLE_KEYWORDS[roleProfile.role]?.profile || "öngörülen iş akışı için genel profil"
    }
  };
}

export default {
  PLAN_VERSION,
  planTask,
  isRemoteLane,
};
