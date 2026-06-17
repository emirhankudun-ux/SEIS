# UX Monorepo Setup Guide

## Overview

The UX project is organized as a monorepo using npm workspaces for managing multiple related packages and applications.

## Monorepo Structure

```
UX/
├── packages/
│   ├── core/           # Core functionality
│   ├── ui-components/  # Reusable UI components
│   ├── utils/          # Utility functions
│   └── [other packages]
├── apps/
│   ├── web/            # Main web application
│   ├── docs/           # Documentation site
│   └── [other apps]
├── package.json        # Root workspace config
├── tsconfig.base.json  # Base TypeScript config
└── README.md
```

## Setup Instructions

### 1. Workspace Configuration

Ensure `package.json` includes:

```json
{
  "workspaces": [
    "packages/*",
    "apps/*"
  ]
}
```

### 2. Package Installation

```bash
npm install
```

This installs dependencies for all packages in the monorepo.

### 3. Running Scripts Across Workspaces

```bash
# Run script in specific workspace
npm run build -w packages/core

# Run in all workspaces
npm run build

# Run in specific app
npm run dev -w apps/web
```

### 4. Development Workflow

```bash
# Start all dev servers
npm run dev

# Start specific app
npm run dev -w apps/web

# Build all packages
npm run build

# Run tests across monorepo
npm test
```

## Best Practices

✅ Use consistent versioning across packages
✅ Document interdependencies
✅ Keep package scope focused
✅ Use shared configuration files
✅ Maintain separate CHANGELOG for major packages

## Troubleshooting

**Problem**: Dependencies not resolving across packages
**Solution**: Ensure workspaces are properly configured and run `npm install`

**Problem**: Circular dependencies
**Solution**: Review package interdependencies and restructure if needed

**Problem**: Inconsistent TypeScript versions
**Solution**: Use `tsconfig.base.json` for shared configuration

## Scripts

See [Vercel Config](./vercel.json) for deployment configuration.

## Migration Checklist

- [ ] Audit current dependency structure
- [ ] Identify distinct packages
- [ ] Create workspace structure
- [ ] Update build scripts
- [ ] Configure CI/CD for workspaces
- [ ] Document workspace guidelines
- [ ] Train team on workspace usage

## Additional Resources

- [npm Workspaces Documentation](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
- [Monorepo Best Practices](./docs/monorepo-guide.md)
- [TypeScript Configuration](./tsconfig.base.json)

---

For issues, see [AGENTS.md](./AGENTS.md)
