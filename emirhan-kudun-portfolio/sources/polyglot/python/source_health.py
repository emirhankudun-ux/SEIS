from dataclasses import dataclass


@dataclass(frozen=True)
class SourceHealth:
    source_id: str
    plugin_ref: str
    visible_in_portfolio: bool
    requires_credentials: bool

    def readiness_score(self) -> int:
        score = 40 if self.visible_in_portfolio else 0
        score += 35 if self.plugin_ref.startswith("plugin://") else 0
        score += 25 if not self.requires_credentials else 10
        return min(score, 100)


def describe_source_health(source: SourceHealth) -> str:
    return f"{source.source_id}:{source.readiness_score()}"
