"""Active execution board for the SEIS long-horizon plan."""

from __future__ import annotations

from typing import Any

from .long_horizon import build_long_horizon_plan, validate_long_horizon_plan


BOARD_LANES = [
    {
        "id": "now",
        "label": "Now",
        "waveId": "wave-01-foundation",
        "wipLimit": 10,
        "cadence": "daily reversible implementation slices",
    },
    {
        "id": "next",
        "label": "Next",
        "waveId": "wave-02-apple-native",
        "wipLimit": 10,
        "cadence": "weekly Apple-native platform slices",
    },
    {
        "id": "queued",
        "label": "Queued",
        "waveId": "wave-03-windows-polyglot",
        "wipLimit": 10,
        "cadence": "weekly Windows polyglot platform slices",
    },
]

MONTH_WINDOWS = [
    {
        "id": "month-01-foundation-architecture-docs",
        "label": "Month 1",
        "dayRange": "0-30",
        "laneId": "now",
        "theme": "Foundation, architecture, documentation",
        "acceptanceGates": (
            "agi-contract-generated",
            "agent-memory-planning-foundation-visible",
            "github-community-health-current",
            "quality-gates-pass",
        ),
        "evidencePaths": (
            "reports/seis-agi-system.md",
            "reports/seis-active-mission-board.md",
            "README.md",
            "AGENTS.md",
        ),
    },
    {
        "id": "month-02-memory-planning-mcp",
        "label": "Month 2",
        "dayRange": "31-60",
        "laneId": "next",
        "theme": "Memory, planning, MCP",
        "acceptanceGates": (
            "memory-checkpoints-traceable",
            "planning-loops-deterministic",
            "plugin-mcp-lanes-scoped",
            "apple-first-contract-covered",
        ),
        "evidencePaths": (
            "content/development/seis-agi-system.json",
            "packages/seis_platform_swift/Sources/SeisPlatformKit/SeisAGISystemContract.swift",
            "reports/plugin-capability-lanes.md",
            "reports/seis-execution-runway.md",
        ),
    },
    {
        "id": "month-03-agents-validation-release",
        "label": "Month 3",
        "dayRange": "61-90",
        "laneId": "queued",
        "theme": "Agents, validation, release",
        "acceptanceGates": (
            "agent-roles-separated",
            "security-and-human-review-gates-present",
            "github-community-health-ready",
            "release-evidence-current",
        ),
        "evidencePaths": (
            "docs/development/agents/README.md",
            "SECURITY.md",
            ".github/PULL_REQUEST_TEMPLATE.md",
            "reports/seis-agi-system.json",
        ),
    },
]

MASTER_GOAL_TRACE = {
    "id": "seis-v12-master-prompt-trace",
    "northStar": "Continuously improve SEIS as a sustainable, high-quality, Apple-first, AI-native, open-source ecosystem.",
    "workflow": ("inspect", "analyze", "understand-context", "identify-risks", "plan", "validate", "document"),
    "priorityFocusAreas": (
        "engineering",
        "architecture",
        "design",
        "ai-agents",
        "mcp-plugins",
        "data",
        "automation",
        "documentation",
        "research",
        "product",
    ),
    "avoid": (
        "unnecessary-dependencies",
        "technical-debt",
        "duplicated-solutions",
        "low-value-changes",
        "runtime-installs-for-language-percentages",
    ),
}


def build_active_mission_board(plan: dict[str, Any] | None = None) -> dict[str, Any]:
    """Build a deterministic 90-day execution board from the 52-week plan."""

    source_plan = plan or build_long_horizon_plan()
    plan_failures = validate_long_horizon_plan(source_plan)
    if plan_failures:
        return {
            "version": 1,
            "id": "seis-active-mission-board",
            "mode": "invalid_source_plan",
            "sourceFailures": plan_failures,
            "summary": {},
            "lanes": [],
            "cards": [],
        }

    missions_by_wave = {
        lane["waveId"]: [
            mission
            for mission in source_plan["missions"]
            if mission["waveId"] == lane["waveId"]
        ]
        for lane in BOARD_LANES
    }

    cards = []
    for lane in BOARD_LANES:
        for mission in missions_by_wave[lane["waveId"]][: lane["wipLimit"]]:
            cards.append(build_card(lane, mission, source_plan))

    language_coverage = sorted({language for card in cards for language in card["primaryLanguages"]})
    platform_coverage = sorted({platform for card in cards for platform in card["platformScope"]})
    gate_coverage = sorted({gate for card in cards for gate in card["qualityGates"]})
    acceptance_gate_coverage = sorted(
        {gate for window in MONTH_WINDOWS for gate in window["acceptanceGates"]}
    )

    return {
        "version": 1,
        "id": "seis-active-mission-board",
        "mode": "first_90_days_execution_board",
        "sourcePlan": source_plan["id"],
        "masterGoalTrace": MASTER_GOAL_TRACE,
        "focusWindow": {
            "weeks": 12,
            "dailyRule": "ship one inspectable slice or one validated blocker note",
            "weeklyRule": "refresh reports, run checks, and promote next card only after gates pass",
        },
        "monthWindows": MONTH_WINDOWS,
        "installPolicy": source_plan["installPolicy"],
        "summary": {
            "laneCount": len(BOARD_LANES),
            "monthWindowCount": len(MONTH_WINDOWS),
            "cardCount": len(cards),
            "nowCount": sum(1 for card in cards if card["laneId"] == "now"),
            "nextCount": sum(1 for card in cards if card["laneId"] == "next"),
            "queuedCount": sum(1 for card in cards if card["laneId"] == "queued"),
            "platformCoverageCount": len(platform_coverage),
            "languageCoverageCount": len(language_coverage),
            "qualityGateCoverageCount": len(gate_coverage),
            "acceptanceGateCoverageCount": len(acceptance_gate_coverage),
        },
        "lanes": BOARD_LANES,
        "platformCoverage": platform_coverage,
        "languageCoverage": language_coverage,
        "qualityGateCoverage": gate_coverage,
        "acceptanceGateCoverage": acceptance_gate_coverage,
        "cards": cards,
    }


def build_card(lane: dict[str, Any], mission: dict[str, Any], plan: dict[str, Any]) -> dict[str, Any]:
    month_window = next(window for window in MONTH_WINDOWS if window["laneId"] == lane["id"])
    return {
        "id": f"{lane['id']}-{mission['id']}",
        "laneId": lane["id"],
        "monthWindowId": month_window["id"],
        "missionId": mission["id"],
        "order": mission["order"],
        "title": mission["label"],
        "domainId": mission["domainId"],
        "agentRole": mission["agentRole"],
        "platformScope": mission["platformScope"],
        "primaryLanguages": mission["primaryLanguages"],
        "requiredOutputs": mission["requiredOutputs"],
        "qualityGates": mission["qualityGates"],
        "platformLanguagePolicy": mission["platformLanguagePolicy"],
        "dependencies": mission["dependencies"],
        "executionMode": "local_first_seis_agent_with_remote_provider_delegation",
        "monthAcceptanceGates": month_window["acceptanceGates"],
        "monthEvidencePaths": month_window["evidencePaths"],
        "doneDefinition": [
            "source artifact is generated or updated",
            "check command passes without stale output",
            "changed files are reviewable and reversible",
            "no runtime is installed only for language percentage goals",
        ],
        "runtimeInstallPolicy": plan["installPolicy"]["default"],
    }


def validate_active_mission_board(board: dict[str, Any]) -> list[str]:
    failures: list[str] = []
    summary = board.get("summary", {})
    cards = board.get("cards", [])
    language_coverage = set(board.get("languageCoverage", []))
    platform_coverage = set(board.get("platformCoverage", []))

    if summary.get("laneCount", 0) < 3:
        failures.append("active board must contain now, next, and queued lanes")
    if summary.get("monthWindowCount", 0) != 3:
        failures.append("active board must contain exactly three month windows")
    if summary.get("cardCount", 0) < 30:
        failures.append("active board must contain at least 30 executable cards")
    if summary.get("nowCount", 0) < 10:
        failures.append("active board must keep a full foundation now lane")
    if summary.get("nextCount", 0) < 10:
        failures.append("active board must keep a full Apple next lane")
    if summary.get("queuedCount", 0) < 10:
        failures.append("active board must keep a full Windows queued lane")

    for required_platform in ["macos", "ios", "windows"]:
        if required_platform not in platform_coverage:
            failures.append(f"active board platform coverage missing {required_platform}")

    for required_language in ["Python", "Swift", "SwiftUI", "Objective-C", "Playground", "AppleScript", "C#", "PowerShell"]:
        if required_language not in language_coverage:
            failures.append(f"active board language coverage missing {required_language}")

    month_windows = board.get("monthWindows", [])
    month_ids = {window.get("id") for window in month_windows}
    if len(month_ids) != 3:
        failures.append("active board month windows must have three unique ids")
    for required_gate in [
        "agi-contract-generated",
        "memory-checkpoints-traceable",
        "plugin-mcp-lanes-scoped",
        "agent-roles-separated",
        "release-evidence-current",
    ]:
        if required_gate not in set(board.get("acceptanceGateCoverage", [])):
            failures.append(f"active board acceptance gate coverage missing {required_gate}")

    master_goal = board.get("masterGoalTrace", {})
    if "Apple-first" not in master_goal.get("northStar", ""):
        failures.append("active board master goal trace must keep Apple-first north star")
    if "mcp-plugins" not in master_goal.get("priorityFocusAreas", []):
        failures.append("active board master goal trace must include MCP/plugins")

    for card in cards:
        for field in ["id", "laneId", "monthWindowId", "missionId", "agentRole", "platformScope", "primaryLanguages", "platformLanguagePolicy", "requiredOutputs", "qualityGates", "monthAcceptanceGates", "monthEvidencePaths"]:
            if not card.get(field):
                failures.append(f"active board card missing {field}: {card.get('id', '<unknown>')}")
        if len(card.get("qualityGates", [])) < 4:
            failures.append(f"active board card needs at least four quality gates: {card.get('id', '<unknown>')}")
        if card.get("monthWindowId") not in month_ids:
            failures.append(f"active board card points to unknown month window: {card.get('id', '<unknown>')}")
        if len(card.get("monthAcceptanceGates", [])) < 4:
            failures.append(f"active board card needs at least four month acceptance gates: {card.get('id', '<unknown>')}")
        if card.get("runtimeInstallPolicy") != "do_not_install_new_runtime_for_language_percentage":
            failures.append(f"active board card has unsafe runtime policy: {card.get('id', '<unknown>')}")

    return failures
