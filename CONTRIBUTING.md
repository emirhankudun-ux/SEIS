# Contributing to SEIS

Katkılar değerli, ama SEIS hızlı büyürken bile düzenli kalmalı.

## Development Model

- `main` tek uzun ömürlü merkez branch'tir.
- Yeni iş için kısa ömürlü branch açılır, doğrulanır, PR ile `main` içine alınır.
- Branch temizliği otomasyonla yapılmaz; maintainer açıkça onaylamalıdır.
- Büyük refactor, yeni runtime, SDK kurulumu, deployment ve branch silme işlemleri önce tartışılır.

## Current Implementation Focus

- Website final release surface olarak kalır.
- Öncelik: SEIS AI, AI Agent, MCP, Skills, Plugins, LLM, Apple-native, Windows-polyglot, Android, security, data, DevOps, SRE, governance.
- Apple işleri: Swift, SwiftUI, Playground, Objective-C, AppleScript.
- Windows işleri: Apple-only diller hariç geniş polyglot.
- Android işleri: Android Studio, Java/Kotlin, emulator doğrulaması gerektiğinde.
- JavaScript yeni özellik dili olarak büyütülmez.
- Python uygulama kodu, maintainer tekrar izin verene kadar eklenmez.

## Pull Request Checklist

PR açıklamasında şunları yaz:

- Amaç
- Değişen dosyalar
- Platform etkisi
- Güvenlik etkisi
- Doğrulama komutları
- Rollback notu

## Quality Bar

Her anlamlı değişiklik şu başlıklara göre düşünülmeli:

- Maintainability
- Security
- Accessibility when UI exists
- Performance
- Testability
- Platform boundary
- Dependency restraint
- Release readiness

## Local Checks

Gerektiği kadarını çalıştır:

```bash
swift test --package-path packages/seis_platform_swift
javac -d /tmp/seis-android-profile polyglot/android/java/SeisAndroidDevelopmentProfile.java polyglot/android/java/SeisAndroidDevelopmentProfileTest.java
java -cp /tmp/seis-android-profile seis.android.SeisAndroidDevelopmentProfileTest
xcrun clang++ -std=c++20 polyglot/windows/native/seis_windows_toolchain_profile.cpp polyglot/windows/native/seis_windows_toolchain_profile_test.cpp -o /tmp/seis-windows-toolchain-profile-test
/tmp/seis-windows-toolchain-profile-test
cd packages/seis_kernel_go && go test ./...
npm run check:seis-platform-priority-atlas
```

## Security

API key, token, `.env`, personal data, private archive, local machine path dump,
or credential material must not be committed.

Security issues should follow [`SECURITY.md`](./SECURITY.md).

## Conduct

All contributors must follow [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).
