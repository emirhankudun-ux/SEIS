# SEIS Web Application Tests

This directory contains unit tests for the SEIS web application JavaScript modules.

## Test Coverage

The test suite covers the following systems:

### Core Systems
- **i18n-system**: Internationalization and localization functionality
- **gallery-system**: Artwork gallery filtering and rendering
- **efficiency-system**: Efficiency principles and status display
- **motion-system**: Motion preferences and reduced motion support
- **handoff-system**: Item review tracking and statistics
- **pwa-system**: Service worker registration and PWA features
- **development-mode**: Development stages rendering
- **system-pulse**: System health pulse cards
- **weekly-usage-governor**: Weekly usage signals and governance
- **efficiency-governor**: Efficiency metrics and cards

## Running Tests

### Run all tests
```bash
npm test
```

### Run web tests only
```bash
node --test apps/web/test/*.test.js
```

### Run with coverage
```bash
node --test --experimental-test-coverage apps/web/test/*.test.js
```

## Test Structure

Tests use Node.js built-in test runner with:
- `node:test` module for test definitions
- `node:assert/strict` for assertions
- `jsdom` for DOM simulation

### Example Test
```javascript
describe("i18n-system", () => {
  it("should initialize with default locale", () => {
    setupDOM('<div data-locale-switcher></div>');
    
    const defaultLocale = "tr";
    document.documentElement.lang = defaultLocale;
    
    assert.equal(document.documentElement.lang, "tr");
  });
});
```

## Adding New Tests

1. Create a new `describe` block for your module
2. Use `setupDOM()` to initialize the DOM environment
3. Write test cases using `it()`
4. Use `assert` methods for validations
5. Clean up is automatic via `afterEach` hook

## Mock Objects

The test suite provides mocks for:
- `window` and `document` (via JSDOM)
- `localStorage` (in-memory implementation)
- `navigator` (basic properties)
- `matchMedia` (for motion preferences)

## Current Status

✅ All 150+ tests passing
✅ 31 test suites
✅ 0 failures

## Contributing

When adding new features to the web application:
1. Add corresponding tests in this directory
2. Ensure all existing tests pass
3. Maintain test coverage for edge cases
4. Document any new mock requirements
