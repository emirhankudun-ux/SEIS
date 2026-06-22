```markdown
# UIX-Apps Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches you how to develop, optimize, and extend interactive, animated UI sections and 3D effects in the UIX-Apps JavaScript codebase. You'll learn the project's coding conventions, step-by-step workflows for adding or enhancing animated and 3D UI features, and how to optimize animation performance. The repository is JavaScript-based, with no detected framework, and focuses on visually rich, performant user interfaces.

---

## Coding Conventions

**File Naming:**
- Use `camelCase` for JavaScript files.
  - Example: `threeScene.js`, `skillsOrbit.js`

**Import Style:**
- Use absolute imports.
  - Example:
    ```js
    import { animateOrbit } from 'threeScene.js';
    ```

**Export Style:**
- Use named exports.
  - Example:
    ```js
    // In threeScene.js
    export function animateOrbit() { ... }
    export const ORBIT_RADIUS = 120;
    ```

**Commit Messages:**
- Freeform, sometimes prefixed (e.g., `perf:` for performance).
- Example:  
  `perf: optimize orbit animation for smoother transitions`

---

## Workflows

### Add or Enhance Animated UI Section

**Trigger:** When introducing a new visually rich section or feature with animation/interactivity, or significantly enhancing an existing one.  
**Command:** `/new-animated-section`

1. **Update or add section markup in `index.html`.**
   - Example:
     ```html
     <section id="skills-orbit"></section>
     ```
2. **Add or modify corresponding styles and keyframes in `style.css`.**
   - Example:
     ```css
     #skills-orbit {
       animation: orbitIn 1s cubic-bezier(.5, .2, .1, 1);
     }
     @keyframes orbitIn {
       from { opacity: 0; transform: scale(0.8);}
       to   { opacity: 1; transform: scale(1);}
     }
     ```
3. **Implement or extend animation logic in `three-scene.js` (or relevant JS file).**
   - Example:
     ```js
     export function initSkillsOrbit() {
       // Animation logic for orbiting skills
     }
     ```
4. **Integrate with motion/accessibility systems.**
   - Example:
     ```js
     if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
       // Reduce or disable animation
     }
     ```
5. **Test the new section for accessibility and responsiveness.**

---

### Refine or Optimize Animation Performance

**Trigger:** When improving performance, fixing animation bugs, or addressing code review feedback related to UI interactions.  
**Command:** `/optimize-animation`

1. **Identify performance bottlenecks or animation issues in JS and CSS.**
   - Use browser devtools to profile animations.
2. **Update `style.css` to optimize transitions, `will-change` usage, or motion gating.**
   - Example:
     ```css
     .animated {
       will-change: transform, opacity;
     }
     ```
3. **Refactor animation logic in `three-scene.js` for efficiency.**
   - Example:
     ```js
     // Cache DOM queries and animation objects
     const orbitEl = document.getElementById('skills-orbit');
     ```
4. **Test changes under various motion/accessibility settings.**
   - Example:
     ```js
     if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
       // Provide fallback or static UI
     }
     ```

---

### Add or Enhance 3D Effects or Postprocessing

**Trigger:** When adding new 3D visual effects (e.g., bloom, film grain, particles) or enhancing existing ones for richer UI depth.  
**Command:** `/add-3d-effect`

1. **Implement or extend effect logic in `three-scene.js`.**
   - Example:
     ```js
     export function addBloomEffect(scene) {
       // Add Three.js bloom postprocessing
     }
     ```
2. **Update `style.css` for any related visual cues or overlays.**
   - Example:
     ```css
     .bloom-overlay {
       pointer-events: none;
       mix-blend-mode: screen;
     }
     ```
3. **Optionally update `index.html` if new DOM elements or containers are needed.**
   - Example:
     ```html
     <div class="bloom-overlay"></div>
     ```
4. **Integrate effect with accessibility/motion systems.**
   - Example:
     ```js
     if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
       addBloomEffect(scene);
     }
     ```
5. **Test the effect across browsers and devices.**

---

## Testing Patterns

- **Framework:** Unknown (not detected).
- **File Pattern:** Test files are named with the `*.test.*` pattern.
  - Example: `threeScene.test.js`
- **Typical Test Example:**
  ```js
  import { animateOrbit } from 'threeScene.js';

  test('animateOrbit returns expected coordinates', () => {
    expect(animateOrbit(0)).toEqual({ x: 120, y: 0 });
  });
  ```

---

## Commands

| Command                | Purpose                                                        |
|------------------------|----------------------------------------------------------------|
| /new-animated-section  | Add or enhance an interactive/animated UI section              |
| /optimize-animation    | Refine or optimize animation and interaction performance       |
| /add-3d-effect         | Add or enhance 3D visual effects or postprocessing            |
```
