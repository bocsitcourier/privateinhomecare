#!/bin/bash
# PrivateInHomeCareGiver — DigitalOcean Server Setup (nvm method)
set -e
exec > >(tee /tmp/setup.log) 2>&1

echo "=== Step 1: Update apt ==="
apt-get update -q

echo "=== Step 2: Install prerequisites ==="
apt-get install -y -q git curl build-essential

echo "=== Step 3: Install Node.js 20 via nvm ==="
export NVM_DIR="/root/.nvm"
if [ ! -d "$NVM_DIR" ]; then
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi
source "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20
nvm alias default 20
node --version
npm --version

echo "=== Step 4: Install PM2 ==="
npm install -g pm2
pm2 --version
pm2 startup systemd -u root --hp /root 2>&1 | tail -3 || true

echo "=== Step 5: Clone or update repo ==="
mkdir -p /var/www/html
if [ -d /var/www/html/privateinhomecare/.git ]; then
  echo "Repo exists, pulling..."
  cd /var/www/html/privateinhomecare
  git pull origin main
else
  git clone https://github.com/bocsitcourier/privateinhomecare.git /var/www/html/privateinhomecare
  cd /var/www/html/privateinhomecare
fi

echo "=== Step 6: Install dependencies and build ==="
cd /var/www/html/privateinhomecare
npm ci
npm run build

echo "=== Step 7: Make nvm available system-wide for PM2 ==="
ln -sf "$NVM_DIR/versions/node/$(nvm current)/bin/node" /usr/local/bin/node
ln -sf "$NVM_DIR/versions/node/$(nvm current)/bin/npm" /usr/local/bin/npm
ln -sf "$NVM_DIR/versions/node/$(nvm current)/bin/pm2" /usr/local/bin/pm2

echo "=== Step 8: Start app with PM2 ==="
cd /var/www/html/privateinhomecare
pm2 delete privateinhomecare 2>/dev/null || true
pm2 start ecosystem.config.cjs --env production
pm2 save

echo "=== Step 9: Install nginx ==="
apt-get install -y -q nginx certbot python3-certbot-nginx

# Phase 1: HTTP-only config (works before SSL certs exist)
cp /var/www/html/privateinhomecare/nginx/privateinhomecaregiver-http.conf \
   /etc/nginx/sites-available/privateinhomecaregiver.conf
ln -sf /etc/nginx/sites-available/privateinhomecaregiver.conf \
        /etc/nginx/sites-enabled/privateinhomecaregiver.conf
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
echo "nginx (HTTP-only) configured and running."

echo "=== Step 10: Obtain SSL certificate ==="
CERT_OK=0
certbot --nginx \
  -d privateinhomecaregiver.com \
  -d www.privateinhomecaregiver.com \
  --non-interactive --agree-tos -m admin@privateinhomecaregiver.com \
  && CERT_OK=1 \
  || echo "WARNING: certbot failed (DNS not propagated yet, rate limit, or ACME issue). Site will run HTTP-only. Re-run: certbot --nginx -d privateinhomecaregiver.com -d www.privateinhomecaregiver.com --non-interactive --agree-tos -m admin@privateinhomecaregiver.com"

if [ "$CERT_OK" -eq 1 ]; then
  echo "SSL certificate issued successfully."
  # Phase 2: Replace with full SSL + HTTP/2 config
  cp /var/www/html/privateinhomecare/nginx/privateinhomecaregiver.conf \
     /etc/nginx/sites-available/privateinhomecaregiver.conf
  nginx -t && systemctl reload nginx
  echo "nginx (SSL + HTTP/2) configured."
else
  echo "Skipping SSL nginx config — HTTP-only config remains active."
fi

echo "=== Step 11: Post-provision smoke tests ==="
sleep 6

echo "--- nginx config test ---"
nginx -t

echo "--- Node.js health check (direct) ---"
HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5000/api/health || echo "000")
echo "Node.js /api/health: $HTTP"
if [ "$HTTP" != "200" ]; then
  echo "WARNING: Node.js health check returned $HTTP — check pm2 logs"
fi

echo "--- nginx HTTP check ---"
NGINX_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/ || echo "000")
echo "nginx HTTP /: $NGINX_HTTP"

if [ "$CERT_OK" -eq 1 ]; then
  echo "--- HTTPS external check ---"
  HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://privateinhomecaregiver.com/api/health || echo "000")
  echo "HTTPS /api/health: $HTTPS_CODE"
fi

pm2 list

echo ""
echo "=== DONE ==="
if [ "$CERT_OK" -eq 1 ]; then
  echo "Site is live at https://privateinhomecaregiver.com"
else
  echo "Site is running HTTP-only at http://privateinhomecaregiver.com"
  echo "To complete SSL setup, run: certbot --nginx -d privateinhomecaregiver.com -d www.privateinhomecaregiver.com --non-interactive --agree-tos -m admin@privateinhomecaregiver.com"
fi
