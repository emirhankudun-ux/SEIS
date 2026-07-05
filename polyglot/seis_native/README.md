# SEIS Native Polyglot Kernel

This folder adds a real multi-language SEIS foundation.

The goal is to keep SEIS Apple-first while making the repository stronger across data, systems, Android, Windows, infrastructure, database, and scripting lanes.

## Added languages

| Language | File | Lane |
| --- | --- | --- |
| Swift | `swift/NativeRoadmap.swift` | Apple First |
| Python | `python/seis_native_kernel.py` | Data AI |
| Python | `python/native_polyglot_summary.py` | Summary utility |
| Rust | `rust/src/lib.rs` | Systems |
| Go | `go/seis_native_kernel.go` | Infrastructure |
| Kotlin | `kotlin/SeisNativeKernel.kt` | Android |
| Java | `java/SeisNativeKernel.java` | Android / JVM |
| C# | `csharp/SeisNativeKernel.cs` | Windows |
| SQL | `sql/seis_native_kernel.sql` | Data / storage |
| C++ | `cpp/seis_native_kernel.cpp` | Systems |
| Ruby | `ruby/seis_native_kernel.rb` | Automation support |
| Objective-C | `objective_c/SeisNativeKernel.m` | Apple bridge |
| C | `c/SeisNativeKernel.c` | Systems |
| Zig | `zig/seis_native_kernel.zig` | Systems |
| Dart | `dart/seis_native_kernel.dart` | Cross-platform app |
| Elixir | `elixir/seis_native_kernel.ex` | Runtime orchestration |
| Julia | `julia/seis_native_kernel.jl` | Data / research |
| R | `r/seis_native_kernel.R` | Data analysis |
| Perl | `perl/seis_native_kernel.pl` | Scripting support |
| Lua | `lua/seis_native_kernel.lua` | Embedded scripting |
| Haskell | `haskell/SeisNativeKernel.hs` | Functional core |
| PHP | `php/SeisNativeKernel.php` | Server scripting |
| OCaml | `ocaml/seis_native_kernel.ml` | Typed functional core |
| F# | `fsharp/SeisNativeKernel.fs` | .NET functional core |
| Nim | `nim/seis_native_kernel.nim` | Systems scripting |
| Clojure | `clojure/seis_native_kernel.clj` | JVM functional core |
| Erlang | `erlang/seis_native_kernel.erl` | Concurrent runtime |
| Ada | `ada/seis_native_kernel.ads` | Safety-critical systems |
| Fortran | `fortran/seis_native_kernel.f90` | Scientific computing |
| Common Lisp | `common_lisp/seis-native-kernel.lisp` | Symbolic systems |
| Crystal | `crystal/seis_native_kernel.cr` | Compiled scripting |
| V | `v/seis_native_kernel.v` | Systems app prototyping |

## Shared model

Every implementation describes the same lane order:

1. Apple First
2. Data AI
3. Systems
4. Android
5. Windows
6. Infrastructure

This keeps the repository language profile honest: each file carries a small, typed, reusable model rather than filler code.

## Local run examples

```bash
python3 polyglot/seis_native/python/seis_native_kernel.py
python3 polyglot/seis_native/python/native_polyglot_summary.py
```

## Development rule

This kernel must not become a browser demo. Keep new work focused on native, mobile, systems, data, database, infrastructure, or scripting languages.
