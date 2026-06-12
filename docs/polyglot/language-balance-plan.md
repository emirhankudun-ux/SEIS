# SEIS Language Balance Plan

## Target

SEIS should move toward a GitHub language surface where JavaScript is about 21% and the rest of the repository is carried by product-appropriate languages, schemas, policies, and runtime contracts.

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

## Focused GitHub Panel Split

The GitHub-facing language split keeps `JavaScript`, `TypeScript`, and
`Objective-C` as explicit panels. `Other` is calculated as every remaining
counted language only, so it excludes those three focused languages.

## Migration Order

1. Keep GitHub Linguist focused on source, not generated release/report/snapshot files.
2. Move translation payloads from JavaScript modules into data files after UI fallback checks are added.
3. Promote stable Node automation scripts to Python or Go only when behavior is protected by checks.
4. Keep browser JavaScript for real interaction logic; put contracts, policies, schemas, and platform bridges in the language that owns the domain.
5. Keep Apple-native work in Swift, SwiftUI, Objective-C, and AppleScript surfaces.
6. Keep Windows work in primary Windows development families before adding new runtimes: .NET, PowerShell, Batch, native C++, Rust, Go, Python, JVM, SQL, R, Lua, Ruby, and PHP.

## Install Policy

Do not download heavy language runtimes just to change a percentage. First use installed runtimes, then add a runtime only when the repo has a real build, test, deploy, or product reason for it.
