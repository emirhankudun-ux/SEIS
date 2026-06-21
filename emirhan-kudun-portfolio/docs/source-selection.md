# Source Selection Notes

This implementation uses the four supplied PortfolioWebsite zip archives conservatively.

- `emirhan-kudun-fullstack-portfolio-fullstack-v4.zip`: latest portfolio/static baseline, contact email, multilingual structure, and the complete 20-item drawing archive.
- `emirhan-kudun-fullstack-portfolio-fullstack-infra-v1.zip`: runtime/infrastructure baseline, content model, full-stack preflight ideas, and MCP catalog reference.
- `emirhan-kudun-fullstack-portfolio-fullstack-v3.zip`: reference history only.
- `emirhan-kudun-fullstack-portfolio-fullstack-v2.zip`: reference history only.

Tracked source metadata lives in `packages/runtime/src/source-archives.json` with SHA-256 hashes so archive selection remains auditable without importing bulk noise.

Excluded from import:

- `node_modules`
- `.next`
- `.git`
- `__MACOSX`
- `.DS_Store`
- nested duplicate zip files
- credentials, keys, encrypted config, and generated noise
