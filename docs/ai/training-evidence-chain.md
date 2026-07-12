# SEIS Model Eğitim Kanıt Zinciri

## Amaç

Bir model veya adapter hakkında “eğitildi”, “checkpoint oluştu”, “benchmark
geçti” veya “yayına hazır” denebilmesi için gereken kayıtları strict ve
birbirine bağlı hale getirir.

Kaynak sözleşme:
`content/development/seis-model-training-evidence-chain.json`.

Frontier yürütme sınırı:
`content/development/seis-frontier-training-launch-plan.json`.

## Bugünkü Gerçek Durum

- Gerçek dataset manifesti: `0`
- Gerçek compute approval: `0`
- Gerçek training run: `0`
- Gerçek checkpoint: `0`
- Gerçek evaluation report: `0`
- Gerçek release approval: `0`
- Varsayılan release kararı: `deny`

Test fixture'ları bu sayılara dahil değildir ve model kanıtı sayılamaz.

## Şema Katmanları

| Kayıt            | Şema                                                               | Yetki sınırı                                                                                         |
| ---------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Dataset manifest | `packages/data/schemas/model-dataset-manifest.schema.json`         | Veri provenance, lisans, split, contamination ve immutable dataset-card referansı                    |
| Compute approval | `packages/shared-types/schemas/model-compute-approval.schema.json` | İnsan onayı, bütçe, GPU-saat ve cost-stop                                                            |
| Training run     | `packages/evals/schemas/model-training-run.schema.json`            | Dataset, compute, kod, config, log ve output bağlantısı                                              |
| Checkpoint       | `packages/evals/schemas/checkpoint-record.schema.json`             | Artifact/lock/container hashleri, mimari, tokenizer, runtime, safety/privacy ve model-card referansı |
| Evaluation       | `packages/evals/schemas/model-evaluation-report.schema.json`       | Commit, config, seed, donanım, runtime, ham çıktı, safety, contamination ve bağımsız review          |
| Release decision | `packages/evals/schemas/model-release-decision.schema.json`        | Tüm kanıtlar, model/dataset card hashleri ve final insan onayı                                       |

Şemalar resmi [JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12)
dialectini kullanır. Yapısal doğrulama Ajv 8 ve `ajv-formats` ile çalışır.

## İki Katmanlı Doğrulama

### 1. Yapısal

- zorunlu alanlar,
- alan tipleri,
- enum ve const değerleri,
- id/hash/path patternleri,
- bilinmeyen alan reddi,
- nested object ve array kuralları.

### 2. Semantik

- canonical record hash yeniden hesaplama,
- `previousRecordHash` zinciri,
- benzersiz kayıt kimlikleri,
- dataset -> run -> checkpoint -> eval -> release referansları,
- dataset hazır olmadan training reddi,
- compute onayı olmadan execution reddi,
- artifact olmadan checkpoint reddi,
- rapor olmadan benchmark reddi,
- accepted model-card ve dataset-card hashleri olmadan release reddi,
- insan onayı olmadan release reddi.

JSON Schema tek başına çapraz-kayıt ilişkilerini kanıtlamadığı için semantik
validator ayrı tutulur.

## Fixture Sınırı

Fixture kayıtları yalnız
`packages/evals/fixtures/training-evidence/` altında bulunur ve birlikte:

- `fixtureOnly: true`,
- `recordStatus: fixture-only-not-evidence`,
- training/checkpoint/benchmark/release değerleri `false`,
- artifact, log, report ve approval alanları boş

olmak zorundadır.

Generator:
`scripts/create-seis-training-evidence-fixtures.mjs`.

Bu generator model, dataset veya checkpoint oluşturmaz. Yalnız schema ve hash
regresyon fixture'ı üretir.

Fixture içindeki model-card ve dataset-card hashleri açıkça sentetik referans
hashleridir. Gerçek kartların yerini tutmaz. Doldurulmamış kart şablonlarında
`immutableIdentity.contentHash` değeri `null` kalır; gerçek release için kart
içeriği bağımsız olarak incelenip immutable hale getirilmelidir.

## Hash Zinciri

`recordHash`, kayıt içeriğinin `recordHash` alanı hariç obje anahtarları
recursive sıralanarak SHA-256 alınmasıyla hesaplanır. Her kayıt önceki kaydın
hashini taşır.

Bu `seis-sorted-json-v1` iç sözleşmesidir; RFC 8785 uyumluluğu iddia edilmez.
Model artifact hashleri bu fixture zincirinden tamamen ayrıdır.

Repo içindeki hashler tek başına güven kökü değildir. Bugünkü sözleşmede
`trustRoot.status: not-configured`, trusted approval key listesi boş ve
attestation verifier `not-implemented` durumundadır. Bu nedenle içerik olarak
tutarlı görünse bile hiçbir `allow` zinciri geçerli release kanıtı sayılamaz.

## Çalıştırma

```bash
npm run automation:seis-training-evidence-fixtures
npm run check:seis-model-training-evidence-chain
node --test packages/seis-ai/test/training-evidence.test.mjs
```

Salt-okunur MCP yüzeyleri:

- tool: `seis_ai_core_training_evidence_status`
- resource: `seis://ai/model-training-evidence-chain.json`

## Release Kararı

`allow` ancak accepted dataset, compute, run, checkpoint, evaluation, eşleşen
immutable model-card/dataset-card hashleri ve açık insan onayı birlikte
bulunduğunda değerlendirilebilir. Şema geçerliliği tek başına execution veya
release yetkisi vermez.

Bunlara ek olarak ayrı yönetilen bir trusted approval key ile doğrulanmış
attestation zorunludur. Bu verifier bu foundation pass içinde uygulanmadığı
için release kararı koşulsuz olarak `deny` kalır.

Altı şema ayrıca
`content/development/seis-data-schema-registry.json` içinde kayıtlıdır; bu
kayıtlar `npm run check:data-schema-registry` ile doğrulanır.

Eksik referans, bozuk hash, unknown field, credential, fixture, safety kritik
başarısızlık veya süresi dolmuş onay varsa karar `deny` kalır.

JSON okumaları repo-realpath sınırı, symlink reddi ve 2 MiB dosya boyutu
limitiyle korunur. Credential taraması hem ham JSON metnini hem de parse edilmiş
string değerlerini tarar; Unicode escape ile saklanan token biçimleri de
reddedilir. Salt-okunur tool/MCP çağrılarında fixture doğrulaması kapatılamaz.

## İnsan Onayı Gerekenler

- model/dataset indirme veya upload,
- provider authentication,
- compute approval ve ücretli GPU,
- training/fine-tune run,
- checkpoint acceptance/publication,
- benchmark execution,
- release, route promotion ve deployment,
- GitHub push, PR, merge veya release.

Bu belge ve validatorlar bu onayların yerine geçmez.
