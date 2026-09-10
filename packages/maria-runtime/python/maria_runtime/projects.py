from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
import re
import unicodedata
from typing import Iterable, Optional


class WorkMode(str, Enum):
    FOCUS = "focus"
    CREATIVE = "creative"
    ENGINEERING = "engineering"
    GAME_DEV = "game-dev"
    RESEARCH = "research"
    QUICK = "quick"
    AUTONOMOUS = "autonomous"


@dataclass(frozen=True)
class ProjectProfile:
    id: str
    display_name: str
    aliases: tuple[str, ...]
    work_mode: WorkMode
    domains: tuple[str, ...]
    preferred_agents: tuple[str, ...]
    preferred_capabilities: tuple[str, ...]

    def __post_init__(self) -> None:
        if not self.id or not self.display_name:
            raise ValueError("project id and display_name are required")
        if len(self.preferred_agents) > 5:
            raise ValueError("project profiles must keep the default team to five agents or fewer")
        if not self.preferred_capabilities:
            raise ValueError("project profile must declare preferred capabilities")


def _normalize(value: str) -> str:
    text = unicodedata.normalize("NFKD", value.casefold())
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = re.sub(r"[^a-z0-9α-ω]+", " ", text)
    return " ".join(text.split())


class ProjectRegistry:
    def __init__(self, profiles: Optional[Iterable[ProjectProfile]] = None) -> None:
        self._profiles: dict[str, ProjectProfile] = {}
        for profile in profiles or ():
            self.register(profile)

    def register(self, profile: ProjectProfile) -> None:
        if profile.id in self._profiles:
            raise ValueError(f"project already registered: {profile.id}")
        self._profiles[profile.id] = profile

    def all(self) -> list[ProjectProfile]:
        return sorted(self._profiles.values(), key=lambda profile: profile.id)

    def get(self, project_id: str) -> Optional[ProjectProfile]:
        return self._profiles.get(project_id)

    def match(self, text: str) -> ProjectProfile:
        if not isinstance(text, str) or not text.strip():
            raise ValueError("project match text must be non-empty")
        normalized = f" {_normalize(text)} "
        candidates: list[tuple[int, ProjectProfile]] = []
        for profile in self._profiles.values():
            names = (profile.display_name, profile.id, *profile.aliases)
            for name in names:
                needle = _normalize(name)
                if needle and f" {needle} " in normalized:
                    candidates.append((len(needle), profile))
                    break
        if not candidates:
            raise LookupError("no project profile matched the request")
        candidates.sort(key=lambda item: (-item[0], item[1].id))
        return candidates[0][1]


def default_project_registry() -> ProjectRegistry:
    """Canonical personal project map for MARIA's first SEIS-native runtime.

    Profiles intentionally describe preferences, not hard-coded authority. Actual
    tool/model access is still decided by capability and permission engines.
    """

    return ProjectRegistry([
        ProjectProfile(
            id="seis",
            display_name="SEIS",
            aliases=("seis core", "maria seis"),
            work_mode=WorkMode.ENGINEERING,
            domains=("ai", "desktop", "agents", "mcp", "apple-platform"),
            preferred_agents=("principal-architect", "ai-engineer", "swift-engineer", "security-engineer", "verifier"),
            preferred_capabilities=("repository", "coding", "testing", "architecture", "macos"),
        ),
        ProjectProfile(
            id="eleni-neferi",
            display_name="Eleni-Neferi",
            aliases=("eleni neferi", "eleni"),
            work_mode=WorkMode.CREATIVE,
            domains=("creative-direction", "branding", "ui-ux", "editorial"),
            preferred_agents=("creative-director", "graphic-designer", "ui-ux-designer", "brand-designer", "creative-critic"),
            preferred_capabilities=("design", "branding", "ui-ux", "accessibility"),
        ),
        ProjectProfile(
            id="pantechnoepistemonoesis",
            display_name="Pantechnoepistemonoesis",
            aliases=("pantechno", "pantechnoepistemonoesis"),
            work_mode=WorkMode.RESEARCH,
            domains=("research", "evidence", "evaluation", "knowledge"),
            preferred_agents=("research-agent", "principal-architect", "documentation-agent", "critic", "verifier"),
            preferred_capabilities=("research", "evidence", "knowledge-graph", "evaluation"),
        ),
        ProjectProfile(
            id="pantechnosyni",
            display_name="PANTECHNOSYNI",
            aliases=("παντεχνοσυνη", "synthesis atlas"),
            work_mode=WorkMode.RESEARCH,
            domains=("interdisciplinary-synthesis", "public-knowledge", "web"),
            preferred_agents=("research-agent", "creative-director", "web-engineer", "ui-ux-designer", "verifier"),
            preferred_capabilities=("synthesis", "research", "web", "accessibility"),
        ),
        ProjectProfile(
            id="deadly-evil",
            display_name="Deadly Evil",
            aliases=("deadly evil", "deadlyevil", "oyun"),
            work_mode=WorkMode.GAME_DEV,
            domains=("unreal", "gameplay", "3d", "enemy-ai", "qa"),
            preferred_agents=("game-director", "unreal-engineer", "gameplay-engineer", "technical-artist", "verifier"),
            preferred_capabilities=("unreal", "blender", "gameplay", "testing", "asset-validation"),
        ),
        ProjectProfile(
            id="portfolio",
            display_name="Portfolio",
            aliases=("clean portfolio", "website", "web sitesi"),
            work_mode=WorkMode.CREATIVE,
            domains=("web", "branding", "seo", "accessibility"),
            preferred_agents=("creative-director", "web-engineer", "ui-ux-designer", "graphic-designer", "verifier"),
            preferred_capabilities=("web", "design", "seo", "accessibility"),
        ),
    ])
