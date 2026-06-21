# SEIS AI Ecosystem API

This is the local FastAPI layer for the SEIS AI ecosystem. It keeps the current
repository contracts as the source of truth and exposes read-oriented API
surfaces for agents, plugin feeds, SSH safety, AI websites, goal tracking,
memory, and model connector readiness.

The service is intentionally local and contract-backed first. It does not call
model providers, mutate SSH hosts, deploy infrastructure, install plugins, or
read secrets.

## Local Run

```bash
cd <repo-root>
python3 -m venv .venv
source .venv/bin/activate
pip install -r server/ai_ecosystem_api/requirements.txt
uvicorn server.ai_ecosystem_api.app:app --reload --host 127.0.0.1 --port 4188
```

From the repository root, use:

```bash
SEIS_AI_API_DB=.local/seis-ai-ecosystem-api.sqlite3 \
  uvicorn server.ai_ecosystem_api.app:app --host 127.0.0.1 --port 4188
```

## Endpoints

- `GET /api/v1/health`
- `GET /api/v1/ecosystem`
- `GET /api/v1/agents`
- `GET /api/v1/plugins`
- `GET /api/v1/websites`
- `GET /api/v1/goals`
- `POST /api/v1/goals/local`
- `GET /api/v1/memory`
- `POST /api/v1/memory/events`
- `GET /api/v1/ssh`
- `GET /api/v1/model-connectors`
- `GET /api/v1/self-evolution`
- `GET /api/v1/knowledge-graphs`
- `GET /api/v1/ready`

## Validation

```bash
npm run check:seis-ai-ecosystem-api
```

The validation path uses dependency-free unit tests for the service and SQLite
store plus a static contract checker. FastAPI itself is installed only when you
run this API service.
