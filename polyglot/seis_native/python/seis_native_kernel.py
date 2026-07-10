from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Iterable


class NativeLane(str, Enum):
    APPLE_FIRST = "Apple First"
    DATA_AI = "Data AI"
    SYSTEMS = "Systems"
    ANDROID = "Android"
    WINDOWS = "Windows"
    INFRASTRUCTURE = "Infrastructure"


@dataclass(frozen=True)
class NativeRoadmapItem:
    lane: NativeLane
    score: int
    evidence: tuple[str, ...]
    next_step: str


ROADMAP: tuple[NativeRoadmapItem, ...] = (
    NativeRoadmapItem(NativeLane.APPLE_FIRST, 100, ("Swift", "SwiftUI", "AppKit"), "Build Apple native surfaces first."),
    NativeRoadmapItem(NativeLane.DATA_AI, 88, ("Python", "evaluation", "memory"), "Keep intelligence workflows measurable."),
    NativeRoadmapItem(NativeLane.SYSTEMS, 84, ("Rust", "typed contracts"), "Move shared logic into safe modules."),
    NativeRoadmapItem(NativeLane.ANDROID, 76, ("Kotlin", "Java"), "Mirror product intent on Android."),
    NativeRoadmapItem(NativeLane.WINDOWS, 72, ("CSharp", "DotNet"), "Define Windows product contracts."),
    NativeRoadmapItem(NativeLane.INFRASTRUCTURE, 70, ("Go", "SQL", "Shell"), "Keep operations auditable and reversible."),
)


def ordered_lanes(items: Iterable[NativeRoadmapItem] = ROADMAP) -> list[NativeRoadmapItem]:
    return sorted(items, key=lambda item: item.score, reverse=True)


def summary() -> str:
    lines = ["SEIS Native Polyglot Roadmap"]
    for item in ordered_lanes():
        lines.append(f"- {item.lane.value}: {item.score} :: {item.next_step}")
    return "\n".join(lines)


if __name__ == "__main__":
    print(summary())
