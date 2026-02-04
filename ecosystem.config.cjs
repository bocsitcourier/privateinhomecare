require('dotenv').config(); // Load .env file

module.exports = {
  apps: [
    {
      name: "privateinhomecare",
      cwd: "/var/www/html/privateinhomecare",
      script: "dist/index.js",
      exec_mode: "fork", // use "cluster" if stateless & want multi-core
      instances: 1,
      autorestart: true,
      restart_delay: 5000,
      watch: false,
      max_restarts: 10,
      env: {
        // Core
        DATABASE_URL: process.env.DATABASE_URL,
        SESSION_SECRET: process.env.SESSION_SECRET,
        NODE_ENV: "production",
        PORT: "5000",
        APP_URL: process.env.APP_URL || "https://privateinhomecaregiver.com",

        // Security
        VITE_RECAPTCHA_SITE_KEY: process.env.VITE_RECAPTCHA_SITE_KEY,
        RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY,
        TRUSTED_PROXY_HEADER: process.env.TRUSTED_PROXY_HEADER,
        ENABLE_GEO_BLOCKING: process.env.ENABLE_GEO_BLOCKING,

        // Email (Resend)
        RESEND_API_KEY: process.env.RESEND_API_KEY,
        FROM_EMAIL: process.env.FROM_EMAIL,
        HR_EMAIL: process.env.HR_EMAIL,

        // Email (SMTP/Gmail Legacy)
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: process.env.SMTP_PORT,
        SMTP_USER: process.env.SMTP_USER,
        SMTP_PASS: process.env.SMTP_PASS,

        // Email (OAuth2)
        CLIENT_ID: process.env.CLIENT_ID,
        CLIENT_SECRET: process.env.CLIENT_SECRET,
        REDIRECT_URI: process.env.REDIRECT_URI,
        GMAIL_REFRESH_TOKEN: process.env.GMAIL_REFRESH_TOKEN,

        // Storage
        FILE_STORAGE_PROVIDER: process.env.FILE_STORAGE_PROVIDER,

        // Digital Ocean Spaces
        SPACES_ENDPOINT: process.env.SPACES_ENDPOINT,
        SPACES_BUCKET: process.env.SPACES_BUCKET,
        SPACES_ACCESS_KEY: process.env.SPACES_ACCESS_KEY,
        SPACES_SECRET_KEY: process.env.SPACES_SECRET_KEY,
        SPACES_REGION: process.env.SPACES_REGION,

        // Supabase Storage
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
        SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET,

        // Integrations
        GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY,
        AI_INTEGRATIONS_OPENAI_API_KEY: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
        AI_INTEGRATIONS_OPENAI_BASE_URL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
        YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,

      },
    },
  ],
};