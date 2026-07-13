# Proposed Web And Mobile Architecture

## Scope Note

This document governs public web experiences and optional wrappers for those
experiences. It does not define the SEIS native product center and does not
replace the Apple-first macOS, iPadOS, and iOS roles in
`docs/architecture/SEIS_APPLE_PLATFORM_MAP.md`. A PWA or Capacitor wrapper is
not evidence of a SEIS native application.

## Recommended Stack

Use a phased stack, not a dependency-heavy jump.

| Layer | Recommendation | Reason |
| --- | --- | --- |
| Initial foundation | Static HTML/CSS/JS shell | fastest review, no install, no main-branch risk |
| Production web | Next.js or Astro with TypeScript | SEO, content routing, image optimization, maintainable components |
| Mobile path | Responsive PWA first, then Capacitor only if native wrappers are needed | avoids premature native complexity |
| 3D layer | Progressive Three.js island or React Three Fiber island | isolate WebGL from core content and mobile fallback |
| Content | typed JSON/MDX content registry | keeps portfolio/case studies portable |
| Styling | CSS tokens plus component-scoped CSS | stable, framework-portable design system |
| Observability | lightweight Web Vitals and error boundary reporting | avoids dashboard overload |

## Clean Folder Structure

```text
apps/
  web/
    index.html
    src/
      scripts/
      styles/
packages/
  design-tokens/
  asset-registry/
content/
  case-studies/
  artworks/
docs/
  architecture/
  decisions/
  quality/
  reports/
  plans/
archive/
```

## Migration Rule

Legacy source files are references, not implementation targets. Migrate by intent:

1. Read old behavior.
2. Extract reusable content and asset metadata.
3. Rebuild clean components.
4. Add tests/checks.
5. Commit in small reversible slices.

## First Production Component Map

| Experience Area | Component Direction |
| --- | --- |
| Cinematic hero | `HeroScene`, `HeroCopy`, `HeroActions`, `MotionPreferenceControl` |
| Work/case studies | `CaseStudyGrid`, `CaseStudyCard`, `CaseStudyFilters` |
| Drawing archive | `ArtworkGallery`, `ArtworkLightbox`, `ArtworkMetadata` |
| Contact | `ContactForm`, `BriefQualitySignal`, `AvailabilitySignal` |
| Motion | `MotionProvider`, `Reveal`, `DepthCard`, `ParallaxLayer` |
| Quality | `SeoMetadata`, `StructuredData`, `SkipLink`, `FocusRing` |

## Branch Strategy

When the actual Git repo is available:

```bash
git checkout main
git pull --ff-only
git checkout -b chore/seis-foundation-audit
```

Keep the first commit documentation-heavy and low risk. Add runtime features only after the branch is visible and reviewable.
