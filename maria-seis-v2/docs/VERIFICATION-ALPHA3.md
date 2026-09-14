# Verification — 4.0.0-alpha.3

## Fresh evidence

- `npm test`: **64/64 Node tests passed**.
- `python3 tests/browser_smoke.py --offline`: **17/17 Chromium acceptance checks passed**.
- HTTP browser navigation was attempted but blocked by the execution environment administrator policy (`ERR_BLOCKED_BY_ADMINISTRATOR`); it is not claimed as verified.

## New regression coverage

- invalid provider state transitions;
- health degradation and identity preservation;
- preference allowlisting and corrupt-storage fallback;
- Plugin Host API compatibility and permission grants;
- plugin crash isolation and timeout;
- execution-journal redaction, bounds and immutability;
- truthful journal entries for simulation and unavailable live execution.

## Boundaries

No real OpenAI, local-model, MCP, macOS, Unreal or Blender action was executed by these tests. Alpha.3 remains a simulation-first platform foundation.
