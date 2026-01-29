/**
 * reCAPTCHA v3 Guard for NestJS
 * 
 * This guard validates reCAPTCHA tokens on protected routes to prevent
 * bot attacks on sensitive endpoints (login, registration, intake forms).
 * 
 * HIPAA Relevance: Prevents automated attacks that could compromise PHI
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface RecaptchaResponse {
  success: boolean;
  score: number;
  action: string;
  challenge_ts: string;
  hostname: string;
  'error-codes'?: string[];
}

@Injectable()
export class RecaptchaGuard implements CanActivate {
  private readonly logger = new Logger(RecaptchaGuard.name);
  private readonly secretKey: string;
  private readonly scoreThreshold: number;

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get<string>('RECAPTCHA_SECRET_KEY');
    this.scoreThreshold = this.configService.get<number>('RECAPTCHA_THRESHOLD', 0.5);

    if (!this.secretKey) {
      this.logger.error('RECAPTCHA_SECRET_KEY is not configured!');
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['x-recaptcha-token'] || request.body?.recaptchaToken;

    // Log attempt for audit trail
    const clientIp = request.ip || request.connection?.remoteAddress;
    const userAgent = request.headers['user-agent'];

    if (!token) {
      this.logger.warn(`Missing reCAPTCHA token from IP: ${clientIp}`);
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Security verification required',
          error: 'RECAPTCHA_MISSING',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    try {
      const response = await axios.post<RecaptchaResponse>(
        'https://www.google.com/recaptcha/api/siteverify',
        null,
        {
          params: {
            secret: this.secretKey,
            response: token,
            remoteip: clientIp,
          },
          timeout: 5000,
        },
      );

      const { success, score, action } = response.data;

      // Log verification result for security audit
      this.logger.log({
        event: 'recaptcha_verification',
        ip: clientIp,
        userAgent,
        success,
        score,
        action,
        endpoint: request.url,
        method: request.method,
        timestamp: new Date().toISOString(),
      });

      if (!success) {
        this.logger.warn(`reCAPTCHA verification failed for IP: ${clientIp}`);
        throw new HttpException(
          {
            statusCode: HttpStatus.FORBIDDEN,
            message: 'Security verification failed',
            error: 'RECAPTCHA_FAILED',
          },
          HttpStatus.FORBIDDEN,
        );
      }

      if (score < this.scoreThreshold) {
        this.logger.warn(
          `Bot activity detected. IP: ${clientIp}, Score: ${score}`,
        );
        throw new HttpException(
          {
            statusCode: HttpStatus.FORBIDDEN,
            message: 'Automated access detected',
            error: 'BOT_DETECTED',
          },
          HttpStatus.FORBIDDEN,
        );
      }

      // Attach score to request for downstream logging
      request.recaptchaScore = score;
      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(`reCAPTCHA verification error: ${error.message}`);
      
      // Fail open vs fail closed decision - for HIPAA, we fail closed
      throw new HttpException(
        {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'Security verification temporarily unavailable',
          error: 'RECAPTCHA_SERVICE_ERROR',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}

/**
 * Decorator to apply reCAPTCHA protection to specific routes
 * 
 * Usage:
 * @UseGuards(RecaptchaGuard)
 * @Post('login')
 * async login(@Body() dto: LoginDto) { ... }
 */
