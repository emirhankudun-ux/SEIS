# SEIS Language Distribution

- Mode: `github_linguist_aligned_source_budget`
- Counted files: 904
- Counted bytes: 5392008
- JavaScript: 2026326 bytes (37.58%)
- Target JavaScript: 21.0%
- Target status: `above_target`
- Additional non-JavaScript bytes needed for strict target: 4257163

## GitHub Language Panel Split

| Panel | Bytes | Percent | Source languages |
| --- | ---: | ---: | --- |
| JavaScript | 2026326 | 37.58% | JavaScript |
| TypeScript | 411787 | 7.64% | TypeScript |
| Objective-C | 8447 | 0.16% | Objective-C |
| Other | 2945448 | 54.63% | ABAP, AWK, Ada, AppleScript, Avro, Batchfile, Bicep, C, C#, C++, CEL, CMake, +81 more |

## GitHub Language Balance Targets

- Mode: `multi_platform_real_source_balance`
- Status: `needs_real_platform_work`
- No-filler policy: Do not add filler code only to change GitHub language percentages. Every language must serve a real SEIS purpose.

| Platform family | Current | Target | Status | Source languages |
| --- | ---: | ---: | --- | --- |
| Apple / Swift ecosystem | 10.82% | 25.0-30.0% | `below_target` | Swift, Objective-C, AppleScript |
| AI, Data, Python, SQL | 28.66% | 18.0-22.0% | `above_target` | Python, SQL, R, Julia, Scala, JSON, JSON-LD, Turtle, SPARQL |
| TypeScript / JavaScript tooling | 45.22% | 15.0-20.0% | `above_target` | TypeScript, JavaScript |
| Android / JVM | 0.44% | 10.0-15.0% | `below_target` | Kotlin, Java, Groovy, Clojure |
| Rust / C / C++ systems | 0.55% | 10.0-15.0% | `below_target` | Rust, C, C++, Zig |
| Go / Infrastructure | 3.02% | 5.0-8.0% | `below_target` | Go, Shell, YAML, HCL, TOML, Bicep, Nix, CUE, Rego, Dockerfile |
| Windows / .NET | 0.15% | 5.0-8.0% | `below_target` | C#, F#, Visual Basic, PowerShell |
| HTML / CSS previews | 8.12% | 0.0-3.0% | `above_target` | HTML, CSS |

Unassigned counted languages: 3.03% (ABAP, AWK, Ada, Avro, Batchfile, CEL, CMake, COBOL, Cairo, Common Lisp, Crystal, D, +46 more).

## Counted Languages

| Language | Bytes | Percent |
| --- | ---: | ---: |
| JavaScript | 2026326 | 37.58% |
| JSON | 1018868 | 18.9% |
| Swift | 574078 | 10.65% |
| Python | 507341 | 9.41% |
| TypeScript | 411787 | 7.64% |
| CSS | 290352 | 5.38% |
| HTML | 147620 | 2.74% |
| Shell | 97083 | 1.8% |
| Other | 41564 | 0.77% |
| YAML | 40316 | 0.75% |
| Go | 16806 | 0.31% |
| Java | 16392 | 0.3% |
| Scheme | 15747 | 0.29% |
| Perl | 13916 | 0.26% |
| Ruby | 13677 | 0.25% |
| Rust | 12286 | 0.23% |
| C++ | 11206 | 0.21% |
| PHP | 8768 | 0.16% |
| SQL | 8752 | 0.16% |
| Objective-C | 8447 | 0.16% |
| R | 7953 | 0.15% |
| OCaml | 7550 | 0.14% |
| Tcl | 7290 | 0.14% |
| Racket | 7245 | 0.13% |

## Largest JavaScript Files Still Counted

| Path | Bytes |
| --- | ---: |
| `emirhan-kudun-portfolio/apps/uix-web/src/i18n/locales.js` | 105051 |
| `emirhan-kudun-portfolio/packages/content/src/uix-static/locales.js` | 105051 |
| `apps/web/script.js` | 79540 |
| `apps/seis-core/ai-core-contract-fixture.js` | 61467 |
| `apps/seis-core/script.js` | 44665 |
| `scripts/check-seis-master-prompt.mjs` | 42025 |
| `apps/web/app.js` | 41632 |
| `scripts/check-cloud-environment.cjs` | 31248 |
| `scripts/create-ai-core-fixture-evaluation-report.mjs` | 28303 |
| `scripts/sync-plugin-environment-sources.cjs` | 27637 |
| `scripts/check-ai-core-app-contracts.mjs` | 25592 |
| `packages/seis-ai/test/checks.test.mjs` | 25298 |

## Linguist Controls

| Pattern | Attribute |
| --- | --- |
| `release/**` | `linguist-generated=true` |
| `reports/**` | `linguist-generated=true` |
| `data/**` | `linguist-generated=true` |
| `content/development/*.json` | `linguist-generated=true` |
| `apps/web/src/i18n/locales.js` | `linguist-generated=true` |
| `SE*S/**` | `linguist-vendored=true` |
| `SEIS*/**` | `linguist-vendored=true` |
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
| `swift` | yes | `detected; package tests handle configured toolchain readiness` |
| `javac` | yes | `javac 21.0.11` |
| `dart` | no | `$HOME/Developer/flutter/bin/internal/shared.sh: line 122: $HOME/Developer/flutter/bin/internal/update_engine_version.sh: No such file or directory` |

## Next Migration Order

- Keep generated release, report, data, and local snapshot files out of GitHub Linguist counts.
- Move translation payloads from JavaScript modules into data files after UI fallback testing.
- Keep JavaScript, TypeScript, and Objective-C as separate language panels; Other is every remaining language only.
- Promote stable Node automation scripts to Python or Go only when the behavior is covered by checks.
- Grow Apple, Android, systems, Go/infrastructure, and Windows lanes through real SEIS features, not filler language-percentage code.
- Keep browser runtime JavaScript focused on interaction code; put contracts in typed or domain-specific languages.
