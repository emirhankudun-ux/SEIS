# Development Automation

This workspace uses a low-power development automation loop for long SEIS sessions.

## Purpose

- Confirm the workspace routing policy before deeper work starts.
- Run lightweight foundation and JavaScript syntax checks.
- Detect whether the current folder is connected to Git.
- Detect whether GitHub CLI authentication is available before any origin push attempt.
- Return the next few reversible development actions without starting heavy servers or release builds.

## Command

```bash
npm run automation:develop
```

GitHub publish preflight:

```bash
npm run automation:publish-readiness
```

JSON örnekleri (`--json`):

```bash
npm run automation:publish-readiness -- --json
```

Başarılı:

```json
{
  "ok": true,
  "mode": "publish-readiness",
  "generatedAt": "2026-06-18T08:23:12.101Z",
  "gitState": {
    "gitInside": true,
    "branchName": "main",
    "isExpectedBranch": true,
    "worktreeClean": true,
    "hasUpstream": true,
    "isExpectedUpstream": true,
    "behindCount": 0
  },
  "github": {
    "ok": true,
    "reason": "GitHub CLI authentication is available."
  },
  "blockers": [],
  "nextAction": "GIT_TERMINAL_PROMPT=0 git push origin main"
}
```

Başarısız:

```json
{
  "ok": false,
  "mode": "publish-readiness",
  "generatedAt": "2026-06-18T08:23:12.101Z",
  "gitState": {
    "gitInside": true,
    "branchName": "main",
    "isExpectedBranch": true,
    "worktreeClean": true,
    "hasUpstream": true,
    "isExpectedUpstream": true,
    "behindCount": 2
  },
  "github": {
    "ok": false,
    "reason": "GitHub CLI auth is missing or token scope is insufficient.",
    "suggestions": [
      "gh auth refresh -h github.com -s codespace -s repo"
    ]
  },
  "blockers": [
    {
      "area": "github-auth",
      "reason": "GitHub CLI auth is missing or token scope is insufficient.",
      "nextStep": "gh auth refresh -h github.com -s codespace -s repo"
    }
  ],
  "nextAction": "gh auth refresh -h github.com -s codespace -s repo"
}
```

Örnek başarısız `github-cli` durumu (komut bulunamadı):

```json
{
  "ok": false,
  "mode": "publish-readiness-fallback-gh-cli-missing",
  "status": 1,
  "reason": "GitHub CLI is missing in this environment.",
  "nextStep": "brew install gh",
  "suggestions": ["brew install gh", "gh auth login -h github.com"],
  "gracefulFallback": {
    "reasonCode": "github-cli-missing",
    "recommendedActions": ["brew install gh", "gh auth login -h github.com"],
    "command": "node scripts/check-github-publish-readiness.mjs --json"
  },
  "fallback": {
    "exitCode": 1,
    "error": {
      "code": "ENOENT",
      "name": "Error"
    }
  }
}
```

This publish check does not commit or push. It verifies the Git working tree, expected `main` branch, `origin` remote to the SEIS repository, GitHub CLI authentication, and local automation health before a server-side push is attempted.

CI tek satır özeti:

```bash
npm run automation:publish-readiness -- --ci
```

Özet çıktısı (örnek):

```text
publish-readiness=blocked; blockers=git; next=switch to main before publish preflight
```

`--ci` fallback örneği (GH CLI yokken):

```text
publish-readiness=blocked; blockers=github-cli; next=brew install gh
```

Not: GitHub kimlik doğrulama hattı hâlen fail olduğunda örnek çıktısı:

```text
publish-readiness=blocked; blockers=github-auth; next=gh auth refresh -h github.com -s codespace -s repo
```

Quality governance publish (CI):

```bash
npm run quality:governance:publish:ci
```

JSON örneği almak için:

```bash
npm run quality:governance:publish -- --json
```

Dil dağılımı eşleşmiyorsa (ör. `check:language-distribution` stale), otomatik düzeltme için:

```bash
npm run quality:governance:publish -- --json --auto-heal
```

Örnek başarılı çıktı:

```json
{
  "ok": true,
  "mode": "quality:governance:publish",
  "generatedAt": "2026-06-18T11:44:12.101Z",
  "nextStep": null,
  "steps": [
    { "id": "check:publish-gate-contract", "ok": true },
    { "id": "check:open-source-governance", "ok": true },
    { "id": "check:seis-master-prompt-report", "ok": true }
  ],
  "blockers": [],
  "summary": {
    "total": 16,
    "failed": 0,
    "continue": false
  }
}
```

Örnek başarısız çıktı (GitHub token eksik):

```json
{
  "ok": false,
  "mode": "quality:governance:publish",
  "generatedAt": "2026-06-18T11:45:01.101Z",
  "nextStep": "npm run check:publish-gate-contract",
  "steps": [
    { "id": "check:publish-gate-contract", "ok": true },
    { "id": "check:open-source-governance", "ok": false, "reason": "command failed with exit 1" }
  ],
  "blockers": [
    {
      "area": "check:open-source-governance",
      "reason": "gh auth status required: missing scope or login",
      "status": 1,
      "command": "npm run check:open-source-governance"
    }
  ],
  "summary": {
    "total": 2,
    "failed": 1,
    "continue": false
  }
}
```

CI'de tek satır özet:

```bash
npm run quality:governance:publish:ci
```

Örnek:

```text
quality:governance:publish=blocked; blockers=check:open-source-governance; next=check:open-source-governance
```

Artifact:

Komut, CI modunda otomatik olarak `reports/quality-governance-publish-report.json` üretir. İsterseniz farklı bir yol verebilirsiniz:

```bash
node scripts/quality-governance-publish.cjs --artifact reports/custom/quality-publish.json --json
```

Weekly full-efficiency report:

```bash
npm run automation:weekly-report
```

This report keeps the long-running development loop reviewable without raising machine pressure. It writes `dist/weekly-efficiency-report.json` and summarizes low-pressure governance, release artifact freshness signals, Git readiness, GitHub authentication, local automation health, and publish blockers.

Optional JSON report:

```bash
node scripts/run-development-automation.mjs --write-report
```

The JSON report is written to `dist/development-automation-report.json`, which stays outside source control.

If deploy readiness reports a package/manifest hash mismatch, refresh the generated release artifacts:

```bash
npm run automation:refresh-release
```

The same refresh command is required when packaged source files are newer than the current server manifest.

Fast surface refresh (universal capability kernel + AI manifest + language matrix + language distribution + plugin sources + release sync):

```bash
npm run automation:refresh-seis-surface
```

This command executes the full local surface refresh pipeline in order, validates each generated artifact, and writes
`reports/automation-refresh-seis-surface-summary.json`.
It now starts with `automation:ecosystem-intake`, which generates SEIS-owned third-party adaptation, toolchain runtime,
and desktop app integration reports before plugin/environment source sync.
It also runs `automation:universal-capability-kernel`, which keeps engineering, design, data, AI, MCP, skills, plugins,
LLM routing, security, DevOps, SRE, robotics, formal methods, and lifecycle domains visible as one checked SEIS contract.
It also runs `automation:language-distribution`, which reads `.gitattributes`, keeps generated/vendor surfaces out of the
GitHub language signal, and writes `reports/language-distribution.json` plus `reports/language-distribution.md`.

```bash
npm run automation:refresh-seis-surface -- --summary
npm run automation:refresh-seis-surface -- --verbose
npm run automation:refresh-seis-surface -- --help
```

For automation/CI environments, use:

```bash
npm run automation:refresh-seis-surface:ci
```

CI mode also runs plugin-bundle and AI launcher offline-fallback checks after the standard surface validations.

Third-party feature intake (tek bir aday haritası halinde karşılaştırma):

```bash
npm run intake:third-party
```

The command compares the `SEIS/` snapshot with current repo and creates:

- `reports/third-party-intake-blueprint.json`
- `reports/third-party-intake-blueprint.md`

Önemli uyumsuzluk alanlarını "yüksek/critical" başlığı altında gösterir ve doğrudan next-step listesi üretir.

SEIS ecosystem intake (third-party source safety + languages/agents + desktop apps):

```bash
npm run automation:ecosystem-intake
npm run check:ecosystem-intake
```

Generated outputs:

- `content/development/third-party-adaptation-plan.json`
- `content/development/toolchain-runtime-readiness.json`
- `content/development/desktop-app-integration.json`
- `reports/third-party-adaptation-plan.md`
- `reports/toolchain-runtime-readiness.md`
- `reports/desktop-app-integration.md`

This command does not delete third-party folders, install large runtimes, or push to GitHub. It keeps those actions gated
until SEIS-owned implementation, license review, and user confirmation are complete.

Language distribution budget:

```bash
npm run automation:language-distribution
npm run check:language-distribution
```

This report tracks the long-term JavaScript 10% target without hiding real source work. Heavy language/runtime installs stay
approval-gated; the first pass uses installed runtimes and migrates code only when checks can protect behavior.

Universal capability kernel:

```bash
npm run automation:universal-capability-kernel
npm run check:universal-capability-kernel
```

The kernel writes `content/development/seis-universal-capability-kernel.json`,
`reports/seis-universal-capability-kernel.json`, and `reports/seis-universal-capability-kernel.md`.
It is the broad SEIS coverage contract for AI agent, MCP, skills, plugins, LLM orchestration, engineering, product,
design, data, security, operations, research, and governance domains.

Kendi iCloud GitHub klasörünü hızlıca incelemek ve fotoğraf, kod, konfigürasyon varlık dağılımını görmek için:

```bash
npm run scan:icloud-personal-assets
```

Raporlar:

`reports/icloud-personal-inventory.json` ve `reports/icloud-personal-inventory.md`

If `automation:refresh-release` is run directly, refresh this command afterwards to keep plugin source and AI matrix surfaces
`content/development/` and release surfaces in `release/web/` fully aligned.

## Operating Rules

- Keep the loop dependency-free.
- Keep checks static and local by default.
- Do not start a dev server, browser automation, Docker, or release packaging from this command.
- Treat missing Git as a publish blocker in local staging workspaces, not as a content failure.
- Treat missing GitHub authentication as a push blocker, not as a development blocker.
- When checks are green but publish blockers remain, keep returning a local reversible improvement path so development does not stall.
- Run `npm run automation:publish-readiness` before any GitHub server push attempt.
- Run `npm run automation:weekly-report` for weekly or long-session checkpoints.
- Refresh release artifacts after source changes that affect the static package.
- Keep deploy readiness strict about both package hash integrity and source freshness.

## Escalation

Use heavier commands only when release packaging is explicitly needed:

```bash
npm run build:static
npm run prepare:server
npm run plan:upload
```

Use GitHub publishing only after the actual repository is connected and authentication is available:

```bash
gh auth login -h github.com
git push origin main
```
