# Security Policy

SEIS treats security, privacy, and responsible AI governance as core platform
requirements.

## Reporting a Vulnerability

Do not open a public issue for a vulnerability.

Send a private report to the maintainer:

- GitHub: [@emirhankudun-ux](https://github.com/emirhankudun-ux)
- Email: emirhankudun@gmail.com

Please include:

- affected file, package, workflow, or integration
- vulnerability type and impact
- reproduction steps or proof of concept when safe
- affected versions or commit SHA when known
- suggested mitigation if you have one

## Response Targets

| Step | Target |
| --- | --- |
| Initial acknowledgement | within 48 hours |
| Triage and severity review | within 5 business days |
| Fix plan | depends on severity and blast radius |
| Public disclosure | after a fix or mitigation is available |

## Supported Versions

SEIS is evolving from `main`. Security fixes target the current `main` branch
unless a maintainer explicitly announces another supported release line.

## Security Rules

- Never commit API keys, tokens, credentials, certificates, provisioning files,
  `.env` contents, or personal data.
- Do not weaken authentication, authorization, sandboxing, path safety, or
  secret handling for convenience.
- Keep AI-generated code under the same review standard as human-written code.
- Treat MCP tools, plugins, and agent workflows as security-sensitive execution
  surfaces.
- Prefer small, auditable fixes with clear validation.

## SSH Hardening Contract

SSH and firewall hardening is safety-critical because a bad sequence can lock
out the operator. SEIS tracks that contract with:

```bash
npm run check:ssh-hardening-contract
```

The check keeps `scripts/ultra_ssh_manager.py`, its unit-test expectations, the
SEIS security review skill, and the deployment guidance aligned around
credential redaction, root-owned credential manifests, dry-run/recovery
playbooks, rescue-account scope, and honest validation claims.

The machine-readable operation contract is maintained at
`data/ssh-hardening-operation-contract.json`.

## Automated Security Scanning

SEIS uses GitHub CodeQL code scanning for the repository's JavaScript,
TypeScript, and Python surfaces. These lanes cover the web app, MCP entrypoints,
AI package, kernel builders, and automation scripts without requiring
contributors to install extra local SDKs.

CodeQL runs on relevant pull requests, `main` pushes, weekly scheduled scans,
and manual dispatches. Findings should be triaged as security work, not as
general feature backlog.

## Dependency and Toolchain Policy

Do not install unused runtimes or SDKs by default. A dependency is acceptable
only when it is necessary, maintained, documented, and covered by a validation
path.
