# Server Adapter Matrix

## Purpose

The release can be preserved and served from several server types without changing the main web app.

| Adapter | Path | Use |
| --- | --- | --- |
| Node.js | `server/node/static-server.mjs` | Preview or Node-capable VPS |
| PHP | `server/php/health.php` | Shared hosting health fallback |
| PHP router | `server/php/router.php` | PHP built-in server fallback |
| Nginx | `server/nginx/seis-static.conf` | VPS/static reverse proxy |
| Apache | `server/apache/.htaccess` | cPanel/Hostinger-style shared hosting |
| Python | `server/python/verify_release.py` | Check uploaded package hash |
| Ruby | `polyglot/ruby/verify_release.rb` | Alternate package hash check |
| Cloudflare Worker | `server/edge/cloudflare-worker.js` | Edge health/origin proxy |
| Docker | `server/docker/Dockerfile` | Containerized Node static server |
| Azure Static Web Apps | `deploy/provider-matrix.json` | Static artifact handoff with deployment promotion rollback |
| AWS Amplify Hosting | `deploy/provider-matrix.json` | Static artifact release with job-based rollback |
| Firebase Hosting | `deploy/provider-matrix.json` | Static site release channel with release rollback |

## Recommended Upload

Upload only:

```text
dist/seis-static.zip
```

Then verify:

```bash
python3 server/python/verify_release.py dist
```

Alternative Ruby verification:

```bash
ruby polyglot/ruby/verify_release.rb dist
```

## Health Checks

Static package:

```text
/health.json
```

Node/PHP compatible:

```text
/_server/health
```

Cloud platform routes:

```text
/sitemap.xml
/manifest.webmanifest
```
