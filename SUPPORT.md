# Support

SEIS support is structured to keep the project useful, safe, and sustainable.
Use the smallest public surface that fits the question, and keep private or
security-sensitive details out of public threads.

## Where To Ask

| Need | Best place |
| --- | --- |
| Implementation question | [Discussions Q&A](https://github.com/emirhankudun-ux/SEIS/discussions/categories/q-a) |
| Broad idea or platform direction | [Discussions Ideas](https://github.com/emirhankudun-ux/SEIS/discussions/categories/ideas) |
| Example, demo, or learning note | [Discussions Show and Tell](https://github.com/emirhankudun-ux/SEIS/discussions/categories/show-and-tell) |
| Reproducible bug | [Bug report](https://github.com/emirhankudun-ux/SEIS/issues/new/choose) |
| Scoped feature request | [Feature request](https://github.com/emirhankudun-ux/SEIS/issues/new/choose) |
| Vulnerability or secret exposure | Follow [`SECURITY.md`](./SECURITY.md) |

Security reports must stay private. Do not post API keys, tokens, credentials,
personal data, exploit details, or private repository information in issues,
pull requests, discussions, screenshots, logs, or AI handoff notes.

## What To Include

- A short goal or problem statement.
- The affected path, package, platform lane, workflow, or command.
- Expected behavior and actual behavior.
- Relevant OS, browser, runtime, or tool version when it matters.
- The checks you ran, such as `npm run seis:check` or
  `npm run check:open-source-governance`.
- Any dependency, SDK, cloud, privacy, security, or rollback concern.

## Platform Lanes

SEIS support questions should name the primary lane when possible:

- Apple first: Swift, SwiftUI, Objective-C, AppKit, UIKit, Metal, Combine, Core
  Data, CloudKit.
- AI systems: agents, MCP, skills, plugins, LLM workflows, memory, RAG,
  evaluation, and governance.
- Full stack: web, frontend, backend, APIs, desktop, mobile, and game systems.
- Data and ML: analytics, data engineering, machine learning, NLP, computer
  vision, big data, and AI governance.
- Platform operations: GitHub, cloud, DevOps, SRE, security, testing, releases,
  and repository governance.
- Design systems: UX, UI, accessibility, motion, branding, typography, and
  product experience.

## Toolchain Discipline

Do not install every language runtime or SDK just to ask a question. If a
support request requires a runtime, explain why it is needed and whether the
check can skip gracefully when the tool is absent.

Apple platform work should stay Apple-native when practical. Windows and
Android lanes may use the broader polyglot stack when the language or runtime
has a clear platform role.

## AI-Assisted Support

AI assistance is welcome when the human contributor remains accountable. If
Codex, ChatGPT, Claude, Gemini, or another assistant materially shaped a support
request, issue, pull request, or review, disclose that briefly and include the
validation you performed.

## Response Model

SEIS is maintainer-led and support is best effort. Security reports follow the
response targets in [`SECURITY.md`](./SECURITY.md). Public support is prioritized
by reproducibility, architecture fit, user impact, security risk, and whether the
request strengthens the long-term platform.
