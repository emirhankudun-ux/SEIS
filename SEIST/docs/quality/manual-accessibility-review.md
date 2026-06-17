# Manual Accessibility Review

This checklist supports the long SEIS development process. It complements static checks by reviewing the human experience: focus, motion comfort, language direction, cognitive load, and responsive clarity.

## Review Areas

| Area | What To Confirm |
| --- | --- |
| Keyboard and focus | Skip link reaches main content; navigation, language switcher, motion toggle, filters, and links are keyboard reachable; focus states remain visible. |
| Motion comfort | `prefers-reduced-motion` disables non-essential animation; low-motion mode is visible and persistent; canvas motion never blocks comprehension. |
| Language and direction | Locale keys are complete; Arabic switches the document to `rtl`; static roadmap text is reviewed before production localization. |
| Cognitive load | Sections remain scannable; roadmap and development content do not overload the first viewport; cards use concise proof-oriented copy. |
| Responsive structure | Cards collapse cleanly on small screens; touch targets remain at least 44px; text does not overlap controls or media. |

## Release Blockers

Do not release when any of these are present:

- Missing visible focus state.
- Unreachable interactive control.
- Motion that ignores reduced-motion preference.
- Text overlap on mobile.
- Language direction mismatch.

## Lightweight Review Rhythm

1. Run syntax and foundation checks.
2. Open the static shell locally.
3. Test keyboard navigation from the top of the page.
4. Toggle low-motion mode.
5. Check mobile-width layout.
6. Switch to Arabic and confirm right-to-left structure.
7. Record blockers before server upload or framework migration.

## Evidence Template

Each manual review should record:

- `reviewDate`
- `reviewer`
- `viewportCoverage`: mobile, tablet, desktop
- `keyboardResult`
- `motionResult`
- `languageDirectionResult`
- `blockers`
- `releaseDecision`: blocked, approved-for-local-demo, or approved-for-server-upload

Use `blocked` whenever a release blocker is present. Use `approved-for-server-upload` only after viewport coverage includes mobile, tablet, and desktop plus keyboard, motion, and language-direction review notes.
