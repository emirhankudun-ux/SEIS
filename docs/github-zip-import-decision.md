# Github.zip Import Decision

Date: 2026-06-05

Source archive:

```text
legacy local Github.zip archive; keep outside /Users/emirhankudun/Developer/SEIS
```

Checksum:

```text
sha256 76cb95a3caf3b45aa11ef487fe766b441b031296c9adddadcd51658b420e0fd7
```

## Audit Summary

| Field | Value |
|---|---:|
| Zip size | 1,146,306,309 bytes |
| Uncompressed size | 1,656,920,490 bytes |
| Entries | 48,365 |
| `.git` entries | 2,704 |
| `__MACOSX` entries | 2,822 |
| Generated/cache-like entries | 37,687 |
| Nested archives | 13 |
| Files over 20 MB | 8 |

Full inventory: [`data/github-zip-import-inventory.json`](../data/github-zip-import-inventory.json)

## Decision

Do not commit `Github.zip` directly into SEIS as a normal Git file.

Reasons:

- the zip is about 1.1 GB
- GitHub blocks normal Git files over 100 MiB and recommends Git LFS for larger files
- the archive contains many generated/cache entries, virtual environment files, macOS metadata, local SDK/JDK content, and `.git` internals
- direct import would make SEIS slower and harder to clone

## Recommended Path

1. Keep the zip as a local source archive until curated import is complete.
2. Keep this checksum and inventory in SEIS.
3. Import only curated source folders into `repositories/<repo>` or `source-archives/<area>`.
4. Use Git LFS, GitHub Releases, or external object storage only if the full binary archive must be retained remotely.
5. Do not delete local folders or old GitHub repositories until the curated SEIS import is verified.

## Deletion Gate

Deleting everything except SEIS is allowed only after:

- curated source import is present in SEIS
- plugin source is mirrored under `plugins/seis`
- branch refs and repository snapshots are verified
- the local zip remains available or is safely stored through LFS/object storage

This keeps SEIS as the center without turning it into an oversized binary dump.
