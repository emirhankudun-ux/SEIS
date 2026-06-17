# SEIS Cloud Workspace with GitHub Codespaces

Use this path when you want your development environment to be tied to GitHub
Codespaces instead of a local machine.

## 1) What is already prepared in this repo

- A repository-local container spec exists at
  [`.devcontainer/devcontainer.json`](../../.devcontainer/devcontainer.json).
- The spec uses a Node 22 + Python 3.11 container and runs `npm install` once
  after creation.
- `README.md` opens automatically when a Codespace starts.

## 2) Create a Codespace for SEIS

This command needs `codespace` scope in GitHub CLI:

```bash
gh auth refresh -h github.com -s codespace
gh codespace create --repo emirhankudun-ux/SEIS --branch main --display-name seis-cloud-primary
```

If you prefer UI:

1. Go to the SEIS repository page.
2. Open `Code` → `Codespaces` → `Create codespace on main`.
3. After it opens, the `.devcontainer` config will be applied automatically.

## 3) First command sequence inside the Codespace

```bash
cd /workspaces/SEIS
git status --short
git branch --show-current
git remote -v
```

Validate before changes:

```bash
npm run check:open-source-governance
npm run check:foundation
npm run quality
```

## 4) Daily flow

- Make changes directly in the Codespace.
- Run lane checks for your change.
- Commit and push to `main` from the cloud workspace.
- If needed, open a new thread/session without configuring anything locally.

## 5) Why this stays stable when computers change

- You continue work in the same remote project context.
- Local machine swap does not affect the active remote workspace.
- All local-only IDE state remains optional.

Keep local machine use to:

- Reading terminal outputs
- Monitoring GitHub/Codespaces status
- Quick documentation

The SEIS source truth and active environment stay in GitHub / Codespaces.
