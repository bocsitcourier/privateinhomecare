# Digital Ocean Deployment Guide

Complete guide to deploying Private InHome CareGiver platform to Digital Ocean App Platform.

## 📋 Pre-Deployment Checklist

### Critical Security Tasks

- [ ] **Enable RLS on Supabase** (CRITICAL!)
  - Run `server/enable-rls.sql` in Supabase SQL Editor
  - Verify all 12 tables have RLS enabled
  - This MUST be done before deployment

- [ ] **Enable Database Backups**
  - Supabase: Configure PITR (Point-in-Time Recovery)
  - Recommended retention: 7-30 days

- [ ] **Switch to DbStorage**
  - Edit `server/storage.ts`:
    ```typescript
    export const storage = new DbStorage();
    // export const storage = new MemStorage();
    ```

### Application Preparation

- [ ] **Test Locally**
  - Run `npm run dev`
  - Test all forms, admin dashboard, file uploads
  - Verify no console errors

- [ ] **Environment Variables**
  - Document all required environment variables (see section below)
  - Prepare secrets for Digital Ocean

- [ ] **Build Configuration**
  - Ensure `package.json` has correct build scripts
  - Test production build locally

---

## 🏗️ Deployment Option: Digital Ocean App Platform

**Recommended** for healthcare applications with HIPAA requirements.

### Why App Platform?

✅ **Automatic SSL/HTTPS** - Required for HIPAA  
✅ **Managed Infrastructure** - Zero server management  
✅ **Auto-deployment** - Push to GitHub triggers deploy  
✅ **CDN Included** - Fast global delivery  
✅ **Auto-scaling** - Handles traffic spikes  
✅ **Built-in monitoring** - Logs and metrics included  

### Pricing

- **Backend (Node.js)**: $5-12/month (Basic: 512MB RAM)
- **Frontend (Static)**: $0-3/month (3 free apps, then $3/month)
- **Estimated Total**: ~$5-15/month for production

---

## 🌐 Nginx Reverse Proxy Configuration

The canonical nginx config is stored at `nginx/privateinhomecaregiver.conf` in the repo and is installed automatically by `server-setup.sh`.

### Key Design Decisions

| Decision | Reason |
|---|---|
| `proxy_pass http://127.0.0.1:5000` | **Must use `127.0.0.1`, NOT `localhost`**. On Ubuntu 22.04+ `localhost` resolves to IPv6 `[::1]`, but Node.js listens on IPv4 only — causing 502 errors. |
| Static files served by nginx | `/assets/`, `/attached_assets/`, `/uploads/`, `/videos/`, `/thumbnails/` are served directly from disk for performance. Node.js never sees these requests. |
| `/assets/` — 1-year cache | Vite builds hashed filenames (e.g. `main-abc123.js`). These never change, so `Cache-Control: immutable` is safe. |
| `/attached_assets/` — 30-day cache | AI-generated article images. Long-lived but may be refreshed occasionally. |
| HTTP/2 | Enabled via `listen 443 ssl http2`. Multiplexes asset requests for faster page loads. |
| Gzip | `text/css`, `application/javascript`, `application/json`, and SVGs are compressed. Images are already compressed and excluded. |

### Two-Phase Setup (handled automatically by server-setup.sh)

SSL certificates must exist before nginx can validate an HTTPS config. `server-setup.sh` handles this automatically in two phases:

**Phase 1 — HTTP-only** (nginx starts immediately, no certs needed):
```bash
cp nginx/privateinhomecaregiver-http.conf /etc/nginx/sites-available/privateinhomecaregiver.conf
ln -sf /etc/nginx/sites-available/privateinhomecaregiver.conf /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

**Phase 2 — Issue SSL cert, then switch to HTTPS config**:
```bash
certbot --nginx -d privateinhomecaregiver.com -d www.privateinhomecaregiver.com \
  --non-interactive --agree-tos -m admin@privateinhomecaregiver.com

cp nginx/privateinhomecaregiver.conf /etc/nginx/sites-available/privateinhomecaregiver.conf
nginx -t && systemctl reload nginx
```

### Manual Install (if not using server-setup.sh)

Follow the two phases above in order. Never run `nginx -t` against the SSL config (`privateinhomecaregiver.conf`) until certbot has issued the certificate.


### Updating the Config

1. Edit `nginx/privateinhomecaregiver.conf` in the repo and push.
2. On the server: `git pull && cp nginx/privateinhomecaregiver.conf /etc/nginx/sites-available/privateinhomecaregiver.conf && nginx -t && systemctl reload nginx`

---

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Repository

#### 1.1 Push Code to GitHub

If not already on GitHub:

```bash
# Initialize git (if not already done)
git init

# Create .gitignore (already exists)
# Verify uploads/, .env, node_modules are ignored

# Add all files
git add .

# Commit
git commit -m "Prepare for Digital Ocean deployment"

# Create GitHub repository (via GitHub.com)
# Then add remote:
git remote add origin https://github.com/your-username/your-repo.git
git branch -M main
git push -u origin main
```

#### 1.2 Verify `package.json` Build Scripts

Your root `package.json` has the correct scripts:

```json
{
  "name": "rest-express",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "db:push": "drizzle-kit push"
  }
}
```

**What each script does:**
- `build`: Builds frontend (Vite) AND backend (esbuild) into `dist/` folder
- `start`: Runs the production build from `dist/index.js`
- **Important:** Digital Ocean runs `npm install && npm run build`, then `npm start`

### Step 2: Create Digital Ocean App

#### 2.1 Sign Up / Login

1. Go to [cloud.digitalocean.com](https://cloud.digitalocean.com)
2. Sign up or login
3. Navigate to **Apps** in the sidebar

#### 2.2 Create New App

1. Click **Create App**
2. Select **GitHub** as source
3. Authorize Digital Ocean to access your repositories
4. Select your repository
5. Select branch (typically `main`)
6. Click **Next**

#### 2.3 Configure App Settings

**Resources Detected:**

Digital Ocean will auto-detect your Node.js app. You may need to configure:

1. **Resource Type**: Web Service
2. **Name**: `privateinhomecaregiver-backend`
3. **Build Command**: 
   ```bash
   npm install && npm run build
   ```
   This runs `vite build && esbuild server/index.ts` which builds both frontend and backend.
4. **Run Command**:
   ```bash
   npm start
   ```
   This runs `node dist/index.js` (production build).
5. **HTTP Port**: `5000` (Express server port)
6. **HTTP Path**: `/`

**Instance Size:**
- Start with **Basic (512MB RAM, $5/month)**
- Scale up if needed based on traffic

#### 2.4 Set Environment Variables

Click **Environment Variables** → **Edit** → Add the following:

| Variable | Value | Encrypt |
|----------|-------|---------|
| `NODE_ENV` | `production` | ☐ |
| `DATABASE_URL` | `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:6543/postgres?pgbouncer=true` | ☑ |
| `SESSION_SECRET` | Generate 32-char random string | ☑ |
| `RECAPTCHA_SECRET_KEY` | Your Google reCAPTCHA secret | ☑ |
| `VITE_RECAPTCHA_SITE_KEY` | Your Google reCAPTCHA site key | ☐ |
| `ENABLE_GEO_BLOCKING` | `false` (or `true` for US-only) | ☐ |

**Generate SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Get Supabase DATABASE_URL:**
1. Go to Supabase Dashboard → Settings → Database
2. Copy **Connection pooling** string (port 6543)
3. Use transaction mode: `?pgbouncer=true`

**Check "Encrypt"** for all sensitive values!

#### 2.5 Configure Regional Settings

- **Region**: Choose closest to your users (e.g., `New York` for East Coast)
- **Auto-Deploy**: ✅ Enable (deploys automatically on GitHub push)

#### 2.6 Review and Create

1. Review all settings
2. Click **Create Resources**
3. Wait for initial deployment (5-10 minutes)

### Step 3: Configure Custom Domain (Optional)

#### 3.1 Add Domain

1. Go to your app → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain: `privateinhomecaregiver.com`
4. Digital Ocean will provide DNS records

#### 3.2 Update DNS

Add these records at your domain registrar (e.g., Namecheap, GoDaddy):

```
Type: CNAME
Name: @
Value: [your-app-name].ondigitalocean.app

Type: CNAME  
Name: www
Value: [your-app-name].ondigitalocean.app
```

Wait for DNS propagation (up to 24 hours, usually ~1 hour).

#### 3.3 SSL Certificate

Digital Ocean automatically provisions SSL certificates via Let's Encrypt. No configuration needed!

### Step 4: Post-Deployment Configuration

#### 4.1 Switch to Database Storage (CRITICAL)

Before deployment, you MUST switch from MemStorage to DbStorage:

1. Open `server/storage.ts`
2. Find lines 1864-1867 at the bottom of the file
3. **Comment out MemStorage** and **uncomment DbStorage**:

```typescript
// Development: Use MemStorage (in-memory) for Replit
// Production: Switch to DbStorage when deploying to Digital Ocean with DATABASE_URL
// Uncomment the following lines for production with PostgreSQL:
const { db } = await import("./db");
export const storage = new DbStorage(db);

// export const storage = new MemStorage(); // ← Comment this out for production
```

4. Save and commit the changes
5. Push to GitHub (triggers auto-deploy on Digital Ocean)

#### 4.2 Run Database Migrations

After deploying with DbStorage, the database tables need to be created:

**Option 1: Via SSH Console (Recommended)**

1. Go to Digital Ocean App Platform → Your App → **Console** tab
2. Click "Launch Console"
3. Run the migration command:
   ```bash
   npm run db:push
   ```
4. Confirm the migration when prompted

**Option 2: Add to Build Command**

Update your Digital Ocean app spec to run migrations automatically:

```yaml
build_command: npm run build && npm run db:push
```

#### 4.3 Create Admin User (CRITICAL FOR ADMIN LOGIN)

**After deployment and migrations, the admin user does NOT exist yet!**

You have TWO options to create the admin user:

**Option A: API Endpoint (Easiest)**

1. Open browser or use curl to call the seed endpoint:
   ```bash
   curl -X POST https://[your-app-name].ondigitalocean.app/api/auth/seed-admin
   ```

2. You'll receive a response with:
   ```json
   {
     "success": true,
     "message": "Admin user created successfully",
     "username": "admin",
     "password": "demo123",
     "recoveryCodes": ["CODE1", "CODE2", ...]
   }
   ```

3. **SAVE THE RECOVERY CODES!** They're shown only once
4. Now you can login at `/admin` with:
   - Username: `admin`
   - Password: `demo123`

**Option B: SQL Query (Alternative)**

1. Go to Supabase Dashboard → SQL Editor
2. Run this query (replace with your desired password):
   ```sql
   -- Create admin user (password is 'demo123' hashed with bcrypt)
   INSERT INTO users (id, username, password)
   VALUES (
     gen_random_uuid(),
     'admin',
     '$2b$10$YourBcryptHashedPasswordHere'
   );
   ```

3. Generate bcrypt hash at: https://bcrypt-generator.com/
4. Use rounds: 10

**IMPORTANT SECURITY NOTE:**
- Change the default password IMMEDIATELY after first login
- Go to `/admin/profile` and update your password
- Generate and save recovery codes in a secure location

#### 4.4 Verify Deployment & Admin Login

1. Visit your app URL: `https://[your-app-name].ondigitalocean.app`
2. Test homepage loads
3. Test navigation (articles, services, careers, etc.)
4. **Test admin login:** Go to `/admin`
   - Username: `admin`
   - Password: `demo123` (or your custom password)
5. If login fails:
   - Check Console logs for errors
   - Verify DATABASE_URL is set correctly
   - Verify SESSION_SECRET is set
   - Check that admin user was created (see step 4.3)

#### 4.5 Enable RLS on Supabase (If Not Done)

**CRITICAL - Do this immediately if not already done:**

1. Go to Supabase Dashboard
2. Click **SQL Editor**
3. Copy entire contents of `server/enable-rls.sql`
4. Paste and click **Run**
5. Verify:
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
   ```
   All tables should show `rowsecurity = true`

#### 4.3 Test Application

**Critical Tests:**
- [ ] Homepage loads
- [ ] Admin login works
- [ ] Create/edit article (tests database write)
- [ ] Submit consultation form (tests CAPTCHA, database write)
- [ ] Submit job application (tests file upload, database)
- [ ] Submit referral form
- [ ] View caregiver profiles
- [ ] Check sitemap: `/sitemap.xml`

#### 4.4 Configure Email (Recommended)

For production, set up transactional emails:

**Option 1: SendGrid**
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Get API key
3. Add to environment variables:
   - `SENDGRID_API_KEY` (encrypted)
   - Update email utility to use SendGrid

**Option 2: Resend**
1. Sign up at [resend.com](https://resend.com)
2. Get API key
3. Add to environment variables:
   - `RESEND_API_KEY` (encrypted)
   - Update email utility to use Resend

#### 4.5 Set Up Monitoring

1. Go to app → **Insights** tab
2. Monitor:
   - Request rates
   - Response times
   - Error rates
   - Resource usage

3. Set up alerts:
   - Settings → Alerts
   - Configure for high error rates, CPU usage

---

## 📊 Environment Variables Reference

### Required Variables

```bash
# Application
NODE_ENV=production

# Database (Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true

# Security
SESSION_SECRET=[GENERATE-32-CHAR-RANDOM-STRING]

# CAPTCHA (Google reCAPTCHA)
RECAPTCHA_SECRET_KEY=[YOUR-SECRET-KEY]
VITE_RECAPTCHA_SITE_KEY=[YOUR-SITE-KEY]

# Optional Features
ENABLE_GEO_BLOCKING=false  # Set to true for US-only access
```

### Optional Variables (Email - if configured)

```bash
# SendGrid
SENDGRID_API_KEY=[YOUR-API-KEY]
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# OR Resend
RESEND_API_KEY=[YOUR-API-KEY]
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

---

## 🔄 Continuous Deployment

With auto-deploy enabled:

```bash
# Make changes locally
git add .
git commit -m "Update feature X"
git push origin main

# Digital Ocean automatically:
# 1. Detects new commit
# 2. Runs build command
# 3. Deploys new version
# 4. Zero downtime deployment
```

View deployment status in Digital Ocean dashboard.

---

## 🐛 Troubleshooting

### Build Fails

**Error: "npm install failed"**
- Check `package.json` syntax
- Verify all dependencies are listed
- Try adding `--legacy-peer-deps` to build command

**Error: "Frontend build not found"**
- Verify build command is: `npm run build`
- Check that `vite build` produces output in `dist/` folder
- Ensure `package.json` has correct build script

### Runtime Errors

**Error: "Cannot connect to database"**
- Verify `DATABASE_URL` is correctly set (encrypted)
- Check Supabase project is running
- Ensure using pooler connection (port 6543)
- Verify RLS policies don't block service role

**Error: "Session errors"**
- Verify `SESSION_SECRET` is set
- Check session middleware configuration

**Error: "File uploads fail"**
- Digital Ocean App Platform uses ephemeral storage
- Files uploaded during a session are lost on redeploy
- **Solution**: Use Digital Ocean Spaces (S3-compatible) for persistent storage

### Performance Issues

**Slow response times:**
- Scale up instance size (Settings → Resources → Edit)
- Add more instances for horizontal scaling
- Check database query performance

**High memory usage:**
- Review memory leaks in code
- Optimize file uploads
- Scale to larger instance

---

## 💾 Database Migration Checklist

If switching from MemStorage to DbStorage:

1. ✅ Enable RLS on Supabase (run `enable-rls.sql`)
2. ✅ Set `DATABASE_URL` environment variable
3. ✅ Update `server/storage.ts`:
   ```typescript
   export const storage = new DbStorage();
   ```
4. ✅ Push changes to GitHub
5. ✅ Wait for auto-deployment
6. ✅ Test all CRUD operations
7. ✅ Verify data persistence

---

## 📈 Scaling Your Application

### Vertical Scaling (Bigger Instance)

1. Go to app → Settings → Resources
2. Click **Edit** on your service
3. Select larger instance size:
   - Professional (1GB RAM, $12/month)
   - Professional Plus (2GB RAM, $24/month)
4. Apply changes (zero downtime)

### Horizontal Scaling (More Instances)

1. Settings → Resources → Edit service
2. Increase **Instance Count** (e.g., 2, 3, 4)
3. Digital Ocean automatically load balances
4. Recommended for high-traffic periods

### Database Scaling

Supabase handles this separately:
1. Go to Supabase Dashboard
2. Settings → Billing
3. Upgrade plan for more connections/storage

---

## 🔐 Production Security Checklist

Before going live:

- [ ] ✅ RLS enabled on all 12 Supabase tables
- [ ] ✅ All environment variables encrypted
- [ ] ✅ HTTPS/SSL certificate active (automatic)
- [ ] ✅ Session secret is strong random string
- [ ] ✅ CAPTCHA configured and working
- [ ] ✅ Rate limiting active (already in code)
- [ ] ✅ API hardening middleware active (already in code)
- [ ] ✅ Admin password changed from demo123
- [ ] ✅ Database backups enabled (PITR)
- [ ] ✅ Error monitoring configured
- [ ] ✅ File upload limits enforced (5MB images, 10MB resumes)

---

## 📞 Support Resources

- **Digital Ocean Docs**: [docs.digitalocean.com/products/app-platform](https://docs.digitalocean.com/products/app-platform/)
- **App Platform Support**: [digitalocean.com/community/app-platform](https://www.digitalocean.com/community/tags/app-platform)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **GitHub Deployment Guides**: [github.com/digitalocean](https://github.com/digitalocean)

---

## 🎯 Quick Start Summary

1. **Push code to GitHub**
2. **Run `enable-rls.sql` in Supabase** (CRITICAL!)
3. **Create Digital Ocean App** (connect GitHub repo)
4. **Set environment variables** (DATABASE_URL, SESSION_SECRET, CAPTCHA keys)
5. **Deploy** (automatic)
6. **Test application** thoroughly
7. **Add custom domain** (optional)
8. **Monitor and scale** as needed

**Estimated deployment time**: 20-30 minutes

---

**Last Updated**: 2025-01-09  
**Target Platform**: Digital Ocean App Platform  
**Application**: Private InHome CareGiver - Massachusetts In-Home Care Platform
