# Full Efficiency Shipment

This workflow separates high reasoning effort from local machine pressure.

## Command

```bash
npm run ship:full-efficiency
```

To intentionally commit the synced iCloud Git checkout before push:

```bash
SEIS_AUTO_COMMIT=1 npm run ship:full-efficiency
```

## What It Does

- Runs workspace routing, foundation, static build, and static package checks.
- Syncs this staging workspace into the iCloud GitHub folder with rsync backups.
- Writes `dist/full-efficiency-shipment-report.json`.
- Inspects the synced iCloud Git checkout.
- Commits the synced state only when `SEIS_AUTO_COMMIT=1` is explicitly set.
- Pushes `UIXAppTTR` only when the checkout is clean, remote points at `UIX-Apps.git`, and GitHub CLI auth is available.

## Stop Rules

- Do not retry GitHub push in a loop when auth is missing.
- Do not auto-stage unrelated dirty files in the GitHub checkout.
- Do not start dev servers, browser automation, Docker, or dependency installs from this workflow.

## Required Manual Step

If GitHub auth is missing:

```bash
gh auth login -h github.com
```

Then rerun:

```bash
npm run ship:full-efficiency
```
