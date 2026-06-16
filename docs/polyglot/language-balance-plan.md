# SEIS Language Balance Plan

## Target

SEIS should move toward a GitHub language surface where JavaScript is about 10% and the rest of the repository is carried by product-appropriate languages, schemas, policies, and runtime contracts.

## Current Rule

Generated or local-only surfaces must not distort the language bar:

- release outputs
- reports
- generated development JSON contracts
- local imported SEIS snapshots
- large static translation payloads that behave as data, not application logic

The active policy lives in `.gitattributes` and is checked by:

```bash
npm run check:language-distribution
```

## Command

```bash
npm run automation:language-distribution
```

The command writes:

- `reports/language-distribution.json`
- `reports/language-distribution.md`

## Migration Order

1. Keep GitHub Linguist focused on source, not generated release/report/snapshot files.
2. Move translation payloads from JavaScript modules into data files after UI fallback checks are added.
3. Promote stable Node automation scripts to Python or Go only when behavior is protected by checks.
4. Keep browser JavaScript for real interaction logic; put contracts, policies, schemas, and platform bridges in the language that owns the domain.
5. Keep Apple-native work in Swift, SwiftUI, Objective-C, and AppleScript surfaces.
6. Keep Windows work in primary Windows development families before adding new runtimes: .NET, PowerShell, Batch, native C++, Rust, Go, Python, JVM, SQL, R, Lua, Ruby, and PHP.

## Install Policy

Do not download heavy language runtimes just to change a percentage. First use installed runtimes, then add a runtime only when the repo has a real build, test, deploy, or product reason for it.

## Native / Polyglot 2026-06-11 Addendum

- Apple-only Apple platform work should use Swift, SwiftUI, Objective-C, Objective-C++, AppleScript, Metal Shading Language, and Apple platform metadata before considering cross-platform runtimes.
- Android and Windows lanes should prefer their own non-Apple language families: Kotlin, Java, C#, F#, PowerShell, Batch, C++, Rust, Go, SQL, YAML, TOML, JSON Schema, Rego, and CUE.
- AI/Agent/MCP/Skills/Plugin/LLM decisions should be captured as contracts, records, and governance docs before runtime code expands.
- This direction does not require new JavaScript or Python code; existing validation scripts can still verify documentation and policy integrity.
