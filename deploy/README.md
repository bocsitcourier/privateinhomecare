# Production Deploy — Digital Ocean Droplet

The production site `privateinhomecaregiver.com` runs on a single Digital
Ocean droplet (1 vCPU / 1 GB RAM, Ubuntu 22.04+) behind nginx that proxies
to a Node.js process on `127.0.0.1:5000`.

## Architecture

```
Internet ──HTTPS──► nginx (TLS terminator)
                     │
                     ├── /assets/, /attached_assets/, /uploads/   → static files
                     │
                     └── everything else → http://127.0.0.1:5000  → Node (systemd)
```

- **nginx config**: source-of-truth lives at `nginx/privateinhomecaregiver.conf`.
  Deployed copy: `/etc/nginx/sites-available/privateinhomecaregiver.conf`.
- **Node service**: source-of-truth systemd unit lives at
  `deploy/privateinhomecare.service`. Deployed copy:
  `/etc/systemd/system/privateinhomecare.service`.
- **Environment**: `/etc/privateinhomecare.env` (mode 600, root-owned).

## One-time setup (or recovery from PM2)

SSH into the droplet, then run **once**:

```bash
cd /var/www/html/privateinhomecare
git pull origin main
sudo bash deploy/install-systemd.sh
```

That script:

1. Stops + uninstalls PM2 (if present) so it doesn't fight systemd.
2. Verifies `/etc/privateinhomecare.env` exists (copies from `.env` if not).
3. Installs and enables the systemd unit (`Restart=always`, boot persistence).
4. Starts the service and runs a 30-second health check loop.

After this, the Node process will:
- Restart automatically on crash (`Restart=always`, `RestartSec=5`).
- Restart automatically on droplet reboot (`WantedBy=multi-user.target`).
- Log to journald (view with `journalctl -u privateinhomecare -f`).

## Routine deploys

After the one-time setup, deploys run from this Replit workspace via:

```bash
bash scripts/do-deploy.sh
```

That script:

1. Pushes the current branch + `main` to GitHub.
2. SSHes into the droplet, pulls, runs `npm ci` + `npm run build`.
3. Updates `/etc/nginx/sites-available/privateinhomecaregiver.conf`
   from the repo, runs `nginx -t`, reloads nginx.
4. Restarts the systemd service.
5. Polls `http://127.0.0.1:5000/api/health` for up to 30 s — fails
   loudly if the new build doesn't come up.

If the build fails (e.g. OOM during Vite), `set -euo pipefail` aborts
the script *before* the service restart, so the previously running
Node process keeps serving traffic.

## Diagnostics — when the site returns 502

Run on the droplet, in this order:

```bash
sudo systemctl status privateinhomecare --no-pager
sudo journalctl -u privateinhomecare -n 200 --no-pager
ss -ltnp | grep :5000
curl -i http://127.0.0.1:5000/api/health
sudo nginx -t && sudo systemctl status nginx --no-pager
free -m && df -h
sudo dmesg -T | egrep -i "killed process|out of memory" | tail
ls -lah /var/www/html/privateinhomecare/dist /var/www/html/privateinhomecare/dist/public
```

If `dist/` or `dist/public/` is missing, the last build failed. Recover with:

```bash
cd /var/www/html/privateinhomecare
NODE_OPTIONS="--max-old-space-size=768" npm run build
sudo systemctl restart privateinhomecare
```

## Rollback

```bash
cd /var/www/html/privateinhomecare
git log --oneline -10        # find the last good SHA
git checkout <sha>
NODE_OPTIONS="--max-old-space-size=768" npm run build
sudo systemctl restart privateinhomecare
```

## Known follow-ups

These are tracked durability improvements that are NOT yet implemented and
require an operational change window on the droplet:

- **Switch the systemd service from `User=root` to a dedicated `privateinhomecare`
  service user.** Requires chowning `/var/www/html/privateinhomecare`, `uploads/`,
  and `attached_assets/` to the new user, and re-running
  `deploy/install-systemd.sh` after editing the unit. Until this is done, an
  app-process compromise is a host-level compromise.
- **Release-directory + symlink atomic deploys.** The current flow snapshots
  `dist/` before each build and rolls back if the build fails, but does not
  yet auto-rollback if a post-restart health check fails. To get full
  point-in-time rollback, switch to a `releases/<sha>/` + `current` symlink
  layout and have the deploy script flip the symlink + restart only after
  health passes; on failure, flip back and restart.
