# SEIS Language Distribution

- Mode: `github_linguist_aligned_source_budget`
- Counted files: 1508
- Counted bytes: 16325472
- JavaScript: 4683139 bytes (28.69%)
- Target JavaScript: 21.0%
- Target status: `above_target`
- Additional non-JavaScript bytes needed for strict target: 5975189

## GitHub Language Panel Split

| Panel | Bytes | Percent | Source languages |
| --- | ---: | ---: | --- |
| JavaScript | 4683139 | 28.69% | JavaScript |
| TypeScript | 424439 | 2.6% | TypeScript |
| Objective-C | 8447 | 0.05% | Objective-C |
| Other | 11209447 | 68.66% | ABAP, AWK, Ada, AppleScript, Avro, Batchfile, Bicep, C, C#, C++, CEL, CMake, +81 more |

## GitHub Language Balance Targets

- Mode: `multi_platform_real_source_balance`
- Status: `needs_real_platform_work`
- No-filler policy: Do not add filler code only to change GitHub language percentages. Every language must serve a real SEIS purpose.

| Platform family | Current | Target | Status | Source languages |
| --- | ---: | ---: | --- | --- |
| Apple / Swift ecosystem | 3.57% | 25.0-30.0% | `below_target` | Swift, Objective-C, AppleScript |
| AI, Data, Python, SQL | 21.23% | 18.0-22.0% | `within_target` | Python, SQL, R, Julia, Scala, JSON, JSON-LD, Turtle, SPARQL |
| TypeScript / JavaScript tooling | 31.29% | 15.0-20.0% | `above_target` | TypeScript, JavaScript |
| Android / JVM | 0.15% | 10.0-15.0% | `below_target` | Kotlin, Java, Groovy, Clojure |
| Rust / C / C++ systems | 0.18% | 10.0-15.0% | `below_target` | Rust, C, C++, Zig |
| Go / Infrastructure | 1.04% | 5.0-8.0% | `below_target` | Go, Shell, YAML, HCL, TOML, Bicep, Nix, CUE, Rego, Dockerfile |
| Windows / .NET | 0.05% | 5.0-8.0% | `below_target` | C#, F#, Visual Basic, PowerShell |
| HTML / CSS previews | 41.46% | 0.0-3.0% | `above_target` | HTML, CSS |

Unassigned counted languages: 1.03% (ABAP, AWK, Ada, Avro, Batchfile, CEL, CMake, COBOL, Cairo, Common Lisp, Crystal, D, +46 more).

## Counted Languages

| Language | Bytes | Percent |
| --- | ---: | ---: |
| HTML | 6269305 | 38.4% |
| JavaScript | 4683139 | 28.69% |
| JSON | 2931633 | 17.96% |
| Swift | 574078 | 3.52% |
| Python | 515500 | 3.16% |
| CSS | 499004 | 3.06% |
| TypeScript | 424439 | 2.6% |
| Shell | 98373 | 0.6% |
| YAML | 45668 | 0.28% |
| Other | 45014 | 0.28% |
| Go | 16806 | 0.1% |
| Java | 16392 | 0.1% |
| Scheme | 15747 | 0.1% |
| Perl | 13916 | 0.09% |
| Ruby | 13677 | 0.08% |
| Rust | 12286 | 0.08% |
| C++ | 11206 | 0.07% |
| PHP | 8768 | 0.05% |
| SQL | 8752 | 0.05% |
| Objective-C | 8447 | 0.05% |
| R | 7953 | 0.05% |
| OCaml | 7550 | 0.05% |
| Tcl | 7290 | 0.04% |
| Racket | 7245 | 0.04% |

## Largest JavaScript Files Still Counted

| Path | Bytes |
| --- | ---: |
| `apps/web/desktop.js` | 534286 |
| `apps/seis-demo-web/script.js` | 148492 |
| `apps/web/reference-banks/reference-apps.js` | 116115 |
| `emirhan-kudun-portfolio/apps/uix-web/src/i18n/locales.js` | 105051 |
| `emirhan-kudun-portfolio/packages/content/src/uix-static/locales.js` | 105051 |
| `apps/seis-core/script.js` | 94536 |
| `apps/web/seis-code.js` | 89892 |
| `packages/seis-ai/test/agent.test.mjs` | 86997 |
| `scripts/check-product-experience-browser-smoke.mjs` | 86889 |
| `packages/seis-ai/src/lib/plugin-integration.mjs` | 81819 |
| `scripts/check-desktop-os.mjs` | 70113 |
| `apps/web/app.js` | 67280 |

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
| `node` | yes | `v22.23.1` |
| `python3` | yes | `Python 3.9.6` |
| `go` | no | `` |
| `rustc` | no | `` |
| `swift` | yes | `detected; package tests handle configured toolchain readiness` |
| `javac` | no | `The operation couldn’t be completed. Unable to locate a Java Runtime. Please visit http://www.java.com for information on installing Java.` |
| `dart` | no | `` |

## Next Migration Order

- Keep generated release, report, data, and local snapshot files out of GitHub Linguist counts.
- Move translation payloads from JavaScript modules into data files after UI fallback testing.
- Keep JavaScript, TypeScript, and Objective-C as separate language panels; Other is every remaining language only.
- Promote stable Node automation scripts to Python or Go only when the behavior is covered by checks.
- Grow Apple, Android, systems, Go/infrastructure, and Windows lanes through real SEIS features, not filler language-percentage code.
- Keep browser runtime JavaScript focused on interaction code; put contracts in typed or domain-specific languages.
