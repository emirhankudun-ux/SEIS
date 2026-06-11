# SEIS Polyglot Surface

This surface keeps SEIS broad without dependency bloat. Language files start as
small contracts, policies, or validation helpers. Runtime installation is
requirement-led only.

## Current Priority

- Website is the final release surface.
- Apple work uses Swift, SwiftUI, Playground, Objective-C, and AppleScript.
- Windows work excludes Apple-only languages and keeps broad non-Apple coverage.
- Android work is Android Studio oriented and starts with Java/Kotlin-readable contracts.
- JavaScript and Python are not expanded as new implementation surfaces in the current phase.

## Active Languages

| Language | Role |
| --- | --- |
| JavaScript | browser runtime, motion, gallery, i18n |
| TypeScript | release contract typing |
| Node.js | static packaging, quality checks, server manifest generation |
| Python | asset and deployment metadata inspection |
| Ruby | alternate release verification |
| PHP | shared-hosting health fallback |
| Go | service health contract |
| Rust | performance budget contract |
| Swift | iOS motion/accessibility policy |
| Kotlin | Android motion/accessibility policy |
| Dart | Flutter motion/accessibility policy |
| Bash | portable deploy guard |
| Java | JVM-side deploy readiness contract |
| C# | .NET release preservation contract |
| SQL | future release ledger schema |
| Lua | tiny edge/device calm policy |
| YAML | portable deploy governance configuration |
| Cloudflare Worker | edge health and origin proxy |
| Docker | containerized static serving |
| Nginx/Apache config | rewrite and cache policy |
| C | embedded readiness contract |
| C++ | native application readiness contract |
| Elixir | concurrent service release policy |
| Erlang | fault-tolerant release policy |
| Haskell | pure release policy model |
| Scala | JVM typed release policy model |
| R | readiness metrics for analysis notebooks |
| Julia | readiness metrics for numerical analysis |
| Perl | legacy hosting readiness guard |
| Zig | systems-level readiness contract |
| Clojure | data-first release policy map |
| F# | functional .NET release policy model |
| PowerShell | Windows operations release policy guard |
| TOML | portable governance configuration |
| XML | enterprise interchange release policy contract |
| OCaml | typed functional release policy model |
| ReasonML | JavaScript-adjacent typed policy model |
| Nim | compact systems readiness policy |
| Crystal | Ruby-like compiled readiness policy |
| Groovy | JVM scripting release policy guard |
| Objective-C | Apple native release policy bridge |
| Visual Basic | legacy .NET release policy model |
| MATLAB | analysis-oriented readiness policy |
| Fortran | scientific legacy readiness policy |
| COBOL | enterprise legacy readiness policy |
| Racket | language-lab readiness policy |
| Scheme | minimal Lisp readiness policy |
| Prolog | logic-programming readiness proof sketch |
| D | systems readiness policy model |
| V | small systems readiness policy |
| GraphQL | future API release policy schema |
| OpenAPI | future release health API contract |
| JSON Schema | machine-readable release policy validation |
| WebAssembly Text | portable low-level deploy safety proof sketch |
| HCL | infrastructure governance policy sketch |
| Protocol Buffers | future service message release policy contract |
| Avro | future analytics and event schema contract |
| AsyncAPI | future release event contract |
| JSON-LD | semantic release policy metadata |
| INI | legacy-compatible release policy configuration |
| Solidity | future on-chain release policy contract |
| Move | resource-oriented release policy contract |
| Cairo | zero-knowledge ecosystem release policy sketch |
| Hack | typed PHP-family release policy model |
| Elm | calm frontend state policy model |
| PureScript | strongly typed UI policy model |
| ReScript | typed JavaScript-adjacent release policy |
| Q# | quantum-readiness release policy placeholder |
| Apex | enterprise CRM release policy contract |
| ABAP | enterprise ERP readiness policy |
| PL/SQL | database release readiness policy |
| T-SQL | SQL Server release readiness policy |
| Bicep | Azure infrastructure release governance sketch |
| Nix | reproducible environment release policy |
| CUE | configuration schema release policy |
| Turtle | RDF semantic release policy graph |
| SPARQL | semantic release policy validation query |
| Mermaid | lightweight release flow diagram source |
| PlantUML | enterprise-friendly release flow diagram source |
| CSV | minimal operations release policy table |
| Ada | high-integrity readiness policy contract |
| Pascal | classic application readiness policy |
| Tcl | portable scripting release policy |
| AWK | minimal text-ops release policy guard |
| Forth | tiny stack-language readiness policy |
| Common Lisp | durable Lisp release policy model |
| Emacs Lisp | editor-automation release policy guard |
| Smalltalk | object-oriented release policy sketch |
| GDScript | interactive scene readiness policy |
| GLSL | GPU-safe visual readiness constants |
| WGSL | WebGPU visual readiness constants |
| Rego | policy-as-code release gate |
| CEL | portable expression release gate |
| Jsonnet | composable configuration release policy |
| Dhall | typed configuration release policy |
| Starlark | build-system policy extension sketch |
| KDL | human-readable structured release policy |
| HOCON | service configuration release policy |
| Java Properties | JVM-era release policy configuration |
| dotenv | environment-style release policy configuration |
| Make | portable build recipe release policy |
| CMake | native build configuration release policy |
| Meson | modern build configuration release policy |
| Just | developer task recipe release policy |
| Taskfile | cross-platform task runner release policy |

## Rule

Every language surface starts as a small contract or utility. No runtime dependency is added until a real product need exists.
