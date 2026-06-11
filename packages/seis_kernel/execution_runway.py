"""Long-duration runway for SEIS execution packages."""

from __future__ import annotations

from typing import Any

from .execution_packages import build_execution_packages, validate_execution_packages


RUNWAY_PHASES = [
    {
        "id": "phase-01-foundation-deepening",
        "label": "Foundation Deepening",
        "weeks": "01-06",
        "laneId": "now",
        "focusHours": 180,
    },
    {
        "id": "phase-02-apple-native-deepening",
        "label": "Apple Native Deepening",
        "weeks": "07-13",
        "laneId": "next",
        "focusHours": 210,
    },
    {
        "id": "phase-03-windows-polyglot-deepening",
        "label": "Windows Polyglot Deepening",
        "weeks": "14-20",
        "laneId": "queued",
        "focusHours": 210,
    },
    {
        "id": "phase-04-cross-platform-hardening",
        "label": "Cross Platform Hardening",
        "weeks": "21-26",
        "laneId": "all",
        "focusHours": 180,
    },
]


def build_execution_runway(bundle: dict[str, Any] | None = None) -> dict[str, Any]:
    source_bundle = bundle or build_execution_packages()
    bundle_failures = validate_execution_packages(source_bundle)
    if bundle_failures:
        return {
            "version": 1,
            "id": "seis-execution-runway",
            "mode": "invalid_execution_packages",
            "sourceFailures": bundle_failures,
            "summary": {},
            "slots": [],
        }

    slots = []
    for phase in RUNWAY_PHASES:
        phase_packages = select_phase_packages(source_bundle["packages"], phase["laneId"])
        hours_per_package = phase["focusHours"] // max(1, len(phase_packages))
        for index, package in enumerate(phase_packages):
            slots.append(build_slot(phase, package, index + 1, hours_per_package))

    checkpoints = build_checkpoints(slots)
    return {
        "version": 1,
        "id": "seis-execution-runway",
        "mode": "extreme_long_duration_execution_runway",
        "sourcePackages": source_bundle["id"],
        "duration": {
            "weeks": 26,
            "minimumFocusHours": sum(phase["focusHours"] for phase in RUNWAY_PHASES),
            "cadence": "deep multi-week work windows with weekly generated checkpoints",
        },
        "governance": source_bundle["governance"],
        "summary": {
            "phaseCount": len(RUNWAY_PHASES),
            "slotCount": len(slots),
            "checkpointCount": len(checkpoints),
            "minimumFocusHours": sum(phase["focusHours"] for phase in RUNWAY_PHASES),
            "packageCoverageCount": len({slot["packageId"] for slot in slots}),
            "commandCoverageCount": len({command for slot in slots for command in slot["validationCommands"]}),
        },
        "phases": RUNWAY_PHASES,
        "checkpoints": checkpoints,
        "slots": slots,
    }


def select_phase_packages(packages: list[dict[str, Any]], lane_id: str) -> list[dict[str, Any]]:
    if lane_id == "all":
        return packages
    return [package for package in packages if package["laneId"] == lane_id]


def build_slot(phase: dict[str, Any], package: dict[str, Any], phase_order: int, focus_hours: int) -> dict[str, Any]:
    return {
        "id": f"{phase['id']}-slot-{phase_order:02d}",
        "phaseId": phase["id"],
        "phaseLabel": phase["label"],
        "phaseOrder": phase_order,
        "weekWindow": phase["weeks"],
        "focusHours": focus_hours,
        "packageId": package["id"],
        "missionId": package["missionId"],
        "laneId": package["laneId"],
        "agentRole": package["agentRole"],
        "platformScope": package["platformScope"],
        "primaryLanguages": package["primaryLanguages"],
        "platformLanguagePolicy": package["platformLanguagePolicy"],
        "artifactRoots": package["artifactRoots"],
        "validationCommands": package["validationCommands"],
        "exitCriteria": [
            "all package acceptance gates reviewed",
            "automation refresh remains idempotent",
            "no commit or push occurs without explicit approval",
        ],
    }


def build_checkpoints(slots: list[dict[str, Any]]) -> list[dict[str, Any]]:
    checkpoints = []
    for slot in slots:
        checkpoints.append(
            {
                "id": f"checkpoint-{slot['id']}",
                "phaseId": slot["phaseId"],
                "packageId": slot["packageId"],
                "requiredChecks": [
                    "npm run check:seis-execution-packages",
                    "npm run check:seis-execution-runway",
                    "npm run automation:refresh-seis-surface -- --summary",
                ],
                "evidence": [
                    "reports/seis-execution-packages.md",
                    "reports/seis-execution-runway.md",
                    "reports/automation-refresh-seis-surface-summary.json",
                ],
            }
        )
    return checkpoints


def validate_execution_runway(runway: dict[str, Any]) -> list[str]:
    failures: list[str] = []
    summary = runway.get("summary", {})
    slots = runway.get("slots", [])
    checkpoints = runway.get("checkpoints", [])
    governance = runway.get("governance", {})

    if summary.get("phaseCount", 0) < 4:
        failures.append("execution runway must contain at least four phases")
    if summary.get("slotCount", 0) < 60:
        failures.append("execution runway must contain deep repeated execution slots")
    if summary.get("checkpointCount", 0) != summary.get("slotCount", -1):
        failures.append("execution runway must have one checkpoint per slot")
    if summary.get("minimumFocusHours", 0) < 720:
        failures.append("execution runway must reserve at least 720 focus hours")
    if summary.get("packageCoverageCount", 0) < 30:
        failures.append("execution runway must cover every active execution package")
    if summary.get("commandCoverageCount", 0) < 9:
        failures.append("execution runway must preserve validation command coverage")

    if governance.get("commitPolicy") != "commit only after explicit user approval":
        failures.append("execution runway must preserve explicit commit approval")
    if governance.get("pushPolicy") != "push only after explicit user approval":
        failures.append("execution runway must preserve explicit push approval")

    for slot in slots:
        for field in ["id", "phaseId", "focusHours", "packageId", "missionId", "validationCommands", "exitCriteria"]:
            if not slot.get(field):
                failures.append(f"execution runway slot missing {field}: {slot.get('id', '<unknown>')}")
        if slot.get("focusHours", 0) < 6:
            failures.append(f"execution runway slot needs a meaningful focus budget: {slot.get('id', '<unknown>')}")

    for checkpoint in checkpoints:
        if "npm run check:seis-execution-runway" not in checkpoint.get("requiredChecks", []):
            failures.append(f"checkpoint missing runway check: {checkpoint.get('id', '<unknown>')}")

    return failures
