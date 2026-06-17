# SEIS Requested Software Stack

- Generated: 2026-06-03
- Mode: source_visible_fullstack_polyglot_governance
- Technologies: 6
- Entry points: 10
- Unique submitted plugins: 300
- Capability lanes: 12

## Stack Map

| technology | role | primary lane | entrypoints | supporting plugins |
| --- | --- | --- | --- | --- |
| JavaScript | Browser interaction, source-summary helpers, and dependency-free runtime checks. | builder-and-prototyping | apps/web/app.js, polyglot/javascript/plugin-source-runtime.js | base44, wix, lovable, replit, build-web-apps, frontend-design |
| Node.js | Local automation, static server endpoints, and source-readiness validation. | cloud-devops-and-release | server/node/static-server.mjs, polyglot/node/requested_stack_readiness.mjs, scripts/create-requested-software-stack.cjs | render, vercel, netlify, cloudflare, github, replit |
| MySQL | Future plugin source ledger and requested-stack registry schema. | backend-data-and-api | polyglot/mysql/plugin_source_registry.mysql.sql | planetscale, prisma, supabase, quicknode, oracle-ai-data-platform-workbench-spark-connectors |
| React | Typed UI component contract for source-visible plugin stack dashboards. | creative-production-and-design | polyglot/react/PluginSourceDashboard.tsx | figma, canva, product-design, build-web-apps, frontend-design, lovable |
| Express.js | Express-compatible route adapter for plugin source and software stack endpoints. | backend-data-and-api | server/express/plugin-source-routes.mjs | postman, render, vercel, twilio-developer-kit, datadog, sentry |
| TypeScript | Source contracts for requested stack payloads and release integration. | platform-native-and-polyglot | polyglot/typescript/release-contract.ts, polyglot/typescript/fullstack-plugin-contract.ts | openai-developers, convex, supabase, ui5-typescript-conversion, apollo-skills |

## Governance

- Keep JavaScript, Node.js, React, Express.js, TypeScript, and MySQL visible as small source surfaces.
- Do not install runtime dependencies until a concrete app route or deploy target needs them.
- Use plugin lanes as activation guidance, not blanket connector activation.
- Keep credentials and live connector tokens out of source control.
