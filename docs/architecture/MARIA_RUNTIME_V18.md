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

### Project context and memory provenance

Project facts carry source, project, confidence, verification state, observation time and fact type. Resolution gives current verified evidence priority over stale unverified memory. This supports the intended interaction: “Maria, Deadly Evil'e devam et” can resolve the current goal, branch, app, blocker and next safe action without replaying an entire conversation transcript.

### Capability routing

Tools declare capabilities, health, method rank, reliability, latency, cost, permissions and project support. Resolution follows the preferred hierarchy by ranking structured methods ahead of fragile GUI/vision approaches while refusing unavailable, auth-required, incompatible and disabled tools.

### Model routing

Models declare provider, local/cloud location, capabilities, context capacity,
reliability, latency and cost. In this Python foundation, `sensitive=True` is a
**hard local-only constraint**, not a scoring preference. Locality, availability,
required capabilities and context capacity are eligibility checks before ranking.
A missing, disabled, incapable or undersized local candidate raises `LookupError`
without selecting a cloud fallback, even if cloud quality or context is higher.

`sensitive=False` preserves ordinary local/cloud ranking; it is **not consent**
to disclose data. Any eventual provider call still requires the host's privacy,
permission and actual-target checks. There is no cloud-consent override in this
router; a future exception requires a separately reviewed policy/approval flow,
not a silent retry with `sensitive=False`.

The host must supply an exact boolean sensitivity classification. Model `local`
and `available` flags require exact booleans rather than truthy strings or
integers. Requested context tokens require an exact nonnegative integer; model
context capacity requires an exact positive integer. Invalid boundary values
fail before ranking. A free-form `privacy_level="local"` label cannot turn a
nonlocal model into a local candidate. Error messages contain no model/provider
identifiers or prompt data.

**Evidence and limits:** On main `550c54c460347528bec4fef18c6cdb7650dc991e`,
a synthetic cloud-only registry returned a cloud model for `sensitive=True`;
a string `local="false"` was also accepted as truthy metadata. These were
reproduced offline, not observed live data transfers. The 19 focused regression
tests cover missing/disabled/incapable/undersized local candidates, strict
boundary types, deterministic ranking, unchanged non-sensitive controls and a
32-case eligibility matrix. Run `python3 test/maria-router-privacy.test.py`
alongside the existing foundation suite and `scripts/check-maria-runtime-v18.py`.

This is still metadata-only selection. A valid boolean does not prove actual
execution locality, model availability, endpoint ownership, freshness, network
isolation or inference correctness. Trusted host adapters must resolve those
facts and recheck policy at the effect boundary. A compromised host can lie;
this class is not a sandbox for arbitrary Python code. It neither loads a
model nor creates an endpoint, queue, retry, SSH connection or cloud request.

The older provider-neutral Node/MCP router in open PR #156 remains a separate
unmerged surface; its no-cloud-on-local-only intent is consistent with this
fix, but its code is not copied and no cross-runtime consolidation is claimed.
PR #249's cache changes remain separate. When integrating these independent
PRs, retain the **union** of their runtime-workflow test paths and commands.

Design references: [OWASP deny by default](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html#deny-by-default)
and [Python runtime type-annotation limits](https://docs.python.org/3.12/library/typing.html).
These support explicit checks; neither reference proves SEIS is secure.

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
