# SEIS Demo Deployment Plan (Web + iOS/macOS)

## 1) Website deployment (seis-demo-web)

### Vercel

1. Repository içinde çalışma dizini:
   - repository root'tan `apps/seis-demo-web`
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

Current state: Bu ürün SwiftPM executable prototype kanıtıdır; signed/notarized
app bundle, dedicated iOS target, simulator scheme veya dağıtım kanıtı değildir.
`docs/architecture/SEIS_APPLE_PLATFORM_MAP.md` canonical maturity ve platform
sınırını tanımlar.

### Test build hedefleri

- macOS test build:
  - `swift build -c debug --product SeisAppleNativeShell`
- iOS simulator build bu sürümde unavailable'dır: dedicated iOS app target ve
  doğrulanmış Xcode scheme yoktur. Bu komutlar ancak child implementation Goal
  target/scheme ekleyip CI evidence ürettikten sonra tanımlanmalıdır.

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

Gelecek doğrulama taslağı (şu an çalıştığı iddia edilmez):

1. Child Goal, gerçek app target ve scheme için Xcode build komutunu kaydeder.
2. URL types şablonunu `packages/seis_platform_swift/Sources/SeisAppleNativeShell/Resources/seisdemo-urlscheme-template.plist` ile karşılaştırın.
3. Child Goal, fixture-backed simulator destination ve boot evidence kaydeder.
4. Child Goal, gerçek app bundle üzerinde `simctl openurl` deep-link evidence
   üretir.

### Gelecek runtime doğrulama checklist

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
- `seis-demo-native` için App Store/TestFlight dağıtımı mevcut bir capability
  değildir; ayrı Goal, app target, signing, privacy, test ve rollback evidence
  sonrasında planlanabilir.
