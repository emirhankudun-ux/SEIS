#!/usr/bin/env python3

import json
import sys
from pathlib import Path


ROOT = Path.cwd()
sys.path.insert(0, str(ROOT))

from packages.seis_kernel.agi_system import (  # noqa: E402
    build_seis_agi_system,
    validate_seis_agi_system,
)


SOURCE_PATH = ROOT / "content" / "development" / "seis-agi-system.json"
REPORT_JSON_PATH = ROOT / "reports" / "seis-agi-system.json"
REPORT_MD_PATH = ROOT / "reports" / "seis-agi-system.md"
DOC_PATH = ROOT / "docs" / "agi" / "seis-agi-system.md"
CHECK_MODE = "--check" in sys.argv


def main() -> int:
    if "--help" in sys.argv or "-h" in sys.argv:
        print_help()
        return 0

    unknown = [arg for arg in sys.argv[1:] if arg not in {"--check", "--help", "-h"}]
    if unknown:
        print(f"Unsupported option: {', '.join(unknown)}", file=sys.stderr)
        print_help()
        return 1

    contract = build_seis_agi_system()
    failures = validate_seis_agi_system(contract)
    if failures:
        print("SEIS AGI system contract is invalid:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        return 1

    report = build_report(contract)
    markdown = build_markdown(contract)
    doc = build_doc(contract)

    if CHECK_MODE:
        return check_outputs(contract, report, markdown, doc)

    write_text(SOURCE_PATH, stable_json(contract))
    write_text(REPORT_JSON_PATH, stable_json(report))
    write_text(REPORT_MD_PATH, f"{markdown}\n")
    write_text(DOC_PATH, f"{doc}\n")
    print("SEIS AGI system written:")
    print(f"- {relative(SOURCE_PATH)}")
    print(f"- {relative(REPORT_JSON_PATH)}")
    print(f"- {relative(REPORT_MD_PATH)}")
    print(f"- {relative(DOC_PATH)}")
    return 0


def print_help() -> None:
    print(
        """SEIS AGI system contract

Commands:
  python3 scripts/create-seis-agi-system.py
  python3 scripts/create-seis-agi-system.py --check

This command generates the human-owned AGI-inspired SEIS agent, memory,
planning, research, MCP, plugin, skill, and token-efficiency contract.
"""
    )


def build_report(contract: dict) -> dict:
    return {
        "version": 1,
        "id": "seis-agi-system-report",
        "generatedAt": contract["generatedAt"],
        "sourceId": contract["id"],
        "sourcePath": relative(SOURCE_PATH),
        "summary": {
            "subsystemCount": len(contract["subsystems"]),
            "domainCount": len(contract["domainTaxonomy"]),
            "pluginLaneCount": len(contract["pluginCapabilityLanes"]),
            "memoryCheckpointCount": len(contract["memoryPlanning"]["checkpoints"]),
            "memoryLoopCount": len(contract["memoryPlanning"]["loops"]),
            "usedVisualSourceCount": sum(1 for item in contract["imageReferenceSignals"] if item["used"]),
            "priorityDomainCount": len(contract["priorityDomains"]),
            "javascriptTargetPercent": contract["platformStrategy"]["javascriptTargetPercent"],
            "tokenSavingsTargetPercent": contract["tokenEfficiency"]["targetSavingsPercent"],
            "targetReleaseDate": contract["releaseWindow"]["targetReleaseDate"],
            "claimBoundary": contract["masterGoal"]["claimBoundary"],
        },
        "subsystems": [
            {
                "id": item["id"],
                "label": item["label"],
                "implementationRoots": item["implementationRoots"],
                "qualityGateCount": len(item["qualityGates"]),
            }
            for item in contract["subsystems"]
        ],
        "memoryPlanning": contract["memoryPlanning"],
        "releaseWindow": contract["releaseWindow"],
        "pluginCapabilityLanes": contract["pluginCapabilityLanes"],
        "imageReferenceSignals": contract["imageReferenceSignals"],
        "priorityDomains": contract["priorityDomains"],
        "domainLanes": contract["domainLanes"],
        "implementation": contract["implementation"],
    }


def build_markdown(contract: dict) -> str:
    report = build_report(contract)
    lines = [
        "# SEIS AGI System",
        "",
        f"- Generated: {contract['generatedAt']}",
        f"- Mode: {contract['mode']}",
        f"- Target release: {contract['releaseWindow']['targetReleaseDate']}",
        f"- JavaScript target: {contract['platformStrategy']['javascriptTargetPercent']}%",
        f"- Token savings target: {contract['tokenEfficiency']['targetSavingsPercent']}%",
        f"- Roadmap domains: {len(contract['domainTaxonomy'])}",
        f"- Practical priority domains: {len(contract['priorityDomains'])}",
        "",
        "## Claim Boundary",
        "",
        contract["masterGoal"]["claimBoundary"],
        "",
        "## North Star",
        "",
        contract["masterGoal"]["northStar"],
        "",
        "## Platform Strategy",
        "",
        "| lane | policy |",
        "| --- | --- |",
        f"| Apple first | {', '.join(contract['platformStrategy']['appleLanguages'])} |",
        f"| Web | {', '.join(contract['platformStrategy']['webLanguages'])} |",
        f"| AI and data | {', '.join(contract['platformStrategy']['aiDataLanguages'])} |",
        f"| Android | {', '.join(contract['platformStrategy']['androidLanguages'])} |",
        f"| Windows | {', '.join(contract['platformStrategy']['windowsLanguages'])} |",
        f"| Systems and infrastructure | {', '.join(contract['platformStrategy']['systemsInfrastructureLanguages'])} |",
        f"| Install policy | {contract['platformStrategy']['installPolicy']} |",
        f"| HTML CSS policy | {contract['platformStrategy']['htmlCssPolicy']} |",
        "",
        "## Subsystems",
        "",
        "| subsystem | intent | implementation roots | gates |",
        "| --- | --- | --- | --- |",
        *[
            f"| {cell(item['label'])} | {cell(item['intent'])} | {cell(', '.join(item['implementationRoots']))} | {cell(', '.join(item['qualityGates']))} |"
            for item in contract["subsystems"]
        ],
        "",
        "## Plugin MCP Skill Lanes",
        "",
        "| lane | examples | activation gate |",
        "| --- | --- | --- |",
        *[
            f"| {cell(item['label'])} | {cell(', '.join(item['examples']))} | {cell(item['activationGate'])} |"
            for item in contract["pluginCapabilityLanes"]
        ],
        "",
        "## Memory Planning Automation",
        "",
        f"- Runtime: {contract['memoryPlanning']['ownerRuntime']}",
        f"- Storage policy: {contract['memoryPlanning']['storagePolicy']}",
        "",
        "| checkpoint | phase | storage surface | evidence | gates |",
        "| --- | --- | --- | --- | --- |",
        *[
            f"| {cell(item['label'])} | {cell(item['phase'])} | {cell(item['appleStorageSurface'])} | `{cell(item['evidencePath'])}` | {cell(', '.join(item['qualityGates']))} |"
            for item in contract["memoryPlanning"]["checkpoints"]
        ],
        "",
        "| loop | trigger | output | gates |",
        "| --- | --- | --- | --- |",
        *[
            f"| {cell(item['label'])} | {cell(item['trigger'])} | `{cell(item['outputArtifact'])}` | {cell(', '.join(item['evaluationGates']))} |"
            for item in contract["memoryPlanning"]["loops"]
        ],
        "",
        "## Visual Sources Used",
        "",
        "| source | repository path | used | signals |",
        "| --- | --- | --- | --- |",
        *[
            f"| {cell(item['basename'])} | `{cell(item['repositoryPath'])}` | {'yes' if item['used'] else 'no'} | {cell(', '.join(item['signals']))} |"
            for item in contract["imageReferenceSignals"]
        ],
        "",
        "## 90 Day Roadmap",
        "",
        "| window | theme | focus | acceptance gates | evidence |",
        "| --- | --- | --- | --- | --- |",
        *[
            f"| {cell(item['dayRange'])} | {cell(item['theme'])} | {cell(', '.join(item['focusAreas']))} | {cell(', '.join(item['acceptanceGates']))} | {cell(', '.join(item['evidencePaths']))} |"
            for item in contract["releaseWindow"]["milestones"]
        ],
        "",
        "## Practical Priority Domains",
        "",
        "The full 150-domain taxonomy is stored in `content/development/seis-agi-system.json` as long-term roadmap material. This compact report keeps the implementation priorities visible first.",
        "",
        "| # | domain | lane |",
        "| ---: | --- | --- |",
        *[
            f"| {item['id']} | {cell(item['label'])} | {cell(item['lane'])} |"
            for item in contract["priorityDomains"]
        ],
        "",
        "## Domain Lanes",
        "",
        "| lane | domains |",
        "| --- | ---: |",
        *[
            f"| {cell(item['lane'])} | {item['domainCount']} |"
            for item in report["domainLanes"]
        ],
        "",
        "## Quality Gates",
        "",
        *[f"- {gate}" for gate in contract["qualityGates"]],
    ]
    return "\n".join(lines)


def build_doc(contract: dict) -> str:
    lines = [
        "# SEIS AGI System Implementation",
        "",
        "This document is generated from `packages/seis_kernel/agi_system.py`.",
        "",
        "SEIS uses the phrase AGI system as a human-owned, AGI-inspired operating architecture for advanced assistants. It is not a claim that the repository contains autonomous general intelligence.",
        "",
        "## Implementation Roots",
        "",
        *[f"- `{path}`" for path in contract["implementation"].values()],
        "",
        "## Apple First Implementation Surface",
        "",
        "`SeisAGISystemContract` in Swift keeps the Apple-native contract close to Swift, SwiftUI, Objective-C, Metal, AppKit, UIKit, Combine, Core Data, and CloudKit priorities.",
        "",
        "## Token Efficiency",
        "",
        f"The system target is {contract['tokenEfficiency']['targetSavingsPercent']}% token savings through retrieval, bounded reports, source manifests, and minimum required tool activation.",
        "",
        "## Memory Planning Automation",
        "",
        f"`{contract['memoryPlanning']['id']}` runs on {contract['memoryPlanning']['ownerRuntime']} and defines context intake, task decomposition, research evidence, multi-agent handoff, and self-evaluation checkpoints.",
        "",
        "## Three Month Release Cycle",
        "",
        f"The active release window runs from {contract['releaseWindow']['startDate']} to {contract['releaseWindow']['targetReleaseDate']} with three monthly acceptance-gated milestones.",
        "",
        *[
            f"- {item['dayRange']}: {item['theme']} -> {', '.join(item['acceptanceGates'])}"
            for item in contract["releaseWindow"]["milestones"]
        ],
        "",
        "## Plugin Use Policy",
        "",
        "Plugins, MCP servers, and skills are used only when relevant, authenticated, scoped, and safe. Reports must list only actual usage.",
        "",
        "## Visual Source Policy",
        "",
        "The eight submitted programming visuals are copied under `content/development/seis-agi-reference-assets/` and recorded with basenames, repository paths, dimensions, signals, and hashes.",
    ]
    return "\n".join(lines)


def check_outputs(contract: dict, report: dict, markdown: str, doc: str) -> int:
    expected = {
        SOURCE_PATH: stable_json(contract),
        REPORT_JSON_PATH: stable_json(report),
        REPORT_MD_PATH: f"{markdown}\n",
        DOC_PATH: f"{doc}\n",
    }
    stale = []
    for path, text in expected.items():
        if read_text(path) != text:
            stale.append(relative(path))
    if stale:
        print("SEIS AGI system outputs are stale:", file=sys.stderr)
        for path in stale:
            print(f"- {path}", file=sys.stderr)
        print("Run: npm run automation:seis-agi-system", file=sys.stderr)
        return 1
    print("SEIS AGI system check passed.")
    return 0


def stable_json(data: dict) -> str:
    return json.dumps(data, ensure_ascii=True, indent=2) + "\n"


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def read_text(path: Path) -> str:
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8")


def relative(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def cell(value: object) -> str:
    return str(value).replace("|", "\\|").replace("\n", "<br>")


if __name__ == "__main__":
    raise SystemExit(main())
