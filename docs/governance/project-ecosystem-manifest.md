# SEIS Project Ecosystem Manifest

`project.ecosystem.yaml` is the machine-readable identity and boundary record for this checkout.
It intentionally uses JSON syntax, which is valid YAML 1.2, so the repository can validate the
manifest without adding a parser dependency.

The manifest declares SEIS as an Apple-first, Swift-first, public-safe creative engineering
operating system. It also records the local AI Core boundary: source-backed registry projections
and read-only route evidence are verified locally, while provider calls, credentials, live MCP
sessions, SSH, deployment, private content reads, and background execution remain unclaimed.

Validate it with:

```bash
npm run check:project-ecosystem-manifest
```

The validator checks project identity, platform strategy, secret boundaries, AI Core authority,
referenced source paths, package scripts, and Goal IDs. It does not turn a local snapshot into a
live integration.
