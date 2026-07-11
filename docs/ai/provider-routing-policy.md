# SEIS Provider Yönlendirme Politikası

## Amaç

Model router'ın görev, gizlilik, maliyet, hız ve provider sağlığına göre nasıl
karar vereceğini tanımlar. Bu politika live provider erişimi veya kimlik
doğrulama kanıtı değildir.

İlgili kaynaklar:

- `docs/ai/model-router.md`
- `content/development/seis-ai-core-provider-registry.json`
- `content/development/seis-frontier-training-launch-plan.json`

## Zorunlu Provider Durumları

| Durum        | Anlam                            | Route uygunluğu                  |
| ------------ | -------------------------------- | -------------------------------- |
| Available    | Sağlık ve yetki doğrulanmış      | Politika izin verirse aday       |
| Missing Key  | Anahtar yok                      | Uygun değil; Error değildir      |
| Disabled     | Kullanıcı veya yönetici kapatmış | Uygun değil                      |
| Rate Limited | Geçici kapasite sınırı           | Bekle veya görünür fallback iste |
| Error        | Doğrulanmış çalışma hatası       | Uygun değil                      |

`Missing Key` hiçbir zaman `Error` olarak raporlanmaz.

## Gizlilik Modları

| Mod                | Dış provider     | İzin verilen veri                                  |
| ------------------ | ---------------- | -------------------------------------------------- |
| local-only         | Yasak            | Yerel, onaylı ve minimum gerekli bağlam            |
| private-repository | Varsayılan yasak | Açık dosya seçimi ve redaksiyon sonrası ayrı onay  |
| provider-routed    | Politika ile     | Public veya kullanıcı tarafından onaylı veri       |
| public-research    | İzinli olabilir  | Yalnız kamuya açık, lisanslı ve izlenebilir kaynak |

## Karar Sırası

Router aşağıdaki sırayı değiştiremez:

1. Veri sınıfını ve privacy mode'u belirle.
2. Local-only ve provider yasaklarını uygula.
3. Gerekli capability ve tool desteğini filtrele.
4. Provider durumunu doğrula.
5. Model context, kalite, hız ve maliyet bütçesini karşılaştır.
6. Kullanıcının model/provider seçimini uygula.
7. Seçilen gerçek provider ve model kimliğini görünür göster.
8. Kararı sır içermeyen denetim kaydına yaz.

Gizlilik veya yetki kapısı başarısızsa maliyet/kalite karşılaştırmasına geçilmez.

## Fallback Kuralları

- Sessiz model veya provider değişimi yasaktır.
- `local-only` hiçbir koşulda cloud provider'a fallback yapmaz.
- Fallback öncesinde neden, hedef provider/model ve veri etkisi gösterilir.
- Kullanıcı reddederse görev Local Demo veya disabled durumunda kalır.
- Rate limit, gizlilik kuralını gevşetmez.
- Provider hatası başka bir provider'a veri gönderme onayı sayılmaz.

## Kimlik Bilgisi Sınırı

- Cloud anahtarları yalnız backend environment/secret store içinde bulunabilir.
- Browser bundle, localStorage, IndexedDB, URL, telemetry ve prompt içine sır
  konamaz.
- Router anahtar değerini loglamaz veya MCP resource olarak sunmaz.
- Kimlik doğrulama eksikliği yalnız ilgili provider'ı devre dışı bırakır.

## Görev Politikası

| Görev                | Varsayılan tercih                   | Ek kapı                    |
| -------------------- | ----------------------------------- | -------------------------- |
| Repo statüsü ve plan | Local Demo / salt-okunur Codex lane | Sır redaksiyonu            |
| Özel kod inceleme    | local-only                          | Açık dosya kapsamı         |
| Kamu araştırması     | public-research                     | Kaynak ve lisans kaydı     |
| Tasarım üretimi      | Yerel veya onaylı provider          | Asset provenance           |
| Güvenlik inceleme    | local-only                          | Ham sır değeri göstermeme  |
| Eğitim/fine-tune     | Route dışı                          | Ayrı compute ve veri onayı |

## Denetim Kaydı

Her route kararı şu alanları taşımalıdır:

- görev sınıfı ve privacy mode,
- değerlendirilen provider durumları,
- seçilen provider/model veya deny nedeni,
- fallback olup olmadığı,
- veri sınıfı ve redaksiyon sonucu,
- maliyet sınırı,
- insan onayı kimliği (varsa),
- timestamp ve politika sürümü.

Prompt, dosya gövdesi, token veya anahtar değeri denetim kaydına yazılmaz.

## Terfi Koşulu

Live routing; server-only adapter, no-key startup, missing-key, rate-limit,
redaksiyon, local-only no-fallback, maliyet-stop ve provider kimliği testleri
olmadan etkinleştirilemez. Frontier model route'ları ayrıca
`content/development/seis-frontier-training-launch-plan.json` içinde `deny`
durumundadır.
