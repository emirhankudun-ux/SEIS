# Contributing to SEIS

Thank you for your interest in contributing to SEIS! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

## Code of Conduct

SEIS is committed to providing a welcoming and inclusive environment. All contributors are expected to:

- Be respectful and constructive in discussions
- Welcome newcomers and help them get started
- Focus on what's best for the community
- Accept constructive criticism gracefully
- Show empathy towards other community members

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js 18+ installed
- Git configured with SSH keys
- A GitHub account
- Familiarity with the [AGENTS.md](AGENTS.md) guidelines

### First Contributions

If you're new to SEIS, here are some good ways to start:

1. **Fix a bug**: Look for issues labeled `good first issue` or `bug`
2. **Improve documentation**: Fix typos, clarify instructions, add examples
3. **Add tests**: Help improve test coverage
4. **Report issues**: Found a bug? Open a detailed issue report
5. **Suggest features**: Have an idea? Start a discussion

## Development Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone:
git clone git@github.com:your-username/SEIST.git
cd SEIST
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Verify Setup

```bash
# Run foundation checks
npm run check:foundation

# Run workspace validation
npm run check:workspace
```

### 4. Create a Branch

```bash
# Always branch from the latest main
git checkout UIXAppTTR
git pull origin UIXAppTTR

# Create your feature branch
git checkout -b feat/your-feature-name
```

Branch naming conventions:

- `feat/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation changes
- `refactor/description` - Code refactoring
- `test/description` - Test additions/modifications
- `chore/description` - Maintenance tasks

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the behavior
- **Expected vs actual behavior**
- **Screenshots** if applicable
- **Environment details** (OS, browser, Node version)

**Example:**

```markdown
**Bug**: Motion system crashes on Safari

**Steps to Reproduce:**
1. Open app in Safari 16+
2. Navigate to case study detail
3. Scroll down quickly

**Expected:** Smooth animation
**Actual:** Console error and frozen UI

**Environment:** macOS 14, Safari 17.0
```

### Suggesting Features

Feature suggestions should:

- Explain the **problem** you're solving
- Describe the **proposed solution**
- Discuss **alternatives considered**
- Outline **potential impact**

Start with a GitHub Discussion before creating a formal issue.

### Making Changes

1. **Make your changes** following coding standards
2. **Test locally** to ensure everything works
3. **Update documentation** if needed
4. **Run checks** before committing:

```bash
npm run check:foundation
npm run check:workspace
```

## Coding Standards

### General Principles

- **Readability**: Write code that's easy to understand
- **Modularity**: Keep functions small and focused
- **Consistency**: Follow existing patterns
- **Documentation**: Comment non-obvious logic
- **Security**: Never commit secrets or sensitive data

### JavaScript/TypeScript

```javascript
// ✅ Good: Clear naming, single responsibility
function validateLocaleKey(key, locale) {
  if (!key || typeof key !== 'string') {
    return false;
  }
  return supportedLocales[locale]?.hasOwnProperty(key) ?? false;
}

// ❌ Bad: Unclear naming, multiple responsibilities
function check(k, l) {
  if (!k) return false;
  return supportedLocales[l] && supportedLocales[l][k];
}
```

**Style Guidelines:**

- Use **const** by default, **let** when reassignment is needed
- Prefer **arrow functions** for callbacks and short functions
- Use **template literals** for string interpolation
- Add **JSDoc comments** for public APIs
- Keep lines under **100 characters** when possible

### File Organization

```
apps/web/
├── src/
│   ├── scripts/      # Core JavaScript modules
│   ├── i18n/         # Internationalization
│   ├── components/   # Reusable UI components
│   └── styles/       # CSS and design tokens
├── tests/            # Test files
└── index.html        # Entry point
```

### Commit Messages

Follow conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, no code change
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**

```bash
# Good commit messages
feat(i18n): add Arabic locale support
fix(motion): resolve Safari animation crash
docs(readme): update installation instructions
refactor(handoff): simplify device detection logic
test(i18n-system): add unit tests for key validation
chore(deps): update three.js to r162

# Bad commit messages
update stuff
fix bug
changes
final fix
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- i18n-system.test.js

# Run with coverage
npm test -- --coverage
```

### Writing Tests

Tests should be:

- **Descriptive**: Clear test names explaining the scenario
- **Isolated**: No dependencies between tests
- **Deterministic**: Same input always produces same output
- **Fast**: Quick execution for rapid feedback

**Example:**

```javascript
describe('i18n-system', () => {
  describe('validateLocaleKey', () => {
    it('returns true for valid key in supported locale', () => {
      const result = validateLocaleKey('home.title', 'en');
      expect(result).toBe(true);
    });

    it('returns false for invalid key', () => {
      const result = validateLocaleKey('nonexistent.key', 'en');
      expect(result).toBe(false);
    });

    it('returns false for unsupported locale', () => {
      const result = validateLocaleKey('home.title', 'xx');
      expect(result).toBe(false);
    });
  });
});
```

## Documentation

### Documentation Standards

All documentation should be:

- **Clear**: Easy to understand
- **Concise**: No unnecessary verbosity
- **Accurate**: Reflects current behavior
- **Complete**: Covers all relevant aspects
- **Maintainable**: Easy to update

### Updating Documentation

When making changes, update relevant docs:

- **Code changes** → Update inline comments and JSDoc
- **API changes** → Update API documentation
- **Setup changes** → Update README and setup guides
- **Architecture changes** → Update ARCHITECTURE.md
- **New features** → Add to CHANGELOG.md

## Pull Request Process

### Before Submitting

1. **Rebase on latest main**

```bash
git fetch origin
git rebase origin/UIXAppTTR
```

2. **Run all checks**

```bash
npm run check:foundation
npm run check:workspace
npm test
```

3. **Review your changes**

```bash
git diff origin/UIXAppTTR
```

### PR Template

When creating a PR, fill out the template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added (if applicable)
- [ ] Manual testing completed

## Screenshots
Include screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass
```

### Review Process

1. **Automated Checks**: CI/CD workflows run automatically
2. **Code Review**: At least one maintainer review required
3. **Address Feedback**: Make requested changes promptly
4. **Approval**: Once approved, PR will be merged

### After Merge

- Delete your feature branch
- Monitor for any issues
- Celebrate! 🎉

## Community

### Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and ideas
- **Documentation**: Check existing docs first

### Communication

- Be patient and respectful
- Provide context when asking questions
- Share what you've tried already
- Thank people for their help

### Recognition

Contributors are recognized in:

- CHANGELOG.md
- README.md contributors section
- Annual contributor highlights

## License

By contributing to SEIS, you agree that your contributions will be licensed under the project's license. See [LICENSE](LICENSE) for details.

---

**Ready to contribute?** Start by checking out [issues labeled "good first issue"](https://github.com/SEIS/SEIST/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)!
