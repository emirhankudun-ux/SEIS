# Security Policy

SEIS treats security, privacy, dependency restraint, branch safety, and
credential hygiene as release gates.

## Reporting a Vulnerability

Please do not open a public issue for security-sensitive findings.

Report privately to:

- GitHub: [@emirhankudun-ux](https://github.com/emirhankudun-ux)
- Email: emirhankudun@gmail.com

Include when possible:

- Affected path, package, or platform
- Vulnerability class
- Reproduction steps
- Expected vs actual behavior
- Impact estimate
- Suggested fix, if known

## Response Targets

| Stage | Target |
| --- | --- |
| Initial acknowledgement | 48 hours |
| Triage | 7 days |
| Fix plan | 14 days for normal severity, faster for critical issues |

## Supported Branch

| Branch | Support |
| --- | --- |
| `main` | Supported |

Temporary feature branches are not supported release channels.

## Security Rules

- Never commit secrets, tokens, API keys, `.env` files, personal data, or private archives.
- Do not add a new runtime, SDK, package, cloud service, or AI connector unless the task requires it.
- Do not run destructive Git commands or remote branch deletion without explicit maintainer confirmation.
- Keep JavaScript and Python growth constrained in the current phase unless the maintainer reopens that scope.
- Validate Apple, Android, Windows, and release surfaces with the lightest reliable command before merging.

## Disclosure

Security fixes should be coordinated privately until a patch is available.
Public disclosure should include enough detail for users to upgrade without
exposing unnecessary exploit instructions.
