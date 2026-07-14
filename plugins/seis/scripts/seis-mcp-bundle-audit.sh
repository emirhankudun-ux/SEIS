#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
SEIS_ROOT="${SEIS_ROOT:-$(cd -- "${SCRIPT_DIR}/../../.." && pwd)}"
PLUGIN_ROOT="${PLUGIN_ROOT:-$(cd -- "${SCRIPT_DIR}/.." && pwd)}"
STRICT="${SEIS_MCP_AUDIT_STRICT:-0}"

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  cat <<'EOF'
Usage:
  seis-mcp-bundle-audit.sh [--strict]

Flags:
  --strict   Treat optional bundle artifacts as required.
EOF
  exit 0
fi

if [[ "${1:-}" == "--strict" ]]; then
  STRICT=1
fi

echo "SEIS MCP Bundle Audit"
echo "SEIS root: ${SEIS_ROOT}"
echo "Plugin root: ${PLUGIN_ROOT}"
echo "Strict: ${STRICT}"
echo

critical_files=(
  "${PLUGIN_ROOT}/.codex-plugin/plugin.json"
  "${PLUGIN_ROOT}/.mcp.json"
  "${PLUGIN_ROOT}/skills/seis-hub/SKILL.md"
)

bundle_profile_files=(
  "${SEIS_ROOT}/data/seis-mcp-server-2026-06-07.json"
  "${SEIS_ROOT}/data/seis-repos-llm-bridge-2026-06-08.json"
  "${SEIS_ROOT}/content/development/llm-package-registry.json"
  "${SEIS_ROOT}/content/development/llm-task-routing-policy.json"
  "${SEIS_ROOT}/content/development/llm-adapter-readiness.json"
  "${SEIS_ROOT}/content/development/llm-request-blueprints.json"
  "${SEIS_ROOT}/packages/ai-language/src/llm-task-planner.mjs"
)

missing=0
for file in "${critical_files[@]}"; do
  if [[ -f "${file}" ]]; then
    echo "ok: ${file}"
  else
    echo "missing: ${file}" >&2
    missing=1
  fi
done

for file in "${bundle_profile_files[@]}"; do
  if [[ -f "${file}" ]]; then
    echo "ok: ${file}"
    continue
  fi
  if [[ "${STRICT}" == "1" ]]; then
    echo "missing (strict): ${file}" >&2
    missing=1
  else
    echo "missing (optional): ${file}" >&2
  fi
done

if [[ "${missing}" -ne 0 ]]; then
  exit 1
fi

PLUGIN_JSON_PATH="${PLUGIN_ROOT}/.codex-plugin/plugin.json"
MCP_JSON_PATH="${PLUGIN_ROOT}/.mcp.json"

PLUGIN_JSON_PATH="${PLUGIN_JSON_PATH}" MCP_JSON_PATH="${MCP_JSON_PATH}" node -e '
const fs = require("node:fs");
const path = require("node:path");

const pluginPath = process.env.PLUGIN_JSON_PATH;
const mcpPath = process.env.MCP_JSON_PATH;

const plugin = JSON.parse(fs.readFileSync(pluginPath, "utf8"));
const mcp = JSON.parse(fs.readFileSync(mcpPath, "utf8"));

if (plugin.mcpServers !== "./.mcp.json") {
  throw new Error("plugin.json must set mcpServers to \"./.mcp.json\"");
}
if (
  !Array.isArray(plugin.interface?.capabilities) ||
  !plugin.interface.capabilities.includes("MCP bundled install")
) {
  throw new Error("plugin capabilities must include MCP bundled install");
}

const server = mcp?.mcpServers?.seis;
if (!server) {
  throw new Error(".mcp.json must expose mcpServers.seis");
}
if (server.command !== "node") {
  throw new Error("mcp command must be node");
}

const serverArg = String(server.args?.[0] ?? "");
const usesLauncher =
  serverArg.endsWith("/scripts/seis-mcp-launcher.mjs") ||
  serverArg === "scripts/seis-mcp-launcher.mjs";
const usesLocalServer =
  serverArg.endsWith("/mcp/seis-mcp-server.mjs") ||
  serverArg === "/mcp/seis-mcp-server.mjs" ||
  serverArg === "./mcp/seis-mcp-server.mjs";

if (!usesLauncher && !usesLocalServer) {
  throw new Error("mcp args must point to the SEIS MCP server or the launcher script");
}
if (usesLocalServer && !serverArg.startsWith("./") && !path.isAbsolute(serverArg)) {
  throw new Error("mcp local server path must be relative (./mcp/seis-mcp-server.mjs) or absolute");
}

console.log("MCP bundle manifest: ok");
'

if [[ -f "${SEIS_ROOT}/scripts/check-seis-plugin-bundle.mjs" ]]; then
  node "${SEIS_ROOT}/scripts/check-seis-plugin-bundle.mjs"
fi
