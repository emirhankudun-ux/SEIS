# SEIS Language Distribution

- Mode: `github_linguist_aligned_source_budget`
- Counted files: 991
- Counted bytes: 7816547
- JavaScript: 2632551 bytes (33.68%)
- Target JavaScript: 21.0%
- Target status: `above_target`
- Additional non-JavaScript bytes needed for strict target: 4719410

## GitHub Language Panel Split

| Panel | Bytes | Percent | Source languages |
| --- | ---: | ---: | --- |
| JavaScript | 2632551 | 33.68% | JavaScript |
| TypeScript | 424439 | 5.43% | TypeScript |
| Objective-C | 8447 | 0.11% | Objective-C |
| Other | 4751110 | 60.78% | ABAP, AWK, Ada, AppleScript, Avro, Batchfile, Bicep, C, C#, C++, CEL, CMake, +81 more |

## GitHub Language Balance Targets

- Mode: `multi_platform_real_source_balance`
- Status: `needs_real_platform_work`
- No-filler policy: Do not add filler code only to change GitHub language percentages. Every language must serve a real SEIS purpose.

| Platform family | Current | Target | Status | Source languages |
| --- | ---: | ---: | --- | --- |
| Apple / Swift ecosystem | 7.46% | 25.0-30.0% | `below_target` | Swift, Objective-C, AppleScript |
| AI, Data, Python, SQL | 40.43% | 18.0-22.0% | `above_target` | Python, SQL, R, Julia, Scala, JSON, JSON-LD, Turtle, SPARQL |
| TypeScript / JavaScript tooling | 39.11% | 15.0-20.0% | `above_target` | TypeScript, JavaScript |
| Android / JVM | 0.3% | 10.0-15.0% | `below_target` | Kotlin, Java, Groovy, Clojure |
| Rust / C / C++ systems | 0.38% | 10.0-15.0% | `below_target` | Rust, C, C++, Zig |
| Go / Infrastructure | 2.17% | 5.0-8.0% | `below_target` | Go, Shell, YAML, HCL, TOML, Bicep, Nix, CUE, Rego, Dockerfile |
| Windows / .NET | 0.1% | 5.0-8.0% | `below_target` | C#, F#, Visual Basic, PowerShell |
| HTML / CSS previews | 7.91% | 0.0-3.0% | `above_target` | HTML, CSS |

Unassigned counted languages: 2.12% (ABAP, AWK, Ada, Avro, Batchfile, CEL, CMake, COBOL, Cairo, Common Lisp, Crystal, D, +46 more).

## Counted Languages

| Language | Bytes | Percent |
| --- | ---: | ---: |
| JavaScript | 2632551 | 33.68% |
| JSON | 2627599 | 33.62% |
| Swift | 574078 | 7.34% |
| Python | 513980 | 6.58% |
| TypeScript | 424439 | 5.43% |
| CSS | 365496 | 4.68% |
| HTML | 252896 | 3.24% |
| Shell | 98373 | 1.26% |
| YAML | 45668 | 0.58% |
| Other | 43396 | 0.56% |
| Go | 16806 | 0.22% |
| Java | 16392 | 0.21% |
| Scheme | 15747 | 0.2% |
| Perl | 13916 | 0.18% |
| Ruby | 13677 | 0.17% |
| Rust | 12286 | 0.16% |
| C++ | 11206 | 0.14% |
| PHP | 8768 | 0.11% |
| SQL | 8752 | 0.11% |
| Objective-C | 8447 | 0.11% |
| R | 7953 | 0.1% |
| OCaml | 7550 | 0.1% |
| Tcl | 7290 | 0.09% |
| Racket | 7245 | 0.09% |

## Largest JavaScript Files Still Counted

| Path | Bytes |
| --- | ---: |
| `emirhan-kudun-portfolio/apps/uix-web/src/i18n/locales.js` | 105051 |
| `emirhan-kudun-portfolio/packages/content/src/uix-static/locales.js` | 105051 |
| `apps/seis-core/script.js` | 94536 |
| `apps/web/script.js` | 79540 |
| `apps/web/seis-code.js` | 65822 |
| `apps/web/app.js` | 61634 |
| `apps/seis-demo-web/script.js` | 51680 |
| `scripts/check-seis-master-prompt.mjs` | 42025 |
| `scripts/check-goal-tracking.mjs` | 39914 |
| `scripts/create-goal-command-center-view.mjs` | 36966 |
| `scripts/check-cloud-environment.cjs` | 32438 |
| `apps/web/mythic-gacha.js` | 29955 |

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
