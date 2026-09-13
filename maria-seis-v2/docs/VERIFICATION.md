# Verification index

This branch is an engineering alpha, not a released/native application.
Current follow-up: [adapter session ownership](ALPHA10-SESSION-OWNERSHIP.md).
Prior follow-up: [shared plugin initialization](ALPHA10-PLUGIN-CANCELLATION.md#2026-09-13-shared-initialization-ownership) and [provider refresh cancellation](ALPHA10-PROVIDER-PROBE-CANCELLATION.md#2026-09-13-cancellation-is-not-a-health-observation).
Prior follow-up: [host cleanup and review reconciliation](ALPHA10-HOST-CLEANUP.md).
Prior full-package checkpoint: [provider deadlines and reference shutdown](ALPHA10-LOCAL-PROVIDER-DEADLINES.md).
`DELIVERY.json` identifies its own exact historical verification commit. Do not
apply old counts, health observations or permissions to a newer branch head.

---

## Historical verification — 4.0.0-alpha.4

Date: 2026-09-11. Scope: this standalone web package and provider-readiness contracts only. No native runtime or external provider action has been verified.

## Results recorded at that historical checkpoint

- `npm test`: **71 passed, 0 failed**.
- `python3 tests/browser_smoke.py --offline`: browser acceptance is rerun for each delivery checkpoint; see `docs/VERIFICATION-ALPHA4.md` for the fresh result.
- Live OpenAI/local-model/MCP/macOS/Unreal/Blender execution: **not connected and not claimed**.

## Alpha.4 additions

The provider supervisor is covered for missing adapters, successful capability discovery, capability anti-escalation, stale-health expiry, bounded probe timeout, normalized private errors, concurrent-probe deduplication and external cancellation. A successful probe creates readiness evidence only; it does not authorize or execute an external action.

## Browser limitation

The environment previously blocked loopback HTTP navigation with `ERR_BLOCKED_BY_ADMINISTRATOR`. The offline Chromium harness loads the exact local HTML/CSS/modules through an import map without external requests. This validates UI behavior, not HTTP deployment, authentication or cross-origin security.

## Not covered

Native Apple builds, live model inference, external tool calls, real-world side-effect reconciliation, durable memory, OAuth flows, public deployment and production security remain outside this checkpoint.
