/**
 * HIPAA Audit Trail Interceptor
 * 
 * Logs every access to PHI for compliance auditing.
 * Creates immutable audit records that track WHO accessed WHAT and WHEN.
 * 
 * HIPAA Technical Safeguard: Audit Controls (§164.312(b))
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

export interface AuditLogEntry {
  // Unique identifier for this audit event
  auditId: string;
  
  // Timestamp in ISO 8601 format
  timestamp: string;
  
  // User identification
  userId: string | null;
  userEmail: string | null;
  userRole: string | null;
  
  // Session information
  sessionId: string | null;
  
  // Request details
  method: string;
  endpoint: string;
  resourceType: string | null;
  resourceId: string | null;
  
  // Client information
  ipAddress: string;
  userAgent: string;
  
  // Action classification
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'PRINT';
  
  // PHI access indicator
  phiAccessed: boolean;
  phiFields: string[];
  
  // Response information
  statusCode: number;
  success: boolean;
  errorMessage: string | null;
  
  // Performance
  responseTimeMs: number;
  
  // Additional context
  metadata: Record<string, any>;
}

// Routes that access PHI - customize for your application
const PHI_ROUTES = [
  '/api/clients',
  '/api/patients',
  '/api/caregivers',
  '/api/intake',
  '/api/medical-records',
  '/api/assessments',
  '/api/care-plans',
  '/api/medications',
  '/api/emergency-contacts',
];

// Sensitive field names to flag in audit
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
  'email',
];

@Injectable()
export class HipaaAuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HIPAA_AUDIT');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    const startTime = Date.now();
    const auditId = uuidv4();
    
    // Extract user information from JWT or session
    const user = request.user || {};
    
    // Determine if this route accesses PHI
    const phiAccessed = this.isPHIRoute(request.url);
    
    // Detect PHI fields in request body
    const phiFields = this.detectPHIFields(request.body);
    
    // Classify the action type
    const action = this.classifyAction(request.method, request.url);
    
    // Extract resource information
    const { resourceType, resourceId } = this.extractResource(request.url);

    return next.handle().pipe(
      tap((responseData) => {
        const auditEntry: AuditLogEntry = {
          auditId,
          timestamp: new Date().toISOString(),
          
          // User identification
          userId: user.id || user.sub || null,
          userEmail: user.email || null,
          userRole: user.role || null,
          
          // Session
          sessionId: request.sessionID || request.headers['x-session-id'] || null,
          
          // Request
          method: request.method,
          endpoint: request.url,
          resourceType,
          resourceId,
          
          // Client
          ipAddress: this.getClientIP(request),
          userAgent: request.headers['user-agent'] || 'unknown',
          
          // Classification
          action,
          phiAccessed,
          phiFields,
          
          // Response
          statusCode: response.statusCode,
          success: true,
          errorMessage: null,
          
          // Performance
          responseTimeMs: Date.now() - startTime,
          
          // Metadata
          metadata: {
            recaptchaScore: request.recaptchaScore,
            queryParams: this.sanitizeParams(request.query),
            responseRecordCount: this.countRecords(responseData),
          },
        };

        this.writeAuditLog(auditEntry);
      }),
      catchError((error) => {
        const auditEntry: AuditLogEntry = {
          auditId,
          timestamp: new Date().toISOString(),
          
          userId: user.id || user.sub || null,
          userEmail: user.email || null,
          userRole: user.role || null,
          
          sessionId: request.sessionID || request.headers['x-session-id'] || null,
          
          method: request.method,
          endpoint: request.url,
          resourceType,
          resourceId,
          
          ipAddress: this.getClientIP(request),
          userAgent: request.headers['user-agent'] || 'unknown',
          
          action,
          phiAccessed,
          phiFields,
          
          statusCode: error.status || 500,
          success: false,
          errorMessage: error.message,
          
          responseTimeMs: Date.now() - startTime,
          
          metadata: {
            errorStack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
          },
        };

        this.writeAuditLog(auditEntry);
        
        throw error;
      }),
    );
  }

  private isPHIRoute(url: string): boolean {
    return PHI_ROUTES.some(route => url.startsWith(route));
  }

  private detectPHIFields(body: any): string[] {
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

  private classifyAction(
    method: string,
    url: string,
  ): AuditLogEntry['action'] {
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

  private extractResource(url: string): { resourceType: string | null; resourceId: string | null } {
    // Parse URL like /api/clients/123 -> { resourceType: 'clients', resourceId: '123' }
    const match = url.match(/\/api\/([^\/]+)(?:\/([^\/\?]+))?/);
    
    if (match) {
      return {
        resourceType: match[1],
        resourceId: match[2] || null,
      };
    }
    
    return { resourceType: null, resourceId: null };
  }

  private getClientIP(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0] ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.ip ||
      'unknown'
    );
  }

  private sanitizeParams(params: any): any {
    if (!params) return {};
    
    // Remove sensitive information from query params
    const sanitized = { ...params };
    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'ssn'];
    
    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
        sanitized[key] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }

  private countRecords(data: any): number | null {
    if (Array.isArray(data)) return data.length;
    if (data?.data && Array.isArray(data.data)) return data.data.length;
    if (data?.items && Array.isArray(data.items)) return data.items.length;
    return null;
  }

  private writeAuditLog(entry: AuditLogEntry): void {
    // Format as structured JSON for log aggregation
    const logLine = JSON.stringify(entry);
    
    // Write to dedicated audit logger
    // In production, this should go to immutable storage (S3 with Object Lock, etc.)
    this.logger.log(logLine);
    
    // Optional: Send to external audit service
    // this.sendToAuditService(entry);
  }
}

/**
 * Decorator for marking specific endpoints as PHI access points
 * 
 * Usage:
 * @PHIAccess(['ssn', 'dateOfBirth'])
 * @Get(':id')
 * async getClient(@Param('id') id: string) { ... }
 */
export function PHIAccess(fields: string[]): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    Reflect.defineMetadata('phi_fields', fields, descriptor.value);
    return descriptor;
  };
}
