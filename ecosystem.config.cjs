module.exports = {
  apps: [
    {
      name: "privateinhomecare",
      cwd: "/var/www/html/privateinhomecare",
      script: "dist/index.js",
      exec_mode: "fork",          // use "cluster" if stateless & want multi-core
      instances: 1,
      watch: false,
      max_restarts: 10,
      env: {
        NODE_ENV: "production",
        PORT: "5000"
        // SESSION_SECRET: "",
        // TURNSTILE_SITE_KEY: "",
        // TURNSTILE_SECRET_KEY: "",
        // DATABASE_URL: ""
      }
    }
  ]
};

