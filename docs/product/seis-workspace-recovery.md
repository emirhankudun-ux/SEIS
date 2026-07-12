# SEIS Workspace Recovery

SEIS Workspace Recovery is the Year 2 browser-local portability slice for the
shared `/workspace` VFS.

## Current behavior

- Export creates a JSON snapshot through a normal browser download.
- Import accepts a user-selected JSON file only.
- Imports are merge-only and never delete current entries.
- For a path conflict, the newer `updatedAt` entry wins; newer local data is
  preserved when the incoming snapshot is older.
- Scope and root mismatches are rejected.
- The route exposes storage mode, item count, pending snapshot preview, and
  merge results.

## Boundaries

The route does not read the host filesystem automatically, execute shell or
SSH commands, call cloud providers, store credentials, or claim backup to a
remote service. IndexedDB and the bounded localStorage fallback remain the
only storage layers.

## Evidence

- `npm run check:seis-workspace-recovery`
- `npm run check:seis-workspace-recovery-browser-smoke`
- `apps/web/seis-workspace-recovery.html`
