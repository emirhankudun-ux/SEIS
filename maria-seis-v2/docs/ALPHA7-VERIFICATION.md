# Alpha.7 verification

Checkpoint: `4.0.0-alpha.7`

## Verified locally

- `npm test`: **98/98 Node tests passed**.
- Offline Chromium acceptance: **17/17 checks passed**.
- MCP modern lifecycle: `server/discover`, protocol/client `_meta`, tool discovery, tool execution receipt.
- MCP legacy lifecycle: `initialize` followed by `notifications/initialized`.
- Auto fallback: modern discovery `-32601` falls back to supported legacy initialization.
- Protocol downgrade mismatch fails closed.
- Malformed tool results cannot become verified success receipts.
- Host-side authorization values are not returned in health/receipt data.
- Abort signals cancel the MCP tool-call transport path.
- Live receipts are bound to the provider selected by the router before verification.
- `LiveRuntimeAdapter` preserves adapter-supplied provider/run/project/intent identity instead of rewriting stale or mismatched receipts into valid-looking ones.
- The OpenAI-compatible local-model adapter emits provider/run/project/intent identity from the actual request, allowing strict end-to-end receipt matching.

## Security regression covered

A live adapter can no longer return a receipt for a different provider or stale run and have the runtime normalize that receipt into the current request identity. Verification now fails closed unless provider, run, project and intent all match the routed execution and the receipt contains external evidence.

## Not verified in this environment

- A real external MCP server.
- A real LM Studio/Ollama process.
- External side effects from MCP tools.
- Native macOS automation or permissions.
- Unreal or Blender live adapters.

Passing transport tests means the client contract behaves as expected under deterministic injected responses. It does not prove semantic correctness or production readiness.
