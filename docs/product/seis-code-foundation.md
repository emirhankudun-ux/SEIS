# SEIS Code Foundation

## Purpose

Define `@seis-code` as the future browser-based engineering workspace for SEIS.
It should become a real, sandboxed development surface, not a fake code editor.

## Scope

The planned product includes:

- file explorer
- Monaco editor
- multi-tab editing
- integrated virtual terminal
- source-control simulation or approved adapter
- command palette
- extensions registry
- shared browser file system
- no-key local demo AI REPL
- backend-gated live AI when configured

## Current Status

| Area | Status | Evidence | Blocker | Next Safe Action |
| --- | --- | --- | --- | --- |
| Code automation plan | Documented/scaffolded | `content/development/code-automation-plan.json`, `reports/code-automation-plan.md` | It is planning evidence, not the product runtime. | Keep as planning evidence. |
| Web app surface | Browser foundation with repeatable smoke | `apps/web/seis-code.html`, `apps/web/seis-code.js`, `apps/web/seis-code.css`, `npm run check:product-experience-browser-smoke` | No committed visual-regression baseline or Playwright suite yet. | Keep Chrome smoke passing and attach generated screenshots when review requires them. |
| Monaco and fallback editor | Browser foundation | `apps/web/seis-code.html`, `apps/web/seis-code.js` | Monaco loads from CDN; offline fallback is textarea. | Add offline/no-CDN test. |
| Interactivity metric | Browser-smoked foundation | `npm run check:product-experience-browser-smoke` verifies a SEIS Code-specific clickable-response rate above the 80% acceptance floor. | Not yet a full assistive-technology traversal. | Expand keyboard and screen-reader cases without weakening the no-fake-control rule. |
| Virtual file system | Browser foundation with Desktop bridge and reload smoke | `apps/web/seis-code.js`, `apps/web/desktop.js`, `docs/product/shared-vfs-contract.md`, `npm run check:product-experience-browser-smoke` | Uses browser-local storage and current demo path mapping, not production cloud sync or multi-user storage. | Keep Desktop/SEIS Code/Terminal/Mythic export visibility covered and add browser-restart persistence tests. |
| Terminal | Browser-smoked foundation | `apps/web/seis-code.js`, `npm run check:seis-code`, `npm run check:product-experience-browser-smoke` | Browser-local terminal UI, not host OS execution. | Keep terminal/VFS smoke passing and expand command coverage as the desktop shell grows. |
| Claude-style REPL | Browser-smoked Local Demo foundation | `apps/web/seis-code.js`, `npm run check:seis-code`, `npm run check:product-experience-browser-smoke` | No backend AI gateway exists, so responses are Local Demo only. | Keep Local Demo honest until provider registry exists. |
| REPL tool calls | Browser-smoked Local Demo foundation | `apps/web/seis-code.js`, `npm run check:seis-code`, `npm run check:product-experience-browser-smoke` | Tools are constrained to the browser virtual file system. Broad destructive actions are cancelled by local policy. | Keep the advertised `/tools` registry aligned with executable local tool handlers. |

## Rules / Policy

- Do not claim host OS execution from the browser.
- Browser terminal commands must operate only on the virtual file system.
- Destructive file operations require confirmation and path validation.
- Live AI requires backend-only provider routing.
- Local Demo must be labeled Local Demo.
- Non-Anthropic output must not be labeled Claude.

## Evidence Requirements

SEIS Code can move beyond browser foundation only after:

- Monaco is integrated.
- File create/edit/save/read persists across route reload.
- Terminal commands operate on the same virtual files.
- Source Control actions are real within a simulated or approved adapter.
- Mobile layout is usable.
- E2E or smoke tests cover core paths.
- AI provider identity remains truthful in Claude-style REPL fallback.
- The Claude-style Local Demo REPL tool registry stays executable for
  file-list/read/create/write/append/patch/rename/move/delete/search/metadata,
  virtual-command, open-in-editor, and diff actions, with visible state labels.

## Related Documents

- [command-center-foundation.md](command-center-foundation.md)
- [shared-vfs-contract.md](shared-vfs-contract.md)
- [../reviews/PRODUCT_EXPERIENCE_BROWSER_SMOKE.md](../reviews/PRODUCT_EXPERIENCE_BROWSER_SMOKE.md)
- [../ai/seis-ai-core.md](../ai/seis-ai-core.md)
- [../architecture/seis-platform-lanes.md](../architecture/seis-platform-lanes.md)

## Next Safe Action

Extend browser interaction tests for Monaco/fallback editing, source-control
simulation, extension toggles, browser-restart persistence, and broader mobile
layout flows beyond the current smoke.
