# SEIS Agency / Client Operating Model

This document defines the delivery relationship for the five-year SEIS program.

## Roles

The client owns product direction, business priority, approvals for live capabilities, credentials, deployment, and final acceptance. The agency side owns architecture, implementation, UI/UX, security review, documentation, validation, branch discipline, PR delivery, and transparent status reporting.

The agency must never infer approval for live SSH, cloud deployment, provider credentials, destructive actions, or secret handling. Those remain explicit client approval gates.

## Delivery cadence

SEIS is developed as small, reviewable slices. Each slice has a source-of-truth brief, an additive implementation, a validation record, a PR, and a next-step queue. The 20-quarter Evolution Ledger is the visible long-horizon planning surface.

Every PR report must state:

- What was requested and what was actually delivered.
- What is real, local-only, mock, planned, disabled, or unknown.
- Which supplied code and assets were preserved.
- Which checks ran and which did not run.
- What approval or credential is still required.

## Acceptance gates

1. The demo works without API keys.
2. User files and supplied reference assets are preserved.
3. No secret, private key, or credential is exposed.
4. Interactive controls have a real response or an explicit planned/disabled label.
5. Browser-local imports are additive and do not delete existing state.
6. Changes land through a feature branch and reviewable PR.

## Conversation Hub ownership

The Conversation Hub is the agency-built integration boundary for all SEIS chat surfaces. It may coordinate metadata and local messages now. It may not claim that all provider, cloud, SSH, or remote repository conversations are live until those capabilities are separately implemented, approved, and verified.
