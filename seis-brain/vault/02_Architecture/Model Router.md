# Model Router

## Purpose
Göreve, kapsama, gizlilik moduna ve maliyete göre AI model ve sağlayıcı seçimini yöneten karar yüzeyi.

## Principles
- Provider-neutral tasarım.
- Provider durumu, maliyet ve gizlilik durumu birlikte değerlendirilir.
- Missing Key ile Error farklı kavramlar olarak izlenir.

## States
- Available
- Missing Key
- Disabled
- Rate Limited
- Error

## Routing criteria
- task_type
- capability
- privacy_mode
- local_only_mode
- cost
- speed
- context_size
- tool_support
- fallback

## Guardrails
- Canlı anahtar/yönlendirme iddiası ancak doğrulanmış backend akışında yapılır.
- Demo/default modunda provider çağrısı yerine güvenli fallback ve şeffaf state gösterimi tercih edilir.

## Relations
- [[Provider Registry]]
- [[Prompt Engine]]
- [[SEIS AI Core]]

## Next actions
- Provider state haritası için basit readiness tablosu tamamlanacak.
