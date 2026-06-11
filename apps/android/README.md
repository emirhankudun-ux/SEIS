# Android Lane

Android is a platform-core lane, not a website-first lane.

## Active Direction

- Use Android Studio as the primary Android surface.
- Prefer Android-native Java/Kotlin project inspection before broad framework work.
- Keep emulator testing requirement-led; do not download large system images unless a task requires it.
- Keep shared SEIS policy in small contracts that can be reviewed without a full Android SDK.
- Website release work comes after Android and platform gates pass.

## Current Contract

- Source: `polyglot/android/java/SeisAndroidDevelopmentProfile.java`
- Validation: `javac -d /tmp/seis-android-profile polyglot/android/java/SeisAndroidDevelopmentProfile.java`

## Plugin / Tool Stack

- OpenAI Codex
- Claude
- Android Studio
- Test Android Apps when emulator/log/device work is required
- GitHub
- SEIS plugin
