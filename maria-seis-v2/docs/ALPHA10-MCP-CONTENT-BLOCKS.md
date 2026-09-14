# Alpha.10 follow-up — bounded MCP tool-result content blocks

Date: 2026-09-11. Branch: `maria-seis-v4-platform`. PR: #226.

## Goal

Improve compatibility with maintained MCP servers without widening permissions or changing the simulation/live boundary. The MCP tool-result validator now accepts the standard unstructured result block families used by the protocol: text, image, audio, resource links, and embedded resources.

## Safety boundary

Acceptance is deliberately structural and bounded:

- image and audio payloads must be non-empty, syntactically valid base64 with matching `image/*` or `audio/*` MIME families;
- resource URIs and names are length-bounded and control/space characters are rejected in URIs;
- embedded resources must contain exactly one of `text` or base64 `blob`;
- MIME strings and optional resource metadata are length-bounded;
- the existing whole-result bound remains 1 MiB and the content list remains capped at 64 blocks;
- unsupported block types still fail closed as `invalid-tool-result`;
- returned resource links are data in the receipt only. This change does not dereference them or grant resource/network access.

The existing authorization and verification boundary is unchanged. A structurally valid tool result proves only that an authorized MCP transport returned a bounded result. It remains `tool-response-transport` unless the independent host verifier explicitly confirms an external outcome.

## Test-first evidence

The new compatibility test was run first against the unchanged adapter and failed with `invalid-tool-result` because image/audio/resource blocks were rejected. After adding the minimal content-block validator it passed. A second malformed-content regression was then added; it failed against the permissive first implementation and passed after base64, MIME, URI and embedded-resource ambiguity checks were added.

Fresh focused verification after hardening:

- MCP content-type tests plus reconstructed current adapter/hardening/reconciliation suites: **36/36 passed**;
- no maintained third-party MCP server was connected in this environment, so this is protocol-shape readiness, not a claim of third-party interoperability acceptance.

## Remaining acceptance gate

Run the existing governed MCP path against one maintained third-party server with least-privilege tool authorization. Verify discovery, one read-only tool call, cancellation/timeout, transport attribution, result parsing, and teardown without expanding host permissions.
