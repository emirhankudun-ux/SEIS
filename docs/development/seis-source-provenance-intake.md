# SEIS Source Provenance Intake

## Purpose

This intake records the Kimi Agent Deployment and Stitch archive references before any code, asset, screenshot, or generated bundle is copied into SEIS.

The first milestone is provenance, not import. SEIS should know what the external archives are, what role each archive plays, what is blocked, and what must be reviewed before reuse.

## Source Set

Tracked archives:

- `Kimi_Agent_Deployment_v1.zip` through `Kimi_Agent_Deployment_v7.zip`
- `stitch_web_based_linux_desktop.zip`
- `stitch_yapay_zeka_web_platformu.zip`

Kimi v7 is the primary reference. Kimi v1-v6 are evolution evidence. Stitch archives are UX screen catalogs, module idea pools, and reviewed code references only after explicit follow-up review.

## Decision Resolution

The owner selected all A/B/C options, so the implementation resolves them as layered policies:

- Roadmap plus PR cycles remain the base.
- Automation architecture is represented through repo-tracked contracts and validators.
- Active background agents are used only when the platform actually supports them.
- MCP usage starts with official or approved sources, then installed safe tools, then candidate research.
- Skills are chosen by task, tracked in registry form, and re-evaluated per safe cycle.
- Zip usage starts manifest-first; selected assets need license, size, and design review; full dumps are blocked.
- AI Core remains demo-honest, local-ready, and cloud-ready without keys.
- Agent swarm visibility starts with ledgers and reports before UI panels.

## Public-Safe Boundary

The repository may store:

- Archive file names
- SHA-256 hashes
- Byte sizes
- File counts
- Review status
- Allowed and blocked use
- PR work packages
- Swarm backlog

The repository must not store:

- Local absolute archive paths
- Private user folders
- Bulk extracted archives
- Unreviewed `code.html` imports
- Unreviewed screenshots or binary assets
- Real credentials or provider keys
- Claims that any archive represents live AI

## Verification

Run:

```bash
node scripts/check-seis-source-provenance-intake.mjs
```

The checker validates the manifest-first boundary, required archive entries, Kimi v7 primary role, Kimi v1-v6 evolution role, public-safe path policy, and the 30-round supervised swarm backlog.

## Next Work

Recommended next PRs:

1. Build a no-key Stitch screen taxonomy from archive listings without copying binaries.
2. Add useful Swift provenance models after the JSON manifest stabilizes.
3. Create an MCP and skills permission risk matrix.
4. Add a supervised agent review ledger for source-screen evaluation.

## Rollback

Rollback is limited to removing:

- `content/development/seis-source-provenance-intake.json`
- `scripts/check-seis-source-provenance-intake.mjs`
- `docs/development/seis-source-provenance-intake.md`
- `docs/decisions/adr-0005-seis-source-provenance-intake.md`
- `seis-brain/vault/12_Context_Packs/SEIS Source Provenance Intake Context.md`
