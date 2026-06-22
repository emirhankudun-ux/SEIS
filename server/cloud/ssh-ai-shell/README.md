# SSH-AI Shell v0.4

SSH üzerinden güvenli, kalıcı ve araç destekli bir terminal asistanı.

Version source of truth: [`version.py`](./version.py). Version-only releases may
update display strings, user-agent metadata, and release notes, but must not
change the SSH alias, host, daemon port, bridge port, or remote connection path.

This release line is `SSH-AI v0.4 5-Year LTS`: a long-term support version
declared on 2026-06-19 with a five-year support horizon through 2031-06-19.
The five-year line keeps runtime connection surfaces stable while allowing
version metadata, compatibility checks, docs, and release evidence to improve.

## Özellikler

- OpenAI / Anthropic / OpenAI-compatible lokal sağlayıcılar
- RAG (TF-IDF chunk indexing) ile doküman bağlam desteği
- Plugin tabanlı araç sistemi
- Güvenli sandboxed shell
- Oturum kalıcılığı (daemon + local fallback)
- `/sessions`, `/resume`, `/lang`, `/plugins` gibi gelişmiş komutlar
- WebSocket bridge (opsiyonel)

## Kurulum

```bash
cd server/cloud/ssh-ai-shell
chmod +x install.sh
sudo ./install.sh
```

Özel sunucuya tek adım uzaktan kurulum (root@port 22 varsayılan):

```bash
cd server/cloud/ssh-ai-shell
chmod +x remote-bootstrap.sh install.sh
./remote-bootstrap.sh 21.0.3.171 root 22
```

Komut:
- `21.0.3.171` yerine hedef IP/host,
- `root` yerine ssh kullanıcı adınızı yazın.
- `22` yerine SSH portunuzu yazın.

İsterseniz kurulumdan sonra SEIS-SSH aliasını doğrudan tek seferde çevrimiçi moda alabilirsiniz:

```bash
./remote-bootstrap.sh 21.0.3.171 root 22 --apply-seis-ssh-alias
```

Bu seçenek otomatik olarak şu komutları çalıştırır:

```bash
npm run cloud:ssh:direct-cloud:switch -- --direct-host 21.0.3.171 --direct-user root --apply
npm run check:seis-ssh-picker-compatibility -- --require-picker-compatible
```

Not: Public key dosyası **yerel projeye kopyalanmaz**; `remote-bootstrap.sh`
`SEIS_CLOUD_PUBLIC_KEY_PATH` ile sadece sunucunun `/etc/ssh-ai/authorized_keys` dosyasına aktarır.

İsterseniz dördüncü argümanla identity private key, beşinci argümanla farklı bir public key verirsiniz; script otomatik olarak hedefe taşır ve kurulumda `SEIS_CLOUD_PUBLIC_KEY_PATH` ile import eder.

## Lokal geliştirme

```bash
cd server/cloud/ssh-ai-shell
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python ai_shell.py
```

Tek oturum devamı (opsiyonel):

```bash
python ai_shell.py --session-id <oturum_id>
```

Tek komutla cloud transport geçişi (public IP verildiğinde):

```bash
  cd "/Users/<kullanıcı>/Library/Mobile Documents/com~apple~CloudDocs/Github/SEIS"
  npm run cloud:ssh:direct-cloud:switch -- --direct-host <public-ip> --direct-user root --apply
  npm run cloud:ssh:online:strict -- --require-picker-compatible
```

Bağlantı koptuysa veya farklı cihazda devam etmek istersen, önce:

```bash
/sessions
```
komutuyla bir oturum id'si alıp `--session-id` ile tekrar açabilirsin.

SSH anahtarı seçimi (örnek):

```bash
ls -1 ~/.ssh/*.pub
ssh-keygen -l -f ~/.ssh/id_ed25519_github.pub
```

Önemli: private key dosyalarını repoya ekleme. Kimlik yönetimi `~/.ssh/authorized_keys` üzerinden yapılır, anahtar içeriği loglara yazılmaz.

## Komutlar

```bash
/help
/usage
/index
/plugins
/sessions
/resume <session_id>
/lang tr | en | auto
/shell <cmd>
exit
```

Ek not:

- `docker_plugin.py` aktif olduğunda `docker` komutlarının çalışabilmesi için sandbox whitelist’e `docker` eklendi.

## Üretim (özet)

- Uygulama kodu: `/opt/ssh-ai`
- Servis hesabı: `aiuser`
- Daemon servis: `ssh-ai.service`
- Ortam değişkenleri: `/etc/ssh-ai/ssh-ai.env`
- Opsiyonel WebSocket bridge servisi: `ssh-ai-bridge.service`

## SEIS-SSH ile Direkt Cloud Moduna Geçiş (Tek Alias)

`SEIS-SSH` tek görünür hedeftir. `ProxyCommand` modunda picker uyumluluğu sorunu yaşarsanız, endpoint erişilebilirliğini doğrulayıp tek alias ile doğrudan cloud moduna geçin:

```bash
npm run cloud:ssh:direct-cloud:switch -- --direct-host 21.0.3.171 --direct-user root --apply
npm run check:seis-ssh-picker-compatibility -- --require-picker-compatible
npm run cloud:ssh:online:strict -- --require-picker-compatible
```

`--apply` olmadan çalıştırırsanız yalnızca plan çıkar; sadece endpoint erişilebilir olduğunda switch gerçekleşir.

## Provider/Project/Public-IP ile Tek Komut

Çoklu cihazda da aynı komutla SEIS-SSH’i doğrudan cloud moda alabilirsiniz:

```bash
# Public IP direkt verildiğinde
npm run cloud:ssh:direct-cloud:switch -- --public-ip 203.0.113.10 --direct-user root --apply

# Provider + Project env tabanlı geçiş
SEIS_CLOUD_DIGITALOCEAN_SEIS_CLOUD_HOST=203.0.113.10 \
  npm run cloud:ssh:direct-cloud:switch -- --provider digitalocean --project seis-cloud --apply
```

`--apply` olmadan önce çalıştırıp planı da görebilirsiniz; yalnızca erişilebilir endpoint ve picker uyumu geçerliyse switch edilir.

## Enterprise Hardening (Apple / Google / AI company-style)

- Kimlik doğrulama password ile değil, sadece public key ile yapılır (`PasswordAuthentication no`).
- Sunucu servisinde sistem çağrısı/ACL kısıtlaması uygulanır (`NoNewPrivileges`, `ProtectSystem`, `PrivateTmp`, `SystemCallFilter` vb.).
- SSH entrypoint yalnızca `ai_shell` zorunlu komutu çalıştırır (`ForceCommand`).
- API anahtarları yalnızca root-okunaklı dış dosyada tutulur (`/etc/ssh-ai/ssh-ai.env`, 600).
- `authorized_keys` dosyası sistemde yerel olarak yönetilir, repo içine asla düşmez.
- Deploy/kurulum değiştikçe `backup` dosyaları üretir ve servis yeniden yüklendikten sonra doğrulama istenir.

> Not: API anahtarı gibi secret değerleri repoya yazmayın.

## 5 Yıllık Enterprise Baseline (Apple/Büyük Firma/AI yaklaşımı)

- Tek güvenlik yüzeyi: tek alias (`SEIS-SSH`) ve picker uyumlu tek transport.
- Kısıtlı secret yaşam döngüsü: API anahtarı sadece `/etc/ssh-ai/ssh-ai.env` altında, 600 izinle tutulur; repo temiz kalır.
- İki servisli model: `ssh-ai.service` (daemon) + `ssh-ai-bridge.service` (opsiyonel bridge), her ikisi de hardening ile izole.
- OPA/Policy-ready doğrulama:
  - `npm run check:seis-ssh-access-model`
  - `npm run check:seis-ssh-picker-compatibility`
  - `npm run cloud:ssh:online:strict -- --require-picker-compatible`
- Drift-proof bootstrap: kurulum, unit ve sshd match dosyalarına yazmadan önce backup alır ve tekrar uygulanabilir.
- Yeni cihaz bootstrap: aynı SSH anahtarı kimliği taşınır, script `SEIS_CLOUD_PUBLIC_KEY_PATH` ile tek noktadan yetki yükler.

Operational runbook (özet):

```bash
SEIS_CLOUD_PUBLIC_KEY_PATH=~/.ssh/id_ed25519_seis_codex.pub sudo ./install.sh
npm run cloud:ssh:direct-cloud:switch -- --direct-host <cloud-ip> --direct-user root --direct-port 22 --apply
npm run check:seis-ssh-picker-compatibility -- --require-picker-compatible
```
