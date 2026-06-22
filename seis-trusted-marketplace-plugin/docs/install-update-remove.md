# Install, Update, and Remove

This plugin is currently intended as a private personal Codex plugin.

## Install

```bash
codex plugin add seis-trusted-marketplace@personal
```

The personal marketplace entry is represented by
`examples/personal-marketplace.example.json`. The live personal marketplace file
is `/Users/emirhan/.agents/plugins/marketplace.json`.

## Update

After editing the plugin source, bump the cachebuster version, validate, and
reinstall:

```bash
python3 /Users/emirhan/.codex/skills/.system/plugin-creator/scripts/update_plugin_cachebuster.py /Users/emirhan/plugins/seis-trusted-marketplace
npm run validate
python3 /Users/emirhan/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py /Users/emirhan/plugins/seis-trusted-marketplace
codex plugin add seis-trusted-marketplace@personal
```

## Remove

Use Codex plugin management to disable or remove the plugin from the personal
marketplace. Do not delete repo contracts from `UIXAppTTR` until the replacement
plugin source is documented.

## Safety Notes

- Do not store tokens, API keys, or passwords in this repository.
- Keep private absolute paths out of future public release examples.
- Treat public publication as a separate review step from private personal use.
