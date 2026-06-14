# SEIS Unified GitHub Visibility

SEIS is the single public-facing repository for the ecosystem:
`emirhankudun-ux/SEIS`.

Public cloud remains for everyone. VPN cloud is for workplaces and teams, and
the full SSH cloud lane is the private operational surface for approved
WireGuard peers.

## Rule

Only SEIS should be public-facing. Other GitHub repositories and local source
folders are treated as SEIS child-agent candidates, source snapshots, or hidden
migration sources until they are safely represented under SEIS.

No repository deletion, archival, privacy change, transfer, or force-push is
allowed without explicit confirmation after a dry-run plan.

## Child-Agent Gate

Before any source repository is hidden or deleted, SEIS must contain evidence:

- `sources/<repo>/<branch>` refs or a verified source snapshot.
- A SEIS child-agent manifest with owner, scope, commands, and rollback owner.
- Documentation that routes users to SEIS instead of the old source repository.
- Live GitHub CLI/API evidence for the source repository visibility.
- Maintainer confirmation for the chosen action: archive, private, transfer, or
  delete.

The current live read-only GitHub plan has identified `emirhankudun-ux/memories`
as a public non-SEIS source. It is tracked in
`data/seis-child-agent-intake.json` and
`docs/development/agents/memories-agent.md` until it becomes a verified SEIS
child agent, a verified source snapshot, or an explicitly approved visibility
decision.

## Tooling Attribution

SEIS may mention OpenAI Codex, ChatGPT, Claude, OpenAI, and Anthropic to explain
the AI-native tooling surface and reach more people. `CONTRIBUTORS.md` may list
OpenAI and Anthropic as AI tooling participants because Codex, ChatGPT, and
Claude are part of the SEIS workflow. These mentions must stay truthful and must
not imply sponsorship, endorsement, or official partnership unless that
relationship is explicitly confirmed.

## Read-Only Checks

Static policy check:

```bash
npm run check:seis-unified-github-visibility
```

Live read-only GitHub visibility plan:

```bash
node scripts/check-seis-unified-github-visibility.mjs --live
```

Strict live check fails if a public, non-archived repository other than SEIS is
visible:

```bash
node scripts/check-seis-unified-github-visibility.mjs --live --require-single-visible
```
