# ADR-0005: Manifest-First Source Provenance Intake

## Status

Proposed

## Context

SEIS has external Kimi Agent Deployment and Stitch archive references that may be useful for future UX, AI Core, source-catalog, and Apple-native planning work.

The archives include generated bundles, screenshots, `code.html` references, and other binary or generated assets. Importing them directly would increase repository size, blur provenance, create license and public/private boundary risk, and could make future agents confuse references with completed SEIS capability.

SEIS must remain Apple-first, Swift-first, AI-native, public-safe, and honest about demo/live boundaries.

## Decision

Adopt a manifest-first source provenance intake.

The repository records archive names, SHA-256 hashes, byte sizes, file counts, review status, allowed use, blocked use, and a supervised 30-round swarm backlog. Original archives remain unchanged. Bulk extraction and full reference dumps are blocked until explicit license, size, security, and design review. Selected assets may be imported only through future scoped PRs.

## Consequences

Positive:

- Preserves provenance without bloating the repository.
- Keeps local user paths and private context out of public files.
- Gives future agents a clear contract for Kimi and Stitch usage.
- Supports PR-sized follow-up work for screen catalogs, Swift models, and agent ledgers.

Tradeoffs:

- No immediate visual import from Stitch screens.
- No direct runtime reuse of generated Kimi bundles.
- Additional review is required before asset or code adoption.

## Alternatives Considered

- Full archive dump into the repo: rejected because it is too large and review-hostile.
- Selected asset import immediately: deferred until license, size, and design review are explicit.
- Ignore the archives: rejected because the owner selected all Kimi and Stitch source options as relevant.

## Follow-up

- Add no-key Stitch screen taxonomy.
- Add Swift provenance models only after this manifest shape stabilizes.
- Add MCP and skills risk matrix.
- Add supervised source-review ledger if subagent execution remains platform-limited.
