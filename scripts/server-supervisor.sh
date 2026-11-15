#!/usr/bin/env bash
# Kenya Governance Explorer — self-healing production server supervisor
# Restarts `next start` automatically if it dies or stops responding.
# Usage: nohup bash scripts/server-supervisor.sh > /tmp/kge-supervisor.log 2>&1 &

PORT=3000
APP_DIR="/home/z/my-project"
HEALTH_URL="http://localhost:${PORT}/api/health"
CHECK_INTERVAL=30     # seconds between health checks
MAX_LOG_SIZE=1048576 # 1 MB — rotate logs to keep /tmp usage bounded

start_server() {
  cd "$APP_DIR" || exit 1
  # next start on the same port; standalone warning is cosmetic
  NODE_ENV=production npx next start -p "$PORT" >> /tmp/kge-server.log 2>&1 &
  SERVER_PID=$!
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Server started (PID $SERVER_PID)"
}

is_healthy() {
  # curl: 5s timeout, fail on HTTP >= 400
  curl -s -o /dev/null -m 5 -w '%{http_code}' "$HEALTH_URL" 2>/dev/null | grep -q '^2\|^3'
}

rotate_log() {
  local log=$1
  if [ -f "$log" ] && [ "$(stat -c%s "$log" 2>/dev/null || echo 0)" -gt "$MAX_LOG_SIZE" ]; then
    : > "$log" # truncate — keep it simple and bounded
  fi
}

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Supervisor starting — managing app on port $PORT"

start_server

while true; do
  sleep "$CHECK_INTERVAL"

  rotate_log /tmp/kge-server.log
  rotate_log /tmp/kge-supervisor.log

  if ! is_healthy; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Health check FAILED — restarting server"
    # Kill any stale next processes bound to our port
    pkill -f "next start -p $PORT" 2>/dev/null
    sleep 2
    # Also clear anything squatting on the port
    if command -v fuser >/dev/null 2>&1; then
      fuser -k "$PORT"/tcp 2>/dev/null
    fi
    sleep 1
    # Rebuild only if the .next directory is missing entirely (reset case)
    if [ ! -f "$APP_DIR/.next/BUILD_ID" ]; then
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] No build found — rebuilding"
      cd "$APP_DIR" && npx next build >> /tmp/kge-server.log 2>&1
    fi
    start_server
    sleep 10
    if is_healthy; then
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] Restart SUCCESSFUL"
    else
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] Restart FAILED — will retry next cycle"
    fi
  fi
done
