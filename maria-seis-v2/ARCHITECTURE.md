# MARIA × SEIS — bounded web simulation and host-adapter contracts

Default browser path:
`input → plan → permission → provider selection → simulator → simulation verification → truthful UI`

Trusted-host path:
`input → plan → permission → fresh provider readiness → live runtime → host adapter execute → attributed receipt → live verification`

`createProviderSupervisor` owns time-bounded readiness evidence. `createHostAdapterManager` owns the versioned connect/health/execute/disconnect contract. `LiveRuntimeAdapter` bridges a selected provider into orchestration. `verifyLiveReceipt` proves execution identity and evidence. These are separate boundaries by design: readiness ≠ authorization ≠ execution ≠ verification.

The shipped browser app uses simulation. Concrete transports remain external to this package until individually implemented and verified.


## Alpha.5 local OpenAI-compatible adapter

`src/adapters/localOpenAICompatible.js` implements the first concrete trusted-host provider transport. It is intentionally narrow: model discovery via `/v1/models`, chat inference via `/v1/chat/completions`, bounded cancellation/timeout handling, canonical provider-id binding, and attributable receipts. It contains no secret storage and is not auto-enabled by the browser UI.

End-to-end live inference remains dependency-injected: `local adapter → HostAdapterManager → LiveRuntimeAdapter → orchestrator → verifyLiveReceipt`. A valid HTTP response proves that a specific local provider returned a receipt; it does not prove that the model's natural-language answer is factually correct.


## Alpha.9 durable audit and recovery

Live host execution now has an audit lifecycle in addition to execution/verification: `provider selected → journal begin → execute → verify → journal complete`. The default in-memory journal preserves the existing bounded API; trusted hosts may inject `createPersistentExecutionJournal` with an explicit storage adapter. A live run does not begin when its audit-start record cannot be committed. If terminal audit persistence fails after an externally verified result, the public outcome is downgraded to `unverified` so a clean completion is not claimed without durable evidence.

`findInterruptedRuns` only identifies durable runs whose latest state remains `running`. It does not replay them and returns `resumeAllowed: false`. Resumption is intentionally deferred until each consequential adapter has idempotency keys, side-effect reconciliation and explicit human authorization rules. The included file journal store is a host reference with bounded atomic writes, not the final Apple-native persistence layer.

## Alpha.10 transport verification and local-model reference path

`verifyLiveReceipt` now distinguishes a verified transport/attribution contract from an independently verified external outcome. `verifiedTransport` is the baseline live-receipt gate; `verifiedExternalAction` is stricter and only becomes true for `verificationScope: external-outcome` after transport identity also passes. This prevents a model's own response from being mislabeled as proof that its natural-language answer is correct or that an external side effect succeeded.

`host/openAIReferenceServer.mjs` and `host/checkLocalModel.mjs` provide a bounded acceptance path for the OpenAI-compatible adapter using real loopback HTTP and a separate process. The reference server is not a model. The check exercises `LocalOpenAICompatibleAdapter → HostAdapterManager → LiveRuntimeAdapter → orchestrator → verifyLiveReceipt`, exact model identity, cancellation, audit recording, and child cleanup. A maintained real model host remains a separate acceptance gate.
