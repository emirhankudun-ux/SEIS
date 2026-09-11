# MARIA × SEIS — bounded web simulation

MARIA owns interaction and truthful result presentation. This web package explores SEIS contracts without replacing the repository's Apple-native direction. Native execution, voice, models, memory and MCP still require separate implementations.

## Execution boundary

`validate input → immutable plan → permission → observers → simulator selection → bounded execution → response-contract check → truthful UI`

`createOrchestrator` permits dependency injection for contract tests. The shipped release only executes a simulator. `executionMode:'live'` returns `unavailable`; it never silently falls back to a mock. A timeout/cancellation is not completion. Late progress after settlement is ignored. A future external adapter must implement host-side cancellation and reconcile actual side effects; Promise.race alone cannot stop a remote tool.

## Authorization

Unrecognized risk fails closed. Project changes require an explicit write policy with safe mode disabled; the UI grants no such write policy. High-impact operations remain blocked pending approval and have no executable approval path in the demo. Dismissing a notice is not consent. Text classification is advisory, not a security boundary.

Plans and provider selections cannot be changed by UI observers. Event subscribers receive independent snapshots. Subscriber failures are isolated and diagnostics are bounded and do not include raw exception messages.

## Capability truth

Provider eligibility requires implemented, connected and health-verified flags plus full capability coverage. These metadata fields are not proof by themselves and must eventually be maintained by a trusted host. Every external shipped provider is unconfigured or disabled. Only the local simulator is active. Catalog roles are not spawned agents; session state is not durable memory.

## Verification

`verifyPrototype` checks the simulator identity, result, intent, project, run identity and reported side-effect boundary. `contractVerified` only covers that contract. `verified` is always false in this simulator: it does not verify builds, apps, model answers or real tools. Evidence reports unknown or reported effects rather than inventing `side-effects:none`.

## Source of truth

Fact resolution excludes desired user instructions and rejects unverified claims labeled as runtime facts. Equal-priority differing values return an explicit conflict with preserved candidates. Instruction selection is opt-in and does not override security or authorization. This utility is not yet a durable knowledge store.

## Plugin boundary

The SDK validates identity, version shape, unique capability names, risk and callable factories. Capability arrays are defensively copied and frozen. A valid manifest neither authorizes execution nor isolates arbitrary JavaScript. No third-party plugin loader is shipped.


## Alpha.3 runtime contracts

### Provider lifecycle
`src/core/providerLifecycle.js` owns explicit provider transitions and health evidence. Catalog presence is not connectivity. `ready` is only meaningful when the caller supplies verified health evidence.

### Safe preference persistence
`src/core/persistence.js` persists only an allowlist of non-secret UI/routing preferences. Credentials, tokens, prompts, arbitrary memory and execution evidence are excluded.

### Plugin Host v2
`src/plugins/host.js` validates API compatibility, declared capabilities and requested permissions. Invocation requires all manifest permissions to be explicitly granted and is bounded by a host timeout. Plugin exceptions are normalized instead of escaping into the application.

### Execution journal
`src/core/executionJournal.js` stores a bounded in-memory audit trail. The orchestrator records terminal outcomes and never converts simulation evidence into an external-success claim. Secret-shaped keys are redacted before storage.


## Alpha.4 provider supervision

`src/core/providerSupervisor.js` is the readiness boundary for future external providers. A catalog entry alone remains inert. A provider becomes routable only after a registered adapter returns a successful bounded probe with capabilities that are a subset of the provider's declared contract. Probe failures, cancellation and timeouts clear health evidence; raw adapter exceptions are normalized.

Health evidence is time-bounded. `routingSnapshot()` marks expired health as degraded/unconnected, so a once-healthy provider cannot remain eligible forever. Concurrent probes for the same provider are deduplicated to avoid racing health state. This supervisor does **not** execute model/tool actions and does not relax the orchestrator's alpha live-execution block.
