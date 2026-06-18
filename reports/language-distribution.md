# SEIS Language Distribution

- Mode: `github_linguist_aligned_source_budget`
- Counted files: 861
- Counted bytes: 4814030
- JavaScript: 1692867 bytes (35.17%)
- Target JavaScript: 21.0%
- Target status: `above_target`
- Additional non-JavaScript bytes needed for strict target: 3247241

## GitHub Language Panel Split

| Panel | Bytes | Percent | Source languages |
| --- | ---: | ---: | --- |
| JavaScript | 1692867 | 35.17% | JavaScript |
| TypeScript | 411787 | 8.55% | TypeScript |
| Objective-C | 8447 | 0.18% | Objective-C |
| Other | 2700929 | 56.11% | ABAP, AWK, Ada, AppleScript, Avro, Batchfile, Bicep, C, C#, C++, CEL, CMake, +81 more |

## GitHub Language Balance Targets

- Mode: `multi_platform_real_source_balance`
- Status: `needs_real_platform_work`
- No-filler policy: Do not add filler code only to change GitHub language percentages. Every language must serve a real SEIS purpose.

| Platform family | Current | Target | Status | Source languages |
| --- | ---: | ---: | --- | --- |
| Apple / Swift ecosystem | 12.12% | 25.0-30.0% | `below_target` | Swift, Objective-C, AppleScript |
| AI, Data, Python, SQL | 27.3% | 18.0-22.0% | `above_target` | Python, SQL, R, Julia, Scala, JSON, JSON-LD, Turtle, SPARQL |
| TypeScript / JavaScript tooling | 43.72% | 15.0-20.0% | `above_target` | TypeScript, JavaScript |
| Android / JVM | 0.49% | 10.0-15.0% | `below_target` | Kotlin, Java, Groovy, Clojure |
| Rust / C / C++ systems | 0.62% | 10.0-15.0% | `below_target` | Rust, C, C++, Zig |
| Go / Infrastructure | 3.32% | 5.0-8.0% | `below_target` | Go, Shell, YAML, HCL, TOML, Bicep, Nix, CUE, Rego, Dockerfile |
| Windows / .NET | 0.17% | 5.0-8.0% | `below_target` | C#, F#, Visual Basic, PowerShell |
| HTML / CSS previews | 8.86% | 0.0-3.0% | `above_target` | HTML, CSS |

Unassigned counted languages: 3.4% (ABAP, AWK, Ada, Avro, Batchfile, CEL, CMake, COBOL, Cairo, Common Lisp, Crystal, D, +46 more).

## Counted Languages

| Language | Bytes | Percent |
| --- | ---: | ---: |
| JavaScript | 1692867 | 35.17% |
| JSON | 788511 | 16.38% |
| Swift | 574078 | 11.93% |
| Python | 506913 | 10.53% |
| TypeScript | 411787 | 8.55% |
| CSS | 287432 | 5.97% |
| HTML | 139289 | 2.89% |
| Shell | 97083 | 2.02% |
| Other | 42047 | 0.87% |
| YAML | 38225 | 0.79% |
| Go | 16806 | 0.35% |
| Java | 16392 | 0.34% |
| Scheme | 15747 | 0.33% |
| Perl | 13916 | 0.29% |
| Ruby | 13677 | 0.28% |
| Rust | 12286 | 0.26% |
| C++ | 11206 | 0.23% |
| PHP | 8768 | 0.18% |
| SQL | 8752 | 0.18% |
| Objective-C | 8447 | 0.18% |
| R | 7953 | 0.17% |
| OCaml | 7550 | 0.16% |
| Tcl | 7290 | 0.15% |
| Racket | 7245 | 0.15% |

## Largest JavaScript Files Still Counted

| Path | Bytes |
| --- | ---: |
| `emirhan-kudun-portfolio/apps/uix-web/src/i18n/locales.js` | 105051 |
| `emirhan-kudun-portfolio/packages/content/src/uix-static/locales.js` | 105051 |
| `apps/web/script.js` | 79540 |
| `scripts/check-seis-master-prompt.mjs` | 42025 |
| `apps/web/app.js` | 41632 |
| `scripts/check-cloud-environment.cjs` | 31248 |
| `apps/seis-core/script.js` | 28145 |
| `scripts/sync-plugin-environment-sources.cjs` | 27637 |
| `packages/seis-ai/test/checks.test.mjs` | 25298 |
| `scripts/create-seis-ecosystem-intake.cjs` | 25262 |
| `packages/seis-ai/src/lib/checks.mjs` | 24228 |
| `scripts/check-seis-specialist-plugins.mjs` | 22883 |

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
| `dart` | yes | `Dart SDK version: 3.12.1 (stable) (Tue May 26 01:02:21 2026 -0700) on "macos_x64"` |

## Next Migration Order

- Keep generated release, report, data, and local snapshot files out of GitHub Linguist counts.
- Move translation payloads from JavaScript modules into data files after UI fallback testing.
- Keep JavaScript, TypeScript, and Objective-C as separate language panels; Other is every remaining language only.
- Promote stable Node automation scripts to Python or Go only when the behavior is covered by checks.
- Grow Apple, Android, systems, Go/infrastructure, and Windows lanes through real SEIS features, not filler language-percentage code.
- Keep browser runtime JavaScript focused on interaction code; put contracts in typed or domain-specific languages.
