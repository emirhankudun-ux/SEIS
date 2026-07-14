# SEIS 10-Year Capability Term Matrix

Status: active specification contract, public-safe

This document transcribes the user-provided ten-year objective into a measurable capability vocabulary. It is a planning and evidence contract, not proof that every capability, integration, metric, provider, deployment, or community signal is currently live.

Machine-readable source: `data/seis-10-year-capability-matrix.json`.
Structural contract: `schemas/seis-10-year-capability-matrix.schema.json`.
Validate with:

```bash
npm run check:seis-10-year-capability-matrix
```

## Contract State

- Anchor: `2026-07-14`
- Target horizon: `2036-07-14`
- Baseline phase: `SEIS-10Y-Y01`
- Categories: 5
- Terms: 104
- Every term: `status: specified`, `maturity: specification`, `evidence_state: not-collected`, `validation_status: planned`
- Target phases are assigned for later evidence planning; no term is marked completed by appearing in this matrix.

## Interpretation Rules

- Stars, downloads, visitors, and similar adoption values are signals, not active-user proof.
- A planned validation or documented contract does not prove live runtime, external integration, deployment, or production readiness.
- A high metric cannot override security, accessibility, reliability, maintenance, or human-experience evidence.
- Unavailable external telemetry must remain unavailable rather than being estimated or fabricated.

## Non-Claims

- No live GitHub Insights, package registry, provider, MCP, deployment, or external telemetry connection is claimed.
- No term is marked completed merely because it appears in this matrix.
- The ten-year target uses session-based continuation and does not claim background execution or elapsed time.

## GitHub adoption and usage signals

Owner: **GitHub Workflow**
Baseline phase: `SEIS-10Y-Y01`
Default target phase: `SEIS-10Y-Y09`

| Term | Türkçesi | Ne anlatır? | Nasıl yorumlanmalı? |
|---|---|---|---|
| Stars | Yıldızlar | Projeye verilen ilgi veya yer imi | Popülerlik göstergesidir; aktif kullanıcı sayısı değildir |
| Forks | Kopyalar | Projenin başka hesaplara kopyalanması | Geliştirme ve deney sinyali verir |
| Watchers / Subscribers | Takipçiler | Bildirim almak için takip edenler | Aktif kullanıcı anlamına gelmez |
| Contributors | Katkıcılar | Koda katkı yapan kişiler | Tek kişiye bağımlılık riskini anlamak için önemlidir |
| Used by | Kullananlar | Paketi kullanan public repo sayısı | Gerçek teknik kullanıma star’dan daha yakın sinyaldir |
| Dependents | Bağımlı projeler | Bu projeye bağlı diğer projeler | Ekosistem etkisini gösterir |
| Downloads | İndirmeler | Paket veya release indirme sayısı | CI botları ve otomatik indirmeler sayıyı şişirebilir |
| Release assets | Sürüm dosyaları | Binary, installer, tarball, zip indirmeleri | Masaüstü ve CLI araçlarında önemlidir |
| Clones | Klonlamalar | Repo’nun kaç kez clone edildiği | Genelde sadece repo sahibi Insights ekranında görür |
| Unique visitors | Benzersiz ziyaretçiler | Repo sayfasını ziyaret eden kişiler | İlgi için daha gerçekçi bir sinyal olabilir |
| Issues | Sorunlar | Kullanıcıların açtığı bug ve talepler | Çok olması hem popülerlik hem sorun anlamına gelebilir |
| Pull requests | Kod talepleri | Dış katkı ve düzeltmeler | Aktif topluluk sinyalidir |
| Discussions | Tartışmalar | Kullanıcı topluluğu iletişimi | Destek ve topluluk olgunluğunu gösterir |
| Stars/forks ratio | Star/fork oranı | İlgi ile gerçek kod kullanımı arasındaki oran | Çok yüksek star, az fork ise proje daha çok kaynak olarak kullanılıyor olabilir |

Measurement scope: GitHub Insights, package usage, or release telemetry when explicitly available; unavailable state must be recorded otherwise.
Evidence sources: `docs/STATUS.md`, `docs/ROADMAP.md`, `docs/RELEASE.md`

## Maintenance and release health

Owner: **Release Manager**
Baseline phase: `SEIS-10Y-Y01`
Default target phase: `SEIS-10Y-Y02`

| Term | Türkçesi | Ne anlatır? | Nasıl yorumlanmalı? |
|---|---|---|---|
| Last commit | Son commit | Projenin aktif geliştirilip geliştirilmediğini gösterir | Son aylarda düzenli commit |
| Commit frequency | Commit sıklığı | Geliştirme temposunu gösterir | Dengeli ve düzenli ilerleme |
| Latest release | Son sürüm | Kullanılabilir stabil paketin güncelliğini gösterir | Yakın zamanda yayımlanmış release |
| Release cadence | Sürüm periyodu | Yeni sürümlerin hangi aralıklarla çıktığı | Öngörülebilir yayın düzeni |
| Changelog | Değişiklik günlüğü | Yeni sürümde ne değiştiğini anlatır | Her release için açıklama |
| Roadmap | Yol haritası | Projenin yönünü gösterir | Açık ve gerçekçi hedefler |
| SemVer | Semantic Versioning | Sürüm numarası standardı | `MAJOR.MINOR.PATCH` düzeni |
| LTS | Long-Term Support | Uzun süre desteklenen sürüm | Production için daha güvenlidir |
| Archived | Arşivlenmiş | Projenin artık aktif geliştirilmediğini gösterir | Production’da genelde kaçınılmalı |
| Maintainer | Bakımcı | Projeyi sürdüren kişi veya ekip | Birden fazla aktif bakımcı |
| Bus factor | Tek kişiye bağımlılık | Ana geliştirici ayrılırsa proje devam eder mi? | Birden fazla uzman katkıcı |
| Governance | Yönetişim | Kararların nasıl alındığını gösterir | Açık katkı ve karar süreci |
| CODEOWNERS | Kod sahipleri | Hangi dosyadan kimin sorumlu olduğunu belirtir | Açık sahiplik |
| Community health | Topluluk sağlığı | Code of Conduct, contributing, issue template gibi dosyalar | Düzenli ve açık topluluk belgeleri |
| Maintenance mode | Bakım modu | Yeni özellik yerine yalnızca hata düzeltme | Kullanım amacına göre kabul edilebilir |
| Breaking change | Uyumsuz değişiklik | Eski kodun çalışmasını bozabilecek değişiklik | Önceden belgelenmiş olmalı |
| Migration guide | Geçiş rehberi | Eski sürümden yeni sürüme geçiş adımları | Production kullanıcıları için çok önemlidir |

Measurement scope: Repository history, tags, changelog, ownership, and rollback records; live cadence is not inferred from documentation.
Evidence sources: `docs/ROADMAP.md`, `docs/RELEASE.md`, `docs/ROLLBACK.md`, `package.json`, `package-lock.json`

## Quality and engineering controls

Owner: **Testing and QA**
Baseline phase: `SEIS-10Y-Y01`
Default target phase: `SEIS-10Y-Y02`

| Term | Türkçesi | Ne anlatır? | Nasıl yorumlanmalı? |
|---|---|---|---|
| Unit tests | Birim testleri | Küçük fonksiyonları test eder | Testler gerçekten çalışıyor mu? |
| Integration tests | Entegrasyon testleri | Birden fazla modülün birlikte çalışmasını test eder | Veritabanı/API testleri var mı? |
| E2E tests | Uçtan uca test | Kullanıcı akışını baştan sona test eder | Gerçek senaryolar test ediliyor mu? |
| Test coverage | Test kapsamı | Kodun ne kadarının test edildiği | Yüksek oran tek başına kalite garantisi değildir |
| CI | Continuous Integration | Her değişiklikte otomatik kontrol | Build, test, lint çalışıyor mu? |
| CD | Continuous Delivery/Deployment | Otomatik yayın süreci | Release güvenli ve geri alınabilir mi? |
| Lint | Kod analizi | Stil ve olası hata kontrolü | Linter CI’da zorunlu mu? |
| Formatter | Biçimlendirici | Kod stilini otomatik düzenler | Projede standart var mı? |
| Type checking | Tip kontrolü | Veri tiplerini doğrular | TypeScript, Rust, Swift, mypy vb. |
| Benchmark | Performans testi | Hız ve kaynak kullanımını ölçer | Gerçek senaryolar kullanılıyor mu? |
| API contract | API sözleşmesi | İstek ve cevap formatını tanımlar | OpenAPI, JSON Schema veya Protobuf var mı? |
| Backward compatibility | Geriye uyumluluk | Eski kullanıcıların kodu çalışmaya devam eder mi? | Deprecation ve migration politikası var mı? |
| Documentation | Dokümantasyon | Kurulum, kullanım ve mimari açıklamalar | README dışında gerçek belgeler var mı? |
| Examples | Örnekler | Projeyi nasıl kullanacağını gösterir | Çalışan örnekler mevcut mu? |
| Error handling | Hata yönetimi | Hataların nasıl ele alındığı | Loading, timeout, retry, degraded state var mı? |
| Observability | Gözlemlenebilirlik | Sistem davranışını izleme | Logs, metrics, traces var mı? |
| Performance budget | Performans bütçesi | Kabul edilebilir boyut ve hız sınırı | Web ve mobil projelerde ölçülüyor mu? |
| Accessibility / A11y | Erişilebilirlik | Klavye, ekran okuyucu, kontrast desteği | WCAG, semantic HTML, focus states var mı? |
| i18n / l10n | Uluslararasılaştırma / yerelleştirme | Farklı dil ve bölgelere uyum | Türkçe, Yunanca ve İngilizce desteği var mı? |

Measurement scope: Executable checks, CI artifacts, contract tests, audits, and reproducible reports.
Evidence sources: `docs/TESTING.md`, `docs/DEVOPS.md`, `docs/ACCESSIBILITY.md`, `.github/workflows/foundation-check.yml`

## Architecture, platform, and AI vocabulary

Owner: **Lead Architect**
Baseline phase: `SEIS-10Y-Y01`
Default target phase: `SEIS-10Y-Y03`

| Terim | Açıklama | Ne zaman işine yarar? | Target phase |
|---|---|---|---|
| Library | Kütüphane | Kodunu sen çağırırsın; kontrol sende kalır | `SEIS-10Y-Y03` |
| Framework | Çatı | Uygulamanın yapısını framework belirler | `SEIS-10Y-Y03` |
| SDK | Geliştirici kiti | Belirli platform veya servise bağlanmak için | `SEIS-10Y-Y03` |
| CLI | Command-Line Interface | Terminalden çalışan araçlar | `SEIS-10Y-Y03` |
| TUI | Terminal User Interface | Terminal içinde görsel arayüz | `SEIS-10Y-Y03` |
| GUI | Graphical User Interface | Pencereli masaüstü arayüz | `SEIS-10Y-Y03` |
| API | Application Programming Interface | Sistemler arası iletişim | `SEIS-10Y-Y02` |
| REST | HTTP tabanlı API modeli | Web backend için yaygın seçenek | `SEIS-10Y-Y02` |
| GraphQL | İstemcinin istediği veriyi seçtiği API | Karmaşık veri ilişkilerinde | `SEIS-10Y-Y02` |
| gRPC | Performanslı servisler arası iletişim | Microservice ve internal API’lerde | `SEIS-10Y-Y02` |
| WebSocket | Sürekli çift yönlü bağlantı | Gerçek zamanlı chat ve bildirimlerde | `SEIS-10Y-Y02` |
| Full-stack | Frontend + backend | Tüm uygulama katmanını kapsar | `SEIS-10Y-Y03` |
| BFF | Backend for Frontend | Her arayüz için özel backend katmanı | `SEIS-10Y-Y03` |
| Monolith | Tek uygulama | Küçük ve orta projelerde daha basit | `SEIS-10Y-Y03` |
| Modular monolith | Modüllere ayrılmış tek uygulama | SEIS gibi büyüyen projelerde iyi başlangıç | `SEIS-10Y-Y03` |
| Microservices | Dağıtık servisler | Büyük ekip ve bağımsız ölçekleme gerektiren sistemlerde | `SEIS-10Y-Y03` |
| Serverless | Sunucu yönetmeden çalışma | Değişken trafik ve hızlı prototiplerde | `SEIS-10Y-Y03` |
| SaaS | Hizmet olarak yazılım | Kullanıcı servisi dışarıdan kullanır | `SEIS-10Y-Y03` |
| Self-hosted | Kendi sunucunda çalıştırma | Gizlilik ve kontrol gerektiğinde | `SEIS-10Y-Y03` |
| On-premise | Kurum içinde çalıştırma | Hassas veya kurumsal sistemlerde | `SEIS-10Y-Y03` |
| Local-first | Önce yerel çalışma | Offline ve gizlilik odaklı ürünlerde | `SEIS-10Y-Y03` |
| Offline-first | İnternet olmadan çalışabilme | Mobil, saha ve güvenilirlik gerektiren uygulamalarda | `SEIS-10Y-Y03` |
| Sync | Senkronizasyon | Yerel ve bulut verisini birleştirmede | `SEIS-10Y-Y03` |
| Plugin | Eklenti | Sisteme sonradan yetenek eklemede | `SEIS-10Y-Y07` |
| Extension | Uzantı | Tarayıcı, editör veya platform özelleştirmede | `SEIS-10Y-Y07` |
| MCP | Model Context Protocol | AI modeline kontrollü araç ve veri bağlamı vermede | `SEIS-10Y-Y04` |
| Provider routing | Sağlayıcı yönlendirme | Farklı AI servisleri arasında seçim yapmada | `SEIS-10Y-Y04` |
| Model routing | Model yönlendirme | Göreve göre farklı LLM seçmede | `SEIS-10Y-Y04` |
| RAG | Retrieval-Augmented Generation | AI’ın arama ve dokümanlarla cevap üretmesinde | `SEIS-10Y-Y05` |
| Vector database | Vektör veritabanı | Semantic search ve RAG için | `SEIS-10Y-Y05` |
| Agent | AI ajanı | Araç kullanabilen, görev yürüten AI sistemi | `SEIS-10Y-Y04` |
| Workflow | İş akışı | Birden fazla adımın sıralı çalışması | `SEIS-10Y-Y03` |
| Queue | İş kuyruğu | Uzun veya arka plan işlerini yönetmede | `SEIS-10Y-Y03` |
| Cache | Önbellek | Yanıt süresini ve maliyeti azaltmada | `SEIS-10Y-Y03` |
| Rate limit | İstek sınırı | API kötüye kullanımını ve maliyeti kontrol etmede | `SEIS-10Y-Y03` |
| RBAC | Role-Based Access Control | Kullanıcı rollerine göre yetki vermede | `SEIS-10Y-Y03` |
| Feature flag | Özellik bayrağı | Özelliği kullanıcıya kademeli açmada | `SEIS-10Y-Y03` |
| Migration | Veri geçişi | Şema veya veritabanı değişikliklerinde | `SEIS-10Y-Y02` |
| Rollback | Geri alma | Hatalı sürümden önceki sürüme dönmede | `SEIS-10Y-Y02` |

Measurement scope: Architecture documents, manifests, registries, ADRs, and runtime contracts; no provider or live-service claim is implied.
Evidence sources: `docs/ARCHITECTURE.md`, `project.ecosystem.yaml`, `docs/AI_CORE.md`, `docs/MCP_REGISTRY.md`

## Ecosystem health signals

Owner: **Governance**
Baseline phase: `SEIS-10Y-Y01`
Default target phase: `SEIS-10Y-Y01`

| Durum | İyi sinyal | Riskli sinyal | Target phase |
|---|---|---|---|
| Bakım | Son aylarda düzenli commit | Yıllardır güncelleme yok | `SEIS-10Y-Y01` |
| Sürüm | Tag, changelog ve migration guide var | Sürüm sistemi yok | `SEIS-10Y-Y01` |
| Lisans | Açık ve anlaşılır lisans var | Lisans dosyası yok | `SEIS-10Y-Y01` |
| Güvenlik | SECURITY.md, Dependabot, CodeQL var | Güvenlik iletişim kanalı yok | `SEIS-10Y-Y01` |
| Test | Unit, integration veya E2E testleri var | Test yok veya CI çalışmıyor | `SEIS-10Y-Y01` |
| Katkı | Birden fazla aktif maintainer var | Tek kişiye tamamen bağımlı | `SEIS-10Y-Y01` |
| Dokümantasyon | Kurulum, API ve örnekler iyi | Sadece tek satırlık README | `SEIS-10Y-Y01` |
| Release | İmzalı veya doğrulanabilir release | Rastgele binary veya script | `SEIS-10Y-Y09` |
| Bağımlılık | Lockfile ve güncel dependency graph | Sabitlenmemiş, eski bağımlılıklar | `SEIS-10Y-Y01` |
| API | Versioned API ve compatibility policy | Her sürümde sessiz breaking change | `SEIS-10Y-Y09` |
| Performans | Benchmark ve bütçe mevcut | Performans iddiası ölçülmemiş | `SEIS-10Y-Y01` |
| Gizlilik | Telemetry açıkça belgelenmiş | Hangi verinin toplandığı belirsiz | `SEIS-10Y-Y01` |
| Kullanım | Used by, package download veya release download var | Sadece yüksek star var | `SEIS-10Y-Y09` |
| Topluluk | Issue template, code of conduct, discussions var | Sorular cevapsız kalıyor | `SEIS-10Y-Y01` |
| Ürün durumu | Stable, beta veya prototype açıkça yazıyor | Demo production gibi sunuluyor | `SEIS-10Y-Y01` |

Measurement scope: Public-safe repository, security, release, dependency, and product-health records.
Evidence sources: `docs/STATUS.md`, `SECURITY.md`, `README.md`, `package-lock.json`

## Operating Loop

1. Select a term only when it belongs to the current Goal and phase.
2. Define an owner, acceptance criteria, evidence source, and rollback or correction path.
3. Collect reproducible evidence; keep unavailable external telemetry explicitly unavailable.
4. Run the relevant validation and review gates.
5. Change the term lifecycle only through an evidence-backed Goal update.
6. Regenerate the Goal Tracking view when source records change.

## Related Contracts

- `AGENTS.md`
- `data/seis-enterprise-expansion-v3.json`
- `docs/governance/seis-enterprise-expansion-10-year-stewardship.md`
- `content/development/seis-goal-tracking.json`
- `content/development/seis-goal-evidence.json`
- `project.ecosystem.yaml`
