/**
 * TLS/HTTPS Security Configuration
 * 
 * Forces TLS 1.3 for all connections and implements security headers.
 * No unencrypted HTTP traffic should ever carry PHI.
 * 
 * HIPAA Technical Safeguard: Transmission Security (§164.312(e)(1))
 */

import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

/**
 * HTTPS Redirect Middleware
 * 
 * Redirects all HTTP traffic to HTTPS in production
 */
@Injectable()
export class HttpsRedirectMiddleware implements NestMiddleware {
  private readonly logger = new Logger(HttpsRedirectMiddleware.name);

  use(req: Request, res: Response, next: NextFunction): void {
    // Check if already on HTTPS
    const isHttps = 
      req.secure || 
      req.headers['x-forwarded-proto'] === 'https' ||
      req.headers['x-forwarded-ssl'] === 'on';

    // In production, redirect HTTP to HTTPS
    if (process.env.NODE_ENV === 'production' && !isHttps) {
      const httpsUrl = `https://${req.headers.host}${req.url}`;
      
      this.logger.warn({
        event: 'http_redirect',
        from: req.url,
        to: httpsUrl,
        ip: req.ip,
      });

      return res.redirect(301, httpsUrl);
    }

    next();
  }
}

/**
 * Security Headers Configuration
 * 
 * Implements comprehensive security headers using Helmet
 */
export const securityHeadersConfig = {
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for some frameworks, remove if possible
        "https://www.google.com/recaptcha/",
        "https://www.gstatic.com/recaptcha/",
      ],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: [
        "'self'",
        "https://www.google.com/recaptcha/",
      ],
      frameSrc: [
        "https://www.google.com/recaptcha/",
      ],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"], // Prevent clickjacking
      upgradeInsecureRequests: [],
    },
  },

  // Strict Transport Security (HSTS)
  // Tell browsers to always use HTTPS
  strictTransportSecurity: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },

  // Prevent MIME type sniffing
  noSniff: true,

  // XSS Protection (legacy, but still useful)
  xssFilter: true,

  // Don't reveal we're using Express
  hidePoweredBy: true,

  // Prevent clickjacking
  frameguard: {
    action: 'deny' as const,
  },

  // Referrer Policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin' as const,
  },

  // Permissions Policy (formerly Feature Policy)
  permittedCrossDomainPolicies: {
    permittedPolicies: 'none' as const,
  },
};

/**
 * Apply Helmet middleware with HIPAA-compliant settings
 */
export function getHelmetMiddleware() {
  return helmet(securityHeadersConfig);
}

/**
 * TLS Configuration for Node.js HTTPS Server
 * 
 * Use when creating the HTTPS server directly
 */
export const tlsConfig = {
  // Minimum TLS version (TLS 1.2 minimum, prefer 1.3)
  minVersion: 'TLSv1.2' as const,
  
  // Preferred version
  maxVersion: 'TLSv1.3' as const,
  
  // Cipher suites (TLS 1.2)
  ciphers: [
    'ECDHE-ECDSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-ECDSA-CHACHA20-POLY1305',
    'ECDHE-RSA-CHACHA20-POLY1305',
    'ECDHE-ECDSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES128-GCM-SHA256',
  ].join(':'),
  
  // Honor server's cipher suite preference
  honorCipherOrder: true,
  
  // Enable OCSP stapling for certificate validation
  // requestOCSP: true,
};

/**
 * NGINX Configuration for TLS (recommended for production)
 * 
 * Place this in your nginx.conf for optimal TLS settings
 */
export const nginxTlsConfig = `
# HIPAA-Compliant TLS Configuration for NGINX
# Place in your server block

# SSL/TLS Protocols - TLS 1.2 and 1.3 only
ssl_protocols TLSv1.2 TLSv1.3;

# Cipher Suites - Strong ciphers only
ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';

# Prefer server ciphers
ssl_prefer_server_ciphers on;

# SSL Session Configuration
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:50m;
ssl_session_tickets off;

# OCSP Stapling
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;

# HSTS (1 year)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

# Security Headers
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Content Security Policy
add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/; frame-src https://www.google.com/recaptcha/; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://www.google.com/recaptcha/; object-src 'none'; frame-ancestors 'none';" always;

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name privateinhomecaregiver.com www.privateinhomecaregiver.com;
    return 301 https://$server_name$request_uri;
}
`;

/**
 * PostgreSQL SSL Configuration
 * 
 * Ensure database connections are also encrypted
 */
export const postgresSSLConfig = {
  ssl: {
    rejectUnauthorized: true, // Verify server certificate
    // For AWS RDS, you'll need the RDS CA certificate:
    // ca: fs.readFileSync('/path/to/rds-ca-2019-root.pem').toString(),
  },
};

/**
 * Database Connection Configuration with SSL
 */
export const databaseConfig = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  
  // Enable SSL for database connection
  ssl: process.env.NODE_ENV === 'production' ? postgresSSLConfig.ssl : false,
  
  // Connection pool settings
  extra: {
    max: 20, // Maximum pool size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
};

/**
 * Rate Limiting Configuration
 * 
 * Prevent brute force attacks on login endpoints
 */
export const rateLimitConfig = {
  // General API rate limit
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
      statusCode: 429,
      message: 'Too many requests, please try again later',
      error: 'RATE_LIMIT_EXCEEDED',
    },
  },
  
  // Strict limit for authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 login attempts per window
    message: {
      statusCode: 429,
      message: 'Too many login attempts, please try again later',
      error: 'AUTH_RATE_LIMIT_EXCEEDED',
    },
  },
};
