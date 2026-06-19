# SEIS Design System

## Overview

The SEIS Design System is a premium, minimal, and modern design language inspired by Apple, Linear, Raycast, GitHub, Vercel, and Notion. It provides consistent UI/UX patterns across all SEIS applications.

## Core Principles

1. **Calm Technology**: Unobtrusive, focused, respectful of user attention
2. **Premium Minimalism**: Clean, refined, essential elements only
3. **Accessibility First**: WCAG 2.1 AA compliance as baseline
4. **Responsive Everywhere**: Fluid layouts from mobile to desktop
5. **Dark/Light Mode**: Full theme support with smooth transitions

---

## Design Tokens

### Colors

#### Light Mode

```css
:root {
  /* Backgrounds */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f7f7f9;
  --color-bg-tertiary: #eff0f4;
  --color-bg-elevated: #ffffff;
  
  /* Text */
  --color-text-primary: #1d1d1f;
  --color-text-secondary: #6e6e73;
  --color-text-tertiary: #86868b;
  --color-text-inverse: #ffffff;
  
  /* Borders */
  --color-border-primary: #d2d2d7;
  --color-border-secondary: #e5e5ea;
  --color-border-tertiary: #f0f0f5;
  
  /* Accents */
  --color-accent-blue: #0071e3;
  --color-accent-blue-hover: #0077ed;
  --color-accent-green: #34c759;
  --color-accent-red: #ff3b30;
  --color-accent-orange: #ff9500;
  --color-accent-purple: #af52de;
  
  /* Status */
  --color-success: #34c759;
  --color-warning: #ff9500;
  --color-error: #ff3b30;
  --color-info: #0071e3;
}
```

#### Dark Mode

```css
[data-theme="dark"] {
  /* Backgrounds */
  --color-bg-primary: #000000;
  --color-bg-secondary: #1c1c1e;
  --color-bg-tertiary: #2c2c2e;
  --color-bg-elevated: #1c1c1e;
  
  /* Text */
  --color-text-primary: #f5f5f7;
  --color-text-secondary: #a1a1a6;
  --color-text-tertiary: #6e6e73;
  --color-text-inverse: #1d1d1f;
  
  /* Borders */
  --color-border-primary: #48484a;
  --color-border-secondary: #38383a;
  --color-border-tertiary: #2c2c2e;
  
  /* Accents */
  --color-accent-blue: #0a84ff;
  --color-accent-blue-hover: #409cff;
  --color-accent-green: #30d158;
  --color-accent-red: #ff453a;
  --color-accent-orange: #ff9f0a;
  --color-accent-purple: #bf5af2;
}
```

### Typography

#### Font Families

```css
:root {
  /* Primary: System fonts for native feel */
  --font-family-sans: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  
  /* Monospace: For code and technical content */
  --font-family-mono: "SF Mono", "Fira Code", "Fira Mono", Menlo, Monaco, Consolas, monospace;
}
```

#### Font Sizes

```css
:root {
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */
  --font-size-5xl: 3rem;      /* 48px */
}
```

#### Font Weights

```css
:root {
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

#### Line Heights

```css
:root {
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.625;
}
```

### Spacing

```css
:root {
  --spacing-0: 0;
  --spacing-1: 0.25rem;  /* 4px */
  --spacing-2: 0.5rem;   /* 8px */
  --spacing-3: 0.75rem;  /* 12px */
  --spacing-4: 1rem;     /* 16px */
  --spacing-5: 1.25rem;  /* 20px */
  --spacing-6: 1.5rem;   /* 24px */
  --spacing-8: 2rem;     /* 32px */
  --spacing-10: 2.5rem;  /* 40px */
  --spacing-12: 3rem;    /* 48px */
  --spacing-16: 4rem;    /* 64px */
  --spacing-20: 5rem;    /* 80px */
  --spacing-24: 6rem;    /* 96px */
}
```

### Border Radius

```css
:root {
  --radius-sm: 0.25rem;   /* 4px */
  --radius-md: 0.5rem;    /* 8px */
  --radius-lg: 0.75rem;   /* 12px */
  --radius-xl: 1rem;      /* 16px */
  --radius-2xl: 1.5rem;   /* 24px */
  --radius-full: 9999px;  /* Circle */
}
```

### Shadows

```css
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
}
```

### Transitions

```css
:root {
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-spring: 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Z-Index Scale

```css
:root {
  --z-index-base: 0;
  --z-index-dropdown: 100;
  --z-index-sticky: 200;
  --z-index-fixed: 300;
  --z-index-modal-backdrop: 400;
  --z-index-modal: 500;
  --z-index-popover: 600;
  --z-index-tooltip: 700;
  --z-index-toast: 800;
}
```

---

## Components

### Buttons

#### Primary Button

```html
<button class="btn btn-primary">
  Get Started
</button>
```

```css
.btn-primary {
  background-color: var(--color-accent-blue);
  color: var(--color-text-inverse);
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
}

.btn-primary:hover {
  background-color: var(--color-accent-blue-hover);
  transform: translateY(-1px);
}
```

#### Secondary Button

```html
<button class="btn btn-secondary">
  Learn More
</button>
```

```css
.btn-secondary {
  background-color: transparent;
  color: var(--color-accent-blue);
  padding: var(--spacing-3) var(--spacing-6);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
}

.btn-secondary:hover {
  background-color: var(--color-bg-tertiary);
}
```

### Cards

```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
  </div>
  <div class="card-body">
    <p>Card content goes here...</p>
  </div>
</div>
```

```css
.card {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: all var(--transition-normal);
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card-header {
  padding: var(--spacing-4) var(--spacing-6);
  border-bottom: 1px solid var(--color-border-tertiary);
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.card-body {
  padding: var(--spacing-6);
  color: var(--color-text-secondary);
}
```

### Inputs

```html
<div class="form-group">
  <label class="form-label" for="input-example">Label</label>
  <input 
    type="text" 
    id="input-example" 
    class="form-input"
    placeholder="Enter text..."
  />
</div>
```

```css
.form-group {
  margin-bottom: var(--spacing-6);
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-2);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.form-input {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-base);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-accent-blue);
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.15);
}

.form-input::placeholder {
  color: var(--color-text-tertiary);
}
```

### Badges

```html
<span class="badge badge-success">Success</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-error">Error</span>
<span class="badge badge-info">Info</span>
```

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-1) var(--spacing-3);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-full);
}

.badge-success {
  background-color: rgba(52, 199, 89, 0.1);
  color: var(--color-success);
}

.badge-warning {
  background-color: rgba(255, 149, 0, 0.1);
  color: var(--color-warning);
}

.badge-error {
  background-color: rgba(255, 59, 48, 0.1);
  color: var(--color-error);
}

.badge-info {
  background-color: rgba(0, 113, 227, 0.1);
  color: var(--color-info);
}
```

---

## Layout Patterns

### Container

```css
.container {
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--spacing-6);
  padding-right: var(--spacing-6);
}

@media (max-width: 768px) {
  .container {
    padding-left: var(--spacing-4);
    padding-right: var(--spacing-4);
  }
}
```

### Grid System

```css
.grid {
  display: grid;
  gap: var(--spacing-6);
}

.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }

@media (max-width: 1024px) {
  .grid-cols-4,
  .grid-cols-3 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .grid-cols-2,
  .grid-cols-3,
  .grid-cols-4 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
```

---

## Accessibility Guidelines

### Color Contrast

All text must meet WCAG 2.1 AA contrast requirements:

- **Normal text**: 4.5:1 minimum contrast ratio
- **Large text** (18pt+): 3:1 minimum contrast ratio
- **UI components**: 3:1 minimum contrast ratio

### Focus States

All interactive elements must have visible focus indicators:

```css
/* Default focus ring */
*:focus {
  outline: 2px solid var(--color-accent-blue);
  outline-offset: 2px;
}

/* Custom focus ring */
.btn:focus {
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.15);
}
```

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Logical tab order (left-to-right, top-to-bottom)
- Visible focus indicators at all times
- Skip links for main content

### Screen Reader Support

- Use semantic HTML elements
- Provide alt text for images
- Use ARIA labels where needed
- Hide decorative elements with `aria-hidden="true"`

---

## Motion Guidelines

### Animation Principles

1. **Purposeful**: Every animation should serve a functional purpose
2. **Subtle**: Avoid excessive or distracting motion
3. **Fast**: Keep animations under 300ms for most interactions
4. **Smooth**: Use appropriate easing curves

### Easing Curves

```css
/* Standard easing */
.ease-out {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Spring easing for playful interactions */
.ease-spring {
  transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Reduced Motion

Respect user preferences for reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Responsive Breakpoints

```css
/* Mobile first approach */
/* Small devices (landscape phones, 640px and up) */
@media (min-width: 640px) { ... }

/* Medium devices (tablets, 768px and up) */
@media (min-width: 768px) { ... }

/* Large devices (desktops, 1024px and up) */
@media (min-width: 1024px) { ... }

/* Extra large devices (large desktops, 1280px and up) */
@media (min-width: 1280px) { ... }
```

---

## Usage Examples

### Page Layout

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SEIS Page</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="site-header">
    <nav class="container">
      <!-- Navigation -->
    </nav>
  </header>
  
  <main class="container">
    <section class="hero">
      <h1>Welcome to SEIS</h1>
      <p>The AI-native creative engineering ecosystem</p>
      <div class="cta-group">
        <button class="btn btn-primary">Get Started</button>
        <button class="btn btn-secondary">Learn More</button>
      </div>
    </section>
    
    <section class="features grid grid-cols-3">
      <!-- Feature cards -->
    </section>
  </main>
  
  <footer class="site-footer">
    <div class="container">
      <!-- Footer content -->
    </div>
  </footer>
</body>
</html>
```

---

## Maintenance

### Version History

- **v1.0.0** (June 2026) - Initial design system documentation

### Contributing

To propose changes to the design system:

1. Create a design proposal in `docs/design-system/proposals/`
2. Discuss in GitHub Discussions
3. Implement approved changes
4. Update this documentation

### Resources

- [Apple Human Interface Guidelines](https://developer.apple.com/design/)
- [Linear Design](https://linear.app/design)
- [Raycast UI](https://www.raycast.com/)
- [GitHub Primer](https://primer.style/)
- [Vercel Design](https://vercel.com/design)

---

*Last Updated: June 2026*  
*Maintained by: SEIS Design Team*
