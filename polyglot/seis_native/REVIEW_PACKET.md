# SEIS Native Polyglot Review Packet

This review packet explains how to inspect the SEIS native polyglot kernel before merging PR #140.

## Review goals

- Confirm that the branch stays outside browser-facing source work.
- Confirm that every implementation carries the shared SEIS lane model.
- Confirm that the manifest matches the source files that were added.
- Confirm that all work remains additive, reversible, and safe to review.

## Core checks

Run these from the repository root:

```bash
python3 polyglot/seis_native/python/seis_native_kernel.py
python3 polyglot/seis_native/python/native_polyglot_summary.py
python3 polyglot/seis_native/python/check_next_wave_files.py
python3 polyglot/seis_native/python/check_manifest_consistency.py
```

## Source-of-truth files

```text
polyglot/seis_native/README.md
polyglot/seis_native/seis_native_manifest.yaml
polyglot/seis_native/python/check_next_wave_files.py
polyglot/seis_native/python/check_manifest_consistency.py
```

## Merge notes

This branch does not require live services, deployment, credentials, package installation, or remote runtime access. It is a repository language-surface foundation and should be reviewed as an additive architecture contract.
