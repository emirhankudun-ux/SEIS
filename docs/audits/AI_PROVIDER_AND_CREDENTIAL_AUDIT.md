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

Inspected files: 2146

## Provider Matrix

| Provider | Category | Status | Expected env vars | Locations | Frontend direct | Backend side | Decision | Recommended action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Anthropic Claude | cloud model provider | Live but Unverified | ANTHROPIC_API_KEY | 4525 | no | yes | Retain | Retain as unverified until provider health, no-key startup, and redaction tests exist. |
| AWS Bedrock | cloud model platform | Unknown | AWS_REGION, AWS_PROFILE | 1 | no | no | Retain | Review manually before enabling. |
| Cloudflare Workers AI | cloud model platform | Live but Unverified | CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN | 6 | no | yes | Retain | Retain as unverified until provider health, no-key startup, and redaction tests exist. |
| Cohere | cloud model provider | Unknown | COHERE_API_KEY | 22 | no | no | Retain | Review manually before enabling. |
| DeepSeek | cloud model provider | Unknown | DEEPSEEK_API_KEY | 124 | no | no | Retain | Review manually before enabling. |
| Google Gemini | cloud model provider | Live but Unverified | GEMINI_API_KEY | 111 | no | yes | Retain | Retain as unverified until provider health, no-key startup, and redaction tests exist. |
| Google Vertex AI | cloud model platform | Unknown | GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION, GOOGLE_APPLICATION_CREDENTIALS | 51 | no | no | Retain | Review manually before enabling. |
| Groq | cloud model provider | Unknown | GROQ_API_KEY | 6 | no | no | Retain | Review manually before enabling. |
| Hugging Face | model hosting provider | Unknown | HF_TOKEN | 5 | no | no | Retain | Review manually before enabling. |
| LM Studio | local model provider | Unknown | LM_STUDIO_BASE_URL | 3 | no | no | Retain | Review manually before enabling. |
| Luma | media provider | Unknown | LUMA_API_KEY | 8 | no | no | Retain | Review manually before enabling. |
| Mistral | cloud model provider | Unknown | MISTRAL_API_KEY | 15 | no | no | Retain | Review manually before enabling. |
| NVIDIA NIM | cloud model provider | Unknown | NVIDIA_API_KEY | 2085 | no | no | Retain | Review manually before enabling. |
| Ollama | local model provider | Live but Unverified | OLLAMA_BASE_URL, OLLAMA_HOST | 323 | no | yes | Retain | Retain as unverified until provider health, no-key startup, and redaction tests exist. |
| OpenAI | cloud model provider | Live but Unverified | OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_ORG_ID, OPENAI_PROJECT_ID | 73 | no | yes | Retain | Retain as unverified until provider health, no-key startup, and redaction tests exist. |
| Perplexity | cloud model provider | Unknown | PERPLEXITY_API_KEY | 62 | no | no | Retain | Review manually before enabling. |
| Portkey | model gateway | Unknown | PORTKEY_API_KEY | 2 | no | no | Retain | Review manually before enabling. |
| Replicate | media/model provider | Unknown | REPLICATE_API_TOKEN | 31 | no | no | Retain | Review manually before enabling. |
| Runway | media provider | Unknown | RUNWAY_API_KEY | 288 | no | no | Retain | Review manually before enabling. |
| Together AI | cloud model provider | Unknown | TOGETHER_API_KEY | 89 | no | no | Retain | Review manually before enabling. |
| Vercel AI SDK | abstraction layer | Unknown | none detected | 15 | no | no | Retain | Review manually before enabling. |

## Secret-Exposure Findings

No secret-like values were reported by this static scan.

## Deployment Credential References

| Name | Path | Line | Surface |
| --- | --- | --- | --- |
| AWS_AMPLIFY_DEPLOY_TOKEN | deploy/cloud-environment.json | 64 | deployment-config |
| AWS_AMPLIFY_DEPLOY_TOKEN | SEIST/deploy/cloud-environment.json | 64 | repository |
| AWS_AMPLIFY_DEPLOY_TOKEN | SEIST/reports/server-cloud-activation-report.json | 158 | repository |
| AZURE_STATIC_WEB_APPS_API_TOKEN | deploy/cloud-environment.json | 56 | deployment-config |
| AZURE_STATIC_WEB_APPS_API_TOKEN | SEIST/deploy/cloud-environment.json | 56 | repository |
| AZURE_STATIC_WEB_APPS_API_TOKEN | SEIST/reports/server-cloud-activation-report.json | 149 | repository |
| CLOUDFLARE_API_TOKEN | deploy/cloud-environment.json | 31 | deployment-config |
| CLOUDFLARE_API_TOKEN | scripts/check-git-secret-history.mjs | 61 | backend |
| CLOUDFLARE_API_TOKEN | scripts/create-connector-activation-report.cjs | 49 | backend |
| CLOUDFLARE_API_TOKEN | SEIST/deploy/cloud-environment.json | 31 | repository |
| CLOUDFLARE_API_TOKEN | SEIST/reports/server-cloud-activation-report.json | 121 | repository |
| CLOUDFLARE_API_TOKEN | SEIST/scripts/create-connector-activation-report.cjs | 49 | repository |
| FIREBASE_DEPLOY_TOKEN | deploy/cloud-environment.json | 72 | deployment-config |
| FIREBASE_DEPLOY_TOKEN | SEIST/deploy/cloud-environment.json | 72 | repository |
| FIREBASE_DEPLOY_TOKEN | SEIST/reports/server-cloud-activation-report.json | 167 | repository |
| GITHUB_TOKEN | deploy/cloud-environment.json | 22 | deployment-config |
| GITHUB_TOKEN | plugins/seis/scripts/seis-repo-visibility-audit.sh | 35 | repository |
| GITHUB_TOKEN | scripts/check-git-secret-history.mjs | 61 | backend |
| GITHUB_TOKEN | SEIST/deploy/cloud-environment.json | 22 | repository |
| GITHUB_TOKEN | SEIST/plugins/seis/scripts/seis-repo-visibility-audit.sh | 35 | repository |
| GITHUB_TOKEN | SEIST/reports/server-cloud-activation-report.json | 111 | repository |
| NETLIFY_AUTH_TOKEN | deploy/cloud-environment.json | 48 | deployment-config |
| NETLIFY_AUTH_TOKEN | scripts/check-git-secret-history.mjs | 61 | backend |
| NETLIFY_AUTH_TOKEN | scripts/create-connector-activation-report.cjs | 49 | backend |
| NETLIFY_AUTH_TOKEN | SEIST/deploy/cloud-environment.json | 48 | repository |
| NETLIFY_AUTH_TOKEN | SEIST/reports/server-cloud-activation-report.json | 140 | repository |
| NETLIFY_AUTH_TOKEN | SEIST/scripts/create-connector-activation-report.cjs | 49 | repository |
| VERCEL_TOKEN | deploy/cloud-environment.json | 40 | deployment-config |
| VERCEL_TOKEN | emirhan-kudun-portfolio/docs/deployment-server-runbook.md | 22 | documentation |
| VERCEL_TOKEN | scripts/check-git-secret-history.mjs | 61 | backend |
| VERCEL_TOKEN | scripts/create-connector-activation-report.cjs | 49 | backend |
| VERCEL_TOKEN | SEIST/deploy/cloud-environment.json | 40 | repository |
| VERCEL_TOKEN | SEIST/reports/server-cloud-activation-report.json | 131 | repository |
| VERCEL_TOKEN | SEIST/scripts/create-connector-activation-report.cjs | 49 | repository |

## Frontend Direct-Call Findings

No frontend direct model-provider endpoint or secret-variable path was detected by this scan.

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

- Anthropic Claude: ANTHROPIC_API_KEY (Live but Unverified)
- AWS Bedrock: AWS_REGION, AWS_PROFILE (Unknown)
- Cloudflare Workers AI: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN (Live but Unverified)
- Cohere: COHERE_API_KEY (Unknown)
- DeepSeek: DEEPSEEK_API_KEY (Unknown)
- Google Gemini: GEMINI_API_KEY (Live but Unverified)
- Google Vertex AI: GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION, GOOGLE_APPLICATION_CREDENTIALS (Unknown)
- Groq: GROQ_API_KEY (Unknown)
- Hugging Face: HF_TOKEN (Unknown)
- LM Studio: LM_STUDIO_BASE_URL (Unknown)
- Luma: LUMA_API_KEY (Unknown)
- Mistral: MISTRAL_API_KEY (Unknown)
- NVIDIA NIM: NVIDIA_API_KEY (Unknown)
- Ollama: OLLAMA_BASE_URL, OLLAMA_HOST (Live but Unverified)
- OpenAI: OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_ORG_ID, OPENAI_PROJECT_ID (Live but Unverified)
- Perplexity: PERPLEXITY_API_KEY (Unknown)
- Portkey: PORTKEY_API_KEY (Unknown)
- Replicate: REPLICATE_API_TOKEN (Unknown)
- Runway: RUNWAY_API_KEY (Unknown)
- Together AI: TOGETHER_API_KEY (Unknown)
- Vercel AI SDK: no key variable detected (Unknown)

### No-Key Providers

- LM Studio
- Ollama

## Remaining Manual Actions

- Review every `Live but Unverified` or `Frontend Direct Call` finding before
  enabling provider runtime behavior.
- Add typed server-only environment validation before live provider adapters.
- Keep `npm run check:git-secret-history` passing and run external
  secret-scanner/provider-log review before any broad public-readiness claim.
- Keep cloud deployment credentials server-only.

## Related Documents

- [../ai/seis-ai-core.md](../ai/seis-ai-core.md)
- [../security/security-baseline.md](../security/security-baseline.md)
- [../../SECURITY.md](../../SECURITY.md)
