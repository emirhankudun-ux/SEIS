# SEIS Polyglot Capability Kernel

This folder proves that SEIS can grow beyond browser-facing surfaces through a real multi-language foundation.

The kernel models the same capability lanes across several implementation languages so future agents can choose the right platform path without adding filler files.

## Included lanes

| Lane | Purpose |
| --- | --- |
| Apple First | Swift-native product direction for macOS, iPadOS, and iOS. |
| Data AI | Python-first evaluation, routing, and knowledge workflows. |
| Systems | Rust and C-family reliability paths for safe core logic. |
| Android | Kotlin and Java product foundations. |
| Windows | C# product and desktop foundations. |
| Infrastructure | Go, Shell, and SQL operational foundations. |

## Files

```text
swift/SeisCapabilityKernel.swift
python/seis_capability_kernel.py
rust/src/lib.rs
go/seis_capability_kernel.go
kotlin/SeisCapabilityKernel.kt
java/SeisCapabilityKernel.java
csharp/SeisCapabilityKernel.cs
sql/seis_capability_kernel.sql
shell/seis-capability-kernel.sh
```

## Validation

Run the Python validator from the repository root:

```bash
python3 scripts/check-seis-polyglot-kernel.py
```

The check confirms that every required language file exists, exposes the shared SEIS lane model, and avoids adding browser-front-end source files inside this kernel.
