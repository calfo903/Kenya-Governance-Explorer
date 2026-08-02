#!/bin/bash
while true; do
  echo "[$(date)] Starting server..."
  node .next/standalone/server.js 2>&1
  EXIT=$?
  echo "[$(date)] Server exited with code $EXIT, restarting in 3s..."
  sleep 3
done
