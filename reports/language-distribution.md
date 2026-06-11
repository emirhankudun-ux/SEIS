# SEIS Language Distribution

- Mode: `github_linguist_aligned_source_budget`
- Counted files: 2360
- Counted bytes: 121455497
- JavaScript: 589266 bytes (0.49%)
- Target JavaScript: 10.0%
- Target status: `met`
- Additional non-JavaScript bytes needed for strict target: 0

## Counted Languages

| Language | Bytes | Percent |
| --- | ---: | ---: |
| Other | 119673815 | 98.53% |
| JavaScript | 589266 | 0.49% |
| JSON | 549695 | 0.45% |
| Python | 199520 | 0.16% |
| YAML | 121797 | 0.1% |
| D | 107676 | 0.09% |
| CSS | 38723 | 0.03% |
| Swift | 29623 | 0.02% |
| HTML | 25498 | 0.02% |
| Shell | 24461 | 0.02% |
| C | 22458 | 0.02% |
| SQL | 4506 | 0.0% |
| Go | 4135 | 0.0% |
| C# | 2731 | 0.0% |
| TOML | 2614 | 0.0% |
| Rust | 2574 | 0.0% |
| TypeScript | 2272 | 0.0% |
| PowerShell | 2176 | 0.0% |
| C++ | 1701 | 0.0% |
| PHP | 1695 | 0.0% |
| F# | 1592 | 0.0% |
| Perl | 1340 | 0.0% |
| CUE | 1307 | 0.0% |
| Rego | 1299 | 0.0% |

## Largest JavaScript Files Still Counted

| Path | Bytes |
| --- | ---: |
| `apps/web/app.js` | 41757 |
| `scripts/check-cloud-environment.cjs` | 31107 |
| `scripts/sync-plugin-environment-sources.cjs` | 26659 |
| `scripts/create-seis-ecosystem-intake.cjs` | 22927 |
| `scripts/create-plugin-capability-lanes.cjs` | 19729 |
| `scripts/automation-refresh-seis-surface.cjs` | 19465 |
| `scripts/third-party-intake-blueprint.mjs` | 17482 |
| `scripts/check-seis-trusted-marketplace-plugin.cjs` | 15405 |
| `scripts/create-ai-release-manifest.cjs` | 12922 |
| `mcp/seis-mcp-server.mjs` | 12808 |
| `scripts/create-fullstack-language-matrix.cjs` | 11446 |
| `scripts/check-llm-orchestration-policy.cjs` | 11006 |

## Linguist Controls

| Pattern | Attribute |
| --- | --- |
| `release/**` | `linguist-generated=true` |
| `reports/**` | `linguist-generated=true` |
| `data/**` | `linguist-generated=true` |
| `content/development/*.json` | `linguist-generated=true` |
| `apps/web/src/i18n/locales.js` | `linguist-generated=true` |
| `SE*S/**` | `linguist-vendored=true` |

## Local Runtime Readiness

| Runtime | Available | Version |
| --- | --- | --- |
| `node` | yes | `v24.16.0` |
| `python3` | yes | `Python 3.9.6` |
| `go` | yes | `go version go1.26.4 darwin/amd64` |
| `rustc` | no | `error: Missing manifest in toolchain 'stable-x86_64-apple-darwin'` |
| `swift` | yes | `Apple Swift version 6.0 (swiftlang-6.0.0.9.10 clang-1600.0.26.2) Target: x86_64-apple-macosx15.0 swift-driver version: 1.115` |
| `javac` | yes | `javac 21.0.11` |
| `dart` | yes | `Dart SDK version: 3.12.1 (stable) (Tue May 26 01:02:21 2026 -0700) on "macos_x64"` |

## Next Migration Order

- Keep generated release, report, data, and local snapshot files out of GitHub Linguist counts.
- Move translation payloads from JavaScript modules into data files after UI fallback testing.
- Promote stable Node automation scripts to Python or Go only when the behavior is covered by checks.
- Keep browser runtime JavaScript focused on interaction code; put contracts in typed or domain-specific languages.
