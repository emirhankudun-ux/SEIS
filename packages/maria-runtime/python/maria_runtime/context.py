from __future__ import annotations

from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from typing import Any, Iterable, Optional


@dataclass(frozen=True)
class ContextFact:
    key: str
    value: Any
    source: str
    project: str
    confidence: float
    verified: bool
    observed_at: str
    fact_type: str = "temporary-state"

    def __post_init__(self) -> None:
        if not self.key.strip():
            raise ValueError("context key must be non-empty")
        if not self.source.strip():
            raise ValueError("context source must be non-empty")
        if not self.project.strip():
            raise ValueError("context project must be non-empty")
        if not 0.0 <= self.confidence <= 1.0:
            raise ValueError("confidence must be between 0 and 1")
        _parse_time(self.observed_at)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def _parse_time(value: str) -> datetime:
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise ValueError(f"invalid observed_at: {value}") from exc
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


class ProjectContextEngine:
    """Stores small provenance-aware facts instead of a giant transcript.

    Resolution policy is intentionally conservative:
    verified evidence > unverified evidence, then recency, then confidence.
    That prevents old memory from silently overriding current Git/editor state.
    """

    def __init__(self, facts: Optional[Iterable[ContextFact]] = None) -> None:
        self._facts: list[ContextFact] = []
        for fact in facts or ():
            self.put(fact)

    def put(self, fact: ContextFact) -> ContextFact:
        if not isinstance(fact, ContextFact):
            raise TypeError("fact must be ContextFact")
        self._facts.append(fact)
        return fact

    def get(self, key: str, *, project: str) -> Optional[ContextFact]:
        candidates = [
            fact for fact in self._facts
            if fact.key == key and fact.project == project
        ]
        if not candidates:
            return None
        return max(
            candidates,
            key=lambda fact: (
                int(fact.verified),
                _parse_time(fact.observed_at),
                fact.confidence,
            ),
        )

    def snapshot(self, *, project: str) -> dict[str, Any]:
        keys = sorted({fact.key for fact in self._facts if fact.project == project})
        resolved = {key: self.get(key, project=project) for key in keys}
        return {
            "project": project,
            "facts": {
                key: fact.to_dict()
                for key, fact in resolved.items()
                if fact is not None
            },
        }

    def history(self, *, project: Optional[str] = None) -> list[ContextFact]:
        values = self._facts if project is None else [
            fact for fact in self._facts if fact.project == project
        ]
        return list(values)
