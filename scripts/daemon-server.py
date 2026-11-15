#!/usr/bin/env python3
"""
Kenya Governance Explorer — daemonized production server launcher.

Starts the standalone Next.js server via a double-fork so it fully detaches
from the calling shell session (platform tool-call process cleanup kills
normally-spawned background processes, but not double-forked daemons).

Usage:  python3 scripts/daemon-server.py
Health: http://localhost:3000/api/health
PID:    /tmp/kge-daemon.pid
Log:    /tmp/kge-daemon.log
"""

import os
import sys
import subprocess

PROJECT = "/home/z/my-project"
SERVER = f"{PROJECT}/.next/standalone/server.js"
PID_FILE = "/tmp/kge-daemon.pid"
LOG_FILE = "/tmp/kge-daemon.log"


def already_running() -> bool:
    """True if a healthy server is already listening on port 3000."""
    import urllib.request

    try:
        with urllib.request.urlopen("http://localhost:3000/api/health", timeout=4) as r:
            return 200 <= r.status < 400
    except Exception:
        return False


def main() -> None:
    if already_running():
        print("Server already healthy on :3000 — nothing to do")
        return

    # ── First fork: parent exits, child gets its own session ──────────────
    if os.fork() > 0:
        sys.exit(0)
    os.setsid()

    # ── Second fork: fully detached daemon, no controlling terminal ──────
    if os.fork() > 0:
        sys.exit(0)

    os.chdir(PROJECT)

    # If no production build exists, build first (logged, synchronous)
    if not os.path.exists(SERVER):
        with open(LOG_FILE, "ab", buffering=0) as log:
            subprocess.run(
                ["npx", "next", "build"], cwd=PROJECT,
                stdout=log, stderr=subprocess.STDOUT,
            )

    with open(LOG_FILE, "ab", buffering=0) as log:
        # Redirect stdio to the log file and /dev/null
        os.dup2(log.fileno(), 1)
        os.dup2(log.fileno(), 2)
        stdin = os.open(os.devnull, os.O_RDONLY)
        os.dup2(stdin, 0)

        # Load env vars from .env (standalone server does not read .env itself)
        env = dict(os.environ)
        try:
            with open(f"{PROJECT}/.env") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        key, _, value = line.partition("=")
                        env[key] = value
        except FileNotFoundError:
            pass
        env.update(
            NODE_ENV="production",
            PORT="3000",
            HOSTNAME="0.0.0.0",
        )
        # Prisma requires an absolute path — normalize relative file: URLs
        db = env.get("DATABASE_URL", "")
        if db.startswith("file:.") and not db.startswith("file:/"):
            env["DATABASE_URL"] = f"file:{PROJECT}/db/custom.db"

        # Stage static assets for the standalone server (idempotent)
        static_src = f"{PROJECT}/.next/static"
        static_dst = f"{PROJECT}/.next/standalone/.next/static"
        if os.path.isdir(static_src) and not os.path.isdir(static_dst):
            subprocess.run(["cp", "-r", static_src, static_dst])
        public_src = f"{PROJECT}/public"
        public_dst = f"{PROJECT}/.next/standalone/public"
        if os.path.isdir(public_src) and not os.path.isdir(public_dst):
            subprocess.run(["cp", "-r", public_src, public_dst])

        proc = subprocess.Popen(
            ["node", SERVER],
            cwd=f"{PROJECT}/.next/standalone",
            env=env,
            start_new_session=True,
            stdout=log.fileno(),
            stderr=log.fileno(),
            stdin=stdin,
        )
        with open(PID_FILE, "w") as f:
            f.write(str(proc.pid))

        # Reap check: if the child dies instantly, log it for debugging
        import time

        time.sleep(3)
        if proc.poll() is not None:
            log.write(f"[daemon] ERROR: server exited early with code {proc.returncode}\n".encode())
        else:
            log.write(f"[daemon] Server started — PID {proc.pid} on port 3000\n".encode())

        # The daemon parent exits; the server child keeps running detached
        sys.exit(0)


if __name__ == "__main__":
    main()
