# SEIS Public / Private Boundary

The public repository contains reusable engineering knowledge and public-safe
demo behavior. Private credentials, personal data, private memory, and
unlicensed source material remain outside the repository.

## Public-Safe

- Architecture, roadmap, ADRs, validation scripts, safe schemas, placeholders,
  demo metadata, and clearly labeled research.
- Secret-storage rules, incident procedures, scanner configuration, and
  path-only evidence that do not contain values or sensitive infrastructure.
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
- Incident coordination containing provider audit details, affected identities,
  private host metadata, credential activity, or unredacted scanner output.

## Classification By Surface

| Surface            | Public-safe content                                             | Private or restricted content                                                 |
| ------------------ | --------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Configuration      | Variable names, placeholder values, sample modes                | Real values, reversible encodings, production endpoints tied to credentials   |
| Security evidence  | Command, exit status, scanner scope, path and category          | Detected value, private audit detail, sensitive infrastructure identity       |
| AI and agents      | Provider-neutral schemas, demo fixtures, permission policy      | Live prompt bodies with private context, provider credentials, private memory |
| SSH and cloud      | Credential-free sample profiles, approval gates, recovery rules | Private keys, real private hosts, sessions, deployment credentials            |
| Incidents          | Redacted impact, affected revision, remediation status          | Credential value, private provider activity, unredacted evidence              |
| Media and archives | Hashes, counts, provenance decisions, licensed public assets    | Raw private archives, client assets, unreviewed or unlicensed material        |

## Safety Rules

- If a secret is found, report only its path and category; never print its
  value. Follow the
  [Credential Incident Response](security/CREDENTIAL_INCIDENT_RESPONSE.md)
  runbook and recommend rotation when exposure is plausible.
- Store credentials only through the
  [Secret Storage Policy](security/SECRET_STORAGE.md). A private-looking
  repository path is not an approved secret store.
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

Record scanner scope and exceptions. The open historical Gitleaks decision in
[issue #129](https://github.com/emirhankudun-ux/SEIS/issues/129) means a passing
scan is conditional evidence and must not be summarized as proof that excluded
historical content is resolved.

## Related Policies

- [Focused Security Policy](SECURITY.md)
- [Secret Storage Policy](security/SECRET_STORAGE.md)
- [Credential Incident Response](security/CREDENTIAL_INCIDENT_RESPONSE.md)
- [Security Baseline](security/security-baseline.md)
