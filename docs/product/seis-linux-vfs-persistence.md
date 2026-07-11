# SEIS Linux Replica VFS Persistence

Year 2 Q1 now has a browser-local persistence slice for the Linux-like demo.
The virtual file system remains a SEIS-owned browser data structure; it never
becomes host filesystem access.

## Storage contract

- Primary store: IndexedDB database "seis-linux-replica", object store
  "browser-state", record "vfs-root-v1".
- Fallback: bounded localStorage record
  "seis-linux-replica-vfs.v1".
- Payload limit: 2 MB serialized VFS snapshot.
- Diagnostics: window.__SEIS_LINUX_REPLICA__.vfsPersistence().
- Recovery boundary: if browser storage is unavailable, the demo remains
  memory-only and reports "memory"; it does not attempt host filesystem access.

## Covered mutations

Terminal mkdir, touch, rm, cp, and mv, Files new-file/new-folder actions,
Editor saves, Design token snapshots, and generic local snapshots are
checkpointed through the same persistence writer after their browser
interaction completes.

Writes are serialized so rapid browser-local actions do not race one another.
Boot waits for the restore attempt before showing the login surface.

## Validation

    npm run check:seis-linux-vfs-persistence
    node scripts/check-seis-linux-replica-browser-smoke.mjs

The browser smoke creates a disposable file, reloads the route in the same
browser profile, and confirms the file is visible after restore. The smoke
profile is temporary and removed after the run.

## Truth boundary

This is not cloud sync, a database service, a host filesystem bridge, SSH, or
remote workspace persistence. Durable multi-user storage remains a later,
approval-gated Year 2/3 slice.
