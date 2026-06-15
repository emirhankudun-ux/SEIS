# First-Run Quickstart

This guide gets a new contributor from clone to useful validation without
installing unrelated SDKs, runtimes, or language toolchains. Start here before
opening a bug report, feature request, pull request, or agent handoff.

## 1. Clone And Inspect

```bash
git clone https://github.com/emirhankudun-ux/SEIS.git
cd SEIS
git status --short
git branch --show-current
git remote -v
```

> If your environment is cloud-only, prefer:
>
> - [SEIS Cloud Workspace with GitHub Codespaces](../deployment/seis-codespaces-cloud-workspace.md)

Expected:

- the branch is `main`
- the remote points at `emirhankudun-ux/SEIS`
- the worktree is clean before you make changes

## 2. Check The Lightweight Baseline

Use Node.js 18 or newer for the root governance scripts.

```bash
node --version
npm run check:open-source-governance
npm run check:foundation
```

These checks validate the public repository surface, community health files,
branch model, CodeQL wiring, and core SEIS identity.

## 3. Run The Standard Local Quality Gate

```bash
npm run quality
```

Before opening an SSH-dependent release handoff, run:

```bash
npm run cloud:migration:audit
```

This audit highlights local SSH/localhost assumptions in deployment examples and
recommends the correct cloud path for public and team workflows.

This is the default local validation gate for small documentation, governance,
web, platform-policy, and repository-health changes.

It intentionally avoids production builds, broad indexing, and installing every
platform SDK. If a future check asks for a missing tool, install only the tool
needed for the lane you are actively changing.

## 4. Choose A Platform Lane

After the baseline passes, move into the narrow lane that matches your work.

| Lane | First command |
| --- | --- |
| Apple native | `swift test --package-path packages/seis_platform_swift` |
| Apple shell app | `./script/build_and_run.sh --verify` |
| AI and MCP package | `npm test --prefix packages/seis-ai` after installing that package's dependencies |
| Web audit | `npm run seis:check` |
| Platform language policy | `npm run check:seis-platform-language-policy` |
| Platform capability kernel | `npm run check:seis-platform-kernel` |
| Universal capability kernel | `npm run check:universal-capability-kernel` |

Do not install Swift, Xcode, Android Studio, .NET, Rust, Go, Java, Python
packages, or other toolchains unless your change is in that lane and the
validation evidence requires it.

The Apple shell app also has a Codex app `Run` action wired through
`.codex/environments/environment.toml`. That action calls
`./script/build_and_run.sh`, which builds `SeisAppleNativeShell`, stages a local
`.app` bundle under `dist/`, launches it as a foreground macOS app, and supports
`--debug`, `--logs`, `--telemetry`, and `--verify` modes for focused debugging.

## 5. Inspect The Product Surface When Needed

Only run a local static server when the change affects the web UI, visuals,
navigation, accessibility, motion, or service worker behavior.

```bash
python3 -m http.server 4174 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:4174/apps/web/index.html
```

Expected smoke signals:

- no console errors
- the main landmark is present
- low-motion behavior works
- navigation anchors move to sections
- artwork and cockpit data render when their source files are present

## 6. Prepare A Small Change

Before editing:

- read the relevant docs and nearby source files
- prefer updating existing files before adding new files
- keep the diff small, reversible, and architecture-aligned
- avoid dependency bloat and generated output unless it is required
- never commit secrets, credentials, personal data, `.env` contents, or private
  logs

Before committing:

```bash
npm run quality
git diff --check
git status --short
```

Add lane-specific checks when behavior changes.

## 7. AI-Assisted Development

AI assistance is part of the SEIS workflow, but the human contributor remains
accountable for the result.

- Codex / ChatGPT is the primary execution and repository automation partner.
- Claude may support architecture review, long-context reasoning, or second-pass
  analysis.
- Keep one assistant in writer mode at a time.
- Ask secondary assistants to review the diff, not overwrite active work.
- Disclose material AI assistance in pull requests when it shaped the change.

## 8. Where To Go Next

- [`README.md`](../../README.md) for mission, architecture map, and GitHub growth
  strategy.
- [`CONTRIBUTING.md`](../../CONTRIBUTING.md) for contribution rules.
- [`SUPPORT.md`](../../SUPPORT.md) for questions, bugs, ideas, features, and
  security routing.
- [`docs/testing/lightweight-checks.md`](../testing/lightweight-checks.md) for
  deeper lightweight validation notes.
- [`docs/governance/github-market-readiness.md`](../governance/github-market-readiness.md)
  for adoption and public readiness gates.
