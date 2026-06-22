# SEIS Software Language Atlas

SEIS can be a very polyglot repository without becoming heavy. Each language starts as a small contract, policy, schema, verifier, or deployment guard. Runtime services are promoted only after a product need, owner, cost, and rollback path are documented.

## Atlas Scope

- Active branch: `UIXAppTTR`
- Target surface count: 80 language and configuration surfaces
- Runtime rule: no new production dependency for atlas-only expansion
- Promotion rule: contracts before services
- Release rule: package, hash, backup, and handoff before upload

## Expansion Set

The atlas now includes additional contracts for R, Julia, Haskell, Erlang, Zig, Nim, Perl, F#, Objective-C, Racket, OCaml, PowerShell, Terraform, GraphQL, Protocol Buffers, TOML, Crystal, V, D, Ada, Fortran, COBOL, Pascal, Common Lisp, Prolog, Elm, PureScript, ReScript, Solidity, Move, Cairo, Q#, MATLAB, XML, CMake, Make, INI, PlantUML, Mermaid, JSON Schema, Hack, ABAP, PL/SQL, T-SQL, Bicep, Nix, CUE, Rego, CEL, Jsonnet, Dhall, GDScript, GLSL, WGSL, Avro, and AsyncAPI.

## Why This Shape

This gives the repository broad software-language literacy while keeping the public web experience static, mobile-safe, and easy to review. The files are intentionally tiny so future agents can grow one language at a time without forcing the whole repo into a heavy build matrix.

## Promotion Checklist

- The language surface has a real product reason.
- The owner and runtime cost are known.
- The code can be checked without breaking low-power mode.
- The rollback path is documented.
- The web/mobile experience remains fast, accessible, and calm.
