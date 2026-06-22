# Pull Request Template

## Description

<!--- Describe your changes in detail. Include context if needed. -->

## Type of Change

<!--- Mark the appropriate option with an [x] -->

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring
- [ ] Test addition/modification
- [ ] Configuration change
- [ ] Security patch

## Related Issues

<!--- Link to related issues using GitHub syntax: #123 -->

Fixes #
Related to #

## Testing

### Tests Performed

<!--- Describe what testing you performed -->

- [ ] I have run `npm run check:foundation` locally
- [ ] I have run `npm run check:workspace` locally
- [ ] I have run existing tests (`npm test`)
- [ ] I have added/updated unit tests for new functionality
- [ ] I have tested manually in the browser
- [ ] I have tested on multiple browsers (if UI change)
- [ ] I have tested on mobile devices (if applicable)

### Test Evidence

<!--- Provide details about test results -->

**Test Command:** 
```bash
npm run check:foundation
```

**Result:**
```
[Paste output here]
```

**New Tests Added:**
- [ ] Unit tests for new functions
- [ ] Integration tests for new workflows
- [ ] E2E tests for user journeys (if applicable)

## Screenshots (if applicable)

<!--- For UI changes, include before/after screenshots -->

**Before:**

**After:**

## Checklist

### Code Quality

- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings or errors
- [ ] I have checked my code for potential security issues
- [ ] I have verified there are no duplicate translation keys (if i18n changes)

### Documentation

- [ ] I have updated relevant documentation (README, ARCHITECTURE, etc.)
- [ ] I have added JSDoc comments for public APIs
- [ ] I have updated the CHANGELOG.md with my changes
- [ ] I have documented any breaking changes

### Dependencies

- [ ] My changes do not require new dependencies
- [ ] OR: I have justified why new dependencies are needed
- [ ] I have checked for dependency conflicts
- [ ] I have run `npm audit` and addressed any vulnerabilities

### Branch & Commit Standards

- [ ] My branch is up-to-date with the base branch (UIXAppTTR)
- [ ] My commits follow conventional commit format:
  - `feat(scope): description`
  - `fix(scope): description`
  - `docs(scope): description`
  - etc.
- [ ] I have squashed unnecessary commits

## Deployment Notes

<!--- Any special deployment considerations? -->

- [ ] No special deployment steps required
- [ ] OR: Describe deployment steps below:

```
[Add deployment notes here]
```

## Migration Notes (if applicable)

<!--- If this change requires data migration, config updates, or other migration steps -->

- [ ] No migration required
- [ ] OR: Describe migration steps:

```
[Add migration notes here]
```

## Risk Assessment

### Impact Level

- [ ] Low (minor change, low risk)
- [ ] Medium (moderate change, some risk)
- [ ] High (major change, significant risk)

### Rollback Plan

<!--- How can this change be rolled back if issues occur? -->

```
[Describe rollback procedure]
```

## Additional Context

<!--- Add any other context about the PR here -->

---

## Reviewer Guidelines

### For Maintainers

**Before approving, verify:**

- [ ] Code quality meets standards
- [ ] Tests pass and cover new functionality
- [ ] Documentation is complete
- [ ] No security concerns
- [ ] Performance impact is acceptable
- [ ] Breaking changes are properly communicated

**Review Focus Areas:**

1. **Architecture**: Does this align with ARCHITECTURE.md?
2. **Security**: Are there any security implications?
3. **Performance**: Will this impact performance negatively?
4. **Accessibility**: Does this meet accessibility standards? (for UI changes)
5. **Internationalization**: Is i18n handled correctly? (for user-facing changes)

---

**Thank you for contributing to SEIS!** 🎉

*For more details, see [CONTRIBUTING.md](CONTRIBUTING.md) and [AGENTS.md](AGENTS.md).*
