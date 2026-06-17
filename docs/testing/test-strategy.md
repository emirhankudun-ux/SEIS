# SEIS Test Strategy

## Overview

SEIS maintains a comprehensive testing strategy across JavaScript, Go, and Python components with automated coverage tracking and quality gates.

## Test Coverage Status

### Current Coverage (as of June 2026)

| Component | Tests | Suites | Pass Rate | Coverage |
|-----------|-------|--------|-----------|----------|
| **JavaScript (Root)** | 150 | 31 | 100% | 98.56% lines |
| **packages/seis-ai** | 125 | 21 | 100% | - |
| **apps/web** | 25 | 10 | 100% | - |
| **polyglot/go** | - | - | 100% | - |
| **seis_kernel_go** | - | - | 100% | - |

### Coverage Breakdown

```
file                                      | line % | branch % | funcs % | uncovered lines
------------------------------------------|--------|----------|---------|------------------
apps/web/test/scripts.test.js             |  98.77 |    75.81 |   83.64 | 292-294 349-350 359-361
packages/seis-ai/src/agent/loop.mjs       | 100.00 |   100.00 |   85.71 |
packages/seis-ai/src/agent/tools.mjs      |  99.19 |    71.64 |  100.00 | 179-180
packages/seis-ai/src/lib/checks.mjs       |  95.89 |    84.71 |   95.16 | 34-35 193-194...
packages/seis-ai/src/lib/i18n-write.mjs   |  96.08 |    94.29 |  100.00 | 12-13 46-47
packages/seis-ai/src/lib/repo.mjs         |  98.11 |    94.74 |  100.00 | 39
packages/seis-ai/test/agent.test.mjs      | 100.00 |   100.00 |   98.51 |
packages/seis-ai/test/checks.test.mjs     | 100.00 |   100.00 |   98.70 |
packages/seis-ai/test/i18n-write.test.mjs | 100.00 |   100.00 |  100.00 |
packages/seis-ai/test/mcp-smoke.test.mjs  |  95.56 |    89.47 |   81.25 | 29-30 45-50
packages/seis-ai/test/repo.test.mjs       | 100.00 |   100.00 |  100.00 |
------------------------------------------|--------|----------|---------|------------------
all files                                 |  98.56 |    89.19 |   94.83 |
```

## Running Tests

### All Tests
```bash
npm run test:all
```

### Coverage Report
```bash
npm run test:coverage
```

### Web App Tests Only
```bash
npm run test:web
```

### Package Tests
```bash
# seis-ai package
cd packages/seis-ai && node --test test/*.test.mjs

# Go kernel
cd packages/seis_kernel_go && go test ./...

# Polyglot Go
cd polyglot/go && go test ./...
```

## Test Modules

### Web Application (`apps/web/test/`)

Tests cover 10 core modules:

1. **i18n-system** - Internationalization and locale management
2. **gallery-system** - Content gallery rendering
3. **efficiency-system** - Efficiency metrics display
4. **motion-system** - Animation and motion preferences
5. **handoff-system** - User handoff and state management
6. **pwa-system** - Progressive Web App functionality
7. **development-mode** - Development environment detection
8. **system-pulse** - System health monitoring
9. **weekly-usage-governor** - Usage tracking and governance
10. **efficiency-governor** - Efficiency card management

Each module includes tests for:
- Core functionality
- Edge cases (empty arrays, missing data)
- DOM manipulation
- Event handling
- State persistence

### AI Package (`packages/seis-ai/test/`)

Test coverage includes:

- **agent.test.mjs** - Agent loop and orchestration
- **checks.test.mjs** - Validation and verification checks
- **i18n-write.test.mjs** - Internationalization write operations
- **mcp-smoke.test.mjs** - MCP server smoke tests
- **repo.test.mjs** - Repository utilities

## Quality Gates

### ESLint Integration
- Security scanning with `eslint-plugin-security`
- TypeScript-eslint for type safety
- Zero errors required for CI pass
- Warnings tracked for technical debt

### Current ESLint Status
- **Errors**: 0 ✅
- **Warnings**: 10 (security/detect-object-injection - expected for i18n lookups)

## Security Testing

### Automated Scanning
- GitHub CodeQL on PRs and main pushes
- Weekly scheduled scans
- Manual dispatch capability

### Manual Security Review
- localStorage error handling (try-catch wrapping)
- textContent usage for XSS prevention
- Service worker secure context validation
- Object injection warnings documented and reviewed

## Performance Testing

### Test Execution Time
- Root tests: ~10 seconds
- Web app tests: ~4 seconds
- seis-ai tests: ~4.5 seconds
- Go tests: cached (sub-second)

## Continuous Integration

Tests run automatically on:
- Pull requests to main
- Pushes to main branch
- Weekly scheduled runs
- Release preparation

## Contributing Tests

When adding new features:

1. Create test file in appropriate `test/` directory
2. Follow existing test patterns
3. Ensure 100% pass rate
4. Maintain or improve coverage
5. Document edge cases tested

### Test Template
```javascript
import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('module-name', () => {
  it('should handle core functionality', () => {
    // Test implementation
  });

  it('should handle edge case', () => {
    // Edge case test
  });
});
```

## Future Improvements

- [ ] Increase branch coverage to 95%+
- [ ] Add integration tests for full-stack flows
- [ ] Implement visual regression testing
- [ ] Add performance benchmark tests
- [ ] Expand E2E testing coverage
- [ ] Add load testing for server components

## References

- [Testing Documentation](/docs/testing/)
- [Contributing Guide](/CONTRIBUTING.md)
- [Security Policy](/SECURITY.md)
- [Code Quality Standards](/docs/quality/)
