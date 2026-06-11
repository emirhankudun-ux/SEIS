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

    return {
        "version": 1,
        "id": "seis-active-mission-board",
        "mode": "first_90_days_execution_board",
        "sourcePlan": source_plan["id"],
        "focusWindow": {
            "weeks": 12,
            "dailyRule": "ship one inspectable slice or one validated blocker note",
            "weeklyRule": "refresh reports, run checks, and promote next card only after gates pass",
        },
        "installPolicy": source_plan["installPolicy"],
        "summary": {
            "laneCount": len(BOARD_LANES),
            "cardCount": len(cards),
            "nowCount": sum(1 for card in cards if card["laneId"] == "now"),
            "nextCount": sum(1 for card in cards if card["laneId"] == "next"),
            "queuedCount": sum(1 for card in cards if card["laneId"] == "queued"),
            "platformCoverageCount": len(platform_coverage),
            "languageCoverageCount": len(language_coverage),
            "qualityGateCoverageCount": len(gate_coverage),
        },
        "lanes": BOARD_LANES,
        "platformCoverage": platform_coverage,
        "languageCoverage": language_coverage,
        "qualityGateCoverage": gate_coverage,
        "cards": cards,
    }


def build_card(lane: dict[str, Any], mission: dict[str, Any], plan: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": f"{lane['id']}-{mission['id']}",
        "laneId": lane["id"],
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

    for card in cards:
        for field in ["id", "laneId", "missionId", "agentRole", "platformScope", "primaryLanguages", "platformLanguagePolicy", "requiredOutputs", "qualityGates"]:
            if not card.get(field):
                failures.append(f"active board card missing {field}: {card.get('id', '<unknown>')}")
        if len(card.get("qualityGates", [])) < 4:
            failures.append(f"active board card needs at least four quality gates: {card.get('id', '<unknown>')}")
        if card.get("runtimeInstallPolicy") != "do_not_install_new_runtime_for_language_percentage":
            failures.append(f"active board card has unsafe runtime policy: {card.get('id', '<unknown>')}")

    return failures
