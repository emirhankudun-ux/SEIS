# SEIS Canonical GitHub Hub

SEIS is the canonical GitHub hub and general repository for the `emirhankudun-ux` project ecosystem.

## Purpose

SEIS centralizes:

- repository discovery
- project registry and ownership state
- branch consolidation planning
- source repository migration records
- GitHub automation scripts
- governance and plugin coordination
- release readiness and safety rules

## Source Repository Handling

Every source repository remains available until SEIS contains verified namespaced refs for its branches and a verified default-branch file snapshot under `repositories/<repo>`.

Target ref shape:

```text
sources/<repo>/<branch>
```

Examples:

```text
sources/UIX-Apps/UIXAppTTR
sources/gemini-cli/main
sources/emirhan-kudun-portfolio/seis-concept
```

Target file snapshot shape:

```text
repositories/<repo>/
```

Examples:

```text
repositories/UIX-Apps/
repositories/gemini-cli/
repositories/DeepSeek-Coder/
```

## Visible GitHub Markers

Each source repository default branch has a `MOVED_TO_SEIS.md` marker. This marker points back to SEIS and names the expected target namespace.

## Migration Runners

Run the branch ref migration from a SEIS clone:

```bash
DRY_RUN=1 scripts/migrate-github-branches-to-seis.sh
```

When GitHub push authentication is ready:

```bash
DRY_RUN=0 scripts/migrate-github-branches-to-seis.sh
```

Run the repository depot import from a SEIS clone:

```bash
DRY_RUN=1 scripts/migrate-repositories-to-seis-depot.sh
```

When branch refs and file snapshots are verified, import the default-branch files for real:

```bash
DRY_RUN=0 scripts/migrate-repositories-to-seis-depot.sh
```

## Deletion Rule

Source repository deletion is not part of normal consolidation. It is allowed only after verification and only with:

```bash
DRY_RUN=0 DELETE_SOURCE_REPOS=1 scripts/migrate-repositories-to-seis-depot.sh
```

This prevents accidental loss while SEIS becomes the general depot.
