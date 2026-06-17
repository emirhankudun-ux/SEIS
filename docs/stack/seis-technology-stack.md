# SEIS Technology Stack

SEIS separates two surfaces that should not be mixed:

1. GitHub source languages are real code and config languages counted from source files.
2. Ecosystem technologies are frameworks, SDKs, cloud products, databases, IDEs, design tools, and productivity systems.

The generated source of truth lives in:

- `content/development/seis-technology-stack.json`
- `reports/seis-technology-stack.md`
- `reports/seis-technology-stack.json`

## Rule

Do not add placeholder code just to make a language appear larger in GitHub.
Real languages belong in the language surface. Frameworks and tools belong in
the ecosystem stack.

## Checks

```bash
npm run automation:seis-technology-stack
npm run check:seis-technology-stack
```

This keeps the language catalog and the technology matrix reviewable without
installing extra runtimes or changing repository behavior.
