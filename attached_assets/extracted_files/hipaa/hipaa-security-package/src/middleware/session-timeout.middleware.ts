/**
 * Session Timeout Middleware
 * 
 * Automatically logs out users after 15 minutes of inactivity.
 * This is a HIPAA requirement to prevent unauthorized access to PHI
 * from unattended workstations.
 * 
 * HIPAA Technical Safeguard: Automatic Logoff (§164.312(a)(2)(iii))
 */

import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

// Extend Express Request to include session properties
declare module 'express' {
  interface Request {
    session?: {
      lastActivity?: number;
      userId?: string;
      destroy?: (callback: (err?: Error) => void) => void;
    };
  }
}

@Injectable()
export class SessionTimeoutMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SessionTimeoutMiddleware.name);
  private readonly timeoutMs: number;
  private readonly warningMs: number;

  constructor(private configService: ConfigService) {
    // Default: 15 minutes (HIPAA recommendation)
    const timeoutMinutes = this.configService.get<number>(
      'SESSION_TIMEOUT_MINUTES',
      15,
    );
    this.timeoutMs = timeoutMinutes * 60 * 1000;
    
    // Warning at 2 minutes before timeout
    this.warningMs = this.timeoutMs - 2 * 60 * 1000;
  }

  use(req: Request, res: Response, next: NextFunction): void {
    // Skip for public routes
    if (this.isPublicRoute(req.path)) {
      return next();
    }

    const session = req.session;
    
    if (!session) {
      return next();
    }

    const now = Date.now();
    const lastActivity = session.lastActivity || now;
    const inactiveTime = now - lastActivity;

    // Check if session has timed out
    if (inactiveTime > this.timeoutMs) {
      this.logger.warn({
        event: 'session_timeout',
        userId: session.userId,
        inactiveMinutes: Math.round(inactiveTime / 60000),
        timestamp: new Date().toISOString(),
      });

      // Destroy the session
      if (session.destroy) {
        session.destroy((err) => {
          if (err) {
            this.logger.error('Failed to destroy timed-out session', err);
          }
        });
      }

      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Session expired due to inactivity',
        error: 'SESSION_TIMEOUT',
        code: 'SESSION_TIMEOUT',
      });
    }

    // Add warning header if approaching timeout
    if (inactiveTime > this.warningMs) {
      const remainingSeconds = Math.round((this.timeoutMs - inactiveTime) / 1000);
      res.setHeader('X-Session-Timeout-Warning', remainingSeconds.toString());
    }

    // Update last activity timestamp
    session.lastActivity = now;

    // Add timeout information to response headers (for frontend)
    res.setHeader('X-Session-Timeout', this.timeoutMs.toString());
    res.setHeader('X-Session-Remaining', (this.timeoutMs - inactiveTime).toString());

    next();
  }

  private isPublicRoute(path: string): boolean {
    const publicRoutes = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/forgot-password',
      '/api/auth/reset-password',
      '/api/health',
      '/api/public',
    ];

    return publicRoutes.some(route => path.startsWith(route));
  }
}

/**
 * Session Configuration for Express
 * 
 * Use this configuration when setting up express-session
 */
export const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  name: 'sessionId', // Don't use default 'connect.sid'
  resave: false,
  saveUninitialized: false,
  rolling: true, // Reset expiry on each request
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict' as const,
    maxAge: 15 * 60 * 1000, // 15 minutes
  },
};

/**
 * JWT Token Configuration for short-lived access tokens
 * 
 * For JWT-based auth, use short access tokens with refresh tokens
 */
export const jwtConfig = {
  // Access token: short-lived (15 minutes for HIPAA)
  accessToken: {
    expiresIn: '15m',
    secret: process.env.JWT_ACCESS_SECRET,
  },
  // Refresh token: longer-lived but requires re-authentication after extended periods
  refreshToken: {
    expiresIn: '7d',
    secret: process.env.JWT_REFRESH_SECRET,
  },
};

/**
 * Frontend Session Warning Component (React)
 * 
 * Include this in your React app to warn users before session timeout
 */
export const frontendSessionWarningCode = `
// SessionTimeoutWarning.tsx
import { useEffect, useState, useCallback } from 'react';

interface SessionTimeoutWarningProps {
  warningThresholdMs?: number; // Show warning when this much time is left
  onTimeout?: () => void;
  onExtendSession?: () => void;
}

export function SessionTimeoutWarning({
  warningThresholdMs = 120000, // 2 minutes
  onTimeout,
  onExtendSession,
}: SessionTimeoutWarningProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const checkSessionTimeout = useCallback(async () => {
    try {
      const response = await fetch('/api/session/status', {
        credentials: 'include',
      });
      
      const remaining = parseInt(
        response.headers.get('X-Session-Remaining') || '0',
        10
      );
      
      if (remaining <= 0) {
        onTimeout?.();
        return;
      }
      
      if (remaining <= warningThresholdMs) {
        setShowWarning(true);
        setRemainingSeconds(Math.ceil(remaining / 1000));
      } else {
        setShowWarning(false);
      }
    } catch (error) {
      console.error('Failed to check session status', error);
    }
  }, [warningThresholdMs, onTimeout]);

  useEffect(() => {
    const interval = setInterval(checkSessionTimeout, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [checkSessionTimeout]);

  useEffect(() => {
    if (!showWarning) return;
    
    const countdown = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          onTimeout?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(countdown);
  }, [showWarning, onTimeout]);

  if (!showWarning) return null;

  return (
    <div className="session-timeout-warning">
      <div className="warning-content">
        <h3>Session Expiring</h3>
        <p>
          Your session will expire in {remainingSeconds} seconds due to inactivity.
        </p>
        <div className="warning-actions">
          <button onClick={onExtendSession}>
            Continue Session
          </button>
          <button onClick={onTimeout}>
            Logout Now
          </button>
        </div>
      </div>
    </div>
  );
}
`;
