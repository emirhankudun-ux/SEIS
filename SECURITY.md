# Security Policy

SEIS treats security, privacy, and safe AI-assisted development as product requirements, not afterthoughts.

## Reporting Security Vulnerabilities

Do not open a public issue for a suspected vulnerability. Contact [@emirhankudun-ux](https://github.com/emirhankudun-ux) or email emirhankudun@gmail.com with a concise private report.

Include when possible:

- vulnerability class (for example XSS, injection, auth bypass, secret exposure, supply-chain risk, unsafe agent/tool permission, prompt/data exfiltration);
- affected path, feature, plugin, MCP surface, or workflow;
- reproduction steps or proof of concept that avoids exposing private data;
- impact estimate and suggested mitigation;
- whether AI tools were involved in discovery or reproduction.

## Response Targets

| Stage | Target |
| --- | --- |
| Initial acknowledgement | Within 48 hours |
| Triage and severity label | Within 5 business days |
| Fix or mitigation plan | Usually 1-2 weeks, depending on severity and blast radius |
| Public disclosure | After a safe fix, mitigation, or maintainer-approved advisory path |

## Supported Security Surface

| Surface | Support posture |
| --- | --- |
| `main` branch | Primary supported surface |
| Documentation and policy records | Supported when they affect security decisions |
| AI / Agent / MCP / Skills / Plugin workflows | Supported for permission, secret, prompt, data, and supply-chain risks |
| Archived/import/source snapshots | Reviewed case by case; do not assume active support |

## Security Baseline

- Never commit API keys, tokens, private credentials, `.env` contents, personal identity files, or private media.
- Treat MCP servers, plugins, skills, and AI agents as permissioned software surfaces.
- Prefer least privilege, explicit scopes, auditable handoffs, and reversible automation.
- Do not install new runtimes or dependencies without product need, owner, validation, security review, and rollback.
- Use dependency, license, secret, and provenance checks before market-facing releases.
- Keep publish readiness separate from deployment readiness.
