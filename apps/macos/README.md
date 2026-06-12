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
