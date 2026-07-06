# SEIS Stitch UX Screen Catalog

## Purpose

This catalog turns the provided Stitch archives into a public-safe UX reference layer for SEIS. It records screen counts, module families, representative screen names, and adoption gates without copying raw archive contents into the repository.

The machine-readable source is `content/development/seis-stitch-ux-screen-catalog.json`.

## Observed Archives

`stitch_web_based_linux_desktop.zip`:

- 490 zip entries.
- 162 screen references.
- 148 `code.html` entries.
- 8 design docs.
- Main signal: desktop shell, command center, cloud, SSH, security, data, automation, knowledge, kernel, and creative-lab screens.

`stitch_yapay_zeka_web_platformu.zip`:

- 220 zip entries.
- 72 screen references.
- 71 `code.html` entries.
- 1 design doc.
- Main signal: AI command center, agent swarm, model forge, compute fabric, marketplace, compliance, system health, research, and developer portal screens.

## Usage Boundary

Allowed:

- Use screen names and module families as UX vocabulary.
- Build public-safe module briefs from selected screens.
- Rebuild ideas in SEIS style after review.
- Use the catalog to guide web demo and Swift shell planning.

Not allowed:

- Mutating the original archives.
- Dumping full archive contents into the repo.
- Copying raw HTML without review.
- Copying images/assets without license, size, and public-safe review.
- Claiming Stitch screens are already implemented in SEIS.

## Module Families

The catalog groups screens into ten SEIS module families:

- Command Center.
- AI Core.
- Agent Swarm.
- Apple-First Shell.
- Security and Compliance.
- Cloud and SSH.
- Data and Infrastructure.
- Knowledge and Academy.
- Creative Lab.
- Release and Marketplace.

Each family has source signals, intended SEIS use, priority, and a safe next step.

## Verification

Run:

```bash
node scripts/check-seis-stitch-ux-screen-catalog.mjs
```

When the source provenance or orchestration contracts change, also run:

```bash
node scripts/check-seis-source-provenance-intake.mjs
node scripts/check-seis-five-year-agency-orchestration-contract.mjs
```

## Next Handoff

The next safe design slice is a visual shortlist for:

- Command Center.
- AI Core.
- Agent Swarm.
- Security and Compliance.
- Apple-First Shell.

That shortlist should remain a design review artifact until license and asset review is complete.
