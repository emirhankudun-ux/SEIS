# MARIA × SEIS Runtime v18 Foundation

## Decision

The user-provided MARIA v17 single-file prototype is treated as a product and behavior reference, not as the production architecture. Its strongest ideas—voice-first interaction, model routing, memory, tasks, events, MCP adapters, agent roles, permissions, recovery and a compact desktop presence—remain part of the MARIA direction. The production SEIS implementation separates those responsibilities into bounded modules so each capability can be secured, tested, replaced and evolved independently.

MARIA is the human-facing intelligence. SEIS is the orchestration and policy layer beneath it.

## Foundation modules

```text
apps/maria-desktop/maria.py
        ↓
packages/maria-runtime/python/maria_runtime/
        ├── context.py       provenance-aware project context
        ├── registry.py      capability/tool registry and health
        ├── permissions.py   per-action authorization policy
        ├── models.py        model metadata registry
        ├── routing.py       capability/context/privacy routing
        ├── cache.py         full-request SHA-256 LRU cache
        └── safety.py        shell-free command preparation policy
```

This is intentionally smaller than the eventual MARIA product. It establishes the contracts that future voice, vision, agent, MCP, computer-control and desktop UI work must obey.

## Improvements over the v17 prototype

### Execution safety

The v17 prototype exposes a general terminal tool using `subprocess.run(..., shell=True)` and a string deny-list. v18 does not execute terminal commands at all yet. `CommandPolicy` only converts a narrow command into argv and rejects shell composition, redirection, privilege elevation and destructive command families. Future execution adapters must use argv without a shell and must pass through `PermissionEngine`.

### Authorization

Approval is no longer derived only from an LLM-generated numeric risk level. The execution boundary uses explicit action classes: `READ`, `SAFE_EXECUTE`, `MODIFY`, `EXTERNAL`, `DESTRUCTIVE`, `FINANCIAL`, and `PRIVACY_SENSITIVE`. Mutating and higher-impact classes require explicit owner approval by default.

### Project context and memory provenance

Project facts carry source, project, confidence, verification state, observation time and fact type. Resolution gives current verified evidence priority over stale unverified memory. This supports the intended interaction: “Maria, Deadly Evil'e devam et” can eventually resolve the current goal, branch, app, blocker and next safe action without replaying an entire conversation transcript.

### Capability routing

Tools declare capabilities, health, method rank, reliability, latency, cost, permissions and project support. Resolution follows the preferred hierarchy by ranking structured methods ahead of fragile GUI/vision approaches while refusing unavailable, auth-required, incompatible and disabled tools.

### Model routing

Models declare provider, local/cloud location, capabilities, context capacity, reliability, latency and cost. Sensitive work prefers a capable local model when one is available; otherwise routing fails or uses an authorized cloud candidate only when the policy permits it in a future adapter layer.

### Cache correctness

The v17 prompt cache hashes only the first two messages with MD5. v18 hashes the complete request, model, temperature and extra generation parameters with SHA-256 so two requests sharing an initial prefix cannot collide at the cache-policy level.

## Future vertical slices

1. **MARIA Project Session Engine** — connect Goal Tracking, Git state and workspace checkpoints to context resolution.
2. **MCP Gateway v2** — schema-validated capability discovery, health, normalized errors, circuit breakers and per-call permissions.
3. **Model Provider Adapters** — explicit OpenAI/Qwen/DeepSeek/local adapters behind the registry/router, with secret redaction and privacy policy.
4. **Agent Work Graph** — minimum-context specialist assignments, least privilege, budgets, acceptance criteria, builder/verifier separation.
5. **macOS Native Shell** — SwiftUI floating MARIA, state ring, project/context chip, compact activity/results/approval cards.
6. **Voice + Perception** — local wake word/VAD where supported, event-driven structured app state first, vision as fallback.
7. **Unreal/Blender adapters** — capability-discovered read paths first; mutation only after explicit compatibility evidence and permission gates.

## Commands

```bash
python3 test/maria-runtime-v18.test.py
python3 scripts/check-maria-runtime-v18.py
python3 apps/maria-desktop/maria.py --doctor
python3 apps/maria-desktop/maria.py --status
python3 apps/maria-desktop/maria.py --context "Deadly Evil"
python3 apps/maria-desktop/maria.py --permission modify
```

## Truth boundary

This foundation does not claim live LLM routing, microphone access, screen perception, Unreal/Blender control, Git mutation, cloud sync, background autonomy, deployment, or a packaged macOS application. Those capabilities require separate adapters and verification evidence.
