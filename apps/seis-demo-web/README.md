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
cd "/Users/emirhankudun/Library/Mobile Documents/com~apple~CloudDocs/Github/SEIS/apps/seis-demo-web"
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

- `contracts/seis-demo-contract.json` aynı dosya, hem web hem native shell tarafından kullanılır.

Deployment:

- Vercel: project publish root olarak klasör seçin veya `vercel --prod` çalıştırın.
- Netlify: build adımı yok. Publish directory `apps/seis-demo-web` olsun, `_redirects` kuralı zaten yüklü.
- Native fallback: `seis-demo-native` iOS/macOS WebView shell, `main` route hedefini bu URL’den okur.
