# SEIS AI Command Core

`SeisAICommandCore` is a SwiftUI desktop demo application for the SEIS AI
operating layer.

It is intentionally local and deterministic:

- no provider API key is requested
- no live model call is made
- no SSH, deployment, credential, or destructive action is executed
- approval and redaction controls are visible in the app
- run state and audit history are stored locally with `UserDefaults`

## Features

- Ask SEIS composer
- Model-router score panel
- Agent runtime queue
- Prompt version manager
- Knowledge and evidence panel
- Evaluation score strip
- Human approval gate
- Audit timeline with copy action
- Settings window
- Toolbar and command menu shortcuts

## Build

From the repository root:

```bash
swift build --package-path packages/seis_platform_swift --product SeisAICommandCore
```

## Verify App Bundle

```bash
./script/build_and_run.sh --ai-demo --verify
```

## Release Readiness

Run the full release-candidate gate:

```bash
npm run check:seis-ai-command-core
```

The release boundary is documented in
[`docs/deployment/seis-ai-command-core-release-readiness.md`](../../../docs/deployment/seis-ai-command-core-release-readiness.md).
The current app bundle is for local verification and PR review; public macOS
distribution still requires signing, notarization, release notes, and explicit
human approval.

## Open

```bash
./script/build_and_run.sh --ai-demo
```
