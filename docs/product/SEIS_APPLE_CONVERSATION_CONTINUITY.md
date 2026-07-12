# SEIS Apple Conversation Continuity

## Product Decision

SEIS'in yeni ürün geliştirme hattı Apple-first ve Swift-first ilerler. Mevcut web tabanlı demo, ZIP referans bankası ve kullanıcı kodu korunur; yeni Apple ürün yüzeyleri için varsayılan teknoloji Swift, SwiftUI ve Swift Package Manager'dır.

Bu dilim macOS ile iOS/iPadOS üzerinde aynı veri sözleşmesini kullanan yerel bir sohbet süreklilik merkezi ekler. visionOS desteği platform uyumluluk incelemesinden sonra ayrı bir fazdır ve bugün çalışıyor olarak gösterilmez.

## Agency and Client Model

- Müşteri ürün yönünü, kapsamı ve riskli işlemleri onaylar.
- SEIS Ajans mimariyi önerir, uygulamayı üretir, güvenlik sınırlarını korur ve incelemeye hazır teslimat oluşturur.
- Bir onay kaydı GitHub merge, dağıtım, SSH, CloudKit veya başka bir dış işlemi kendiliğinden çalıştırmaz.
- Gerçek dış sistem işlemleri ayrı yetki, doğrulama ve gözlemlenebilir sonuç gerektirir.

## Working Surface

`SeisAppleConversationContinuityView` aşağıdaki işlevleri sağlar:

- Desktop, AI Core, Search, Code, Design, Cloud, Store, Music, Launchpad, Files, Terminal, Website, Agents, Plugins ve Command Center sohbet kaynakları
- müşteri, ajans ve sistem rolleriyle yerel mesaj kaydı
- kaynak bazlı bağlam kanıtı
- müşteri karar masası
- uygulama sandbox'ında JSON kalıcılığı
- cihaz değişimi için JSON dışa aktarma
- mevcut kaydı silmeden kimlik bazlı JSON birleştirme
- `local-only`, `metadata-only`, `approval-needed` ve `disabled` güvenlik durumları

macOS'ta yüzey Apple Platform panelindeki `SEIS Apple Workspace` içinde açılır. iOS/iPadOS'ta ana `TabView` içindeki `Süreklilik` sekmesinden açılır.

## Persistence Contract

Varsayılan kayıt konumu uygulamanın `Application Support/SEIS/ConversationContinuity` sandbox dizinidir. Snapshot şeması sürümlüdür ve dışa aktarılan dosya gizli anahtar, API anahtarı, çerez, SSH anahtarı veya sağlayıcı kimlik bilgisi içermez.

Birleştirme davranışı eklemelidir:

- yerel sohbet ve mesajlar silinmez
- yeni sohbetler kimliklerine göre eklenir
- aynı sohbet içindeki yeni mesajlar kimliklerine göre eklenir
- bağlam ve karar olayları kimliklerine göre eklenir
- daha kısıtlayıcı güvenlik durumu korunur
- birleştirme hiçbir uzak işlem başlatmaz

## Real, Local Demo, and Planned

| Capability | Status | Boundary |
| --- | --- | --- |
| SwiftUI conversation workspace | Real | Native local UI |
| Local JSON persistence | Real | App sandbox only |
| JSON export and merge import | Real | User-selected local files |
| AI provider responses | Local Demo | No provider access is claimed |
| Repository awareness | Metadata only | No unrestricted file access |
| SSH execution | Disabled | Explicit approval and verified setup required |
| CloudKit synchronization | Planned | Entitlements, data model, privacy review and client approval required |
| GitHub merge from approval cards | Disabled | Repository workflow remains a separate controlled plane |
| visionOS surface | Planned | Compatibility and interaction audit required |

## Five-Year Apple Direction

### Year 1: Native Working Demo

- macOS and iOS/iPadOS SwiftUI shell
- local conversation continuity
- Local Demo AI Core
- native Desktop, Search, Code, Design and Command Center surfaces
- exportable client handoff

### Year 2: Apple Alpha

- approved CloudKit continuity
- Keychain-backed provider configuration
- local model adapter evaluation
- document-based workspace handoff
- deeper accessibility and iPad multitasking

### Year 3: Apple Beta

- team workspaces
- collaboration conflict resolution
- native plugin permission model
- advanced code and design canvases
- visionOS prototype after compatibility approval

### Year 4: Platform

- enterprise identity and policy
- observability and audit export
- managed remote workspaces
- organization-scoped automation approvals
- Apple platform performance budgets

### Year 5: Ecosystem

- extensible Apple-native creative operating system
- advanced local/cloud AI routing with explicit provider identity
- secure agent marketplace
- multi-user continuity across approved Apple platforms
- public/open-source readiness review

## Approval Needed for the Next Native Phase

CloudKit must not be enabled until the client approves the data categories, retention policy, account behavior, entitlements and device-conflict strategy. Keychain/provider work must not begin by embedding secrets in the SwiftUI client; any cloud provider credential flow requires a backend or approved secure local architecture.
