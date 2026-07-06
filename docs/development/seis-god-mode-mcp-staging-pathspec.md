# SEIS God Mode MCP Staging Pathspec

## Purpose

This note documents the narrow staging boundary for the God Mode MCP prerequisite slice.
It exists so God Mode MCP status work can be separated from the larger dirty tree before AI truth-boundary MCP resources, NVIDIA catalog work, web UI changes, deploy work, or package-script wiring are reviewed.

## Boundary

- Allowed as pathspec-safe control files: this note, the JSON pathspec, and its two direct checkers.
- Candidate payload files require hunk review: MCP runtime contract, plugin integration manifest, plugin integration runtime, MCP server, MCP smoke test, and the optional God Mode status artifact generator.
- Must remain unstaged: `package.json`, `apps/seis-demo-web/script.js`, broad web/app/deploy/report paths, NVIDIA downloadable files, public-readiness recovery files, and AI truth-boundary MCP resource integration.

## Expected Intermediate MCP Snapshot

- Tool count: `35`
- Resource count: `29`
- Prompt count: `3`

This is an intermediate prerequisite state only. It means the God Mode status tool/resource can be reviewed before the AI truth-boundary resources move the runtime to the later 32-resource state.

## Truth Boundary

This staging pathspec does not prove live AI, 720B weights, AGI capability, provider calls, SSH/cloud provisioning, deployment, GitHub mutation, production readiness, or always-on background agents. It only defines a safe local review boundary.

## Verification

```sh
node scripts/check-seis-god-mode-mcp-staging-pathspec.mjs
node scripts/check-seis-god-mode-mcp-staged-boundary.mjs
node scripts/check-seis-ai-truth-boundary-core.mjs
git diff --cached --check
```

## Next Handoff

The next implementation slice should hunk-stage only God Mode MCP status constants, tool/resource registration, runtime-contract counts, and smoke assertions. It should keep AI truth-boundary MCP resources and all package/web/deploy work out of the God Mode prerequisite PR.
