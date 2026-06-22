#!/usr/bin/env bash
set -euo pipefail

CODEX_BIN="${CODEX_BIN:-/Applications/Codex.app/Contents/Resources/codex}"
WORKDIR="${WORKDIR:-/tmp/seis-installed-plugin-audit}"
OUTPUT_JSON="${OUTPUT_JSON:-${WORKDIR}/installed-codex-plugins.json}"

mkdir -p "$WORKDIR"

if [[ ! -x "$CODEX_BIN" ]]; then
  echo "Codex CLI not found: ${CODEX_BIN}" >&2
  exit 1
fi

PLUGIN_LIST_TXT="${WORKDIR}/codex-plugin-list.txt"
"$CODEX_BIN" plugin list > "$PLUGIN_LIST_TXT"

python3 - "$OUTPUT_JSON" "$PLUGIN_LIST_TXT" <<'PY'
from __future__ import annotations

import json
import re
import sys

output_json = sys.argv[1]
plugin_list_txt = sys.argv[2]
with open(plugin_list_txt, "r", encoding="utf-8") as fh:
    text = fh.read().splitlines()
marketplace = None
plugins = []

for line in text:
    marketplace_match = re.match(r"Marketplace `([^`]+)`", line)
    if marketplace_match:
        marketplace = marketplace_match.group(1)
        continue

    if not marketplace or line.startswith("PLUGIN") or not line.strip():
        continue

    parts = re.split(r"\s{2,}", line.strip())
    if len(parts) < 2:
        continue

    plugin_id = parts[0]
    status = parts[1]
    version = parts[2] if len(parts) >= 4 else None
    path = parts[-1] if len(parts) >= 3 else None

    if "@" not in plugin_id:
        continue

    name, marketplace_from_id = plugin_id.rsplit("@", 1)
    plugins.append(
        {
            "id": plugin_id,
            "name": name,
            "marketplace": marketplace_from_id,
            "marketplace_section": marketplace,
            "status": status,
            "installed": status.startswith("installed"),
            "enabled": "enabled" in status,
            "version": version,
            "path": path,
        }
    )

installed = [plugin for plugin in plugins if plugin["installed"] and plugin["enabled"]]
not_installed = [plugin for plugin in plugins if not plugin["installed"]]

summary = {
    "source": "codex plugin list",
    "installed_enabled_count": len(installed),
    "not_installed_count": len(not_installed),
    "installed_enabled": installed,
    "not_installed": not_installed,
}

with open(output_json, "w", encoding="utf-8") as fh:
    json.dump(summary, fh, indent=2)
    fh.write("\n")

print("SEIS Installed Plugin Audit")
print(f"installed_enabled_count: {summary['installed_enabled_count']}")
print(f"not_installed_count: {summary['not_installed_count']}")
print(f"output_json: {output_json}")
print()
for plugin in installed[:120]:
    print(f"installed: {plugin['id']} {plugin['version'] or ''}".rstrip())
if len(installed) > 120:
    print(f"... {len(installed) - 120} more installed plugins")
PY
