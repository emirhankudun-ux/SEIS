# SEIS Language Distribution

- Mode: `github_linguist_aligned_source_budget`
- Counted files: 1292
- Counted bytes: 7208569
- JavaScript: 1913055 bytes (26.54%)
- Target JavaScript: 21.0%
- Target status: `above_target`
- Additional non-JavaScript bytes needed for strict target: 1901216

## GitHub Language Panel Split

| Panel | Bytes | Percent | Source languages |
| --- | ---: | ---: | --- |
| JavaScript | 1913055 | 26.54% | JavaScript |
| TypeScript | 433045 | 6.01% | TypeScript |
| Objective-C | 8447 | 0.12% | Objective-C |
| Other | 4854022 | 67.34% | ABAP, AWK, Ada, AppleScript, Avro, Batchfile, Bicep, C, C#, C++, CEL, CMake, +81 more |

## GitHub Language Balance Targets

- Mode: `multi_platform_real_source_balance`
- Status: `needs_real_platform_work`
- No-filler policy: Do not add filler code only to change GitHub language percentages. Every language must serve a real SEIS purpose.

| Platform family | Current | Target | Status | Source languages |
| --- | ---: | ---: | --- | --- |
| Apple / Swift ecosystem | 5.16% | 25.0-30.0% | `below_target` | Swift, Objective-C, AppleScript |
| AI, Data, Python, SQL | 46.4% | 18.0-22.0% | `above_target` | Python, SQL, R, Julia, Scala, JSON, JSON-LD, Turtle, SPARQL |
| TypeScript / JavaScript tooling | 32.55% | 15.0-20.0% | `above_target` | TypeScript, JavaScript |
| Android / JVM | 0.35% | 10.0-15.0% | `below_target` | Kotlin, Java, Groovy, Clojure |
| Rust / C / C++ systems | 0.45% | 10.0-15.0% | `below_target` | Rust, C, C++, Zig |
| Go / Infrastructure | 2.4% | 5.0-8.0% | `below_target` | Go, Shell, YAML, HCL, TOML, Bicep, Nix, CUE, Rego, Dockerfile |
| Windows / .NET | 0.14% | 5.0-8.0% | `below_target` | C#, F#, Visual Basic, PowerShell |
| HTML / CSS previews | 6.7% | 0.0-3.0% | `above_target` | HTML, CSS |

Unassigned counted languages: 5.85% (ABAP, AWK, Ada, Avro, Batchfile, CEL, CMake, COBOL, Cairo, Common Lisp, Crystal, D, +46 more).

## Counted Languages

| Language | Bytes | Percent |
| --- | ---: | ---: |
| JSON | 3008271 | 41.73% |
| JavaScript | 1913055 | 26.54% |
| TypeScript | 433045 | 6.01% |
| Swift | 361744 | 5.02% |
| CSS | 320288 | 4.44% |
| Python | 312038 | 4.33% |
| Other | 248794 | 3.45% |
| HTML | 162343 | 2.25% |
| Shell | 92234 | 1.28% |
| YAML | 50222 | 0.7% |
| Go | 17373 | 0.24% |
| Java | 16946 | 0.24% |
| Scheme | 16085 | 0.22% |
| Perl | 15256 | 0.21% |
| Ruby | 14249 | 0.2% |
| Rust | 12687 | 0.18% |
| C++ | 11897 | 0.17% |
| SQL | 11471 | 0.16% |
| PHP | 9972 | 0.14% |
| R | 8477 | 0.12% |
| Objective-C | 8447 | 0.12% |
| OCaml | 8074 | 0.11% |
| Racket | 7923 | 0.11% |
| Tcl | 7662 | 0.11% |

## Largest JavaScript Files Still Counted

| Path | Bytes |
| --- | ---: |
| `SEIST/apps/web/src/i18n/locales.js` | 105051 |
| `emirhan-kudun-portfolio/apps/uix-web/src/i18n/locales.js` | 105051 |
| `emirhan-kudun-portfolio/packages/content/src/uix-static/locales.js` | 105051 |
| `apps/web/script.js` | 79540 |
| `apps/web/app.js` | 41632 |
| `scripts/check-cloud-environment.cjs` | 31248 |
| `scripts/sync-plugin-environment-sources.cjs` | 27637 |
| `packages/seis-ai/test/checks.test.mjs` | 25298 |
| `scripts/create-seis-ecosystem-intake.cjs` | 25262 |
| `SEIST/apps/web/app.js` | 25115 |
| `SEIST/release/web/app.js` | 25115 |
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
| `polyglot/typescript/**` | `linguist-language=TypeScript` |
| `polyglot/react/*.tsx` | `linguist-language=TypeScript` |
| `packages/seis-ai/types/**` | `linguist-language=TypeScript` |
| `polyglot/objective-c/**` | `linguist-language=Objective-C` |

## Local Runtime Readiness

| Runtime | Available | Version |
| --- | --- | --- |
| `node` | yes | `v22.22.2` |
| `python3` | yes | `Python 3.11.15` |
| `go` | yes | `go version go1.24.7 linux/amd64` |
| `rustc` | yes | `rustc 1.94.1 (e408947bf 2026-03-25)` |
| `swift` | no | `` |
| `javac` | yes | `javac 21.0.10` |
| `dart` | no | `` |

## Next Migration Order

- Keep generated release, report, data, and local snapshot files out of GitHub Linguist counts.
- Move translation payloads from JavaScript modules into data files after UI fallback testing.
- Keep JavaScript, TypeScript, and Objective-C as separate language panels; Other is every remaining language only.
- Promote stable Node automation scripts to Python or Go only when the behavior is covered by checks.
- Grow Apple, Android, systems, Go/infrastructure, and Windows lanes through real SEIS features, not filler language-percentage code.
- Keep browser runtime JavaScript focused on interaction code; put contracts in typed or domain-specific languages.
