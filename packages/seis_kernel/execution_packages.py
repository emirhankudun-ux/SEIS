"""Execution package generator for active SEIS mission cards."""

from __future__ import annotations

from typing import Any

from .active_board import build_active_mission_board, validate_active_mission_board


LANE_COMMANDS = {
    "now": [
        "npm run check:seis-nonjs-kernel",
        "npm run check:workspace",
        "npm run automation:refresh-seis-surface -- --summary",
    ],
    "next": [
        "xcode-select -p",
        "xcodebuild -version",
        "xcrun swift --version",
        "osacompile -o /tmp/seis-platform-automation.scpt polyglot/applescript/seis_platform_automation.applescript",
    ],
    "queued": [
        "dotnet --info",
        "pwsh --version",
        "python3 --version",
    ],
}

LANE_ARTIFACT_ROOTS = {
    "now": [
        "packages/seis_kernel/",
        "content/development/",
        "reports/",
    ],
    "next": [
        "packages/seis_platform_swift/",
        "polyglot/swiftui-playground/",
        "polyglot/objective-c/",
        "polyglot/applescript/",
    ],
    "queued": [
        "packages/seis_windows_csharp/",
        "polyglot/windows/",
        "reports/",
    ],
}


def build_execution_packages(board: dict[str, Any] | None = None) -> dict[str, Any]:
    source_board = board or build_active_mission_board()
    board_failures = validate_active_mission_board(source_board)
    if board_failures:
        return {
            "version": 1,
            "id": "seis-execution-packages",
            "mode": "invalid_active_board",
            "sourceFailures": board_failures,
            "summary": {},
            "packages": [],
        }

    packages = [
        build_package(card, index + 1)
        for index, card in enumerate(source_board["cards"])
    ]

    command_coverage = sorted({command for package in packages for command in package["validationCommands"]})
    artifact_roots = sorted({root for package in packages for root in package["artifactRoots"]})
    remote_ready_count = sum(1 for package in packages if package["delegationPolicy"]["remoteProviders"] == "allowed_for_reasoning_only")
    offline_ready_count = sum(1 for package in packages if package["delegationPolicy"]["offlineFallback"] == "ollama_or_local_static_analysis")

    return {
        "version": 1,
        "id": "seis-execution-packages",
        "mode": "daily_reversible_task_packets",
        "sourceBoard": source_board["id"],
        "summary": {
            "packageCount": len(packages),
            "nowPackageCount": sum(1 for package in packages if package["laneId"] == "now"),
            "nextPackageCount": sum(1 for package in packages if package["laneId"] == "next"),
            "queuedPackageCount": sum(1 for package in packages if package["laneId"] == "queued"),
            "validationCommandCount": len(command_coverage),
            "artifactRootCount": len(artifact_roots),
            "remoteReadyCount": remote_ready_count,
            "offlineReadyCount": offline_ready_count,
        },
        "governance": {
            "defaultCadence": "one package per focused work slice",
            "commitPolicy": "commit only after explicit user approval",
            "pushPolicy": "push only after explicit user approval",
            "runtimeInstallPolicy": source_board["installPolicy"]["default"],
        },
        "commandCoverage": command_coverage,
        "artifactRoots": artifact_roots,
        "packages": packages,
    }


def build_package(card: dict[str, Any], packet_number: int) -> dict[str, Any]:
    commands = LANE_COMMANDS[card["laneId"]]
    artifact_roots = LANE_ARTIFACT_ROOTS[card["laneId"]]
    return {
        "id": f"packet-{packet_number:02d}-{card['missionId']}",
        "packetNumber": packet_number,
        "laneId": card["laneId"],
        "missionId": card["missionId"],
        "domainId": card["domainId"],
        "agentRole": card["agentRole"],
        "executionMode": card["executionMode"],
        "platformScope": card["platformScope"],
        "primaryLanguages": card["primaryLanguages"],
        "platformLanguagePolicy": card["platformLanguagePolicy"],
        "objective": f"Deliver {card['title']} for {card['domainId']} as a small reversible SEIS increment.",
        "workItems": [
            f"Create or update {output} for {card['missionId']}"
            for output in card["requiredOutputs"]
        ],
        "artifactRoots": artifact_roots,
        "validationCommands": commands,
        "acceptanceGates": sorted(set(card["qualityGates"]).union({
            "git-diff-reviewable",
            "no-destructive-operation",
            "explicit-push-approval",
        })),
        "delegationPolicy": {
            "seisRole": "primary_user_facing_agent",
            "remoteProviders": "allowed_for_reasoning_only",
            "offlineFallback": "ollama_or_local_static_analysis",
            "secretHandling": "never_write_credentials_to_reports",
        },
        "runtimeInstallPolicy": card["runtimeInstallPolicy"],
    }


def validate_execution_packages(bundle: dict[str, Any]) -> list[str]:
    failures: list[str] = []
    summary = bundle.get("summary", {})
    packages = bundle.get("packages", [])

    if summary.get("packageCount", 0) < 30:
        failures.append("execution packages must include at least 30 packets")
    if summary.get("nowPackageCount", 0) < 10:
        failures.append("execution packages must include 10 now packets")
    if summary.get("nextPackageCount", 0) < 10:
        failures.append("execution packages must include 10 next packets")
    if summary.get("queuedPackageCount", 0) < 10:
        failures.append("execution packages must include 10 queued packets")
    if summary.get("validationCommandCount", 0) < 8:
        failures.append("execution packages must include broad validation command coverage")
    if summary.get("remoteReadyCount", 0) != summary.get("packageCount", -1):
        failures.append("every execution package must define remote reasoning delegation")
    if summary.get("offlineReadyCount", 0) != summary.get("packageCount", -1):
        failures.append("every execution package must define offline fallback")

    governance = bundle.get("governance", {})
    if governance.get("runtimeInstallPolicy") != "do_not_install_new_runtime_for_language_percentage":
        failures.append("execution package governance must keep runtime installs requirement-led")
    if governance.get("commitPolicy") != "commit only after explicit user approval":
        failures.append("execution package governance must preserve explicit commit approval")
    if governance.get("pushPolicy") != "push only after explicit user approval":
        failures.append("execution package governance must preserve explicit push approval")

    for package in packages:
        for field in ["id", "laneId", "missionId", "objective", "workItems", "artifactRoots", "validationCommands", "acceptanceGates", "delegationPolicy", "platformLanguagePolicy"]:
            if not package.get(field):
                failures.append(f"execution package missing {field}: {package.get('id', '<unknown>')}")
        if "explicit-push-approval" not in package.get("acceptanceGates", []):
            failures.append(f"execution package must preserve push approval gate: {package.get('id', '<unknown>')}")
        if package.get("runtimeInstallPolicy") != "do_not_install_new_runtime_for_language_percentage":
            failures.append(f"execution package has unsafe runtime policy: {package.get('id', '<unknown>')}")

    return failures
