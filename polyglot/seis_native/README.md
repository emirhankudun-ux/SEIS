# SEIS Native Polyglot Kernel

This folder adds a real multi-language SEIS foundation without adding browser-facing source files.

The goal is to keep SEIS Apple-first while making the repository stronger across data, systems, Android, Windows, infrastructure, database, and scripting lanes.

## Added languages

| Language | File | Lane |
| --- | --- | --- |
| Swift | `swift/NativeRoadmap.swift` | Apple First |
| Python | `python/seis_native_kernel.py` | Data AI |
| Rust | `rust/src/lib.rs` | Systems |
| Go | `go/seis_native_kernel.go` | Infrastructure |
| Kotlin | `kotlin/SeisNativeKernel.kt` | Android |
| Java | `java/SeisNativeKernel.java` | Android / JVM |
| C# | `csharp/SeisNativeKernel.cs` | Windows |
| SQL | `sql/seis_native_kernel.sql` | Data / storage |
| C++ | `cpp/seis_native_kernel.cpp` | Systems |
| Ruby | `ruby/seis_native_kernel.rb` | Automation support |

## Shared model

Every implementation describes the same lane order:

1. Apple First
2. Data AI
3. Systems
4. Android
5. Windows
6. Infrastructure

This keeps the repository language profile honest: each file carries a small, typed, reusable model rather than filler code.

## Validation

Run from the repository root:

```bash
python3 scripts/check-seis-native-polyglot.py
```

The validator checks that every required source file exists, contains the shared lane names, and keeps this kernel free from browser-front-end source extensions.
