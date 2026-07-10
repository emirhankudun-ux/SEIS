# SEIS Public / Private Boundary

The public repository contains reusable engineering knowledge and public-safe
demo behavior. Private credentials, personal data, private memory, and
unlicensed source material remain outside the repository.

## Public-Safe

- Architecture, roadmap, ADRs, validation scripts, safe schemas, placeholders,
  demo metadata, and clearly labeled research.
- No-key web demo behavior and mock data that cannot be mistaken for live
  provider or deployment evidence.
- Archive manifests, hashes, counts, and provenance decisions without raw
  archive dumps.

## Private or Restricted

- API keys, tokens, passwords, private keys, credential screenshots, real
  private hosts, private vault notes, sensitive personal data, and client
  assets without public licensing.
- Live provider output, SSH sessions, deploy credentials, package artifacts,
  and unreviewed MCP/tool payloads.

## Safety Rules

- If a secret is found, report only its path and category; never print its
  value. Recommend rotation when exposure is plausible.
- Demo, local, cloud, offline, unavailable, and approval-required states remain
  distinct.
- SSH and remote mutation require target identity, explicit approval, dry-run,
  maintenance/recovery gates, and rollback evidence.
- Supplied Kimi/Stitch archives are immutable external inputs. Raw code and
  assets are not copied into the repository without a separate provenance and
  license review.

## Review Gate

Before public release, run the scoped secret/public-readiness checks and review
changed paths manually. A dirty worktree, missing archive, missing credential,
or unavailable provider is a status to report, not a reason to infer success.
