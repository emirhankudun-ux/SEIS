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
