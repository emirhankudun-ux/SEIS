# SEIS AI Policy

## Scope

SEIS içindeki otomasyon, öneri ve içerik akışlarında uygulanır. Kritik işleme öncesi policy şarttır.

## Policy Kuralları

- Her AI çağrısı `intent`, `policyVersion`, `risk`, `rollback` alanlarıyla kayıt altına alınır.
- Policy geçmezse üretim eylemi çağırılmaz.
- Yüksek riskli akışlarda insan onayı zorunludur.

## Denetim

- `npm run check:llm-orchestration-policy`
- İhlal senaryoları için otomatik durdurma + neden analizi + düzeltme izi.

## Veri / Gizlilik

- Gizli anahtar/parola/token prompt içinde taşınmaz.
- Sadece gerekli bağlam kullanılır.

## Teknik Entegrasyon

- Kurumsal kapılar: [governance/enterprise-change-gates.md](governance/enterprise-change-gates.md)
- Dokümantasyon kaynağı: [docs/ai/policy.md](../docs/ai/policy.md)
- Gate check: `npm run check:seis-enterprise-gates:ai`
