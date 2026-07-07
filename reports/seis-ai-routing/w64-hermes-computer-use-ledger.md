# W64 Hermes Computer Use Ledger

Date: 2026-07-07

## Scope

Record the observed Hermes UI submission for the W64 provider-routing prompt
without treating absent model output as evidence and without claiming provider
execution.

## Prompt

```text
Review this public-safe SEIS W64 provider routing contract. Return exactly three bullets: boundary risk, fallback-order concern, next repo-only check. Do not ask for credentials, read secrets, call providers, or claim execution. Context: local-first when adequate; then owner-selected; then approved cloud by capability/privacy/cost; provider readiness is installed, credentialed, quotaReady, ownerApproved, verified, blocked; Rate Limited/Error must visibly move to next eligible route without silent provider switching.
```

## Result Ledger

- Owner signal: the owner requested Hermes Computer Use for proper Hermes usage.
- App binding: Hermes, `com.nousresearch.hermes`.
- Workspace context: canonical SEIS repository was visible; raw local path is
  redacted from repo evidence.
- Branch context: feature branch was visible; exact local branch detail is not
  required for this public-safe ledger.
- Session id: redacted; raw session route/id is not recorded in repo evidence.
- Visible selected model: redacted external-provider UI label; exact provider
  and model label are not recorded in repo evidence.
- Prompt class: public-safe policy review.
- Submit path: `type_text` updated the app state, the control changed to `Send`,
  and the prompt was submitted through that `Send` control.
- Secrets requested: false.
- Provider calls claimed: false.
- Provider calls: not claimed.
- Live execution claim: none; this is UI-submit observation only.
- Response visible: false.
- Repo evidence used: ui-submit-ledger-only-no-model-output.
- UI ambiguities: voice-control-click-produced-microphone-notification,
  set-value-did-not-enable-send, type-text-enabled-send,
  no-response-visible-after-3m20s.

No Hermes answer was visible in the captured app state after submission, and
no Hermes answer was visible in the later captured app state either,
including a later observation after approximately 3m20s, so no model output is
used as repository evidence.
