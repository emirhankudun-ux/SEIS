# SEIS AI-4 Conversation Nexus

## Amaç ve durum

Conversation Nexus, SEIS konuşma oturumlarını yalnızca yerel ve özel bir
çalışma zamanı sınırında saklar. Amaç; kullanıcının açıkça başlattığı bir
oturumu sınırlı, doğrulanabilir, redakte edilmiş ve kullanıcı tarafından
yönetilen bir kayıt olarak tutmaktır.

Güncel durum:

| Yüzey                                                | Durum                        | Sınır                                                             |
| ---------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------- |
| Yerel session runtime                                | Gerçek / açık opt-in         | Repo dışındaki OS-private state kökünde çalışır.                  |
| Yerel durum, arama, export ve delete CLI kontrolleri | Gerçek / kullanıcı kontrollü | Ağ veya provider çağrısı yapmaz.                                  |
| ChatGPT, Codex, Claude ve Qwen importları            | Planlı / onay kapılı         | Import runtime'ı etkin değildir.                                  |
| MCP status ve search                                 | Kayıtlı / varsayılan kapalı  | Yerel env opt-in ister; yalnız metadata döndürür.                 |
| MCP write araçları                                   | Yasak                        | Import, export, delete, upload, sync ve publication aracı yoktur. |
| Provider upload                                      | Yasak                        | `providerUploadAllowed=false`.                                    |
| GitHub publication                                   | Yasak                        | `githubPublicationAllowed=false`.                                 |

Bu sözleşme bütün harici konuşmaların içe aktarıldığını iddia etmez. Yerel
makinedeki özel arşivleri otomatik keşfetmez ve ChatGPT, Codex, Claude veya
Qwen hesaplarına bağlanmaz.

Kaynaklar:

- Session schema:
  `packages/shared-types/schemas/seis-conversation-session.schema.json`
- Encrypted envelope schema:
  `packages/shared-types/schemas/seis-conversation-envelope.schema.json`
- Makine-okunur contract:
  `content/development/seis-conversation-nexus.json`
- Yerel runtime:
  `packages/seis-ai/src/memory/conversation-store.mjs`

## Depolama sınırı

Yeni session kayıtları repository dışında bir OS-private state köküne yazılır:

- macOS: `~/Library/Application Support/SEIS/private/conversation-nexus-v1`
- Linux: `~/.local/state/seis/private/conversation-nexus-v1`
- Windows: `~/AppData/Local/SEIS/private/conversation-nexus-v1`

Runtime repository içindeki state köklerini ve bilinen iCloud, Dropbox,
OneDrive, Google Drive ve Syncthing yollarını fail-closed reddeder. Eski veya
yanlışlıkla oluşturulmuş private verilerin Git'e girmemesi için `.gitignore`
şu legacy/defense-in-depth yüzeyleri yine dışlar:

- `.seis/conversations/`
- `.seis/exports/`
- `.seis/sessions/`

Session veya export içeriği hiçbir durumda `git add -f` ile eklenmemelidir.

Yerel runtime hedefleri:

- dizinler: owner-only `0700`
- session ve export dosyaları: owner-only `0600`
- store ve kayıt hedeflerinde sembolik bağlantı: reddedilir
- bir session dosyası: en fazla 8 MiB
- store: en fazla 512 session
- session başına: en fazla 2048 mesaj
- tek string: en fazla 256 KiB UTF-8 veri
- provider mesajı başına: en fazla 256 içerik bloğu

`0700` ve `0600`, POSIX owner-only hedefleridir. Gerçek koruma, işletim sistemi
ve dosya sistemi ACL semantiğine bağlıdır; bu kipler her platform için tek
başına evrensel bir gizlilik garantisi değildir.

At-rest encryption artık local-keyfile AEAD katmanıyla uygulanır. Session ve
export dosyaları plaintext kayıt olarak değil,
`seis-encrypted-conversation-envelope` record type'ına sahip AES-256-GCM
envelope olarak yazılır. Key dosyası OS-private state kökünde
`conversation-vault.key` adıyla oluşturulur ve owner-only `0600` hedefiyle
korunur.

Bu, Keychain/DPAPI/libsecret veya hardware-backed key storage değildir. Aynı
makinedeki state root ve key file birlikte korunmalıdır. Key file kaybolursa
mevcut conversation envelope'ları çözülemez. Persistence varsayılan olarak
kapalıdır ve yalnız `--session` açıkça seçildiğinde çalışır.

## Açık yerel rıza

Oturum yakalama kendiliğinden başlamaz. Güncel runtime kaydı
`consent.capture="explicit-cli-session"` değerini zorunlu tutar. Bu değer,
çağıranın kullanıcının açıkça seçtiği yerel oturum akışından geldiğini belirtir.
Arka planda home dizini taraması, hesap keşfi veya otomatik arşiv toplama
yasaktır.

Planlı bir harici import ancak ayrı kullanıcı seçimi ve onayından sonra
`explicit-approved-local-import` olarak kaydedilebilir. Schema bu değeri
gelecekteki kapılı adaptörler için ayırır; bu yapısal rezervasyon import
uygulamasının bugün mevcut olduğu anlamına gelmez.

Rıza alanı hukuki veya bağımsız bir imza kanıtı değildir. Runtime çağırıcısı,
kullanıcı talebi olmadan bu değeri üretemez. Store otomatik provider upload veya
GitHub publication yapmaz; ikisi de kayıtta `false` kalır. Mevcut history'nin
Anthropic'e yeniden gönderilmesi ayrıca her çağrıda
`--approve-session-upload <exact-session-name>` onayı ister.

## Strict session kaydı

Schema, JSON Schema Draft 2020-12 kullanır. Yönetim nesnelerinin tamamında
`additionalProperties: false` uygulanır. Kalıcı `content` yalnız redakte edilmiş
görünür metindir. Tool input/result, thinking, signature, attachment ve diğer
yapılandırılmış provider blokları projection sırasında atılır.

Temel kayıt alanları:

| Alan                      | Kural                                                                               |
| ------------------------- | ----------------------------------------------------------------------------------- |
| `id`                      | Normalize session adından türetilen sabit `conversation:seis-agent-...:v1` kimliği. |
| `sessionName`             | 1-64 karakterlik yerel ve path-safe ad.                                             |
| `status` / `privacyMode`  | Yalnızca `local-private` / `local-only`.                                            |
| `consent`                 | Açık capture/import rızası; upload, publication ve external sync daima `false`.     |
| `provenance`              | Entity, activity, agent ve kaynak sınıfı metadata'sı.                               |
| `provider`                | Kaynak provider/model metadata'sı; çağrı veya upload yetkisi değildir.              |
| `retention`               | Kullanıcı kontrollü expiry, export ve delete sınırı.                                |
| `redaction`               | Politika kimliği, uygulanma durumu ve yalnızca replacement sayısı.                  |
| `messages`                | En fazla 2048 `user` veya `assistant` mesajı.                                       |
| `createdAt` / `updatedAt` | Milisaniyeli canonical UTC timestamp.                                               |
| `recordHash`              | Canonical session gövdesinin SHA-256 özeti.                                         |

Her mesaj şu alanları taşır:

- sıfırdan başlayan `sequence`
- yalnızca `user` veya `assistant` rolü
- yalnız görünür ve redakte edilmiş string `content`
- `sequence`, `role` ve `content` üzerinden hesaplanan `contentHash`

Runtime, schema kontrolüne ek olarak şunları fail-closed doğrular:

- `messageCount` ile array uzunluğunun eşitliği
- message sequence değerlerinin sıralı ve kesintisiz olması
- her `contentHash` değerinin yeniden hesaplanan özetle eşleşmesi
- `recordHash` değerinin `recordHash` alanı çıkarılmış canonical kayıtla
  eşleşmesi

Hash'ler bütünlük kontrolüdür. Kullanıcı kimliği, provider attestation'ı,
değişmez arşiv veya yayın onayı sağlamaz.

## Provenance

Provenance alanları [W3C PROV-O](https://www.w3.org/TR/prov-o/) başlangıç
sözlüğüne hizalanır:

- `entityId`: yerel konuşma kaydı için `prov:Entity`
- `activityId`: explicit capture veya onay kapılı import için `prov:Activity`
- `agentId`: sorumlu provider profili veya software agent için `prov:Agent`
- `sourceType`: yerel kaynak sınıflandırması
- `sourceSessionName`: raw özel path veya hesap kimliği değil, normalize yerel
  alias

Bu eşleme JSON metadata sözlüğüdür. RDF serialization veya tam PROV-O uyumluluk
iddiası değildir. External import açılırsa her kayıt kaynak provider/model
metadata'sını, seçilen export kaynağını ve import activity kimliğini korumalı;
raw özel path'leri repo sözleşmesine yazmamalıdır.

## Veri minimizasyonu ve redaction

Tasarım, [NIST Privacy Framework 1.0](https://www.nist.gov/system/files/documents/2020/01/16/NIST%20Privacy%20Framework_V1.0.pdf)
Data Processing Management ve Disassociated Processing sonuçlarını referans
alır:

- `CT.DM-P1`: kullanıcı kontrollü review erişimi
- `CT.DM-P4` ve `CT.DM-P5`: delete ve politika tabanlı imha
- `CT.DM-P8`: audit/status çıktılarında veri minimizasyonu
- `CT.DP-P1`: observability ve linkability'yi azaltan yerel işleme
- `CT.DP-P4`: seçici collection ve disclosure

Bu hizalama NIST sertifikası veya mevzuat uyumluluğu iddiası değildir.

Projection ve redaction diske yazmadan önce çalışır. Önce yalnız görünür `text`
blokları seçilir; tool input/result, thinking, signature, attachment ve diğer
yapılandırılmış payload'lar atılır. Bilinen token/JWT/private-key/credential-URI
örüntüleri ile generic `key=value` ve header-tuple credential biçimleri
`[REDACTED_SECRET]` ile değiştirilir. Kayda yalnızca şu özet girer:

- `applied`
- `replacementCount`
- `policy="seis-conversation-redaction-v1"`

Redaction savunma katmanıdır, yayın güvenliği garantisi değildir. Serbest biçimli
özel konuşma, kişisel veri veya ticari sır zaten gereksizse toplanmamalıdır.
API key, token, cookie, password, private key, service-account secret veya raw
provider hata gövdesi session'a konmamalıdır. Hiçbir özel mesaj gövdesi ya da
API key repo içindeki schema, contract veya bu dokümana eklenmez.

## Node.js güvenli yazma akışı

Runtime, [Node.js `node:fs` API](https://nodejs.org/api/fs.html) ile şu sırayı
uygular:

1. Hedefle aynı dizinde benzersiz geçici dosyayı `openSync(..., "wx", 0o600)`
   ile oluşturur.
2. JSON gövdesinin tamamını yazar.
3. Açık descriptor üzerinde `fsyncSync` çağırır ve descriptor'ı kapatır.
4. Geçici dosyayı hedefe `renameSync` ile taşır.
5. Son hedefe `chmodSync(..., 0o600)` uygular.
6. POSIX üzerinde parent directory'yi `fsync` eder.
7. Hata halinde kendi geçici dosyasını temizler.

Aynı kayıt için ayrıca `wx` ile exclusive lock dosyası alınır. Başka bir yazar
lock'u tutuyorsa runtime onu silmez ve yazmayı reddeder.

Bu aynı dizinde temporary-write-then-rename desenidir. Cross-filesystem rename,
her ağ dosya sistemi veya bütün crash senaryoları için genel atomicity/durability
garantisi verilmez. Windows directory-fsync, distributed lock, OS ACL doğrulama
ve bütün crash senaryoları için tam durability iddiası yoktur.

## Retention, export ve delete

Retention kullanıcı kontrollüdür:

- `expiresAt` kullanıcı tarafından canonical UTC timestamp veya `null` seçilir.
- `automaticDeletion=false`; expiry status içinde raporlanır ve süresi dolan
  kayıt read/search/resume/export yüzeylerinde reddedilir.
- Mevcut kayıt güncellenirken önceki expiry açıkça değiştirilmedikçe korunur.
- Süresi dolan kaydın silinmesi kullanıcının explicit delete işlemidir.
- Delete, yanlış hedefi azaltmak için session adının birebir confirmation olarak
  tekrar verilmesini ister.
- Confirmed delete session dosyasını, eşleşen OS-private export/temp kopyalarını
  ve seçili legacy dosyayı siler; provider veya backup kopyasını silemez.
- Export OS-private state kökündeki `exports` dizisinde yeni owner-only JSON
  üretir; JSON gövdesi encrypted envelope'tur ve session adının birebir
  confirmation olarak tekrar verilmesini ister.
- Export, provider upload veya GitHub publication izni vermez.

Yerel kontroller:

```bash
npm run seis:conversations -- status
npm run seis:conversations -- search --query "yerel arama"
npm run seis:conversations -- export --session <name> --confirm <name>
npm run seis:conversations -- delete --session <name> --confirm <name>
npm run seis:conversations -- migrate --session <name>
node packages/seis-ai/bin/seis-agent.mjs --session <name> \
  --approve-session-upload <name> "devam görevi"
```

Legacy migration explicit'tir ve kaynak legacy dosyasını otomatik silmez.
Paylaşılan bir makinede status/search dahil herhangi bir private store erişimi
yalnızca session sahibinin bilgisi ve onayıyla yapılmalıdır.

## Harici import sınırı

Şu adaptörler yalnızca planlı ve approval-gated durumdadır:

- ChatGPT export import
- Codex session import
- Claude export import
- Qwen export import

Hiçbiri runtime'da etkin değildir. Gelecekteki bir import en az şu kapılardan
geçmelidir:

1. Kullanıcı kaynak export'u yerel olarak kendisi seçer.
2. Dry-run yalnız metadata, boyut, kaynak türü ve risk özeti üretir.
3. API key/private key/token örüntüleri ve private path'ler redakte edilir.
4. W3C PROV hizalı entity/activity/agent metadata'sı oluşturulur.
5. Kullanıcı local import'u ayrıca onaylar.
6. Çıktı yalnız repo ve bilinen sync kökleri dışındaki OS-private state kökünde
   kalır.
7. Provider upload ve GitHub publication yine `false` kalır.

Otomatik hesap keşfi, provider hesabından export indirme, home dizini tarama,
sessiz toplu import ve “tüm sohbetler içe aktarıldı” iddiası yasaktır.

## MCP salt okunur sınırı

MCP yüzeyi yerel stdio sunucusuna iki read-only araç olarak kayıtlıdır; ikisi de
varsayılan kapalıdır ve yalnız
`SEIS_CONVERSATION_MCP_METADATA=1` ile açık yerel opt-in sonrasında çalışır.
Bu araçlar Anthropic/cloud-agent tool listesinde bulunmaz:

| Tool                               | Çıktı                                                                                        |
| ---------------------------------- | -------------------------------------------------------------------------------------------- |
| `seis_ai_core_conversation_status` | Aggregate store health, sayılar, privacy ve migration metadata'sı; mesaj gövdesi yok.        |
| `seis_ai_core_conversation_search` | Eşleşen session kimliği/adı, provider/model, timestamp, sayılar ve score; mesaj gövdesi yok. |

Her tool için MCP annotation değerleri şunlardır:

```json
{
  "readOnlyHint": true,
  "destructiveHint": false,
  "idempotentHint": true,
  "openWorldHint": false
}
```

[MCP tool specification](https://modelcontextprotocol.io/specification/2025-11-25/server/tools),
annotation değerlerinin yalnızca hint olduğunu ve güvenilmeyen sunucularda
yetkilendirme kararı için kullanılamayacağını belirtir. Bu nedenle gerçek sınır
server tarafında ayrıca uygulanmalıdır: network yok, provider call yok, write
yok ve message body dönüşü yok.

Kayıtlı repository-safe resource kimliği:

- `conversation-nexus-contract` -> `seis://ai/conversation-nexus.json`

[MCP resource specification](https://modelcontextprotocol.io/specification/2025-11-25/server/resources)
resource `uri` alanını benzersiz kimlik olarak tanımlar ve hassas resource'lar
için erişim kontrolü ister. Conversation Nexus hiçbir session-content resource
URI'si sunmaz.

MCP üzerinden şu yetenekler kesin olarak yoktur:

- capture veya session write/edit
- external import
- export
- delete
- provider upload
- GitHub publication
- external sync
- message body read

Export, delete ve legacy migration yalnız explicit local CLI kontrolleridir;
MCP tool değildir.

## Güvenlik ve doğruluk sınırı

- Core session runtime API key gerektirmez.
- Schema veya contract provider credential taşımaz.
- Session içeriği repo, GitHub, provider veya MCP message result yüzeyine
  taşınmaz.
- Source provider/model metadata'sı bir çağrı, doğrulama veya sahiplik kanıtı
  değildir.
- `liveProviderUsed=true`, yalnızca konuşmanın kaynak oluşturulma bilgisidir;
  Conversation Nexus'un provider'a veri gönderdiğini ifade etmez.
- External import için ayrı uygulama, test, security review ve insan onayı
  gerekir. Mevcut MCP kaydı yalnız status/search metadata'sı ve repository-safe
  contract resource'u ile sınırlıdır.

## Referanslar

- [JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12)
- [W3C PROV-O Recommendation](https://www.w3.org/TR/prov-o/)
- [NIST Privacy Framework 1.0](https://www.nist.gov/system/files/documents/2020/01/16/NIST%20Privacy%20Framework_V1.0.pdf)
- [Node.js File System API](https://nodejs.org/api/fs.html)
- [MCP Tools 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/server/tools)
- [MCP Resources 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/server/resources)
