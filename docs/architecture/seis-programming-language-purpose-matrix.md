# SEIS Programming Language Purpose Matrix

Date: 2026-07-07  
Status: reference intake ready for local-demo implementation  
Contract: `content/development/seis-programming-language-purpose-matrix.json`

This document turns the supplied programming-language reference images into a practical SEIS architecture layer. The point is not to add every language at once. The point is to decide **which language belongs to which SEIS purpose**, then expand safely.

## 1. Core Rule

SEIS should be polyglot, but not chaotic.

A language is accepted into SEIS only when it has:

- a clear product surface
- a scoped reason
- a validation path
- a rollback path
- no hidden credential or deployment dependency

## 2. Current SEIS Core

| Area | Languages | Reason |
| --- | --- | --- |
| Web demo and product UI | HTML, CSS, JavaScript | Existing local-first browser surfaces |
| Contracts and docs | JSON, Markdown, YAML | Governance, roadmaps, validation, docs |
| Repo automation | Node.js, Python, Shell | Validators, reports, local checks |
| Server/API boundary | Node.js, JSON | Current read-only local server contract |
| Data planning | SQL, JSON Schema | Future durable data model |
| Apple-first future | Swift, SwiftUI | Native macOS/iPadOS/iOS direction |

## 3. Purpose-Based Language Map

| Purpose | Primary languages | SEIS use |
| --- | --- | --- |
| Web Sites / Product UI | HTML, CSS, JavaScript, TypeScript, Python, PHP, Ruby | SEIS website, Desktop OS, Search, Code, Design, Cloud, Store, Agents |
| Desktop Applications | C++, Java, Python, Swift, C#, VB.NET | Future native helpers and platform apps |
| Operating Systems / System UX | C, C++, Rust, Assembly, Swift, Python, Java | Linux-like SEIS OS reference lab and lower-level tooling research |
| Mobile Applications | Swift, Kotlin, Java, Dart, Objective-C, XML | Apple-first mobile path and future Android companion |
| Game / 3D / Interactive Worlds | C++, C#, Python, Java, JavaScript, Kotlin, Unity, Unreal | Mythic Gacha, creative worlds, interactive showcases |
| AI / ML / Data Science | Python, SQL, R, Julia, Java, C++, Scala | AI Core, RAG, evaluation, embeddings, analytics |
| Backend / API / Enterprise | Node.js, Python, Java, C#, Go, Ruby, PHP, Scala | Provider router, APIs, future durable backend |
| DevOps / Cloud / Automation | Bash, Shell, Python, YAML, Dockerfile, HCL, Go, PowerShell | CI, validators, cloud readiness, deployment plans |
| Security / Governance | Python, Bash, Shell, C, C++, Rego, YAML | Secret scanning, policy checks, permissions, audit logs |

## 4. Priority Interpretation

The supplied charts heavily emphasize JavaScript, HTML/CSS, SQL, Python, Java, Bash/Shell, TypeScript, C#, C++, and PHP. SEIS should use that as a **directional planning signal**, not as a live popularity benchmark.

Practical interpretation:

1. **Keep web surfaces strong first** — HTML/CSS/JavaScript are already the demo foundation.
2. **Strengthen contracts and automation** — Node.js, Python, Shell, JSON, Markdown, YAML.
3. **Prepare real full-stack expansion** — SQL, TypeScript, Java/Spring, Python backend, provider router.
4. **Protect native ambition** — Swift first for Apple, Kotlin for Android later.
5. **Keep systems power separated** — C, C++, Rust, Assembly belong in a later system lab, not in the current demo by default.

## 5. SEIS Language Routing

| SEIS route / layer | Primary language choice | Status |
| --- | --- | --- |
| `apps/web` | HTML, CSS, JavaScript | Working |
| `server/node` | Node.js, JSON | Working local-demo read-only |
| `scripts` | Node.js, Python, Shell | Working / expandable |
| `content/development` | JSON | Working contract layer |
| `docs/architecture` | Markdown, Mermaid, JSON | Working planning layer |
| Future Apple app | Swift, SwiftUI | Planned |
| Future Android companion | Kotlin, Java | Planned |
| Future backend lane | Java/Spring, Python, SQL | Planned |
| Future AI/data lane | Python, SQL, R, Julia | Planned |
| Future system lab | C, C++, Rust, Assembly | Planned / approval required |

## 6. What To Build Next

### Slice 01 — Language Purpose Center

Add a local SEIS page that explains which language is used for which purpose.

Safe because:

- static route only
- no provider calls
- no dependencies
- no credentials
- no deployment

### Slice 02 — Language-Aware Agent Planning

Agents should not pick languages randomly. They should choose language by:

- product surface
- existing repo layer
- risk level
- validation command
- approval boundary

### Slice 03 — Native / Backend Gates

Before Swift, Kotlin, Java/Spring, Rust, C++, Docker, Kubernetes, Unity, or Unreal work starts, SEIS needs:

- contract
- folder boundary
- build command
- dependency approval
- rollback note

## 7. Developer Guardrails

Do not do this:

- add every trendy language to the runtime
- rewrite working HTML/CSS/JavaScript screens without proof
- install Spring, Unity, Unreal, Docker, Kubernetes, or mobile SDKs in the same PR
- claim screenshots are current market statistics without fresh verification
- mix live provider calls into static demo work

Do this instead:

- keep the current working web demo stable
- create language-specific lanes
- add validators gradually
- document planned vs working honestly
- connect every language to a real SEIS purpose

## 8. Recommended Follow-Up PR

```text
feat: add SEIS language purpose center
```

Suggested scope:

- `apps/web/language-matrix.html`
- `content/development/seis-programming-language-purpose-matrix.json`
- a validator or smoke check in a later PR

Goal: make SEIS feel like a serious engineering system, not a random stack list.
