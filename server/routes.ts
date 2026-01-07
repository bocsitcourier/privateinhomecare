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
import { comprehensiveFacilities } from "./seed-facilities-data";

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

      // Delete existing facilities if force mode
      if (force && existing.length > 0) {
        for (const facility of existing) {
          await storage.deleteFacility(facility.id);
        }
      }

      // Map comprehensive facilities data to expected format
      const facilitiesForStorage = comprehensiveFacilities.map((f) => ({
        name: f.name,
        slug: f.slug,
        facilityType: f.type,
        address: f.address,
        city: f.city,
        state: f.state,
        zipCode: f.zipCode,
        county: f.county,
        phone: f.phone,
        email: f.email,
        website: f.website,
        description: f.description,
        shortDescription: f.overview,
        services: f.services || [],
        amenities: f.amenities || [],
        specializations: f.specializations,
        totalBeds: f.capacity,
        yearEstablished: f.yearEstablished,
        licenseNumber: f.licenseNumber,
        overallRating: f.overallRating?.toString(),
        staffRating: f.staffRating?.toString(),
        facilityRating: f.facilityRating?.toString(),
        careRating: f.careRating?.toString(),
        reviewCount: f.reviewCount,
        priceMin: f.priceRangeMin,
        priceMax: f.priceRangeMax,
        acceptsMedicare: f.acceptsMedicare ? "yes" : "no",
        acceptsMedicaid: f.acceptsMedicaid ? "yes" : "no",
        acceptsPrivatePay: f.acceptsPrivatePay ? "yes" : "no",
        acceptsLongTermInsurance: f.acceptsLongTermInsurance ? "yes" : "no",
        status: f.status,
        featured: "no",
      }));

      const created = [];
      for (const facilityData of facilitiesForStorage) {
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

  // ==========================================
  // Quiz Lead Generation System Routes
  // ==========================================

  // Public: Get quiz by slug with questions
  app.get("/api/quizzes/:slug", async (req: Request, res: Response) => {
    try {
      const quiz = await storage.getQuizWithQuestions(req.params.slug);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      if (quiz.status !== "published") {
        return res.status(404).json({ message: "Quiz not found" });
      }
      res.json(quiz);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      res.status(500).json({ message: "Failed to fetch quiz" });
    }
  });

  // Public: Submit quiz lead with responses
  app.post("/api/quizzes/:slug/submit", async (req: Request, res: Response) => {
    try {
      const { name, email, phone, responses, captchaToken, sourcePage, referrer, utmSource, utmMedium, utmCampaign } = req.body;

      // Validate required fields
      if (!name || !email) {
        return res.status(400).json({ message: "Name and email are required" });
      }

      // Verify CAPTCHA
      if (process.env.RECAPTCHA_SECRET_KEY && captchaToken) {
        try {
          const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`;
          const captchaRes = await fetch(verifyUrl, { method: 'POST' });
          const captchaData = await captchaRes.json();
          if (!captchaData.success) {
            return res.status(400).json({ message: "CAPTCHA verification failed" });
          }
        } catch (error) {
          console.error("CAPTCHA verification error:", error);
          return res.status(400).json({ message: "CAPTCHA verification failed" });
        }
      }

      // Get quiz by slug
      const quiz = await storage.getQuizWithQuestions(req.params.slug);
      if (!quiz || quiz.status !== "published") {
        return res.status(404).json({ message: "Quiz not found" });
      }

      // Calculate lead score based on responses
      let totalScore = 0;
      let urgencyLevel = "low";
      
      if (responses && Array.isArray(responses)) {
        for (const response of responses) {
          const question = quiz.questions.find(q => q.id === response.questionId);
          if (question && question.options) {
            const options = question.options as any[];
            
            // Handle single choice (answerValue)
            if (response.answerValue) {
              const selectedOption = options.find(o => o.value === response.answerValue);
              if (selectedOption?.score) {
                totalScore += selectedOption.score * question.scoreWeight;
              }
            }
            
            // Handle multiple choice (answerValues array)
            if (response.answerValues && Array.isArray(response.answerValues)) {
              for (const value of response.answerValues) {
                const selectedOption = options.find(o => o.value === value);
                if (selectedOption?.score) {
                  totalScore += selectedOption.score * question.scoreWeight;
                }
              }
            }
          }
        }
      }

      // Determine urgency level based on score
      if (totalScore >= 30) urgencyLevel = "immediate";
      else if (totalScore >= 20) urgencyLevel = "high";
      else if (totalScore >= 10) urgencyLevel = "medium";

      // Create lead
      const lead = await storage.createQuizLead({
        quizId: quiz.id,
        name,
        email,
        phone: phone || undefined,
        urgencyLevel,
        sourcePage: sourcePage || undefined,
        referrer: referrer || undefined,
        utmSource: utmSource || undefined,
        utmMedium: utmMedium || undefined,
        utmCampaign: utmCampaign || undefined,
        ipAddress: (req.ip || req.socket.remoteAddress || undefined) as string | undefined,
        userAgent: req.headers['user-agent'] || undefined,
      });

      // Update lead score
      await storage.updateQuizLead(lead.id, { leadScore: totalScore });

      // Save individual responses
      if (responses && Array.isArray(responses)) {
        for (const response of responses) {
          const question = quiz.questions.find(q => q.id === response.questionId);
          let scoreContribution = 0;
          if (question && question.options) {
            const options = question.options as any[];
            
            // Handle single choice (answerValue)
            if (response.answerValue) {
              const selectedOption = options.find(o => o.value === response.answerValue);
              if (selectedOption?.score) {
                scoreContribution += selectedOption.score * question.scoreWeight;
              }
            }
            
            // Handle multiple choice (answerValues array)
            if (response.answerValues && Array.isArray(response.answerValues)) {
              for (const value of response.answerValues) {
                const selectedOption = options.find(o => o.value === value);
                if (selectedOption?.score) {
                  scoreContribution += selectedOption.score * question.scoreWeight;
                }
              }
            }
          }
          await storage.createQuizResponse({
            leadId: lead.id,
            questionId: response.questionId,
            answerValue: response.answerValue || undefined,
            answerValues: response.answerValues || [],
            answerText: response.answerText || undefined,
            scoreContribution,
          });
        }
      }

      // Send email notification
      if (process.env.RESEND_API_KEY) {
        try {
          const emailTo = process.env.HR_EMAIL || "info@privateinhomecaregiver.com";
          const { Resend } = await import("resend");
          const resend = new Resend(process.env.RESEND_API_KEY);

          const responsesSummary = responses && Array.isArray(responses) 
            ? responses.map((r: any) => {
                const q = quiz.questions.find(q => q.id === r.questionId);
                return `${q?.questionText || 'Question'}: ${r.answerValue || r.answerText || 'No answer'}`;
              }).join('\n')
            : 'No responses recorded';

          await resend.emails.send({
            from: "PrivateInHomeCareGiver <onboarding@resend.dev>",
            to: emailTo,
            subject: `New Quiz Lead: ${quiz.title} - ${urgencyLevel.toUpperCase()} Priority`,
            html: `
              <h2>New Quiz Lead Received</h2>
              <p><strong>Quiz:</strong> ${quiz.title}</p>
              <p><strong>Priority:</strong> ${urgencyLevel.toUpperCase()}</p>
              <p><strong>Lead Score:</strong> ${totalScore}</p>
              <hr>
              <h3>Contact Information</h3>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
              <hr>
              <h3>Quiz Responses</h3>
              <pre>${responsesSummary}</pre>
              <hr>
              <p><a href="${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : ''}/admin/quiz-leads">View in Admin Dashboard</a></p>
            `,
          });

          await storage.markQuizLeadEmailSent(lead.id);
        } catch (emailError) {
          console.error("Failed to send quiz lead email:", emailError);
        }
      }

      res.json({ 
        success: true,
        leadId: lead.id,
        score: totalScore,
        urgencyLevel,
        resultTitle: quiz.resultTitle,
        resultDescription: quiz.resultDescription,
        ctaText: quiz.ctaText,
        ctaUrl: quiz.ctaUrl,
      });
    } catch (error) {
      console.error("Error submitting quiz:", error);
      res.status(500).json({ message: "Failed to submit quiz" });
    }
  });

  // Admin: List all quizzes
  app.get("/api/admin/quizzes", requireAuth, async (req: Request, res: Response) => {
    try {
      const { status, category } = req.query;
      const quizzes = await storage.listQuizzes(
        status as string | undefined,
        category as string | undefined
      );
      res.json(quizzes);
    } catch (error) {
      console.error("Error listing quizzes:", error);
      res.status(500).json({ message: "Failed to list quizzes" });
    }
  });

  // Admin: Get single quiz with questions
  app.get("/api/admin/quizzes/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const quiz = await storage.getQuiz(req.params.id);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      const questions = await storage.listQuizQuestions(quiz.id);
      res.json({ ...quiz, questions });
    } catch (error) {
      console.error("Error fetching quiz:", error);
      res.status(500).json({ message: "Failed to fetch quiz" });
    }
  });

  // Admin: Create quiz
  app.post("/api/admin/quizzes", requireAuth, async (req: Request, res: Response) => {
    try {
      const quiz = await storage.createQuiz(req.body);
      res.status(201).json(quiz);
    } catch (error) {
      console.error("Error creating quiz:", error);
      res.status(500).json({ message: "Failed to create quiz" });
    }
  });

  // Admin: Update quiz
  app.patch("/api/admin/quizzes/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const quiz = await storage.updateQuiz(req.params.id, req.body);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      res.json(quiz);
    } catch (error) {
      console.error("Error updating quiz:", error);
      res.status(500).json({ message: "Failed to update quiz" });
    }
  });

  // Admin: Delete quiz
  app.delete("/api/admin/quizzes/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteQuiz(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      res.json({ message: "Quiz deleted" });
    } catch (error) {
      console.error("Error deleting quiz:", error);
      res.status(500).json({ message: "Failed to delete quiz" });
    }
  });

  // Admin: Publish/unpublish quiz
  app.post("/api/admin/quizzes/:id/publish", requireAuth, async (req: Request, res: Response) => {
    try {
      const quiz = await storage.publishQuiz(req.params.id);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      res.json(quiz);
    } catch (error) {
      console.error("Error publishing quiz:", error);
      res.status(500).json({ message: "Failed to publish quiz" });
    }
  });

  app.post("/api/admin/quizzes/:id/unpublish", requireAuth, async (req: Request, res: Response) => {
    try {
      const quiz = await storage.unpublishQuiz(req.params.id);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      res.json(quiz);
    } catch (error) {
      console.error("Error unpublishing quiz:", error);
      res.status(500).json({ message: "Failed to unpublish quiz" });
    }
  });

  // Admin: Quiz Questions
  app.post("/api/admin/quizzes/:quizId/questions", requireAuth, async (req: Request, res: Response) => {
    try {
      const question = await storage.createQuizQuestion({
        ...req.body,
        quizId: req.params.quizId,
      });
      res.status(201).json(question);
    } catch (error) {
      console.error("Error creating question:", error);
      res.status(500).json({ message: "Failed to create question" });
    }
  });

  app.patch("/api/admin/questions/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const question = await storage.updateQuizQuestion(req.params.id, req.body);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      res.json(question);
    } catch (error) {
      console.error("Error updating question:", error);
      res.status(500).json({ message: "Failed to update question" });
    }
  });

  app.delete("/api/admin/questions/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteQuizQuestion(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Question not found" });
      }
      res.json({ message: "Question deleted" });
    } catch (error) {
      console.error("Error deleting question:", error);
      res.status(500).json({ message: "Failed to delete question" });
    }
  });

  // Admin: Quiz Leads
  app.get("/api/admin/quiz-leads", requireAuth, async (req: Request, res: Response) => {
    try {
      const { quizId, status, startDate, endDate } = req.query;
      const leads = await storage.listQuizLeads({
        quizId: quizId as string | undefined,
        status: status as string | undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });
      res.json(leads);
    } catch (error) {
      console.error("Error listing quiz leads:", error);
      res.status(500).json({ message: "Failed to list quiz leads" });
    }
  });

  app.get("/api/admin/quiz-leads/stats", requireAuth, async (req: Request, res: Response) => {
    try {
      const stats = await storage.getQuizLeadStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching quiz lead stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/quiz-leads/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const lead = await storage.getQuizLeadWithResponses(req.params.id);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      console.error("Error fetching quiz lead:", error);
      res.status(500).json({ message: "Failed to fetch lead" });
    }
  });

  app.patch("/api/admin/quiz-leads/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const lead = await storage.updateQuizLead(req.params.id, req.body);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      console.error("Error updating quiz lead:", error);
      res.status(500).json({ message: "Failed to update lead" });
    }
  });

  app.delete("/api/admin/quiz-leads/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteQuizLead(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json({ message: "Lead deleted" });
    } catch (error) {
      console.error("Error deleting quiz lead:", error);
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });

  // Seed quiz definitions and questions
  app.post("/api/seed/quizzes", async (req: Request, res: Response) => {
    try {
      const existingQuizzes = await storage.listQuizzes();
      if (existingQuizzes.length > 0 && !req.query.force) {
        return res.json({ message: "Quizzes already exist. Use ?force=true to reseed.", count: existingQuizzes.length });
      }

      // Delete existing quizzes if force=true
      if (req.query.force && existingQuizzes.length > 0) {
        for (const quiz of existingQuizzes) {
          await storage.deleteQuiz(quiz.id);
        }
      }

      const quizDefinitions = [
        {
          slug: "personal-care-assessment",
          title: "Personal Care Needs Assessment",
          subtitle: "Find the right level of personal care support",
          description: "Answer a few questions to help us understand your care needs and connect you with the right caregivers.",
          category: "service",
          targetType: "personal-care",
          serviceType: "personal-care",
          status: "published",
          resultTitle: "Your Personal Care Plan",
          resultDescription: "Based on your responses, we've identified care options that match your needs.",
          ctaText: "Schedule a Free Consultation",
          ctaUrl: "/consultation",
          metaTitle: "Personal Care Assessment Quiz | PrivateInHomeCareGiver",
          metaDescription: "Take our free assessment to find the right personal care services for your loved one in Massachusetts.",
          questions: [
            { text: "What level of assistance is needed with daily activities?", options: [
              { value: "minimal", label: "Minimal - occasional reminders", score: 1 },
              { value: "moderate", label: "Moderate - regular hands-on help", score: 2 },
              { value: "extensive", label: "Extensive - assistance with most activities", score: 3 },
              { value: "complete", label: "Complete - 24/7 care needed", score: 4 }
            ]},
            { text: "Which personal care tasks require assistance?", type: "multiple_choice", options: [
              { value: "bathing", label: "Bathing and grooming", score: 1 },
              { value: "dressing", label: "Dressing", score: 1 },
              { value: "mobility", label: "Mobility and transfers", score: 2 },
              { value: "toileting", label: "Toileting", score: 2 },
              { value: "feeding", label: "Eating and feeding", score: 2 }
            ]},
            { text: "How urgently is care needed?", options: [
              { value: "planning", label: "Just planning ahead", score: 1 },
              { value: "weeks", label: "Within the next few weeks", score: 2 },
              { value: "days", label: "Within a few days", score: 3 },
              { value: "immediately", label: "Immediately", score: 4 }
            ]}
          ]
        },
        {
          slug: "companionship-needs-quiz",
          title: "Companionship Care Quiz",
          subtitle: "Find the perfect companion for your loved one",
          description: "Help us understand your companionship needs to match you with the ideal caregiver.",
          category: "service",
          targetType: "companionship",
          serviceType: "companionship",
          status: "published",
          resultTitle: "Your Companionship Match",
          resultDescription: "We've identified companion caregivers who match your preferences and needs.",
          ctaText: "View Companion Caregivers",
          ctaUrl: "/caregivers",
          questions: [
            { text: "What is the primary goal for companionship care?", options: [
              { value: "social", label: "Social interaction and conversation", score: 1 },
              { value: "activities", label: "Engagement in hobbies and activities", score: 2 },
              { value: "errands", label: "Help with errands and outings", score: 2 },
              { value: "supervision", label: "Safety supervision at home", score: 3 }
            ]},
            { text: "How many hours per week of companionship is needed?", options: [
              { value: "few", label: "A few hours (2-4)", score: 1 },
              { value: "parttime", label: "Part-time (10-20 hours)", score: 2 },
              { value: "fulltime", label: "Full-time (40+ hours)", score: 3 }
            ]},
            { text: "Are there any cognitive concerns?", options: [
              { value: "none", label: "No cognitive concerns", score: 1 },
              { value: "mild", label: "Mild forgetfulness", score: 2 },
              { value: "moderate", label: "Moderate memory issues", score: 3 },
              { value: "dementia", label: "Diagnosed dementia/Alzheimer's", score: 4 }
            ]}
          ]
        },
        {
          slug: "dementia-care-assessment",
          title: "Memory Care Assessment",
          subtitle: "Specialized dementia care evaluation",
          description: "Help us understand the memory care needs of your loved one.",
          category: "service",
          targetType: "dementia-care",
          serviceType: "dementia-care",
          status: "published",
          resultTitle: "Your Memory Care Recommendation",
          resultDescription: "Based on your answers, here are our recommendations for memory care support.",
          ctaText: "Learn About Dementia Care",
          ctaUrl: "/dementia-care/massachusetts",
          questions: [
            { text: "What stage of memory loss is your loved one experiencing?", options: [
              { value: "early", label: "Early stage - mild forgetfulness", score: 1 },
              { value: "middle", label: "Middle stage - needs reminders and supervision", score: 2 },
              { value: "late", label: "Late stage - requires constant care", score: 3 }
            ]},
            { text: "Are there any behavioral challenges?", options: [
              { value: "none", label: "No behavioral issues", score: 1 },
              { value: "wandering", label: "Wandering tendencies", score: 2 },
              { value: "agitation", label: "Occasional agitation", score: 2 },
              { value: "significant", label: "Significant behavioral challenges", score: 3 }
            ]},
            { text: "Is overnight care needed?", options: [
              { value: "no", label: "No, daytime only", score: 1 },
              { value: "sometimes", label: "Sometimes overnight help", score: 2 },
              { value: "yes", label: "Yes, 24-hour care needed", score: 3 }
            ]}
          ]
        },
        {
          slug: "nursing-home-readiness",
          title: "Nursing Home Readiness Quiz",
          subtitle: "Is nursing home care the right choice?",
          description: "This assessment helps determine if skilled nursing care is appropriate for your situation.",
          category: "facility",
          targetType: "nursing-home",
          facilityType: "nursing-home",
          status: "published",
          resultTitle: "Your Care Level Assessment",
          resultDescription: "We've analyzed your responses to help you understand your care options.",
          ctaText: "View Nursing Homes",
          ctaUrl: "/facilities/nursing-home",
          questions: [
            { text: "What medical care is currently needed?", options: [
              { value: "minimal", label: "Minimal - occasional doctor visits", score: 1 },
              { value: "moderate", label: "Moderate - regular medical management", score: 2 },
              { value: "significant", label: "Significant - daily medical care", score: 3 },
              { value: "intensive", label: "Intensive - complex medical needs", score: 4 }
            ]},
            { text: "Is physical or occupational therapy needed?", options: [
              { value: "no", label: "Not currently needed", score: 1 },
              { value: "occasional", label: "Occasional therapy sessions", score: 2 },
              { value: "regular", label: "Regular ongoing therapy", score: 3 }
            ]},
            { text: "Can the person manage most daily activities independently?", options: [
              { value: "yes", label: "Yes, mostly independent", score: 1 },
              { value: "some", label: "Needs some assistance", score: 2 },
              { value: "no", label: "Needs significant help", score: 3 }
            ]}
          ]
        },
        {
          slug: "assisted-living-quiz",
          title: "Assisted Living Assessment",
          subtitle: "Is assisted living right for you?",
          description: "Help us understand if assisted living is the best fit for your loved one's needs.",
          category: "facility",
          targetType: "assisted-living",
          facilityType: "assisted-living",
          status: "published",
          resultTitle: "Your Assisted Living Options",
          resultDescription: "Based on your responses, here are recommended assisted living considerations.",
          ctaText: "Browse Assisted Living",
          ctaUrl: "/facilities/assisted-living",
          questions: [
            { text: "What level of independence does your loved one have?", options: [
              { value: "high", label: "Highly independent with minimal needs", score: 1 },
              { value: "moderate", label: "Somewhat independent, needs daily support", score: 2 },
              { value: "low", label: "Needs significant daily assistance", score: 3 }
            ]},
            { text: "What social environment is preferred?", options: [
              { value: "private", label: "Prefers privacy and solitude", score: 1 },
              { value: "mixed", label: "Balance of social and private time", score: 2 },
              { value: "social", label: "Enjoys active social environment", score: 2 }
            ]},
            { text: "What amenities are most important?", type: "multiple_choice", options: [
              { value: "meals", label: "Prepared meals", score: 1 },
              { value: "housekeeping", label: "Housekeeping services", score: 1 },
              { value: "transportation", label: "Transportation services", score: 1 },
              { value: "activities", label: "Social activities and events", score: 1 },
              { value: "healthcare", label: "On-site healthcare", score: 2 }
            ]}
          ]
        },
        {
          slug: "homemaking-care-assessment",
          title: "Homemaking Care Assessment",
          subtitle: "Find the right household support",
          description: "Help us understand your homemaking and household management needs.",
          category: "service",
          targetType: "homemaking",
          serviceType: "homemaking",
          status: "published",
          resultTitle: "Your Homemaking Care Plan",
          resultDescription: "Based on your responses, we've identified homemaking services that match your needs.",
          ctaText: "Schedule a Free Consultation",
          ctaUrl: "/consultation",
          metaTitle: "Homemaking Care Assessment | PrivateInHomeCareGiver",
          metaDescription: "Take our free assessment to find the right homemaking and household support services in Massachusetts.",
          questions: [
            { text: "What household tasks need assistance?", type: "multiple_choice", options: [
              { value: "cleaning", label: "Light housekeeping and cleaning", score: 1 },
              { value: "laundry", label: "Laundry and linens", score: 1 },
              { value: "meals", label: "Meal preparation", score: 2 },
              { value: "shopping", label: "Grocery shopping and errands", score: 1 },
              { value: "organization", label: "Home organization", score: 1 }
            ]},
            { text: "How often is homemaking help needed?", options: [
              { value: "weekly", label: "Once a week", score: 1 },
              { value: "twiceweek", label: "2-3 times per week", score: 2 },
              { value: "daily", label: "Daily assistance", score: 3 }
            ]},
            { text: "Are there any mobility limitations to consider?", options: [
              { value: "none", label: "No mobility issues", score: 1 },
              { value: "some", label: "Some difficulty with movement", score: 2 },
              { value: "significant", label: "Significant mobility challenges", score: 3 }
            ]}
          ]
        },
        {
          slug: "respite-care-assessment",
          title: "Respite Care Assessment",
          subtitle: "Give family caregivers a well-deserved break",
          description: "Let us help you find temporary relief care while you recharge.",
          category: "service",
          targetType: "respite-care",
          serviceType: "respite-care",
          status: "published",
          resultTitle: "Your Respite Care Options",
          resultDescription: "We've identified respite care solutions to support your family.",
          ctaText: "Schedule Respite Care",
          ctaUrl: "/consultation",
          metaTitle: "Respite Care Assessment | PrivateInHomeCareGiver",
          metaDescription: "Find temporary relief care for family caregivers in Massachusetts with our free respite care assessment.",
          questions: [
            { text: "How long do you need respite care?", options: [
              { value: "hours", label: "A few hours", score: 1 },
              { value: "day", label: "Full day", score: 2 },
              { value: "overnight", label: "Overnight stay", score: 3 },
              { value: "extended", label: "Multiple days/week", score: 4 }
            ]},
            { text: "What level of care does your loved one need?", options: [
              { value: "companionship", label: "Mainly companionship and supervision", score: 1 },
              { value: "personal", label: "Personal care assistance", score: 2 },
              { value: "medical", label: "Medical care management", score: 3 },
              { value: "memory", label: "Memory care support", score: 3 }
            ]},
            { text: "How soon do you need respite care?", options: [
              { value: "planning", label: "Planning for the future", score: 1 },
              { value: "month", label: "Within the next month", score: 2 },
              { value: "week", label: "Within a week", score: 3 },
              { value: "urgent", label: "As soon as possible", score: 4 }
            ]}
          ]
        },
        {
          slug: "live-in-care-assessment",
          title: "Live-In Care Assessment",
          subtitle: "24/7 care in the comfort of home",
          description: "Determine if live-in care is the right solution for your family.",
          category: "service",
          targetType: "live-in-care",
          serviceType: "live-in-care",
          status: "published",
          resultTitle: "Your Live-In Care Recommendation",
          resultDescription: "Based on your needs, here are our live-in care recommendations.",
          ctaText: "Learn About Live-In Care",
          ctaUrl: "/live-in-care/massachusetts",
          metaTitle: "Live-In Care Assessment | PrivateInHomeCareGiver",
          metaDescription: "Discover if 24/7 live-in care is right for your loved one in Massachusetts.",
          questions: [
            { text: "Why is live-in care being considered?", options: [
              { value: "safety", label: "Safety concerns when alone", score: 2 },
              { value: "medical", label: "Complex medical needs", score: 3 },
              { value: "memory", label: "Memory issues requiring supervision", score: 3 },
              { value: "preference", label: "Prefer aging in place vs facility", score: 1 }
            ]},
            { text: "What is the current living situation?", options: [
              { value: "alone", label: "Living alone", score: 3 },
              { value: "spouse", label: "Living with spouse/partner", score: 2 },
              { value: "family", label: "Living with family", score: 1 }
            ]},
            { text: "Is there a private room available for a live-in caregiver?", options: [
              { value: "yes", label: "Yes, private room available", score: 1 },
              { value: "can-arrange", label: "Can arrange accommodations", score: 2 },
              { value: "no", label: "No, need to discuss options", score: 2 }
            ]}
          ]
        },
        {
          slug: "post-hospital-care-assessment",
          title: "Post-Hospital Care Assessment",
          subtitle: "Smooth recovery after hospitalization",
          description: "Get the right support during recovery after a hospital stay or surgery.",
          category: "service",
          targetType: "post-hospital-care",
          serviceType: "post-hospital-care",
          status: "published",
          resultTitle: "Your Recovery Care Plan",
          resultDescription: "We've created a recovery support plan based on your needs.",
          ctaText: "Schedule Recovery Care",
          ctaUrl: "/consultation",
          metaTitle: "Post-Hospital Care Assessment | PrivateInHomeCareGiver",
          metaDescription: "Get the right home care support after hospitalization or surgery in Massachusetts.",
          questions: [
            { text: "What type of hospital stay occurred?", options: [
              { value: "surgery", label: "Planned surgery", score: 2 },
              { value: "emergency", label: "Emergency hospitalization", score: 3 },
              { value: "illness", label: "Illness treatment", score: 2 },
              { value: "rehab", label: "Rehabilitation stay", score: 2 }
            ]},
            { text: "What recovery support is needed?", type: "multiple_choice", options: [
              { value: "mobility", label: "Mobility assistance", score: 2 },
              { value: "medication", label: "Medication reminders", score: 1 },
              { value: "wound", label: "Wound care monitoring", score: 2 },
              { value: "therapy", label: "Therapy exercise support", score: 2 },
              { value: "meals", label: "Meal preparation", score: 1 }
            ]},
            { text: "When is hospital discharge expected?", options: [
              { value: "discharged", label: "Already discharged", score: 3 },
              { value: "days", label: "Within a few days", score: 3 },
              { value: "week", label: "Within a week", score: 2 },
              { value: "planning", label: "Planning ahead", score: 1 }
            ]}
          ]
        },
        {
          slug: "memory-care-facility-quiz",
          title: "Memory Care Facility Assessment",
          subtitle: "Find specialized memory care for your loved one",
          description: "Evaluate if a memory care community is the right choice for dementia or Alzheimer's care.",
          category: "facility",
          targetType: "memory-care",
          facilityType: "memory-care",
          status: "published",
          resultTitle: "Your Memory Care Options",
          resultDescription: "Based on your responses, here are memory care facility recommendations.",
          ctaText: "Browse Memory Care Facilities",
          ctaUrl: "/facilities/memory-care",
          metaTitle: "Memory Care Facility Assessment | PrivateInHomeCareGiver",
          metaDescription: "Find the right memory care community for Alzheimer's or dementia care in Massachusetts.",
          questions: [
            { text: "What is the current memory care diagnosis?", options: [
              { value: "early-alzheimers", label: "Early-stage Alzheimer's", score: 1 },
              { value: "mid-alzheimers", label: "Mid-stage Alzheimer's", score: 2 },
              { value: "late-alzheimers", label: "Late-stage Alzheimer's", score: 3 },
              { value: "other-dementia", label: "Other form of dementia", score: 2 }
            ]},
            { text: "What safety concerns exist?", type: "multiple_choice", options: [
              { value: "wandering", label: "Wandering risk", score: 2 },
              { value: "falls", label: "Fall risk", score: 2 },
              { value: "medication", label: "Medication management", score: 1 },
              { value: "behavior", label: "Behavioral challenges", score: 2 }
            ]},
            { text: "What is most important in a memory care facility?", options: [
              { value: "security", label: "Secure environment", score: 2 },
              { value: "activities", label: "Engaging activities program", score: 1 },
              { value: "medical", label: "Medical support on-site", score: 2 },
              { value: "homelike", label: "Home-like atmosphere", score: 1 }
            ]}
          ]
        },
        {
          slug: "independent-living-quiz",
          title: "Independent Living Assessment",
          subtitle: "Active senior living with peace of mind",
          description: "Discover if an independent living community is right for your lifestyle.",
          category: "facility",
          targetType: "independent-living",
          facilityType: "independent-living",
          status: "published",
          resultTitle: "Your Independent Living Match",
          resultDescription: "We've identified independent living options based on your preferences.",
          ctaText: "Explore Independent Living",
          ctaUrl: "/facilities/independent-living",
          metaTitle: "Independent Living Assessment | PrivateInHomeCareGiver",
          metaDescription: "Find the perfect independent living community for active seniors in Massachusetts.",
          questions: [
            { text: "What is motivating the move to independent living?", options: [
              { value: "downsize", label: "Want to downsize and simplify", score: 1 },
              { value: "social", label: "Seeking more social connections", score: 1 },
              { value: "maintenance", label: "Tired of home maintenance", score: 1 },
              { value: "future", label: "Planning for future care needs", score: 2 }
            ]},
            { text: "What amenities are most important?", type: "multiple_choice", options: [
              { value: "dining", label: "Restaurant-style dining", score: 1 },
              { value: "fitness", label: "Fitness center and pool", score: 1 },
              { value: "activities", label: "Social activities and clubs", score: 1 },
              { value: "transportation", label: "Transportation services", score: 1 },
              { value: "concierge", label: "Concierge services", score: 1 }
            ]},
            { text: "What living space do you prefer?", options: [
              { value: "studio", label: "Studio apartment", score: 1 },
              { value: "one-bed", label: "One-bedroom apartment", score: 1 },
              { value: "two-bed", label: "Two-bedroom apartment", score: 2 },
              { value: "cottage", label: "Cottage or villa", score: 2 }
            ]}
          ]
        },
        {
          slug: "continuing-care-quiz",
          title: "Continuing Care Community Assessment",
          subtitle: "Plan for all stages of senior living",
          description: "Explore if a continuing care retirement community (CCRC) fits your long-term plans.",
          category: "facility",
          targetType: "continuing-care",
          facilityType: "continuing-care",
          status: "published",
          resultTitle: "Your CCRC Options",
          resultDescription: "Based on your responses, here are continuing care community recommendations.",
          ctaText: "Explore CCRCs",
          ctaUrl: "/facilities/continuing-care",
          metaTitle: "Continuing Care Assessment | PrivateInHomeCareGiver",
          metaDescription: "Find the right continuing care retirement community (CCRC) in Massachusetts.",
          questions: [
            { text: "What is the current health status?", options: [
              { value: "excellent", label: "Excellent - fully independent", score: 1 },
              { value: "good", label: "Good - minor health management", score: 1 },
              { value: "fair", label: "Fair - some ongoing care needs", score: 2 },
              { value: "planning", label: "Planning for future needs", score: 1 }
            ]},
            { text: "What is most important about a CCRC?", options: [
              { value: "security", label: "Long-term care security", score: 2 },
              { value: "lifestyle", label: "Active lifestyle amenities", score: 1 },
              { value: "healthcare", label: "On-campus healthcare", score: 2 },
              { value: "community", label: "Strong sense of community", score: 1 }
            ]},
            { text: "What type of contract is preferred?", options: [
              { value: "lifecare", label: "Life care (Type A) - predictable costs", score: 2 },
              { value: "modified", label: "Modified (Type B) - balance of costs", score: 2 },
              { value: "fee-service", label: "Fee-for-service (Type C) - lower entry", score: 1 },
              { value: "unsure", label: "Need guidance on options", score: 1 }
            ]}
          ]
        }
      ];

      const createdQuizzes = [];
      for (const quizDef of quizDefinitions) {
        const { questions, ...quizData } = quizDef;
        const quiz = await storage.createQuiz(quizData);
        
        let order = 1;
        for (const q of questions) {
          await storage.createQuizQuestion({
            quizId: quiz.id,
            questionText: q.text,
            questionType: q.type || "single_choice",
            options: q.options,
            displayOrder: order++,
            isRequired: "yes",
            scoreWeight: 1,
          });
        }
        createdQuizzes.push(quiz);
      }

      res.json({ 
        message: `Successfully seeded ${createdQuizzes.length} quizzes`,
        count: createdQuizzes.length,
        quizzes: createdQuizzes.map(q => ({ slug: q.slug, title: q.title }))
      });
    } catch (error) {
      console.error("Error seeding quizzes:", error);
      res.status(500).json({ message: "Failed to seed quizzes", error: String(error) });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
