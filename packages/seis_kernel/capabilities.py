"""Capability registry and routing code for the SEIS universal kernel.

The kernel is intentionally dependency-free. It gives SEIS a durable source of
truth for broad engineering, design, data, AI, security, operations, and
research domains without installing heavy runtimes or inventing integrations.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .platform_matrix import build_platform_contract
from .plugin_inventory import build_plugin_inventory_contract


REQUIRED_DOMAIN_IDS = [
    "algorithms-and-flowcharts",
    "mathematics-foundations",
    "computer-science-foundations",
    "web-development",
    "mobile-development",
    "game-development",
    "full-stack-engineering",
    "data-engineering-and-analytics",
    "data-science",
    "artificial-intelligence",
    "ai-agent-engineering",
    "llm-orchestration",
    "mcp-skills-plugins",
    "database-management",
    "version-control-systems",
    "cloud-computing",
    "cybersecurity",
    "devops-and-system-management",
    "test-engineering",
    "software-architecture-and-patterns",
    "big-data-engineering",
    "nlp-and-computer-vision",
    "quantum-programming",
    "sustainable-software",
    "low-code-no-code-platforms",
    "ux-ui-engineering",
    "product-design-and-creative-systems",
    "autonomous-vehicles-and-robotics",
    "ai-ethics-and-data-governance",
    "compiler-and-language-engineering",
    "requirements-engineering",
    "agile-project-management",
    "software-development-lifecycle",
    "software-metrics-and-measurement",
    "sre-and-observability",
    "reverse-engineering",
    "software-refactoring",
    "formal-methods",
]


@dataclass(frozen=True)
class CapabilityDomain:
    id: str
    label: str
    lane: str
    purpose: str
    agent_role: str
    keywords: tuple[str, ...]
    algorithms: tuple[str, ...]
    foundations: tuple[str, ...]
    artifacts: tuple[str, ...]
    mcp_hooks: tuple[str, ...]
    skill_hooks: tuple[str, ...]
    plugin_hooks: tuple[str, ...]
    quality_gates: tuple[str, ...]
    starter_surfaces: tuple[str, ...]
    flow: tuple[str, ...] = field(
        default=(
            "intake",
            "scope",
            "design",
            "implement",
            "validate",
            "document",
            "release_gate",
        )
    )

    def as_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "label": self.label,
            "lane": self.lane,
            "purpose": self.purpose,
            "agentRole": self.agent_role,
            "keywords": list(self.keywords),
            "algorithms": list(self.algorithms),
            "foundations": list(self.foundations),
            "artifacts": list(self.artifacts),
            "mcpHooks": list(self.mcp_hooks),
            "skillHooks": list(self.skill_hooks),
            "pluginHooks": list(self.plugin_hooks),
            "qualityGates": list(self.quality_gates),
            "starterSurfaces": list(self.starter_surfaces),
            "flow": list(self.flow),
        }


def domain(
    id: str,
    label: str,
    lane: str,
    purpose: str,
    agent_role: str,
    keywords: list[str],
    algorithms: list[str],
    foundations: list[str],
    artifacts: list[str],
    mcp_hooks: list[str],
    skill_hooks: list[str],
    plugin_hooks: list[str],
    quality_gates: list[str],
    starter_surfaces: list[str],
) -> CapabilityDomain:
    return CapabilityDomain(
        id=id,
        label=label,
        lane=lane,
        purpose=purpose,
        agent_role=agent_role,
        keywords=tuple(keywords),
        algorithms=tuple(algorithms),
        foundations=tuple(foundations),
        artifacts=tuple(artifacts),
        mcp_hooks=tuple(mcp_hooks),
        skill_hooks=tuple(skill_hooks),
        plugin_hooks=tuple(plugin_hooks),
        quality_gates=tuple(quality_gates),
        starter_surfaces=tuple(starter_surfaces),
    )


COMMON_QUALITY = ["security", "accessibility_when_ui", "performance", "maintainability", "testability"]


CAPABILITY_DOMAINS = [
    domain(
        "algorithms-and-flowcharts",
        "Algorithms and Flowcharts",
        "core-computing",
        "Model problem solving as algorithms, diagrams, complexity notes, and executable decision flows.",
        "algorithm-agent",
        ["algorithm", "flowchart", "akış", "pseudocode", "complexity"],
        ["search", "sort", "dynamic programming", "graph traversal", "state machines"],
        ["big_o", "recurrence relations", "discrete structures"],
        ["mermaid flowcharts", "pseudocode specs", "algorithm test cases"],
        ["repo-context", "diagram-renderer"],
        ["algorithm-design", "diagram-generation"],
        ["Build Web Data Visualization", "Documents"],
        COMMON_QUALITY + ["complexity_budget", "edge_case_tests"],
        ["docs/architecture/*.md", "polyglot/mermaid/*.mmd"],
    ),
    domain(
        "mathematics-foundations",
        "Mathematics Foundations",
        "core-computing",
        "Keep mathematical reasoning available for models, metrics, optimization, graphics, and verification.",
        "math-agent",
        ["math", "linear algebra", "statistics", "calculus", "probability"],
        ["optimization", "numerical methods", "statistical estimation"],
        ["linear algebra", "probability", "calculus", "logic"],
        ["math notes", "metric formulas", "model assumptions"],
        ["notebook-context", "semantic-report"],
        ["data-analytics", "latex"],
        ["Data Analytics", "LaTeX"],
        COMMON_QUALITY + ["assumption_review", "unit_consistency"],
        ["docs/research/*.md", "reports/*.md"],
    ),
    domain(
        "computer-science-foundations",
        "Computer Science Foundations",
        "core-computing",
        "Anchor SEIS in data structures, complexity, concurrency, operating systems, and networking basics.",
        "cs-foundation-agent",
        ["data structure", "network", "os", "concurrency", "compiler"],
        ["hashing", "queues", "trees", "locks", "protocol state machines"],
        ["automata", "systems", "networks", "memory models"],
        ["foundation notes", "architecture decisions", "risk matrices"],
        ["repo-context", "runtime-inventory"],
        ["software-architecture", "security-scan"],
        ["Codex Security", "Superpowers"],
        COMMON_QUALITY + ["complexity_budget", "concurrency_risk_review"],
        ["docs/architecture/*.md", "packages/core/*"],
    ),
    domain(
        "web-development",
        "Web Development",
        "product-engineering",
        "Build responsive, accessible, performant web interfaces and browser runtime surfaces.",
        "web-agent",
        ["web", "frontend", "html", "css", "javascript", "react"],
        ["event delegation", "render scheduling", "cache-first loading"],
        ["browser APIs", "http", "accessibility tree", "responsive layout"],
        ["web pages", "components", "static release", "pwa assets"],
        ["browser", "local-preview"],
        ["frontend-app-builder", "frontend-testing-debugging"],
        ["Build Web Apps", "Browser", "Vercel", "Cloudflare"],
        COMMON_QUALITY + ["seo_when_public", "mobile_ergonomics"],
        ["apps/web", "release/web", "server/edge"],
    ),
    domain(
        "mobile-development",
        "Mobile Development",
        "product-engineering",
        "Support iOS, Android, Flutter, React Native, and mobile ergonomics without forcing one stack.",
        "mobile-agent",
        ["ios", "android", "swift", "kotlin", "flutter", "react native"],
        ["offline sync", "gesture state", "navigation state"],
        ["platform SDKs", "touch ergonomics", "store release constraints"],
        ["mobile policies", "native bridges", "simulator checks"],
        ["simulator-context", "device-log-context"],
        ["ios-apps", "expo", "android-testing"],
        ["Build iOS Apps", "Test Android Apps", "Expo"],
        COMMON_QUALITY + ["battery", "touch_target", "offline_fallback"],
        ["polyglot/swift", "polyglot/kotlin", "polyglot/dart"],
    ),
    domain(
        "game-development",
        "Game Development",
        "interactive-systems",
        "Cover game loops, input, rendering, physics, asset pipelines, and playtestable browser/native prototypes.",
        "game-agent",
        ["game", "physics", "rendering", "input", "playtest"],
        ["game loop", "collision detection", "pathfinding", "entity component systems"],
        ["linear algebra", "graphics", "simulation", "state machines"],
        ["game prototypes", "playtest reports", "asset manifests"],
        ["browser-canvas", "asset-library"],
        ["game-studio", "sprite-pipeline"],
        ["Game Studio", "Fal", "Shutterstock"],
        COMMON_QUALITY + ["frame_budget", "input_latency"],
        ["polyglot/gdscript", "polyglot/glsl", "polyglot/wgsl"],
    ),
    domain(
        "full-stack-engineering",
        "Full-Stack Engineering",
        "product-engineering",
        "Connect UI, APIs, databases, release checks, and observability into one maintainable product surface.",
        "full-stack-agent",
        ["full stack", "api", "backend", "frontend", "server"],
        ["request routing", "validation pipeline", "cache invalidation"],
        ["http", "database transactions", "security boundaries"],
        ["api contracts", "server adapters", "release sync"],
        ["repo-context", "server-targets"],
        ["frontend-app-builder", "backend-guidance"],
        ["Build Web Apps", "Supabase", "Neon Postgres", "Render"],
        COMMON_QUALITY + ["contract_tests", "release_sync"],
        ["server", "deploy", "packages"],
    ),
    domain(
        "data-engineering-and-analytics",
        "Data Engineering and Analytics",
        "data-intelligence",
        "Move data from raw sources into clean models, dashboards, reports, and decision-ready metrics.",
        "data-agent",
        ["data pipeline", "etl", "elt", "analytics", "dashboard"],
        ["batch processing", "incremental models", "semantic aggregation"],
        ["relational algebra", "statistics", "dimensional modeling"],
        ["datasets", "metric reports", "dashboards"],
        ["warehouse-context", "report-renderer"],
        ["data-analytics", "build-dashboard"],
        ["Data Analytics", "MotherDuck", "Metabase", "Deepnote"],
        COMMON_QUALITY + ["lineage", "metric_definitions"],
        ["content/development/*.json", "reports/*.json"],
    ),
    domain(
        "data-science",
        "Data Science",
        "data-intelligence",
        "Support exploration, feature engineering, evaluation, and statistical interpretation.",
        "data-science-agent",
        ["data science", "model", "feature", "notebook", "evaluation"],
        ["regression", "classification", "clustering", "cross validation"],
        ["statistics", "probability", "linear algebra"],
        ["experiment reports", "evaluation cards", "feature specs"],
        ["notebook-context", "dataset-search"],
        ["metric-diagnostics", "visualize-data"],
        ["Data Analytics", "Hugging Face", "Deepnote"],
        COMMON_QUALITY + ["bias_review", "sample_size_review"],
        ["polyglot/python", "polyglot/r", "polyglot/julia"],
    ),
    domain(
        "artificial-intelligence",
        "Artificial Intelligence",
        "ai-intelligence",
        "Represent planning, reasoning, model selection, evaluation, and responsible AI behavior.",
        "ai-agent",
        ["ai", "machine learning", "reasoning", "model", "evaluation"],
        ["search", "planning", "retrieval", "ranking", "model evaluation"],
        ["optimization", "probability", "information theory"],
        ["model cards", "evaluation reports", "routing policy"],
        ["model-registry", "eval-context"],
        ["openai-docs", "huggingface-llm-trainer"],
        ["OpenAI Developers", "Hugging Face", "Plugin Eval"],
        COMMON_QUALITY + ["evals", "safety_policy"],
        ["content/development/ai-release-manifest.json", "packages/ai-language"],
    ),
    domain(
        "ai-agent-engineering",
        "AI Agent Engineering",
        "ai-intelligence",
        "Turn SEIS into role-based agents with tools, memory, policies, and scoped execution.",
        "agent-orchestrator",
        ["agent", "planner", "tool", "memory", "workflow"],
        ["task decomposition", "tool routing", "policy gating"],
        ["state machines", "control theory", "risk modeling"],
        ["agent manifests", "tool policies", "execution logs"],
        ["mcp-server", "repo-context", "tool-inventory"],
        ["superpowers", "plugin-creator", "skill-creator"],
        ["SEIS", "Superpowers", "GitHub", "OpenAI Developers"],
        COMMON_QUALITY + ["permission_scope", "rollback_plan"],
        ["mcp", "plugins/seis", "packages/ai-language"],
    ),
    domain(
        "llm-orchestration",
        "LLM Orchestration",
        "ai-intelligence",
        "Coordinate local and remote models while SEIS remains the task-facing agent.",
        "llm-routing-agent",
        ["llm", "openai", "gemini", "claude", "ollama", "qwen"],
        ["provider fallback", "intent routing", "cost-aware selection"],
        ["decision theory", "token budgeting", "prompt semantics"],
        ["routing policy", "request blueprints", "adapter readiness"],
        ["provider-registry", "local-model-registry"],
        ["openai-docs", "huggingface-llm-trainer"],
        ["OpenAI Developers", "Hugging Face"],
        COMMON_QUALITY + ["credential_boundaries", "offline_fallback"],
        ["content/development/llm-task-routing-policy.json", "scripts/ai-routing-policy.cjs"],
    ),
    domain(
        "mcp-skills-plugins",
        "MCP, Skills, and Plugins",
        "ai-intelligence",
        "Make external capabilities discoverable, scoped, validated, and visible in SEIS source surfaces.",
        "integration-agent",
        ["mcp", "skill", "plugin", "connector", "tool"],
        ["capability matching", "permission gating", "source synchronization"],
        ["interface contracts", "security boundaries", "least privilege"],
        ["mcp manifests", "skill docs", "plugin source reports"],
        ["mcp-server", "plugin-registry", "skill-registry"],
        ["plugin-creator", "skill-creator", "plugin-eval"],
        ["GitHub", "Plugin Eval", "SEIS"],
        COMMON_QUALITY + ["source_visibility", "auth_state_review"],
        ["plugins/seis", "mcp", "reports/plugin-*.json"],
    ),
    domain(
        "database-management",
        "Database Management",
        "data-platform",
        "Cover relational, document, cache, schema, migration, backup, and governance patterns.",
        "database-agent",
        ["database", "postgres", "mysql", "mongodb", "redis", "schema"],
        ["index selection", "query planning", "migration ordering"],
        ["relational algebra", "normalization", "transactions"],
        ["schemas", "migration plans", "backup policies"],
        ["database-context", "schema-inspector"],
        ["supabase-postgres-best-practices"],
        ["Supabase", "Neon Postgres", "MotherDuck"],
        COMMON_QUALITY + ["backup_restore", "migration_safety"],
        ["polyglot/sql", "polyglot/mysql", "deploy"],
    ),
    domain(
        "version-control-systems",
        "Version Control Systems",
        "governance",
        "Protect Git history, branches, releases, reviews, and publication gates.",
        "git-governance-agent",
        ["git", "github", "branch", "commit", "pull request"],
        ["diff analysis", "merge strategy", "release tagging"],
        ["graph theory", "change management"],
        ["branch policies", "PR summaries", "release notes"],
        ["repo-context", "github-context"],
        ["github", "coderabbit-review"],
        ["GitHub", "CodeRabbit", "CircleCI"],
        COMMON_QUALITY + ["no_destructive_git", "ci_review"],
        [".github", "scripts/check-github-*.mjs"],
    ),
    domain(
        "cloud-computing",
        "Cloud Computing",
        "cloud-ops",
        "Map hosting, edge, serverless, storage, networking, IAM, and deployment readiness.",
        "cloud-agent",
        ["cloud", "serverless", "gcp", "aws", "azure", "firebase", "cloudflare"],
        ["autoscaling", "routing", "cache policy", "deployment gates"],
        ["distributed systems", "networking", "security"],
        ["cloud matrices", "deploy manifests", "runbooks"],
        ["cloud-targets", "deployment-context"],
        ["cloudflare", "wrangler", "vercel"],
        ["Cloudflare", "Vercel", "Netlify", "Render", "Supabase"],
        COMMON_QUALITY + ["iam_review", "cost_guard"],
        ["deploy", "server/edge", "reports/server-cloud-activation-report.json"],
    ),
    domain(
        "cybersecurity",
        "Cybersecurity",
        "security-governance",
        "Keep threat modeling, secret detection, dependency review, auth, and secure coding active.",
        "security-agent",
        ["security", "threat", "vulnerability", "secret", "auth"],
        ["attack tree analysis", "risk scoring", "secret scanning"],
        ["cryptography basics", "network security", "secure design"],
        ["threat models", "security reports", "mitigation plans"],
        ["repo-context", "security-scan"],
        ["codex-security", "threat-model"],
        ["Codex Security", "Sentry"],
        COMMON_QUALITY + ["secret_detection", "least_privilege"],
        ["SECURITY.md", "scripts/check-*.mjs"],
    ),
    domain(
        "devops-and-system-management",
        "DevOps and System Management",
        "cloud-ops",
        "Support CI/CD, environment readiness, runtime inventory, shell automation, and operations runbooks.",
        "devops-agent",
        ["devops", "ci", "cd", "ops", "system", "runtime"],
        ["pipeline orchestration", "health checks", "rollback sequencing"],
        ["operating systems", "networking", "process management"],
        ["automation scripts", "runbooks", "environment reports"],
        ["terminal-context", "runtime-inventory"],
        ["circleci-config", "cloudflare-workers"],
        ["CircleCI", "Cloudflare", "Vantage"],
        COMMON_QUALITY + ["idempotency", "environment_check"],
        ["scripts", "deploy", "server"],
    ),
    domain(
        "test-engineering",
        "Test Engineering",
        "quality-engineering",
        "Create unit, integration, UI, regression, accessibility, performance, and release checks.",
        "qa-agent",
        ["test", "qa", "validation", "regression", "coverage"],
        ["property-based testing", "mutation testing", "snapshot comparison"],
        ["quality models", "risk-based testing", "observability"],
        ["test plans", "check scripts", "evidence reports"],
        ["browser-context", "simulator-context", "repo-context"],
        ["frontend-testing-debugging", "test-android-apps"],
        ["Browser", "Test Android Apps", "CodeRabbit"],
        COMMON_QUALITY + ["test_plan", "regression_guard"],
        ["scripts/check-*.mjs", "reports"],
    ),
    domain(
        "software-architecture-and-patterns",
        "Software Architecture and Design Patterns",
        "architecture",
        "Guide bounded contexts, patterns, system diagrams, tradeoffs, and long-term maintainability.",
        "architecture-agent",
        ["architecture", "design pattern", "system design", "bounded context"],
        ["dependency inversion", "event sourcing", "adapter patterns"],
        ["modularity", "distributed systems", "domain modeling"],
        ["ADRs", "component maps", "dependency diagrams"],
        ["repo-context", "diagram-renderer"],
        ["software-architecture", "figma-generate-diagram"],
        ["Documents", "Figma", "Build Web Data Visualization"],
        COMMON_QUALITY + ["architecture_decision_record", "dependency_review"],
        ["docs/architecture", "docs/development"],
    ),
    domain(
        "big-data-engineering",
        "Big Data Engineering",
        "data-platform",
        "Prepare distributed ingestion, storage, transformation, streaming, and lakehouse patterns.",
        "big-data-agent",
        ["big data", "streaming", "lakehouse", "warehouse", "spark"],
        ["partitioning", "windowing", "map reduce", "stream processing"],
        ["distributed systems", "statistics", "storage formats"],
        ["data lake plans", "stream schemas", "lineage reports"],
        ["warehouse-context", "dataset-context"],
        ["data-analytics", "deepnote"],
        ["Data Analytics", "MotherDuck", "Deepnote"],
        COMMON_QUALITY + ["lineage", "cost_guard"],
        ["polyglot/avro", "polyglot/protobuf", "polyglot/asyncapi"],
    ),
    domain(
        "nlp-and-computer-vision",
        "NLP and Computer Vision",
        "ai-intelligence",
        "Cover language, speech, image, video, embeddings, retrieval, detection, and multimodal workflows.",
        "multimodal-ai-agent",
        ["nlp", "vision", "computer vision", "embedding", "ocr", "multimodal"],
        ["tokenization", "embedding search", "classification", "object detection"],
        ["linear algebra", "probability", "signal processing"],
        ["model cards", "dataset sheets", "evaluation reports"],
        ["model-registry", "asset-library"],
        ["huggingface-vision-trainer", "generative-polish"],
        ["Hugging Face", "Fal", "Cloudinary", "Shutterstock"],
        COMMON_QUALITY + ["dataset_rights", "bias_review"],
        ["packages/asset-registry", "reports/icloud-personal-inventory.json"],
    ),
    domain(
        "quantum-programming",
        "Quantum Programming",
        "research-lab",
        "Track quantum-readiness concepts, circuits, algorithms, and simulation boundaries.",
        "quantum-agent",
        ["quantum", "qsharp", "circuit", "qubit"],
        ["grover search", "quantum Fourier transform", "circuit simulation"],
        ["linear algebra", "probability amplitudes", "complex numbers"],
        ["quantum notes", "simulation specs", "research cards"],
        ["research-context"],
        ["latex", "research-synthesis"],
        ["LaTeX", "Scite", "Zotero"],
        COMMON_QUALITY + ["research_citation", "simulation_boundary"],
        ["polyglot/qsharp"],
    ),
    domain(
        "sustainable-software",
        "Sustainable Software",
        "governance",
        "Reduce unnecessary compute, dependency bloat, carbon cost, and maintenance pressure.",
        "sustainability-agent",
        ["sustainable", "green software", "low power", "efficiency"],
        ["resource budgeting", "cache reuse", "workload shedding"],
        ["systems efficiency", "measurement", "lifecycle cost"],
        ["efficiency reports", "runtime budgets", "dependency reviews"],
        ["runtime-inventory", "cost-context"],
        ["cloudflare-web-perf", "performance-audit"],
        ["Vantage", "Cloudflare", "Build Web Apps"],
        COMMON_QUALITY + ["dependency_budget", "low_power_mode"],
        ["docs/governance/full-efficiency-low-pressure-mode.md", "scripts/check-experience-budget.mjs"],
    ),
    domain(
        "low-code-no-code-platforms",
        "Low-Code and No-Code Platforms",
        "product-engineering",
        "Use low-code tools only when they reduce delivery risk and keep ownership clear.",
        "low-code-agent",
        ["low-code", "no-code", "replit", "lovable", "base44", "wix"],
        ["workflow mapping", "guardrail validation", "export review"],
        ["requirements modeling", "integration design"],
        ["tool decision records", "export plans", "ownership maps"],
        ["app-builder-context"],
        ["base44-cli", "wix"],
        ["Base44", "Lovable", "Replit", "Wix"],
        COMMON_QUALITY + ["exportability", "vendor_lockin_review"],
        ["docs/development", "reports"],
    ),
    domain(
        "ux-ui-engineering",
        "UX and UI Engineering",
        "design-systems",
        "Connect usability, interaction design, accessibility, design systems, and polished implementation.",
        "ux-ui-agent",
        ["ux", "ui", "design system", "accessibility", "interaction"],
        ["information architecture", "interaction state modeling", "responsive heuristics"],
        ["human-computer interaction", "visual hierarchy", "accessibility"],
        ["wireframes", "component specs", "design tokens"],
        ["browser-context", "design-context"],
        ["frontend-app-builder", "figma-use"],
        ["Figma", "Canva", "Product Design", "Build Web Apps"],
        COMMON_QUALITY + ["accessibility", "mobile_ergonomics", "typography"],
        ["packages/design-tokens", "apps/web/styles.css"],
    ),
    domain(
        "product-design-and-creative-systems",
        "Product Design and Creative Systems",
        "design-systems",
        "Support visual systems, brand assets, media, presentations, and creative production workflows.",
        "creative-agent",
        ["design", "brand", "creative", "media", "presentation"],
        ["creative brief routing", "asset curation", "variant comparison"],
        ["visual communication", "narrative design", "media operations"],
        ["creative briefs", "moodboards", "asset registries"],
        ["asset-library", "design-context"],
        ["creative-production", "canva-branded-presentation"],
        ["Creative Production", "Canva", "Fal", "HeyGen", "Shutterstock"],
        COMMON_QUALITY + ["rights_review", "brand_consistency"],
        ["packages/asset-registry", "docs/strategy"],
    ),
    domain(
        "autonomous-vehicles-and-robotics",
        "Autonomous Vehicles and Robotics",
        "research-lab",
        "Represent robotics software, perception, planning, control, simulation, and safety cases.",
        "robotics-agent",
        ["robotics", "autonomous", "vehicle", "ros", "control"],
        ["path planning", "sensor fusion", "pid control", "slam"],
        ["control theory", "kinematics", "computer vision", "real-time systems"],
        ["simulation plans", "safety cases", "control policies"],
        ["simulation-context", "sensor-data-context"],
        ["nvidia", "life-science-style-research-routing"],
        ["NVIDIA", "Build Web Data Visualization"],
        COMMON_QUALITY + ["safety_case", "simulation_boundary"],
        ["docs/research", "polyglot/cpp", "polyglot/python"],
    ),
    domain(
        "ai-ethics-and-data-governance",
        "AI Ethics and Data Governance",
        "governance",
        "Keep privacy, fairness, consent, provenance, retention, and model accountability in scope.",
        "governance-agent",
        ["ethics", "privacy", "governance", "bias", "data policy"],
        ["risk scoring", "bias evaluation", "data lineage checks"],
        ["ethics", "statistics", "law-aware governance"],
        ["policy docs", "data cards", "model cards"],
        ["policy-context", "data-lineage-context"],
        ["codex-security", "data-analytics"],
        ["Codex Security", "Data Analytics", "Documents"],
        COMMON_QUALITY + ["privacy_review", "provenance"],
        ["SECURITY.md", "content/development/*.json"],
    ),
    domain(
        "compiler-and-language-engineering",
        "Compiler and Language Engineering",
        "core-computing",
        "Cover parsing, ASTs, interpreters, compilers, DSLs, type systems, and language tooling.",
        "language-engineering-agent",
        ["compiler", "parser", "dsl", "language", "ast"],
        ["lexing", "parsing", "type checking", "code generation"],
        ["automata", "formal languages", "type theory"],
        ["grammar specs", "AST schemas", "DSL docs"],
        ["repo-context", "language-runtime-context"],
        ["skill-creator", "plugin-creator"],
        ["Superpowers", "OpenAI Developers"],
        COMMON_QUALITY + ["grammar_tests", "type_contracts"],
        ["polyglot", "packages/ai-language"],
    ),
    domain(
        "requirements-engineering",
        "Requirements Engineering",
        "product-governance",
        "Turn fuzzy requests into traceable scope, acceptance criteria, risks, and release decisions.",
        "requirements-agent",
        ["requirements", "acceptance criteria", "scope", "prd"],
        ["decision trees", "traceability matrices", "risk classification"],
        ["systems analysis", "stakeholder modeling"],
        ["PRDs", "acceptance criteria", "traceability maps"],
        ["document-context", "issue-context"],
        ["documents", "spec-to-backlog"],
        ["Documents", "Atlassian Rovo", "Linear", "Notion"],
        COMMON_QUALITY + ["traceability", "acceptance_criteria"],
        ["docs/development", "PROJECTS.md"],
    ),
    domain(
        "agile-project-management",
        "Agile Project Management",
        "product-governance",
        "Support backlogs, sprint planning, prioritization, retrospectives, and delivery cadence.",
        "delivery-agent",
        ["agile", "scrum", "kanban", "sprint", "roadmap"],
        ["prioritization scoring", "dependency ordering", "cycle-time review"],
        ["project management", "systems thinking"],
        ["roadmaps", "status reports", "backlogs"],
        ["task-context", "meeting-context"],
        ["generate-status-report", "capture-tasks-from-meeting-notes"],
        ["Asana", "ClickUp", "Atlassian Rovo", "Linear"],
        COMMON_QUALITY + ["scope_control", "status_transparency"],
        ["roadmap", "docs/development/agents"],
    ),
    domain(
        "software-development-lifecycle",
        "Software Development Lifecycle",
        "product-governance",
        "Keep planning, design, implementation, testing, release, operations, and retirement connected.",
        "sdlc-agent",
        ["sdlc", "lifecycle", "release", "maintenance"],
        ["stage gates", "release readiness", "retirement planning"],
        ["process design", "risk management"],
        ["lifecycle docs", "release checklists", "runbooks"],
        ["repo-context", "release-context"],
        ["superpowers", "github"],
        ["GitHub", "CodeRabbit", "CircleCI"],
        COMMON_QUALITY + ["release_gate", "rollback_plan"],
        ["docs/governance", "scripts/automation-*.cjs"],
    ),
    domain(
        "software-metrics-and-measurement",
        "Software Metrics and Measurement",
        "quality-engineering",
        "Measure quality, velocity, reliability, performance, accessibility, and language distribution.",
        "metrics-agent",
        ["metrics", "measurement", "kpi", "quality", "language distribution"],
        ["aggregation", "trend analysis", "threshold checks"],
        ["statistics", "measurement theory", "sampling"],
        ["metric reports", "dashboards", "quality budgets"],
        ["report-context", "runtime-inventory"],
        ["kpi-reporting", "metric-diagnostics"],
        ["Data Analytics", "PostHog", "Mixpanel", "Amplitude"],
        COMMON_QUALITY + ["metric_definition", "threshold_review"],
        ["reports/language-distribution.json", "scripts/check-*.mjs"],
    ),
    domain(
        "sre-and-observability",
        "SRE and Observability",
        "cloud-ops",
        "Cover SLIs, SLOs, error budgets, incident response, logs, traces, metrics, and reliability reviews.",
        "sre-agent",
        ["sre", "observability", "incident", "slo", "error budget"],
        ["error budget policy", "alert routing", "incident timeline analysis"],
        ["reliability engineering", "queuing theory", "distributed systems"],
        ["SLO docs", "incident reports", "observability maps"],
        ["telemetry-context", "cloud-context"],
        ["datadog", "sentry"],
        ["Datadog (Preview)", "Sentry", "Vantage"],
        COMMON_QUALITY + ["incident_response", "slo_review"],
        ["docs/server", "reports/server-cloud-activation-report.json"],
    ),
    domain(
        "reverse-engineering",
        "Reverse Engineering",
        "security-governance",
        "Analyze legacy code, third-party snapshots, binaries, protocols, and behavior before adaptation.",
        "reverse-engineering-agent",
        ["reverse engineering", "legacy", "third-party", "binary", "protocol"],
        ["static analysis", "call graph extraction", "behavior comparison"],
        ["systems", "security", "program analysis"],
        ["adaptation plans", "risk notes", "behavior maps"],
        ["repo-context", "artifact-context"],
        ["security-scan", "code-review"],
        ["Codex Security", "CodeRabbit"],
        COMMON_QUALITY + ["license_review", "behavior_preservation"],
        ["reports/third-party-intake-blueprint.json", "content/development/third-party-adaptation-plan.json"],
    ),
    domain(
        "software-refactoring",
        "Software Refactoring",
        "architecture",
        "Improve structure while preserving behavior through small, reversible, test-backed changes.",
        "refactoring-agent",
        ["refactor", "modernize", "technical debt", "cleanup"],
        ["dependency extraction", "strangler pattern", "behavior characterization"],
        ["software design", "program analysis"],
        ["refactor plans", "migration reports", "compatibility notes"],
        ["repo-context", "test-context"],
        ["code-review", "superpowers"],
        ["CodeRabbit", "Superpowers"],
        COMMON_QUALITY + ["behavior_preservation", "small_changes"],
        ["scripts", "packages", "apps"],
    ),
    domain(
        "formal-methods",
        "Formal Methods",
        "core-computing",
        "Represent specifications, invariants, proofs, model checking, contracts, and safety-critical logic.",
        "formal-methods-agent",
        ["formal", "invariant", "proof", "model checking", "specification"],
        ["model checking", "symbolic execution", "contract verification"],
        ["logic", "set theory", "type systems"],
        ["formal specs", "invariant lists", "proof sketches"],
        ["repo-context", "spec-context"],
        ["latex", "security-validation"],
        ["LaTeX", "Codex Security"],
        COMMON_QUALITY + ["invariant_review", "spec_traceability"],
        ["polyglot/rego", "polyglot/cel", "polyglot/turtle", "polyglot/sparql"],
    ),
]


class DomainRouter:
    """Small keyword router for SEIS capability dispatch."""

    def __init__(self, domains: list[CapabilityDomain] | None = None) -> None:
        self.domains = domains or CAPABILITY_DOMAINS

    def route(self, text: str, limit: int = 5) -> list[dict[str, Any]]:
        normalized = text.casefold()
        scored: list[tuple[int, CapabilityDomain]] = []
        for item in self.domains:
            score = 0
            for keyword in item.keywords:
                if keyword.casefold() in normalized:
                    score += 3
            for token in item.label.casefold().replace("-", " ").split():
                if token and token in normalized:
                    score += 1
            if score:
                scored.append((score, item))
        scored.sort(key=lambda pair: (-pair[0], pair[1].id))
        return [
            {
                "id": item.id,
                "label": item.label,
                "lane": item.lane,
                "agentRole": item.agent_role,
                "score": score,
            }
            for score, item in scored[:limit]
        ]


def build_capability_contract() -> dict[str, Any]:
    domains = [item.as_dict() for item in CAPABILITY_DOMAINS]
    lane_counts: dict[str, int] = {}
    for item in CAPABILITY_DOMAINS:
        lane_counts[item.lane] = lane_counts.get(item.lane, 0) + 1
    domain_ids = [item.id for item in CAPABILITY_DOMAINS]
    plugin_inventory = build_plugin_inventory_contract(domain_ids)
    platform_contract = build_platform_contract()

    return {
        "version": 1,
        "id": "seis-universal-capability-kernel",
        "mode": "ai_agent_mcp_skill_plugin_llm_capability_coverage",
        "summary": {
            "domainCount": len(CAPABILITY_DOMAINS),
            "laneCount": len(lane_counts),
            "requiredDomainCount": len(REQUIRED_DOMAIN_IDS),
            "agentRoles": sorted({item.agent_role for item in CAPABILITY_DOMAINS}),
            "lanes": dict(sorted(lane_counts.items())),
            "pluginGroupCount": plugin_inventory["groupCount"],
            "pluginInventoryCount": plugin_inventory["pluginCount"],
            "coveredPluginCount": plugin_inventory["coveredPluginCount"],
            "minimumDomainPluginCount": plugin_inventory["minimumDomainPluginCount"],
            "platformCount": platform_contract["summary"]["platformCount"],
            "appleLanguageCount": platform_contract["summary"]["appleLanguageCount"],
            "windowsLanguageCount": platform_contract["summary"]["windowsLanguageCount"],
        },
        "sourceReferences": {
            "kernelCode": "packages/seis_kernel/capabilities.py",
            "polyglotManifest": "polyglot/manifest.json",
            "llmRoutingPolicy": "content/development/llm-task-routing-policy.json",
            "pluginSources": "deploy/cloud-environment.json",
        },
        "routingContract": {
            "entrypoint": "DomainRouter.route(text)",
            "seisRole": "SEIS stays the task-facing AI agent; local and remote LLMs become helpers behind scoped routing.",
            "executionBoundary": "No connector, MCP server, plugin, or external model is activated unless task relevance, authentication, permission scope, and user approval are clear.",
        },
        "pluginInventory": plugin_inventory,
        "platformCompatibility": platform_contract,
        "domains": domains,
        "flowchart": render_mermaid_flow(),
    }


def render_mermaid_flow() -> str:
    return "\n".join(
        [
            "flowchart TD",
            '  A["User goal"] --> B["SEIS intent intake"]',
            '  B --> C["DomainRouter capability match"]',
            '  C --> D["Agent role + LLM route"]',
            '  D --> E["MCP / plugin / skill gate"]',
            '  E --> F["Implementation plan"]',
            '  F --> G["Code, docs, or artifact change"]',
            '  G --> H["Quality gates"]',
            '  H --> I["Report and next reversible step"]',
        ]
    )


def validate_capability_contract(contract: dict[str, Any]) -> list[str]:
    failures: list[str] = []
    domains = contract.get("domains", [])
    ids = [item.get("id") for item in domains]
    unique_ids = set(ids)

    if len(ids) != len(unique_ids):
        failures.append("domain ids must be unique")

    for required_id in REQUIRED_DOMAIN_IDS:
        if required_id not in unique_ids:
            failures.append(f"missing required domain: {required_id}")

    for item in domains:
        for field_name in [
            "label",
            "lane",
            "purpose",
            "agentRole",
            "algorithms",
            "foundations",
            "artifacts",
            "mcpHooks",
            "skillHooks",
            "pluginHooks",
            "qualityGates",
            "starterSurfaces",
            "flow",
        ]:
            value = item.get(field_name)
            if value is None or value == "" or value == []:
                failures.append(f"{item.get('id', '<unknown>')} missing {field_name}")

    if contract.get("summary", {}).get("domainCount") != len(REQUIRED_DOMAIN_IDS):
        failures.append("summary domainCount must match required domain count")

    if contract.get("summary", {}).get("pluginGroupCount", 0) < 5:
        failures.append("plugin inventory must cover at least five screenshot/plugin groups")

    if contract.get("summary", {}).get("minimumDomainPluginCount", 0) < 3:
        failures.append("every domain must have at least three plugin/tool hints")

    platform_summary = contract.get("platformCompatibility", {}).get("summary", {})
    if platform_summary.get("platformCount", 0) < 2:
        failures.append("platform compatibility must cover macOS and Windows")

    if platform_summary.get("appleLanguageCount", 0) < 3:
        failures.append("platform compatibility must include Swift, Objective-C, and AppleScript")

    if "SwiftUI" not in platform_summary.get("appleFrameworks", []):
        failures.append("platform compatibility must include SwiftUI playground support")

    if platform_summary.get("windowsLanguageCount", 0) < 12:
        failures.append("platform compatibility must include the primary Windows development language families")

    if "flowchart TD" not in contract.get("flowchart", ""):
        failures.append("flowchart must be Mermaid TD syntax")

    return failures
