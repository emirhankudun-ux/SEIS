# Development Automation

This workspace uses a low-power development automation loop for long SEIS sessions.

## Purpose

- Confirm the workspace routing policy before deeper work starts.
- Run lightweight foundation and JavaScript syntax checks.
- Detect whether the current folder is connected to Git.
- Detect whether GitHub CLI authentication is available before any origin push attempt.
- Return the next few reversible development actions without starting heavy servers or release builds.

## Command

```bash
npm run automation:develop
```

GitHub publish preflight:

```bash
npm run automation:publish-readiness
```

This publish check does not commit or push. It verifies the Git working tree, expected `UIXAppTTR` branch, UIX-Apps remote hint, GitHub CLI authentication, and local automation health before a server-side push is attempted.

Weekly full-efficiency report:

```bash
npm run automation:weekly-report
```

This report keeps the long-running development loop reviewable without raising machine pressure. It writes `dist/weekly-efficiency-report.json` and summarizes low-pressure governance, release artifact freshness signals, Git readiness, GitHub authentication, local automation health, and publish blockers.

Optional JSON report:

```bash
node scripts/run-development-automation.mjs --write-report
```

The JSON report is written to `dist/development-automation-report.json`, which stays outside source control.

If deploy readiness reports a package/manifest hash mismatch, refresh the generated release artifacts:

```bash
npm run automation:refresh-release
```

The same refresh command is required when packaged source files are newer than the current server manifest.

## Operating Rules

- Keep the loop dependency-free.
- Keep checks static and local by default.
- Do not start a dev server, browser automation, Docker, or release packaging from this command.
- Treat missing Git as a publish blocker in local staging workspaces, not as a content failure.
- Treat missing GitHub authentication as a push blocker, not as a development blocker.
- When checks are green but publish blockers remain, keep returning a local reversible improvement path so development does not stall.
- Run `npm run automation:publish-readiness` before any GitHub server push attempt.
- Run `npm run automation:weekly-report` for weekly or long-session checkpoints.
- Refresh release artifacts after source changes that affect the static package.
- Keep deploy readiness strict about both package hash integrity and source freshness.

## Escalation

Use heavier commands only when release packaging is explicitly needed:

```bash
npm run build:static
npm run prepare:server
npm run plan:upload
```

Use GitHub publishing only after the actual repository is connected and authentication is available:

```bash
gh auth login -h github.com
git push origin UIXAppTTR
```
