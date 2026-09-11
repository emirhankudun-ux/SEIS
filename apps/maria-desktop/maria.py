#!/usr/bin/env python3
"""MARIA × SEIS v18 foundation launcher.

A deliberately thin, read-only launcher for the modular runtime contracts.
Live adapters (models, microphone, Unreal, Blender, Git writes) are not enabled
by this foundation.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import platform
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime import (
    ActionClass,
    CapabilityRegistry,
    ContextFact,
    ModelRegistry,
    ModelRouter,
    ModelSpec,
    PermissionEngine,
    ProjectContextEngine,
    ToolSpec,
    ToolStatus,
)

from maria_runtime.command_preview import (
    MAX_COMMAND_BYTES,
    CommandPreviewError,
    preview_legacy_command,
)

VERSION = "18.0-foundation"


def build_demo_tools() -> CapabilityRegistry:
    return CapabilityRegistry([
        ToolSpec(
            name="git-cli-readonly",
            capabilities=("git.inspect",),
            method_rank=3,
            reliability=0.95,
            latency_ms=40,
            cost=0.0,
            status=ToolStatus.AVAILABLE,
            permissions=("read",),
        ),
        ToolSpec(
            name="unreal-mcp-contract",
            capabilities=("unreal.inspect_actors",),
            method_rank=2,
            reliability=0.90,
            latency_ms=150,
            cost=0.0,
            status=ToolStatus.DISABLED,
            permissions=("read",),
            supported_projects=("Deadly Evil",),
        ),
    ])


def build_demo_models() -> ModelRegistry:
    return ModelRegistry([
        ModelSpec(
            name="local-general",
            provider="local",
            local=True,
            capabilities=("reasoning", "coding"),
            context_size=32768,
            reliability=0.80,
            latency_ms=500,
            input_cost_per_million=0.0,
            output_cost_per_million=0.0,
            available=False,
            privacy_level="local",
        )
    ])


def status() -> dict:
    tools = build_demo_tools()
    models = build_demo_models()
    return {
        "product": "MARIA × SEIS",
        "version": VERSION,
        "mode": "foundation-read-only",
        "python": platform.python_version(),
        "platform": platform.platform(),
        "tool_registry": [
            {
                "name": tool.name,
                "status": tool.status.value,
                "capabilities": list(tool.capabilities),
            }
            for tool in tools.all()
        ],
        "available_models": [model.name for model in models.available()],
        "authority": {
            "network_calls": False,
            "external_writes": False,
            "tool_execution": False,
            "human_approval_required_for_modify": True,
        },
    }


def demo_context(project: str) -> dict:
    engine = ProjectContextEngine()
    engine.put(ContextFact(
        key="active_project",
        value=project,
        source="launcher-argument",
        project=project,
        confidence=1.0,
        verified=True,
        observed_at="2026-09-11T00:00:00+00:00",
        fact_type="temporary-state",
    ))
    return engine.snapshot(project=project)


def command_preview_from_stdin(*, show_argument: bool) -> int:
    """Read a bounded UTF-8 record; never send it to an execution adapter."""
    try:
        payload = sys.stdin.buffer.read(MAX_COMMAND_BYTES + 1)
        if len(payload) > MAX_COMMAND_BYTES:
            raise CommandPreviewError("command-too-large")
        preview = preview_legacy_command(payload.decode("utf-8"))
    except (CommandPreviewError, UnicodeDecodeError, OSError) as exc:
        if isinstance(exc, CommandPreviewError):
            code = str(exc)
        elif isinstance(exc, UnicodeDecodeError):
            code = "invalid-command-encoding"
        else:
            code = "command-input-unavailable"
        print(json.dumps({
            "mode": "preview-only",
            "error": code,
            "execution_authorized": False,
        }), file=sys.stderr)
        return 2
    print(json.dumps(preview.to_dict(include_argument=show_argument), indent=2))
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="MARIA × SEIS v18 foundation")
    parser.add_argument("--status", action="store_true", help="show runtime foundation status")
    parser.add_argument("--doctor", action="store_true", help="run read-only foundation checks")
    parser.add_argument("--context", metavar="PROJECT", help="show a sample provenance-aware project context")
    parser.add_argument("--permission", choices=[item.value for item in ActionClass], help="inspect permission policy")
    parser.add_argument("--preview-command", action="store_true", help="preview one UTF-8 command from stdin without executing it")
    parser.add_argument("--show-argument", action="store_true", help="explicitly include private argument text in command preview output")
    args = parser.parse_args()

    if args.show_argument and not args.preview_command:
        parser.error("--show-argument requires --preview-command")
    if args.preview_command:
        if args.status or args.doctor or args.context is not None or args.permission is not None:
            parser.error("--preview-command cannot be combined with other actions")
        return command_preview_from_stdin(show_argument=args.show_argument)

    if args.context:
        print(json.dumps(demo_context(args.context), indent=2, ensure_ascii=False))
        return 0

    if args.permission:
        decision = PermissionEngine().evaluate(ActionClass(args.permission), target="demo-target")
        print(json.dumps({
            "action_class": decision.action_class.value,
            "allowed": decision.allowed,
            "requires_approval": decision.requires_approval,
            "reason": decision.reason,
        }, indent=2, ensure_ascii=False))
        return 0

    data = status()
    if args.doctor:
        checks = {
            "runtime_import": True,
            "standard_library_only": True,
            "tool_execution_disabled": not data["authority"]["tool_execution"],
            "network_disabled": not data["authority"]["network_calls"],
            "external_writes_disabled": not data["authority"]["external_writes"],
        }
        print(json.dumps({"status": data, "checks": checks, "ok": all(checks.values())}, indent=2, ensure_ascii=False))
        return 0 if all(checks.values()) else 1

    print(json.dumps(data, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
