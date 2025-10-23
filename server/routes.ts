import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";
import express from "express";
import rateLimit from "express-rate-limit";
import { 
  insertJobSchema, updateJobSchema,
  insertArticleSchema, updateArticleSchema,
  insertInquirySchema, updateInquirySchema, replySchema,
  insertPageMetaSchema, updatePageMetaSchema,
  insertCaregiverSchema, updateCaregiverSchema,
  insertJobApplicationSchema,
  insertIntakeFormSchema, updateIntakeFormSchema,
  insertCaregiverLogSchema, updateCaregiverLogSchema,
  insertHipaaAcknowledgmentSchema, updateHipaaAcknowledgmentSchema,
  insertLeadMagnetSchema,
  insertReferralSchema, updateReferralSchema,
  type PageMeta
} from "@shared/schema";
import DOMPurify from 'isomorphic-dompurify';
import { 
  hashPassword, verifyPassword, 
  generateRecoveryCode, hashRecoveryCode, verifyRecoveryCode 
} from "./auth-utils";
import { 
  sendEmail, 
  generateApplicationNotificationEmail,
  generateInquiryNotificationEmail,
  generateReferralNotificationEmail, 
  generateInquiryReplyEmail
} from "./email-utils";
import { z } from "zod";
import { 
  sanitizeHeaders, 
  validateContentType, 
  detectSQLInjection, 
  detectXSS,
  auditLog,
  sanitizeErrors
} from "./api-hardening";
import dotenv from 'dotenv';

dotenv.config();

declare module 'express-session' {
  interface SessionData {
    isAuthenticated?: boolean;
    userId?: string;
  }
}

// Seed admin user on startup
async function seedAdminUser() {
  try {
    const existingUser = await storage.getUserByUsername("admin");
    if (existingUser) {
      console.log("[STARTUP] Admin user already exists");
      return;
    }

    const hashedPassword = await hashPassword("demo123");
    const user = await storage.createUser({
      username: "admin",
      password: hashedPassword
    });

    const recoveryCodes: string[] = [];
    const codeHashes: string[] = [];
    
    for (let i = 0; i < 8; i++) {
      const code = generateRecoveryCode();
      recoveryCodes.push(code);
      const hash = await hashRecoveryCode(code);
      codeHashes.push(hash);
    }
    
    await storage.createRecoveryCodes(user.id, codeHashes);
    
    console.log("[STARTUP] ✓ Admin user created - Username: admin, Password: demo123");
    console.log("[STARTUP] ✓ Recovery codes generated:", recoveryCodes.length);
  } catch (error: any) {
    console.error("[STARTUP] ✗ Failed to seed admin user:", error.message);
  }
}

async function seedDemoArticles() {
  try {
    const existingArticles = await storage.listArticles('published');
    if (existingArticles.length > 0) {
      console.log("[STARTUP] Articles already exist");
      return;
    }

    const demoArticles = [
      {
        title: "Creating a Safe Home for Older Adults This Holiday Season",
        slug: "safe-home-older-adults-holiday",
        excerpt: "As families gather during the holidays, learn how to identify and address household hazards to ensure your aging loved ones can stay safe and independent at home.",
        body: `<p>The holidays are a time when families often visit aging loved ones, making it the perfect opportunity to assess their living situation. Research shows that while 90% of seniors want to age in place, nearly 65% live in homes with at least one safety hazard. This guide will help you identify and address common risks room by room.</p>

<h2>Bedroom Safety</h2>
<p>Ensure the bed is at the right height - feet should touch the floor when sitting. Install nightlights to prevent falls during nighttime bathroom trips. Remove throw rugs and ensure clear pathways around the bed.</p>

<h2>Bathroom</h2>
<p>Add grab bars near the toilet and in the shower. Use non-slip mats and consider a raised toilet seat for easier use. Ensure adequate lighting and remove any clutter that could cause trips.</p>

<h2>Living Room</h2>
<p>Secure furniture that could tip over. Remove clutter and ensure clear pathways. Keep the thermostat accessible and set to a safe temperature between 68-70°F.</p>

<h2>Kitchen</h2>
<p>Ensure adequate lighting and store frequently used items within easy reach. Check that smoke detectors are working and consider automatic shut-off devices for the stove.</p>

<h2>Stairs</h2>
<p>Install sturdy handrails on both sides. Consider a stairlift if mobility is limited. Ensure proper lighting at top and bottom of stairs.</p>`,
        category: "Safety",
        keywords: ["home safety", "fall prevention", "aging in place", "senior safety", "holiday safety"],
        metaTitle: "Home Safety Tips for Older Adults | Holiday Season Guide",
        metaDescription: "Essential home safety checklist for older adults during the holidays. Learn how to identify and fix household hazards to prevent falls and ensure independence.",
        status: "published"
      },
      {
        title: "A Caregiver's Guide to Alzheimer's Care in Massachusetts",
        slug: "alzheimers-care-guide-massachusetts",
        excerpt: "A comprehensive guide for Massachusetts caregivers navigating Alzheimer's care, from understanding disease stages to finding local resources and support services.",
        body: `<p>Caring for someone with Alzheimer's disease in Massachusetts requires understanding both the progression of the disease and the resources available in our state.</p>

<h2>Understanding the Stages</h2>
<h3>Early Stage (Mild)</h3>
<p>Memory lapses, difficulty with complex tasks, mild confusion about time and place. People can still drive, work, and participate in social activities with some assistance.</p>

<h3>Middle Stage (Moderate)</h3>
<p>Increased memory loss, difficulty recognizing family members, behavioral changes, and wandering. More assistance needed with daily activities.</p>

<h3>Late Stage (Severe)</h3>
<p>Severe memory impairment, limited mobility, difficulty communicating, and need for full-time care.</p>

<h2>Massachusetts Care Options</h2>
<p><strong>In-Home Care:</strong> Professional caregivers provide assistance at home, allowing your loved one to remain in familiar surroundings.</p>
<p><strong>MassHealth Programs:</strong> State assistance for eligible seniors, including the MassHealth Home Care program.</p>
<p><strong>Memory Care Facilities:</strong> Specialized environments designed for advanced stages with 24/7 support.</p>

<h2>Local Resources</h2>
<ul>
<li>Massachusetts Alzheimer's Association (24/7 helpline: 800-272-3900)</li>
<li>Aging Services Access Points (ASAPs) throughout the state</li>
<li>Veterans benefits for those who served</li>
<li>Local support groups and respite care services</li>
</ul>

<h2>Legal Planning</h2>
<p>Ensure you have Health Care Proxy and Power of Attorney documents in place while your loved one can still participate in decisions. Massachusetts offers specific forms for these documents.</p>

<h2>Support for Caregivers</h2>
<p>Join support groups through local ASAPs or the Alzheimer's Association. Remember that caring for yourself is essential to caring for others. Take advantage of respite care services to prevent burnout.</p>`,
        category: "Alzheimer's & Dementia",
        keywords: ["Alzheimer's care", "dementia support", "Massachusetts resources", "caregiver guide", "memory care"],
        metaTitle: "Alzheimer's Care Guide for Massachusetts Caregivers",
        metaDescription: "Complete guide to Alzheimer's care in Massachusetts. Find local resources, understand disease stages, and get caregiver support for dementia care.",
        status: "published"
      }
    ];

    for (const articleData of demoArticles) {
      await storage.createArticle(articleData);
    }

    console.log(`[STARTUP] ✓ Demo articles created: ${demoArticles.length}`);
  } catch (error: any) {
    console.error("[STARTUP] ✗ Failed to seed demo articles:", error.message);
  }
}

const rateLimitHandler = (req: Request, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress;
  console.warn(`[SECURITY] Rate limit exceeded for IP: ${ip} on ${req.method} ${req.path}`);
  res.status(429).json({ 
    error: "Too many requests. Please try again later.",
    retryAfter: res.getHeader('Retry-After')
  });
};

const publicFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many submissions. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: (req) => process.env.NODE_ENV !== 'production',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many login attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skipSuccessfulRequests: true,
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { error: "Too many password reset attempts. Please try again in 1 hour." },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.session?.isAuthenticated) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized. Please login." });
  }
};

const DISPOSABLE_EMAIL_DOMAINS = [
  'tempmail.com', 'guerrillamail.com', '10minutemail.com', 'throwaway.email',
  'mailinator.com', 'maildrop.cc', 'temp-mail.org', 'getnada.com',
  'trashmail.com', 'yopmail.com', 'fakeinbox.com', 'sharklasers.com',
  'guerrillamailblock.com', 'spam4.me', 'mintemail.com', 'emailondeck.com',
  'getairmail.com', 'mailnesia.com', 'mytemp.email', 'mohmal.com'
];

function checkHoneypot(honeypotValue: any, req: Request): boolean {
  if (honeypotValue && typeof honeypotValue === 'string' && honeypotValue.trim().length > 0) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    console.warn(`[SECURITY] Honeypot field filled - likely spam bot detected from IP: ${ip}`);
    return true;
  }
  return false;
}

function isDisposableEmail(email: string): boolean {
  const domain = email.toLowerCase().split('@')[1];
  return DISPOSABLE_EMAIL_DOMAINS.includes(domain);
}

async function verifyCaptcha(token: string): Promise<{ success: boolean; error?: string }> {
  const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (!recaptchaSecret) {
    if (isProduction) {
      return { success: false, error: "Server configuration error. Please contact support." };
    }
    return { success: true };
  }
  
  try {
    const verifyResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${recaptchaSecret}&response=${token}`
    });
    const verifyData = await verifyResponse.json();
    
    if (!verifyData.success) {
      return { success: false, error: "CAPTCHA verification failed. Please try again." };
    }
    return { success: true };
  } catch (error) {
    console.error('CAPTCHA verification error:', error);
    return { success: false, error: "Failed to verify CAPTCHA. Please try again." };
  }
}

const uploadStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: uploadStorage,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

const resumeUpload = multer({
  storage: uploadStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for resumes
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedMimeTypes.includes(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed for resumes'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Seed admin user and demo articles on startup
  await seedAdminUser();
  await seedDemoArticles();
  
  // ============================================================================
  // SECURITY HARDENING MIDDLEWARE - Applied globally
  // ============================================================================
  
  // Sanitize response headers (prevent information leakage)
  app.use(sanitizeHeaders);
  
  // Validate content types for POST/PUT/PATCH requests
  app.use(validateContentType);
  
  // Detect SQL injection attempts
  app.use(detectSQLInjection);
  
  // Detect XSS attack attempts
  app.use(detectXSS);
  
  // Audit logging for sensitive operations
  app.use(auditLog);
  
  app.use('/api', generalApiLimiter);
  
  app.use('/uploads', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  });
  app.use('/uploads', express.static('uploads'));
  
  app.post("/api/auth/login", authLimiter, async (req, res) => {
    try {
      const { username, password, captchaToken } = req.body;
      
      // Defensive: check for required fields
      if (!password || typeof password !== 'string') {
        return res.status(400).json({ error: "Password is required" });
      }
      
      // Check if CAPTCHA is configured on the server
      const captchaConfigured = !!process.env.RECAPTCHA_SECRET_KEY;
      
      // Require CAPTCHA token if CAPTCHA is configured
      if (captchaConfigured) {
        if (!captchaToken || typeof captchaToken !== 'string') {
          return res.status(400).json({ error: "CAPTCHA verification required" });
        }
        
        // Verify CAPTCHA with defensive error handling
        let captchaResult;
        try {
          captchaResult = await verifyCaptcha(captchaToken);
        } catch (captchaError: any) {
          console.error("[AUTH] CAPTCHA verification error:", captchaError);
          return res.status(500).json({ error: "CAPTCHA verification failed. Please try again." });
        }
        
        if (!captchaResult?.success) {
          return res.status(400).json({ error: captchaResult?.error || "CAPTCHA verification failed" });
        }
      }
      
      // Get user with defensive fallback
      const user = await storage.getUserByUsername(username?.trim() || "admin");
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Verify password with defensive error handling
      let isValidPassword = false;
      try {
        isValidPassword = await verifyPassword(password.trim(), user.password);
      } catch (pwError: any) {
        console.error("[AUTH] Password verification error:", pwError);
        return res.status(500).json({ error: "Authentication failed. Please try again." });
      }
      
      if (isValidPassword) {
        // Defensive: ensure session is available
        if (!req.session) {
          console.error("[AUTH] Session not available");
          return res.status(500).json({ error: "Session error. Please refresh and try again." });
        }
        
        req.session.isAuthenticated = true;
        req.session.userId = user.id;
        
        // Save session with callback to ensure it's persisted
        req.session.save((err) => {
          if (err) {
            console.error("[AUTH] Session save error:", err);
            return res.status(500).json({ error: "Login failed. Please try again." });
          }
          res.json({ success: true });
        });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (error: any) {
      console.error("[AUTH] Login error:", error);
      res.status(500).json({ error: "An error occurred during login. Please try again." });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      // Defensive: check if session exists
      if (!req.session) {
        return res.json({ success: true });
      }
      
      req.session.destroy((err) => {
        if (err) {
          console.error("[AUTH] Logout error:", err);
          return res.status(500).json({ error: "Failed to logout" });
        }
        res.json({ success: true });
      });
    } catch (error: any) {
      console.error("[AUTH] Logout error:", error);
      res.status(500).json({ error: "An error occurred during logout" });
    }
  });

  app.get("/api/auth/check", async (req, res) => {
    try {
      // Defensive: safely check session
      const authenticated = !!(req.session?.isAuthenticated && req.session?.userId);
      res.json({ authenticated });
    } catch (error: any) {
      console.error("[AUTH] Check auth error:", error);
      res.json({ authenticated: false });
    }
  });

  const changePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

  app.patch("/api/admin/profile/password", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "User session not found" });
      }

      const data = changePasswordSchema.parse(req.body);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const isValidPassword = await verifyPassword(data.currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      const hashedPassword = await hashPassword(data.newPassword);
      await storage.updateUserPassword(userId, hashedPassword);
      
      req.session.destroy(() => {});
      
      res.json({ success: true, message: "Password changed successfully. Please login again." });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors[0]?.message || "Validation failed" });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/profile/recovery-codes", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "User session not found" });
      }

      await storage.deleteRecoveryCodes(userId);
      
      const recoveryCodes: string[] = [];
      const codeHashes: string[] = [];
      
      for (let i = 0; i < 8; i++) {
        const code = generateRecoveryCode();
        recoveryCodes.push(code);
        const hash = await hashRecoveryCode(code);
        codeHashes.push(hash);
      }
      
      await storage.createRecoveryCodes(userId, codeHashes);
      
      res.json({ 
        codes: recoveryCodes,
        message: "Recovery codes generated. Save these in a secure location." 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/seed-admin", async (req, res) => {
    try {
      const existingUser = await storage.getUserByUsername("admin");
      if (existingUser) {
        return res.status(400).json({ error: "Admin user already exists" });
      }

      const hashedPassword = await hashPassword("demo123");
      const user = await storage.createUser({
        username: "admin",
        password: hashedPassword
      });

      const recoveryCodes: string[] = [];
      const codeHashes: string[] = [];
      
      for (let i = 0; i < 8; i++) {
        const code = generateRecoveryCode();
        recoveryCodes.push(code);
        const hash = await hashRecoveryCode(code);
        codeHashes.push(hash);
      }
      
      await storage.createRecoveryCodes(user.id, codeHashes);
      
      res.json({ 
        success: true, 
        message: "Admin user created successfully",
        username: "admin",
        password: "demo123",
        recoveryCodes: recoveryCodes 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/upload", requireAuth, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ 
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/upload-resume", publicFormLimiter, resumeUpload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ 
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/inquiries", publicFormLimiter, async (req, res) => {
    try {
      const { captchaToken, website, ...inquiryData } = req.body;
      
      if (checkHoneypot(website, req)) {
        return res.status(400).json({ error: "Invalid submission" });
      }
      
      if (inquiryData.email && isDisposableEmail(inquiryData.email)) {
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        console.warn(`[SECURITY] Disposable email domain blocked: ${inquiryData.email} from IP: ${ip}`);
        return res.status(400).json({ error: "Please use a permanent email address" });
      }
      
      if (!captchaToken) {
        return res.status(400).json({ error: "CAPTCHA verification required" });
      }
      
      const captchaResult = await verifyCaptcha(captchaToken);
      if (!captchaResult.success) {
        return res.status(400).json({ error: captchaResult.error || "CAPTCHA verification failed" });
      }
      
      const data = insertInquirySchema.parse(inquiryData);
      const inquiry = await storage.createInquiry(data);
      
      // Send email notification
      const hrEmail = process.env.HR_EMAIL || 'info@privateinhomecaregiver.com';
      const emailHtml = generateInquiryNotificationEmail({
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        service: inquiry.service || undefined,
        message: inquiry.message || undefined,
      });
      
      await sendEmail({
        to: hrEmail,
        subject: `New Consultation Request - ${inquiry.name}`,
        html: emailHtml,
      });
      
      res.json(inquiry);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/pages", async (req, res) => {
    try {
      const pages = await storage.listPageMeta();
      res.json(pages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/pages/seed", requireAuth, async (req, res) => {
    try {
      const CITIES = [
        'andover', 'arlington', 'barnstable', 'berkshires', 'beverly', 'boston', 'brookline',
        'charlestown', 'chatham', 'falmouth', 'gloucester', 'haverhill', 'lawrence', 'lexington',
        'lowell', 'marblehead', 'mashpee', 'melrose', 'methuen', 'newton', 'northborough',
        'plymouth', 'quincy', 'salem', 'seacoast', 'somerville', 'springfield', 'waltham',
        'wellesley', 'westport', 'worcester'
      ];

      const pages = [
        {
          pageSlug: 'home',
          title: 'PrivateInHomeCareGiver — In-Home Care in Massachusetts',
          description: 'Private in-home personal care, companionship, homemaking and dementia care across Massachusetts. Professional, compassionate caregivers serving families throughout the state.',
          keywords: ['in-home care Massachusetts', 'personal care assistant', 'senior care', 'elderly care', 'home health aide']
        },
        {
          pageSlug: 'services',
          title: 'Home Care Services in Massachusetts | PrivateInHomeCareGiver',
          description: 'Comprehensive in-home care services including personal care, companionship, homemaking, and specialized dementia support. Serving families throughout Massachusetts with compassionate, professional caregivers.',
          keywords: ['home care services', 'personal care', 'companionship', 'dementia care', 'homemaking services']
        },
        {
          pageSlug: 'consultation',
          title: 'Request Free Consultation | PrivateInHomeCareGiver',
          description: 'Request a free, no-obligation consultation to discuss your home care needs. Our team will work with you to create a personalized care plan for your loved one.',
          keywords: ['free consultation', 'care assessment', 'home care consultation', 'personalized care plan']
        },
        {
          pageSlug: 'caregivers',
          title: 'Find Caregivers in Massachusetts | PrivateInHomeCareGiver',
          description: 'Browse our network of experienced, certified caregivers across Massachusetts. Find the perfect match for your family\'s needs.',
          keywords: ['find caregiver', 'hire caregiver', 'certified caregiver', 'experienced caregiver Massachusetts']
        },
        {
          pageSlug: 'careers',
          title: 'Careers — PrivateInHomeCareGiver',
          description: 'Join our team of compassionate caregivers. Browse available positions in Massachusetts.',
          keywords: ['caregiver jobs', 'home care careers', 'PCA jobs Massachusetts', 'caregiver employment']
        },
        {
          pageSlug: 'articles',
          title: 'Articles & Resources | PrivateInHomeCareGiver',
          description: 'Read our latest articles about in-home care, caregiver tips, and resources for families in Massachusetts.',
          keywords: ['home care articles', 'caregiver tips', 'senior care resources', 'elderly care advice']
        }
      ];

      for (const citySlug of CITIES) {
        const cityName = citySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        pages.push({
          pageSlug: `city-${citySlug}`,
          title: `${cityName} In-Home Care Services | PrivateInHomeCareGiver`,
          description: `Professional in-home care services in ${cityName}, MA. Personal care, companionship, homemaking, and specialized dementia care from trusted local caregivers.`,
          keywords: [
            `${cityName} home care`,
            `${cityName} elder care`,
            `${cityName} caregiver`,
            `${cityName} senior care`,
            `${cityName} personal care assistant`
          ]
        });
      }

      const created: PageMeta[] = [];
      for (const page of pages) {
        const existing = await storage.getPageMeta(page.pageSlug);
        if (!existing) {
          const meta = await storage.upsertPageMeta(page);
          created.push(meta);
        }
      }

      res.json({ 
        message: `Seeded ${created.length} new page metadata entries`,
        created: created.length,
        total: pages.length
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/jobs", requireAuth, async (req, res) => {
    try {
      const { status } = req.query;
      const jobs = await storage.listJobs(status as string | undefined);
      res.json(jobs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/jobs/:id", requireAuth, async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/jobs", requireAuth, async (req, res) => {
    try {
      const data = insertJobSchema.parse(req.body);
      const job = await storage.createJob(data);
      res.json(job);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/jobs/:id", requireAuth, async (req, res) => {
    try {
      const data = updateJobSchema.parse(req.body);
      const job = await storage.updateJob(req.params.id, data);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/admin/jobs/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteJob(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/jobs/:id/publish", requireAuth, async (req, res) => {
    try {
      const job = await storage.publishJob(req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/jobs/:id/unpublish", requireAuth, async (req, res) => {
    try {
      const job = await storage.unpublishJob(req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/articles", requireAuth, async (req, res) => {
    try {
      const { status } = req.query;
      const articles = await storage.listArticles(status as string | undefined);
      res.json(articles);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/articles/:id", requireAuth, async (req, res) => {
    try {
      const article = await storage.getArticle(req.params.id);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }
      res.json(article);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/articles", async (req, res) => {
    try {
      const articles = await storage.listArticles('published');
      res.json(articles);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/articles/:slug", async (req, res) => {
    try {
      const article = await storage.getArticleBySlug(req.params.slug);
      if (!article || article.status !== 'published') {
        return res.status(404).json({ error: "Article not found" });
      }
      res.json(article);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/articles", requireAuth, async (req, res) => {
    try {
      const data = insertArticleSchema.parse(req.body);
      // Sanitize HTML content to prevent XSS attacks
      const sanitizedData = {
        ...data,
        body: DOMPurify.sanitize(data.body, {
          ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'iframe', 'hr', 'span', 'div'],
          ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style', 'target', 'rel', 'width', 'height', 'colspan', 'rowspan', 'align', 'frameborder', 'allow', 'allowfullscreen'],
          // Only allow HTTPS URLs for images and iframes, plus mailto/tel for links
          ALLOWED_URI_REGEXP: /^(?:https:|mailto:|tel:)/i,
          // Add iframe sandbox for YouTube embeds
          ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'],
        }),
      };
      const article = await storage.createArticle(sanitizedData);
      res.json(article);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/articles/:id", requireAuth, async (req, res) => {
    try {
      const data = updateArticleSchema.parse(req.body);
      // Sanitize HTML content to prevent XSS attacks
      const sanitizedData = {
        ...data,
        body: data.body ? DOMPurify.sanitize(data.body, {
          ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'iframe', 'hr', 'span', 'div'],
          ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style', 'target', 'rel', 'width', 'height', 'colspan', 'rowspan', 'align', 'frameborder', 'allow', 'allowfullscreen'],
          // Only allow HTTPS URLs for images and iframes, plus mailto/tel for links
          ALLOWED_URI_REGEXP: /^(?:https:|mailto:|tel:)/i,
          // Add iframe sandbox for YouTube embeds
          ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'],
        }) : data.body,
      };
      const article = await storage.updateArticle(req.params.id, sanitizedData);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }
      res.json(article);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/admin/articles/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteArticle(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Article not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/articles/:id/publish", requireAuth, async (req, res) => {
    try {
      const article = await storage.publishArticle(req.params.id);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }
      res.json(article);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/articles/:id/unpublish", requireAuth, async (req, res) => {
    try {
      const article = await storage.unpublishArticle(req.params.id);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }
      res.json(article);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/inquiries", requireAuth, async (req, res) => {
    try {
      const { status } = req.query;
      const inquiries = await storage.listInquiries(status as string | undefined);
      res.json(inquiries);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/inquiries/:id", requireAuth, async (req, res) => {
    try {
      const inquiry = await storage.getInquiry(req.params.id);
      if (!inquiry) {
        return res.status(404).json({ error: "Inquiry not found" });
      }
      res.json(inquiry);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/inquiries/:id/status", requireAuth, async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      const inquiry = await storage.updateInquiryStatus(req.params.id, status);
      if (!inquiry) {
        return res.status(404).json({ error: "Inquiry not found" });
      }
      res.json(inquiry);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/inquiries/:id/replies", requireAuth, async (req, res) => {
    try {
      const data = replySchema.parse(req.body);
      const inquiry = await storage.addInquiryReply(req.params.id, data);
      if (!inquiry) {
        return res.status(404).json({ error: "Inquiry not found" });
      }

      await sendEmail({
        to: inquiry.email,
        subject: `Inquiry Reply: ${inquiry.name || 'Your Inquiry'}`,
        html: generateInquiryReplyEmail(inquiry, data.body),
      });
      if (!inquiry) {
        return res.status(404).json({ error: "Inquiry not found" });
      }
      res.json(inquiry);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/admin/inquiries/:id", requireAuth, async (req, res) => {
    try {
      const data = updateInquirySchema.parse(req.body);
      const inquiry = await storage.updateInquiry(req.params.id, data);
      if (!inquiry) {
        return res.status(404).json({ error: "Inquiry not found" });
      }
      res.json(inquiry);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/pages", requireAuth, async (req, res) => {
    try {
      const pages = await storage.listPageMeta();
      res.json(pages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/pages/:slug", requireAuth, async (req, res) => {
    try {
      const page = await storage.getPageMeta(req.params.slug);
      if (!page) {
        return res.status(404).json({ error: "Page metadata not found" });
      }
      res.json(page);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/pages", requireAuth, async (req, res) => {
    try {
      const data = req.body.id 
        ? updatePageMetaSchema.parse(req.body)
        : insertPageMetaSchema.parse(req.body);
      const page = await storage.upsertPageMeta(data);
      res.json(page);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/admin/pages/:slug", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deletePageMeta(req.params.slug);
      if (!deleted) {
        return res.status(404).json({ error: "Page metadata not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/caregivers", async (req, res) => {
    try {
      const { location, minRate, maxRate } = req.query;
      const filters = {
        location: location as string | undefined,
        minRate: minRate ? parseInt(minRate as string) : undefined,
        maxRate: maxRate ? parseInt(maxRate as string) : undefined,
        status: 'active'
      };
      const caregivers = await storage.listCaregivers(filters);
      res.json(caregivers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/caregivers/:id", async (req, res) => {
    try {
      const caregiver = await storage.getCaregiver(req.params.id);
      if (!caregiver || caregiver.status !== 'active') {
        return res.status(404).json({ error: "Caregiver not found" });
      }
      res.json(caregiver);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/caregivers", requireAuth, async (req, res) => {
    try {
      const { status } = req.query;
      const filters = status ? { status: status as string } : undefined;
      const caregivers = await storage.listCaregivers(filters);
      res.json(caregivers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/caregivers/:id", requireAuth, async (req, res) => {
    try {
      const caregiver = await storage.getCaregiver(req.params.id);
      if (!caregiver) {
        return res.status(404).json({ error: "Caregiver not found" });
      }
      res.json(caregiver);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/caregivers", requireAuth, async (req, res) => {
    try {
      const data = insertCaregiverSchema.parse(req.body);
      const caregiver = await storage.createCaregiver(data);
      res.json(caregiver);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/caregivers/:id", requireAuth, async (req, res) => {
    try {
      const data = updateCaregiverSchema.parse(req.body);
      const caregiver = await storage.updateCaregiver(req.params.id, data);
      if (!caregiver) {
        return res.status(404).json({ error: "Caregiver not found" });
      }
      res.json(caregiver);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/admin/caregivers/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteCaregiver(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Caregiver not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/caregivers/:id/publish", requireAuth, async (req, res) => {
    try {
      const caregiver = await storage.publishCaregiver(req.params.id);
      if (!caregiver) {
        return res.status(404).json({ error: "Caregiver not found" });
      }
      res.json(caregiver);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/caregivers/:id/unpublish", requireAuth, async (req, res) => {
    try {
      const caregiver = await storage.unpublishCaregiver(req.params.id);
      if (!caregiver) {
        return res.status(404).json({ error: "Caregiver not found" });
      }
      res.json(caregiver);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.listJobs('published');
      res.json(jobs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job || job.status !== 'published') {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/jobs/:id/apply", publicFormLimiter, async (req, res) => {
    try {
      const { website, ...requestBody } = req.body;
      
      if (checkHoneypot(website, req)) {
        return res.status(400).json({ error: "Invalid submission" });
      }
      
      if (requestBody.email && isDisposableEmail(requestBody.email)) {
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        console.warn(`[SECURITY] Disposable email domain blocked: ${requestBody.email} from IP: ${ip}`);
        return res.status(400).json({ error: "Please use a permanent email address" });
      }
      
      // Validate that the job exists and is published
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      if (job.status !== 'published') {
        return res.status(400).json({ error: "This job is no longer accepting applications" });
      }

      // Parse and validate the request data (including CAPTCHA token)
      const data = insertJobApplicationSchema.parse({
        ...requestBody,
        jobId: req.params.id
      });

      // Server-side CAPTCHA validation
      const captchaResult = await verifyCaptcha(data.captchaToken);
      if (!captchaResult.success) {
        const statusCode = captchaResult.error?.includes("configuration") ? 500 : 400;
        return res.status(statusCode).json({ error: captchaResult.error });
      }

      // Remove captchaToken before storing (it's not part of the database schema)
      const { captchaToken, ...applicationData } = data;
      const application = await storage.createJobApplication(applicationData);
      
      // Send email notification to HR
      const hrEmail = process.env.HR_EMAIL || 'hr@example.com';
      const emailHtml = generateApplicationNotificationEmail({
        fullName: application.fullName,
        email: application.email,
        phone: application.phone,
        jobTitle: job.title,
        address: application.address || undefined,
        backgroundScreeningConsent: application.backgroundScreeningConsent || undefined,
        certificationType: application.certificationType || undefined,
        drivingStatus: application.drivingStatus || undefined,
        availability: application.availability || undefined,
        startDate: application.startDate || undefined,
        yearsExperience: application.yearsExperience || undefined,
        specialSkills: application.specialSkills || undefined,
        resumeUrl: application.resumeUrl || undefined,
        coverLetter: application.coverLetter || undefined,
      });
      
      await sendEmail({
        to: hrEmail,
        subject: `New Job Application: ${job.title} - ${application.fullName}`,
        html: emailHtml,
      });
      
      res.json(application);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/jobs/general-apply", publicFormLimiter, async (req, res) => {
    try {
      const { website, ...requestBody } = req.body;
      
      if (checkHoneypot(website, req)) {
        return res.status(400).json({ error: "Invalid submission" });
      }
      
      if (requestBody.email && isDisposableEmail(requestBody.email)) {
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        console.warn(`[SECURITY] Disposable email domain blocked: ${requestBody.email} from IP: ${ip}`);
        return res.status(400).json({ error: "Please use a permanent email address" });
      }

      // Parse and validate the request data (including CAPTCHA token)
      // For general applications, jobId is null and positionInterested holds the desired position
      const data = insertJobApplicationSchema.parse({
        ...requestBody,
        jobId: null
      });

      // Server-side CAPTCHA validation
      const captchaResult = await verifyCaptcha(data.captchaToken);
      if (!captchaResult.success) {
        const statusCode = captchaResult.error?.includes("configuration") ? 500 : 400;
        return res.status(statusCode).json({ error: captchaResult.error });
      }

      // Remove captchaToken before storing (it's not part of the database schema)
      const { captchaToken, ...applicationData } = data;
      const application = await storage.createJobApplication(applicationData);
      
      // Send email notification to HR
      const hrEmail = process.env.HR_EMAIL || 'hr@example.com';
      const emailHtml = generateApplicationNotificationEmail({
        fullName: application.fullName,
        email: application.email,
        phone: application.phone,
        jobTitle: application.positionInterested || "General Application",
        address: application.address || undefined,
        backgroundScreeningConsent: application.backgroundScreeningConsent || undefined,
        certificationType: application.certificationType || undefined,
        drivingStatus: application.drivingStatus || undefined,
        availability: application.availability || undefined,
        startDate: application.startDate || undefined,
        yearsExperience: application.yearsExperience || undefined,
        specialSkills: application.specialSkills || undefined,
        resumeUrl: application.resumeUrl || undefined,
        coverLetter: application.coverLetter || undefined,
      });
      
      await sendEmail({
        to: hrEmail,
        subject: `New General Job Application - ${application.fullName}`,
        html: emailHtml,
      });
      
      res.json(application);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/applications", requireAuth, async (req, res) => {
    try {
      const { jobId } = req.query;
      const applications = await storage.listJobApplications(jobId as string | undefined);
      res.json(applications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/applications/:id/status", requireAuth, async (req, res) => {
    try {
      const { status } = req.body;
      const application = await storage.updateJobApplicationStatus(req.params.id, status);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.json(application);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/intake", publicFormLimiter, async (req, res) => {
    try {
      const { website, ...requestBody } = req.body;
      
      if (checkHoneypot(website, req)) {
        return res.status(400).json({ error: "Invalid submission" });
      }
      
      if (requestBody.clientEmail && isDisposableEmail(requestBody.clientEmail)) {
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        console.warn(`[SECURITY] Disposable email domain blocked: ${requestBody.clientEmail} from IP: ${ip}`);
        return res.status(400).json({ error: "Please use a permanent email address" });
      }

      const data = insertIntakeFormSchema.parse(requestBody);

      const captchaResult = await verifyCaptcha(data.captchaToken);
      if (!captchaResult.success) {
        const statusCode = captchaResult.error?.includes("configuration") ? 500 : 400;
        return res.status(statusCode).json({ error: captchaResult.error });
      }

      const { captchaToken, ...formData } = data;
      const form = await storage.createIntakeForm(formData);
      res.json(form);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/caregiver-log", publicFormLimiter, async (req, res) => {
    try {
      const { website, ...requestBody } = req.body;
      
      if (checkHoneypot(website, req)) {
        return res.status(400).json({ error: "Invalid submission" });
      }
      
      if (requestBody.caregiverEmail && isDisposableEmail(requestBody.caregiverEmail)) {
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        console.warn(`[SECURITY] Disposable email domain blocked: ${requestBody.caregiverEmail} from IP: ${ip}`);
        return res.status(400).json({ error: "Please use a permanent email address" });
      }

      const data = insertCaregiverLogSchema.parse(requestBody);

      const captchaResult = await verifyCaptcha(data.captchaToken);
      if (!captchaResult.success) {
        const statusCode = captchaResult.error?.includes("configuration") ? 500 : 400;
        return res.status(statusCode).json({ error: captchaResult.error });
      }

      const { captchaToken, ...logData } = data;
      const log = await storage.createCaregiverLog(logData);
      res.json(log);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/intake-forms", requireAuth, async (req, res) => {
    try {
      const { status } = req.query;
      const forms = await storage.listIntakeForms(status as string | undefined);
      res.json(forms);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/intake-forms/:id", requireAuth, async (req, res) => {
    try {
      const form = await storage.getIntakeForm(req.params.id);
      if (!form) {
        return res.status(404).json({ error: "Intake form not found" });
      }
      res.json(form);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/intake-forms/:id", requireAuth, async (req, res) => {
    try {
      const data = updateIntakeFormSchema.parse(req.body);
      const form = await storage.updateIntakeForm(req.params.id, data);
      if (!form) {
        return res.status(404).json({ error: "Intake form not found" });
      }
      res.json(form);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/caregiver-logs", requireAuth, async (req, res) => {
    try {
      const { status, clientName } = req.query;
      const logs = await storage.listCaregiverLogs(
        status as string | undefined, 
        clientName as string | undefined
      );
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/caregiver-logs/:id", requireAuth, async (req, res) => {
    try {
      const log = await storage.getCaregiverLog(req.params.id);
      if (!log) {
        return res.status(404).json({ error: "Caregiver log not found" });
      }
      res.json(log);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/caregiver-logs/:id", requireAuth, async (req, res) => {
    try {
      const data = updateCaregiverLogSchema.parse(req.body);
      const log = await storage.updateCaregiverLog(req.params.id, data);
      if (!log) {
        return res.status(404).json({ error: "Caregiver log not found" });
      }
      res.json(log);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/hipaa-acknowledgment", publicFormLimiter, async (req, res) => {
    try {
      const { website, ...requestBody } = req.body;
      
      if (checkHoneypot(website, req)) {
        return res.status(400).json({ error: "Invalid submission" });
      }

      const data = insertHipaaAcknowledgmentSchema.parse(requestBody);

      const captchaResult = await verifyCaptcha(data.captchaToken);
      if (!captchaResult.success) {
        const statusCode = captchaResult.error?.includes("configuration") ? 500 : 400;
        return res.status(statusCode).json({ error: captchaResult.error });
      }

      const { captchaToken, ...acknowledgmentData } = data;
      const acknowledgment = await storage.createHipaaAcknowledgment(acknowledgmentData);
      res.json(acknowledgment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/hipaa-acknowledgments", requireAuth, async (req, res) => {
    try {
      const { status } = req.query;
      const acknowledgments = await storage.listHipaaAcknowledgments(status as string | undefined);
      res.json(acknowledgments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/hipaa-acknowledgments/:id", requireAuth, async (req, res) => {
    try {
      const acknowledgment = await storage.getHipaaAcknowledgment(req.params.id);
      if (!acknowledgment) {
        return res.status(404).json({ error: "HIPAA acknowledgment not found" });
      }
      res.json(acknowledgment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/hipaa-acknowledgments/:id", requireAuth, async (req, res) => {
    try {
      const data = updateHipaaAcknowledgmentSchema.parse(req.body);
      const acknowledgment = await storage.updateHipaaAcknowledgment(req.params.id, data);
      if (!acknowledgment) {
        return res.status(404).json({ error: "HIPAA acknowledgment not found" });
      }
      res.json(acknowledgment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Lead Magnet Routes - Email capture for downloadable resources
  app.post("/api/lead-magnets", publicFormLimiter, async (req, res) => {
    try {
      const { website, ...requestBody } = req.body;
      
      if (checkHoneypot(website, req)) {
        return res.status(400).json({ error: "Invalid submission" });
      }

      if (isDisposableEmail(requestBody.email)) {
        console.log(`[SECURITY] Blocked disposable email in lead magnet: ${requestBody.email} from IP ${req.ip}`);
        return res.status(400).json({ error: "Invalid email domain" });
      }

      const data = insertLeadMagnetSchema.parse(requestBody);

      const captchaResult = await verifyCaptcha(data.captchaToken);
      if (!captchaResult.success) {
        const statusCode = captchaResult.error?.includes("configuration") ? 500 : 400;
        return res.status(statusCode).json({ error: captchaResult.error });
      }

      const { captchaToken, ...leadData } = data;
      const leadMagnet = await storage.createLeadMagnet(leadData);
      res.json(leadMagnet);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/lead-magnets", requireAuth, async (req, res) => {
    try {
      const leadMagnets = await storage.listLeadMagnets();
      res.json(leadMagnets);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/lead-magnets/:id", requireAuth, async (req, res) => {
    try {
      const leadMagnet = await storage.getLeadMagnet(req.params.id);
      if (!leadMagnet) {
        return res.status(404).json({ error: "Lead magnet not found" });
      }
      res.json(leadMagnet);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Client Referral Routes - Refer a Friend Program
  app.post("/api/referrals", publicFormLimiter, async (req, res) => {
    try {
      const { website, ...requestBody } = req.body;
      
      if (checkHoneypot(website, req)) {
        return res.status(400).json({ error: "Invalid submission" });
      }

      if (isDisposableEmail(requestBody.referrerEmail)) {
        console.log(`[SECURITY] Blocked disposable email in referral: ${requestBody.referrerEmail} from IP ${req.ip}`);
        return res.status(400).json({ error: "Invalid email domain" });
      }

      const data = insertReferralSchema.parse(requestBody);

      const captchaResult = await verifyCaptcha(data.captchaToken);
      if (!captchaResult.success) {
        const statusCode = captchaResult.error?.includes("configuration") ? 500 : 400;
        return res.status(statusCode).json({ error: captchaResult.error });
      }

      const { captchaToken, ...referralData } = data;
      const referral = await storage.createReferral(referralData);
      
      // Send email notification
      const hrEmail = process.env.HR_EMAIL || 'info@privateinhomecaregiver.com';
      const emailHtml = generateReferralNotificationEmail({
        referrerName: referral.referrerName,
        referrerEmail: referral.referrerEmail,
        referrerPhone: referral.referrerPhone,
        relationshipToReferred: referral.relationshipToReferred,
        referredName: referral.referredName,
        referredPhone: referral.referredPhone,
        referredEmail: referral.referredEmail || undefined,
        referredLocation: referral.referredLocation,
        primaryNeedForCare: referral.primaryNeedForCare,
        additionalInfo: referral.additionalInfo || undefined,
      });
      
      await sendEmail({
        to: hrEmail,
        subject: `New Client Referral - ${referral.referrerName} referring ${referral.referredName}`,
        html: emailHtml,
      });
      
      res.json(referral);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/referrals", requireAuth, async (req, res) => {
    try {
      const { status } = req.query;
      const referrals = await storage.listReferrals(status as string | undefined);
      res.json(referrals);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/referrals/:id", requireAuth, async (req, res) => {
    try {
      const referral = await storage.getReferral(req.params.id);
      if (!referral) {
        return res.status(404).json({ error: "Referral not found" });
      }
      res.json(referral);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/referrals/:id", requireAuth, async (req, res) => {
    try {
      const data = updateReferralSchema.parse(req.body);
      const referral = await storage.updateReferral(req.params.id, data);
      if (!referral) {
        return res.status(404).json({ error: "Referral not found" });
      }
      res.json(referral);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/referrals/:id/status", requireAuth, async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      const reviewedBy = (req.session as any).userId;
      const referral = await storage.updateReferralStatus(req.params.id, status, reviewedBy);
      if (!referral) {
        return res.status(404).json({ error: "Referral not found" });
      }
      res.json(referral);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/referrals/:id/notes", requireAuth, async (req, res) => {
    try {
      const { notes } = req.body;
      if (!notes) {
        return res.status(400).json({ error: "Notes are required" });
      }
      const referral = await storage.updateReferralNotes(req.params.id, notes);
      if (!referral) {
        return res.status(404).json({ error: "Referral not found" });
      }
      res.json(referral);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/referrals/:id/tracking", requireAuth, async (req, res) => {
    try {
      const { hoursCompleted } = req.body;
      if (!hoursCompleted) {
        return res.status(400).json({ error: "Hours completed is required" });
      }
      const referral = await storage.updateReferralTracking(req.params.id, hoursCompleted);
      if (!referral) {
        return res.status(404).json({ error: "Referral not found" });
      }
      res.json(referral);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/admin/referrals/:id/issue-credit", requireAuth, async (req, res) => {
    try {
      const creditedBy = (req.session as any).userId;
      const referral = await storage.issueCreditForReferral(req.params.id, creditedBy);
      if (!referral) {
        return res.status(404).json({ error: "Referral not found" });
      }
      res.json(referral);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // XML Sitemap Generation
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const baseUrl = process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}`
        : req.protocol + '://' + req.get('host');

      const cities = [
        "Andover","Arlington","Barnstable","Berkshires","Beverly","Boston","Brookline",
        "Charlestown","Chatham","Falmouth","Gloucester","Haverhill","Lexington",
        "Lowell","Marblehead","Mashpee","Melrose","Methuen","Newton","Northborough",
        "Plymouth","Quincy","Salem","Seacoast","Somerville","Springfield","Waltham",
        "Wellesley","Westport","Worcester"
      ];

      const staticPages = [
        { loc: '/', priority: '1.0', changefreq: 'weekly' },
        { loc: '/services', priority: '0.9', changefreq: 'monthly' },
        { loc: '/caregivers', priority: '0.8', changefreq: 'weekly' },
        { loc: '/articles', priority: '0.8', changefreq: 'weekly' },
        { loc: '/resources', priority: '0.7', changefreq: 'monthly' },
        { loc: '/careers', priority: '0.8', changefreq: 'weekly' },
        { loc: '/apply', priority: '0.7', changefreq: 'monthly' },
        { loc: '/consultation', priority: '0.9', changefreq: 'monthly' },
        { loc: '/refer-a-friend', priority: '0.7', changefreq: 'monthly' },
        { loc: '/intake', priority: '0.7', changefreq: 'monthly' },
        { loc: '/hipaa-acknowledgment', priority: '0.7', changefreq: 'monthly' },
        { loc: '/caregiver-log', priority: '0.6', changefreq: 'monthly' },
        { loc: '/privacy-policy', priority: '0.5', changefreq: 'yearly' },
        { loc: '/terms-of-service', priority: '0.5', changefreq: 'yearly' },
        { loc: '/terms-and-conditions', priority: '0.5', changefreq: 'yearly' },
      ];

      const articles = await storage.listArticles();
      const publishedArticles = articles.filter(a => a.status === 'published');

      const jobs = await storage.listJobs();
      const publishedJobs = jobs.filter(j => j.status === 'published');

      const caregivers = await storage.listCaregivers();
      const activeCaregivers = caregivers.filter(c => c.status === 'active');

      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

      // Static pages
      staticPages.forEach(page => {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}${page.loc}</loc>\n`;
        xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += '  </url>\n';
      });

      // Location pages
      cities.forEach(city => {
        const slug = city.toLowerCase().replace(/\s+/g, '-');
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/locations/${slug}</loc>\n`;
        xml += '    <changefreq>monthly</changefreq>\n';
        xml += '    <priority>0.8</priority>\n';
        xml += '  </url>\n';
      });

      // Article pages
      publishedArticles.forEach(article => {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/articles/${article.slug}</loc>\n`;
        if (article.updatedAt) {
          xml += `    <lastmod>${new Date(article.updatedAt).toISOString()}</lastmod>\n`;
        } else if (article.createdAt) {
          xml += `    <lastmod>${new Date(article.createdAt).toISOString()}</lastmod>\n`;
        }
        xml += '    <changefreq>monthly</changefreq>\n';
        xml += '    <priority>0.7</priority>\n';
        xml += '  </url>\n';
      });

      // Job pages (if they have individual pages)
      publishedJobs.forEach(job => {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/careers#${job.id}</loc>\n`;
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += '    <priority>0.6</priority>\n';
        xml += '  </url>\n';
      });

      // Caregiver profile pages
      activeCaregivers.forEach(caregiver => {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/caregivers/${caregiver.id}</loc>\n`;
        xml += '    <changefreq>monthly</changefreq>\n';
        xml += '    <priority>0.7</priority>\n';
        xml += '  </url>\n';
      });

      xml += '</urlset>';

      res.header('Content-Type', 'application/xml');
      res.send(xml);
    } catch (error: any) {
      console.error('Error generating sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
