#!/bin/bash
# One-time installer to switch the production droplet from PM2 to systemd.
# Run this ONCE on the Digital Ocean droplet (as root) after pulling the latest code.
#
# What it does:
#   1. Stops + disables PM2 if it's running (so it doesn't fight systemd).
#   2. Builds /etc/privateinhomecare.env from the existing PM2 / dotenv config.
#   3. Installs deploy/privateinhomecare.service to /etc/systemd/system/.
#   4. Enables it (boot persistence) and starts it.
#   5. Runs a health check.
#
# Re-running this script is safe — it overwrites the systemd unit and
# restarts the service.

set -euo pipefail

APP_DIR="/var/www/html/privateinhomecare"
ENV_FILE="/etc/privateinhomecare.env"
UNIT_SRC="$APP_DIR/deploy/privateinhomecare.service"
UNIT_DST="/etc/systemd/system/privateinhomecare.service"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "ERROR: run as root (sudo bash deploy/install-systemd.sh)" >&2
  exit 1
fi

echo "=== 1. Stop + disable PM2 (if present) ==="
if command -v pm2 >/dev/null 2>&1; then
  pm2 delete privateinhomecare 2>/dev/null || true
  pm2 unstartup systemd 2>/dev/null || true
  pm2 kill 2>/dev/null || true
  echo "PM2 stopped."
else
  echo "PM2 not installed — skipping."
fi

echo ""
echo "=== 2. Ensure $ENV_FILE exists ==="
if [[ ! -f "$ENV_FILE" ]]; then
  if [[ -f "$APP_DIR/.env" ]]; then
    echo "Copying $APP_DIR/.env -> $ENV_FILE"
    install -m 600 -o root -g root "$APP_DIR/.env" "$ENV_FILE"
  else
    cat >&2 <<EOF
ERROR: $ENV_FILE does not exist and $APP_DIR/.env was not found.

Create $ENV_FILE manually with the production environment variables, e.g.:

  NODE_ENV=production
  PORT=5000
  DATABASE_URL=...
  SESSION_SECRET=...
  GOOGLE_PLACES_API_KEY=...
  GEMINI_API_KEY=...
  RESEND_API_KEY=...
  RECAPTCHA_SECRET_KEY=...
  VITE_RECAPTCHA_SITE_KEY=...
  PHI_ENCRYPTION_KEY=...
  HR_EMAIL=...
  FROM_EMAIL=...
  ENABLE_GEO_BLOCKING=true
  TRUSTED_PROXY_HEADER=1

Then re-run this script. File mode must be 600 (root only).
EOF
    exit 1
  fi
fi
chmod 600 "$ENV_FILE"
chown root:root "$ENV_FILE"
echo "$ENV_FILE OK (mode 600)."

echo ""
echo "=== 3. Install systemd unit ==="
cp "$UNIT_SRC" "$UNIT_DST"
systemctl daemon-reload
echo "Unit installed: $UNIT_DST"

echo ""
echo "=== 4. Enable + start ==="
systemctl enable privateinhomecare
systemctl restart privateinhomecare

echo ""
echo "=== 5. Health check ==="
for i in 1 2 3 4 5 6; do
  sleep 5
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5000/api/health || echo "000")
  echo "  attempt $i: HTTP $HTTP"
  if [[ "$HTTP" == "200" ]]; then
    echo ""
    echo "SUCCESS — privateinhomecare is now running under systemd."
    echo ""
    systemctl status privateinhomecare --no-pager -n 10 || true
    exit 0
  fi
done

echo ""
echo "ERROR: Health check failed after 30s. Inspect logs:" >&2
echo "  journalctl -u privateinhomecare -n 100 --no-pager" >&2
systemctl status privateinhomecare --no-pager -n 20 >&2 || true
exit 1
