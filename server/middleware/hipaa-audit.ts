/**
 * HIPAA Audit Trail Middleware for Express.js
 * 
 * Logs every access to PHI for compliance auditing.
 * Creates immutable audit records that track WHO accessed WHAT and WHEN.
 * 
 * HIPAA Technical Safeguard: Audit Controls (§164.312(b))
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface AuditLogEntry {
  auditId: string;
  timestamp: string;
  userId: string | null;
  userEmail: string | null;
  userRole: string | null;
  sessionId: string | null;
  method: string;
  endpoint: string;
  resourceType: string | null;
  resourceId: string | null;
  ipAddress: string;
  userAgent: string;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'PRINT';
  phiAccessed: boolean;
  phiFields: string[];
  statusCode: number;
  success: boolean;
  errorMessage: string | null;
  responseTimeMs: number;
  metadata: Record<string, any>;
}

const PHI_ROUTES = [
  '/api/intake',
  '/api/inquiries',
  '/api/referrals',
  '/api/forms/',
  '/api/consultation',
  '/api/admin/clients',
  '/api/admin/caregivers',
  '/api/admin/intake',
  '/api/admin/client-intakes',
  '/api/admin/job-applications',
];

const PHI_FIELDS = [
  'ssn',
  'socialSecurityNumber',
  'dateOfBirth',
  'dob',
  'medicalRecordNumber',
  'diagnosis',
  'medications',
  'healthConditions',
  'insuranceNumber',
  'gateCode',
  'emergencyContact',
  'address',
  'phoneNumber',
  'phone',
  'email',
  'clientName',
  'clientEmail',
  'clientPhone',
  'fullName',
  'referrerName',
  'referrerEmail',
  'referredName',
  'referredPhone',
];

function isPHIRoute(url: string): boolean {
  return PHI_ROUTES.some(route => url.startsWith(route));
}

function detectPHIFields(body: any): string[] {
  if (!body || typeof body !== 'object') return [];
  
  const detected: string[] = [];
  const checkObject = (obj: any, prefix = '') => {
    for (const key of Object.keys(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (PHI_FIELDS.some(field => 
        key.toLowerCase().includes(field.toLowerCase())
      )) {
        detected.push(fullKey);
      }
      
      if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        checkObject(obj[key], fullKey);
      }
    }
  };
  
  checkObject(body);
  return detected;
}

function classifyAction(method: string, url: string): AuditLogEntry['action'] {
  if (url.includes('/login')) return 'LOGIN';
  if (url.includes('/logout')) return 'LOGOUT';
  if (url.includes('/export')) return 'EXPORT';
  if (url.includes('/print')) return 'PRINT';
  
  switch (method.toUpperCase()) {
    case 'POST': return 'CREATE';
    case 'GET': return 'READ';
    case 'PUT':
    case 'PATCH': return 'UPDATE';
    case 'DELETE': return 'DELETE';
    default: return 'READ';
  }
}

function extractResource(url: string): { resourceType: string | null; resourceId: string | null } {
  const match = url.match(/\/api\/(?:admin\/)?([^\/]+)(?:\/([^\/\?]+))?/);
  
  if (match) {
    return {
      resourceType: match[1],
      resourceId: match[2] || null,
    };
  }
  
  return { resourceType: null, resourceId: null };
}

function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

function sanitizeParams(params: any): any {
  if (!params) return {};
  
  const sanitized = { ...params };
  const sensitiveKeys = ['password', 'token', 'key', 'secret', 'ssn', 'captchaToken'];
  
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

function writeAuditLog(entry: AuditLogEntry): void {
  const logLine = JSON.stringify(entry);
  console.log(`[HIPAA_AUDIT] ${logLine}`);
}

/**
 * HIPAA Audit Middleware for Express
 * 
 * Usage:
 * app.use(hipaaAuditMiddleware);
 */
export function hipaaAuditMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const auditId = uuidv4();
  
  const session = req.session as any;
  
  // Extract user information from session - matches Express session schema
  const userId = session?.userId || null;
  const userRole = session?.isAuthenticated ? 'admin' : 'public';
  
  const phiAccessed = isPHIRoute(req.url);
  const phiFields = detectPHIFields(req.body);
  const action = classifyAction(req.method, req.url);
  const { resourceType, resourceId } = extractResource(req.url);
  
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);
  
  let responseLogged = false;
  
  const logResponse = (statusCode: number, success: boolean, errorMessage: string | null = null) => {
    if (responseLogged) return;
    responseLogged = true;
    
    const auditEntry: AuditLogEntry = {
      auditId,
      timestamp: new Date().toISOString(),
      userId: userId,
      userEmail: null,
      userRole: userRole,
      sessionId: req.sessionID || null,
      method: req.method,
      endpoint: req.url,
      resourceType,
      resourceId,
      ipAddress: getClientIP(req),
      userAgent: req.headers['user-agent'] || 'unknown',
      action,
      phiAccessed,
      phiFields,
      statusCode,
      success,
      errorMessage,
      responseTimeMs: Date.now() - startTime,
      metadata: {
        queryParams: sanitizeParams(req.query),
      },
    };
    
    if (phiAccessed || !success || action !== 'READ') {
      writeAuditLog(auditEntry);
    }
  };
  
  res.json = function(body: any) {
    logResponse(res.statusCode, res.statusCode < 400, null);
    return originalJson(body);
  };
  
  res.send = function(body: any) {
    logResponse(res.statusCode, res.statusCode < 400, null);
    return originalSend(body);
  };
  
  res.on('finish', () => {
    logResponse(res.statusCode, res.statusCode < 400, null);
  });
  
  next();
}

/**
 * Log a specific PHI access event (for manual logging)
 */
export function logPHIAccess(
  req: Request,
  action: AuditLogEntry['action'],
  resourceType: string,
  resourceId: string | null,
  phiFields: string[],
  success: boolean,
  errorMessage: string | null = null
): void {
  const session = req.session as any;
  const userId = session?.userId || null;
  const userRole = session?.isAuthenticated ? 'admin' : 'public';
  
  const auditEntry: AuditLogEntry = {
    auditId: uuidv4(),
    timestamp: new Date().toISOString(),
    userId: userId,
    userEmail: null,
    userRole: userRole,
    sessionId: req.sessionID || null,
    method: req.method,
    endpoint: req.url,
    resourceType,
    resourceId,
    ipAddress: getClientIP(req),
    userAgent: req.headers['user-agent'] || 'unknown',
    action,
    phiAccessed: true,
    phiFields,
    statusCode: success ? 200 : 500,
    success,
    errorMessage,
    responseTimeMs: 0,
    metadata: {},
  };
  
  writeAuditLog(auditEntry);
}
