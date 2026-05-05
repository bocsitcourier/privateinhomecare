#!/bin/bash
# Deploy latest code to Digital Ocean server.
# Usage: bash scripts/do-deploy.sh [--skip-build]
#
# Flow:
#   1. Push current branch + main to GitHub.
#   2. SSH into the server, pull latest, install deps, build, update nginx, reload PM2.
#   3. Verify the server is running the correct commit and passes a health check.
#
# Environment variables required:
#   GITHUB_PERSONAL_ACCESS_TOKEN  — for push-github.sh
#   DO_ROOT_PASSWORD              — root password for production server
#
# Security note: This script uses password-based SSH (sshpass + StrictHostKeyChecking=no).
# This is a known risk in the current environment where no SSH deploy key has been
# provisioned. To harden before routine use:
#   1. Add an SSH key pair: ssh-keygen -t ed25519 -C "deploy"
#   2. Append the public key to /root/.ssh/authorized_keys on the server.
#   3. Store the private key as a secret (e.g. DO_DEPLOY_KEY).
#   4. Replace sshpass invocations with: ssh -i "$DO_DEPLOY_KEY_PATH" ...
#   5. Remove StrictHostKeyChecking=no and use -o KnownHostsFile=... with a pinned key.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SERVER_IP="174.138.88.127"
SERVER_USER="root"
SERVER_APP_DIR="/var/www/html/privateinhomecare"
SKIP_BUILD=false

if [[ "${1:-}" == "--skip-build" ]]; then
  SKIP_BUILD=true
  echo "WARNING: --skip-build flag set; server rebuild will be skipped."
fi

# Shared SSH options
SSH_OPTS=(-o StrictHostKeyChecking=no -o ConnectTimeout=60)

ssh_cmd() {
  sshpass -p "$DO_ROOT_PASSWORD" ssh "${SSH_OPTS[@]}" "${SERVER_USER}@${SERVER_IP}" "$@"
}

scp_cmd() {
  sshpass -p "$DO_ROOT_PASSWORD" scp "${SSH_OPTS[@]}" "$@"
}

# ── Step 1: Push to GitHub ────────────────────────────────────────────────────
echo "=== Step 1: Push to GitHub ==="
bash "$SCRIPT_DIR/push-github.sh"
LOCAL_SHA=$(git rev-parse HEAD)
echo "Local HEAD: $LOCAL_SHA"

# ── Step 2: Pull on server, verify SHA, build if needed ──────────────────────
echo ""
echo "=== Step 2: Server update ($SERVER_IP) ==="

# Write the remote script to a temp file and SCP it to the server.
TMPSCRIPT=$(mktemp /tmp/server-update-XXXX.sh)
trap 'rm -f "$TMPSCRIPT"' EXIT

cat > "$TMPSCRIPT" << REMOTE_SCRIPT
#!/bin/bash
set -euo pipefail
LOCAL_SHA="${LOCAL_SHA}"
SKIP_BUILD="${SKIP_BUILD}"
APP_DIR="${SERVER_APP_DIR}"

echo "--- $(date): Starting server update ---"
cd "\$APP_DIR"

echo "--- git pull ---"
git pull origin main

CURRENT_SHA=\$(git rev-parse HEAD)
echo "Server HEAD after pull: \$CURRENT_SHA"

# Verify the server has the commit we just pushed (may be ancestor if server is ahead).
if git merge-base --is-ancestor "\$LOCAL_SHA" "\$CURRENT_SHA"; then
  echo "OK: Server commit (\$CURRENT_SHA) includes pushed SHA (\$LOCAL_SHA)."
else
  echo "ERROR: Server SHA \$CURRENT_SHA does not contain \$LOCAL_SHA." >&2
  exit 1
fi

if [ "\$SKIP_BUILD" = "false" ]; then
  echo "--- npm ci ---"
  npm ci

  # Snapshot the previous build so a failed/partial build can be rolled back.
  # Vite writes into dist/ in-place; if the build dies mid-write the running
  # Node process can serve a half-written dist/public, breaking the live site
  # even though we never restarted the service.
  if [ -d dist ]; then
    rm -rf dist.prev
    cp -a dist dist.prev
    echo "--- snapshotted previous dist -> dist.prev ---"
  fi

  echo "--- npm run build (with extra heap for 1GB server) ---"
  if NODE_OPTIONS="--max-old-space-size=768" npm run build; then
    echo "--- build OK; removing dist.prev ---"
    rm -rf dist.prev
  else
    BUILD_RC=\$?
    echo "ERROR: build failed (exit \$BUILD_RC)." >&2
    if [ -d dist.prev ]; then
      echo "Rolling back dist/ to previous snapshot..." >&2
      rm -rf dist
      mv dist.prev dist
      echo "Rollback complete; live process keeps serving previous build." >&2
    fi
    exit \$BUILD_RC
  fi
fi

echo "--- update nginx config ---"
cp nginx/privateinhomecaregiver.conf /etc/nginx/sites-available/privateinhomecaregiver.conf
nginx -t
systemctl reload nginx
echo "nginx reloaded"

echo "--- restart application ---"
# Prefer systemd (deploy/install-systemd.sh); fall back to PM2 for legacy droplets.
if systemctl list-unit-files | grep -q '^privateinhomecare\.service'; then
  echo "Using systemd."
  systemctl restart privateinhomecare
  SUPERVISOR="systemd"
else
  echo "Using PM2 (legacy)."
  pm2 reload privateinhomecare
  pm2 save
  SUPERVISOR="pm2"
fi

echo "--- health check (up to 30s) ---"
HTTP="000"
for i in 1 2 3 4 5 6; do
  sleep 5
  HTTP=\$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5000/api/health || echo "000")
  echo "  attempt \$i: HTTP \$HTTP"
  [ "\$HTTP" = "200" ] && break
done
if [ "\$HTTP" != "200" ]; then
  echo "ERROR: Health check returned \$HTTP after 30s (expected 200)." >&2
  if [ "\$SUPERVISOR" = "systemd" ]; then
    journalctl -u privateinhomecare -n 100 --no-pager >&2 || true
  else
    pm2 logs privateinhomecare --lines 50 --nostream >&2 || pm2 list >&2
  fi
  exit 1
fi

if [ "\$SUPERVISOR" = "systemd" ]; then
  systemctl status privateinhomecare --no-pager -n 10 || true
else
  pm2 list || true
fi
echo "--- \$(date): Server update DONE ---"
REMOTE_SCRIPT

echo "Copying update script to server..."
scp_cmd "$TMPSCRIPT" "${SERVER_USER}@${SERVER_IP}:/tmp/server-update.sh"

echo "Running update on server (npm install + build may take several minutes)..."
ssh_cmd 'bash /tmp/server-update.sh'

# ── Step 3: Final verification ────────────────────────────────────────────────
echo ""
echo "=== Step 3: Final verification ==="
REMOTE_SHA=$(ssh_cmd "git -C $SERVER_APP_DIR rev-parse HEAD")
echo "Remote HEAD: $REMOTE_SHA"
echo "Local  HEAD: $LOCAL_SHA"

if git merge-base --is-ancestor "$LOCAL_SHA" "$REMOTE_SHA"; then
  echo "OK: Live server includes pushed commit."
else
  echo "ERROR: SHA mismatch — deployment may be incomplete." >&2
  exit 1
fi

echo ""
echo "=== Deployment complete! ==="
echo "Site: https://privateinhomecaregiver.com"
echo "Commit: $LOCAL_SHA"
