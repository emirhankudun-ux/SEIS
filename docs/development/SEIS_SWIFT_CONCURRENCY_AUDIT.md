# SEIS Swift Concurrency Audit

**Goal:** `SEIS-GOAL-021`
**Distribution:** Public `SEIS Repo` package
**Status:** Active Wave 3 repository-local implementation

`seis-swift-concurrency-audit` is a small, read-only review tool for two fixed
checked-in Swift source roots. It reports bounded aggregate markers such as
`@unchecked Sendable`, `@MainActor`, actor declarations, `Task`,
`DispatchQueue`, and `await` usage.

It complements `seis-apple-native-readiness`; it does not replace Swift package
readiness, workspace inspection, technology taxonomy, or source provenance.

## Public and safety boundary

- The package and its card are in the public `seis-repo` marketplace, displayed
  as `SEIS Repo` for everyone.
- It accepts only the current local SEIS repository root through its MCP/CLI
  entry point, then reads two fixed relative source roots.
- It refuses arbitrary audit paths and symlinks, and limits Swift file count,
  per-file bytes, aggregate bytes, depth, and reported paths.
- It returns aggregate counts and capped repository-relative filenames only.
  It never returns raw Swift source, raw matched values, or absolute paths.
- Write, network, and secret permissions are empty. No personal marketplace is
  read or changed.

An `attention` result is a static review signal, not a compiler error, failed
test, data-race finding, runtime bug, installation result, provider result,
deployment, or public release claim.

## Evidence and validation

The generated record is
`content/development/seis-swift-concurrency-audit.json`. It records the current
bounded scan, public-card reconciliation, and explicit no-compile/no-native-run
boundary without persisting raw machine-path matches.

Run the focused local checks from the repository root:

```text
npm run check:seis-swift-concurrency-audit
node --test plugins/seis-core/test/swift-concurrency-audit.test.mjs
node --test plugins/seis-core/test/swift-concurrency-audit-evidence.test.mjs
```

For the MCP surface, use only the fixed local target:

```text
node plugins/seis-core/seis-swift-concurrency-audit/scripts/seis-swift-concurrency-audit-mcp-server.mjs --status
node plugins/seis-core/seis-swift-concurrency-audit/scripts/seis-swift-concurrency-audit-mcp-server.mjs --audit --path .
node plugins/seis-core/seis-swift-concurrency-audit/scripts/seis-swift-concurrency-audit-mcp-server.mjs --evidence
```

## Rollback

Revert the focused Wave 3 package, its `SEIS Repo` card, generated evidence,
tests, and documentation on the current feature branch. It creates no external
state or data migration.
