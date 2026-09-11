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
        ├── projects.py      Emirhan's project profiles and work modes
        ├── continuation.py  compact verified continuation briefs
        ├── registry.py      capability/tool registry and health
        ├── permissions.py   per-action authorization policy
        ├── models.py        model metadata registry
        ├── routing.py       capability/context/privacy routing
        ├── cache.py         full-request SHA-256 LRU cache
        └── safety.py        shell-free command preparation policy
```

This is intentionally smaller than the eventual MARIA product. It establishes the contracts that future voice, vision, agent, MCP, computer-control and desktop UI work must obey.

## Personal project profiles

The first runtime ships explicit routing profiles for the systems Emirhan actually works on:

- **SEIS** → Engineering mode; AI, desktop, agent, MCP and Apple-platform work.
- **Eleni-Neferi** → Creative mode; creative direction, branding, UI/UX and editorial work.
- **Pantechnoepistemonoesis** → Research mode; evidence, evaluation and knowledge work.
- **PANTECHNOSYNI** → Research mode; interdisciplinary synthesis, public knowledge and web.
- **Deadly Evil** → Game Dev mode; Unreal, Blender, gameplay, enemy AI and QA.
- **Portfolio** → Creative mode; web, branding, SEO and accessibility.

These profiles are routing preferences rather than hidden authority. They can suggest a small specialist team and capability set, but actual actions still pass capability health and permission policy.

## Natural continuation

`ContinuationResolver` provides the foundation for requests such as “Maria, Deadly Evil'e devam et.” It resolves the project profile and retrieves only the compact state required to resume: active goal, repo, branch, application, blocker, last verification and next safe action. A session is marked `ready_to_resume` only when the goal, repo, branch and next action come from verified current context.

This avoids replaying an entire chat transcript and prevents stale unverified memory from silently driving execution.

## Improvements over the v17 prototype

### Execution safety

The v17 prototype exposes a general terminal tool using `subprocess.run(..., shell=True)` and a string deny-list. v18 does not execute terminal commands at all yet. `CommandPolicy` only converts a narrow command into argv and rejects shell composition, redirection, privilege elevation and destructive command families. Future execution adapters must use argv without a shell and must pass through `PermissionEngine`.

### Authorization

Approval is no longer derived only from an LLM-generated numeric risk level. The execution boundary uses explicit action classes: `READ`, `SAFE_EXECUTE`, `MODIFY`, `EXTERNAL`, `DESTRUCTIVE`, `FINANCIAL`, and `PRIVACY_SENSITIVE`. Mutating and higher-impact classes require explicit owner approval by default.

Permission target identity is exact at this boundary. `target` must be an actual string, must already be non-empty without leading or trailing whitespace, and must not contain ASCII control characters such as NUL, tabs, CR or LF. The runtime does not trim, normalize or rewrite a target before recording the decision; ordinary interior spaces are preserved. This prevents a host, log or later adapter from silently authorizing one textual identity and presenting another after coercion or record framing.

Approval evidence is also type-strict at this boundary: `approved` must be an exact boolean. Serialized strings such as `"false"` / `"true"`, integers, null-like values, containers, or other truthy/falsy objects are rejected rather than interpreted through Python truthiness. This keeps model/tool payload coercion from becoming authorization.

Reversibility evidence is a separate tri-state safety contract: `reversible` may be exact `True`, exact `False`, or `None` when unknown. Strings, numbers, containers, and other coercible values are rejected instead of being preserved as ambiguous rollback metadata. Reversibility remains descriptive evidence only and never grants execution authority.

### Project context and memory provenance

Project facts carry source, project, confidence, verification state, observation time and fact type. Resolution gives current verified evidence priority over stale unverified memory. This supports the intended interaction: “Maria, Deadly Evil'e devam et” can resolve the current goal, branch, app, blocker and next safe action without replaying an entire conversation transcript.

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
