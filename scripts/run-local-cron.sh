#!/usr/bin/env bash
# Headless local CheapShark sync:
#   1. Start Next on PORT (default 3000)
#   2. Wait until it responds
#   3. Run cron-local (CheapShark)
#   4. Shut the server down
#
# Usage:
#   ./scripts/run-local-cron.sh
#   PORT=3001 ./scripts/run-local-cron.sh
#   FORCE_BUILD=1 ./scripts/run-local-cron.sh   # rebuild before start
#
# Schedule via LaunchAgent:
#   ./scripts/install-local-cron-launchd.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PORT="${PORT:-3000}"
BASE_URL="http://127.0.0.1:${PORT}"
LOG_DIR="${HOME}/Library/Logs/gamesunder10"
mkdir -p "$LOG_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
RUN_LOG="${LOG_DIR}/local-cron-${STAMP}.log"
SERVER_LOG="${LOG_DIR}/next-${STAMP}.log"
SERVER_PID=""

log() {
  local line="[$(date '+%Y-%m-%d %H:%M:%S')] $*"
  echo "$line" | tee -a "$RUN_LOG"
}

die() {
  log "ERROR: $*"
  exit 1
}

pick_pm() {
  if command -v pnpm >/dev/null 2>&1; then
    echo "pnpm"
  elif command -v npm >/dev/null 2>&1; then
    echo "npm"
  else
    die "Need pnpm or npm on PATH"
  fi
}

pm_run() {
  local pm="$1"
  shift
  if [[ "$pm" == "pnpm" ]]; then
    pnpm run "$@"
  else
    npm run "$@"
  fi
}

cleanup() {
  local code=$?
  if [[ -n "${SERVER_PID}" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    log "Stopping Next (pid ${SERVER_PID})…"
    kill "$SERVER_PID" 2>/dev/null || true
    # Give it a moment, then force if needed
    for _ in 1 2 3 4 5; do
      if ! kill -0 "$SERVER_PID" 2>/dev/null; then
        break
      fi
      sleep 1
    done
    if kill -0 "$SERVER_PID" 2>/dev/null; then
      kill -9 "$SERVER_PID" 2>/dev/null || true
    fi
    wait "$SERVER_PID" 2>/dev/null || true
    log "Next stopped"
  fi
  exit "$code"
}

trap cleanup EXIT INT TERM

if [[ ! -f .env.local ]]; then
  die "Missing .env.local in ${ROOT}"
fi

if curl -sf --max-time 2 "${BASE_URL}/" >/dev/null 2>&1; then
  die "Something already responds on ${BASE_URL} — stop it or set PORT=…"
fi

PM="$(pick_pm)"
log "Repo:  ${ROOT}"
log "PM:    ${PM}"
log "URL:   ${BASE_URL}"
log "Logs:  ${RUN_LOG}"

if [[ "${FORCE_BUILD:-0}" == "1" ]] || [[ ! -d .next ]]; then
  log "Building Next (FORCE_BUILD=${FORCE_BUILD:-0}, .next missing=$([[ -d .next ]] && echo no || echo yes))…"
  pm_run "$PM" build >>"$SERVER_LOG" 2>&1 \
    || die "next build failed — see ${SERVER_LOG}"
fi

log "Starting Next (headless: next start)…"
# Production server: quieter/faster than `dev` for a short-lived cron window.
PORT="$PORT" pm_run "$PM" start >>"$SERVER_LOG" 2>&1 &
SERVER_PID=$!
log "Next pid ${SERVER_PID} (server log: ${SERVER_LOG})"

READY=0
for i in $(seq 1 90); do
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    die "Next exited early — see ${SERVER_LOG}"
  fi
  if curl -sf --max-time 2 "${BASE_URL}/" >/dev/null 2>&1; then
    READY=1
    break
  fi
  sleep 1
done

if [[ "$READY" -ne 1 ]]; then
  die "Next did not become ready on ${BASE_URL} within 90s — see ${SERVER_LOG}"
fi

log "Next is up — running cron-local…"
set +e
pm_run "$PM" cron-local >>"$RUN_LOG" 2>&1
CRON_EXIT=$?
set -e

if [[ "$CRON_EXIT" -ne 0 ]]; then
  die "cron-local exited ${CRON_EXIT} — see ${RUN_LOG}"
fi

log "cron-local finished OK"
# cleanup trap shuts down Next
exit 0
