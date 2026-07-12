# SEIS Secret Storage Policy

Status: active public-safe policy

## Purpose

This policy defines where credentials may live, how they may enter a SEIS
runtime, and which boundaries must remain true across local development,
GitHub Actions, Apple clients, servers, plugins, MCP tools, and public demos.
It does not assert that any provider, secret manager, deployment, or live
integration is currently configured.

## Core Invariants

- A secret value never enters Git, documentation, prompts, screenshots, logs,
  analytics, test fixtures, build artifacts, browser storage, or a frontend
  bundle.
- `.env.example` contains names and public-safe placeholders only. Real `.env`
  files remain ignored and local.
- Browser-exposed variables, including variables with a `VITE_` prefix, are
  public configuration and must never carry credentials.
- Native client bundles do not contain shared provider or infrastructure
  credentials. User-specific credentials, when a future feature genuinely
  needs them, use the platform keychain and a reviewed access policy.
- Cloud credentials are injected at runtime from an approved managed store and
  are read only by the smallest server-side component that needs them.
- Missing credentials produce an explicit unavailable, local-only, demo, or
  approval-required state. They never trigger a fallback to embedded values.
- A credential is not considered safe merely because it is obscured, encoded,
  encrypted with a repository-held key, or stored in a private-looking folder.

## Approved Secret Stores

| Class                  | Examples                                              | Approved storage                                                                     | Prohibited storage                                                               |
| ---------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Developer-local        | Optional provider token, local service credential     | Ignored local environment file, macOS Keychain, or an approved encrypted local vault | Git, shell history, notes, prompts, screenshots                                  |
| CI and release         | Package, deployment, or signing credential            | GitHub Actions Secrets or an approval-gated environment with least-privilege access  | Workflow YAML, repository variables intended for public configuration, artifacts |
| Server and cloud       | Provider token, database credential, service identity | Managed cloud secret store or runtime-only server environment injection              | Browser code, static hosting output, client bundle, public logs                  |
| Apple client           | User-specific session or device-bound credential      | Keychain with the narrowest practical accessibility and sharing scope                | Source code, property lists committed to Git, shared application defaults        |
| SSH and infrastructure | Private key, access token, privileged password        | Keychain, SSH agent, or approved host credential store outside the repository        | Sample profiles, documentation, repository files, browser storage                |
| Public demo            | No credential is required                             | Public-safe placeholder or no-key fixture                                            | Any live provider or infrastructure credential                                   |

## Ownership And Access

1. The accountable human or service owner creates the credential at its
   authoritative provider.
2. The owner grants the narrowest scopes, resource boundary, environment, and
   lifetime that satisfy the capability.
3. The value is placed directly into an approved store. It is not relayed
   through an issue, pull request, chat, prompt, document, or source file.
4. Runtime code receives the value only at the server, CI job, or device
   boundary that owns the operation.
5. Logs record the credential identifier or category only when operationally
   necessary. They never record the value or a reversible derivative.
6. Access and use are reviewed whenever the owning service, repository,
   workflow, plugin, MCP permission, or deployment boundary changes.

## Server And Browser Boundary

- Browser-exposed configuration is public by definition. Variables with a
  `VITE_` prefix, static JSON, HTML, JavaScript, application manifests, and
  browser storage must never contain a secret.
- Provider, database, deployment, package-publishing, and infrastructure
  credentials terminate at a reviewed server, CI, device-keychain, or managed
  secret-store boundary.
- A frontend requests a bounded server capability; it does not receive the
  provider credential that authorizes the server.
- Demo and local-only modes remain usable when server credentials are absent.
  They do not silently route to a cloud provider or expose configuration as a
  substitute for authentication.

## Redaction And Logging

- Logs, traces, analytics, errors, screenshots, SARIF, workflow summaries, and
  artifacts record status, path, line, category, provider identifier, and
  revision only when needed.
- Do not record a full environment, authorization header, request body,
  private-host configuration, or reversible derivative of a secret.
- Redaction happens before persistence or transmission. A downstream cleanup
  step is not an acceptable primary control.
- Tests use explicit synthetic sentinels that are not copied from a real
  credential and assert that the input value is absent from diagnostics.

## Local Development

- Start from `.env.example`, then place real values in an ignored local file or
  approved local store.
- Do not add real values to command-line arguments because process listings and
  shell history may persist them.
- Do not paste values into agent prompts. Agents may report a path, variable
  name, provider, and category, but never the value.
- A local scanner must redact findings and must not install tools, elevate
  privileges, rotate credentials, or rewrite history on the operator's behalf.
- Local-only endpoints and sample hosts must remain clearly labeled and must
  not be treated as proof of a live service.

## CI, Release, And Deployment

- Workflow permissions default to read-only and expand only for the job that
  needs a documented write.
- Secrets are scoped to the repository or protected environment that owns the
  operation. Fork-origin pull requests must not receive privileged secrets.
- A workflow may test that a credential is present, but must not echo it or
  serialize the environment.
- Artifacts, summaries, SARIF, caches, and debug logs must be reviewed for
  redaction before retention.
- Release and deployment credentials require human approval, an identified
  target, rollback or recovery notes, and post-use validation.

## Revocation And Rotation

- Rotate on the provider's supported schedule and after any plausible exposure,
  scope change, ownership change, or unexplained use.
- Revoke or disable the old credential before declaring recovery complete.
- Remove unused credentials from every approved store and from the consuming
  configuration. Do not retain a disabled value as documentation.
- Rotation and revocation are external mutations and require the accountable
  human or explicitly authorized service owner.
- Git history rewriting is a separate repository operation. It requires an
  approved plan, backup, protected-branch coordination, contributor recovery,
  and post-rewrite validation; rotation does not authorize it automatically.

## Detection And Incident Handoff

If a credential may have entered Git, logs, an artifact, a prompt, or another
unapproved surface, stop copying it and follow the
[Credential Incident Response](CREDENTIAL_INCIDENT_RESPONSE.md) runbook. Treat
the credential as compromised until the accountable owner confirms containment
and revocation. Report only its path or surface, category, provider, and
affected revision or time window.

## Validation

Evidence for this policy consists of path-only repository inspection,
placeholder validation, redacted secret-scanner results, explicit workflow
permissions, incident records without secret values, and links to successful
checks. A passing scanner is not proof that no credential exists outside its
scope or inside an approved exception.

The current executable-control status and known limitation are recorded in the
[Security Baseline](security-baseline.md). The design options for reducing
control drift are recorded in the
[Security Hardening Review](hardening/hardening.md).

## Related Policies

- [Focused Security Policy](../SECURITY.md)
- [Public / Private Boundary](../PUBLIC_PRIVATE_BOUNDARY.md)
- [Credential Incident Response](CREDENTIAL_INCIDENT_RESPONSE.md)
- [Security Baseline](security-baseline.md)
