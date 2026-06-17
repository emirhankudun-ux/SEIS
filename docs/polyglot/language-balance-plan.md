# SEIS Language Balance Plan

## Target

SEIS should move toward a GitHub language surface that reads as a balanced
multi-platform engineering ecosystem, not a website-only repository.

| Platform family | Target |
|---|---:|
| Apple / Swift ecosystem | 25-30% |
| AI, Data, Python, SQL | 18-22% |
| TypeScript / JavaScript tooling | 15-20% |
| Android / JVM | 10-15% |
| Rust / C / C++ systems | 10-15% |
| Go / Infrastructure | 5-8% |
| Windows / .NET | 5-8% |
| HTML / CSS previews | 0-3% |

Do not add filler code only to change language percentages. Every language must
serve a real SEIS purpose: product capability, platform integration, automation,
security, data, design systems, documentation generation, validation, or
governance.

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

## GitHub Language Balance Report

`reports/language-distribution.md` now includes a GitHub Language Balance
Targets section. It reports current percentages, target ranges, and whether each
platform family is below, within, or above target. A gap is not permission to
write placeholder code; it is a roadmap signal for real platform work.

## Migration Order

1. Keep GitHub Linguist focused on source, not generated release/report/snapshot files.
2. Move translation payloads from JavaScript modules into data files after UI fallback checks are added.
3. Promote stable Node automation scripts to Python or Go only when behavior is protected by checks.
4. Grow Swift and Apple-native surfaces through real SEIS app, package, design-system, CloudKit, or platform policy work.
5. Grow Android/JVM, Rust/C/C++, Go/infrastructure, and Windows/.NET through real build, test, deployment, security, or platform contracts.
6. Keep browser JavaScript for real interaction logic; put contracts, policies, schemas, and platform bridges in the language that owns the domain.

## Install Policy

Do not download heavy language runtimes just to change a percentage. First use installed runtimes, then add a runtime only when the repo has a real build, test, deploy, or product reason for it.
