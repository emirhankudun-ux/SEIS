# SEIS Universal Language Atlas

Date: 2026-07-07  
Status: universal language coverage policy ready  
Policy contract: `content/development/seis-universal-language-atlas.json`  
Sync script: `scripts/sync-seis-github-linguist-language-atlas.mjs`

SEIS will treat the language list like a serious engineering atlas, not like a promise to install every compiler in the world.

The goal is to recognize, classify, search, route, and plan against every GitHub-known language while keeping runtime execution gated and safe.

## 1. Source of Truth

The official upstream source for the universal catalog is GitHub Linguist:

```text
github-linguist/linguist/lib/linguist/languages.yml
```

This source defines all languages known to GitHub and includes language metadata such as type, extensions, filenames, language IDs, TextMate scope, aliases, colors, groups, interpreters, and wrap behavior.

## 2. The SEIS Rule

Recognizing every language is safe.

Executing every language is not.

SEIS should support these levels separately:

| Level | Meaning | Allowed by default? |
| --- | --- | --- |
| Recognize | Show the language in search, files, docs, and catalogs | Yes |
| Document | Explain what the language is useful for | Yes |
| Parse metadata | Read extension, color, alias, type, and group metadata | Yes |
| Validate contract | Check whether a language belongs to a SEIS lane | Yes |
| Execute runtime | Compile, interpret, run, deploy, or install toolchains | No |

## 3. Activation Tiers

| Tier | Label | Meaning | Examples |
| --- | --- | --- | --- |
| 0 | Active SEIS Core | Already part of current repository workflows | HTML, CSS, JavaScript, Node.js, Python, Shell, JSON, Markdown, YAML |
| 1 | Ready Extension | Can be added through a scoped PR when needed | TypeScript, SQL, Swift, Kotlin, Java, Go, Rust, C# |
| 2 | Contract Only | Can appear in docs, examples, parsers, schemas, or plans | C, C++, Assembly, R, Julia, Scala, Ruby, PHP, Lua |
| 3 | Reference Only | Useful for search/indexing/education, not runtime | ABAP, Ada, ALGOL, APL, BASIC, COBOL, Common Lisp, Fortran, Pascal, Prolog |
| 4 | Blocked Until Approval | Requires compilers, engines, SDKs, GPU stacks, cloud, or security review | Cuda, Unity, Unreal, Dockerfile, HCL, Solidity, Move, Cairo, Arduino, Bicep |

## 4. Why This Matters

The user-supplied screenshots showed the GitHub language selector with hundreds of languages: mainstream languages, old languages, formal methods, build formats, configs, esoteric languages, graphics/audio formats, and cloud/infrastructure formats.

SEIS should not ignore them. But it should not turn them into chaos either.

This atlas gives SEIS a calm way to say:

- I can recognize this language.
- I know what family it belongs to.
- I know whether it is active, planned, reference-only, or blocked.
- I know whether a sub-agent is allowed to use it.
- I know which validation or approval gate is required first.

## 5. Language Families

| Family | Examples | SEIS use |
| --- | --- | --- |
| Web / Markup | HTML, CSS, JavaScript, TypeScript, Astro, ASP.NET, Blade, Antlers, AsciiDoc | Website, Desktop OS, docs, product UI |
| Systems / Native | C, C++, Rust, Zig, Assembly, Objective-C, Swift, Ada | Native apps, low-level tooling, Apple-first work |
| Backend / Enterprise | Java, C#, Go, Python, Ruby, PHP, Scala, Kotlin, Apex, ABAP | APIs, service lanes, provider routers |
| Data / AI / Science | Python, SQL, R, Julia, MATLAB, CSV, JSON, Avro IDL, CWL | RAG, evaluation, analytics, data import/export |
| DevOps / Config | Shell, Bash, Batchfile, PowerShell, Dockerfile, HCL, Bicep, ApacheConf, Caddyfile | CI, cloud readiness, server config |
| Formal Methods | B, Alloy, Agda, Coq, Curry, Answer Set Programming, Prolog | Future correctness and specification research |
| Creative / Media | Csound, Cue Sheet, COLLADA, GLSL, WGSL, Processing, SVG | Creative coding, graphics, audio, 3D and motion |
| Legacy / Esoteric | 1C Enterprise, 2-Dimensional Array, 4D, Befunge, BQN, Cool, BlitzBasic | Recognition and educational reference |

## 6. Sync Workflow

Default offline check:

```bash
node scripts/sync-seis-github-linguist-language-atlas.mjs
```

Generate from visible seed list:

```bash
node scripts/sync-seis-github-linguist-language-atlas.mjs --write
```

Generate from GitHub Linguist upstream when internet access is intentionally allowed:

```bash
node scripts/sync-seis-github-linguist-language-atlas.mjs --sync-linguist --write
```

The generated output path is:

```text
content/development/seis-github-linguist-language-atlas.generated.json
```

## 7. Non-Negotiable Guardrails

Do not:

- install every compiler or interpreter
- add every runtime to CI
- execute untrusted code just because it has a language name
- treat reference-only languages as production dependencies
- use this atlas to bypass provider, SSH, deployment, cloud, database, or sandbox gates

Do:

- recognize every language
- classify it by family and activation tier
- map it to a SEIS purpose
- keep current active surfaces stable
- require approval for execution, toolchain install, deployment, or new runtime support

## 8. Recommended Next UI Work

```text
feat: add universal language selector to SEIS Language Center
```

This should add search/filter support for:

- Active Core
- Ready Extension
- Contract Only
- Reference Only
- Blocked Until Approval

That gives SEIS the feeling of the GitHub language picker, but with actual product governance behind it.
