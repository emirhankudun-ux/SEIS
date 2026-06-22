# AI Provider And Credential Audit

Date: 2026-06-22

## Purpose

This is a redacted static repository audit. It detects provider references,
credential variable references, potential client exposure patterns, and
secret-like patterns without printing secret values and without calling any
external provider.

## Scope Inspected

- Text source, docs, config, scripts, app, package, server, deploy, and content
  files under the repository root.
- Real `.env` files are intentionally skipped.
- Binary files, release archives, `node_modules`, generated build folders, and
  media assets are skipped.

Inspected files: 426

## Provider Matrix

| Provider | Category | Status | Expected env vars | Locations | Frontend direct | Backend side | Decision | Recommended action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Anthropic Claude | cloud model provider | Unknown | ANTHROPIC_API_KEY | 2814 | no | no | Retain | Review manually before enabling. |
| Cloudflare Workers AI | cloud model platform | Live but Unverified | CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN | 3 | no | yes | Retain | Retain as unverified until provider health, no-key startup, and redaction tests exist. |
| DeepSeek | cloud model provider | Unknown | DEEPSEEK_API_KEY | 35 | no | no | Retain | Review manually before enabling. |
| fal.ai | media provider | Unknown | FAL_KEY | 808 | no | no | Retain | Review manually before enabling. |
| Google Gemini | cloud model provider | Unknown | GEMINI_API_KEY | 31 | no | no | Retain | Review manually before enabling. |
| NVIDIA NIM | cloud model provider | Unknown | NVIDIA_API_KEY | 275 | no | no | Retain | Review manually before enabling. |
| Ollama | local model provider | Unknown | OLLAMA_BASE_URL, OLLAMA_HOST | 17 | no | no | Retain | Review manually before enabling. |
| OpenAI | cloud model provider | Unknown | OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_ORG_ID, OPENAI_PROJECT_ID | 4 | no | no | Retain | Review manually before enabling. |
| Perplexity | cloud model provider | Unknown | PERPLEXITY_API_KEY | 36 | no | no | Retain | Review manually before enabling. |
| Runway | media provider | Unknown | RUNWAY_API_KEY | 31 | no | no | Retain | Review manually before enabling. |
| Together AI | cloud model provider | Unknown | TOGETHER_API_KEY | 36 | no | no | Retain | Review manually before enabling. |
| Vercel AI SDK | abstraction layer | Unknown | none detected | 8 | no | no | Retain | Review manually before enabling. |

## Secret-Exposure Findings

No secret-like values were reported by this static scan.

## Deployment Credential References

| Name | Path | Line | Surface |
| --- | --- | --- | --- |
| GITHUB_TOKEN | deploy/cloud-environment.json | 22 | deployment-config |
| CLOUDFLARE_API_TOKEN | deploy/cloud-environment.json | 31 | deployment-config |
| VERCEL_TOKEN | deploy/cloud-environment.json | 40 | deployment-config |
| NETLIFY_AUTH_TOKEN | deploy/cloud-environment.json | 48 | deployment-config |
| AZURE_STATIC_WEB_APPS_API_TOKEN | deploy/cloud-environment.json | 56 | deployment-config |
| AWS_AMPLIFY_DEPLOY_TOKEN | deploy/cloud-environment.json | 64 | deployment-config |
| FIREBASE_DEPLOY_TOKEN | deploy/cloud-environment.json | 72 | deployment-config |
| GITHUB_TOKEN | plugins/seis/scripts/seis-repo-visibility-audit.sh | 35 | repository |
| GITHUB_TOKEN | reports/server-cloud-activation-report.json | 111 | documentation |
| CLOUDFLARE_API_TOKEN | reports/server-cloud-activation-report.json | 121 | documentation |
| VERCEL_TOKEN | reports/server-cloud-activation-report.json | 131 | documentation |
| NETLIFY_AUTH_TOKEN | reports/server-cloud-activation-report.json | 140 | documentation |
| AZURE_STATIC_WEB_APPS_API_TOKEN | reports/server-cloud-activation-report.json | 149 | documentation |
| AWS_AMPLIFY_DEPLOY_TOKEN | reports/server-cloud-activation-report.json | 158 | documentation |
| FIREBASE_DEPLOY_TOKEN | reports/server-cloud-activation-report.json | 167 | documentation |
| CLOUDFLARE_API_TOKEN | scripts/create-connector-activation-report.cjs | 49 | backend |
| VERCEL_TOKEN | scripts/create-connector-activation-report.cjs | 49 | backend |
| NETLIFY_AUTH_TOKEN | scripts/create-connector-activation-report.cjs | 49 | backend |

## Frontend Direct-Call Findings

No frontend direct model-provider endpoint or secret-variable path was detected by this scan.

## Real Live Integrations

None runtime-verified in this pass. Do not treat documentation, placeholders,
or environment variable references as live provider support.

## Mock And Placeholder Integrations

Placeholder or documentation-only references are retained as planning material
only. They do not require API keys for core SEIS.

## Final Required API Key List

### Required For Core SEIS

- None.

### Required For Enabled Live Features

- None verified in this pass.

### Optional Providers

- None detected.

### Detected Provider References

These references do not prove enabled live features or required API keys.

- Anthropic Claude: ANTHROPIC_API_KEY (Unknown)
- Cloudflare Workers AI: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN (Live but Unverified)
- DeepSeek: DEEPSEEK_API_KEY (Unknown)
- fal.ai: FAL_KEY (Unknown)
- Google Gemini: GEMINI_API_KEY (Unknown)
- NVIDIA NIM: NVIDIA_API_KEY (Unknown)
- Ollama: OLLAMA_BASE_URL, OLLAMA_HOST (Unknown)
- OpenAI: OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_ORG_ID, OPENAI_PROJECT_ID (Unknown)
- Perplexity: PERPLEXITY_API_KEY (Unknown)
- Runway: RUNWAY_API_KEY (Unknown)
- Together AI: TOGETHER_API_KEY (Unknown)
- Vercel AI SDK: no key variable detected (Unknown)

### No-Key Providers

- Ollama

## Remaining Manual Actions

- Review every `Live but Unverified` or `Frontend Direct Call` finding before
  enabling provider runtime behavior.
- Add typed server-only environment validation before live provider adapters.
- Run a dedicated secret-history scanner before any public-readiness claim.
- Keep cloud deployment credentials server-only.

## Related Documents

- [../ai/seis-ai-core.md](../ai/seis-ai-core.md)
- [../security/security-baseline.md](../security/security-baseline.md)
- [../../SECURITY.md](../../SECURITY.md)
