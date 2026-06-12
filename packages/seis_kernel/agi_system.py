"""SEIS AGI system contract.

The contract is AGI-inspired but grounded in human-owned engineering systems:
agents, memory, planning, research automation, plugin/MCP routing, quality
gates, and Apple-first implementation surfaces.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


GENERATED_AT = "2026-06-12"
TARGET_RELEASE_DATE = "2026-09-12"
JAVASCRIPT_TARGET_PERCENT = 21.0
TOKEN_SAVINGS_TARGET_PERCENT = 60


@dataclass(frozen=True)
class AGISubsystem:
    id: str
    label: str
    intent: str
    implementation_roots: tuple[str, ...]
    quality_gates: tuple[str, ...]


@dataclass(frozen=True)
class DomainFocus:
    id: int
    label: str
    lane: str


PRACTICAL_PRIORITY_DOMAINS = (
    "Computer Foundations",
    "Programming Foundations",
    "Data Structures",
    "Algorithms",
    "Mathematics",
    "Software Architecture",
    "Mobile Development",
    "Desktop Development",
    "Artificial Intelligence",
    "AI Native Systems",
    "AI Agent Ecosystems",
    "Data Engineering",
    "Design Technologies",
    "Platform Engineering",
    "Cybersecurity",
    "Testing and Quality",
    "Documentation Engineering",
    "Open Source",
    "DevOps",
    "Research Engineering",
)


AGI_SUBSYSTEMS: tuple[AGISubsystem, ...] = (
    AGISubsystem(
        id="agent-orchestration",
        label="Advanced Agent Orchestration",
        intent="Route Codex, Claude, Gemini, Qwen, local helpers, MCP tools, and plugins through one governed execution layer.",
        implementation_roots=("packages/seis-ai/", "mcp/", "plugins/seis/", "docs/development/agents/"),
        quality_gates=("single-writer-mode", "tool-minimization", "handoff-notes", "permission-scope"),
    ),
    AGISubsystem(
        id="memory-architecture",
        label="Memory Architecture",
        intent="Preserve durable project, architecture, governance, deployment, research, and design decisions without leaking secrets.",
        implementation_roots=("packages/seis_platform_swift/", "packages/seis_kernel/", "docs/governance/"),
        quality_gates=("source-backed-memory", "secret-safety", "retrieval-trace", "staleness-awareness"),
    ),
    AGISubsystem(
        id="planning-and-execution",
        label="Planning and Execution Kernel",
        intent="Turn large goals into reversible daily packets, 90-day release windows, and long-horizon mission waves.",
        implementation_roots=("content/development/seis-active-mission-board.json", "reports/seis-execution-packages.md"),
        quality_gates=("small-slices", "dependency-order", "rollback-ready", "no-runtime-bloat"),
    ),
    AGISubsystem(
        id="research-automation",
        label="Research Automation",
        intent="Prefer primary sources and task-specific research tools before implementation assumptions become architecture.",
        implementation_roots=("docs/research/", "reports/", "content/development/"),
        quality_gates=("primary-source-first", "version-compatibility", "citation-trace", "claim-boundary"),
    ),
    AGISubsystem(
        id="multi-agent-coordination",
        label="Multi-Agent Coordination",
        intent="Coordinate Codex execution, Claude architecture review, Gemini research validation, and local fallback helpers.",
        implementation_roots=("AGENTS.md", "packages/ai-language/", "docs/platform/"),
        quality_gates=("one-writer-at-a-time", "reviewer-role-separated", "diff-review", "human-approval"),
    ),
    AGISubsystem(
        id="plugin-mcp-skills",
        label="Plugin, MCP, and Skills Mesh",
        intent="Activate data, development, design, research, deployment, security, and collaboration capabilities only when relevant.",
        implementation_roots=("content/development/plugin-capability-lanes.json", "reports/plugin-capability-lanes.md"),
        quality_gates=("authenticated-scope", "read-write-gate", "minimum-required-tools", "no-fake-usage"),
    ),
    AGISubsystem(
        id="token-efficiency",
        label="Token Efficiency Engine",
        intent="Save at least 60 percent of prompt/runtime budget through retrieval, compression, source manifests, and staged plans.",
        implementation_roots=("AGENTS.md", "docs/governance/", "reports/seis-agi-system.md"),
        quality_gates=("bounded-context", "source-manifest", "summarize-before-expand", "avoid-repeated-discovery"),
    ),
    AGISubsystem(
        id="human-helper-ai",
        label="Human Helper AI",
        intent="Keep SEIS helpful to real people through calm UX, explainable decisions, accessibility, and human review.",
        implementation_roots=("apps/web/", "packages/seis_platform_swift/", "docs/agi/"),
        quality_gates=("accessibility", "humane-ux", "explainability", "human-in-the-loop"),
    ),
    AGISubsystem(
        id="security-governance",
        label="Security and Governance",
        intent="Keep credentials, user data, repository state, and connector writes behind explicit safety gates.",
        implementation_roots=("SECURITY.md", "docs/governance/", ".github/"),
        quality_gates=("least-privilege", "secret-safety", "auditability", "non-destructive-defaults"),
    ),
    AGISubsystem(
        id="observability-evaluation",
        label="Observability and Evaluation",
        intent="Measure agent quality, reliability, token efficiency, capability usage, and release readiness.",
        implementation_roots=("reports/", "scripts/", "packages/seis-ai/test/"),
        quality_gates=("deterministic-checks", "quality-metrics", "regression-tests", "release-evidence"),
    ),
)


PLUGIN_CAPABILITY_LANES = (
    {
        "id": "development-read-write",
        "label": "Development read/write",
        "sourceLaneIds": ("builder-and-prototyping", "cloud-devops-and-release", "platform-native-and-polyglot"),
        "examples": ("GitHub", "Build Web Apps", "Build iOS Apps", "Build macOS Apps", "Expo", "Vercel", "Cloudflare"),
        "activationGate": "Use only for scoped implementation, repo inspection, CI, deploy, or native platform validation.",
    },
    {
        "id": "data-read-write",
        "label": "Data read/write",
        "sourceLaneIds": ("backend-data-and-api", "analytics-observability-and-growth"),
        "examples": ("Airtable", "Supabase", "Neon Postgres", "MotherDuck", "Data Analytics", "Mixpanel", "PostHog"),
        "activationGate": "Use only with schema, date range, account scope, privacy boundary, and rollback path.",
    },
    {
        "id": "design-interactive",
        "label": "Design interactive",
        "sourceLaneIds": ("creative-production-and-design", "builder-and-prototyping"),
        "examples": ("Figma", "Canva", "Adobe", "Product Design", "Creative Production", "Fal", "Shutterstock"),
        "activationGate": "Use only with a design brief, asset rights, accessibility notes, and visual QA target.",
    },
    {
        "id": "research-knowledge",
        "label": "Research and knowledge",
        "sourceLaneIds": ("specialized-domain-and-research", "ai-workflow-docs-and-knowledge"),
        "examples": ("Hugging Face", "Scite", "Zotero", "Google Drive", "Notion", "Hebbia", "Readwise"),
        "activationGate": "Use only when source-backed evidence or durable knowledge retrieval is needed.",
    },
    {
        "id": "collaboration-operations",
        "label": "Collaboration and operations",
        "sourceLaneIds": ("collaboration-calendar-and-support", "sales-gtm-and-market-intelligence"),
        "examples": ("Slack", "Asana", "Linear", "Jira", "Google Calendar", "HubSpot", "Intercom"),
        "activationGate": "Use only with clear write intent, user approval, and communication scope.",
    },
)


IMAGE_REFERENCE_SIGNALS = (
    {
        "id": "basic-programming-concepts",
        "basename": "images.jpeg",
        "repositoryPath": "content/development/seis-agi-reference-assets/basic-programming-concepts.jpeg",
        "width": 259,
        "height": 194,
        "sha256": "ca3ac9207fc01deb73c5e29dc01e54b9b555917d709230558f45ba6b70a1a4b6",
        "used": True,
        "signals": ("program-development", "problem-analysis", "algorithm-design", "debugging", "documentation", "structured-programming"),
    },
    {
        "id": "python-mastery-topics",
        "basename": "Unknown-7.jpg",
        "repositoryPath": "content/development/seis-agi-reference-assets/python-programming-roadmap.jpg",
        "width": 203,
        "height": 249,
        "sha256": "a3e92f4e4f802c2ebd4209365da32328a07d9fe7fa045b01e8d9a5bc69a1c76f",
        "used": True,
        "signals": ("python-basics", "oop", "data-structures", "automation", "testing", "web-frameworks", "data-science"),
    },
    {
        "id": "college-project-matrix",
        "basename": "Unknown-6.jpg",
        "repositoryPath": "content/development/seis-agi-reference-assets/college-projects.jpg",
        "width": 225,
        "height": 225,
        "sha256": "636a1a11e3834f8f3cd3ac671190817b7284fdf2709aedbd177cb2e370d25fc3",
        "used": True,
        "signals": ("starter-projects", "javascript", "python", "c-plus-plus", "java", "apps", "automation"),
    },
    {
        "id": "important-python-topics",
        "basename": "Unknown-5.jpg",
        "repositoryPath": "content/development/seis-agi-reference-assets/python-important-topics.jpg",
        "width": 183,
        "height": 275,
        "sha256": "5269fa772942be1eeba6def63369ce6806efa26fe2d6ee0fce802d29e4083d7e",
        "used": True,
        "signals": ("syntax", "data-structures", "oop", "file-handling", "web-development", "data-analysis", "machine-learning", "concurrency"),
    },
    {
        "id": "advanced-c-projects",
        "basename": "Unknown-4.jpg",
        "repositoryPath": "content/development/seis-agi-reference-assets/advanced-c-projects.jpg",
        "width": 193,
        "height": 261,
        "sha256": "65420ae94d110ccc4eacc47395e365198a27a04345765a2014fceceb81dd5b37",
        "used": True,
        "signals": ("c", "systems-programming", "data-structures", "file-handling", "graphics", "simulation"),
    },
    {
        "id": "functional-programming-core",
        "basename": "Unknown-3.jpg",
        "repositoryPath": "content/development/seis-agi-reference-assets/functional-programming-concepts.jpg",
        "width": 263,
        "height": 192,
        "sha256": "577f43a89399f8a3427feffcfb843e7a6faa785a5a131cc25607046fcdde3ab7",
        "used": True,
        "signals": ("pure-functions", "immutability", "higher-order-functions", "recursion", "referential-transparency", "lazy-evaluation"),
    },
    {
        "id": "dsa-interview-map",
        "basename": "Unknown-2.jpg",
        "repositoryPath": "content/development/seis-agi-reference-assets/dsa-interview-topics.jpg",
        "width": 256,
        "height": 197,
        "sha256": "345a957822efcb96868098495cec4646156aa8ab55958f3c5a10886327d5ed9b",
        "used": True,
        "signals": ("arrays", "trees", "graphs", "sorting", "searching", "two-pointers", "dynamic-programming", "greedy"),
    },
    {
        "id": "programming-reference-sites",
        "basename": "Unknown.jpg",
        "repositoryPath": "content/development/seis-agi-reference-assets/programming-blogs-websites.jpg",
        "width": 197,
        "height": 256,
        "sha256": "ec806dabf4a8316615e1a4a7e5ca85974c0399ed1e26600e6bd28780ef93e716",
        "used": True,
        "signals": ("learning-resources", "programming-blogs", "real-python", "css-tricks", "knowledge-sources"),
    },
)


EXPANDED_DOMAINS: tuple[DomainFocus, ...] = tuple(
    DomainFocus(index + 1, label, lane)
    for index, (label, lane) in enumerate(
        (
            ("Computer Foundations", "core-computing"),
            ("Programming Foundations", "core-computing"),
            ("Data Structures", "core-computing"),
            ("Algorithms", "core-computing"),
            ("Mathematics", "mathematics"),
            ("Object-Oriented Programming", "software-engineering"),
            ("Functional Programming", "software-engineering"),
            ("Software Architecture", "architecture"),
            ("Frontend Engineering", "product-engineering"),
            ("UI UX and Design Systems", "design-systems"),
            ("Backend Engineering", "product-engineering"),
            ("Databases", "data-engineering"),
            ("Mobile Development", "mobile"),
            ("Desktop Development", "desktop"),
            ("Game Development", "game-systems"),
            ("Cloud Technologies", "cloud"),
            ("DevOps", "devops"),
            ("Cybersecurity", "security-governance"),
            ("Artificial Intelligence", "ai-intelligence"),
            ("Robotics", "robotics"),
            ("Systems Programming", "systems"),
            ("Networking", "systems"),
            ("Testing and Quality", "quality"),
            ("Open Source", "open-source"),
            ("Advanced Engineering", "reliability"),
            ("Future Technologies", "future-systems"),
            ("Compilers and Programming Languages", "language-engineering"),
            ("Operating System Engineering", "systems"),
            ("Distributed Systems", "distributed-systems"),
            ("Data Engineering", "data-engineering"),
            ("MLOps", "mlops"),
            ("Computer Graphics", "graphics"),
            ("Human Computer Interaction", "hci"),
            ("Design Technologies", "design-systems"),
            ("Product Development", "product-governance"),
            ("FinTech Systems", "domain-systems"),
            ("Blockchain and Web3", "domain-systems"),
            ("Embedded Systems", "embedded"),
            ("Scientific Computing", "research-lab"),
            ("Enterprise Software Engineering", "enterprise"),
            ("Digital Content and Media Technologies", "media"),
            ("Search and Information Retrieval", "information-retrieval"),
            ("AI Native Systems", "ai-intelligence"),
            ("Observability and Operations", "reliability"),
            ("Digital Design and Creative Technologies", "creative"),
            ("Knowledge Engineering", "knowledge"),
            ("Documentation Engineering", "documentation"),
            ("Platform Engineering", "platform"),
            ("API Engineering", "api"),
            ("Developer Experience", "developer-experience"),
            ("Build and Release Engineering", "release"),
            ("Quality Engineering", "quality"),
            ("Reliability Engineering", "reliability"),
            ("Business Process Automation", "automation"),
            ("Low-Code No-Code Systems", "low-code"),
            ("Digital Ecosystem Design", "ecosystem"),
            ("Social and Community Systems", "community"),
            ("Education Technologies", "education"),
            ("Health Technologies", "health"),
            ("Geographic Information Systems", "geospatial"),
            ("Smart City Systems", "smart-cities"),
            ("Industry 4.0", "industry"),
            ("Aerospace and Space Software", "aerospace"),
            ("Financial Engineering", "finance"),
            ("Bioinformatics", "bioinformatics"),
            ("Legal Technologies", "legal-tech"),
            ("Sustainable Technology", "sustainability"),
            ("Digital Humanities", "humanities"),
            ("Cognitive Systems", "cognitive"),
            ("Humane Technology", "humane-tech"),
            ("Creative Artificial Intelligence", "creative-ai"),
            ("Enterprise AI Systems", "enterprise-ai"),
            ("AI Agent Ecosystems", "agent-ecosystem"),
            ("Digital Product Ecosystems", "product-ecosystem"),
            ("Future Operating Systems", "future-os"),
            ("Digital Civilization Systems", "civilization"),
            ("Knowledge Economy Systems", "knowledge-economy"),
            ("Decision Support Systems", "decision-intelligence"),
            ("Simulation Systems", "simulation"),
            ("Digital Twin Ecosystems", "digital-twins"),
            ("Autonomous Systems", "autonomy"),
            ("Collective Intelligence Systems", "collective-intelligence"),
            ("Human AI Collaboration Systems", "human-ai"),
            ("Digital Identity Systems", "identity"),
            ("Trust and Reputation Systems", "trust"),
            ("Information Security Architectures", "security-governance"),
            ("Data Governance", "data-governance"),
            ("Digital Archive Systems", "archives"),
            ("Personal Knowledge Systems", "personal-knowledge"),
            ("Cognitive Productivity Systems", "productivity"),
            ("Creative Ecosystems", "creative"),
            ("Design Operations", "design-ops"),
            ("AI Assisted Software Factories", "software-factory"),
            ("Agentic Organizations", "agent-organization"),
            ("Future Education Systems", "education"),
            ("Future Work Systems", "future-work"),
            ("Spatial Computing Ecosystems", "spatial"),
            ("Digital Culture Systems", "culture"),
            ("Super Platforms", "platform"),
            ("AI Native Civilization Systems", "civilization"),
            ("Scientific Discovery Systems", "scientific-discovery"),
            ("Research Engineering", "research-engineering"),
            ("Innovation Systems", "innovation"),
            ("Futures Studies", "foresight"),
            ("Systems Thinking", "systems-thinking"),
            ("Complexity Science", "complexity"),
            ("Organization Engineering", "organization"),
            ("Enterprise Knowledge Systems", "enterprise-knowledge"),
            ("Human Performance Systems", "human-performance"),
            ("Talent and Skill Systems", "skill-graph"),
            ("Digital Democracy Systems", "civic"),
            ("Social Technology", "social-tech"),
            ("Economic Simulation Systems", "economic-simulation"),
            ("Energy Systems", "energy"),
            ("Climate Technologies", "climate"),
            ("Space Ecosystems", "space"),
            ("Humanity Scale Systems", "global-systems"),
            ("Consciousness and Intelligence Research", "cognitive-research"),
            ("Meta Systems", "meta-systems"),
            ("Digital Civilization Engineering", "civilization"),
            ("Quantum Technologies", "quantum"),
            ("Neuromorphic Computing", "neuromorphic"),
            ("Brain Computer Interfaces", "bci"),
            ("Synthetic Biology", "synthetic-biology"),
            ("Computational Neuroscience", "neuroscience"),
            ("Molecular Computing", "molecular-computing"),
            ("Autonomous Science Systems", "scientific-discovery"),
            ("Artificial General Intelligence Systems", "agi-research"),
            ("Superintelligence Safety", "ai-safety"),
            ("Universal Knowledge Systems", "universal-knowledge"),
            ("Planetary Scale Computing", "planetary-computing"),
            ("Space Computing", "space"),
            ("Digital Life Systems", "artificial-life"),
            ("Computational Social Science", "computational-society"),
            ("Collective Superintelligence", "collective-intelligence"),
            ("Autonomous Economies", "machine-economies"),
            ("Machine Law", "legal-tech"),
            ("Planetary Engineering", "planetary-engineering"),
            ("Civilization Simulations", "civilization-simulation"),
            ("Post Digital Systems", "ambient-computing"),
            ("Spatial Internet", "spatial"),
            ("Metaverse Infrastructures", "metaverse"),
            ("Human Enhancement Technologies", "human-augmentation"),
            ("Digital Consciousness Systems", "synthetic-minds"),
            ("Civilization Scale Artificial Intelligence", "civilization-ai"),
            ("Evolutionary Artificial Intelligence", "evolutionary-ai"),
            ("Synthetic Reality Systems", "synthetic-worlds"),
            ("Multi-Civilization Systems", "space-civilization"),
            ("Cosmic Computing", "cosmic-computing"),
            ("Future Civilization Architectures", "future-civilization"),
        )
    )
)


def build_seis_agi_system() -> dict[str, Any]:
    domains_by_lane: dict[str, int] = {}
    for domain in EXPANDED_DOMAINS:
        domains_by_lane[domain.lane] = domains_by_lane.get(domain.lane, 0) + 1

    return {
        "version": 1,
        "id": "seis-agi-system",
        "generatedAt": GENERATED_AT,
        "mode": "human_owned_agi_inspired_engineering_system",
        "masterGoal": {
            "name": "SEIS MASTER GOAL",
            "northStar": "Continuously improve SEIS as a premium AI-native, full-stack, design-driven, open-source ecosystem for real users and contributors.",
            "claimBoundary": "This is an AGI-inspired operating architecture for human-helper AI systems; it does not claim autonomous general intelligence.",
            "workingMode": ("inspect", "analyze", "prioritize", "improve", "validate", "document"),
        },
        "releaseWindow": {
            "startDate": GENERATED_AT,
            "targetReleaseDate": TARGET_RELEASE_DATE,
            "cadence": "three_month_version_window",
            "milestones": (
                {"dayRange": "0-30", "theme": "agent memory planning foundation", "done": "AGI contract, source references, and token policy are generated and checked."},
                {"dayRange": "31-60", "theme": "plugin MCP skills read write lanes", "done": "Data, development, design, and research lanes have explicit activation gates."},
                {"dayRange": "61-90", "theme": "human helper release hardening", "done": "Evaluation, security, docs, and GitHub community health are release ready."},
            ),
        },
        "platformStrategy": {
            "priority": "apple_first_when_practical",
            "appleLanguages": ("Swift", "SwiftUI", "Objective-C", "Metal", "AppKit", "UIKit", "Combine", "Core Data", "CloudKit"),
            "webLanguages": ("TypeScript", "JavaScript", "HTML", "CSS"),
            "aiDataLanguages": ("Python", "Rust"),
            "androidLanguages": ("Kotlin", "Java", "Jetpack Compose"),
            "windowsLanguages": ("C#", ".NET", "C++", "Rust", "WinUI"),
            "systemsInfrastructureLanguages": ("Go", "Zig", "SQL", "Shell", "PowerShell"),
            "installPolicy": "avoid_unnecessary_sdks_runtimes_frameworks_dependencies_and_toolchain_bloat",
            "javascriptTargetPercent": JAVASCRIPT_TARGET_PERCENT,
            "htmlCssPolicy": "Keep HTML and CSS stable; do not distort GitHub Linguist just to move source percentages.",
        },
        "tokenEfficiency": {
            "targetSavingsPercent": TOKEN_SAVINGS_TARGET_PERCENT,
            "strategy": (
                "use source manifests before broad file reads",
                "reuse generated contracts instead of re-reading huge prompts",
                "summarize large evidence into bounded reports",
                "activate minimum required tools",
                "prefer deterministic checks over repeated reasoning",
                "cache stable architecture decisions in docs and reports",
            ),
        },
        "subsystems": [subsystem_to_dict(item) for item in AGI_SUBSYSTEMS],
        "pluginCapabilityLanes": PLUGIN_CAPABILITY_LANES,
        "imageReferenceSignals": IMAGE_REFERENCE_SIGNALS,
        "priorityDomains": [
            domain_to_dict(domain)
            for domain in EXPANDED_DOMAINS
            if domain.label in PRACTICAL_PRIORITY_DOMAINS
        ],
        "domainTaxonomy": [domain_to_dict(domain) for domain in EXPANDED_DOMAINS],
        "domainLanes": [{"lane": lane, "domainCount": count} for lane, count in sorted(domains_by_lane.items())],
        "implementation": {
            "swiftContract": "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGISystemContract.swift",
            "generator": "scripts/create-seis-agi-system.py",
            "sourceContract": "content/development/seis-agi-system.json",
            "report": "reports/seis-agi-system.md",
            "documentation": "docs/agi/seis-agi-system.md",
        },
        "qualityGates": (
            "agent_subsystems_at_least_10",
            "visual_sources_marked_used",
            "plugin_lanes_cover_data_development_design",
            "javascript_target_is_21_percent",
            "token_savings_target_is_60_percent",
            "apple_first_language_contract_present",
            "no_runtime_install_for_language_percentage",
            "security_and_human_review_gates_present",
        ),
    }


def validate_seis_agi_system(contract: dict[str, Any]) -> list[str]:
    failures: list[str] = []

    if contract.get("id") != "seis-agi-system":
        failures.append("AGI system contract id must be seis-agi-system")
    if contract.get("platformStrategy", {}).get("javascriptTargetPercent") != JAVASCRIPT_TARGET_PERCENT:
        failures.append("AGI system must pin JavaScript target at 21 percent")
    if contract.get("tokenEfficiency", {}).get("targetSavingsPercent", 0) < TOKEN_SAVINGS_TARGET_PERCENT:
        failures.append("AGI system must target at least 60 percent token savings")
    if len(contract.get("subsystems", [])) < 10:
        failures.append("AGI system must include at least ten subsystems")
    if len(contract.get("domainTaxonomy", [])) < 150:
        failures.append("AGI system must include the expanded 150-domain taxonomy")
    if len(contract.get("priorityDomains", [])) < 12:
        failures.append("AGI system must keep practical priority domains visible")

    used_sources = [source for source in contract.get("imageReferenceSignals", []) if source.get("used")]
    if len(used_sources) < 8:
        failures.append("AGI system must mark the provided programming images as used")
    for source in used_sources:
        if not source.get("repositoryPath"):
            failures.append(f"AGI visual source missing repository path: {source.get('id')}")

    lane_ids = {lane.get("id") for lane in contract.get("pluginCapabilityLanes", [])}
    for required in ["development-read-write", "data-read-write", "design-interactive"]:
        if required not in lane_ids:
            failures.append(f"AGI system missing plugin lane: {required}")

    apple_languages = set(contract.get("platformStrategy", {}).get("appleLanguages", []))
    for required in ["Swift", "SwiftUI", "Objective-C", "Metal", "AppKit", "UIKit", "Combine", "Core Data", "CloudKit"]:
        if required not in apple_languages:
            failures.append(f"AGI system Apple language/framework strategy missing {required}")

    claim_boundary = contract.get("masterGoal", {}).get("claimBoundary", "")
    if "does not claim autonomous general intelligence" not in claim_boundary:
        failures.append("AGI system must keep the human-owned claim boundary explicit")

    return failures


def subsystem_to_dict(subsystem: AGISubsystem) -> dict[str, Any]:
    return {
        "id": subsystem.id,
        "label": subsystem.label,
        "intent": subsystem.intent,
        "implementationRoots": subsystem.implementation_roots,
        "qualityGates": subsystem.quality_gates,
    }


def domain_to_dict(domain: DomainFocus) -> dict[str, Any]:
    return {
        "id": domain.id,
        "label": domain.label,
        "lane": domain.lane,
    }
