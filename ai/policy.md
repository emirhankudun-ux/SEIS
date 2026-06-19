# SEIS AI Policy ve Denetim Kuralları
# SEIS AI Policy

Bu politika, AI/agent/LLM iş akışlarını güvenli, geri döndürülebilir ve denetlenebilir kılar.

## Kapsam

## Scope
- AI assisted actions, LLM/agent/automation workflows, MCP and plugin integrations.

- LLM çağrıları, agent yürütümleri, MCP/skill otomasyonu, plugin davranışları, repo-otomasyon akışları.

## Policy Kuralları

## Zorunlu AI Aksiyon Alanları

## Policy Enforcement
- `intent`, `risk`, `policyVersion`, `audit`, `rollback`, `owner`, `requiresHumanApproval`, and `scope` must be captured for each AI action.

Her AI eylemi için en az şu alanlar kaydedilir:

- `intent` (amaç): üretimsel işlem mi / öneri mi?
- `risk` (low/medium/high): risk seviyesi ve azaltma planı.
- `policyVersion`: aktif policy sürüm referansı veya hash.
- `audit` : denetim referansı (PR, run log, ADR, script çıktısı)
- `rollback` : geri dönüş adımı + tetikleme koşulu.
- `owner` : karar sahibi.
- `requiresHumanApproval` : `true` / `false`.
- `scope`: modül veya alan (`Dashboard`, `Goals`, `Repos`, `Docs`, `Agents`).

Örnek:

```json
{
  "intent": "release-readiness-check",
  "risk": "medium",
  "policyVersion": "ai/policy.md@2026-06-19",
  "audit": "PR #1234, check:llm-orchestration-policy",
  "rollback": "toggle ai-autonomy lane, restore previous prompt policy",
  "owner": "seis-ops",
  "requiresHumanApproval": true,
  "scope": "Agents"
}
```

## Uygulama Kuralları

## Teknik Entegrasyon
- AI/agent lanes must reference policy versions and audit outputs in the validation package.

- `high` riskli AI eylemi, insan onayı olmadan üretime giremez.
- Gizli/özel kaynaklara erişim veya yeni entegrasyon için gizlilik etki değerlendirmesi olmadan onay verilmez.
- API anahtarı, token, SSH anahtarı, sertifika gibi hassas bilgi prompt içinde taşınamaz.
- Bir eylemde `rollback` alanı dolu değilse AI kapısı geçmez.

## AI Kapı Kontrolü

AI kapısı geçişi için çalıştırılması beklenen komutlar:

- `npm run check:seis-enterprise-gates:ai`
- `npm run check:llm-orchestration-policy`
- İlgili iş alanı için `goals/architecture.md` + `governance/enterprise-change-gates.md` eşleşmesi.

## Kapı Durumu

- `passed`: zorunlu alanlar dolu + denetim izi tamam.
- `waived`: yalnızca acil durumda ve aynı PR’da kapanış planı eklenerek.
- `blocked`: risk, denetim veya rollback eksikliği devam ediyorsa.

## Bağlantılı Dokümanlar

- [governance/quality-gates.md](../governance/quality-gates.md)
- [governance/enterprise-change-gates.md](../governance/enterprise-change-gates.md)
- [goals/architecture.md](../goals/architecture.md)
- [docs/architecture/seis-5-layer-operating-map.md](../docs/architecture/seis-5-layer-operating-map.md)
