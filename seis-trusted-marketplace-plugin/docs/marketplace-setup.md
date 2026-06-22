# Marketplace Setup

The private personal marketplace is the active integration path.

## Active Personal Marketplace

- Marketplace name: `personal`
- Marketplace file: `/Users/emirhan/.agents/plugins/marketplace.json`
- Plugin source: `/Users/emirhan/plugins/seis-trusted-marketplace`
- Install command: `codex plugin add seis-trusted-marketplace@personal`

## Example Entry

See `examples/personal-marketplace.example.json`.

The entry must include:

- `policy.installation`
- `policy.authentication`
- `category`

For this plugin, keep `policy.authentication` as `ON_INSTALL` because the plugin
is a workflow and governance package, not a live external connector.
