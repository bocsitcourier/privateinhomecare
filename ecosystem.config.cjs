require('dotenv').config(); // Load .env file

module.exports = {
  apps: [
    {
      name: "privateinhomecare",
      cwd: "/var/www/html/privateinhomecare",
      script: "dist/index.js",
      exec_mode: "fork", // use "cluster" if stateless & want multi-core
      instances: 1,
      watch: false,
      max_restarts: 10,
      env: {
        NODE_ENV: "production",
        PORT: "5000",

        // Load from .env
        DATABASE_URL: process.env.DATABASE_URL,
        VITE_RECAPTCHA_SITE_KEY: process.env.VITE_RECAPTCHA_SITE_KEY,
        RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY,
        SESSION_SECRET=Rz9a1D0o7mQpYFvTq6Ue4WJxH7d2N3Zk

        // Optional future envs
        // SESSION_SECRET: process.env.SESSION_SECRET,
        // TURNSTILE_SITE_KEY: process.env.TURNSTILE_SITE_KEY,
        // TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
      },
    },
  ],
};