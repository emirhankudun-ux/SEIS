# Full Efficiency, Low Pressure Mode

SEIS development can run at full cognitive efficiency without increasing local
machine pressure.

## Operating Promise

- Use more reasoning before running commands.
- Prefer targeted source reads over broad scans.
- Keep local validation proportional to the change.
- Avoid dev servers, browser automation, Docker, and dependency installs unless
  they are explicitly needed.
- Keep generated release artifacts refreshed only after source changes that
  affect the static package.

## Local Development Path

Use this path while the iCloud Drive workspace is acting as local staging:

```bash
npm run automation:develop
```

If release artifacts are stale:

```bash
npm run automation:refresh-release
npm run check:release-sync
npm run automation:develop
```

For a single-step refresh that also updates the AI release manifest, full-stack language matrix, and plugin source references:

```bash
npm run automation:refresh-seis-surface
npm run automation:refresh-seis-surface -- --summary
```

`automation:refresh-release` only updates web release assets, so use
`npm run automation:refresh-seis-surface` whenever content surfaces (`content/`, `deploy/`, `reports/`) also
need to be synchronized together.

## GitHub Server Path

Use this path only after the workspace is connected to the intended GitHub
repository and GitHub CLI authentication is available:

```bash
npm run automation:publish-readiness
git push origin UIXAppTTR
```

## Stop Conditions

Stop and report instead of forcing the computer when:

- The workspace is not a Git working tree.
- GitHub CLI authentication is missing.
- The remote URL is unknown.
- GitHub CLI is unavailable in the active environment.
- A check would require a heavy local process that is not needed for the current
  change.

## Current Bias

When local quality is green but publishing is blocked, continue with one small,
reversible improvement at a time and keep the GitHub blocker separate from code
quality.
