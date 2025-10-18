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
        NODE_ENV: "production",
        PORT: "5000",

        // Load from .env
        DATABASE_URL: process.env.DATABASE_URL,
        VITE_RECAPTCHA_SITE_KEY: process.env.VITE_RECAPTCHA_SITE_KEY,
        RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY,
        SESSION_SECRET: process.env.SESSION_SECRET,
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: process.env.SMTP_PORT,
        SMTP_USER: process.env.SMTP_USER,
        SMTP_PASS: process.env.SMTP_PASS,
        FROM_EMAIL: process.env.FROM_EMAIL,
        
        // Gmail OAuth2
        CLIENT_ID: process.env.CLIENT_ID,
        CLIENT_SECRET: process.env.CLIENT_SECRET,
        REDIRECT_URI: process.env.REDIRECT_URI,
        GMAIL_REFRESH_TOKEN: process.env.GMAIL_REFRESH_TOKEN,

        // Optional future envs
        // SESSION_SECRET: process.env.SESSION_SECRET,
        // TURNSTILE_SITE_KEY: process.env.TURNSTILE_SITE_KEY,
        // TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
      },
    },
  ],
};