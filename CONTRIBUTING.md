# Contributing to SEIS

Thank you for helping improve SEIS. This project is an AI-native open source
platform, so contributions should strengthen long-term architecture, security,
documentation, accessibility, and maintainability.

## Contribution Principles

- Keep changes small, reviewable, and reversible.
- Prefer architecture clarity over quick patches.
- Add features only when they fit the SEIS platform model.
- Do not add dependencies, SDKs, runtimes, or generated assets without a clear
  reason and a rollback path.
- Never commit secrets, tokens, `.env` files, private credentials, or personal
  data.

## Branch Model

`main` is the only permanent branch.

Forks and short-lived branches are welcome for pull requests, but they are
staging surfaces only. Every accepted change must merge back into `main`.

## Before You Open a PR

1. Open an issue for actionable bugs or scoped work. Open a discussion for
   broad architecture, Q&A, show-and-tell, new platform lanes, new dependencies,
   security-sensitive design questions, or large generated output.
2. Read the
   [`first-run quickstart`](./docs/development/first-run-quickstart.md),
   [`AGENTS.md`](./AGENTS.md), and the relevant docs under [`docs`](./docs).
3. Run the lightest relevant checks:

```bash
npm run check:open-source-governance
npm run seis:check
```

4. Add focused tests or validation notes when behavior changes.

## Platform Language Policy

Apple-first work should stay focused on Swift, SwiftUI, Objective-C, Metal,
AppKit, UIKit, Combine, Core Data, and CloudKit when those technologies are
practical for the problem.

Windows and Android work may use C#, .NET, C++, Rust, WinUI, Kotlin, Java,
Jetpack Compose, TypeScript, Go, Zig, Python when needed, and JavaScript when
needed.

Do not ask contributors to install every language toolchain. If a contribution
requires a runtime or SDK, document why it is needed, whether it is optional, and
how the check behaves when the tool is missing.

## Pull Request Checklist

- The change is aligned with SEIS mission and architecture.
- The PR explains the problem, the solution, and the affected paths.
- Security and privacy risks were considered.
- Documentation was updated when behavior, policy, or user workflow changed.
- Tests or manual validation are listed.
- No unrelated formatting churn or bulk rewrites were included.

## AI-Assisted Contributions

AI tools are allowed when the contributor remains accountable for the result.
Review generated code carefully, avoid copying proprietary material, and disclose
AI assistance in the PR when it materially shaped the change.

SEIS commonly uses Codex / ChatGPT for implementation and Claude for
architecture or review support, but no AI output is accepted without human
review.

## Community

Please follow [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md). Use
[Discussions](https://github.com/emirhankudun-ux/SEIS/discussions) for ideas,
Q&A, and examples. For security reports, use [`SECURITY.md`](./SECURITY.md)
instead of public issues or discussions.
