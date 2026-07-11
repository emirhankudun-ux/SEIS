# SEIS WOW Reference Boundary

The SEIS WOW collections remain supplied visual/reference metadata. In this
checkout the catalog and imported HTML references are present, while the PNG
preview files are not present on disk. The Desktop OS and full WOW Gallery
therefore render an honest `Preview unavailable` surface instead of issuing
404 image requests or implying that a preview loaded.

## Current behavior

- Collection, page, tag, search, and HTML reference interactions remain live.
- PNG paths remain visible as provenance metadata.
- Unavailable PNG actions are not opened or downloaded.
- External Kimi references remain explicitly external.
- No supplied asset is deleted, renamed, or copied into the repository.
- No cloud, SSH, provider, or host filesystem access is used.

## Evidence

- `npm run check:seis-wow-reference-fallback`
- `npm run check:desktop-os-browser-smoke`

The Desktop browser smoke is expected to report zero relevant console/network
issues after the fallback is active. If PNG assets are later supplied through a
reviewed, licensed import, the renderer can be extended to opt into them
without changing the reference catalog contract.
