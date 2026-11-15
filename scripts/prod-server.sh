#!/usr/bin/env bash
# Kenya Governance Explorer — production server launcher
#
# Runs the standalone Next.js production build instead of the Turbopack dev
# server. The platform's container boot calls `bun run dev` (see
# .zscripts/dev.sh), which invokes this script — so the app auto-restarts
# with the production server on every container recycle.
#
# Fallback: if no production build exists (and a build fails), falls back
# to the Turbopack dev server so the preview is never left dark.

set -u
cd /home/z/my-project

LOG=/tmp/kge-server.log
STANDALONE=/home/z/my-project/.next/standalone/server.js

# ── Load environment (standalone server.js does NOT read .env itself) ──
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source <(grep -E '^[A-Za-z_]+=' .env | sed 's/\r$//')
  set +a
fi
export NODE_ENV=production
export PORT="${PORT:-3000}"
export HOSTNAME="${HOSTNAME:-0.0.0.0}"
# Prisma needs an absolute path — normalize a relative file: URL
case "$DATABASE_URL" in
  file:./dev.db|file:dev.db|file:./*)
    export DATABASE_URL="file:/home/z/my-project/db/custom.db" ;;
esac

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG"; }

# ── Build if the standalone output is missing ─────────────────────────
if [ ! -f "$STANDALONE" ]; then
  log "No standalone build found — building now"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Building production bundle..."
  npx next build >> "$LOG" 2>&1
fi

# ── Stage static assets for the standalone server (idempotent) ────────
if [ -f "$STANDALONE" ]; then
  mkdir -p .next/standalone/.next
  [ -d .next/static ] && cp -r .next/static .next/standalone/.next/ 2>/dev/null
  [ -d public ] && cp -r public .next/standalone/ 2>/dev/null

  # Mirror to next-service-dist so the platform's start.sh can also use it
  mkdir -p next-service-dist
  cp -r .next/standalone/. next-service-dist/ 2>/dev/null
  [ -d .next/static ] && cp -r .next/static next-service-dist/.next/ 2>/dev/null
  [ -d public ] && cp -r public next-service-dist/ 2>/dev/null

  log "Starting standalone production server on port $PORT"
  exec node "$STANDALONE"
else
  # Build failed — last-resort fallback to the dev server
  log "WARN: build unavailable — falling back to next dev"
  exec npx next dev -p "$PORT" --turbopack
fi
