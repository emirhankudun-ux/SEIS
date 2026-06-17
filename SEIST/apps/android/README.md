# Android Lane

The Android lane starts with Expo and validates through the Test Android Apps workflow.

## Initial Direction

- create an Expo app shell when implementation begins
- keep shared product logic in `packages/core`
- keep visual primitives in `packages/ui`
- use Android emulator testing before release decisions

## Plugin Stack

- Expo
- Test Android Apps
- GitHub
- SEIS plugin

## First Build Tasks

1. Choose package manager and Expo template.
2. Define app navigation and auth shell.
3. Connect full-stack backend when `apps/fullstack` is ready.
4. Add Android emulator smoke tests.
