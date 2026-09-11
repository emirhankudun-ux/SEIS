# MARIA × SEIS — bounded web simulation and host-adapter contracts

MARIA owns interaction and truthful result presentation. This web package explores SEIS contracts without replacing the repository's Apple-native direction. Native execution, voice, models, durable memory and MCP still require concrete implementations.

## Execution boundary

Default browser path:

`validate input → immutable plan → permission → provider selection → simulator → response-contract check → truthful UI`

Trusted-host live path:

`validate input → immutable plan → permission → fresh provider readiness → injected live runtime → host adapter execute → attributed receipt → live verification → truthful result`

`createOrchestrator` permits dependency injection. The shipped default instance uses only the simulator. `executionMode:'live'` never silently falls back to a mock. A timeout/cancellation is not completion. Late progress after settlement is ignored. External adapters must implement host-side cancellation/reconciliation because Promise.race alone cannot stop a remote side effect.

## Authorization

Unrecognized risk fails closed. Project changes require an explicit write policy with safe mode disabled. High-impact operations remain approval-gated. Dismissing a notice is not consent. Text classification is advisory, not a security boundary.

Plans and provider selections cannot be changed by UI observers. Event subscribers receive isolated payloads. Subscriber failures are bounded and normalized.

## Capability truth

Provider eligibility requires implemented, connected and health-verified state plus capability coverage. Catalog presence is never connectivity. `createProviderSupervisor` maintains bounded probe evidence with TTL and capability anti-escalation. `createHostAdapterManager` owns a versioned `connect → health → execute → disconnect` contract for an actual trusted host adapter. A provider must be ready before execute and only verified capabilities may be invoked.

The two layers are intentionally separate: **readiness is not execution permission, and execution is not outcome verification**.

## Verification

`verifyPrototype` checks only the simulator identity, result, intent, project, run identity and side-effect boundary. Its `verified` field remains false.

`verifyLiveReceipt` checks a live host receipt. It requires:

- runtime identity `host-runtime-v1` and mode `live`;
- selected provider attribution;
- matching intent, run ID and project ID;
- explicit `outcomeVerified:true`;
- non-empty external evidence.

Only when every check passes may the orchestrator return `verified` and journal `verifiedExternalAction:true`.

## Source of truth

Fact resolution excludes desired user instructions and rejects unverified runtime claims. Equal-priority differing values return an explicit conflict with preserved candidates. Instruction selection is opt-in and does not override security or authorization.

## Plugin boundary

Plugin Host v2 validates API compatibility, identity, unique capability names, requested permissions and risk. Invocation requires all manifest permissions to be explicitly granted and is bounded by a timeout. Plugin exceptions are normalized. A valid manifest is not a sandbox or execution grant.

## Persistence and audit

`src/core/persistence.js` stores only an allowlist of non-secret UI/routing preferences. Tokens, credentials, prompts and arbitrary memory are excluded.

`src/core/executionJournal.js` stores a bounded in-memory audit trail. Secret-shaped fields are redacted. Simulation evidence can never become an external-success claim.

## Alpha.4 provider supervision + live runtime contract

`src/core/providerSupervisor.js` handles time-bounded readiness probes, health expiry, cancellation and deduplication. `src/adapters/hostAdapter.js` defines the trusted-host adapter API and enforces health/capability readiness before execute. `src/adapters/liveRuntime.js` bridges the selected ready provider into orchestration through dependency injection.

No concrete OpenAI/local-model/MCP/macOS/Unreal/Blender transport is configured by the shipped browser app. The architecture is ready for one verified end-to-end adapter without claiming that integration exists today.
