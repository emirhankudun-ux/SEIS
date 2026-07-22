# SEIS Public Marketplace Local Cleanup

## Purpose

The public SEIS marketplace is intentionally a bounded package experience:
`seis-ai-agent@seis-repo` is the canonical default and a user can add at most
one optional bundle for a specific task. This keeps the public surface useful
without asking anyone to install hundreds of capability cards.

Older local Codex configurations can still contain `seis...@personal` entries.
Those entries are not part of the public package model. The cleanup utility
only changes those local configuration records after an explicit operator
action; it does not delete plugin folders, caches, retained source packages, or
non-SEIS plugins.

## Safe workflow

Run a read-only plan first:

```bash
npm run plan:seis-public-marketplace-local-cleanup
```

The plan reports aggregate personal/public SEIS counts, confirms that the
canonical public `seis-ai-agent@seis-repo` record is enabled, and prints no raw
configuration contents or local path.

After reviewing the plan and receiving current human approval, remove only the
matching personal SEIS configuration tables:

```bash
node scripts/manage-seis-public-marketplace-switch.mjs --apply --remove-personal
```

This is the intended UI-cleanup mode. Before the atomic replacement it creates
and verifies a same-directory backup. It refuses to run when the canonical
public SEIS-Agent is missing, disabled, duplicated, malformed, or changed by a
concurrent process.

For a reversible trial that preserves the personal tables but disables them,
use:

```bash
node scripts/manage-seis-public-marketplace-switch.mjs --apply --disable-personal
```

The tool prints the backup filename, never its full local path. To restore a
backup produced by the tool, use its filename in the same config directory:

```bash
node scripts/manage-seis-public-marketplace-switch.mjs --apply --restore <backup-filename>
```

## Boundaries

- Plan mode is read-only.
- Apply mode is explicit and only accepts the default Codex configuration (or a
  temporary test fixture).
- The script targets exact `seis...@personal` tables only.
- The public canonical record must remain enabled before and after a change.
- No network, provider, secret, GitHub, release, deployment, installation, or
  background-agent action is available.
- No source directory or cache directory is removed. If a stale UI persists
  after refresh, investigate that behavior separately rather than deleting
  caches speculatively.
- The supervised Auto Mode does not invoke this script automatically.

## Verification

```bash
node --check scripts/manage-seis-public-marketplace-switch.mjs
node --test plugins/seis-core/test/public-marketplace-local-cleanup.test.mjs
npm run check:seis-public-marketplace-local-cleanup
```

After an approved apply, restart or refresh Codex and inspect the Plugins view.
Only direct UI evidence can establish that the old `personal` labels are gone.

For the next compact-surface step after personal cleanup, see
`docs/roadmap/SEIS_CANONICAL_PUBLIC_DEFAULT_PROFILE.md`. It converges duplicate
direct public source records on the one canonical SEIS-Agent default while
preserving any optional bundle the user already selected.
