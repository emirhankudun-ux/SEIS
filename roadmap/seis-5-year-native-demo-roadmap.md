# SEIS Native Demo UX Roadmap (5 Yıllık)

## Amaç

SEIS macOS demo uygulamasını, yalnızca çalışan bir kontrol yüzeyi olmaktan çıkarıp;
Apple kalitesinde, büyük yapay zeka şirketlerinin ürün disiplinine uygun,
yüksek estetik ve düşük öğrenme eğrisine sahip bir deneyime taşımak.

Bu yol haritası, mevcut `SeisAppleNativeShellFreshDemoHomeView` ile başlar ve
5 yıl içinde ürünün kullanıcı odaklı, güvenli ve otomasyonla uyumlu bir vitrini
olmasını hedefler.

## Yıl 1: Kullanım Kolaylığı ve Estetik Tabanı

- **Başlık:** “İlk 5 Dakika Mükemmelliği”
- **Hedef:** Yeni bir kullanıcı, 1 akışta (senaryo seç → çalıştır → sonuç gör) uygulamayı
  rahatça anlamalı.
- **Yapılacaklar:**
  - Sol/sağ panel düzenini tek bir design system içinde stabilize etmek.
  - Route hızlı başlatma, senaryo keşfi, geçmiş sonuçlar ve fallback mesajlarını
    tek ekranda daha okunabilir kılmak.
  - Website’den indirilecek kadar özenli bir hissiyat için card seviyesinde
    glassmorphism ve hiyerarşik spacing düzenlemeleri yapmak.
- **Risk azaltma:** Kötü UX nedeniyle düşük etkileşim veya yanlış rota girişi.
  - Çözüm: route geçmişi + validasyon mesajları + kısayol menüsü.

## Yıl 2: Design System ve Gelişmiş İçerik Akışı

- **Başlık:** “Sabit Görsel Kimlik”
- **Hedef:** Tasarım sistemi içinde tutarlı tipografi, boşluk (spacing), ikonografi ve
  etkileşim dili.
- **Yapılacaklar:**
  - Scenario kartlarında ikon + meta + aksiyon setlerini standartlaştırmak.
  - Sonuç ve geçmiş kartlarında zaman çizelgesi/başarısızlık açıklamaları eklemek.
  - Telemetri, route status ve fallback bilgilerini net ama rahatsız etmeyen şekilde
    üst düzeyde göstermek.
- **Metrik:** İlk etkileşim süresi (`FMIT`) ve başarılı demo başlatma oranı artmalı.

## Yıl 3: AI-Sıkı, Policy-Öncü Deneyim

- **Başlık:** “Akıllı ama kontrol altında”
- **Hedef:** Uygulama davranışı AI ile zenginleşirken politikayı aşmaması.
- **Yapılacaklar:**
  - Senaryo önerilerini kullanım geçmişine göre sıralayan öneri akışı.
  - Senaryo kopyalama, paylaşılabilir çıktı alma ve rapor özetleme akışları.
  - “Ne olur?” simülasyonları için güvenli pre-check paneli.
- **Risk azaltma:** AI otomasyonunun kontrol dışı davranması.
  - Çözüm: policy-first route davranışı ve geri alma planları.

## Yıl 4: Platform Entegrasyonları ve Ürün Derinliği

- **Başlık:** “Vitrinden ekosisteme”
- **Hedef:** Aynı demo yüzeyini web/cockpit ve mobil denemelere hizalamak.
- **Yapılacaklar:**
  - Ana hedeflerin webde ve macOS’ta deneyim eşitliği.
  - Çalıştırma sonuçlarını, plugin lane sonuçlarıyla ilişkilendiren geçmiş katmanı.
  - Çoklu uzman filtrelerini uzmanlar arası karşılaştırmaya dönüştürmek.
- **Metrik:** Özelleştirilmiş uzman önerisi doğruluk skoru ve kullanıcı geri dönüş hızı.

## Yıl 5: Dijital Ürün Sahnesi ve Premium Sunum

- **Başlık:** “Büyük firmanın ürünü gibi bir vitrin”
- **Hedef:** Apple + Hermes kalitesinde, yatırımcı/ortak demo sunumları için doğrudan
  kullanılabilir bir yüzey.
- **Yapılacaklar:**
  - Tanıtıma hazır “single-click story flow” (kurulum, senaryo, sonuç, paylaşıma hazır
    rapor).
  - İndirilebilir paket ile otomatik screenshot + sürüm notu üretimi.
  - 5 yıllık ürün kararlarını yıllık gözden geçirmeyle governance’e bağlamak.

## Uygulama Notu

Bu yol haritası, her yıldaki özellik tesliminden önce kalite kapılarıyla başlamalıdır:
`quality` · `security` · `AI` · `rollback`. Her 1 yıllık dönemin sonunda aşağıdaki
ölçümler doğrulanmadan bir sonraki büyük tema devreye alınmamalıdır:

- Güvenilirlik/rollback süresi
- Policy ihlal oranı
- Karar izi tamlığı
- Yeni kullanıcıların ilk anlamlı etkileşim süresi

---

Bu doküman, SEIS Native Demo deneyiminin 5 yıl boyunca “güvenli, çekici, ölçeklenebilir
ve yüksek estetik” kalmasını hedefleyen ana yol haritasıdır.
