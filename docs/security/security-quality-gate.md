# Security Quality Gate

Date: 2026-06-11

This gate must pass before source repository deletion, any deployment, or
automation expansion. Machine-readable state lives in
[`data/security-gate-status.json`](../../data/security-gate-status.json) and is
validated by `npm run check:security-gate`; the web cockpit footer renders the
same records.

## Gates

### closed_code — enforced

SEIS is a closed-code repository. The `SEIS CLOSED CODE Governance` workflow
(`scripts/check-seis-closed-code.mjs`) guards the policy file set on every
push and pull request.

### no_large_binaries — enforced

No archive or binary above the GitHub blob limit enters Git. The 1.1 GB
iCloud zip stays inventoried (`data/github-zip-import-inventory.json`) but
uncommitted. Any large-asset need routes through releases or external
storage, never the working tree.

### source_deletion — open

Origin repositories may be archived or deleted. Conditions, all met:

- File snapshots exist under `sources/<repo>/` (manifest: `sources/README.md`).
- Full branch history exists under `sources/<repo>/<branch>` refs in SEIS.
- Every origin repository carries a moved-to-SEIS pointer in its README.

### deployment — blocked

No deployment until all conditions hold:

- [x] A secret scan of the full tree (including `sources/`) is recorded.
  `scripts/security-secret-scan.mjs` → `data/secret-scan-results.json`,
  guarded by `npm run check:secret-scan`. Deployable surface clean; the one
  generated third-party bundle is allowlisted with a documented reason.
- [ ] Runtime error tracking is chosen and configured (Sentry route per the
  workbench security row). Choice decided in
  `docs/decisions/error-tracking-decision-record.md`; configuration is still
  deferred until a deploy target is chosen and Convex is provisioned, so
  this condition stays unmet.
- [ ] A rollback contract exists for the deployed surface.

Auth posture for the eventual deployed surface is decided in
`docs/decisions/auth-jwt-decision-record.md` (Convex Auth, GitHub OAuth,
short-lived JWT).

### automation_expansion — blocked

No new write-capable automation (scheduled jobs, bots, server-side sync)
until all conditions hold:

- The deployment gate is open.
- The automation's writes are covered by an entity in
  `apps/fullstack/state-model.json` with a sync rule.
- A kill switch (disable path) is documented with the automation.

## Changing Gate State

Gate state changes are edits to `data/security-gate-status.json` plus a dated
entry in the log below. The check script fails if states drift from the
allowed set (`enforced`, `open`, `blocked`).

## Log

- 2026-06-11: Gate created. `source_deletion` opened after consolidation
  verification (snapshots, full-history refs, README pointers all in place).
  `deployment` and `automation_expansion` start blocked.
- 2026-06-13: Secret-scan condition of the `deployment` gate met. Scan is
  clean across the deployable surface (533 files); 47 matches in the
  generated `github-code-bundle.txt` are upstream third-party test fixtures
  and were allowlisted with a documented reason. `deployment` stays blocked
  on error-tracking and rollback conditions.
- 2026-08-26: Error-tracking *choice* decided (Sentry) —
  `docs/decisions/error-tracking-decision-record.md`. Configuration is not
  done (no deploy target chosen, Convex not provisioned), so the condition
  stays unmet and `deployment` stays blocked on error-tracking configuration
  and the rollback contract.
