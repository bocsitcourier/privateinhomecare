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
  insertVideoSchema, updateVideoSchema,
  insertPodcastSchema, updatePodcastSchema,
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
  generateReferralNotificationEmail 
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
      console.log("[STARTUP] Articles already exist, skipping seed");
      return;
    }

    const { caregiverArticles } = await import("./seeds/caregiver-articles");

    for (const articleData of caregiverArticles) {
      const article = await storage.createArticle({
        title: articleData.title,
        slug: articleData.slug,
        excerpt: articleData.excerpt,
        body: articleData.body,
        category: articleData.category,
        heroImageUrl: articleData.heroImageUrl,
        metaTitle: articleData.metaTitle,
        metaDescription: articleData.metaDescription,
        keywords: articleData.keywords,
        status: "published"
      });

      for (let i = 0; i < articleData.faqs.length; i++) {
        const faq = articleData.faqs[i];
        await storage.createArticleFaq({
          articleId: article.id,
          question: faq.question,
          answer: faq.answer,
          displayOrder: i,
          isActive: 'yes'
        });
      }
    }

    console.log(`[STARTUP] ✓ Caregiver resource articles created: ${caregiverArticles.length}`);
  } catch (error: any) {
    console.error("[STARTUP] ✗ Failed to seed articles:", error.message);
  }
}

async function seedComprehensiveArticles(forceReseed = false) {
  try {
    const comprehensiveArticlesModule = await import("./seeds/comprehensive-articles");
    const batch2Module = await import("./seeds/articles-batch-2");
    const batch3Module = await import("./seeds/articles-batch-3");
    const batch4Module = await import("./seeds/articles-batch-4");
    const batch5Module = await import("./seeds/articles-batch-5");
    const batch6Module = await import("./seeds/articles-batch-6");
    const batch7Module = await import("./seeds/articles-batch-7");
    const batch8Module = await import("./seeds/articles-batch-8");
    const batch9Module = await import("./seeds/articles-batch-9");
    const batch10Module = await import("./seeds/articles-batch-10");
    
    const baseArticles = comprehensiveArticlesModule.default || comprehensiveArticlesModule.comprehensiveArticles;
    const batch2Articles = batch2Module.articlesBatch2 || [];
    const batch3Articles = batch3Module.articlesBatch3 || [];
    const batch4Articles = batch4Module.articlesBatch4 || [];
    const batch5Articles = batch5Module.articlesBatch5 || [];
    const batch6Articles = batch6Module.articlesBatch6 || [];
    const batch7Articles = batch7Module.articlesBatch7 || [];
    const batch8Articles = batch8Module.articlesBatch8 || [];
    const batch9Articles = batch9Module.articlesBatch9 || [];
    const batch10Articles = batch10Module.articlesBatch10 || [];
    
    const comprehensiveArticles = [...baseArticles, ...batch2Articles, ...batch3Articles, ...batch4Articles, ...batch5Articles, ...batch6Articles, ...batch7Articles, ...batch8Articles, ...batch9Articles, ...batch10Articles];
    
    let created = 0;
    let skipped = 0;
    
    for (const articleData of comprehensiveArticles) {
      const existing = await storage.getArticleBySlug(articleData.slug);
      if (existing && !forceReseed) {
        skipped++;
        continue;
      }
      
      if (existing && forceReseed) {
        await storage.deleteArticle(existing.id);
      }

      const article = await storage.createArticle({
        title: articleData.title,
        slug: articleData.slug,
        excerpt: articleData.excerpt,
        body: articleData.body,
        category: articleData.category,
        heroImageUrl: articleData.heroImageUrl,
        metaTitle: articleData.metaTitle,
        metaDescription: articleData.metaDescription,
        keywords: articleData.keywords,
        status: "published"
      });

      if (articleData.faqs && articleData.faqs.length > 0) {
        for (let i = 0; i < articleData.faqs.length; i++) {
          const faq = articleData.faqs[i];
          await storage.createArticleFaq({
            articleId: article.id,
            question: faq.question,
            answer: faq.answer,
            displayOrder: i,
            isActive: 'yes'
          });
        }
      }
      created++;
    }

    console.log(`[SEED] ✓ Comprehensive articles: ${created} created, ${skipped} skipped`);
    return { created, skipped, total: comprehensiveArticles.length };
  } catch (error: any) {
    console.error("[SEED] ✗ Failed to seed comprehensive articles:", error.message);
    throw error;
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
    fileSize: 5 * 1024 * 1024,
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
  
  app.use('/attached_assets', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  });
  app.use('/attached_assets', express.static('attached_assets'));
  
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

  app.post("/api/seed/articles", async (req, res) => {
    try {
      const forceReseed = req.query.force === 'true';
      const result = await seedComprehensiveArticles(forceReseed);
      res.json({ 
        success: true, 
        message: `Comprehensive articles seeded successfully`,
        ...result
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

  // Article FAQ routes
  app.get("/api/articles/:articleId/faqs", async (req, res) => {
    try {
      const faqs = await storage.listArticleFaqs(req.params.articleId);
      res.json(faqs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/articles/:articleId/faqs", requireAuth, async (req, res) => {
    try {
      const faq = await storage.createArticleFaq({
        ...req.body,
        articleId: req.params.articleId,
      });
      res.status(201).json(faq);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/articles/faqs/:id", requireAuth, async (req, res) => {
    try {
      const faq = await storage.updateArticleFaq(req.params.id, req.body);
      if (!faq) {
        return res.status(404).json({ error: "FAQ not found" });
      }
      res.json(faq);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/articles/faqs/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteArticleFaq(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "FAQ not found" });
      }
      res.json({ success: true });
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

  // ==========================================
  // MA CARE DIRECTORY ROUTES
  // ==========================================

  // Public: List MA Locations with optional filters
  app.get("/api/directory/locations", async (req: Request, res: Response) => {
    try {
      const { county, isCity, isActive, region } = req.query;
      const filters: { county?: string; isCity?: string; isActive?: string } = {};
      if (county && typeof county === 'string') filters.county = county;
      if (isCity && typeof isCity === 'string') filters.isCity = isCity;
      if (isActive && typeof isActive === 'string') filters.isActive = isActive;
      
      let locations = await storage.listMaLocations(filters);
      
      // Additional region filter (not in storage)
      if (region && typeof region === 'string') {
        locations = locations.filter(l => l.region === region);
      }
      
      res.json(locations);
    } catch (error: any) {
      console.error("Error listing locations:", error);
      res.status(500).json({ message: "Failed to list locations" });
    }
  });

  // Public: Get MA Location by slug
  app.get("/api/directory/locations/:slug", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const location = await storage.getMaLocationBySlug(slug);
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      res.json(location);
    } catch (error: any) {
      console.error("Error getting location:", error);
      res.status(500).json({ message: "Failed to get location" });
    }
  });

  // Public: List care type pages with optional filters
  app.get("/api/directory/pages", async (req: Request, res: Response) => {
    try {
      const { locationId, careType, status } = req.query;
      const filters: { locationId?: string; careType?: any; status?: string } = {};
      if (locationId && typeof locationId === 'string') filters.locationId = locationId;
      if (careType && typeof careType === 'string') filters.careType = careType;
      if (status && typeof status === 'string') filters.status = status;
      
      const pages = await storage.listCareTypePages(filters);
      res.json(pages);
    } catch (error: any) {
      console.error("Error listing care type pages:", error);
      res.status(500).json({ message: "Failed to list care type pages" });
    }
  });

  // Public: Get care type page by slug
  app.get("/api/directory/pages/:slug", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const page = await storage.getCareTypePageBySlug(slug);
      if (!page) {
        return res.status(404).json({ message: "Care type page not found" });
      }
      
      // Also fetch FAQs and reviews for this page
      const faqs = await storage.listLocationFaqs(page.id);
      const reviews = await storage.listLocationReviews(page.id);
      
      // Get the location details
      const location = await storage.getMaLocation(page.locationId);
      
      res.json({ ...page, faqs, reviews, location });
    } catch (error: any) {
      console.error("Error getting care type page:", error);
      res.status(500).json({ message: "Failed to get care type page" });
    }
  });

  // Public: Search locations
  app.get("/api/directory/search", async (req: Request, res: Response) => {
    try {
      const { q, careType } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query required" });
      }
      
      const results = await storage.searchLocations(q, careType as any);
      res.json(results);
    } catch (error: any) {
      console.error("Error searching locations:", error);
      res.status(500).json({ message: "Failed to search locations" });
    }
  });

  // Public: Get all counties for filtering
  app.get("/api/directory/counties", async (req: Request, res: Response) => {
    try {
      const locations = await storage.listMaLocations();
      const counties = Array.from(new Set(locations.map(l => l.county))).sort();
      res.json(counties);
    } catch (error: any) {
      console.error("Error getting counties:", error);
      res.status(500).json({ message: "Failed to get counties" });
    }
  });

  // Public: Get all regions for filtering
  app.get("/api/directory/regions", async (req: Request, res: Response) => {
    try {
      const locations = await storage.listMaLocations();
      const regions = Array.from(new Set(locations.map(l => l.region).filter((r): r is string => Boolean(r)))).sort();
      res.json(regions);
    } catch (error: any) {
      console.error("Error getting regions:", error);
      res.status(500).json({ message: "Failed to get regions" });
    }
  });

  // Public: Get service types by category
  app.get("/api/directory/services", async (req: Request, res: Response) => {
    try {
      const { category } = req.query;
      const services = await storage.listServiceTypes(category as string);
      res.json(services);
    } catch (error: any) {
      console.error("Error listing services:", error);
      res.status(500).json({ message: "Failed to list services" });
    }
  });

  // Public: Get care type page by care type slug and city slug
  // URL pattern: /:careType/massachusetts/:citySlug-ma
  app.get("/api/care-pages/:careType/:citySlug", async (req: Request, res: Response) => {
    try {
      const { careType, citySlug } = req.params;
      const result = await storage.getCareTypePageByCareTypeAndCity(careType, citySlug);
      
      if (!result) {
        return res.status(404).json({ message: "Care type page not found" });
      }
      
      res.json(result);
    } catch (error: any) {
      console.error("Error getting care type page:", error);
      res.status(500).json({ message: "Failed to get care type page" });
    }
  });

  // Admin: Seed MA Locations
  app.post("/api/directory/seed-locations", requireAuth, async (req: Request, res: Response) => {
    try {
      const { maLocationSeeds, serviceTypes } = await import("./seeds/ma-locations");
      
      let locationsCreated = 0;
      let servicesCreated = 0;
      
      // Seed locations
      for (const location of maLocationSeeds) {
        const existing = await storage.getMaLocationBySlug(location.slug);
        if (!existing) {
          await storage.createMaLocation({
            name: location.name,
            slug: location.slug,
            county: location.county,
            region: location.region,
            zipCodes: location.zipCodes,
            population: location.population,
            isCity: location.isCity,
            isActive: "yes"
          });
          locationsCreated++;
        }
      }
      
      // Seed service types
      for (const service of serviceTypes) {
        try {
          await storage.createServiceType({
            name: service.name,
            slug: service.slug,
            category: service.category,
            sortOrder: service.sortOrder
          });
          servicesCreated++;
        } catch (e) {
          // Skip if already exists
        }
      }
      
      res.json({ 
        message: "Seed completed", 
        locationsCreated, 
        servicesCreated,
        totalLocations: maLocationSeeds.length 
      });
    } catch (error: any) {
      console.error("Error seeding locations:", error);
      res.status(500).json({ message: "Failed to seed locations", error: error.message });
    }
  });

  // Admin: Create care type page
  app.post("/api/directory/pages", requireAuth, async (req: Request, res: Response) => {
    try {
      const pageData = req.body;
      const page = await storage.createCareTypePage(pageData);
      res.status(201).json(page);
    } catch (error: any) {
      console.error("Error creating care type page:", error);
      res.status(500).json({ message: "Failed to create care type page" });
    }
  });

  // Admin: Update care type page
  app.patch("/api/directory/pages/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const pageData = req.body;
      const page = await storage.updateCareTypePage(id, pageData);
      if (!page) {
        return res.status(404).json({ message: "Care type page not found" });
      }
      res.json(page);
    } catch (error: any) {
      console.error("Error updating care type page:", error);
      res.status(500).json({ message: "Failed to update care type page" });
    }
  });

  // Admin: Delete care type page
  app.delete("/api/directory/pages/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCareTypePage(id);
      if (!deleted) {
        return res.status(404).json({ message: "Care type page not found" });
      }
      res.json({ message: "Care type page deleted" });
    } catch (error: any) {
      console.error("Error deleting care type page:", error);
      res.status(500).json({ message: "Failed to delete care type page" });
    }
  });

  // Admin: Publish care type page
  app.post("/api/directory/pages/:id/publish", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const page = await storage.publishCareTypePage(id);
      if (!page) {
        return res.status(404).json({ message: "Care type page not found" });
      }
      res.json(page);
    } catch (error: any) {
      console.error("Error publishing care type page:", error);
      res.status(500).json({ message: "Failed to publish care type page" });
    }
  });

  // Admin: Unpublish care type page
  app.post("/api/directory/pages/:id/unpublish", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const page = await storage.unpublishCareTypePage(id);
      if (!page) {
        return res.status(404).json({ message: "Care type page not found" });
      }
      res.json(page);
    } catch (error: any) {
      console.error("Error unpublishing care type page:", error);
      res.status(500).json({ message: "Failed to unpublish care type page" });
    }
  });

  // Admin: Create location FAQ
  app.post("/api/directory/faqs", requireAuth, async (req: Request, res: Response) => {
    try {
      const faqData = req.body;
      const faq = await storage.createLocationFaq(faqData);
      res.status(201).json(faq);
    } catch (error: any) {
      console.error("Error creating FAQ:", error);
      res.status(500).json({ message: "Failed to create FAQ" });
    }
  });

  // Admin: Update location FAQ
  app.patch("/api/directory/faqs/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const faqData = req.body;
      const faq = await storage.updateLocationFaq(id, faqData);
      if (!faq) {
        return res.status(404).json({ message: "FAQ not found" });
      }
      res.json(faq);
    } catch (error: any) {
      console.error("Error updating FAQ:", error);
      res.status(500).json({ message: "Failed to update FAQ" });
    }
  });

  // Admin: Delete location FAQ
  app.delete("/api/directory/faqs/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteLocationFaq(id);
      if (!deleted) {
        return res.status(404).json({ message: "FAQ not found" });
      }
      res.json({ message: "FAQ deleted" });
    } catch (error: any) {
      console.error("Error deleting FAQ:", error);
      res.status(500).json({ message: "Failed to delete FAQ" });
    }
  });

  // Admin: Create location review
  app.post("/api/directory/reviews", requireAuth, async (req: Request, res: Response) => {
    try {
      const reviewData = req.body;
      const review = await storage.createLocationReview(reviewData);
      res.status(201).json(review);
    } catch (error: any) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Admin: Update location review
  app.patch("/api/directory/reviews/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const reviewData = req.body;
      const review = await storage.updateLocationReview(id, reviewData);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.json(review);
    } catch (error: any) {
      console.error("Error updating review:", error);
      res.status(500).json({ message: "Failed to update review" });
    }
  });

  // Admin: Delete location review
  app.delete("/api/directory/reviews/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteLocationReview(id);
      if (!deleted) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.json({ message: "Review deleted" });
    } catch (error: any) {
      console.error("Error deleting review:", error);
      res.status(500).json({ message: "Failed to delete review" });
    }
  });

  // Admin: Create MA location
  app.post("/api/directory/locations", requireAuth, async (req: Request, res: Response) => {
    try {
      const locationData = req.body;
      const location = await storage.createMaLocation(locationData);
      res.status(201).json(location);
    } catch (error: any) {
      console.error("Error creating location:", error);
      res.status(500).json({ message: "Failed to create location" });
    }
  });

  // Admin: Update MA location
  app.patch("/api/directory/locations/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const locationData = req.body;
      const location = await storage.updateMaLocation(id, locationData);
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      res.json(location);
    } catch (error: any) {
      console.error("Error updating location:", error);
      res.status(500).json({ message: "Failed to update location" });
    }
  });

  // Admin: Delete MA location
  app.delete("/api/directory/locations/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteMaLocation(id);
      if (!deleted) {
        return res.status(404).json({ message: "Location not found" });
      }
      res.json({ message: "Location deleted" });
    } catch (error: any) {
      console.error("Error deleting location:", error);
      res.status(500).json({ message: "Failed to delete location" });
    }
  });

  // =============================================
  // Videos API Routes
  // =============================================
  
  // Public: List published videos
  app.get("/api/videos", async (req: Request, res: Response) => {
    try {
      const { category } = req.query;
      const videos = await storage.listVideos("published", category as string | undefined);
      res.json(videos);
    } catch (error: any) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  // Public: Get video by slug
  app.get("/api/videos/:slug", async (req: Request, res: Response) => {
    try {
      const video = await storage.getVideoBySlug(req.params.slug);
      if (!video || video.status !== "published") {
        return res.status(404).json({ message: "Video not found" });
      }
      // Increment view count
      await storage.incrementVideoViews(video.id);
      res.json(video);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch video" });
    }
  });

  // Admin: List all videos
  app.get("/api/admin/videos", requireAuth, async (req: Request, res: Response) => {
    try {
      const { status, category } = req.query;
      const videos = await storage.listVideos(status as string | undefined, category as string | undefined);
      res.json(videos);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  // Admin: Get video by ID
  app.get("/api/admin/videos/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      res.json(video);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch video" });
    }
  });

  // Admin: Create video
  app.post("/api/admin/videos", requireAuth, async (req: Request, res: Response) => {
    try {
      const data = insertVideoSchema.parse(req.body);
      const video = await storage.createVideo(data);
      res.status(201).json(video);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin: Update video
  app.patch("/api/admin/videos/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const data = updateVideoSchema.parse(req.body);
      const video = await storage.updateVideo(req.params.id, data);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      res.json(video);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin: Delete video
  app.delete("/api/admin/videos/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteVideo(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Video not found" });
      }
      res.json({ message: "Video deleted" });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete video" });
    }
  });

  // Admin: Publish video
  app.post("/api/admin/videos/:id/publish", requireAuth, async (req: Request, res: Response) => {
    try {
      const video = await storage.publishVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      res.json(video);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to publish video" });
    }
  });

  // Admin: Unpublish video
  app.post("/api/admin/videos/:id/unpublish", requireAuth, async (req: Request, res: Response) => {
    try {
      const video = await storage.unpublishVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      res.json(video);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to unpublish video" });
    }
  });

  // =============================================
  // Podcasts API Routes
  // =============================================
  
  // Public: List published podcasts
  app.get("/api/podcasts", async (req: Request, res: Response) => {
    try {
      const { category } = req.query;
      const podcasts = await storage.listPodcasts("published", category as string | undefined);
      res.json(podcasts);
    } catch (error: any) {
      console.error("Error fetching podcasts:", error);
      res.status(500).json({ message: "Failed to fetch podcasts" });
    }
  });

  // Public: Get podcast by slug
  app.get("/api/podcasts/:slug", async (req: Request, res: Response) => {
    try {
      const podcast = await storage.getPodcastBySlug(req.params.slug);
      if (!podcast || podcast.status !== "published") {
        return res.status(404).json({ message: "Podcast not found" });
      }
      // Increment play count
      await storage.incrementPodcastPlays(podcast.id);
      res.json(podcast);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch podcast" });
    }
  });

  // Admin: List all podcasts
  app.get("/api/admin/podcasts", requireAuth, async (req: Request, res: Response) => {
    try {
      const { status, category } = req.query;
      const podcasts = await storage.listPodcasts(status as string | undefined, category as string | undefined);
      res.json(podcasts);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch podcasts" });
    }
  });

  // Admin: Get podcast by ID
  app.get("/api/admin/podcasts/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const podcast = await storage.getPodcast(req.params.id);
      if (!podcast) {
        return res.status(404).json({ message: "Podcast not found" });
      }
      res.json(podcast);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch podcast" });
    }
  });

  // Admin: Create podcast
  app.post("/api/admin/podcasts", requireAuth, async (req: Request, res: Response) => {
    try {
      const data = insertPodcastSchema.parse(req.body);
      const podcast = await storage.createPodcast(data);
      res.status(201).json(podcast);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin: Update podcast
  app.patch("/api/admin/podcasts/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const data = updatePodcastSchema.parse(req.body);
      const podcast = await storage.updatePodcast(req.params.id, data);
      if (!podcast) {
        return res.status(404).json({ message: "Podcast not found" });
      }
      res.json(podcast);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin: Delete podcast
  app.delete("/api/admin/podcasts/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deletePodcast(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Podcast not found" });
      }
      res.json({ message: "Podcast deleted" });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete podcast" });
    }
  });

  // Admin: Publish podcast
  app.post("/api/admin/podcasts/:id/publish", requireAuth, async (req: Request, res: Response) => {
    try {
      const podcast = await storage.publishPodcast(req.params.id);
      if (!podcast) {
        return res.status(404).json({ message: "Podcast not found" });
      }
      res.json(podcast);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to publish podcast" });
    }
  });

  // Admin: Unpublish podcast
  app.post("/api/admin/podcasts/:id/unpublish", requireAuth, async (req: Request, res: Response) => {
    try {
      const podcast = await storage.unpublishPodcast(req.params.id);
      if (!podcast) {
        return res.status(404).json({ message: "Podcast not found" });
      }
      res.json(podcast);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to unpublish podcast" });
    }
  });

  // ===========================================
  // FACILITIES
  // ===========================================
  
  // Public: List published facilities by type
  app.get("/api/facilities", async (req: Request, res: Response) => {
    try {
      const { type, city, county, featured } = req.query;
      const facilities = await storage.listFacilities({
        facilityType: type as string | undefined,
        city: city as string | undefined,
        county: county as string | undefined,
        status: "published",
        featured: featured as string | undefined,
      });
      res.json(facilities);
    } catch (error) {
      console.error("Error fetching facilities:", error);
      res.status(500).json({ message: "Failed to fetch facilities" });
    }
  });

  // Public: Search facilities
  app.get("/api/facilities/search", async (req: Request, res: Response) => {
    try {
      const { q, type } = req.query;
      if (!q || typeof q !== "string") {
        return res.status(400).json({ message: "Search query is required" });
      }
      const facilities = await storage.searchFacilities(q, type as string | undefined);
      // Only return published facilities
      const publishedFacilities = facilities.filter((f: any) => f.status === "published");
      res.json(publishedFacilities);
    } catch (error) {
      console.error("Error searching facilities:", error);
      res.status(500).json({ message: "Failed to search facilities" });
    }
  });

  // Public: Get facility by slug
  app.get("/api/facilities/:slug", async (req: Request, res: Response) => {
    try {
      const facility = await storage.getFacilityBySlug(req.params.slug);
      if (!facility || facility.status !== "published") {
        return res.status(404).json({ message: "Facility not found" });
      }
      res.json(facility);
    } catch (error) {
      console.error("Error fetching facility:", error);
      res.status(500).json({ message: "Failed to fetch facility" });
    }
  });

  // Public: Get facility reviews (approved only)
  app.get("/api/facilities/:slug/reviews", async (req: Request, res: Response) => {
    try {
      const facility = await storage.getFacilityBySlug(req.params.slug);
      if (!facility || facility.status !== "published") {
        return res.status(404).json({ message: "Facility not found" });
      }
      const reviews = await storage.listFacilityReviews(facility.id, "approved");
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Public: Submit a facility review
  app.post("/api/facilities/:slug/reviews", async (req: Request, res: Response) => {
    try {
      const facility = await storage.getFacilityBySlug(req.params.slug);
      if (!facility || facility.status !== "published") {
        return res.status(404).json({ message: "Facility not found" });
      }
      const { rating, content, reviewerName, title, reviewerRelation, visitDate } = req.body;
      if (!rating || !content || !reviewerName) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const review = await storage.createFacilityReview({
        facilityId: facility.id,
        rating,
        content,
        reviewerName,
        title,
        reviewerRelation,
        visitDate: visitDate ? new Date(visitDate) : null,
      });
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to submit review" });
    }
  });

  // Admin: List all facilities
  app.get("/api/admin/facilities", requireAuth, async (req: Request, res: Response) => {
    try {
      const { type, city, county, status, featured } = req.query;
      const facilities = await storage.listFacilities({
        facilityType: type as string | undefined,
        city: city as string | undefined,
        county: county as string | undefined,
        status: status as string | undefined,
        featured: featured as string | undefined,
      });
      res.json(facilities);
    } catch (error) {
      console.error("Error fetching facilities:", error);
      res.status(500).json({ message: "Failed to fetch facilities" });
    }
  });

  // Admin: Get facility by ID
  app.get("/api/admin/facilities/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const facility = await storage.getFacility(req.params.id);
      if (!facility) {
        return res.status(404).json({ message: "Facility not found" });
      }
      res.json(facility);
    } catch (error) {
      console.error("Error fetching facility:", error);
      res.status(500).json({ message: "Failed to fetch facility" });
    }
  });

  // Admin: Create facility
  app.post("/api/admin/facilities", requireAuth, async (req: Request, res: Response) => {
    try {
      const facility = await storage.createFacility(req.body);
      res.status(201).json(facility);
    } catch (error: any) {
      console.error("Error creating facility:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Admin: Update facility
  app.patch("/api/admin/facilities/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const facility = await storage.updateFacility(req.params.id, req.body);
      if (!facility) {
        return res.status(404).json({ message: "Facility not found" });
      }
      res.json(facility);
    } catch (error: any) {
      console.error("Error updating facility:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Admin: Delete facility
  app.delete("/api/admin/facilities/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteFacility(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Facility not found" });
      }
      res.json({ message: "Facility deleted" });
    } catch (error) {
      console.error("Error deleting facility:", error);
      res.status(500).json({ message: "Failed to delete facility" });
    }
  });

  // Admin: Publish facility
  app.post("/api/admin/facilities/:id/publish", requireAuth, async (req: Request, res: Response) => {
    try {
      const facility = await storage.publishFacility(req.params.id);
      if (!facility) {
        return res.status(404).json({ message: "Facility not found" });
      }
      res.json(facility);
    } catch (error) {
      console.error("Error publishing facility:", error);
      res.status(500).json({ message: "Failed to publish facility" });
    }
  });

  // Admin: Unpublish facility
  app.post("/api/admin/facilities/:id/unpublish", requireAuth, async (req: Request, res: Response) => {
    try {
      const facility = await storage.unpublishFacility(req.params.id);
      if (!facility) {
        return res.status(404).json({ message: "Facility not found" });
      }
      res.json(facility);
    } catch (error) {
      console.error("Error unpublishing facility:", error);
      res.status(500).json({ message: "Failed to unpublish facility" });
    }
  });

  // Admin: List all reviews for a facility
  app.get("/api/admin/facilities/:id/reviews", requireAuth, async (req: Request, res: Response) => {
    try {
      const reviews = await storage.listFacilityReviews(req.params.id);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Admin: Approve review
  app.post("/api/admin/facility-reviews/:id/approve", requireAuth, async (req: Request, res: Response) => {
    try {
      const review = await storage.approveFacilityReview(req.params.id);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.json(review);
    } catch (error) {
      console.error("Error approving review:", error);
      res.status(500).json({ message: "Failed to approve review" });
    }
  });

  // Admin: Reject review
  app.post("/api/admin/facility-reviews/:id/reject", requireAuth, async (req: Request, res: Response) => {
    try {
      const review = await storage.rejectFacilityReview(req.params.id);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.json(review);
    } catch (error) {
      console.error("Error rejecting review:", error);
      res.status(500).json({ message: "Failed to reject review" });
    }
  });

  // Admin: Delete review
  app.delete("/api/admin/facility-reviews/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteFacilityReview(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.json({ message: "Review deleted" });
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ message: "Failed to delete review" });
    }
  });

  // Seed endpoint for Massachusetts facilities
  app.post("/api/seed/facilities", async (req: Request, res: Response) => {
    try {
      const force = req.query.force === "true";
      const existing = await storage.listFacilities({});
      
      if (existing.length > 0 && !force) {
        return res.json({ message: "Facilities already seeded. Use ?force=true to reseed." });
      }

      const massachusettsFacilities = [
        {
          name: "Hebrew SeniorLife - Hebrew Rehabilitation Center",
          facilityType: "nursing-home",
          address: "1200 Centre Street",
          city: "Boston",
          state: "MA",
          zipCode: "02131",
          county: "Suffolk",
          phone: "(617) 363-8000",
          website: "https://www.hebrewseniorlife.org",
          description: "Hebrew Rehabilitation Center is one of the largest and most respected skilled nursing facilities in the Boston area, providing comprehensive long-term care, rehabilitation, and specialized memory care services.",
          shortDescription: "Premier skilled nursing and rehabilitation facility in Boston.",
          services: ["24-Hour Nursing Care", "Physical Therapy", "Occupational Therapy", "Speech Therapy", "Memory Care", "Palliative Care", "Respite Care"],
          amenities: ["Private Rooms Available", "Chapel", "Outdoor Gardens", "Therapy Gym", "Library", "Beauty Salon"],
          totalBeds: 725,
          overallRating: "4.5",
          reviewCount: 45,
          acceptsMedicare: "yes",
          acceptsMedicaid: "yes",
          status: "published",
          featured: "yes",
        },
        {
          name: "Brookhaven at Lexington",
          facilityType: "continuing-care",
          address: "1010 Waltham Street",
          city: "Lexington",
          state: "MA",
          zipCode: "02421",
          county: "Middlesex",
          phone: "(781) 862-0500",
          website: "https://www.brookhavenatlexington.org",
          description: "Brookhaven at Lexington is a not-for-profit continuing care retirement community offering independent living, assisted living, and skilled nursing care in a beautiful suburban setting.",
          shortDescription: "Premier continuing care retirement community in Lexington.",
          services: ["Independent Living", "Assisted Living", "Skilled Nursing", "Memory Care", "Rehabilitation Services"],
          amenities: ["Fitness Center", "Swimming Pool", "Library", "Restaurant Dining", "Art Studio", "Walking Trails"],
          totalBeds: 200,
          overallRating: "4.7",
          reviewCount: 32,
          acceptsMedicare: "yes",
          acceptsMedicaid: "no",
          status: "published",
          featured: "yes",
        },
        {
          name: "Wingate at Needham",
          facilityType: "nursing-home",
          address: "215 Hillside Avenue",
          city: "Needham",
          state: "MA",
          zipCode: "02494",
          county: "Norfolk",
          phone: "(781) 453-8100",
          website: "https://www.wingateathealthcare.com",
          description: "Wingate at Needham provides exceptional skilled nursing and rehabilitation services in a homelike environment, featuring private rooms and comprehensive therapy programs.",
          shortDescription: "Modern skilled nursing facility with private rooms.",
          services: ["Skilled Nursing", "Short-Term Rehabilitation", "Long-Term Care", "Physical Therapy", "Memory Care"],
          amenities: ["Private Rooms", "WiFi Throughout", "Outdoor Courtyard", "Beauty Salon", "Private Dining"],
          totalBeds: 130,
          overallRating: "4.3",
          reviewCount: 28,
          acceptsMedicare: "yes",
          acceptsMedicaid: "yes",
          status: "published",
          featured: "no",
        },
        {
          name: "Cape Cod Healthcare - The Pavilion",
          facilityType: "nursing-home",
          address: "45 Route 149",
          city: "Barnstable",
          state: "MA",
          zipCode: "02648",
          county: "Barnstable",
          phone: "(508) 375-5000",
          description: "The Pavilion offers skilled nursing, rehabilitation, and long-term care services on Cape Cod, providing residents with quality healthcare in a supportive environment.",
          shortDescription: "Cape Cod's premier skilled nursing facility.",
          services: ["Skilled Nursing", "Rehabilitation", "Long-Term Care", "Respite Care", "Wound Care"],
          amenities: ["Ocean Views", "Private Rooms", "Therapy Gym", "Outdoor Patios", "Chapel"],
          totalBeds: 100,
          overallRating: "4.2",
          reviewCount: 19,
          acceptsMedicare: "yes",
          acceptsMedicaid: "yes",
          status: "published",
          featured: "no",
        },
        {
          name: "Sunrise Senior Living of Braintree",
          facilityType: "assisted-living",
          address: "340 Wood Road",
          city: "Braintree",
          state: "MA",
          zipCode: "02184",
          county: "Norfolk",
          phone: "(781) 848-9800",
          website: "https://www.sunriseseniorliving.com",
          description: "Sunrise Senior Living of Braintree offers personalized assisted living and memory care services in a warm, homelike setting with 24-hour care and engaging activities.",
          shortDescription: "Personalized assisted living and memory care.",
          services: ["Assisted Living", "Memory Care", "Medication Management", "Personal Care", "Wellness Programs"],
          amenities: ["Restaurant-Style Dining", "Gardens", "Activity Rooms", "Beauty Salon", "Transportation"],
          totalBeds: 85,
          overallRating: "4.4",
          reviewCount: 35,
          acceptsMedicare: "no",
          acceptsMedicaid: "no",
          status: "published",
          featured: "yes",
        },
        {
          name: "Benchmark Senior Living at Plymouth Crossings",
          facilityType: "assisted-living",
          address: "157 South Street",
          city: "Plymouth",
          state: "MA",
          zipCode: "02360",
          county: "Plymouth",
          phone: "(508) 746-1755",
          website: "https://www.benchmarkseniorliving.com",
          description: "Plymouth Crossings provides exceptional assisted living and Alzheimer's care with personalized services and engaging programs designed to promote independence and well-being.",
          shortDescription: "Award-winning assisted living in Plymouth.",
          services: ["Assisted Living", "Memory Care", "Respite Care", "Wellness Programs", "Physical Therapy"],
          amenities: ["Private Apartments", "Bistro", "Movie Theater", "Fitness Center", "Gardens"],
          totalBeds: 95,
          overallRating: "4.6",
          reviewCount: 42,
          acceptsMedicare: "no",
          acceptsMedicaid: "no",
          status: "published",
          featured: "no",
        },
        {
          name: "Life Care Center of Attleboro",
          facilityType: "nursing-home",
          address: "969 Park Street",
          city: "Attleboro",
          state: "MA",
          zipCode: "02703",
          county: "Bristol",
          phone: "(508) 222-4182",
          description: "Life Care Center of Attleboro offers skilled nursing and rehabilitation services with a focus on helping residents achieve their highest level of independence.",
          shortDescription: "Quality skilled nursing and rehabilitation.",
          services: ["Skilled Nursing", "Rehabilitation", "Long-Term Care", "IV Therapy", "Wound Care"],
          amenities: ["Private Rooms", "Therapy Gym", "Outdoor Courtyard", "Activities Program"],
          totalBeds: 120,
          overallRating: "4.0",
          reviewCount: 22,
          acceptsMedicare: "yes",
          acceptsMedicaid: "yes",
          status: "published",
          featured: "no",
        },
        {
          name: "JGS Lifecare - Ruth's House",
          facilityType: "memory-care",
          address: "770 Converse Street",
          city: "Longmeadow",
          state: "MA",
          zipCode: "01106",
          county: "Hampden",
          phone: "(413) 567-6211",
          website: "https://www.jgslifecare.org",
          description: "Ruth's House specializes in memory care for individuals with Alzheimer's disease and related dementias, offering a secure, supportive environment with specialized programming.",
          shortDescription: "Specialized memory care in Western Massachusetts.",
          services: ["Memory Care", "Dementia Care", "Activities Program", "24-Hour Supervision", "Family Support"],
          amenities: ["Secure Environment", "Memory Garden", "Activity Rooms", "Private Rooms", "Dining Room"],
          totalBeds: 32,
          overallRating: "4.8",
          reviewCount: 18,
          acceptsMedicare: "no",
          acceptsMedicaid: "yes",
          status: "published",
          featured: "yes",
        },
        {
          name: "The Arbors at Westfield",
          facilityType: "assisted-living",
          address: "40 Court Street",
          city: "Westfield",
          state: "MA",
          zipCode: "01085",
          county: "Hampden",
          phone: "(413) 562-1600",
          description: "The Arbors at Westfield provides assisted living services in a comfortable, home-like setting with personalized care plans and engaging social activities.",
          shortDescription: "Comfortable assisted living in Westfield.",
          services: ["Assisted Living", "Medication Management", "Personal Care", "Wellness Programs", "Transportation"],
          amenities: ["Private Apartments", "Restaurant Dining", "Library", "Beauty Salon", "Gardens"],
          totalBeds: 60,
          overallRating: "4.3",
          reviewCount: 24,
          acceptsMedicare: "no",
          acceptsMedicaid: "yes",
          status: "published",
          featured: "no",
        },
        {
          name: "NewBridge on the Charles",
          facilityType: "independent-living",
          address: "5000 Great Meadow Road",
          city: "Dedham",
          state: "MA",
          zipCode: "02026",
          county: "Norfolk",
          phone: "(781) 234-2000",
          website: "https://www.newbridgeonthecharles.org",
          description: "NewBridge on the Charles is a premier continuing care community offering independent living, assisted living, and skilled nursing on a beautiful 162-acre campus along the Charles River.",
          shortDescription: "Luxury retirement community on the Charles River.",
          services: ["Independent Living", "Assisted Living", "Skilled Nursing", "Memory Care", "Rehabilitation"],
          amenities: ["Restaurant Dining", "Fitness Center", "Swimming Pool", "Art Studio", "Walking Trails", "Golf"],
          totalBeds: 250,
          overallRating: "4.9",
          reviewCount: 56,
          acceptsMedicare: "yes",
          acceptsMedicaid: "no",
          status: "published",
          featured: "yes",
        },
        {
          name: "Linden Ponds",
          facilityType: "independent-living",
          address: "300 Linden Ponds Way",
          city: "Hingham",
          state: "MA",
          zipCode: "02043",
          county: "Plymouth",
          phone: "(781) 534-7100",
          website: "https://www.lindenponds.com",
          description: "Linden Ponds is a vibrant Erickson Senior Living community offering maintenance-free independent living with access to continuing care services if needed.",
          shortDescription: "Active adult community on the South Shore.",
          services: ["Independent Living", "Assisted Living", "Memory Care", "Skilled Nursing", "Continuing Care"],
          amenities: ["Fitness Center", "Indoor Pool", "Restaurants", "Theater", "Walking Paths", "Putting Green"],
          totalBeds: 500,
          overallRating: "4.6",
          reviewCount: 89,
          acceptsMedicare: "yes",
          acceptsMedicaid: "no",
          status: "published",
          featured: "yes",
        },
        {
          name: "Goddard House",
          facilityType: "memory-care",
          address: "165 Chestnut Street",
          city: "Brookline",
          state: "MA",
          zipCode: "02445",
          county: "Norfolk",
          phone: "(617) 731-8500",
          website: "https://www.goddardhouse.org",
          description: "Goddard House provides specialized memory care in an intimate, home-like setting using innovative approaches to support individuals with Alzheimer's and dementia.",
          shortDescription: "Innovative memory care in Brookline.",
          services: ["Memory Care", "Dementia Care", "Art Therapy", "Music Therapy", "Family Support Programs"],
          amenities: ["Secure Gardens", "Music Room", "Art Studio", "Family Lounge", "Private Rooms"],
          totalBeds: 40,
          overallRating: "4.7",
          reviewCount: 31,
          acceptsMedicare: "no",
          acceptsMedicaid: "yes",
          status: "published",
          featured: "no",
        },
      ];

      const created = [];
      for (const facilityData of massachusettsFacilities) {
        const facility = await storage.createFacility(facilityData);
        created.push(facility);
      }

      res.json({ 
        message: `Successfully seeded ${created.length} facilities`,
        count: created.length 
      });
    } catch (error) {
      console.error("Error seeding facilities:", error);
      res.status(500).json({ message: "Failed to seed facilities" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
