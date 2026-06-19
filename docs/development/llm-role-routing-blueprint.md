# SEIS LLM Rol Tabanlı Yönlendirme Blueprint (Tasarım / Mühendis / Software)

Amaç: **Bir talebi yanlış kanala gitirmeden**, önce rolü ve iş tipini anlamak, sonra SEIS politikası gereği tek remote karar katmanı olarak `seis-agent` altında local yardımcıları çağırmaktır.

## 1) Rol Tarama Kuralı

Sistem her istekte önce üç role bakar:

- `designer` (Tasarım odaklı): `ux`, `ui`, `copy`, `metin`, `brand`, `mikrocopy`, `renk`, `tipografi`
- `engineer` (Mühendislik odaklı): `repo`, `patch`, `refactor`, `bug`, `build`, `deploy`, `CI`, `debug`
- `software` (Software/Ürün odaklı): `mimari`, `sistem`, `product`, `plan`, `requirements`, `scalability`, `performans`

Eşleşme yoksa veya genel karar/egemenlik isteği varsa yönlendirme:
- `seis-agent` (remote orchestration).

## 2) Lane Öncelik Matrisi

| Rol | Birincil Lane | Yedek Lane | Neden |
| --- | --- | --- | --- |
| `designer` | `claude` | `gemini`, `openai` | Tasarım metni ve anlatı odaklı |
| `engineer` | `aider` | `interpreter`, `ollama` | Kod patch, diff, refactor odaklı |
| `software` | `openai` | `gemini`, `seis-agent` | Ürün/strateji/özetleme odaklı |
| Belirsiz / genel | `seis-agent` | `openai`, `aider`, `claude` | Yönetim ve koordinasyon gerektirirse remote |

Ek özel yol:
- `antigravity ide` anahtar kelimeleri için `antigravity-ide`
- `antigravity 2.0` veya `antigravity app` anahtar kelimeleri için `antigravity`
- `cursor` anahtar kelimeleri için `cursor`
- `xcode`, `swiftui`, `ios simulator` veya `apple signing` anahtar kelimeleri için `xcode`
- `translation` anahtar kelimeleri için `kimi`
- `offline/local` anahtar kelimeleri için `ollama`
- `policy/governance/security` anahtar kelimeleri için direkt `seis-agent`
- Rol hedefli kısa komutlar da desteklenir: `npm run ai -- designer|engineer|software "<iş açıklaması>"`.

## 3) Uygulama Akışı

1. İstek metni normalize edilir (lowercase + anahtar eşleme)
2. Rol sinyalleri puanlanır ve `roleProfile` çıkarılır
3. Lane adayları hesaplanır
4. Remote orkestrasyon gerekiyorsa `seis-agent` zorunlu kalır
5. Plan objesi şu alanlarla döner:
   - `suggestedLane`
   - `laneType`
   - `role`, `roleConfidence`, `roleSignals`
   - `routerRationale`, `suggestedAlternatives`
   - `router` (`primary`, `requiresRemote`, `fallback`)

## 4) Komut / MCP Kullanım

### CLI (kullanıcı tarafı)

```bash
npm run ai -- auto "designer: yeni onboarding ekranı için mikrocopy düzenle"
npm run ai -- auto "engineer: bu bug için patch hazırla"
npm run ai -- auto "software: release stratejisi ve mimari özetini çıkar"
```

### MCP (yardımcı katman)

- `seis_llm_plan_request`: Rol bağlamı olmadan plan çıkarır.
- `seis_llm_role_plan_request`: İstenirse `preferredRole` vererek rol önyargılı plan üretir.

Örnek:

```bash
seis_llm_role_plan_request
{
  "request": "designer: ana sayfa hero alanı için metinleri optimize et",
  "preferredRole": "designer"
}
```

## 5) Güvenlik ve Politika Notu

- `seis-agent` yalnızca remote karar katmanı olarak kalır.
- Local yardımcılar (`openai`, `claude`, `gemini`, `kimi`, `ollama`, `aider`, `interpreter`) doğrudan **yardımcı** rolünde çalışır.
- Masaüstü yüzeyleri (`antigravity`, `antigravity-ide`, `cursor`, `xcode`) yalnızca manuel/istek bazlı çalışma yüzeyidir; repo gerçeği Git ve SEIS dokümanlarıdır.
- İnternet yoksa ve online helper kullanılamıyorsa fallback sırası: `ollama` → `seis-agent`.

## 6) Kısa Test Vaka Seti (iç doğrulama)

1. `"designer: ui copy'yi sadeleştir"` → hedef: `claude`
2. `"engineer: build pipeline bug'ını patch et"` → hedef: `aider`
3. `"software: migration road map çıkar"` → hedef: `openai`
4. `"translate this interface to Turkish"` → hedef: `kimi`
5. `"release governance check"` → hedef: `seis-agent`
