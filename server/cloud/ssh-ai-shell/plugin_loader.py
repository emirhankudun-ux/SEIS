"""Dynamic plugin loader for tools."""

from __future__ import annotations

import importlib.util
from pathlib import Path

from config import PLUGINS_DIR

_REGISTRY: dict[str, dict] = {}
_LOADED = False


def _load_plugin_file(path: Path) -> None:
    spec = importlib.util.spec_from_file_location(f"plugins.{path.stem}", path)
    if not spec or not spec.loader:
        return

    module = importlib.util.module_from_spec(spec)
    try:
        spec.loader.exec_module(module)
    except Exception as exc:  # pragma: no cover
        print(f"[PLUGIN] Yüklenemedi {path.name}: {exc}")
        return

    name = getattr(module, "PLUGIN_NAME", path.stem)
    definitions = getattr(module, "TOOL_DEFINITIONS", [])
    execute = getattr(module, "execute", None)

    if not definitions or not callable(execute):
        print(f"[PLUGIN] {path.name}: PLUGIN_NAME/TOOL_DEFINITIONS/execute eksik")
        return

    _REGISTRY[name] = {
        "module": module,
        "definitions": definitions,
        "execute": execute,
    }
    print(f"[PLUGIN] Yüklendi: {name} ({len(definitions)} araç)")


def load_all(force: bool = False) -> dict[str, dict]:
    """Load all python files under plugins directory."""
    global _LOADED
    if _LOADED and not force:
        return _REGISTRY

    _REGISTRY.clear()
    if not PLUGINS_DIR.exists():
        PLUGINS_DIR.mkdir(parents=True, exist_ok=True)
        (PLUGINS_DIR / "__init__.py").write_text("")

    for py_file in sorted(PLUGINS_DIR.glob("*.py")):
        if py_file.name.startswith("_") or py_file.name == "__init__.py":
            continue
        _load_plugin_file(py_file)

    _LOADED = True
    return _REGISTRY


def all_definitions() -> list[dict]:
    definitions: list[dict] = []
    for plugin in load_all().values():
        definitions.extend(plugin["definitions"])
    return definitions


def dispatch(name: str, arguments: dict) -> str:
    for plugin in load_all().values():
        for definition in plugin["definitions"]:
            if definition.get("function", {}).get("name") == name:
                try:
                    return plugin["execute"](name, arguments)
                except Exception as exc:  # pragma: no cover
                    return f"[PLUGIN HATA] {exc}"
    return f"[PLUGIN] Araç bulunamadı: {name}"


def list_tools() -> list[str]:
    return [d["function"]["name"] for d in all_definitions()]
