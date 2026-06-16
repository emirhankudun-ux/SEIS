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

## Non-Apple Language Boundary

The Android lane should use Android-native and non-Apple polyglot surfaces first: Kotlin, Java, Gradle metadata, XML, C++, Rust, or Go when a real Android product need exists. Do not add JavaScript or Python code for this lane in the current kernel pass.

## Market-readiness Focus

A release candidate must document emulator validation, accessibility, low-motion behavior, privacy boundaries, plugin trust state, support route, and rollback before marketplace or store-facing work begins.
