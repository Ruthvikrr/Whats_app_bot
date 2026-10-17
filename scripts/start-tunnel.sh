#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

# Read PORT from .env, default to 3005 if not found
PORT=$(grep -E '^\s*PORT=' .env 2>/dev/null | cut -d '=' -f 2 | tr -d ' "\r\n')
if [ -z "$PORT" ]; then
  PORT=3005
fi

echo "Starting Cloudflare Tunnel for Triuss Bot on port $PORT..."
# Log cloudflared output to both terminal and local tunnel.log
exec cloudflared tunnel --url "http://127.0.0.1:$PORT" 2>&1 | tee "$DIR/tunnel.log"
