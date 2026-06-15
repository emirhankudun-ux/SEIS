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

## Portfolio Web Demo (website + native app)

See how the `apps/web` portfolio behaves both as a **macOS website** and as a
**native macOS app** — from one codebase:

```bash
./apps/macos/run-demo.sh both   # browser + native window (default)
./apps/macos/run-demo.sh web    # macOS website demo only (opens your browser)
./apps/macos/run-demo.sh app    # native macOS app demo only (WKWebView window)
```

What it does:

- Serves `apps/web` over `http://localhost` (the site fetches
  `translations.json` / `site-config.json`, so `file://` would fail CORS).
- `web` opens the served site in your default browser.
- `app` builds a tiny isolated SwiftPM executable (`SeisPortfolioDemo`,
  `apps/macos/PortfolioDemo/`), wraps the binary in a `.app` whose generated
  `Info.plist` injects the local URL and allows local networking (ATS), then
  launches it with `/usr/bin/open -n`. The window is a native **SwiftUI** shell
  hosting the portfolio in a `WKWebView`: a unified toolbar (back / forward /
  reload / open-in-browser), loading + error states, and the site's dark brand
  theme.

Requirements: macOS, `python3`, and (for `app`/`both`) the Swift toolchain from
Xcode Command Line Tools. Press `Ctrl+C` to stop the local server. The demo is
deliberately separate from `SeisAppleNativeShell` so it has zero impact on the
main Apple shell or its CI.

## Plugin Stack

- Build macOS Apps
- GitHub
- SEIS plugin

## First Build Tasks

1. Define a small SwiftUI shell.
2. Show SEIS branch and repo visibility status.
3. Add plugin status and zip audit views.
4. Add export links to Drive docs and Calendar reviews.
