# macOS Lane

The macOS lane is for local desktop tools around SEIS: repo inspection, archive audit, plugin management, and data review.

## Initial Direction

- use SwiftUI for first-party desktop surfaces
- keep shell commands and GitHub checks explicit
- avoid deleting repos or local archives from UI until verification gates are satisfied
- use `./script/build_and_run.sh` as the Codex Run button and local macOS shell
  entrypoint for `SeisAppleNativeShell`

## Local Run Path

```bash
./script/build_and_run.sh --verify
```

The script builds the SwiftPM `SeisAppleNativeShell` product, stages a local
`.app` bundle under `dist/`, launches it with `/usr/bin/open -n`, verifies the
process, and cleans it up. Use the no-flag `./script/build_and_run.sh` path for
the Codex app Run action when you want to open the shell interactively.

## Plugin Stack

- Build macOS Apps
- GitHub
- SEIS plugin

## First Build Tasks

1. Define a small SwiftUI shell.
2. Show SEIS branch and repo visibility status.
3. Add plugin status and zip audit views.
4. Add export links to Drive docs and Calendar reviews.

## Demo Command Center (new)

The main app window now includes `SEIS Demo Command Center`:

1. Open local workspace path: `/Users/.../Library/Mobile Documents/com~apple~CloudDocs/Github/SEIS`.
2. Use `Run Quick Health Checks` to verify git status, branch/remote, log snapshot, and local app files.
3. Use `Run GitHub Checks` for `gh auth status` and recent workflow runs.
4. Use `Run Build Smoke` for lightweight Swift build/test diagnostics on the existing package surface.
5. Use `Run npm run quality` for a heavier local validation signal.
6. Use `Run gh auth login` to start interactive GitHub CLI login.
7. Turn on `Show only failed results` to focus on failures.
8. The command panel shows `Last Executed Command`, keeps a time-stamped command history, and lets you `Rerun` / `Copy Output` directly on failed checks.
9. Use history filters: `Tüm Kayıtlar`, `Sadece Başarısız`, `Son 10`, `Son 50`, `Son 1 Saat`, `Bugün`, and `Bu Hafta`.
10. Copy actions show a temporary confirmation toast; it says `Kopyalandı` on normal output and `Kopyalama başarılı ama boş çıktı` when copied content is empty.
