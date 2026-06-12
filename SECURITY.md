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

## Dependency and Toolchain Policy

Do not install unused runtimes or SDKs by default. A dependency is acceptable
only when it is necessary, maintained, documented, and covered by a validation
path.
