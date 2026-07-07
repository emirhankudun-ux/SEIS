# AI CLI Stack

This workspace supports a multi-agent terminal stack through a single router.

## Router

```bash
npm run ai -- list
npm run ai -- auto "quick repo patch"
npm run ai -- auto "quick repo patch" :: --help
npm run ai -- seis-agent
npm run ai -- openai
npm run ai -- codex
npm run ai -- antigravity
npm run ai -- antigravity-ide
npm run ai -- cursor
npm run ai -- lmstudio
npm run ai -- lms --version
npm run ai -- xcode
npm run ai -- claude
npm run ai -- gemini
npm run ai -- qwen
npm run ai -- kimi
npm run ai -- ollama
npm run ai -- opencode
npm run ai -- aider
npm run ai -- interpreter
npm run ai -- hermes
npm run ai -- goose
npm run ai -- open-design
```

`auto` mode uses `scripts/ai-routing-policy.cjs`.

Not:
`auto` mode first chooses a helper from policy; if that helper is not installed locally, it automatically falls back to `seis-agent` and keeps orchestration alive.
`auto` mode ayrıca local yardımcıda hazır/kurulum durumu eksikse aynı şekilde fallback yapar (örneğin API anahtarı veya Ollama daemon’u yoksa).
`auto` mode ek: eğer seçilen helper (openai/claude/gemini/kimi) çevrimdışı olarak değerlendirilirse ve Ollama çalışıyorsa, otomatik olarak önce Ollama’ya geçer. Ollama da yoksa en son SEIS Agent’a düşer.
W64 routing rule: eligible fallback is local-first when adequate, then owner-selected, then approved cloud providers by capability/privacy/cost, and finally SEIS Agent or Local Demo. If a model/provider limit is reached, the route must be marked `Rate Limited` or blocked for that decision, the fallback identity must be visible, and SEIS must not pretend the next model is the original one.

Hermes Computer Use protocol:
`content/development/seis-hermes-computer-use-protocol.json` defines the safe
Hermes submit path: use `type_text` to update the app state, confirm the control
is `Send`, avoid the voice control, and record a repo-only ledger without
secrets, provider-call claims, or model-output evidence unless a response is
visibly captured.

Current routing intent:

- `seis-agent`: default orchestration for repo governance, release, and policy-sensitive work.
- `codex`: primary repo execution lane when explicitly requested.
- `antigravity`: Antigravity 2.x desktop surface for AI-native workspace sessions.
- `antigravity-ide`: preferred local IDE surface for SEIS repo/worktree work.
- `cursor`: secondary AI editor/review surface; keep one writer active.
- `lmstudio`: local model lab desktop route; no provider or model availability is claimed.
- `lms`: LM Studio CLI for local model lab status after LM Studio is initialized.
- `xcode`: Apple platform IDE for Swift, SwiftUI, signing, simulators, and macOS/iOS builds.
- `aider`: small existing-file patches, refactors, and diff-oriented edits.
- `openai`: local analysis and summarization on demand.
- `gemini`: browser-led research, source lookup, and documentation comparison.
- `qwen`: alternative reasoning and cross-check helper.
- `opencode`: terminal coding helper, still routed through SEIS policy.
- `ollama`: explicitly local, offline, or privacy-first drafting.
- `hermes`: bounded agent gateway and MCP-oriented helper.
- `goose`: general local automation agent helper.
- `open-design`: Open Design desktop route for design artifacts and prototype previews.
- `seis-agent`: remote policy layer; never executes local inference itself.

Canonical specialist ownership lives in
[`agents/ai-workforce-assignments.md`](agents/ai-workforce-assignments.md)
with the machine-readable contract at
`content/development/ai-workforce-assignments.json`. The contract keeps Codex
as the only default writer while Claude, Qwen, Gemini, CodeRabbit, Ollama,
OpenDesign, Kimi, OpenCode, and GitHub Actions operate as scoped reviewers,
designers, private draft helpers, or validators.

Yerelde doğrudan çağırmak için:

```bash
npm run ai -- openai api list
npm run ai -- gemini --help
npm run ai -- qwen --help
npm run ai -- opencode --help
npm run ai -- ollama list
npm run ai -- lmstudio
npm run ai -- lms --version
npm run ai -- hermes --version
npm run ai -- goose --version
npm run ai -- open-design
```

Not: Gemini CLI güvenli klasör uyarısı verirse `GEMINI_CLI_TRUST_WORKSPACE=true` ekleyerek çalıştırabilirsin.
Not: Open Design bu workspace’te masaüstü uygulaması olarak `open-design` route’u üzerinden açılır. macOS `/usr/bin/od` komutu Open Design değildir; SEIS bunu alias olarak kullanmaz.

Duruma göre otomatik yönlendirme:

```bash
npm run ai -- auto "browser research for docs mcp"    # → gemini (anahtarlar varsa) / yoksa fallback: seis-agent
npm run ai -- auto "local offline llama draft"        # → ollama (daemon açıksa) / yoksa fallback: seis-agent
npm run ai -- auto "quick repo patch with internet down" # → ollama (eğer açık) / yoksa fallback: seis-agent
npm run ai -- auto "antigravity ide workspace"      # → antigravity-ide / yoksa fallback: seis-agent
npm run ai -- auto "cursor review"                  # → cursor / yoksa fallback: seis-agent
npm run ai -- auto "lm studio local model lab"      # → lmstudio / yoksa fallback: seis-agent
npm run ai -- auto "xcode swiftui signing"          # → xcode / yoksa fallback: seis-agent
npm run ai -- auto "hermes mcp gateway"               # → hermes / yoksa fallback: seis-agent
npm run ai -- auto "goose general agent"              # → goose / yoksa fallback: seis-agent
npm run ai -- auto "open design prototype"            # → open-design desktop app / yoksa fallback: seis-agent
```

Rol bazlı öneri örnekleri:

```bash
npm run ai -- auto "designer: hero alanı için mikrocopy düzenle"
npm run ai -- auto "engineer: build pipeline bug'ını patch et"
npm run ai -- auto "software: migration roadmap ve risk analizi çıkar"
```

Kısa yol rol komutları:

```bash
npm run ai -- designer "hero alanı için mikrocopy düzenle"
npm run ai -- engineer "build pipeline bug'ını patch et"
npm run ai -- software "release stratejisi ve risk analizini çıkar"
```

Not: Bu kısa yollarda router önce rol önceliğini alır:
- `designer` -> `claude`
- `engineer` -> `aider`
- `software` -> `openai`

- `AI_FORCE_OFFLINE=1` ile `auto` modu offline-first çalışır; bu durumda openai/claude/gemini/kimi gibi online odaklı yardımcılar eksikse önce `ollama` denenir.
- `AI_FORCE_ONLINE=1` ile offline fallback atlanır; normal kullanılabilirlik kontrolü uygulanır.

- `antigravity`, `antigravity-ide`, `cursor`, `lmstudio` ve `xcode`: masaüstü uygulama
  rotalarıdır; CLI command yoksa bile `open` üzerinden manuel/istek bazlı açılır.
  Bu rotalar repo hakikati değildir; Git durumu ve SEIS dokümanları kaynak kabul edilir.
- `lms`: LM Studio yerel model laboratuvarı için CLI yüzeyidir; model indirme,
  provider erişimi veya canlı inference kanıtı sayılmaz.
- `interpreter`: dataset, CSV, JSON transform, and log/trace analysis.
- `claude`: narrative, UX copy, naming, and strategy memo shaping.
- `kimi`: translation, localization, and multilingual surface work.
- `qwen`: alternate model reasoning and second-pass validation.
- `opencode`: terminal coding assistance for bounded local tasks.

## MCP Araçlarıyla Rol Planlama

SEIS MCP sunucusunda iki LLM planlama aracı vardır:

- `seis_llm_plan_request`: Rol önyargısı olmadan genel plan
- `seis_llm_role_plan_request`: `preferredRole` ile tasarım/engineer/software odaklı plan

Örnek payload:

```bash
{
  "request": "designer: onboarding ekranındaki metinleri sadeleştir",
  "preferredRole": "designer"
}
```

## LLM Policy

Bu akışta SEIS politikası şu şekildedir:

- Yerel yardımcılar: `codex`, `openai`, `claude`, `gemini`, `qwen`, `kimi`, `ollama`, `opencode`, `aider`, `interpreter`, `cursor`, `lmstudio`, `lms`, `hermes`, `goose`, `open-design`.
- Tek remote karar katmanı: `seis-agent`.
- SEIS Agent, remote akışı yönlendirir; yerel yardımcılar doğrudan araç çağrısı için yalnızca yardımcı rolde kullanılır.
- `npm run automation:plugin-environment-sources` ile üretim sonrası `deploy/cloud-environment.json` içinde source girer:
  - `localAiToolReadiness`
  - `thirdPartyAiToolInventory`
  - `thirdPartyAdaptationPlan`
  - `toolchainRuntimeReadiness`
  - `desktopAppIntegration`
- Bunlar ayrıca `reports/local-ai-tool-readiness.json`, `reports/third-party-ai-tool-inventory.json`,
  `reports/third-party-adaptation-plan.md`, `reports/toolchain-runtime-readiness.md` ve
  `reports/desktop-app-integration.md` dosyalarında detaylı olarak raporlanır.

## Health Check

```bash
npm run check:ai-stack
npm run check:ai-launcher-offline
```

## Environment

Copy `.env.example` to `.env` and fill API keys as needed:

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY` (optional; Claude Code can also use local `claude auth login`)
- `GEMINI_API_KEY`
- `OLLAMA_HOST` (defaults to `http://127.0.0.1:11434`)
- `AI_FORCE_OFFLINE=1` (opsiyonel, online olmadan önce offline davranışa zorlar)
- `AI_FORCE_ONLINE=1` (opsiyonel, `AI_FORCE_OFFLINE` ile çakışmamalıdır)

Current local-auth notes:

- `claude`: local Claude Code auth is verified with `loggedIn true` and a
  sanitized `CLAUDE_OK` smoke; keep it review-only.
- `hermes`: local Hermes config uses the OpenAI Codex provider and returned
  `HERMES_OK`; Nous Portal is still not logged in.
- `gemini`: Google OAuth completes, then Gemini Code Assist for individuals
  reports this CLI client is no longer supported; use Antigravity, Vertex, or
  another approved route before claiming Gemini access.
- `kimi`: installed and `kimi doctor` is valid, but provider list is empty and
  login reports membership benefits cannot be verified.

## Ollama Runtime

Start the local daemon if needed:

```bash
open -a Ollama --args hidden
```
