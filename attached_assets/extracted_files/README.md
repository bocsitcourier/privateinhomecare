# HIPAA Security Package for Private In-Home Caregivers

A comprehensive Node.js/NestJS security implementation for HIPAA compliance in Massachusetts home healthcare applications.

## 🏥 Overview

This package implements the three core **HIPAA Technical Safeguards**:

| Safeguard | Implementation | File |
|-----------|----------------|------|
| **Encryption** (§164.312(a)(2)(iv)) | AES-256-GCM field-level encryption | `encryption.util.ts` |
| **Transmission Security** (§164.312(e)(1)) | TLS 1.3, HTTPS enforcement | `security.config.ts` |
| **Access Control** (§164.312(a)(1)) | RBAC with least privilege | `rbac.guard.ts` |
| **Audit Controls** (§164.312(b)) | Immutable audit logging | `hipaa-audit.interceptor.ts` |
| **Automatic Logoff** (§164.312(a)(2)(iii)) | 15-minute session timeout | `session-timeout.middleware.ts` |
| **Bot Protection** | reCAPTCHA v3 integration | `recaptcha.guard.ts` |

---

## 📁 Package Structure

```
hipaa-security-package/
├── src/
│   ├── guards/
│   │   ├── recaptcha.guard.ts      # Bot protection
│   │   └── rbac.guard.ts           # Role-based access control
│   ├── utils/
│   │   └── encryption.util.ts      # PHI encryption/decryption
│   ├── interceptors/
│   │   └── hipaa-audit.interceptor.ts  # Audit trail logging
│   ├── middleware/
│   │   └── session-timeout.middleware.ts  # Auto-logout
│   ├── config/
│   │   └── security.config.ts      # TLS, headers, rate limiting
│   └── app.module.ts               # Integration example
└── docs/
    └── DEPLOYMENT_CHECKLIST.md     # Pre-launch checklist
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install @nestjs/config @nestjs/throttler helmet axios uuid
npm install -D @types/uuid
```

### 2. Set Environment Variables

Create a `.env` file:

```env
# Generate keys with: openssl rand -hex 32
PHI_ENCRYPTION_KEY=your-64-char-hex-key
JWT_ACCESS_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret

# reCAPTCHA (get from Google Console)
RECAPTCHA_SITE_KEY=your-site-key
RECAPTCHA_SECRET_KEY=your-secret-key

# Session timeout (HIPAA requires ≤15 minutes)
SESSION_TIMEOUT_MINUTES=15
```

### 3. Copy Files to Your Project

```bash
cp -r src/* your-project/src/
```

### 4. Import in Your Module

```typescript
import { HipaaAuditInterceptor } from './interceptors/hipaa-audit.interceptor';
import { RecaptchaGuard } from './guards/recaptcha.guard';
import { RBACGuard } from './guards/rbac.guard';

@Module({
  providers: [
    { provide: APP_INTERCEPTOR, useClass: HipaaAuditInterceptor },
    { provide: APP_GUARD, useClass: RBACGuard },
  ],
})
export class AppModule {}
```

---

## 🔐 Feature Documentation

### 1. Field-Level Encryption

Encrypt sensitive fields **before** storing in the database:

```typescript
import { encryptPHI, decryptPHI, PHITransformer } from './utils/encryption.util';

// Manual encryption
const encryptedSSN = encryptPHI('123-45-6789');
const ssn = decryptPHI(encryptedSSN);

// With TypeORM (automatic)
@Entity()
export class Client {
  @Column({ transformer: PHITransformer })
  ssn: string;
  
  @Column({ transformer: PHITransformer })
  dateOfBirth: string;
}
```

### 2. reCAPTCHA v3 Protection

Apply to login, registration, and intake forms:

```typescript
import { RecaptchaGuard } from './guards/recaptcha.guard';

@Controller('auth')
export class AuthController {
  @Post('login')
  @UseGuards(RecaptchaGuard)
  async login(@Body() dto: LoginDto) {
    // Bot requests are blocked before reaching here
  }
}
```

**Frontend Integration:**

```javascript
// Load reCAPTCHA v3
<script src="https://www.google.com/recaptcha/api.js?render=YOUR_SITE_KEY"></script>

// Execute before form submission
async function submitForm() {
  const token = await grecaptcha.execute('YOUR_SITE_KEY', { action: 'login' });
  
  await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-recaptcha-token': token,
    },
    body: JSON.stringify(formData),
  });
}
```

### 3. Role-Based Access Control

Define who can access what:

```typescript
import { Roles, RequirePermissions, UserRole, Permission } from './guards/rbac.guard';

@Controller('clients')
@UseGuards(JwtAuthGuard, RBACGuard)
export class ClientsController {
  // Caregivers see only assigned clients
  @Get(':id')
  @Roles(UserRole.CAREGIVER, UserRole.OFFICE_MANAGER)
  async getClient(@Param('id') id: string) {}
  
  // Only office managers can view SSN
  @Get(':id/ssn')
  @Roles(UserRole.OFFICE_MANAGER)
  @RequirePermissions(Permission.PHI_VIEW_SSN)
  async getSSN(@Param('id') id: string) {}
}
```

### 4. Audit Trail

Every PHI access is automatically logged:

```json
{
  "auditId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-01-28T14:30:00.000Z",
  "userId": "caregiver-123",
  "userRole": "caregiver",
  "action": "READ",
  "endpoint": "/api/clients/456",
  "phiAccessed": true,
  "phiFields": ["ssn", "dateOfBirth"],
  "ipAddress": "192.168.1.1",
  "success": true
}
```

Send logs to immutable storage (S3 with Object Lock).

---

## ☁️ AWS Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Route 53 (DNS)                           │
│                 privateinhomecaregiver.com                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CloudFront (CDN)                             │
│                    TLS 1.3 Termination                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Application Load Balancer (ALB)                    │
│                    WAF Protection                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     ECS Fargate                                 │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐       │
│  │   Container   │  │   Container   │  │   Container   │       │
│  │   (NestJS)    │  │   (NestJS)    │  │   (NestJS)    │       │
│  └───────────────┘  └───────────────┘  └───────────────┘       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Amazon RDS (PostgreSQL)                        │
│          Transparent Data Encryption (TDE) + SSL                │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│            S3 Bucket (Audit Logs)                               │
│            Object Lock (WORM) Enabled                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ Pre-Deployment Checklist

### Legal Requirements
- [ ] **BAA Signed** with AWS/GCP/Azure (required before hosting PHI)
- [ ] Privacy policy updated on website
- [ ] Employee HIPAA training completed

### Technical Requirements
- [ ] TLS 1.3 enabled (no HTTP allowed)
- [ ] Database encryption at rest (TDE)
- [ ] Field-level encryption for SSN, DOB, medical data
- [ ] 15-minute session timeout configured
- [ ] reCAPTCHA on all input forms
- [ ] RBAC: Caregivers see only assigned clients
- [ ] Audit logs sent to immutable storage
- [ ] Daily encrypted backups tested

### Security Testing
- [ ] Penetration test completed
- [ ] Vulnerability scan passed
- [ ] OWASP Top 10 mitigations verified

---

## 📞 Support

For questions about implementing HIPAA compliance for **privateinhomecaregiver.com**, consult with:

1. A HIPAA compliance specialist
2. Healthcare IT security consultant
3. AWS/GCP healthcare compliance team

---

## ⚠️ Disclaimer

This package provides technical implementations for HIPAA Technical Safeguards. HIPAA compliance requires additional **Administrative** and **Physical Safeguards** not covered here. Consult a qualified compliance professional before handling PHI.
