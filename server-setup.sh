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

echo "=== Step 9: Install nginx and configure reverse proxy ==="
apt-get install -y -q nginx certbot python3-certbot-nginx

# Copy canonical nginx config from repo
cp /var/www/html/privateinhomecare/nginx/privateinhomecaregiver.conf \
   /etc/nginx/sites-available/privateinhomecaregiver.conf

# Enable site, disable default
ln -sf /etc/nginx/sites-available/privateinhomecaregiver.conf \
        /etc/nginx/sites-enabled/privateinhomecaregiver.conf
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl reload nginx
echo "nginx configured."

echo "=== Step 10: Health check ==="
sleep 6
HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health || echo "000")
echo "Health check (Node.js direct): $HTTP"
pm2 list

echo ""
echo "=== DONE ==="
echo "Next: run certbot --nginx -d privateinhomecaregiver.com -d www.privateinhomecaregiver.com"
