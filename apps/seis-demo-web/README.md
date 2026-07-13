# SEIS Demo Web (seis-demo-web)

Route map:

- `/` → Home
- `/demo` → Demo launcher
- `/demo/:scenario` → Scenario detail + run action
- `/results/:runId` → Result page and timeline

Files:

- `index.html` shell and sections
- `styles.css` responsive contract-first layout
- `script.js` route engine + simulator + event telemetry
- `contracts/seis-demo-contract.json` shared analytics/content contract
- `manifest.webmanifest`, `icon.svg`, `service-worker.js`
- `vercel.json`, `netlify.toml`, `_redirects` for route fallback

Local run:

```bash
cd apps/seis-demo-web
python3 -m http.server 4173
```

Open:

- `http://127.0.0.1:4173/`
- Deep route example: `http://127.0.0.1:4173/demo/agent-orchestration`
- Fallback example: `http://127.0.0.1:4173/results/demo-home`

Deep link compatibility:

- `/demo`
- `/demo/:scenario`
- `/results/:runId`

Shared contract notes:

- `contracts/seis-demo-contract.json` ve native shell resource kopyası şu an
  byte-identical olarak doğrulanır.
- Bu iki kopyanın canonical owner ve sync direction kararı henüz verilmemiştir;
  `docs/architecture/SEIS_APPLE_PLATFORM_MAP.md` bu açığı izler.

Deployment:

- Vercel: project publish root olarak klasör seçin veya `vercel --prod` çalıştırın.
- Netlify: build adımı yok. Publish directory `apps/seis-demo-web` olsun, `_redirects` kuralı zaten yüklü.
- Native boundary: SwiftPM içinde bir `SeisAppleNativeShell` executable ürünü
  vardır. Ayrı bir iOS/macOS WebView app target kanıtı yoktur; native fallback,
  imzalama veya dağıtım hazır kabul edilmez.
