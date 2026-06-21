# SEIS Repo Health Manifest

The repo health manifest makes repository quality visible across applications, packages, plugins, docs, agents, and CI governance.

## Required lanes

| Lane | Required signal |
| --- | --- |
| Applications | User-visible behavior, accessibility, cache safety, and shared contract parity. |
| Packages | Cross-platform contracts and package APIs remain aligned. |
| Plugins | Plugin manifest, skills, agent files, and bundle checker stay synchronized. |
| Documentation | Architecture, quality, AI policy, module coverage, goals, repos, and agents remain documented. |
| Agents | Agent lanes define skill source, autonomy limits, tool boundaries, and validation duties. |
| CI Governance | Main CI executes quality governance gates. |

## Publish safety rule

No SEIS repository change is publish-ready without quality, security, documentation, and rollback evidence.

## Canonical contract

```text
content/development/seis-repo-health-manifest.json
```

## Quality gate

```bash
npm run check:seis-repo-health-manifest
```
