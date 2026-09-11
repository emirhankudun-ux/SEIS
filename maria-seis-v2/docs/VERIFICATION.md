# Verification — 4.0.0-alpha.2

Date: 2026-09-11. Scope: this standalone web package only. No native runtime or external provider has been verified.

## Reproduction and results

The supplied alpha.1 archive passed its three original scripts. A new 24-case regression suite then failed on that baseline, exposing missing boundaries rather than accepting the existing green scripts as sufficient evidence. After implementation those cases passed. An additional 30-case execution suite found two further issues: mutable provider selection and late progress after settlement. Both were fixed before rerunning the complete suite.

Final local results:

- Original smoke, core and platform scripts: passed, with intentional simulation-contract expectation updates.
- Node test runner: **54 passed, 0 failed**, no skipped cases.
- Syntax: 19 JavaScript/MJS files passed `node --check`; HTML and Python parsed.
- Real Chromium UI: **17 checks passed**, no uncaught browser errors and no external HTTP requests.
- Viewports: 1440×900, 1280×800, 1024×768, 768×900, 720×900, 390×844, 320×568.

Environment: Node.js 22.16.0; Chromium 144.0.7559.96; Python Playwright harness.

## Browser limitation

Navigating to the local HTTP server returned `ERR_BLOCKED_BY_ADMINISTRATOR`. No policy was disabled and no alternate network address was used. The separate `--offline` mode rendered the package's HTML, CSS and native JS modules in an about:blank document via an import map. Only import specifiers were rewritten. Network navigation and HTTP deployment remain **unverified**.

The browser checked actual click paths: simulated completion, active cancellation, blocked high-impact requests, dismissal without consent, text-only user input, truthful voice/vision states, role expansion, settings keyboard focus and project switching. The screenshots were captured from Chromium, not drawn as substitute UI.

## Visual review

The v4 layout, dark graphite palette, warm orb, serif headline and three-column desktop structure were retained. Changes are deliberate corrections: truthful capability labels, no fake Live badge, disabled unimplemented controls, visible keyboard focus, scrollable settings and narrower-screen overflow fixes. Desktop, mobile and settings captures were inspected. They are implementation previews, not proof of model or OS integration.

## Not covered

Full SEIS repository CI, native Apple builds, live models, external tool calls, real-world cancellation, persistent memory, public deployment, OAuth flows, exhaustive accessibility auditing and production security are not validated by these results. No 55-minute session duration is asserted; development was tracked by completed changes and fresh checks.
