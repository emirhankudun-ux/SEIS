# SEIS Language Distribution

- Mode: `github_linguist_aligned_source_budget`
- Counted files: 591
- Counted bytes: 2783658
- JavaScript: 970234 bytes (34.85%)
- Target JavaScript: 21.0%
- Target status: `above_target`
- Additional non-JavaScript bytes needed for strict target: 1836503

## GitHub Language Panel Split

| Panel | Bytes | Percent | Source languages |
| --- | ---: | ---: | --- |
| JavaScript | 970234 | 34.85% | JavaScript |
| TypeScript | 28824 | 1.04% | TypeScript |
| Objective-C | 8447 | 0.3% | Objective-C |
| Other | 1776153 | 63.81% | ABAP, AWK, Ada, AppleScript, Avro, Batchfile, Bicep, C, C#, C++, CEL, CMake, +81 more |

## Counted Languages

| Language | Bytes | Percent |
| --- | ---: | ---: |
| JavaScript | 970234 | 34.85% |
| JSON | 667980 | 24.0% |
| Python | 300868 | 10.81% |
| Swift | 278456 | 10.0% |
| CSS | 94204 | 3.38% |
| HTML | 84633 | 3.04% |
| Shell | 66459 | 2.39% |
| Other | 31074 | 1.12% |
| YAML | 28998 | 1.04% |
| TypeScript | 28824 | 1.04% |
| Go | 16367 | 0.59% |
| Java | 16110 | 0.58% |
| Scheme | 15747 | 0.57% |
| Perl | 13916 | 0.5% |
| Ruby | 13442 | 0.48% |
| Rust | 11825 | 0.42% |
| C++ | 11206 | 0.4% |
| PHP | 8471 | 0.3% |
| Objective-C | 8447 | 0.3% |
| SQL | 8177 | 0.29% |
| R | 7953 | 0.29% |
| OCaml | 7550 | 0.27% |
| Tcl | 7290 | 0.26% |
| Racket | 7245 | 0.26% |

## Largest JavaScript Files Still Counted

| Path | Bytes |
| --- | ---: |
| `apps/web/script.js` | 78972 |
| `apps/web/app.js` | 41757 |
| `scripts/check-cloud-environment.cjs` | 31248 |
| `scripts/sync-plugin-environment-sources.cjs` | 27637 |
| `packages/seis-ai/test/checks.test.mjs` | 25298 |
| `scripts/create-seis-ecosystem-intake.cjs` | 25262 |
| `packages/seis-ai/src/lib/checks.mjs` | 24228 |
| `mcp/seis-mcp-server.mjs` | 21799 |
| `scripts/create-plugin-capability-lanes.cjs` | 19783 |
| `scripts/automation-refresh-seis-surface.cjs` | 19465 |
| `scripts/third-party-intake-blueprint.mjs` | 17482 |
| `scripts/check-seis-specialist-plugins.mjs` | 17113 |

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
