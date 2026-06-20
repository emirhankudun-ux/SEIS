#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOST="${SEIS_AI_DEMO_HOST:-127.0.0.1}"
PORT="${SEIS_AI_DEMO_PORT:-4177}"
URL="http://$HOST:$PORT/apps/seis-ai-demo/"
SERVER_PID=""

cleanup() {
  if [[ -n "$SERVER_PID" ]]; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT TERM

if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "SEIS AI web demo server already listening on $HOST:$PORT"
else
  echo "Starting SEIS AI web demo server on $HOST:$PORT"
  (
    cd "$ROOT_DIR"
    python3 -m http.server "$PORT" --bind "$HOST"
  ) &
  SERVER_PID="$!"
  sleep 1
fi

echo "Opening web companion: $URL"
/usr/bin/open "$URL"

echo "Opening macOS app: SEIS AI Command Core"
"$ROOT_DIR/script/build_and_run.sh" --ai-demo

if [[ -n "$SERVER_PID" ]]; then
  echo "Web companion is running. Press Ctrl-C to stop the local server."
  wait "$SERVER_PID"
else
  echo "Using existing web companion server. Stop it from its original terminal when finished."
fi
