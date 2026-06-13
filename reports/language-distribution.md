# SEIS Language Distribution

- Mode: `github_linguist_aligned_source_budget`
- Counted files: 561
- Counted bytes: 2623146
- JavaScript: 853443 bytes (32.54%)
- Target JavaScript: 21.0%
- Target status: `above_target`
- Additional non-JavaScript bytes needed for strict target: 1440868

## GitHub Language Panel Split

| Panel | Bytes | Percent | Source languages |
| --- | ---: | ---: | --- |
| JavaScript | 853443 | 32.54% | JavaScript |
| TypeScript | 28824 | 1.1% | TypeScript |
| Objective-C | 8447 | 0.32% | Objective-C |
| Other | 1732432 | 66.04% | ABAP, AWK, Ada, AppleScript, Avro, Batchfile, Bicep, C, C#, C++, CEL, CMake, +81 more |

## Counted Languages

| Language | Bytes | Percent |
| --- | ---: | ---: |
| JavaScript | 853443 | 32.54% |
| JSON | 643334 | 24.53% |
| Python | 300155 | 11.44% |
| Swift | 272088 | 10.37% |
| CSS | 94204 | 3.59% |
| HTML | 84633 | 3.23% |
| Shell | 56789 | 2.16% |
| Other | 30987 | 1.18% |
| TypeScript | 28824 | 1.1% |
| YAML | 27012 | 1.03% |
| Go | 16367 | 0.62% |
| Java | 16110 | 0.61% |
| Scheme | 15747 | 0.6% |
| Perl | 13916 | 0.53% |
| Ruby | 13442 | 0.51% |
| Rust | 11825 | 0.45% |
| C++ | 11206 | 0.43% |
| PHP | 8471 | 0.32% |
| Objective-C | 8447 | 0.32% |
| SQL | 8177 | 0.31% |
| R | 7953 | 0.3% |
| OCaml | 7550 | 0.29% |
| Tcl | 7290 | 0.28% |
| Racket | 7245 | 0.28% |

## Largest JavaScript Files Still Counted

| Path | Bytes |
| --- | ---: |
| `apps/web/script.js` | 78972 |
| `apps/web/app.js` | 41757 |
| `scripts/check-cloud-environment.cjs` | 31107 |
| `scripts/sync-plugin-environment-sources.cjs` | 26659 |
| `packages/seis-ai/test/checks.test.mjs` | 25298 |
| `packages/seis-ai/src/lib/checks.mjs` | 24228 |
| `scripts/create-seis-ecosystem-intake.cjs` | 22927 |
| `mcp/seis-mcp-server.mjs` | 20518 |
| `scripts/create-plugin-capability-lanes.cjs` | 19783 |
| `scripts/automation-refresh-seis-surface.cjs` | 19465 |
| `scripts/third-party-intake-blueprint.mjs` | 17482 |
| `packages/seis-ai/test/agent.test.mjs` | 15977 |

## Linguist Controls

| Pattern | Attribute |
| --- | --- |
| `release/**` | `linguist-generated=true` |
| `reports/**` | `linguist-generated=true` |
| `data/**` | `linguist-generated=true` |
| `content/development/*.json` | `linguist-generated=true` |
| `apps/web/src/i18n/locales.js` | `linguist-generated=true` |
| `SE*S/**` | `linguist-vendored=true` |
| `polyglot/typescript/**` | `linguist-language=TypeScript` |
| `polyglot/react/*.tsx` | `linguist-language=TypeScript` |
| `packages/seis-ai/types/**` | `linguist-language=TypeScript` |
| `polyglot/objective-c/**` | `linguist-language=Objective-C` |

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
- Keep JavaScript, TypeScript, and Objective-C as separate language panels; Other is every remaining language only.
- Promote stable Node automation scripts to Python or Go only when the behavior is covered by checks.
- Keep browser runtime JavaScript focused on interaction code; put contracts in typed or domain-specific languages.
