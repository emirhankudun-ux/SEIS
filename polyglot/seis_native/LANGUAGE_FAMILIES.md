# SEIS Native Polyglot Language Families

This document groups the native polyglot kernel by capability family so reviewers can understand why each language surface exists.

## Family map

| Family | Examples | Review focus |
| --- | --- | --- |
| Apple native | Swift, Objective-C | Apple-first lane remains highest priority. |
| Systems | C, C++, Rust, Zig, Ada, Assembly, V, Nim | Low-level and typed contracts stay small and auditable. |
| Mobile and JVM | Kotlin, Java, Clojure, Dart | Mobile and cross-platform intent mirrors the shared lane model. |
| Windows and .NET | C#, F#, PowerShell | Windows automation and desktop support remain explicit. |
| Data and research | Python, SQL, Julia, R, Fortran, Racket | Data, analytics, and research lanes remain measurable. |
| Functional and formal | Haskell, OCaml, Lean, Coq, Scheme, Common Lisp | Formal and symbolic surfaces stay reviewable. |
| Runtime and scripting | Go, Ruby, Perl, Lua, PHP, Elixir, Erlang, Crystal | Operational scripting remains additive and reversible. |
| Schema and infrastructure | Protobuf, GraphQL, Terraform, TOML, Starlark, Solidity, Move | Contracts and infrastructure models stay declarative. |

## Shared lane rule

Every family must preserve the same six lanes:

1. Apple First
2. Data AI
3. Systems
4. Android
5. Windows
6. Infrastructure

## Review rule

A new language should be added only when it clearly strengthens a platform family, validation family, governance family, or future implementation lane. Do not add files only to manipulate GitHub language percentages.
