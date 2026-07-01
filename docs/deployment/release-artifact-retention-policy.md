# Release Artifact Retention Policy

Status: tracked-retained until explicit maintainer approval for migration or
deletion.

This policy covers the generated static release packages under `releases/` and
the current deployable package pointers used by the SEIS server upload lane.

## Current Boundary

SEIS currently keeps release backups in the repository as timestamped pairs:

```text
releases/<timestamp>/seis-static.zip
releases/<timestamp>/server-upload-manifest.json
releases/latest.json
```

These artifacts are not source-of-truth implementation files. They are recovery
and handoff evidence for the static web package until a reviewed migration moves
them to GitHub Releases, Git LFS, object storage, or manifest-only records.

## Retention Rule

- Keep existing tracked release artifacts retained.
- Do not delete, rewrite, or move tracked release zip archives without explicit
  maintainer approval.
- Do not deploy the whole repository; deploy only the verified static package
  after a hosting target is confirmed.
- Do not treat a retained zip as public release approval.
- Do not add private credentials, SSH keys, tokens, or private host details to
  release manifests.

## Migration Options

Any future migration must be reviewed as its own PR and must choose one clear
destination:

- GitHub Releases for public downloadable release packages.
- Git LFS for large retained binary artifacts that must stay Git-addressable.
- Object storage for private/internal package retention.
- Manifest-only records if historical zips can be reproduced and deletion is
  explicitly approved.

## Required Checks

Run:

```bash
npm run check:release-artifact-policy
npm run check:deploy-readiness
git diff --check
```

`npm run check:release-artifact-policy` validates this policy, the latest
release pointer, release package/manifest pairing, and checksum alignment for
the latest retained static package. It does not upload, delete, rewrite, or move
release artifacts.

## Approval Gate

Human approval is required before:

- deleting any tracked file under `releases/`
- moving release zips to LFS, GitHub Releases, or object storage
- changing retention from `tracked-retained`
- publishing or uploading any package to a live host
- replacing a retained artifact with a newly generated package
