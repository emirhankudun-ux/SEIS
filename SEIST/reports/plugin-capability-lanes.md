# SEIS Plugin Capability Lanes

- Generated: 2026-06-03
- Inventory: content/development/requested-plugin-inventory.json
- Unique plugins: 300
- Submitted links: 301
- Activation policy: activate_only_when_relevant_authenticated_scoped_and_user_approved

## Lane Summary

| lane | plugins | intent | quality commands |
| --- | ---: | --- | --- |
| Builder and prototyping | 18 | Create or iterate app surfaces, prototypes, landing systems, and runnable demos. | npm run check:plugin-capability-lanes, npm run check:plugin-environment-sources |
| Creative production and design | 18 | Shape UI direction, visual assets, design systems, campaign creative, and media outputs. | npm run check:motion-evidence, npm run check:mobile-ergonomics |
| Finance, investing, and payments | 18 | Support capital markets research, deal analysis, market data, and payment workflow planning. | npm run check:plugin-capability-lanes, npm run check:cloud-environment |
| Sales, GTM, and market intelligence | 30 | Research accounts, enrich prospects, plan outreach, and map revenue motions. | npm run check:plugin-capability-lanes, npm run check:connector-activation-report |
| Analytics, observability, and growth | 30 | Measure product behavior, traffic, experiments, reliability, search visibility, and business metrics. | npm run check:plugin-capability-lanes, npm run check:cloud-environment |
| Backend, data, and API | 31 | Model data, inspect schemas, build API integrations, and maintain backend execution layers. | npm run check:plugin-capability-lanes, npm run check:cloud-environment |
| Cloud, DevOps, and release | 31 | Coordinate deploy targets, CI/CD, hosting, infrastructure, incidents, and release safety. | npm run check:cloud-environment, npm run check:server-target |
| Security, quality, and governance | 19 | Review code quality, dependency risk, API security, policy posture, and repository governance. | npm run check:plugin-capability-lanes, npm run check:cloud-environment |
| Collaboration, calendar, and support | 35 | Coordinate team work, email, documents, meetings, signatures, support context, and project systems. | npm run check:plugin-capability-lanes, npm run check:connector-activation-report |
| Platform native and polyglot | 14 | Support native apps, SDK-specific implementation, maps, messaging, language conversion, and platform APIs. | npm run check:software-languages, npm run check:plugin-capability-lanes |
| Specialized domain and research | 17 | Route domain-heavy work through science, policy, geospatial, AI/ML, legal, and research-specific constraints. | npm run check:plugin-capability-lanes, npm run check:cloud-environment |
| AI workflow, docs, and knowledge | 39 | Manage assistant workflows, knowledge bases, docs, browser/document tools, plugin creation, and MCP systems. | npm run check:plugin-capability-lanes, npm run check:workspace |

## Remote Source Plugins

| plugin | primary lane | matched lanes | uri |
| --- | --- | --- | --- |
| public-equity-investing | finance-investing-and-payments | finance-investing-and-payments | plugin://public-equity-investing@openai-curated-remote |
| product-design | creative-production-and-design | creative-production-and-design | plugin://product-design@openai-curated-remote |
| investment-banking | finance-investing-and-payments | finance-investing-and-payments | plugin://investment-banking@openai-curated-remote |
| creative-production | creative-production-and-design | creative-production-and-design | plugin://creative-production@openai-curated-remote |
| sales | sales-gtm-and-market-intelligence | sales-gtm-and-market-intelligence | plugin://sales@openai-curated-remote |
| data-analytics | analytics-observability-and-growth | analytics-observability-and-growth | plugin://data-analytics@openai-curated-remote |

## Full Assignment

### Builder and prototyping

| # | plugin | source | matched lanes | uri |
| ---: | --- | --- | --- | --- |
| 1 | base44 | openai-curated | builder-and-prototyping | plugin://base44@openai-curated |
| 2 | wix | openai-curated | builder-and-prototyping | plugin://wix@openai-curated |
| 7 | lovable | openai-curated | builder-and-prototyping | plugin://lovable@openai-curated |
| 8 | replit | openai-curated | builder-and-prototyping | plugin://replit@openai-curated |
| 45 | responsive | openai-curated | builder-and-prototyping | plugin://responsive@openai-curated |
| 67 | hostinger | openai-curated | builder-and-prototyping | plugin://hostinger@openai-curated |
| 90 | expo | openai-curated | builder-and-prototyping, platform-native-and-polyglot | plugin://expo@openai-curated |
| 94 | build-web-data-visualization | openai-curated | builder-and-prototyping | plugin://build-web-data-visualization@openai-curated |
| 95 | build-web-apps | openai-curated | builder-and-prototyping | plugin://build-web-apps@openai-curated |
| 107 | game-studio | openai-curated | builder-and-prototyping | plugin://game-studio@openai-curated |
| 170 | playground | claude-plugins-official | builder-and-prototyping | plugin://playground@claude-plugins-official |
| 204 | feature-dev | claude-plugins-official | builder-and-prototyping | plugin://feature-dev@claude-plugins-official |
| 206 | fakechat | claude-plugins-official | builder-and-prototyping | plugin://fakechat@claude-plugins-official |
| 207 | expo | claude-plugins-official | builder-and-prototyping, platform-native-and-polyglot | plugin://expo@claude-plugins-official |
| 219 | cwc-makers | claude-plugins-official | builder-and-prototyping | plugin://cwc-makers@claude-plugins-official |
| 239 | base44 | claude-plugins-official | builder-and-prototyping | plugin://base44@claude-plugins-official |
| 251 | appwrite | claude-plugins-official | builder-and-prototyping | plugin://appwrite@claude-plugins-official |
| 270 | stardust | adobe-skills | builder-and-prototyping | plugin://stardust@adobe-skills |

### Creative production and design

| # | plugin | source | matched lanes | uri |
| ---: | --- | --- | --- | --- |
| 3 | fal | openai-curated | creative-production-and-design | plugin://fal@openai-curated |
| 4 | picsart | openai-curated | creative-production-and-design | plugin://picsart@openai-curated |
| 9 | shutterstock | openai-curated | creative-production-and-design | plugin://shutterstock@openai-curated |
| 32 | heygen | openai-curated | creative-production-and-design | plugin://heygen@openai-curated |
| 33 | hyperframes | openai-curated | creative-production-and-design | plugin://hyperframes@openai-curated |
| 82 | biorender | openai-curated | creative-production-and-design | plugin://biorender@openai-curated |
| 87 | remotion | openai-curated | creative-production-and-design | plugin://remotion@openai-curated |
| 112 | figma | openai-curated | creative-production-and-design | plugin://figma@openai-curated |
| 113 | canva | openai-curated | creative-production-and-design | plugin://canva@openai-curated |
| 156 | runway-api | claude-plugins-official | creative-production-and-design | plugin://runway-api@claude-plugins-official |
| 200 | frontend-design | claude-plugins-official | creative-production-and-design | plugin://frontend-design@claude-plugins-official |
| 203 | figma | claude-plugins-official | creative-production-and-design | plugin://figma@claude-plugins-official |
| 226 | cloudinary | claude-plugins-official | creative-production-and-design | plugin://cloudinary@claude-plugins-official |
| 262 | adobe-for-creativity | claude-plugins-official | creative-production-and-design, specialized-domain-and-research | plugin://adobe-for-creativity@claude-plugins-official |
| 271 | adobe-for-creativity | adobe-skills | creative-production-and-design, specialized-domain-and-research | plugin://adobe-for-creativity@adobe-skills |
| 293 | cloudinary | openai-curated | creative-production-and-design | plugin://cloudinary@openai-curated |
| 296 | product-design | openai-curated-remote | creative-production-and-design | plugin://product-design@openai-curated-remote |
| 298 | creative-production | openai-curated-remote | creative-production-and-design | plugin://creative-production@openai-curated-remote |

### Finance, investing, and payments

| # | plugin | source | matched lanes | uri |
| ---: | --- | --- | --- | --- |
| 48 | razorpay | openai-curated | finance-investing-and-payments | plugin://razorpay@openai-curated |
| 51 | quartr | openai-curated | finance-investing-and-payments | plugin://quartr@openai-curated |
| 54 | pitchbook | openai-curated | finance-investing-and-payments | plugin://pitchbook@openai-curated |
| 59 | mt-newswires | openai-curated | finance-investing-and-payments | plugin://mt-newswires@openai-curated |
| 61 | moody-s | openai-curated | finance-investing-and-payments | plugin://moody-s@openai-curated |
| 65 | keybid-puls | openai-curated | finance-investing-and-payments | plugin://keybid-puls@openai-curated |
| 80 | brex | openai-curated | finance-investing-and-payments | plugin://brex@openai-curated |
| 83 | binance | openai-curated | finance-investing-and-payments | plugin://binance@openai-curated |
| 85 | alpaca | openai-curated | finance-investing-and-payments | plugin://alpaca@openai-curated |
| 142 | sumup | claude-plugins-official | finance-investing-and-payments | plugin://sumup@claude-plugins-official |
| 143 | stripe | claude-plugins-official | finance-investing-and-payments | plugin://stripe@claude-plugins-official |
| 179 | mercadopago | claude-plugins-official | finance-investing-and-payments | plugin://mercadopago@claude-plugins-official |
| 238 | bigdata-com | claude-plugins-official | finance-investing-and-payments | plugin://bigdata-com@claude-plugins-official |
| 279 | pigment | claude-plugins-official | finance-investing-and-payments | plugin://pigment@claude-plugins-official |
| 282 | dow-jones-factiva | openai-curated | finance-investing-and-payments | plugin://dow-jones-factiva@openai-curated |
| 287 | daloopa | openai-curated | finance-investing-and-payments | plugin://daloopa@openai-curated |
| 295 | public-equity-investing | openai-curated-remote | finance-investing-and-payments | plugin://public-equity-investing@openai-curated-remote |
| 297 | investment-banking | openai-curated-remote | finance-investing-and-payments | plugin://investment-banking@openai-curated-remote |

### Sales, GTM, and market intelligence

| # | plugin | source | matched lanes | uri |
| ---: | --- | --- | --- | --- |
| 11 | hg-insights | openai-curated | sales-gtm-and-market-intelligence | plugin://hg-insights@openai-curated |
| 12 | rox | openai-curated | sales-gtm-and-market-intelligence | plugin://rox@openai-curated |
| 13 | calendly | openai-curated | sales-gtm-and-market-intelligence | plugin://calendly@openai-curated |
| 14 | clay | openai-curated | sales-gtm-and-market-intelligence | plugin://clay@openai-curated |
| 16 | meticulate | openai-curated | sales-gtm-and-market-intelligence | plugin://meticulate@openai-curated |
| 17 | apollo | openai-curated | sales-gtm-and-market-intelligence | plugin://apollo@openai-curated |
| 19 | close | openai-curated | sales-gtm-and-market-intelligence | plugin://close@openai-curated |
| 22 | zoominfo | openai-curated | sales-gtm-and-market-intelligence, collaboration-calendar-and-support | plugin://zoominfo@openai-curated |
| 23 | datasite | openai-curated | sales-gtm-and-market-intelligence | plugin://datasite@openai-curated |
| 40 | streak | openai-curated | sales-gtm-and-market-intelligence | plugin://streak@openai-curated |
| 52 | pylon | openai-curated | sales-gtm-and-market-intelligence | plugin://pylon@openai-curated |
| 55 | particl-market-research | openai-curated | sales-gtm-and-market-intelligence | plugin://particl-market-research@openai-curated |
| 66 | hubspot | openai-curated | sales-gtm-and-market-intelligence | plugin://hubspot@openai-curated |
| 68 | highlevel | openai-curated | sales-gtm-and-market-intelligence | plugin://highlevel@openai-curated |
| 69 | help-scout | openai-curated | sales-gtm-and-market-intelligence | plugin://help-scout@openai-curated |
| 70 | happenstance | openai-curated | sales-gtm-and-market-intelligence | plugin://happenstance@openai-curated |
| 77 | channel99 | openai-curated | sales-gtm-and-market-intelligence | plugin://channel99@openai-curated |
| 78 | cb-insights | openai-curated | sales-gtm-and-market-intelligence | plugin://cb-insights@openai-curated |
| 79 | carta-crm | openai-curated | sales-gtm-and-market-intelligence | plugin://carta-crm@openai-curated |
| 84 | attio | openai-curated | sales-gtm-and-market-intelligence | plugin://attio@openai-curated |
| 127 | zoominfo | claude-plugins-official | sales-gtm-and-market-intelligence, collaboration-calendar-and-support | plugin://zoominfo@claude-plugins-official |
| 192 | intercom | claude-plugins-official | sales-gtm-and-market-intelligence | plugin://intercom@claude-plugins-official |
| 194 | hunter | claude-plugins-official | sales-gtm-and-market-intelligence | plugin://hunter@claude-plugins-official |
| 252 | apollo-skills | claude-plugins-official | sales-gtm-and-market-intelligence, backend-data-and-api | plugin://apollo-skills@claude-plugins-official |
| 253 | apollo | claude-plugins-official | sales-gtm-and-market-intelligence | plugin://apollo@claude-plugins-official |
| 285 | docket | openai-curated | sales-gtm-and-market-intelligence | plugin://docket@openai-curated |
| 286 | demandbase | openai-curated | sales-gtm-and-market-intelligence | plugin://demandbase@openai-curated |
| 292 | common-room | openai-curated | sales-gtm-and-market-intelligence | plugin://common-room@openai-curated |
| 294 | clickup | openai-curated | sales-gtm-and-market-intelligence | plugin://clickup@openai-curated |
| 299 | sales | openai-curated-remote | sales-gtm-and-market-intelligence | plugin://sales@openai-curated-remote |

### Analytics, observability, and growth

| # | plugin | source | matched lanes | uri |
| ---: | --- | --- | --- | --- |
| 5 | posthog | openai-curated | analytics-observability-and-growth | plugin://posthog@openai-curated |
| 15 | thoughtspot | openai-curated | analytics-observability-and-growth | plugin://thoughtspot@openai-curated |
| 18 | mixpanel-headless | openai-curated | analytics-observability-and-growth | plugin://mixpanel-headless@openai-curated |
| 20 | mixpanel | openai-curated | analytics-observability-and-growth | plugin://mixpanel@openai-curated |
| 24 | similarweb | openai-curated | analytics-observability-and-growth | plugin://similarweb@openai-curated |
| 26 | datadog | openai-curated | analytics-observability-and-growth | plugin://datadog@openai-curated |
| 37 | windsor-ai | openai-curated | analytics-observability-and-growth | plugin://windsor-ai@openai-curated |
| 38 | waldo | openai-curated | analytics-observability-and-growth | plugin://waldo@openai-curated |
| 39 | vantage | openai-curated | analytics-observability-and-growth | plugin://vantage@openai-curated |
| 41 | statsig | openai-curated | analytics-observability-and-growth | plugin://statsig@openai-curated |
| 44 | semrush | openai-curated | analytics-observability-and-growth | plugin://semrush@openai-curated |
| 49 | ranked-ai | openai-curated | analytics-observability-and-growth | plugin://ranked-ai@openai-curated |
| 57 | omni-analytics | openai-curated | analytics-observability-and-growth | plugin://omni-analytics@openai-curated |
| 64 | marcopolo | openai-curated | analytics-observability-and-growth | plugin://marcopolo@openai-curated |
| 81 | brand24 | openai-curated | analytics-observability-and-growth | plugin://brand24@openai-curated |
| 98 | sentry | openai-curated | analytics-observability-and-growth | plugin://sentry@openai-curated |
| 101 | deepnote | openai-curated | analytics-observability-and-growth | plugin://deepnote@openai-curated |
| 132 | windsor-ai | claude-plugins-official | analytics-observability-and-growth | plugin://windsor-ai@claude-plugins-official |
| 151 | sentry-cli | claude-plugins-official | analytics-observability-and-growth | plugin://sentry-cli@claude-plugins-official |
| 166 | posthog | claude-plugins-official | analytics-observability-and-growth | plugin://posthog@claude-plugins-official |
| 216 | datadog | claude-plugins-official | analytics-observability-and-growth | plugin://datadog@claude-plugins-official |
| 254 | amplitude | claude-plugins-official | analytics-observability-and-growth | plugin://amplitude@claude-plugins-official |
| 265 | adobe-cja | adobe-skills | analytics-observability-and-growth, specialized-domain-and-research | plugin://adobe-cja@adobe-skills |
| 266 | adobe-analytics | adobe-skills | analytics-observability-and-growth, specialized-domain-and-research | plugin://adobe-analytics@adobe-skills |
| 283 | dovetail | openai-curated | analytics-observability-and-growth | plugin://dovetail@openai-curated |
| 284 | domotz-preview | openai-curated | analytics-observability-and-growth | plugin://domotz-preview@openai-curated |
| 289 | cube | openai-curated | analytics-observability-and-growth | plugin://cube@openai-curated |
| 290 | coupler-io | openai-curated | analytics-observability-and-growth | plugin://coupler-io@openai-curated |
| 291 | conductor | openai-curated | analytics-observability-and-growth | plugin://conductor@openai-curated |
| 300 | data-analytics | openai-curated-remote | analytics-observability-and-growth | plugin://data-analytics@openai-curated-remote |

### Backend, data, and API

| # | plugin | source | matched lanes | uri |
| ---: | --- | --- | --- | --- |
| 10 | convex | openai-curated | backend-data-and-api | plugin://convex@openai-curated |
| 31 | supabase | openai-curated | backend-data-and-api | plugin://supabase@openai-curated |
| 34 | temporal | openai-curated | backend-data-and-api | plugin://temporal@openai-curated |
| 36 | yepcode | openai-curated | backend-data-and-api | plugin://yepcode@openai-curated |
| 50 | quicknode | openai-curated | backend-data-and-api | plugin://quicknode@openai-curated |
| 60 | motherduck | openai-curated | backend-data-and-api | plugin://motherduck@openai-curated |
| 88 | neon-postgres | openai-curated | backend-data-and-api | plugin://neon-postgres@openai-curated |
| 129 | zilliz | claude-plugins-official | backend-data-and-api | plugin://zilliz@claude-plugins-official |
| 141 | supabase | claude-plugins-official | backend-data-and-api | plugin://supabase@claude-plugins-official |
| 147 | snowflake-cortex-code | claude-plugins-official | backend-data-and-api | plugin://snowflake-cortex-code@claude-plugins-official |
| 159 | redis-development | claude-plugins-official | backend-data-and-api | plugin://redis-development@claude-plugins-official |
| 163 | prisma | claude-plugins-official | backend-data-and-api | plugin://prisma@claude-plugins-official |
| 164 | postman | claude-plugins-official | backend-data-and-api | plugin://postman@claude-plugins-official |
| 169 | planetscale | claude-plugins-official | backend-data-and-api | plugin://planetscale@claude-plugins-official |
| 171 | oracle-ai-data-platform-workbench-spark-connectors | claude-plugins-official | backend-data-and-api | plugin://oracle-ai-data-platform-workbench-spark-connectors@claude-plugins-official |
| 175 | neon | claude-plugins-official | backend-data-and-api | plugin://neon@claude-plugins-official |
| 176 | mongodb | claude-plugins-official | backend-data-and-api | plugin://mongodb@claude-plugins-official |
| 201 | firebase | claude-plugins-official | backend-data-and-api | plugin://firebase@claude-plugins-official |
| 209 | duckdb-skills | claude-plugins-official | backend-data-and-api | plugin://duckdb-skills@claude-plugins-official |
| 213 | dataverse | claude-plugins-official | backend-data-and-api | plugin://dataverse@claude-plugins-official |
| 214 | datarobot-agent-skills | claude-plugins-official | backend-data-and-api | plugin://datarobot-agent-skills@claude-plugins-official |
| 215 | datahub-skills | claude-plugins-official | backend-data-and-api | plugin://datahub-skills@claude-plugins-official |
| 217 | databases-on-aws | claude-plugins-official | backend-data-and-api | plugin://databases-on-aws@claude-plugins-official |
| 218 | data-agent-kit-starter-pack | claude-plugins-official | backend-data-and-api | plugin://data-agent-kit-starter-pack@claude-plugins-official |
| 221 | convex | claude-plugins-official | backend-data-and-api | plugin://convex@claude-plugins-official |
| 229 | cloud-sql-postgresql | claude-plugins-official | backend-data-and-api | plugin://cloud-sql-postgresql@claude-plugins-official |
| 230 | clickhouse | claude-plugins-official | backend-data-and-api | plugin://clickhouse@claude-plugins-official |
| 234 | cds-mcp | claude-plugins-official | backend-data-and-api | plugin://cds-mcp@claude-plugins-official |
| 256 | alloydb | claude-plugins-official | backend-data-and-api | plugin://alloydb@claude-plugins-official |
| 257 | airtable | claude-plugins-official | backend-data-and-api | plugin://airtable@claude-plugins-official |
| 278 | pinecone | claude-plugins-official | backend-data-and-api | plugin://pinecone@claude-plugins-official |

### Cloud, DevOps, and release

| # | plugin | source | matched lanes | uri |
| ---: | --- | --- | --- | --- |
| 35 | render | openai-curated | cloud-devops-and-release | plugin://render@openai-curated |
| 99 | cloudflare | openai-curated | cloud-devops-and-release | plugin://cloudflare@openai-curated |
| 103 | circleci | openai-curated | cloud-devops-and-release | plugin://circleci@openai-curated |
| 104 | github | openai-curated | cloud-devops-and-release | plugin://github@openai-curated |
| 108 | vercel | openai-curated | cloud-devops-and-release | plugin://vercel@openai-curated |
| 109 | netlify | openai-curated | cloud-devops-and-release | plugin://netlify@openai-curated |
| 120 | azure-sdk-rust | skills | cloud-devops-and-release, platform-native-and-polyglot | plugin://azure-sdk-rust@skills |
| 121 | azure-sdk-java | skills | cloud-devops-and-release, platform-native-and-polyglot | plugin://azure-sdk-java@skills |
| 122 | azure-sdk-dotnet | skills | cloud-devops-and-release, platform-native-and-polyglot | plugin://azure-sdk-dotnet@skills |
| 123 | azure-sdk-python | skills | cloud-devops-and-release, platform-native-and-polyglot | plugin://azure-sdk-python@skills |
| 133 | vercel | claude-plugins-official | cloud-devops-and-release | plugin://vercel@claude-plugins-official |
| 138 | terraform | claude-plugins-official | cloud-devops-and-release | plugin://terraform@claude-plugins-official |
| 139 | teamcity-cli | claude-plugins-official | cloud-devops-and-release | plugin://teamcity-cli@claude-plugins-official |
| 157 | rootly | claude-plugins-official | cloud-devops-and-release | plugin://rootly@claude-plugins-official |
| 160 | railway | claude-plugins-official | cloud-devops-and-release | plugin://railway@claude-plugins-official |
| 174 | netlify-skills | claude-plugins-official | cloud-devops-and-release | plugin://netlify-skills@claude-plugins-official |
| 180 | mcp-tunnels | claude-plugins-official | cloud-devops-and-release | plugin://mcp-tunnels@claude-plugins-official |
| 198 | gitlab | claude-plugins-official | cloud-devops-and-release | plugin://gitlab@claude-plugins-official |
| 199 | github | claude-plugins-official | cloud-devops-and-release | plugin://github@claude-plugins-official |
| 205 | fastly-agent-toolkit | claude-plugins-official | cloud-devops-and-release | plugin://fastly-agent-toolkit@claude-plugins-official |
| 212 | deploy-on-aws | claude-plugins-official | cloud-devops-and-release | plugin://deploy-on-aws@claude-plugins-official |
| 228 | cloudflare | claude-plugins-official | cloud-devops-and-release | plugin://cloudflare@claude-plugins-official |
| 235 | buildkite | claude-plugins-official | cloud-devops-and-release | plugin://buildkite@claude-plugins-official |
| 240 | azure | claude-plugins-official | cloud-devops-and-release | plugin://azure@claude-plugins-official |
| 241 | aws-serverless | claude-plugins-official | cloud-devops-and-release | plugin://aws-serverless@claude-plugins-official |
| 242 | aws-dev-toolkit | claude-plugins-official | cloud-devops-and-release | plugin://aws-dev-toolkit@claude-plugins-official |
| 243 | aws-core | claude-plugins-official | cloud-devops-and-release | plugin://aws-core@claude-plugins-official |
| 244 | aws-amplify | claude-plugins-official | cloud-devops-and-release | plugin://aws-amplify@claude-plugins-official |
| 245 | aws-agents | claude-plugins-official | cloud-devops-and-release | plugin://aws-agents@claude-plugins-official |
| 264 | azure | azure-skills | cloud-devops-and-release | plugin://azure@azure-skills |
| 280 | pagerduty | claude-plugins-official | cloud-devops-and-release | plugin://pagerduty@claude-plugins-official |

### Security, quality, and governance

| # | plugin | source | matched lanes | uri |
| ---: | --- | --- | --- | --- |
| 30 | codex-security | openai-curated | security-quality-and-governance, ai-workflow-docs-and-knowledge | plugin://codex-security@openai-curated |
| 89 | coderabbit | openai-curated | security-quality-and-governance | plugin://coderabbit@openai-curated |
| 126 | zscaler | claude-plugins-official | security-quality-and-governance | plugin://zscaler@claude-plugins-official |
| 144 | sonatype-guide | claude-plugins-official | security-quality-and-governance | plugin://sonatype-guide@claude-plugins-official |
| 145 | sourcegraph | claude-plugins-official | security-quality-and-governance | plugin://sourcegraph@claude-plugins-official |
| 146 | sonarqube | claude-plugins-official | security-quality-and-governance | plugin://sonarqube@claude-plugins-official |
| 152 | semgrep | claude-plugins-official | security-quality-and-governance | plugin://semgrep@claude-plugins-official |
| 153 | security-guidance | claude-plugins-official | security-quality-and-governance | plugin://security-guidance@claude-plugins-official |
| 162 | qodo-skills | claude-plugins-official | security-quality-and-governance | plugin://qodo-skills@claude-plugins-official |
| 165 | pr-review-toolkit | claude-plugins-official | security-quality-and-governance | plugin://pr-review-toolkit@claude-plugins-official |
| 173 | nightvision | claude-plugins-official | security-quality-and-governance | plugin://nightvision@claude-plugins-official |
| 197 | greptile | claude-plugins-official | security-quality-and-governance | plugin://greptile@claude-plugins-official |
| 220 | crowdstrike-falcon-foundry | claude-plugins-official | security-quality-and-governance | plugin://crowdstrike-falcon-foundry@claude-plugins-official |
| 224 | coderabbit | claude-plugins-official | security-quality-and-governance | plugin://coderabbit@claude-plugins-official |
| 225 | code-simplifier | claude-plugins-official | security-quality-and-governance | plugin://code-simplifier@claude-plugins-official |
| 227 | code-modernization | claude-plugins-official | security-quality-and-governance | plugin://code-modernization@claude-plugins-official |
| 258 | aikido | claude-plugins-official | security-quality-and-governance | plugin://aikido@claude-plugins-official |
| 259 | ai-plugins | claude-plugins-official | security-quality-and-governance | plugin://ai-plugins@claude-plugins-official |
| 263 | 42crunch-api-security-testing | claude-plugins-official | security-quality-and-governance | plugin://42crunch-api-security-testing@claude-plugins-official |

### Collaboration, calendar, and support

| # | plugin | source | matched lanes | uri |
| ---: | --- | --- | --- | --- |
| 21 | docusign | openai-curated | collaboration-calendar-and-support | plugin://docusign@openai-curated |
| 25 | zoom | openai-curated | collaboration-calendar-and-support | plugin://zoom@openai-curated |
| 27 | asana | openai-curated | collaboration-calendar-and-support | plugin://asana@openai-curated |
| 43 | signnow | openai-curated | collaboration-calendar-and-support | plugin://signnow@openai-curated |
| 46 | readwise | openai-curated | collaboration-calendar-and-support | plugin://readwise@openai-curated |
| 47 | read-ai | openai-curated | collaboration-calendar-and-support | plugin://read-ai@openai-curated |
| 56 | otter-ai | openai-curated | collaboration-calendar-and-support | plugin://otter-ai@openai-curated |
| 62 | monday-com | openai-curated | collaboration-calendar-and-support | plugin://monday-com@openai-curated |
| 71 | granola | openai-curated | collaboration-calendar-and-support | plugin://granola@openai-curated |
| 72 | fyxer | openai-curated | collaboration-calendar-and-support | plugin://fyxer@openai-curated |
| 74 | fireflies | openai-curated | collaboration-calendar-and-support | plugin://fireflies@openai-curated |
| 75 | egnyte | openai-curated | collaboration-calendar-and-support | plugin://egnyte@openai-curated |
| 76 | circleback | openai-curated | collaboration-calendar-and-support | plugin://circleback@openai-curated |
| 100 | notion | openai-curated | collaboration-calendar-and-support | plugin://notion@openai-curated |
| 102 | google-drive | openai-curated | collaboration-calendar-and-support | plugin://google-drive@openai-curated |
| 105 | box | openai-curated | collaboration-calendar-and-support | plugin://box@openai-curated |
| 110 | jam | openai-curated | collaboration-calendar-and-support | plugin://jam@openai-curated |
| 114 | outlook-email | openai-curated | collaboration-calendar-and-support | plugin://outlook-email@openai-curated |
| 115 | gmail | openai-curated | collaboration-calendar-and-support | plugin://gmail@openai-curated |
| 116 | slack | openai-curated | collaboration-calendar-and-support | plugin://slack@openai-curated |
| 117 | google-calendar | openai-curated | collaboration-calendar-and-support | plugin://google-calendar@openai-curated |
| 118 | linear | openai-curated | collaboration-calendar-and-support | plugin://linear@openai-curated |
| 119 | atlassian-rovo | openai-curated | collaboration-calendar-and-support | plugin://atlassian-rovo@openai-curated |
| 128 | zoom-plugin | claude-plugins-official | collaboration-calendar-and-support, platform-native-and-polyglot | plugin://zoom-plugin@claude-plugins-official |
| 148 | slack | claude-plugins-official | collaboration-calendar-and-support | plugin://slack@claude-plugins-official |
| 188 | linear | claude-plugins-official | collaboration-calendar-and-support | plugin://linear@claude-plugins-official |
| 193 | imessage | claude-plugins-official | collaboration-calendar-and-support | plugin://imessage@claude-plugins-official |
| 211 | discord | claude-plugins-official | collaboration-calendar-and-support | plugin://discord@claude-plugins-official |
| 233 | circleback | claude-plugins-official | collaboration-calendar-and-support | plugin://circleback@claude-plugins-official |
| 237 | box | claude-plugins-official | collaboration-calendar-and-support | plugin://box@claude-plugins-official |
| 248 | atlassian | claude-plugins-official | collaboration-calendar-and-support | plugin://atlassian@claude-plugins-official |
| 250 | asana | claude-plugins-official | collaboration-calendar-and-support | plugin://asana@claude-plugins-official |
| 275 | presentations | openai-primary-runtime | collaboration-calendar-and-support | plugin://presentations@openai-primary-runtime |
| 276 | spreadsheets | openai-primary-runtime | collaboration-calendar-and-support | plugin://spreadsheets@openai-primary-runtime |
| 277 | documents | openai-primary-runtime | collaboration-calendar-and-support | plugin://documents@openai-primary-runtime |

### Platform native and polyglot

| # | plugin | source | matched lanes | uri |
| ---: | --- | --- | --- | --- |
| 29 | twilio-developer-kit | openai-curated | platform-native-and-polyglot | plugin://twilio-developer-kit@openai-curated |
| 93 | test-android-apps | openai-curated | platform-native-and-polyglot | plugin://test-android-apps@openai-curated |
| 96 | build-macos-apps | openai-curated | platform-native-and-polyglot | plugin://build-macos-apps@openai-curated |
| 97 | build-ios-apps | openai-curated | platform-native-and-polyglot | plugin://build-ios-apps@openai-curated |
| 131 | workos | claude-plugins-official | platform-native-and-polyglot | plugin://workos@claude-plugins-official |
| 134 | ui5-typescript-conversion | claude-plugins-official | platform-native-and-polyglot | plugin://ui5-typescript-conversion@claude-plugins-official |
| 135 | ui5 | claude-plugins-official | platform-native-and-polyglot | plugin://ui5@claude-plugins-official |
| 136 | twilio-developer-kit | claude-plugins-official | platform-native-and-polyglot | plugin://twilio-developer-kit@claude-plugins-official |
| 161 | qt-development-skills | claude-plugins-official | platform-native-and-polyglot | plugin://qt-development-skills@claude-plugins-official |
| 184 | mapbox | claude-plugins-official | platform-native-and-polyglot | plugin://mapbox@claude-plugins-official |
| 186 | liquid-skills | claude-plugins-official | platform-native-and-polyglot | plugin://liquid-skills@claude-plugins-official |
| 187 | liquid-lsp | claude-plugins-official | platform-native-and-polyglot | plugin://liquid-lsp@claude-plugins-official |
| 191 | laravel-boost | claude-plugins-official | platform-native-and-polyglot | plugin://laravel-boost@claude-plugins-official |
| 255 | amazon-location-service | claude-plugins-official | platform-native-and-polyglot | plugin://amazon-location-service@claude-plugins-official |

### Specialized domain and research

| # | plugin | source | matched lanes | uri |
| ---: | --- | --- | --- | --- |
| 42 | skywatch | openai-curated | specialized-domain-and-research | plugin://skywatch@openai-curated |
| 53 | policynote | openai-curated | specialized-domain-and-research | plugin://policynote@openai-curated |
| 73 | govtribe | openai-curated | specialized-domain-and-research | plugin://govtribe@openai-curated |
| 91 | zotero | openai-curated | specialized-domain-and-research | plugin://zotero@openai-curated |
| 92 | life-science-research | openai-curated | specialized-domain-and-research | plugin://life-science-research@openai-curated |
| 111 | hugging-face | openai-curated | specialized-domain-and-research | plugin://hugging-face@openai-curated |
| 137 | togetherai-skills | claude-plugins-official | specialized-domain-and-research | plugin://togetherai-skills@claude-plugins-official |
| 155 | sagemaker-ai | claude-plugins-official | specialized-domain-and-research | plugin://sagemaker-ai@claude-plugins-official |
| 172 | nvidia-skills | claude-plugins-official | specialized-domain-and-research | plugin://nvidia-skills@claude-plugins-official |
| 178 | microsoft-docs | claude-plugins-official | specialized-domain-and-research, ai-workflow-docs-and-knowledge | plugin://microsoft-docs@claude-plugins-official |
| 183 | math-olympiad | claude-plugins-official | specialized-domain-and-research | plugin://math-olympiad@claude-plugins-official |
| 189 | legalzoom | claude-plugins-official | specialized-domain-and-research | plugin://legalzoom@claude-plugins-official |
| 195 | huggingface-skills | claude-plugins-official | specialized-domain-and-research | plugin://huggingface-skills@claude-plugins-official |
| 267 | aem-6-5-lts | adobe-skills | specialized-domain-and-research | plugin://aem-6-5-lts@adobe-skills |
| 268 | aem-cloud-service | adobe-skills | specialized-domain-and-research | plugin://aem-cloud-service@adobe-skills |
| 269 | aem-edge-delivery-services | adobe-skills | specialized-domain-and-research | plugin://aem-edge-delivery-services@adobe-skills |
| 272 | latex | openai-bundled | specialized-domain-and-research | plugin://latex@openai-bundled |

### AI workflow, docs, and knowledge

| # | plugin | source | matched lanes | uri |
| ---: | --- | --- | --- | --- |
| 6 | nvidia | openai-curated | ai-workflow-docs-and-knowledge | plugin://nvidia@openai-curated |
| 28 | openai-developers | openai-curated | ai-workflow-docs-and-knowledge | plugin://openai-developers@openai-curated |
| 58 | network-solutions | openai-curated | ai-workflow-docs-and-knowledge | plugin://network-solutions@openai-curated |
| 63 | mem | openai-curated | ai-workflow-docs-and-knowledge | plugin://mem@openai-curated |
| 86 | plugin-eval | openai-curated | ai-workflow-docs-and-knowledge | plugin://plugin-eval@openai-curated |
| 106 | superpowers | openai-curated | ai-workflow-docs-and-knowledge | plugin://superpowers@openai-curated |
| 124 | deep-wiki | skills | ai-workflow-docs-and-knowledge | plugin://deep-wiki@skills |
| 125 | codex | openai-codex | ai-workflow-docs-and-knowledge | plugin://codex@openai-codex |
| 130 | zapier | claude-plugins-official | ai-workflow-docs-and-knowledge | plugin://zapier@claude-plugins-official |
| 140 | superpowers | claude-plugins-official | ai-workflow-docs-and-knowledge | plugin://superpowers@claude-plugins-official |
| 149 | skill-creator | claude-plugins-official | ai-workflow-docs-and-knowledge | plugin://skill-creator@claude-plugins-official |
| 150 | serena | claude-plugins-official | ai-workflow-docs-and-knowledge | plugin://serena@claude-plugins-official |
| 154 | sanity | claude-plugins-official | ai-workflow-docs-and-knowledge | plugin://sanity@claude-plugins-official |
| 158 | remember | claude-plugins-official | ai-workflow-docs-and-knowledge | plugin://remember@claude-plugins-official |
| 167 | plugin-dev | claude-plugins-official | ai-workflow-docs-and-knowledge | plugin://plugin-dev@claude-plugins-official |
| 168 | playwright | claude-plugins-official | ai-workflow-docs-and-knowledge | plugin://playwright@claude-plugins-official |
| 177 | miro | claude-plugins-official | ai-workflow-docs-and-knowledge | plugin://miro@claude-plugins-official |
| 181 | mcp-server-dev | claude-plugins-official | ai-workflow-docs-and-knowledge | plugin://mcp-server-dev@claude-plugins-official |
| 182 | mcp-apps | claude-plugins-official | ai-workflow-docs-and-knowledge | plugin://mcp-apps@claude-plugins-official |
| 185 | logfire | claude-plugins-official | ai-workflow-docs-and-knowledge | plugin://logfire@claude-plugins-official |
| 190 | learning-output-style | claude-plugins-official | ai-workflow-docs-and-knowledge | plugin://learning-output-style@claude-plugins-official |
| 196 | hookify | claude-plugins-official | ai-workflow-docs-and-knowledge | plugin://hookify@claude-plugins-official |
| 202 | forge-skills | claude-plugins-official | ai-workflow-docs-and-knowledge | plugin://forge-skills@claude-plugins-official |
| 208 | explanatory-output-style | claude-plugins-official | ai-workflow-docs-and-knowledge | plugin://explanatory-output-style@claude-plugins-official |
| 210 | dominodatalab | claude-plugins-official | ai-workflow-docs-and-knowledge | plugin://dominodatalab@claude-plugins-official |
| 222 | context7 | claude-plugins-official | ai-workflow-docs-and-knowledge | plugin://context7@claude-plugins-official |
| 223 | commit-commands | claude-plugins-official | ai-workflow-docs-and-knowledge | plugin://commit-commands@claude-plugins-official |
| 231 | claude-md-management | claude-plugins-official | ai-workflow-docs-and-knowledge | plugin://claude-md-management@claude-plugins-official |
| 232 | claude-code-setup | claude-plugins-official | ai-workflow-docs-and-knowledge | plugin://claude-code-setup@claude-plugins-official |
| 236 | brightdata-plugin | claude-plugins-official | ai-workflow-docs-and-knowledge | plugin://brightdata-plugin@claude-plugins-official |
| 246 | auth0 | claude-plugins-official | ai-workflow-docs-and-knowledge | plugin://auth0@claude-plugins-official |
| 247 | atomic-agents | claude-plugins-official | ai-workflow-docs-and-knowledge | plugin://atomic-agents@claude-plugins-official |
| 249 | atlan | claude-plugins-official | ai-workflow-docs-and-knowledge | plugin://atlan@claude-plugins-official |
| 260 | agentforce-adlc | claude-plugins-official | ai-workflow-docs-and-knowledge | plugin://agentforce-adlc@claude-plugins-official |
| 261 | agent-sdk-dev | claude-plugins-official | ai-workflow-docs-and-knowledge | plugin://agent-sdk-dev@claude-plugins-official |
| 273 | chrome | openai-bundled | ai-workflow-docs-and-knowledge | plugin://chrome@openai-bundled |
| 274 | browser | openai-bundled | ai-workflow-docs-and-knowledge | plugin://browser@openai-bundled |
| 281 | outputai | claude-plugins-official | ai-workflow-docs-and-knowledge | plugin://outputai@claude-plugins-official |
| 288 | coveo | openai-curated | ai-workflow-docs-and-knowledge | plugin://coveo@openai-curated |

## Governance Notes

- Every submitted plugin URI is visible in the inventory and mapped to a primary capability lane.
- Lane assignment is source governance, not blanket connector activation.
- Live use still requires the matching tool/plugin, authentication, scoped task intent, and low-power validation.
