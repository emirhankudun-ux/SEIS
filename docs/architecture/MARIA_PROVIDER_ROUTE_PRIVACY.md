# MARIA Provider Route Privacy Boundary

Status: draft contract; descriptive only; no live provider execution

Research handoff: `SEIS-RH-20260912-005` — `PARTIALLY_APPLIED` by this slice.
The broader item also requires effect-boundary authorization, secret-vault DLP,
real adapter provenance, completion receipts and current endpoint evidence; none
of those are claimed here.

## Why this boundary exists

A configured model name is not enough to describe where a request is actually
processed. Gateways can select among multiple providers and endpoints, and
fallback can change the processor after an initial choice. Endpoint-level data
retention, training use and processing region can also differ even when the
model family is unchanged.

Primary-source recheck on 2026-09-13:

- Anthropic, **Detecting and countering misuse of AI: September 2026**:
  <https://www.anthropic.com/threat-intelligence-report-september-2026>. The
  report documents silent proxy/model substitution and third-party reseller
  handling of user exchanges, including sensitive coding-session data.
- OpenRouter, **Provider Routing**:
  <https://openrouter.ai/docs/guides/routing/provider-selection>. Provider
  order, fallback, data-collection and ZDR controls are explicit routing
  dimensions; fallback is enabled by default unless constrained.
- OpenRouter, **Zero Data Retention**:
  <https://openrouter.ai/docs/guides/features/zdr>. Endpoint data policies can
  differ from general provider policy, and ZDR is distinct from other data-use
  controls.

These sources motivate explicit route-policy evidence. They do not attest to
SEIS providers, prove a provider policy is truthful, or authorize sending data.

## Contracts

`ProviderRouteManifest` is an immutable host assertion that binds:

- configured/requested provider and model identity;
- resolved provider and model identity;
- ordered processor chain;
- processing region;
- declared retention posture;
- declared training use;
- ZDR status;
- whether fallback was used;
- local/remote locality; and
- a host policy-revision label.

`ProviderPrivacyPolicy` is the host's allowed envelope:

- exact processor allowlist;
- exact region allowlist;
- maximum retention class;
- whether training use is allowed;
- whether ZDR is required; and
- whether fallback is allowed.

`evaluate_provider_route_privacy()` binds those contracts to the existing
`ModelRouteDecision`. A blocked router result cannot become eligible. Requested
model/provider identity and locality must match the selected `ModelSpec`, then
processor, region, retention, training, ZDR and fallback gates run in order.
Unknown retention or training posture fails closed.

## Fingerprints and stale decisions

Both policy and manifest use deterministic SHA-256 fingerprints over canonical
JSON security semantics. `ProviderRoutePrivacyDecision.matches_current()`
returns false when either fingerprint changes. This supports the required rule
that old privacy eligibility must not be reused after route or policy drift.

A fingerprint is only a change detector. It does not authenticate the source,
prove the endpoint exists, sign the policy, establish clock freshness, or act
as an approval/capability token.

## Safe diagnostics

`ProviderRoutePrivacyDecision.to_dict()` intentionally excludes provider,
model, processor, region and policy-revision labels. It exposes only:

- schema/outcome/reason;
- standard vs local-only privacy mode;
- local vs remote route scope;
- whether fallback occurred;
- policy and route fingerprints;
- configured-manifest evidence basis; and
- `execution_authorized: false`.

The in-process manifest still contains identifiers and must be treated as
host-classified operational data.

## Effect boundary still missing

This slice deliberately does **not**:

- call or discover a provider;
- read API keys, OAuth tokens or environment secrets;
- prove endpoint locality, health or data policy;
- perform retry or fallback;
- issue an approval receipt;
- authorize a network send;
- persist prompts or model responses;
- implement a completion receipt; or
- claim Secret Vault DLP enforcement.

A future reviewed adapter boundary must resolve the actual current route,
construct fresh source-backed evidence, compare the policy/route fingerprint,
re-run permission checks, and fail closed on divergence before any network
effect. Completion evidence must record the actual resolved route without
copying secrets or prompt contents.

## Verification

The dedicated offline regression suite is
`test/maria-provider-route-privacy.test.py`. It is wired into the existing
Ubuntu/macOS MARIA Runtime v18 workflow. The suite uses synthetic identifiers
only and performs no network, credential, provider or filesystem mutation.

Rollback is a focused revert of this provider-route module, export, regression,
workflow/verifier wiring and this document. No user data migration or recovery
journal deletion is required.
