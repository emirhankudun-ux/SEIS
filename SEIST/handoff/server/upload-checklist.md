# Server Upload Checklist

## Required Gates

- [ ] Confirm domain/server.
- [ ] Confirm upload path or document root.
- [ ] Verify SHA-256: `d701446f5d69eef763ef683c06261540f4adb200abfad656297ba64546926b30`
- [ ] Confirm rollback package from `releases/2026-05-25T09-00-07-271Z`.
- [ ] Confirm `/health.json` after upload.

## Planned Steps

1. Confirm hosting provider, domain, and upload path.
2. Run scripts/configure-server-target.mjs with the chosen target.
3. Run npm run check:deploy-readiness again.
4. Upload dist/seis-static.zip only after checksum verification.
