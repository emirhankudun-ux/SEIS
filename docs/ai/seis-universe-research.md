# SEIS Universe Araştırma Programı

## Durum

SEIS Universe sorumlu bir model araştırma yönüdür. Tamamlanmış bir foundation
model, AGI sistemi, checkpoint veya benchmark başarısı değildir.

Yürütme sınırı:
`content/development/seis-frontier-training-launch-plan.json`.

## Araştırma Soruları

1. SEIS'e ait, lisanslı ve izlenebilir veri nasıl oluşturulur?
2. Türkçe, kod, tasarım ve güvenlik görevleri aynı eval sisteminde nasıl
   ölçülür?
3. Küçük yerel modeller hangi görevlerde provider modellerinden daha güvenli
   ve ekonomik olabilir?
4. RAG, prompt, adapter ve pretraining katkıları nasıl ayrı kanıtlanır?
5. Kontaminasyon, ezberleme ve özel veri sızıntısı nasıl engellenir?
6. Checkpoint, model kartı ve release kararları nasıl geri alınabilir kalır?

## Araştırma Hatları

### Veri ve Provenance

- allowlist kaynak kaydı,
- lisans ve kullanım amacı,
- kişisel/özel veri sınıflandırması,
- deduplication ve contamination kontrolü,
- sentetik veri üretim ve insan kabul kayıtları,
- train/dev/test ayrımının hashli manifesti.

### Tokenizer

- Türkçe morfoloji ve Unicode kapsamı,
- kod, JSON ve terminal token verimliliği,
- tokenizer sürümleme ve geri uyumluluk,
- veri setinden bağımsız tokenizer değerlendirmesi.

### Küçük Model Deneyleri

İlk gerçek araştırma sınıfı, pahalı frontier training yerine küçük ve yeniden
üretilebilir deneyler olmalıdır. Her deney dataset manifesti, seed, config,
commit, log, checkpoint hash ve eval raporu taşır.

### Adapter ve Fine-tune

SFT, LoRA ve DPO birbirinden ayrı çalışma kimliğiyle izlenir. Base model
sahipliği SEIS'e geçmez. Adapter release'i base model lisansına ve ayrı model
kartına bağlıdır.

### Evaluation

- capability ve safety eval setleri ayrılır,
- held-out veriler eğitim pipeline'ına kapalı tutulur,
- Türkçe, kod, repo, dokümantasyon, security ve tool-use görevleri ölçülür,
- bağımsız red-team ve adversarial değerlendirme yapılır,
- başarısızlıklar başarı skorlarıyla birlikte yayımlanır.

## Aşamalar

| Aşama | Çıktı                                       | Terfi kapısı                            |
| ----- | ------------------------------------------- | --------------------------------------- |
| R0    | Politika, şema, eval ve provenance tasarımı | Doküman ve validator kabulü             |
| R1    | Küçük deterministic seed deneyleri          | Tekrarlanabilir test ve hash            |
| R2    | Onaylı küçük açık model inference pilotu    | Lisans, RAM ve güvenlik raporu          |
| R3    | Küçük adapter/fine-tune deneyi              | Veri, compute, checkpoint ve eval onayı |
| R4    | 20B fizibilite                              | Ölçülmüş dağıtık bütçe ve insan onayı   |
| R5    | 70B+ araştırma                              | Önceki sınıfların kabul edilmiş kanıtı  |

Hiçbir aşama otomatik olarak sonraki ölçeği yetkilendirmez.

## Kanıt Zinciri

Gerçek model geliştirme iddiası için birlikte bulunması gereken kayıtlar:

- dataset card ve immutable manifest,
- tokenizer/config sürümü,
- compute approval ve bütçe,
- training run manifesti,
- değiştirilemez log ve metrikler,
- checkpoint hash/provenance,
- bağımsız eval ve contamination raporu,
- model card,
- güvenlik/release kararı.

Bu zincirden bir halka eksikse eğitim veya model sahipliği iddiası yapılamaz.

## Yasaklar

- özel, sızdırılmış veya lisansı belirsiz veri,
- sahte training logu veya checkpoint,
- çalıştırılmamış benchmark sonucu,
- sentetik veriyi insan üretimi diye sunma,
- parametre sayısını yetenek veya AGI kanıtı sayma,
- insan onayı olmadan provider upload, ücretli compute veya yayın,
- sub-agent'ların kendi yetkisini genişletmesi.

## Resmi Araştırma Tabanı

- [Hugging Face TRL SFT](https://huggingface.co/docs/trl/main/en/sft_trainer)
- [Hugging Face TRL DPO](https://huggingface.co/docs/trl/main/en/dpo_trainer)
- [PyTorch FSDP2](https://docs.pytorch.org/docs/stable/distributed.fsdp.fully_shard.html)
- [NVIDIA Megatron Core Parallelism](https://docs.nvidia.com/megatron-core/developer-guide/latest/user-guide/parallelism-guide.html)
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
- [NIST Generative AI Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)

Araştırma kaynakları mimari kararları destekler; SEIS'in training yaptığına
dair kanıt oluşturmaz.
