from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class WindowsCapability:
    id: str
    languages: tuple[str, ...]
    quality_gates: tuple[str, ...]
    offline_helper: bool
    remote_bridge: bool

    @property
    def ready_for_seis_agent(self) -> bool:
        return (
            len(self.languages) >= 4
            and len(self.quality_gates) >= 5
            and self.offline_helper
            and self.remote_bridge
        )


def capability_surface() -> WindowsCapability:
    return WindowsCapability(
        id="windows-python-scripting",
        languages=("Python", "PowerShell", "Batch", "SQL", "Ruby", "Lua", "PHP"),
        quality_gates=(
            "python_compile",
            "windows_path_safety",
            "permission_scope",
            "offline_fallback",
            "event_log_awareness",
        ),
        offline_helper=True,
        remote_bridge=True,
    )
