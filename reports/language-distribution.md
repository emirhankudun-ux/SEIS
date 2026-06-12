# SEIS Language Distribution

- Mode: `github_linguist_aligned_source_budget`
- Counted files: 528
- Counted bytes: 2329132
- JavaScript: 797688 bytes (34.25%)
- Target JavaScript: 10.0%
- Target status: `above_target`
- Additional non-JavaScript bytes needed for strict target: 5647748

## GitHub Language Panel Split

| Panel | Bytes | Percent | Source languages |
| --- | ---: | ---: | --- |
| JavaScript | 797688 | 34.25% | JavaScript |
| TypeScript | 28824 | 1.24% | TypeScript |
| Objective-C | 8447 | 0.36% | Objective-C |
| Other | 1494173 | 64.15% | ABAP, AWK, Ada, AppleScript, Avro, Batchfile, Bicep, C, C#, C++, CEL, CMake, +81 more |

## Counted Languages

| Language | Bytes | Percent |
| --- | ---: | ---: |
| JavaScript | 797688 | 34.25% |
| JSON | 634690 | 27.25% |
| Python | 238033 | 10.22% |
| Swift | 100216 | 4.3% |
| CSS | 94204 | 4.04% |
| HTML | 84633 | 3.63% |
| Shell | 56789 | 2.44% |
| Other | 37135 | 1.59% |
| TypeScript | 28824 | 1.24% |
| YAML | 25243 | 1.08% |
| Go | 16367 | 0.7% |
| Java | 16110 | 0.69% |
| Scheme | 15747 | 0.68% |
| Perl | 13916 | 0.6% |
| Ruby | 13442 | 0.58% |
| Rust | 11825 | 0.51% |
| C++ | 11206 | 0.48% |
| PHP | 8471 | 0.36% |
| Objective-C | 8447 | 0.36% |
| SQL | 8177 | 0.35% |
| R | 7953 | 0.34% |
| OCaml | 7550 | 0.32% |
| Tcl | 7290 | 0.31% |
| Racket | 7245 | 0.31% |

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
| `scripts/create-plugin-capability-lanes.cjs` | 19783 |
| `scripts/automation-refresh-seis-surface.cjs` | 19465 |
| `scripts/third-party-intake-blueprint.mjs` | 17482 |
| `packages/seis-ai/test/agent.test.mjs` | 15977 |
| `scripts/check-seis-trusted-marketplace-plugin.cjs` | 15405 |

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
