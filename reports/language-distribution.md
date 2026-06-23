# SEIS Language Distribution

- Mode: `github_linguist_aligned_source_budget`
- Counted files: 993
- Counted bytes: 6129656
- JavaScript: 2501212 bytes (40.81%)
- Target JavaScript: 21.0%
- Target status: `above_target`
- Additional non-JavaScript bytes needed for strict target: 5780877

## GitHub Language Panel Split

| Panel | Bytes | Percent | Source languages |
| --- | ---: | ---: | --- |
| JavaScript | 2501212 | 40.81% | JavaScript |
| TypeScript | 424439 | 6.92% | TypeScript |
| Objective-C | 8447 | 0.14% | Objective-C |
| Other | 3195558 | 52.13% | ABAP, AWK, Ada, AppleScript, Avro, Batchfile, Bicep, C, C#, C++, CEL, CMake, +81 more |

## GitHub Language Balance Targets

- Mode: `multi_platform_real_source_balance`
- Status: `needs_real_platform_work`
- No-filler policy: Do not add filler code only to change GitHub language percentages. Every language must serve a real SEIS purpose.

| Platform family | Current | Target | Status | Source languages |
| --- | ---: | ---: | --- | --- |
| Apple / Swift ecosystem | 9.52% | 25.0-30.0% | `below_target` | Swift, Objective-C, AppleScript |
| AI, Data, Python, SQL | 28.19% | 18.0-22.0% | `above_target` | Python, SQL, R, Julia, Scala, JSON, JSON-LD, Turtle, SPARQL |
| TypeScript / JavaScript tooling | 47.73% | 15.0-20.0% | `above_target` | TypeScript, JavaScript |
| Android / JVM | 0.39% | 10.0-15.0% | `below_target` | Kotlin, Java, Groovy, Clojure |
| Rust / C / C++ systems | 0.48% | 10.0-15.0% | `below_target` | Rust, C, C++, Zig |
| Go / Infrastructure | 2.77% | 5.0-8.0% | `below_target` | Go, Shell, YAML, HCL, TOML, Bicep, Nix, CUE, Rego, Dockerfile |
| Windows / .NET | 0.13% | 5.0-8.0% | `below_target` | C#, F#, Visual Basic, PowerShell |
| HTML / CSS previews | 8.07% | 0.0-3.0% | `above_target` | HTML, CSS |

Unassigned counted languages: 2.72% (ABAP, AWK, Ada, Avro, Batchfile, CEL, CMake, COBOL, Cairo, Common Lisp, Crystal, D, +46 more).

## Counted Languages

| Language | Bytes | Percent |
| --- | ---: | ---: |
| JavaScript | 2501212 | 40.81% |
| JSON | 1195183 | 19.5% |
| Swift | 574078 | 9.37% |
| Python | 513979 | 8.39% |
| TypeScript | 424439 | 6.92% |
| CSS | 327039 | 5.34% |
| HTML | 167732 | 2.74% |
| Shell | 98334 | 1.6% |
| YAML | 45394 | 0.74% |
| Other | 44950 | 0.73% |
| Go | 16806 | 0.27% |
| Java | 16392 | 0.27% |
| Scheme | 15747 | 0.26% |
| Perl | 13916 | 0.23% |
| Ruby | 13677 | 0.22% |
| Rust | 12286 | 0.2% |
| C++ | 11206 | 0.18% |
| PHP | 8768 | 0.14% |
| SQL | 8752 | 0.14% |
| Objective-C | 8447 | 0.14% |
| R | 7953 | 0.13% |
| OCaml | 7550 | 0.12% |
| Tcl | 7290 | 0.12% |
| Racket | 7245 | 0.12% |

## Largest JavaScript Files Still Counted

| Path | Bytes |
| --- | ---: |
| `apps/seis-core/script.js` | 106517 |
| `emirhan-kudun-portfolio/apps/uix-web/src/i18n/locales.js` | 105051 |
| `emirhan-kudun-portfolio/packages/content/src/uix-static/locales.js` | 105051 |
| `apps/web/script.js` | 79540 |
| `apps/seis-core/ai-core-contract-fixture.js` | 61467 |
| `apps/seis-demo-web/script.js` | 51680 |
| `scripts/check-seis-master-prompt.mjs` | 42025 |
| `apps/web/app.js` | 41632 |
| `scripts/check-cloud-environment.cjs` | 32438 |
| `scripts/sync-plugin-environment-sources.cjs` | 28889 |
| `scripts/create-seis-ecosystem-intake.cjs` | 28555 |
| `scripts/check-ai-core-app-contracts.mjs` | 25592 |

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
