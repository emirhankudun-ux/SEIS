# Alpha.7 verification

Checkpoint: `4.0.0-alpha.7`

## Verified locally

- `npm test`: 96/96 Node tests passed.
- Offline Chromium acceptance: 17/17 checks passed.
- MCP modern lifecycle: `server/discover`, protocol/client `_meta`, tool discovery, tool execution receipt.
- MCP legacy lifecycle: `initialize` followed by `notifications/initialized`.
- Auto fallback: modern discovery `-32601` falls back to supported legacy initialization.
- Protocol downgrade mismatch fails closed.
- Malformed tool results cannot become verified success receipts.
- Host-side authorization values are not returned in health/receipt data.
- Abort signals cancel the MCP tool-call transport path.

## Not verified in this environment

- A real external MCP server.
- A real LM Studio/Ollama process.
- External side effects from MCP tools.
- Native macOS automation or permissions.
- Unreal or Blender live adapters.

Passing transport tests means the client contract behaves as expected under deterministic injected responses. It does not prove semantic correctness or production readiness.
