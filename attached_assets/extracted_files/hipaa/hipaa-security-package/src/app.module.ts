/**
 * HIPAA-Compliant Application Module
 * 
 * Main NestJS module with all security features integrated.
 * Copy this structure to your main application.
 */

import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

// Security imports
import { RecaptchaGuard } from './guards/recaptcha.guard';
import { RBACGuard, ResourceOwnershipGuard } from './guards/rbac.guard';
import { HipaaAuditInterceptor } from './interceptors/hipaa-audit.interceptor';
import { SessionTimeoutMiddleware } from './middleware/session-timeout.middleware';
import { HttpsRedirectMiddleware } from './config/security.config';

// Your feature modules
// import { ClientsModule } from './clients/clients.module';
// import { CaregiversModule } from './caregivers/caregivers.module';
// import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting to prevent brute force attacks
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            name: 'short',
            ttl: 1000, // 1 second
            limit: 3,  // 3 requests per second
          },
          {
            name: 'medium',
            ttl: 10000, // 10 seconds
            limit: 20,  // 20 requests per 10 seconds
          },
          {
            name: 'long',
            ttl: 60000, // 1 minute
            limit: 100, // 100 requests per minute
          },
        ],
      }),
    }),

    // Database with SSL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get('DB_PORT', 5432),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        
        // Enable SSL in production
        ssl: config.get('NODE_ENV') === 'production' 
          ? { rejectUnauthorized: true }
          : false,
        
        // Entity and migration configuration
        autoLoadEntities: true,
        synchronize: config.get('NODE_ENV') !== 'production',
        
        // Logging (be careful not to log PHI)
        logging: config.get('NODE_ENV') !== 'production',
        
        // Connection pool
        extra: {
          max: 20,
          idleTimeoutMillis: 30000,
        },
      }),
    }),

    // Your feature modules
    // AuthModule,
    // ClientsModule,
    // CaregiversModule,
  ],
  
  providers: [
    // Global rate limiting
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    
    // Global RBAC (after authentication)
    {
      provide: APP_GUARD,
      useClass: RBACGuard,
    },
    
    // Global audit logging
    {
      provide: APP_INTERCEPTOR,
      useClass: HipaaAuditInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply HTTPS redirect globally
    consumer
      .apply(HttpsRedirectMiddleware)
      .forRoutes('*');
    
    // Apply session timeout to all authenticated routes
    consumer
      .apply(SessionTimeoutMiddleware)
      .exclude(
        'api/auth/login',
        'api/auth/register',
        'api/auth/forgot-password',
        'api/health',
      )
      .forRoutes('*');
  }
}

/**
 * Main.ts Bootstrap Configuration
 */
export const mainBootstrapCode = `
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { securityHeadersConfig } from './config/security.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Enable HTTPS in production
    httpsOptions: process.env.NODE_ENV === 'production' ? {
      key: fs.readFileSync('/path/to/private-key.pem'),
      cert: fs.readFileSync('/path/to/certificate.pem'),
    } : undefined,
    
    // Disable logging of request bodies (may contain PHI)
    logger: ['error', 'warn', 'log'],
  });

  const configService = app.get(ConfigService);

  // Security middleware
  app.use(helmet(securityHeadersConfig));
  
  // Compression
  app.use(compression());

  // CORS configuration
  app.enableCors({
    origin: configService.get('ALLOWED_ORIGINS', 'https://privateinhomecaregiver.com').split(','),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    maxAge: 86400, // 24 hours
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,           // Strip unknown properties
    forbidNonWhitelisted: true, // Throw error on unknown properties
    transform: true,           // Transform payloads to DTO instances
    transformOptions: {
      enableImplicitConversion: false, // Explicit type conversion only
    },
  }));

  // Global prefix
  app.setGlobalPrefix('api');

  // Trust proxy (if behind nginx/load balancer)
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  const port = configService.get('PORT', 3000);
  await app.listen(port);
  
  console.log(\`Application running on port \${port}\`);
}

bootstrap();
`;

/**
 * Example .env file for HIPAA compliance
 */
export const envExample = `
# Application
NODE_ENV=production
PORT=3000

# Database (Use strong passwords!)
DB_HOST=your-rds-instance.amazonaws.com
DB_PORT=5432
DB_USERNAME=app_user
DB_PASSWORD=<strong-random-password>
DB_NAME=private_caregivers

# Security Keys (Generate with: openssl rand -hex 32)
PHI_ENCRYPTION_KEY=<64-character-hex-string>
JWT_ACCESS_SECRET=<64-character-hex-string>
JWT_REFRESH_SECRET=<64-character-hex-string>
SESSION_SECRET=<64-character-hex-string>

# reCAPTCHA (from Google Console)
RECAPTCHA_SITE_KEY=<your-site-key>
RECAPTCHA_SECRET_KEY=<your-secret-key>
RECAPTCHA_THRESHOLD=0.5

# Session
SESSION_TIMEOUT_MINUTES=15

# CORS
ALLOWED_ORIGINS=https://privateinhomecaregiver.com,https://www.privateinhomecaregiver.com

# Audit Logging
AUDIT_LOG_BUCKET=s3://your-hipaa-audit-logs
`;
