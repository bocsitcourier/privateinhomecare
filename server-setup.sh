#!/bin/bash
# PrivateInHomeCareGiver — DigitalOcean Server Setup
# Run this as root in the DigitalOcean web console

set -e
exec > >(tee /tmp/setup.log) 2>&1

echo "=============================="
echo " Step 1: Whitelist SSH access"
echo "=============================="
fail2ban-client set sshd addignoreip 136.109.0.0/16 2>/dev/null && echo "fail2ban updated" || echo "fail2ban skip"
systemctl restart fail2ban 2>/dev/null || true

echo "=============================="
echo " Step 2: Install Node.js 20"
echo "=============================="
if node --version 2>/dev/null | grep -q "v20"; then
  echo "Node.js 20 already installed: $(node --version)"
else
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - 2>&1 | tail -3
  apt-get install -y nodejs 2>&1 | tail -5
  echo "Node.js installed: $(node --version)"
fi

echo "=============================="
echo " Step 3: Install PM2"
echo "=============================="
if pm2 --version 2>/dev/null; then
  echo "PM2 already installed"
else
  npm install -g pm2 2>&1 | tail -3
  echo "PM2 installed: $(pm2 --version)"
fi
pm2 startup systemd -u root --hp /root 2>&1 | tail -2 || true

echo "=============================="
echo " Step 4: Clone / update repo"
echo "=============================="
mkdir -p /var/www/html
if [ -d /var/www/html/privateinhomecare/.git ]; then
  echo "Repo exists — pulling latest..."
  cd /var/www/html/privateinhomecare
  git pull origin main
else
  echo "Cloning repo..."
  git clone https://github.com/bocsitcourier/privateinhomecare.git /var/www/html/privateinhomecare
  cd /var/www/html/privateinhomecare
fi

echo "=============================="
echo " Step 5: Install & build"
echo "=============================="
cd /var/www/html/privateinhomecare
npm ci 2>&1 | tail -5
npm run build 2>&1 | tail -10
echo "Build complete"

echo "=============================="
echo " Step 6: Start with PM2"
echo "=============================="
cd /var/www/html/privateinhomecare
if pm2 list | grep -q "privateinhomecare"; then
  pm2 reload ecosystem.config.cjs --env production --update-env
else
  pm2 start ecosystem.config.cjs --env production
fi
pm2 save
echo "PM2 started"

echo "=============================="
echo " Step 7: Health check"
echo "=============================="
sleep 6
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health 2>/dev/null || echo "000")
echo "Health check HTTP: $STATUS"
pm2 list

echo ""
echo "=============================="
echo " DONE — Setup complete!"
echo "=============================="
