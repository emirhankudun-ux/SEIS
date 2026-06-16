# SEIS Language Distribution

- Mode: `github_linguist_aligned_source_budget`
- Counted files: 620
- Counted bytes: 2953642
- JavaScript: 1030005 bytes (34.87%)
- Target JavaScript: 21.0%
- Target status: `above_target`
- Additional non-JavaScript bytes needed for strict target: 1951143

## GitHub Language Panel Split

| Panel | Bytes | Percent | Source languages |
| --- | ---: | ---: | --- |
| JavaScript | 1030005 | 34.87% | JavaScript |
| TypeScript | 28824 | 0.98% | TypeScript |
| Objective-C | 8447 | 0.29% | Objective-C |
| Other | 1886366 | 63.87% | ABAP, AWK, Ada, AppleScript, Avro, Batchfile, Bicep, C, C#, C++, CEL, CMake, +81 more |

## GitHub Language Balance Targets

- Mode: `multi_platform_real_source_balance`
- Status: `needs_real_platform_work`
- No-filler policy: Do not add filler code only to change GitHub language percentages. Every language must serve a real SEIS purpose.

| Platform family | Current | Target | Status | Source languages |
| --- | ---: | ---: | --- | --- |
| Apple / Swift ecosystem | 12.39% | 25.0-30.0% | `below_target` | Swift, Objective-C, AppleScript |
| AI, Data, Python, SQL | 34.11% | 18.0-22.0% | `above_target` | Python, SQL, R, Julia, Scala, JSON, JSON-LD, Turtle, SPARQL |
| TypeScript / JavaScript tooling | 35.85% | 15.0-20.0% | `above_target` | TypeScript, JavaScript |
| Android / JVM | 0.79% | 10.0-15.0% | `below_target` | Kotlin, Java, Groovy, Clojure |
| Rust / C / C++ systems | 0.99% | 10.0-15.0% | `below_target` | Rust, C, C++, Zig |
| Go / Infrastructure | 4.11% | 5.0-8.0% | `below_target` | Go, Shell, YAML, HCL, TOML, Bicep, Nix, CUE, Rego, Dockerfile |
| Windows / .NET | 0.26% | 5.0-8.0% | `below_target` | C#, F#, Visual Basic, PowerShell |
| HTML / CSS previews | 6.33% | 0.0-3.0% | `above_target` | HTML, CSS |

Unassigned counted languages: 5.18% (ABAP, AWK, Ada, Avro, Batchfile, CEL, CMake, COBOL, Cairo, Common Lisp, Crystal, D, +46 more).

## Counted Languages

| Language | Bytes | Percent |
| --- | ---: | ---: |
| JavaScript | 1030005 | 34.87% |
| JSON | 680755 | 23.05% |
| Swift | 356641 | 12.07% |
| Python | 308216 | 10.44% |
| CSS | 99419 | 3.37% |
| HTML | 87594 | 2.97% |
| Shell | 67450 | 2.28% |
| Other | 32872 | 1.11% |
| YAML | 29849 | 1.01% |
| TypeScript | 28824 | 0.98% |
| Go | 16367 | 0.55% |
| Java | 16110 | 0.55% |
| Scheme | 15747 | 0.53% |
| Perl | 13916 | 0.47% |
| Ruby | 13442 | 0.46% |
| Rust | 11825 | 0.4% |
| C++ | 11206 | 0.38% |
| PHP | 8471 | 0.29% |
| Objective-C | 8447 | 0.29% |
| SQL | 8177 | 0.28% |
| R | 7953 | 0.27% |
| OCaml | 7550 | 0.26% |
| Tcl | 7290 | 0.25% |
| Racket | 7245 | 0.25% |

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
| `mcp/seis-mcp-server.mjs` | 22803 |
| `scripts/check-seis-specialist-plugins.mjs` | 22425 |
| `scripts/create-plugin-capability-lanes.cjs` | 19783 |
| `scripts/automation-refresh-seis-surface.cjs` | 19465 |
| `scripts/third-party-intake-blueprint.mjs` | 17482 |

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
| `swift` | yes | `Apple Swift version 6.3.2 (swift-6.3.2-RELEASE) Target: x86_64-apple-macosx15.0` |
| `javac` | yes | `javac 21.0.11` |
| `dart` | yes | `Dart SDK version: 3.12.1 (stable) (Tue May 26 01:02:21 2026 -0700) on "macos_x64"` |

## Next Migration Order

- Keep generated release, report, data, and local snapshot files out of GitHub Linguist counts.
- Move translation payloads from JavaScript modules into data files after UI fallback testing.
- Keep JavaScript, TypeScript, and Objective-C as separate language panels; Other is every remaining language only.
- Promote stable Node automation scripts to Python or Go only when the behavior is covered by checks.
- Grow Apple, Android, systems, Go/infrastructure, and Windows lanes through real SEIS features, not filler language-percentage code.
- Keep browser runtime JavaScript focused on interaction code; put contracts in typed or domain-specific languages.
