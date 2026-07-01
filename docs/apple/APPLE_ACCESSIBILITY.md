# Apple Accessibility

Accessibility is part of Apple-first quality, not a final polish pass.

## Requirements

- Support readable type and avoid tiny fixed labels.
- Preserve sufficient contrast on dark surfaces.
- Provide VoiceOver-friendly labels for icon-only controls.
- Keep keyboard navigation and focus order predictable.
- Use visible focus states.
- Respect reduced motion.
- Do not depend on color alone for critical state.
- Keep touch targets comfortable on iPadOS and iOS.

## Command Center Checks

Every Apple-native Command Center surface should expose:

- current status text
- no-key/demo badge text
- public/private safety state
- next action labels
- warning descriptions
- verification command descriptions

## Motion

Motion should be short, restrained, and structural. Reduced motion must remove
nonessential transitions and avoid persistent animated surfaces.
