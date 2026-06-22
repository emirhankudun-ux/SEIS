# SEIS Language Distribution

- Mode: `github_linguist_aligned_source_budget`
- Counted files: 894
- Counted bytes: 5187484
- JavaScript: 1884292 bytes (36.32%)
- Target JavaScript: 21.0%
- Target status: `above_target`
- Additional non-JavaScript bytes needed for strict target: 3785335

## GitHub Language Panel Split

| Panel | Bytes | Percent | Source languages |
| --- | ---: | ---: | --- |
| JavaScript | 1884292 | 36.32% | JavaScript |
| TypeScript | 411787 | 7.94% | TypeScript |
| Objective-C | 8447 | 0.16% | Objective-C |
| Other | 2882958 | 55.58% | ABAP, AWK, Ada, AppleScript, Avro, Batchfile, Bicep, C, C#, C++, CEL, CMake, +81 more |

## GitHub Language Balance Targets

- Mode: `multi_platform_real_source_balance`
- Status: `needs_real_platform_work`
- No-filler policy: Do not add filler code only to change GitHub language percentages. Every language must serve a real SEIS purpose.

| Platform family | Current | Target | Status | Source languages |
| --- | ---: | ---: | --- | --- |
| Apple / Swift ecosystem | 11.25% | 25.0-30.0% | `below_target` | Swift, Objective-C, AppleScript |
| AI, Data, Python, SQL | 28.68% | 18.0-22.0% | `above_target` | Python, SQL, R, Julia, Scala, JSON, JSON-LD, Turtle, SPARQL |
| TypeScript / JavaScript tooling | 44.26% | 15.0-20.0% | `above_target` | TypeScript, JavaScript |
| Android / JVM | 0.46% | 10.0-15.0% | `below_target` | Kotlin, Java, Groovy, Clojure |
| Rust / C / C++ systems | 0.57% | 10.0-15.0% | `below_target` | Rust, C, C++, Zig |
| Go / Infrastructure | 3.11% | 5.0-8.0% | `below_target` | Go, Shell, YAML, HCL, TOML, Bicep, Nix, CUE, Rego, Dockerfile |
| Windows / .NET | 0.15% | 5.0-8.0% | `below_target` | C#, F#, Visual Basic, PowerShell |
| HTML / CSS previews | 8.37% | 0.0-3.0% | `above_target` | HTML, CSS |

Unassigned counted languages: 3.15% (ABAP, AWK, Ada, Avro, Batchfile, CEL, CMake, COBOL, Cairo, Common Lisp, Crystal, D, +46 more).

## Counted Languages

| Language | Bytes | Percent |
| --- | ---: | ---: |
| JavaScript | 1884292 | 36.32% |
| JSON | 961615 | 18.54% |
| Swift | 574078 | 11.07% |
| Python | 507341 | 9.78% |
| TypeScript | 411787 | 7.94% |
| CSS | 288915 | 5.57% |
| HTML | 145026 | 2.8% |
| Shell | 97083 | 1.87% |
| Other | 41564 | 0.8% |
| YAML | 39110 | 0.75% |
| Go | 16806 | 0.32% |
| Java | 16392 | 0.32% |
| Scheme | 15747 | 0.3% |
| Perl | 13916 | 0.27% |
| Ruby | 13677 | 0.26% |
| Rust | 12286 | 0.24% |
| C++ | 11206 | 0.22% |
| PHP | 8768 | 0.17% |
| SQL | 8752 | 0.17% |
| Objective-C | 8447 | 0.16% |
| R | 7953 | 0.15% |
| OCaml | 7550 | 0.15% |
| Tcl | 7290 | 0.14% |
| Racket | 7245 | 0.14% |

## Largest JavaScript Files Still Counted

| Path | Bytes |
| --- | ---: |
| `emirhan-kudun-portfolio/apps/uix-web/src/i18n/locales.js` | 105051 |
| `emirhan-kudun-portfolio/packages/content/src/uix-static/locales.js` | 105051 |
| `apps/web/script.js` | 79540 |
| `apps/seis-core/ai-core-contract-fixture.js` | 49999 |
| `scripts/check-seis-master-prompt.mjs` | 42025 |
| `apps/web/app.js` | 41632 |
| `apps/seis-core/script.js` | 37907 |
| `scripts/check-cloud-environment.cjs` | 31248 |
| `scripts/sync-plugin-environment-sources.cjs` | 27637 |
| `packages/seis-ai/test/checks.test.mjs` | 25298 |
| `scripts/create-seis-ecosystem-intake.cjs` | 25262 |
| `packages/seis-ai/src/lib/checks.mjs` | 24228 |

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
