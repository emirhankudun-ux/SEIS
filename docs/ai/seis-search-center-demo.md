# SEIS Search Center Demo

This document describes the browser-local SEIS Search Center route added for the SEIS Core demo surface.

## Demo route

Open the static route from the SEIS Core app folder:

```text
apps/seis-core/search-center.html
```

The route is zero-key and browser-local. It does not request live web search, provider APIs, or filesystem access.

## What works now

- Connected search tabs for: AI, Web, Code, Design, Cloud, Apps, Plugins, Files.
- Query filtering with real-time in-memory filtering.
- Keyboard support with `Cmd/Ctrl + K` to focus search.
- Command chips for common demo searches.
- Result list with deterministic tabs and selected item preview.
- Session persistence in localStorage.
- Clear mock/real/planned/blocked labels per result.
- Runtime contract block showing explicit safety flags.

## Mock vs real status

| Surface | Status | Notes |
| --- | --- | --- |
| Query parsing and filtering | Real browser-local | Runs fully in browser JavaScript. |
| Result preview panel | Real browser-local | Shows metadata and local action labels. |
| Result dataset | Mock | Deterministic seeded result cards only. |
| Live web search | Blocked | `liveWebSearch: false` by design. |
| Provider calls | Blocked | `providerCalled: false` by design. |
| Filesystem read | Blocked | `filesystemRead: false` by design. |

## Runtime contract

The demo keeps these flags false by design:

```text
networkRequested: false
liveWebSearch: false
providerCalled: false
filesystemRead: false
```

The state also persists under this local storage key:

```text
seis.search.center.v1
```

## Validation

Static validation for this module is in:

```text
apps/seis-core/test/seis-search-center-static.test.js
```

Run it with:

```bash
node --test apps/seis-core/test/seis-search-center-static.test.js
```
