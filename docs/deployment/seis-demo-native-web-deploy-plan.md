# SEIS Demo Deployment Plan (Web + iOS/macOS)

## 1) Website deployment (seis-demo-web)

### Vercel

1. Repository içinde çalışma dizini:
   - `apps/seis-demo-web`
2. Deploy ayarları:
   - `Framework` seçimi: **Other / Static**
   - `Output Directory`: `.`
   - `Install Command`: boş
   - `Build Command`: boş (or static files)
3. `vercel.json` zaten SPA fallback sağlar (`/(.*) -> /index.html`).
4. `/_redirects` ve manifest/web contract deploy paketinde bulunmalı.
5. Doğrulama:
   - `https://<site>/`
   - `https://<site>/demo`
   - `https://<site>/results/demo-home`
   - `https://<site>/demo/agent-orchestration`

### Netlify

1. Build command bırakın boş, publish directory `apps/seis-demo-web`.
2. `netlify.toml` içinde 200 fallback redirect zaten var (`/* -> /index.html`).
3. Doğrulama URLleri Vercel ile aynı.

## 2) Native demo shell deployment/tests (seis-demo-native)

Native shell, `packages/seis_platform_swift` paketinde `SeisAppleNativeShell` ürününde yer alır.

### Test build hedefleri

- macOS test build:
  - `swift build -c debug --product SeisAppleNativeShell`
- iOS simulasyon test build:
  - Xcode’da paketi açıp `SeisAppleNativeShell` ürününü iOS destination’da `Run` edin
  - veya `xcodebuild -scheme SeisAppleNativeShell -destination 'platform=iOS Simulator,name=iPhone 16'`

### Deep link entegrasyonu (seisdemo://)

- Uygulama içinde `seisdemo://` URL’lerini işlemek için route parser ve `onOpenURL`/deep-link boot argümanı zaten aktif.
- iOS/macOS ürününde scheme kaydı için Info.plist’e aşağıdaki URL type eklenmeli:
  - `CFBundleURLTypes` içinde `CFBundleURLName = "seis.demo"` ve `CFBundleURLSchemes = ["seisdemo"]`
  - Bu kayıt, Xcode'da iOS/macOS hedef app bundle’ına uygulanmalı; SwiftPM package build’i tek başına bu alanı otomatik üretmez.
- Launch argümanı ile yerel test:
  - `swift run --package-path packages/seis_platform_swift --product SeisAppleNativeShell -- --open-demo-url seisdemo://demo/agent-orchestration`
- Simulator’da gerçek deep link test:
  - `xcrun simctl openurl booted "seisdemo://demo/agent-orchestration"`
  - `xcrun simctl openurl booted "seisdemo://results/demo-home"`

Tek komutluk doğrulama (seisdemo şeması + gerçek cihaz/sim openurl):

1. Xcode build:
   - `xcodebuild -scheme SeisAppleNativeShell -destination 'platform=iOS Simulator,name=iPhone 16' -configuration Debug install`
2. URL types şablonunu `packages/seis_platform_swift/Sources/SeisAppleNativeShell/Resources/seisdemo-urlscheme-template.plist` ile karşılaştırın.
3. Simülatörü hazırla:
   - `xcrun simctl boot <iPhone 16 UDID>`
4. Deep link:
   - `xcrun simctl openurl booted "seisdemo://demo/agent-orchestration"`
   - `xcrun simctl openurl booted "seisdemo://results/demo-home"`

### Runtime doğrulama checklist

- App içinde route tabanlı ekran:
  - `/demo`
  - `/demo/:scenario`
  - `/results/:runId`
- Deep link: `seisdemo://demo/agent-orchestration`, `seisdemo://results/demo-home`
- Fallback:
  - web yüklenemez ise native fallback ekranında route kartları görünür
  - yeniden deneme butonu çalışır
- Ortak contract:
  - `packages/seis_platform_swift/Sources/SeisAppleNativeShell/Resources/seis-demo-contract.json`
  - `apps/seis-demo-web/contracts/seis-demo-contract.json`

## 3) Governance and release notes

- Ana branch `main` sabitlenmiş kalır.
- `docs/deployment`, web deploy URL ve netlify/vercel deployment ID’leri release notuna eklenir.
- `seis-demo-native` için App Store dağıtımı planı ayrı bir adımda, testflight ile ilerletilmeli.
