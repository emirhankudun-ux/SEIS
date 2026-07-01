# SF Symbols Usage

SEIS should use semantic, system-compatible icon names in Apple-native UI.

## Rules

- Prefer a symbol name that describes state or action.
- Keep icon meanings consistent across web documentation and SwiftUI surfaces.
- Do not require custom copyrighted Apple assets in the repository.
- Do not use icons as decoration when text hierarchy is clearer.

## Suggested Semantic Groups

| Concept | Symbol Direction |
| --- | --- |
| Command Center | `rectangle.grid.2x2` / `command` |
| SEIS Brain | `brain` / `doc.text.magnifyingglass` |
| AI Core | `sparkles` |
| Provider Registry | `server.rack` |
| Model Router | `arrow.triangle.branch` |
| SEIS-SSH | `terminal` / `lock.shield` |
| GitHub/CI | `checkmark.seal` / `arrow.triangle.pull` |
| Public Readiness | `shield.checkered` |
| Warning | `exclamationmark.triangle` |

Symbol availability should be checked in the target OS version before use.
