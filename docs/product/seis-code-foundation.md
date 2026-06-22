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
| Web app surface | Browser foundation | `apps/web/seis-code.html`, `apps/web/seis-code.js`, `apps/web/seis-code.css` | No browser screenshot or Playwright QA yet. | Add interaction smoke tests. |
| Monaco and fallback editor | Browser foundation | `apps/web/seis-code.html`, `apps/web/seis-code.js` | Monaco loads from CDN; offline fallback is textarea. | Add offline/no-CDN test. |
| Virtual file system | Browser foundation | `apps/web/seis-code.js` | Uses native IndexedDB, not a shared OS-wide VFS yet. | Connect future desktop/files surfaces to the same store. |
| Terminal | Browser foundation | `apps/web/seis-code.js`, `npm run check:seis-code` | Not xterm.js and not host OS execution. | Add browser interaction tests for terminal commands. |
| Claude-style REPL | Local Demo foundation | `apps/web/seis-code.js`, `npm run check:seis-code` | No backend AI gateway exists. | Keep Local Demo honest until provider registry exists. |

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
- File create/edit/save/read persists across refresh.
- Terminal commands operate on the same virtual files.
- Source Control actions are real within a simulated or approved adapter.
- Mobile layout is usable.
- E2E tests cover core paths.
- AI provider identity remains truthful in Claude-style REPL fallback.

## Related Documents

- [command-center-foundation.md](command-center-foundation.md)
- [../ai/seis-ai-core.md](../ai/seis-ai-core.md)
- [../architecture/seis-platform-lanes.md](../architecture/seis-platform-lanes.md)

## Next Safe Action

Add browser interaction tests for file creation, Monaco/fallback editing,
terminal commands, Local Demo REPL slash commands, source-control simulation,
extension toggles, refresh persistence, and mobile layout.
