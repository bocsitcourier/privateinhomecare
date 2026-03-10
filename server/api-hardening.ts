/**
 * API Hardening & Security Middleware
 * Additional security layers for production deployment
 */

import { Request, Response, NextFunction } from "express";

/**
 * Enforce HTTPS in production
 * Redirects HTTP requests to HTTPS
 */
export function enforceHTTPS(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV === 'production') {
    const proto = req.headers['x-forwarded-proto'] || req.protocol;
    if (proto !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
  }
  next();
}

/**
 * Sanitize response headers to prevent information leakage
 */
export function sanitizeHeaders(req: Request, res: Response, next: NextFunction) {
  // Remove server identification
  res.removeHeader('X-Powered-By');
  
  // Add security headers (complementing helmet middleware)
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Prevent caching of sensitive API responses
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
}

/**
 * Validate request content type for POST/PUT/PATCH
 * Prevents content type confusion attacks
 */
export function validateContentType(req: Request, res: Response, next: NextFunction) {
  const methods = ['POST', 'PUT', 'PATCH'];
  
  if (methods.includes(req.method)) {
    const contentType = req.headers['content-type'];
    
    // Allow multipart/form-data for file uploads
    if (req.path.includes('/upload') || req.path.includes('/apply')) {
      return next();
    }
    
    // Require JSON content type for API endpoints
    if (req.path.startsWith('/api/') && !contentType?.includes('application/json')) {
      return res.status(415).json({ 
        error: 'Unsupported Media Type. Content-Type must be application/json' 
      });
    }
  }
  
  next();
}

/**
 * Request size limiter to prevent DoS attacks
 * Validates payload size before processing
 */
export function validateRequestSize(maxSizeBytes: number = 10 * 1024 * 1024) {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    
    if (contentLength > maxSizeBytes) {
      return res.status(413).json({ 
        error: `Payload too large. Maximum size: ${maxSizeBytes / 1024 / 1024}MB` 
      });
    }
    
    next();
  };
}

/**
 * SQL Injection detection middleware
 * Scans request parameters for common SQL injection patterns
 */
export function detectSQLInjection(req: Request, res: Response, next: NextFunction) {
  // Whitelist paths that legitimately contain rich text/HTML content
  const whitelistedPaths = [
    '/api/admin/articles',
    '/api/admin/jobs',
    '/api/admin/pages',
  ];
  
  // Skip SQL injection detection for whitelisted content management endpoints
  if (whitelistedPaths.some(path => req.path.startsWith(path))) {
    return next();
  }
  
  const suspiciousPatterns = [
    /(\bUNION\b|\bSELECT\b|\bDROP\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b).*\bFROM\b/i,
    /(\bOR\b|\bAND\b)\s+['\d]/i,
    /--/,
    /;.*--/,
    /\/\*.*\*\//,
    /xp_cmdshell/i,
    /exec\s*\(/i
  ];
  
  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };
  
  // Check query params, body, and path params
  const suspicious = 
    checkValue(req.query) || 
    checkValue(req.body) || 
    checkValue(req.params);
  
  if (suspicious) {
    console.warn(`[SECURITY] Potential SQL injection detected from IP: ${req.ip}`, {
      path: req.path,
      method: req.method,
      query: req.query,
      body: typeof req.body === 'object' ? Object.keys(req.body) : req.body
    });
    
    return res.status(400).json({ error: 'Invalid request parameters' });
  }
  
  next();
}

/**
 * XSS detection middleware
 * Scans for common cross-site scripting patterns
 */
export function detectXSS(req: Request, res: Response, next: NextFunction) {
  const adminContentPaths = [
    /^\/api\/admin\/articles(\/|$)/,
    /^\/api\/admin\/podcasts(\/|$)/,
    /^\/api\/admin\/videos(\/|$)/,
    /^\/api\/admin\/pages(\/|$)/,
    /^\/api\/admin\/jobs(\/|$)/,
    /^\/api\/admin\/directory(\/|$)/,
    /^\/api\/admin\/facilities(\/|$)/,
  ];
  if (adminContentPaths.some(pattern => pattern.test(req.path))) {
    return next();
  }

  const xssPatterns = [
    /<script[^>]*>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /<iframe[^>]*>/gi,
    /<embed[^>]*>/gi,
    /<object[^>]*>/gi
  ];
  
  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return xssPatterns.some(pattern => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };
  
  // Check all inputs
  const suspicious = 
    checkValue(req.query) || 
    checkValue(req.body) || 
    checkValue(req.params);
  
  if (suspicious) {
    console.warn(`[SECURITY] Potential XSS attack detected from IP: ${req.ip}`, {
      path: req.path,
      method: req.method
    });
    
    return res.status(400).json({ error: 'Invalid request content' });
  }
  
  next();
}

/**
 * IP-based request throttling for specific endpoints
 * Prevents brute force attacks on sensitive endpoints
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function throttleByIP(maxRequests: number = 10, windowMs: number = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || 'unknown';
    const now = Date.now();
    
    const record = requestCounts.get(ip);
    
    if (!record || now > record.resetTime) {
      // New window
      requestCounts.set(ip, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    if (record.count >= maxRequests) {
      console.warn(`[SECURITY] IP throttle limit exceeded: ${ip} on ${req.path}`);
      return res.status(429).json({ 
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }
    
    record.count++;
    next();
  };
}

/**
 * Audit log for sensitive operations
 * Logs all admin actions and PHI/PII access
 */
export function auditLog(req: Request, res: Response, next: NextFunction) {
  const sensitiveEndpoints = [
    '/api/admin/',
    '/api/auth/',
    '/api/inquiries',
    '/api/intake',
    '/api/forms/',
    '/job-applications',
    '/caregiver-log',
    '/api/referrals',
    '/api/consultation'
  ];
  
  const isSensitive = sensitiveEndpoints.some(endpoint => req.path.includes(endpoint));
  
  if (isSensitive) {
    const userId = (req.session as any)?.userId || 'anonymous';
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    
    console.log(`[AUDIT] ${req.method} ${req.path}`, {
      userId,
      ip,
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent']
    });
  }
  
  next();
}

/**
 * Clean up sensitive data from error responses
 * Prevents stack traces and internal details from leaking
 */
export function sanitizeErrors(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('[ERROR]', {
    path: req.path,
    method: req.method,
    error: err.message,
    stack: err.stack,
    ip: req.ip
  });
  
  // In production, send generic error
  if (process.env.NODE_ENV === 'production') {
    res.status(err.status || 500).json({
      error: 'An error occurred processing your request'
    });
  } else {
    // In development, send detailed error
    res.status(err.status || 500).json({
      error: err.message,
      stack: err.stack?.split('\n')
    });
  }
}
