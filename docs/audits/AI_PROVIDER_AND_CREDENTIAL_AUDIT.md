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

Inspected files: 2663

## Provider Matrix

| Provider | Category | Status | Expected env vars | Locations | Frontend direct | Backend side | Decision | Recommended action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Anthropic Claude | cloud model provider | Frontend Direct Call | ANTHROPIC_API_KEY | 5849 | yes | yes | Refactor | Move any live provider call behind a backend gateway before enabling. |
| AWS Bedrock | cloud model platform | Unknown | AWS_REGION, AWS_PROFILE | 1 | no | no | Retain | Review manually before enabling. |
| Cloudflare Workers AI | cloud model platform | Live but Unverified | CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN | 6 | no | yes | Retain | Retain as unverified until provider health, no-key startup, and redaction tests exist. |
| Cohere | cloud model provider | Frontend Direct Call | COHERE_API_KEY | 29 | yes | no | Refactor | Move any live provider call behind a backend gateway before enabling. |
| DeepSeek | cloud model provider | Unknown | DEEPSEEK_API_KEY | 137 | no | no | Retain | Review manually before enabling. |
| Google Gemini | cloud model provider | Frontend Direct Call | GEMINI_API_KEY | 115 | yes | yes | Refactor | Move any live provider call behind a backend gateway before enabling. |
| Google Vertex AI | cloud model platform | Unknown | GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION, GOOGLE_APPLICATION_CREDENTIALS | 53 | no | no | Retain | Review manually before enabling. |
| Groq | cloud model provider | Frontend Direct Call | GROQ_API_KEY | 8 | yes | no | Refactor | Move any live provider call behind a backend gateway before enabling. |
| Hugging Face | model hosting provider | Frontend Direct Call | HF_TOKEN | 7 | yes | no | Refactor | Move any live provider call behind a backend gateway before enabling. |
| Luma | media provider | Unknown | LUMA_API_KEY | 8 | no | no | Retain | Review manually before enabling. |
| Mistral | cloud model provider | Frontend Direct Call | MISTRAL_API_KEY | 29 | yes | no | Refactor | Move any live provider call behind a backend gateway before enabling. |
| NVIDIA NIM | cloud model provider | Unknown | NVIDIA_API_KEY | 2259 | no | no | Retain | Review manually before enabling. |
| Ollama | local model provider | Frontend Direct Call | OLLAMA_BASE_URL, OLLAMA_HOST | 434 | yes | yes | Refactor | Move any live provider call behind a backend gateway before enabling. |
| OpenAI | cloud model provider | Frontend Direct Call | OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_ORG_ID, OPENAI_PROJECT_ID | 86 | yes | yes | Refactor | Move any live provider call behind a backend gateway before enabling. |
| OpenRouter | model gateway | Frontend Direct Call | OPENROUTER_API_KEY | 14 | yes | no | Refactor | Move any live provider call behind a backend gateway before enabling. |
| Perplexity | cloud model provider | Frontend Direct Call | PERPLEXITY_API_KEY | 78 | yes | no | Refactor | Move any live provider call behind a backend gateway before enabling. |
| Portkey | model gateway | Unknown | PORTKEY_API_KEY | 2 | no | no | Retain | Review manually before enabling. |
| Replicate | media/model provider | Frontend Direct Call | REPLICATE_API_TOKEN | 8 | yes | no | Refactor | Move any live provider call behind a backend gateway before enabling. |
| Runway | media provider | Unknown | RUNWAY_API_KEY | 431 | no | no | Retain | Review manually before enabling. |
| Together AI | cloud model provider | Frontend Direct Call | TOGETHER_API_KEY | 113 | yes | no | Refactor | Move any live provider call behind a backend gateway before enabling. |
| Vercel AI SDK | abstraction layer | Unknown | none detected | 15 | no | no | Retain | Review manually before enabling. |

## Secret-Exposure Findings

No secret-like values were reported by this static scan.

## Deployment Credential References

| Name | Path | Line | Surface |
| --- | --- | --- | --- |
| GITHUB_TOKEN | SEIST/deploy/cloud-environment.json | 22 | repository |
| CLOUDFLARE_API_TOKEN | SEIST/deploy/cloud-environment.json | 31 | repository |
| VERCEL_TOKEN | SEIST/deploy/cloud-environment.json | 40 | repository |
| NETLIFY_AUTH_TOKEN | SEIST/deploy/cloud-environment.json | 48 | repository |
| AZURE_STATIC_WEB_APPS_API_TOKEN | SEIST/deploy/cloud-environment.json | 56 | repository |
| AWS_AMPLIFY_DEPLOY_TOKEN | SEIST/deploy/cloud-environment.json | 64 | repository |
| FIREBASE_DEPLOY_TOKEN | SEIST/deploy/cloud-environment.json | 72 | repository |
| GITHUB_TOKEN | SEIST/plugins/seis/scripts/seis-repo-visibility-audit.sh | 35 | repository |
| GITHUB_TOKEN | SEIST/reports/server-cloud-activation-report.json | 111 | repository |
| CLOUDFLARE_API_TOKEN | SEIST/reports/server-cloud-activation-report.json | 121 | repository |
| VERCEL_TOKEN | SEIST/reports/server-cloud-activation-report.json | 131 | repository |
| NETLIFY_AUTH_TOKEN | SEIST/reports/server-cloud-activation-report.json | 140 | repository |
| AZURE_STATIC_WEB_APPS_API_TOKEN | SEIST/reports/server-cloud-activation-report.json | 149 | repository |
| AWS_AMPLIFY_DEPLOY_TOKEN | SEIST/reports/server-cloud-activation-report.json | 158 | repository |
| FIREBASE_DEPLOY_TOKEN | SEIST/reports/server-cloud-activation-report.json | 167 | repository |
| CLOUDFLARE_API_TOKEN | SEIST/scripts/create-connector-activation-report.cjs | 49 | repository |
| VERCEL_TOKEN | SEIST/scripts/create-connector-activation-report.cjs | 49 | repository |
| NETLIFY_AUTH_TOKEN | SEIST/scripts/create-connector-activation-report.cjs | 49 | repository |
| GITHUB_TOKEN | apps/seis-core/test/seis-cloud-ssh-center-static.test.js | 119 | repository |
| GITHUB_TOKEN | apps/seis-core/test/seis-design-studio-center-static.test.js | 60 | repository |
| GITHUB_TOKEN | apps/seis-core/test/seis-files-terminal-center-static.test.js | 61 | repository |
| GITHUB_TOKEN | apps/seis-core/test/seis-search-center-static.test.js | 85 | repository |
| GITHUB_TOKEN | apps/seis-core/test/seis-store-music-center-static.test.js | 66 | repository |
| GITHUB_TOKEN | deploy/cloud-environment.json | 22 | deployment-config |
| CLOUDFLARE_API_TOKEN | deploy/cloud-environment.json | 31 | deployment-config |
| VERCEL_TOKEN | deploy/cloud-environment.json | 40 | deployment-config |
| NETLIFY_AUTH_TOKEN | deploy/cloud-environment.json | 48 | deployment-config |
| AZURE_STATIC_WEB_APPS_API_TOKEN | deploy/cloud-environment.json | 56 | deployment-config |
| AWS_AMPLIFY_DEPLOY_TOKEN | deploy/cloud-environment.json | 64 | deployment-config |
| FIREBASE_DEPLOY_TOKEN | deploy/cloud-environment.json | 72 | deployment-config |
| VERCEL_TOKEN | emirhan-kudun-portfolio/docs/deployment-server-runbook.md | 22 | documentation |
| GITHUB_TOKEN | plugins/seis/scripts/seis-repo-visibility-audit.sh | 35 | repository |
| GITHUB_TOKEN | reports/server-cloud-activation-report.json | 139 | documentation |
| CLOUDFLARE_API_TOKEN | reports/server-cloud-activation-report.json | 149 | documentation |
| VERCEL_TOKEN | reports/server-cloud-activation-report.json | 159 | documentation |
| NETLIFY_AUTH_TOKEN | reports/server-cloud-activation-report.json | 168 | documentation |
| AZURE_STATIC_WEB_APPS_API_TOKEN | reports/server-cloud-activation-report.json | 177 | documentation |
| AWS_AMPLIFY_DEPLOY_TOKEN | reports/server-cloud-activation-report.json | 186 | documentation |
| FIREBASE_DEPLOY_TOKEN | reports/server-cloud-activation-report.json | 195 | documentation |
| CLOUDFLARE_API_TOKEN | scripts/create-connector-activation-report.cjs | 49 | backend |
| VERCEL_TOKEN | scripts/create-connector-activation-report.cjs | 49 | backend |
| NETLIFY_AUTH_TOKEN | scripts/create-connector-activation-report.cjs | 49 | backend |

## Frontend Direct-Call Findings

- Anthropic Claude: review 5849 location(s).
- Cohere: review 29 location(s).
- Google Gemini: review 115 location(s).
- Groq: review 8 location(s).
- Hugging Face: review 7 location(s).
- Mistral: review 29 location(s).
- Ollama: review 434 location(s).
- OpenAI: review 86 location(s).
- OpenRouter: review 14 location(s).
- Perplexity: review 78 location(s).
- Replicate: review 8 location(s).
- Together AI: review 113 location(s).

## Real Live Integrations

None runtime-verified in this pass. Do not treat documentation, placeholders,
or environment variable references as live provider support.

## Mock And Placeholder Integrations

Placeholder or documentation-only references are retained as planning material
only. They do not require API keys for core SEIS.

## SEIS AI Core Provider Registry Boundary

The provider registry source of truth is
`content/development/seis-ai-core-provider-registry.json`.

The local read-only status tool is `seis_ai_core_provider_status`.

The MCP resource URI is `seis://ai/provider-registry.json`.

These surfaces expose provider state evidence only. They do not perform live
provider calls, credential validation, network health checks, SSH, deployment,
or GitHub mutation.

## Final Required API Key List

### Required For Core SEIS

- None.

### Required For Enabled Live Features

- None verified in this pass.

### Optional Providers

- None detected.

### Detected Provider References

These references do not prove enabled live features or required API keys.

- Anthropic Claude: ANTHROPIC_API_KEY (Frontend Direct Call)
- AWS Bedrock: AWS_REGION, AWS_PROFILE (Unknown)
- Cloudflare Workers AI: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN (Live but Unverified)
- Cohere: COHERE_API_KEY (Frontend Direct Call)
- DeepSeek: DEEPSEEK_API_KEY (Unknown)
- Google Gemini: GEMINI_API_KEY (Frontend Direct Call)
- Google Vertex AI: GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION, GOOGLE_APPLICATION_CREDENTIALS (Unknown)
- Groq: GROQ_API_KEY (Frontend Direct Call)
- Hugging Face: HF_TOKEN (Frontend Direct Call)
- Luma: LUMA_API_KEY (Unknown)
- Mistral: MISTRAL_API_KEY (Frontend Direct Call)
- NVIDIA NIM: NVIDIA_API_KEY (Unknown)
- Ollama: OLLAMA_BASE_URL, OLLAMA_HOST (Frontend Direct Call)
- OpenAI: OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_ORG_ID, OPENAI_PROJECT_ID (Frontend Direct Call)
- OpenRouter: OPENROUTER_API_KEY (Frontend Direct Call)
- Perplexity: PERPLEXITY_API_KEY (Frontend Direct Call)
- Portkey: PORTKEY_API_KEY (Unknown)
- Replicate: REPLICATE_API_TOKEN (Frontend Direct Call)
- Runway: RUNWAY_API_KEY (Unknown)
- Together AI: TOGETHER_API_KEY (Frontend Direct Call)
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
