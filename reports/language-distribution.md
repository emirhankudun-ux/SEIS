# SEIS Language Distribution

- Mode: `github_linguist_aligned_source_budget`
- Counted files: 997
- Counted bytes: 8226836
- JavaScript: 2993076 bytes (36.38%)
- Target JavaScript: 21.0%
- Target status: `above_target`
- Additional non-JavaScript bytes needed for strict target: 6025906

## GitHub Language Panel Split

| Panel | Bytes | Percent | Source languages |
| --- | ---: | ---: | --- |
| JavaScript | 2993076 | 36.38% | JavaScript |
| TypeScript | 424439 | 5.16% | TypeScript |
| Objective-C | 8447 | 0.1% | Objective-C |
| Other | 4800874 | 58.36% | ABAP, AWK, Ada, AppleScript, Avro, Batchfile, Bicep, C, C#, C++, CEL, CMake, +81 more |

## GitHub Language Balance Targets

- Mode: `multi_platform_real_source_balance`
- Status: `needs_real_platform_work`
- No-filler policy: Do not add filler code only to change GitHub language percentages. Every language must serve a real SEIS purpose.

| Platform family | Current | Target | Status | Source languages |
| --- | ---: | ---: | --- | --- |
| Apple / Swift ecosystem | 7.09% | 25.0-30.0% | `below_target` | Swift, Objective-C, AppleScript |
| AI, Data, Python, SQL | 38.51% | 18.0-22.0% | `above_target` | Python, SQL, R, Julia, Scala, JSON, JSON-LD, Turtle, SPARQL |
| TypeScript / JavaScript tooling | 41.54% | 15.0-20.0% | `above_target` | TypeScript, JavaScript |
| Android / JVM | 0.29% | 10.0-15.0% | `below_target` | Kotlin, Java, Groovy, Clojure |
| Rust / C / C++ systems | 0.36% | 10.0-15.0% | `below_target` | Rust, C, C++, Zig |
| Go / Infrastructure | 2.06% | 5.0-8.0% | `below_target` | Go, Shell, YAML, HCL, TOML, Bicep, Nix, CUE, Rego, Dockerfile |
| Windows / .NET | 0.1% | 5.0-8.0% | `below_target` | C#, F#, Visual Basic, PowerShell |
| HTML / CSS previews | 8.03% | 0.0-3.0% | `above_target` | HTML, CSS |

Unassigned counted languages: 2.02% (ABAP, AWK, Ada, Avro, Batchfile, CEL, CMake, COBOL, Cairo, Common Lisp, Crystal, D, +46 more).

## Counted Languages

| Language | Bytes | Percent |
| --- | ---: | ---: |
| JavaScript | 2993076 | 36.38% |
| JSON | 2634914 | 32.03% |
| Swift | 574078 | 6.98% |
| Python | 513980 | 6.25% |
| TypeScript | 424439 | 5.16% |
| CSS | 398393 | 4.84% |
| HTML | 262365 | 3.19% |
| Shell | 98373 | 1.2% |
| YAML | 45668 | 0.56% |
| Other | 43479 | 0.53% |
| Go | 16806 | 0.2% |
| Java | 16392 | 0.2% |
| Scheme | 15747 | 0.19% |
| Perl | 13916 | 0.17% |
| Ruby | 13677 | 0.17% |
| Rust | 12286 | 0.15% |
| C++ | 11206 | 0.14% |
| PHP | 8768 | 0.11% |
| SQL | 8752 | 0.11% |
| Objective-C | 8447 | 0.1% |
| R | 7953 | 0.1% |
| OCaml | 7550 | 0.09% |
| Tcl | 7290 | 0.09% |
| Racket | 7245 | 0.09% |

## Largest JavaScript Files Still Counted

| Path | Bytes |
| --- | ---: |
| `apps/web/desktop.js` | 148278 |
| `emirhan-kudun-portfolio/apps/uix-web/src/i18n/locales.js` | 105051 |
| `emirhan-kudun-portfolio/packages/content/src/uix-static/locales.js` | 105051 |
| `apps/seis-core/script.js` | 94536 |
| `apps/web/script.js` | 79540 |
| `apps/seis-demo-web/script.js` | 76575 |
| `apps/web/seis-code.js` | 66372 |
| `apps/web/app.js` | 61634 |
| `packages/seis-ai/test/agent.test.mjs` | 55758 |
| `packages/seis-ai/src/lib/plugin-integration.mjs` | 45381 |
| `scripts/check-seis-master-prompt.mjs` | 42025 |
| `scripts/check-product-experience-browser-smoke.mjs` | 41240 |

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
