# SEIS AI Demo Qwen Intake Review

## Summary

The user supplied a local Qwen-generated code folder as trusted reference
material for the SEIS AI Command Core demo. The folder was used as an idea
source only. No raw Qwen implementation file was copied into the repository.

## Inventory

- TypeScript files: 108
- TSX files: 10
- JavaScript files: 7
- HTML files: 5
- CSS files: 2
- Bash files: 54
- JSON files: 10
- env-style text files: 3
- Prisma-style files: 14
- Spreadsheet/CSV files: 3

At least 119 files referenced credential, provider, payment, database,
deployment, or browser API-key handling concepts. These were treated as
security-sensitive and excluded from direct integration.

## Safe Ideas Recovered

- Multi-agent execution timeline.
- Agent workflow node map.
- Provider/model readiness mapping.
- Local usage and run metrics.
- Knowledge graph presentation concept.

## Material Excluded

- `.env` and credential examples.
- Live OpenAI, Anthropic, Google, Qwen, Groq, Replicate, Suno, Deepgram, or
  ElevenLabs calls.
- Browser API-key entry or localStorage key persistence.
- Stripe, Supabase, Prisma, Pinecone, Neon, Vercel deployment, and payment/auth
  fragments.
- Bash setup scripts, package installation recipes, migrations, and deploy
  commands.
- Claims that SEIS owns frontier model capability or performs live provider
  execution.

## Resulting Integration

The web demo now exposes a deterministic Workflow module, provider-readiness
cards, run metrics, and markdown export. The macOS app exposes matching native
workflow state through SwiftUI. Provider calls, secrets, SSH, deployment,
database migration, and payment behavior remain disconnected.

## Validation Boundary

The intake supports product direction and demo UX only. It is not evidence of
live AI connectivity, provider credentials, production readiness, or model
training.
