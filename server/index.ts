import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import createMemoryStore from "memorystore";
import helmet from "helmet";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { hipaaAuditMiddleware } from "./middleware/hipaa-audit";

const app = express();
app.set('trust proxy', 1);

const allowedOrigins = [
  'https://privateinhomecaregiver.com',
  'https://www.privateinhomecaregiver.com',
  ...(process.env.NODE_ENV === 'development' ? ['http://localhost:5000', 'http://127.0.0.1:5000'] : [])
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://www.google.com",
        "https://www.gstatic.com",
        "https://www.googletagmanager.com",
        "https://fonts.googleapis.com"
      ],
      scriptSrcElem: [
        "'self'",
        "'unsafe-inline'",
        "https://www.google.com",
        "https://www.gstatic.com",
        "https://www.googletagmanager.com",
        "https://fonts.googleapis.com"
      ],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "blob:"
      ],
      frameSrc: [
        "'self'",
        "https://www.google.com",
        "https://www.youtube.com"
      ],
      connectSrc: [
        "'self'",
        "https://www.google.com",
        "https://www.google-analytics.com",
        "https://www.googletagmanager.com",
        "https://analytics.google.com"
      ],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === "production" ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: {
    action: 'deny'
  },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  }
}));

const ipLocationCache = new Map<string, { country: string; allowed: boolean; timestamp: number }>();
const IP_CACHE_TTL = 60 * 60 * 1000; // 1 hour
const IP_CACHE_MAX_SIZE = 10000;

function cleanIPCache() {
  const now = Date.now();
  const entries = Array.from(ipLocationCache.entries());
  for (const [ip, entry] of entries) {
    if (now - entry.timestamp > IP_CACHE_TTL) {
      ipLocationCache.delete(ip);
    }
  }

  if (ipLocationCache.size > IP_CACHE_MAX_SIZE) {
    const entries = Array.from(ipLocationCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toDelete = entries.slice(0, entries.length - IP_CACHE_MAX_SIZE);
    toDelete.forEach(([ip]) => ipLocationCache.delete(ip));
  }
}

function isPrivateIP(ip: string): boolean {
  let normalizedIP = ip.replace(/:\d+$/, '');

  if (normalizedIP.startsWith('::ffff:')) {
    normalizedIP = normalizedIP.substring(7);
  }

  if (normalizedIP === '::1' || normalizedIP === '127.0.0.1') {
    return true;
  }

  if (normalizedIP.startsWith('fe80:') || normalizedIP.startsWith('fc00:') || normalizedIP.startsWith('fd')) {
    return true;
  }

  const parts = normalizedIP.split('.');
  if (parts.length === 4) {
    const first = parseInt(parts[0], 10);
    const second = parseInt(parts[1], 10);

    if (first === 10) return true;
    if (first === 172 && second >= 16 && second <= 31) return true;
    if (first === 192 && second === 168) return true;
    if (first === 127) return true;
    if (first === 169 && second === 254) return true;
  }

  return false;
}

function getClientIP(req: Request): string {
  const trustedProxyHeader = process.env.TRUSTED_PROXY_HEADER;

  if (trustedProxyHeader && req.headers[trustedProxyHeader.toLowerCase()]) {
    const headerValue = req.headers[trustedProxyHeader.toLowerCase()];
    const ip = Array.isArray(headerValue) ? headerValue[0] : headerValue;
    if (ip && !isPrivateIP(ip)) {
      return ip.split(',')[0].trim();
    }
  }

  const directIP = req.ip || req.socket.remoteAddress || '';
  if (!isPrivateIP(directIP)) {
    return directIP;
  }

  return '';
}

let lastCacheCleanup = Date.now();
const CACHE_CLEANUP_INTERVAL = 15 * 60 * 1000; // 15 minutes

async function checkIPLocation(ip: string): Promise<{ country: string; allowed: boolean }> {
  if (Date.now() - lastCacheCleanup > CACHE_CLEANUP_INTERVAL) {
    cleanIPCache();
    lastCacheCleanup = Date.now();
  }

  const cached = ipLocationCache.get(ip);
  if (cached && Date.now() - cached.timestamp < IP_CACHE_TTL) {
    return { country: cached.country, allowed: cached.allowed };
  }

  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode`);
    const data = await response.json();

    if (data.status === 'success') {
      const isUS = data.countryCode === 'US';
      const result = { country: data.country, allowed: isUS, timestamp: Date.now() };
      ipLocationCache.set(ip, result);
      return { country: result.country, allowed: result.allowed };
    }

    console.warn('[GEOLOCATION] IP lookup failed:', data);
    return { country: 'Unknown', allowed: true };
  } catch (error) {
    console.error('[GEOLOCATION] Error checking IP location:', error);
    return { country: 'Unknown', allowed: true };
  }
}

app.use(async (req, res, next) => {
  const enableGeoBlocking = process.env.ENABLE_GEO_BLOCKING === 'true';

  if (!enableGeoBlocking) {
    return next();
  }

  if (req.path.startsWith('/uploads/')) {
    return next();
  }

  const clientIP = getClientIP(req);

  if (!clientIP || isPrivateIP(clientIP)) {
    return next();
  }

  const { country, allowed } = await checkIPLocation(clientIP);

  if (!allowed) {
    console.warn(`[SECURITY] Access denied - Non-US IP: ${clientIP} from ${country}`);
    return res.status(403).json({
      error: 'Access denied',
      message: 'This service is only available to users in the United States.'
    });
  }

  next();
});

const PgSession = connectPgSimple(session);
const MemoryStore = createMemoryStore(session);

const sessionStore = process.env.NODE_ENV === "production" && process.env.DATABASE_URL
  ? new PgSession({
    conObject: {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : false
    },
    tableName: 'session',
    createTableIfMissing: true,
    pruneSessionInterval: 60 * 15 // Prune expired sessions every 15 minutes
  })
  : new MemoryStore({
    checkPeriod: 86400000 // Prune expired entries every 24h
  });

app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
  resave: false,
  saveUninitialized: false,
  rolling: true, // HIPAA: Reset session expiry on each request (activity-based timeout)
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility with redirects and CORS
    maxAge: 15 * 60 * 1000, // HIPAA Compliance: 15-minute inactivity timeout
  },
}));

// HIPAA Audit Logging Middleware - logs all PHI access
app.use(hipaaAuditMiddleware);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();