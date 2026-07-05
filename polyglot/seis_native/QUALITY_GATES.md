# SEIS Native Polyglot Quality Gates

These gates keep the native polyglot kernel useful, reviewable, and honest.

## Required checks

Run these from the repository root:

```bash
python3 polyglot/seis_native/python/seis_native_kernel.py
python3 polyglot/seis_native/python/native_polyglot_summary.py
python3 polyglot/seis_native/python/check_next_wave_files.py
python3 polyglot/seis_native/python/check_manifest_consistency.py
python3 polyglot/seis_native/python/check_readme_manifest_sync.py
```

## Gate 1: no browser expansion

This kernel must not add browser-facing HTML, CSS, or JavaScript application surfaces. Browser demos belong outside this native kernel.

## Gate 2: manifest coverage

Every source file added to the kernel must be represented in:

```text
polyglot/seis_native/seis_native_manifest.yaml
```

## Gate 3: README discoverability

Every language family and new language surface should be discoverable from:

```text
polyglot/seis_native/README.md
polyglot/seis_native/LANGUAGE_FAMILIES.md
```

## Gate 4: shared lane model

Every implementation should carry at least one clear marker for the shared SEIS lane model. The preferred model is:

1. Apple First
2. Data AI
3. Systems
4. Android
5. Windows
6. Infrastructure

## Gate 5: additive and reversible

A review should be able to remove this kernel without affecting the web demo, SSH contracts, provider routing, deployment, or private data boundaries.
