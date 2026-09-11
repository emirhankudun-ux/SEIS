# Alpha.8 — real local MCP subprocess verification

Date: 2026-09-11. Reconciled base: `28ba01d3a730d78e7ea62624df881cad82af4ca4` (initial base `7146f65f5a53459b76074c50a93b513381b23040`), branch `maria-seis-v4-platform`, PR #226. Scope: the `maria-seis-v2` package only. No main-branch merge, production deploy, security-rule suppression or third-party account connection is part of this change.

## Implemented flow

`npm run mcp:check` → trusted Node host → child process over stdio → initialize → initialized notification → tools/list → explicit host authorization → package.inspect → independent parent-side SHA-256 comparison → attributed receipt → child cleanup.

The included server reads only a regular, non-symlink `package.json` under the explicit workspace root, capped at 262144 bytes. It returns name, version, byte count and SHA-256, not the full manifest. The parent obtains its own bounded file observation before the call and again during verification; it does not copy the child's assertion into a success flag. Public CLI accepts no path or command arguments.

## Files and responsibilities

- `host/stdioTransport.mjs`: absolute executable, shell disabled, snapshotted launch config, minimal environment, UTF-8 newline framing, bounded pending requests/messages, correlated replies, sanitized errors, cancellation and EOF/TERM/KILL shutdown.
- `host/packageServer.mjs`: actual read-only reference MCP server exposing `package.inspect`.
- `host/checkMcp.mjs`: fixed host-approved operation, independent verification, signal handling and exit status.
- `src/adapters/mcpClient.js`: strict protocol lifecycle, atomic bounded discovery, explicit host authorization, result validation, credential redaction and verification separation.
- `src/adapters/localOpenAICompatible.js`: attributable receipt identity for the existing local-model path; no live model was run.
- Tests cover malformed replies, version mismatch, stale discovery races, denied permissions, abort/timeout, child crashes, symlinks, malformed files and receipt identity mismatch.

## Verification performed

| Check | Observed result |
| --- | --- |
| `npm test` | 152 passed, zero failed/skipped/cancelled |
| `node host/checkMcp.mjs` | verified, scope `local-package-inspection`, child closed |
| Real child-process transport tests | 15 passed |
| Real reference-server filesystem checks | 8 passed |
| MCP hardening regressions | 26 passed |
| Modern/legacy reconciliation tests | 7 passed |
| Existing/new live receipt tests | Included in the 152 total |
| Offline Chromium acceptance | 17 passed, seven viewport sizes, no uncaught errors/external requests |
| HTTP browser navigation | Attempted; `ERR_BLOCKED_BY_ADMINISTRATOR`, not verified |

The counts above are not additive: transport, reference-server and client tests are subsets of the 152 Node tests. The initial MCP regression pass produced 19 failures against the old client; subsequent edge tests exposed and fixed credential-escaping and stale-discovery races. Tests were rerun after fixes.

The checked manifest reports version `4.0.0-alpha.8`, 584 bytes, SHA-256 `19ac31658656f18bd9d8501b877dd1869c9ef36f276f70b9fbd6a02ab9175544`. A fresh run generates a new run ID. Logs and screenshots are packaged as delivery evidence, not as model-generated preview art.

## Compatibility and security boundaries

The client preserves modern **2026-07-28** discovery and per-request metadata from the concurrent alpha.7 update, plus legacy **2025-11-25 / 2025-06-18** handshakes. The real reference CLI deliberately pins 2025-06-18. Modern lifecycle paths were checked with injected protocol responses; only the included legacy server was verified as a real process. This is a text/structured-result subset, not a full MCP conformance claim. Unsupported version/results fail closed. HTTP/SSE, OAuth, image/audio tool content, resource subscriptions and sampling are outside this implementation.

A transport reply has `transportVerified`; task success requires a separate trusted synchronous `verifyResult` callback. The generic callback defaults to false, and `authorizeTool` also defaults to false. Generic transport authentication remains a host responsibility. The stdio transport never places HTTP auth headers on the wire and inherits no parent environment except the platform launch requirement on Windows.

These checks are **not** a sandbox for untrusted executables or JavaScript plugins. The bundled server is trusted, small and read-only. Process-tree containment, third-party code review, native macOS permissions, Windows behavior, end-to-end model inference and public deployment need separate acceptance. Existing repository-wide security findings remain outside this patch and have not been suppressed.

The browser stays in simulation; it is not connected to this CLI. Core-to-UI live bridging and one actual local model remain next milestones. Broad Creative & Advertising Agency execution stays gated behind the core platform.

## Concurrent update reconciliation

While this change was being prepared, six commits advanced the branch to `a5cf2ee`, adding modern MCP lifecycle behavior. A subsequent commit (`28ba01d`) added the same local-model receipt identity fix; that fix is preserved too. All seven concurrent commits are retained in the parent history. The modern discovery/default negotiation behavior is preserved, while explicit host authorization, strict result validation, atomic pagination and numeric-error-only downgrade handling are applied to both eras. Seven new lifecycle tests failed against the initial legacy-only draft, then passed after reconciliation. This checkpoint is alpha.8 to avoid reusing the concurrent alpha.7 version.

## Package provenance

The prior alpha.6 ZIP contained stale delivery metadata and older receipt-identity primitives. The current package restores the GitHub identity checks, adds the alpha.8 changes and refreshes its evidence. The standalone archive is a tested package distribution, not a byte-for-byte export of the entire SEIS repository. `DELIVERY.json` and the archive checksum inventory state the tested scope; they do not assert that unrelated repository files or CI passed.

## Primary protocol references

- [MCP 2025-06-18 lifecycle](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle)
- [MCP 2025-06-18 transports](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports)
- [MCP 2026-07-28 release](https://blog.modelcontextprotocol.io/posts/2026-07-28/)
- [MCP 2025-06-18 tools](https://modelcontextprotocol.io/specification/2025-06-18/server/tools)

## Next safe work

Connect a trusted native/local host to the UI with scoped authorization and fresh readiness, or validate one real installed local model. Do not convert catalog entries into live capabilities or treat the current reference-server success as completion of the personal intelligence OS.
