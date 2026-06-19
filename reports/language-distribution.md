# SEIS Language Distribution

- Mode: `github_linguist_aligned_source_budget`
- Counted files: 934
- Counted bytes: 5527697
- JavaScript: 2214086 bytes (40.05%)
- Target JavaScript: 21.0%
- Target status: `above_target`
- Additional non-JavaScript bytes needed for strict target: 5015569

## GitHub Language Panel Split

| Panel | Bytes | Percent | Source languages |
| --- | ---: | ---: | --- |
| JavaScript | 2214086 | 40.05% | JavaScript |
| TypeScript | 424439 | 7.68% | TypeScript |
| Objective-C | 8447 | 0.15% | Objective-C |
| Other | 2880725 | 52.11% | ABAP, AWK, Ada, AppleScript, Avro, Batchfile, Bicep, C, C#, C++, CEL, CMake, +81 more |

## GitHub Language Balance Targets

- Mode: `multi_platform_real_source_balance`
- Status: `needs_real_platform_work`
- No-filler policy: Do not add filler code only to change GitHub language percentages. Every language must serve a real SEIS purpose.

| Platform family | Current | Target | Status | Source languages |
| --- | ---: | ---: | --- | --- |
| Apple / Swift ecosystem | 10.55% | 25.0-30.0% | `below_target` | Swift, Objective-C, AppleScript |
| AI, Data, Python, SQL | 25.87% | 18.0-22.0% | `above_target` | Python, SQL, R, Julia, Scala, JSON, JSON-LD, Turtle, SPARQL |
| TypeScript / JavaScript tooling | 47.73% | 15.0-20.0% | `above_target` | TypeScript, JavaScript |
| Android / JVM | 0.43% | 10.0-15.0% | `below_target` | Kotlin, Java, Groovy, Clojure |
| Rust / C / C++ systems | 0.54% | 10.0-15.0% | `below_target` | Rust, C, C++, Zig |
| Go / Infrastructure | 3.02% | 5.0-8.0% | `below_target` | Go, Shell, YAML, HCL, TOML, Bicep, Nix, CUE, Rego, Dockerfile |
| Windows / .NET | 0.14% | 5.0-8.0% | `below_target` | C#, F#, Visual Basic, PowerShell |
| HTML / CSS previews | 8.73% | 0.0-3.0% | `above_target` | HTML, CSS |

Unassigned counted languages: 2.98% (ABAP, AWK, Ada, Avro, Batchfile, CEL, CMake, COBOL, Cairo, Common Lisp, Crystal, D, +46 more).

## Counted Languages

| Language | Bytes | Percent |
| --- | ---: | ---: |
| JavaScript | 2214086 | 40.05% |
| JSON | 904099 | 16.36% |
| Swift | 574078 | 10.39% |
| Python | 507065 | 9.17% |
| TypeScript | 424439 | 7.68% |
| CSS | 323104 | 5.85% |
| HTML | 159732 | 2.89% |
| Shell | 97489 | 1.76% |
| YAML | 44523 | 0.81% |
| Other | 42864 | 0.78% |
| Go | 16806 | 0.3% |
| Java | 16392 | 0.3% |
| Scheme | 15747 | 0.28% |
| Perl | 13916 | 0.25% |
| Ruby | 13677 | 0.25% |
| Rust | 12286 | 0.22% |
| C++ | 11206 | 0.2% |
| PHP | 8768 | 0.16% |
| SQL | 8752 | 0.16% |
| Objective-C | 8447 | 0.15% |
| R | 7953 | 0.14% |
| OCaml | 7550 | 0.14% |
| Tcl | 7290 | 0.13% |
| Racket | 7245 | 0.13% |

## Largest JavaScript Files Still Counted

| Path | Bytes |
| --- | ---: |
| `emirhan-kudun-portfolio/apps/uix-web/src/i18n/locales.js` | 105051 |
| `emirhan-kudun-portfolio/packages/content/src/uix-static/locales.js` | 105051 |
| `apps/web/script.js` | 79540 |
| `apps/seis-core/script.js` | 75659 |
| `apps/seis-demo-web/script.js` | 51680 |
| `scripts/check-seis-master-prompt.mjs` | 42025 |
| `apps/web/app.js` | 41632 |
| `scripts/check-cloud-environment.cjs` | 32438 |
| `scripts/sync-plugin-environment-sources.cjs` | 28889 |
| `scripts/create-seis-ecosystem-intake.cjs` | 28555 |
| `packages/seis-ai/test/checks.test.mjs` | 25298 |
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
| `dart` | no | `/Users/emirhankudun/Developer/flutter/bin/internal/shared.sh: line 122: /Users/emirhankudun/Developer/flutter/bin/internal/update_engine_version.sh: No such file or directory` |

## Next Migration Order

- Keep generated release, report, data, and local snapshot files out of GitHub Linguist counts.
- Move translation payloads from JavaScript modules into data files after UI fallback testing.
- Keep JavaScript, TypeScript, and Objective-C as separate language panels; Other is every remaining language only.
- Promote stable Node automation scripts to Python or Go only when the behavior is covered by checks.
- Grow Apple, Android, systems, Go/infrastructure, and Windows lanes through real SEIS features, not filler language-percentage code.
- Keep browser runtime JavaScript focused on interaction code; put contracts in typed or domain-specific languages.
