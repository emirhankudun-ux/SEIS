"""Long-horizon execution kernel for SEIS.

This module turns the broad SEIS capability map into a durable mission plan.
It is intentionally deterministic so automation can regenerate and check it
without depending on network services or heavyweight local runtimes.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .capabilities import REQUIRED_DOMAIN_IDS
from .platform_language_policy import (
    apple_language_set,
    platform_languages_for,
    validate_platform_language_assignments,
    windows_language_set,
)


@dataclass(frozen=True)
class MissionPattern:
    id: str
    label: str
    intent: str
    outputs: tuple[str, ...]
    gates: tuple[str, ...]
    languages: tuple[str, ...]


@dataclass(frozen=True)
class MissionWave:
    id: str
    label: str
    horizon: str
    lane: str
    agent_role: str
    platform_scope: tuple[str, ...]
    languages: tuple[str, ...]


MISSION_PATTERNS = [
    MissionPattern(
        id="architecture-contract",
        label="Architecture Contract",
        intent="Create an inspectable contract before implementation expands.",
        outputs=("architecture note", "interface contract", "risk register"),
        gates=("maintainability", "security", "testability", "rollback-plan"),
        languages=("Python", "CUE", "SQL"),
    ),
    MissionPattern(
        id="agent-policy",
        label="Agent Policy",
        intent="Define what SEIS agents may execute, delegate, or refuse.",
        outputs=("agent policy", "permission matrix", "fallback path"),
        gates=("permission-scope", "credential-safety", "human-approval", "offline-fallback"),
        languages=("Python", "Rego", "Markdown"),
    ),
    MissionPattern(
        id="platform-bridge",
        label="Platform Bridge",
        intent="Bridge local OS capabilities without making the OS boundary vague.",
        outputs=("platform adapter", "runtime readiness check", "path safety rule"),
        gates=("platform-syntax", "path-safety", "permission-scope", "runtime-optional"),
        languages=("Swift", "C#", "PowerShell", "Python"),
    ),
    MissionPattern(
        id="data-plane",
        label="Data Plane",
        intent="Keep data contracts typed, auditable, and separable from UI code.",
        outputs=("data schema", "query contract", "lineage note"),
        gates=("schema-validity", "privacy-review", "migration-plan", "sample-test"),
        languages=("SQL", "Python", "R"),
    ),
    MissionPattern(
        id="design-engineering",
        label="Design Engineering",
        intent="Make design systems useful for engineers, designers, and software teams.",
        outputs=("design token map", "interaction states", "accessibility checklist"),
        gates=("accessibility", "responsive-fit", "motion-evidence", "typography-consistency"),
        languages=("Swift", "CSS", "HTML", "Python"),
    ),
    MissionPattern(
        id="quality-gate",
        label="Quality Gate",
        intent="Turn a capability into repeatable local validation.",
        outputs=("check script", "failure message", "developer note"),
        gates=("deterministic-check", "fail-fast", "actionable-error", "idempotent-output"),
        languages=("Python", "Go", "Shell"),
    ),
    MissionPattern(
        id="security-governance",
        label="Security Governance",
        intent="Keep every new surface behind explicit security and data governance.",
        outputs=("threat model", "secret handling rule", "abuse case table"),
        gates=("secret-detection", "least-privilege", "auditability", "safe-defaults"),
        languages=("Rego", "Python", "SQL"),
    ),
    MissionPattern(
        id="llm-orchestration",
        label="LLM Orchestration",
        intent="Route local and remote models while SEIS remains the task-facing agent.",
        outputs=("routing rule", "provider policy", "offline fallback"),
        gates=("provider-boundary", "token-budget", "model-fallback", "no-secret-leakage"),
        languages=("Python", "JSON", "YAML"),
    ),
    MissionPattern(
        id="runtime-surface",
        label="Runtime Surface",
        intent="Add a product-appropriate language surface without installing tools just for percentages.",
        outputs=("source stub", "readiness gate", "install policy"),
        gates=("source-present", "runtime-check-if-available", "no-heavy-install-by-default", "documented-owner"),
        languages=("Rust", "Go", "Java", "Kotlin", "Ruby", "PHP"),
    ),
    MissionPattern(
        id="release-readiness",
        label="Release Readiness",
        intent="Keep delivery reversible, observable, and aligned with GitHub governance.",
        outputs=("release note", "rollback checklist", "publish gate"),
        gates=("workspace-check", "release-sync", "language-budget", "cloud-readiness"),
        languages=("Python", "Shell", "Markdown"),
    ),
]


MISSION_WAVES = [
    MissionWave(
        id="wave-01-foundation",
        label="Foundation and Computer Science Core",
        horizon="weeks-01-04",
        lane="core-computing",
        agent_role="cs-foundation-agent",
        platform_scope=("macos", "windows", "web", "backend"),
        languages=("Python", "Go", "Rust", "SQL", "CUE"),
    ),
    MissionWave(
        id="wave-02-apple-native",
        label="Apple Native Studio",
        horizon="weeks-05-08",
        lane="product-engineering",
        agent_role="apple-platform-agent",
        platform_scope=("macos", "ios"),
        languages=("Swift", "SwiftUI", "Objective-C", "Playground", "AppleScript"),
    ),
    MissionWave(
        id="wave-03-windows-polyglot",
        label="Windows Polyglot Studio",
        horizon="weeks-09-12",
        lane="product-engineering",
        agent_role="windows-agent",
        platform_scope=("windows",),
        languages=("C#", "F#", "Visual Basic", "PowerShell", "Batch", "C++", "Rust", "Go", "Python", "Java", "Kotlin", "SQL", "R", "Lua", "Ruby", "PHP"),
    ),
    MissionWave(
        id="wave-04-ai-agent",
        label="AI Agent and LLM Orchestration",
        horizon="weeks-13-16",
        lane="ai-intelligence",
        agent_role="llm-routing-agent",
        platform_scope=("local-ai", "remote-ai", "offline"),
        languages=("Python", "Rego", "YAML", "JSON"),
    ),
    MissionWave(
        id="wave-05-mcp-skills-plugins",
        label="MCP Skills and Plugin Governance",
        horizon="weeks-17-20",
        lane="governance",
        agent_role="integration-agent",
        platform_scope=("mcp", "skills", "plugins"),
        languages=("Python", "Rego", "Shell", "JSON"),
    ),
    MissionWave(
        id="wave-06-full-stack",
        label="Full Stack Product Surfaces",
        horizon="weeks-21-24",
        lane="product-engineering",
        agent_role="full-stack-agent",
        platform_scope=("web", "backend", "database"),
        languages=("Python", "Go", "SQL", "HTML", "CSS"),
    ),
    MissionWave(
        id="wave-07-data-intelligence",
        label="Data Science and Intelligence",
        horizon="weeks-25-28",
        lane="data-intelligence",
        agent_role="data-science-agent",
        platform_scope=("analytics", "ml", "big-data"),
        languages=("Python", "R", "SQL", "Julia"),
    ),
    MissionWave(
        id="wave-08-design-creative",
        label="Design, UX, and Creative Production",
        horizon="weeks-29-32",
        lane="design-systems",
        agent_role="ux-ui-agent",
        platform_scope=("design", "creative", "accessibility"),
        languages=("Swift", "CSS", "HTML", "Python"),
    ),
    MissionWave(
        id="wave-09-security-sre",
        label="Security SRE and Observability",
        horizon="weeks-33-36",
        lane="security-governance",
        agent_role="sre-agent",
        platform_scope=("security", "observability", "incident-response"),
        languages=("Rego", "Python", "SQL", "Shell"),
    ),
    MissionWave(
        id="wave-10-research-labs",
        label="Research Labs and Advanced Computing",
        horizon="weeks-37-40",
        lane="research-lab",
        agent_role="research-agent",
        platform_scope=("nlp", "vision", "quantum", "robotics"),
        languages=("Python", "Rust", "Q#", "MATLAB"),
    ),
    MissionWave(
        id="wave-11-language-engineering",
        label="Compiler and Language Engineering",
        horizon="weeks-41-46",
        lane="core-computing",
        agent_role="language-engineering-agent",
        platform_scope=("compiler", "formal-methods", "reverse-engineering"),
        languages=("Rust", "OCaml", "Haskell", "C", "C++"),
    ),
    MissionWave(
        id="wave-12-delivery",
        label="Delivery Metrics and Sustainable Operations",
        horizon="weeks-47-52",
        lane="product-governance",
        agent_role="delivery-agent",
        platform_scope=("release", "metrics", "sustainability", "governance"),
        languages=("Python", "Go", "SQL", "Shell"),
    ),
]


def build_long_horizon_plan() -> dict[str, Any]:
    missions = []
    for wave_index, wave in enumerate(MISSION_WAVES):
        previous_mission_id = None
        for pattern_index, pattern in enumerate(MISSION_PATTERNS):
            mission_number = (wave_index * len(MISSION_PATTERNS)) + pattern_index + 1
            domain_id = REQUIRED_DOMAIN_IDS[(mission_number - 1) % len(REQUIRED_DOMAIN_IDS)]
            mission_id = f"{wave.id}-m{pattern_index + 1:02d}-{pattern.id}"
            dependencies = []
            if previous_mission_id is not None:
                dependencies.append(previous_mission_id)
            elif wave_index > 0:
                dependencies.append(f"{MISSION_WAVES[wave_index - 1].id}-m10-release-readiness")

            languages = resolve_primary_languages(wave, pattern)
            platform_language_policy = platform_languages_for(wave.platform_scope, languages)
            missions.append(
                {
                    "id": mission_id,
                    "order": mission_number,
                    "waveId": wave.id,
                    "waveLabel": wave.label,
                    "horizon": wave.horizon,
                    "lane": wave.lane,
                    "agentRole": wave.agent_role,
                    "domainId": domain_id,
                    "platformScope": list(wave.platform_scope),
                    "label": pattern.label,
                    "intent": pattern.intent,
                    "requiredOutputs": list(pattern.outputs),
                    "qualityGates": sorted(set(pattern.gates).union({"reviewable-diff", "docs-updated"})),
                    "primaryLanguages": languages,
                    "platformLanguagePolicy": platform_language_policy,
                    "dependencies": dependencies,
                    "status": "planned",
                }
            )
            previous_mission_id = mission_id

    domain_coverage = sorted({mission["domainId"] for mission in missions})
    language_coverage = sorted({language for mission in missions for language in mission["primaryLanguages"]})
    apple_missions = [mission for mission in missions if "macos" in mission["platformScope"] or "ios" in mission["platformScope"]]
    windows_missions = [mission for mission in missions if "windows" in mission["platformScope"]]

    return {
        "version": 1,
        "id": "seis-long-horizon-mission-kernel",
        "mode": "aggressive_long_duration_execution_backlog",
        "duration": {
            "weeks": 52,
            "cadence": {
                "daily": "one small reversible mission slice",
                "weekly": "one wave checkpoint and generated progress report",
                "monthly": "platform, security, and release readiness review",
            },
        },
        "installPolicy": {
            "default": "do_not_install_new_runtime_for_language_percentage",
            "allowedWhen": [
                "a mission has a real build, test, deploy, or product runtime requirement",
                "the runtime is needed to validate a user-approved platform target",
                "the dependency can be removed or isolated if the mission is reverted",
            ],
        },
        "summary": {
            "waveCount": len(MISSION_WAVES),
            "missionCount": len(missions),
            "domainCoverageCount": len(domain_coverage),
            "languageCoverageCount": len(language_coverage),
            "appleMissionCount": len(apple_missions),
            "windowsMissionCount": len(windows_missions),
            "minimumQualityGateCount": min(len(mission["qualityGates"]) for mission in missions),
        },
        "sourceReferences": {
            "capabilityKernel": "content/development/seis-universal-capability-kernel.json",
            "platformKernel": "packages/seis_kernel/platform_matrix.py",
            "refreshCommand": "npm run automation:refresh-seis-surface",
        },
        "waves": [wave.__dict__ | {"languages": list(wave.languages), "platform_scope": list(wave.platform_scope)} for wave in MISSION_WAVES],
        "domainCoverage": domain_coverage,
        "languageCoverage": language_coverage,
        "missions": missions,
    }


def resolve_primary_languages(wave: MissionWave, pattern: MissionPattern) -> list[str]:
    requested = set(wave.languages).union(pattern.languages)
    platforms = set(wave.platform_scope)
    if platforms and platforms.issubset({"macos", "ios"}):
        return sorted(apple_language_set())
    if platforms == {"windows"}:
        return sorted(requested & windows_language_set())
    return sorted(requested)


def validate_long_horizon_plan(plan: dict[str, Any]) -> list[str]:
    failures: list[str] = []
    summary = plan.get("summary", {})
    missions = plan.get("missions", [])
    domain_coverage = set(plan.get("domainCoverage", []))
    language_coverage = set(plan.get("languageCoverage", []))

    if summary.get("missionCount", 0) < 100:
        failures.append("long-horizon plan must contain at least 100 missions")
    if summary.get("waveCount", 0) < 12:
        failures.append("long-horizon plan must contain at least 12 waves")
    if len(domain_coverage) < len(REQUIRED_DOMAIN_IDS):
        failures.append("long-horizon plan must cover every required SEIS capability domain")
    if summary.get("appleMissionCount", 0) < 10:
        failures.append("long-horizon plan must include at least 10 Apple-platform missions")
    if summary.get("windowsMissionCount", 0) < 10:
        failures.append("long-horizon plan must include at least 10 Windows-platform missions")
    if summary.get("minimumQualityGateCount", 0) < 4:
        failures.append("each long-horizon mission must include at least four quality gates")

    for required_language in ["Swift", "SwiftUI", "Objective-C", "Playground", "AppleScript", "C#", "PowerShell", "Python", "Go", "Rust", "SQL"]:
        if required_language not in language_coverage:
            failures.append(f"long-horizon language coverage missing {required_language}")

    failures.extend(validate_platform_language_assignments(missions))

    if plan.get("installPolicy", {}).get("default") != "do_not_install_new_runtime_for_language_percentage":
        failures.append("long-horizon install policy must forbid runtime installs only for language percentages")

    ids = [mission.get("id") for mission in missions]
    if len(ids) != len(set(ids)):
        failures.append("mission ids must be unique")

    for mission in missions:
        for field in ["id", "waveId", "domainId", "agentRole", "requiredOutputs", "qualityGates", "primaryLanguages"]:
            if not mission.get(field):
                failures.append(f"mission missing {field}: {mission.get('id', '<unknown>')}")

    return failures
