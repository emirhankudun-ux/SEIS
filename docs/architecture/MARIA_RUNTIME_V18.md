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

### Routing explanations and command-line checks

Status: implemented on the route-diagnostics branch stacked on PR #250; not a
live provider or native app release. This extends the existing Python router,
not the independent Node/MCP router or the cache implementation.

`ModelRouter.explain(...)` returns a frozen `ModelRouteDecision` using one
configured-registry list snapshot. `select(...)` delegates to the same path,
preserving its model-object return, ranking weights and existing `LookupError`
messages. Filtering is ordered; the explanation names the first stage that
leaves no eligible candidate, not an exhaustive analysis of every model:

| Reason code | Meaning within configured metadata |
| --- | --- |
| `no_models` | The registry contains no model records. |
| `no_local_models` | Local-only policy excludes every registered model. |
| `models_unavailable` | No privacy-eligible record is marked available. |
| `capability_unavailable` | No available eligible record covers every requested capability. |
| `context_exceeded` | No remaining record has enough context capacity. |
| `selected` | An eligible metadata record wins the existing rank. |

`ModelRegistry.all()` returns a sorted list copy including unavailable records;
that is necessary to distinguish absence from disabled metadata. Model records
are retained by reference. This is not a deep immutable, locked or
cross-process snapshot: the trusted host owns registration concurrency and
freshness. Custom registries used with the router must implement this complete
snapshot contract, not supply a filtering override of `available()`.

The decision's `model` reference is for trusted in-process callers only. The
supported `to_dict()` summary emits exactly seven fields: `schema_version`
(`maria.routing-decision.v1`), `outcome`, `reason`, fixed English `message`,
`privacy_mode`, `evidence_basis` (`configured-metadata-only`) and
`execution_authorized` (always false). It deliberately omits request text,
capability identifiers, model/provider names, endpoints, credentials and the
rest of the registry. Localized interfaces should map stable reason codes;
no translated UI is claimed here. Do not use generic dataclass serialization
as a substitute for this restricted summary: it can include the model object.

Direct construction rejects contradictory selected/blocked results and basic
type/eligibility mismatches. That validation does not prove provenance,
authorization, health, actuality of locality, or validity for a later action.
Recheck host policy and actual endpoint facts before any real provider call.

The existing launcher now runs a read-only diagnostic:

```sh
python3 apps/maria-desktop/maria.py --route-check coding --route-context-tokens 4096
python3 apps/maria-desktop/maria.py --route-check coding --route-check reasoning --route-privacy standard
```

The CLI defaults to local-only policy and zero estimated context tokens. It
uses **only the existing built-in demo registry**, not installed-model
discovery, imported files, environment credentials, local endpoints or cloud.
It adds `registry_source: built-in-demo-fixture` and `live_probe_performed:
false` to every output. With the shipped unavailable demo record, the first
command reports `models_unavailable` and exits **3**, not a live outage or an
inference failure. Exit **0** means a metadata selection, never execution
permission; exit **2** means invalid CLI usage. Route options without a route
check and conflicting launcher actions are rejected. Existing doctor/status
operations are preserved. Capability arguments are identifiers, not prompts.

Verification: `python3 test/maria-route-diagnostics.test.py` exercises the real
router and launcher, including a 32-case gate matrix, selected-object parity,
identifier-free output, consistent exit codes, blocked/selected summaries,
immutable decision fields, one-snapshot evaluation and invalid inputs. The
original 19 privacy and 9 foundation tests are unchanged. The first 24-test
diagnostic suite reported 52 assertion failures against unmodified #250 code
(subtests contribute multiple failures); no import error hid the missing API.
The same suite passed after implementation. CI runs all three suites on
Ubuntu and macOS. No model inference, permissions, persistent storage, UI,
orb, network adapter, cache lifecycle, merge or deployment is added.

References: Python [argparse](https://docs.python.org/3.12/library/argparse.html)
and [dataclasses](https://docs.python.org/3.12/library/dataclasses.html).
These describe implementation primitives, not proof of product readiness.

Rollback is the focused diagnostic commit. Future host integration should
consume this decision contract rather than create a second routing algorithm;
retain the union of #249, #250 and this branch's test paths/commands when
integrating. Actual model/endpoint probing remains separately permissioned.

### Opt-in routing metadata freshness

Status: implemented in a proposed branch based on #251. The existing router
accepts optional `max_metadata_age_seconds` and a host-supplied aware `now`
instant. With the default `None`, selection and the exact seven-field v1
summary remain unchanged; the router does not read a clock. The host must
explicitly enable this policy for any future live provider integration.

`ModelSpec` appends optional `observed_at` and `source` fields. Observations
use a deliberately strict ISO subset: `YYYY-MM-DDTHH:MM:SS`, optional one to six
fractional digits, then `Z` or a numeric `+/-HH:MM` offset. They normalize to
UTC without rounding. Naive, malformed, overprecision and unrepresentable
timestamps are rejected without echoing their input. Source labels are exact
printable strings of 1-128 characters without surrounding whitespace. Both
fields are omitted from the model repr; generic dataclass serialization is
**not** the approved public summary and can still expose them.

The optional gate runs after privacy, availability, capability and context
eligibility, before ranking. It accepts only records with **both** an
observation and source, and an exact elapsed age in the inclusive range
`0 <= age <= max_metadata_age_seconds`. Seconds must be a nonnegative integer,
not a boolean or float. Zero enables an exact-instant policy; it does not
mean disabled. Future observations are rejected with no clock-skew tolerance.
Missing provenance, missing time, future time or excessive age leave a record
ineligible; if no candidate remains, the reason is `metadata_stale`. That
code means freshness was not established, not that a real model was probed
and found offline. Previous first-blocker reasons retain their precedence.

The host clock is read once only after a candidate reaches the freshness gate.
Earlier blockers return without reading it, so a broken clock cannot mask an
empty registry, privacy denial or another earlier eligibility reason. Injected
clocks are validated before metadata access; they must be aware datetimes and
are permitted only with an enabled policy. UTC conversion
precedes comparison, including daylight-saving folds. Elapsed microseconds
are compared as integers rather than floating-point seconds. An unavailable
or malformed clock fails rather than falling back to unchecked selection.
Host clock reliability remains an assumption; this is not signed time,
a monotonic cross-process clock or protection against a hostile host.

Enabled calls emit `maria.routing-decision.v2` with `metadata_freshness`:
`max_age_seconds`, normalized `evaluated_at` (null when an earlier gate blocks
and age was not evaluated), `selected_observed_at` (null
when blocked), and `selected_source` (`host-supplied` when selected, otherwise
null). The arbitrary source label, provider/model names and request text are
never copied into this safe summary. `evidence_basis` remains
`configured-metadata-only` and `execution_authorized` remains false, even when
fresh. This is temporal eligibility of a host claim, not source verification,
endpoint-locality proof, an approval token or permission to send private data.
The selected timestamp may itself be sensitive operational metadata; hosts
still control who receives even the restricted summary.

The CLI enables the policy explicitly:

```sh
python3 apps/maria-desktop/maria.py --route-check coding --route-max-metadata-age-seconds 60
```

It still uses the existing built-in demo registry. The unavailable example
therefore reports `models_unavailable` (exit 3), with the enabled v2 policy,
`registry_source: built-in-demo-fixture` and `live_probe_performed: false`.
There is no installed-model scan, timestamp fabrication, environment-key read,
network call, retry, cloud fallback, persistent observation or UI/orb change.
Omitting the flag retains v1 output. Invalid usage exits 2; a valid metadata
selection exits 0 without authorizing execution.

Verification: `python3 test/maria-router-freshness.test.py` adds 28 tests for
legacy defaults, sourced age boundaries, subsecond precision, timezone offsets,
a daylight-saving fold, future/missing data, clock failure, redaction, direct
result consistency, privacy-preserving selection and the actual launcher.
The first 24-test suite reported 26 assertion failures on unchanged #251 code;
it passed after implementation, then gained the two clock regression tests.
Partial automated review identified that a failing clock could mask earlier
blockers. This was reproduced, then two further tests (five failing subcases
and one direct-construction error before the fix) established deferred clock
reading and null evaluation timestamps for unreached freshness gates. The
new decision consistency check now requires time only for age-evaluated
results; earlier-blocker summaries must not claim an age evaluation.
Existing 24 diagnostics, 19 privacy and 9 foundation tests remain unchanged.
The runtime workflow adds the new suite to its existing Ubuntu/macOS matrix.

Reference: [Python datetime semantics](https://docs.python.org/3.12/library/datetime.html)
for timezone awareness, UTC normalization and exact timedelta components.
The existing context parser deliberately is not reused: it accepts naive
values as UTC, which is incompatible with this opt-in model boundary. No
context/recovery behavior or the separate workspace-evidence PR #231 is changed.

Rollback is the focused freshness commit. Integration must retain the union
of #249/#250/#251 and these tests. Every eventual provider call still needs
fresh target evidence and authorization at execution time: do not turn an
old selection into a reusable capability or silently disable its age policy.

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
