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
  insertFacilityFaqSchema, updateFacilityFaqSchema,
  insertNonSolicitationSchema, updateNonSolicitationSchema,
  insertInitialAssessmentSchema, updateInitialAssessmentSchema,
  insertClientIntakeSchema, updateClientIntakeSchema,
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
import { hospitalSeedData } from "./seed-hospitals-data";
import { enrichFacility, enrichFacilitiesBatch, createDataHash, type EnrichmentResult } from "./googlePlaces";
import { fetchYouTubeVideoDetails, formatDuration, fetchChannelVideos } from "./youtube";
import OpenAI from "openai";
import crypto from "crypto";

// Helper to anonymize IP for analytics
const maskIp = (ip: string | undefined): string => {
  if (!ip) return 'unknown';
  return crypto.createHash('md5').update(ip).digest('hex').substring(0, 10);
};

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

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
  
  // Skip CAPTCHA verification in development mode
  if (!isProduction) {
    return { success: true };
  }
  
  if (!recaptchaSecret) {
    return { success: false, error: "Server configuration error. Please contact support." };
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

const mediaUpload = multer({
  storage: uploadStorage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB for videos/audio
  },
  fileFilter: (req, file, cb) => {
    const videoTypes = /mp4|webm|mov|avi|mkv|m4v/;
    const audioTypes = /mp3|wav|ogg|m4a|aac|flac/;
    const imageTypes = /jpeg|jpg|png|gif|webp/;
    
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const isVideo = videoTypes.test(ext) || file.mimetype.startsWith('video/');
    const isAudio = audioTypes.test(ext) || file.mimetype.startsWith('audio/');
    const isImage = imageTypes.test(ext) || file.mimetype.startsWith('image/');
    
    if (isVideo || isAudio || isImage) {
      return cb(null, true);
    } else {
      cb(new Error('Only video, audio, and image files are allowed'));
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
  
  // Serve video files from public/videos directory
  app.use('/videos', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Accept-Ranges', 'bytes');
    next();
  });
  app.use('/videos', express.static('public/videos'));
  
  // Serve thumbnail images from public/thumbnails directory
  app.use('/thumbnails', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  });
  app.use('/thumbnails', express.static('public/thumbnails'));
  
  app.post("/api/auth/login", authLimiter, async (req, res) => {
    try {
      const { username, password, captchaToken } = req.body;
      
      // Defensive: check for required fields
      if (!password || typeof password !== 'string') {
        return res.status(400).json({ error: "Password is required" });
      }
      
      // Check if CAPTCHA is required (configured AND in production)
      const isProduction = process.env.NODE_ENV === 'production';
      const captchaRequired = !!process.env.RECAPTCHA_SECRET_KEY && isProduction;
      
      // Require CAPTCHA token only in production
      if (captchaRequired) {
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

  app.post("/api/upload/media", requireAuth, mediaUpload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ 
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
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

  // Analytics tracking endpoints
  app.post("/api/track/pageview", async (req, res) => {
    try {
      const { slug, referrer } = req.body;
      if (!slug) {
        return res.status(400).json({ error: "Slug is required" });
      }
      const ipMasked = maskIp(req.ip || req.socket.remoteAddress);
      const userAgent = req.headers['user-agent'] || '';
      
      await storage.createPageView({
        slug,
        referrer: referrer || null,
        userAgent,
        ipMasked,
      });
      res.sendStatus(204);
    } catch (error: any) {
      console.error("Page view tracking error:", error);
      res.sendStatus(204); // Don't fail silently for analytics
    }
  });

  app.post("/api/track/media", async (req, res) => {
    try {
      const { mediaId, mediaTitle, eventType, mediaType } = req.body;
      if (!eventType || !mediaType) {
        return res.status(400).json({ error: "Event type and media type required" });
      }
      
      await storage.createMediaEvent({
        mediaId: mediaId || null,
        mediaTitle: mediaTitle || null,
        eventType,
        mediaType,
      });
      res.sendStatus(204);
    } catch (error: any) {
      console.error("Media tracking error:", error);
      res.sendStatus(204);
    }
  });

  // Analytics summary endpoint (admin only)
  app.get("/api/admin/analytics/summary", requireAuth, async (req, res) => {
    try {
      const summary = await storage.getAnalyticsSummary();
      res.json(summary);
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

  // Public form submission routes
  app.post("/api/forms/non-solicitation", publicFormLimiter, async (req, res) => {
    try {
      const formData = req.body;
      
      if (formData.email && isDisposableEmail(formData.email)) {
        return res.status(400).json({ error: "Please use a permanent email address" });
      }
      
      const agreementData = {
        email: formData.email,
        clientFullName: formData.clientFullName,
        responsibleParty: formData.responsibleParty,
        billingAddress: formData.billingAddress,
        placementOption: formData.placementOption,
        agreementTerms: {
          noPrivateEmployment: formData.acknowledgments?.noPrivateEmployment || false,
          noReferralForPrivateHire: formData.acknowledgments?.noReferrals || false,
          understandUnderTablePayments: formData.acknowledgments?.noUnderTablePayments || false,
        },
        penaltyAcknowledgments: {
          agreedToLiquidatedDamages: formData.penalties?.agreedToLiquidatedDamages || false,
          agreedToLegalFees: formData.penalties?.agreedToLegalFees || false,
        },
        electronicSignature: formData.signature,
        agreementDate: formData.signatureDate,
        status: "active",
      };
      
      const agreement = await storage.createNonSolicitationAgreement(agreementData);
      
      // Send confirmation email if email is configured
      try {
        await sendEmail({
          to: formData.email,
          subject: "Non-Solicitation Agreement Received - Private In-Home Caregiver",
          html: `
            <h2>Non-Solicitation Agreement Received</h2>
            <p>Dear ${formData.clientFullName},</p>
            <p>Thank you for completing the Non-Solicitation & Placement Agreement with Private In-Home Caregiver.</p>
            <p>We have received your signed agreement and will keep it on file.</p>
            <p>If you have any questions, please contact us at (617) 686-0595.</p>
            <p>Best regards,<br>Private In-Home Caregiver Team</p>
          `
        });
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
      }
      
      res.status(201).json({ success: true, id: agreement.id });
    } catch (error: any) {
      console.error("Non-solicitation form error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/forms/initial-assessment", publicFormLimiter, async (req, res) => {
    try {
      const formData = req.body;
      
      if (formData.email && isDisposableEmail(formData.email)) {
        return res.status(400).json({ error: "Please use a permanent email address" });
      }
      
      const assessmentData = {
        email: formData.email,
        clientFullName: formData.clientFullName,
        clientDateOfBirth: formData.clientDob,
        serviceAddress: formData.serviceAddress,
        responsiblePartyName: formData.responsiblePartyName,
        responsiblePartyRelationship: formData.responsiblePartyRelationship,
        billingEmail: formData.billingEmail,
        primaryPhone: formData.primaryPhone,
        careAssessment: {
          primaryDiagnosis: formData.primaryDiagnosis,
          adlsRequired: formData.adlsRequired || [],
          iadlsRequired: formData.iadlsRequired || [],
          medicalHistory: formData.medicalHistory,
          currentMedications: formData.currentMedications,
        },
        homeSafety: {
          homeAccessMethod: formData.homeAccessMethod,
          keypadCodeOrKeyLocation: formData.keyLocation || "",
          petsInHome: formData.petsInHome,
          smokingPolicy: formData.smokingPolicy,
        },
        serviceSchedule: {
          serviceStartDate: formData.serviceStartDate,
          serviceDays: formData.serviceDays || [],
          shiftHours: formData.shiftHours,
          guaranteedMinHours: formData.minimumHoursPerWeek || "",
          recommendedLevelOfCare: formData.recommendedCareLevel,
          careGoal: formData.careGoal,
        },
        financialAgreement: {
          standardHourlyRate: formData.standardRateAccepted || false,
          weekendHolidayRate: formData.weekendRateAccepted || false,
          initialRetainerFee: formData.retainerAccepted || false,
          additionalFees: formData.additionalFees || [],
          preferredPaymentMethod: formData.paymentMethod,
        },
        legalAcknowledgments: {
          agreedHipaa: formData.acknowledgments?.hipaa || false,
          agreedPrivacyPolicy: formData.acknowledgments?.privacy || false,
          agreedTermsConditions: formData.acknowledgments?.terms || false,
          agreedCancellationPolicy: formData.acknowledgments?.cancellation || false,
          agreedNonSolicitation: formData.acknowledgments?.nonSolicitation || false,
          understandNonMedical: formData.acknowledgments?.nonMedical || false,
        },
        emergencyContact: {
          emergencyContactName: formData.emergencyContactName,
          emergencyContactPhone: formData.emergencyContactPhone,
          additionalPhone: formData.additionalPhone || "",
          preferredHospital: formData.preferredHospital,
        },
        electronicSignature: formData.signature,
        signatureDate: formData.signatureDate,
        status: "pending",
      };
      
      const assessment = await storage.createInitialAssessment(assessmentData);
      
      // Send confirmation email
      try {
        await sendEmail({
          to: formData.email,
          subject: "Initial Assessment Received - Private In-Home Caregiver",
          html: `
            <h2>Initial Assessment & Service Agreement Received</h2>
            <p>Dear ${formData.clientFullName},</p>
            <p>Thank you for completing the Initial Assessment & Service Agreement with Private In-Home Caregiver.</p>
            <p>Our team will review your information and contact you shortly to discuss next steps.</p>
            <p><strong>Service Start Date:</strong> ${formData.serviceStartDate}</p>
            <p><strong>Care Level:</strong> ${formData.recommendedCareLevel}</p>
            <p>If you have any questions, please contact us at (617) 686-0595.</p>
            <p>Best regards,<br>Private In-Home Caregiver Team</p>
          `
        });
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
      }
      
      res.status(201).json({ success: true, id: assessment.id });
    } catch (error: any) {
      console.error("Initial assessment form error:", error);
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

  // ===== Non-Solicitation Agreements =====
  app.get("/api/admin/non-solicitation-agreements", requireAuth, async (req, res) => {
    try {
      const { status } = req.query;
      const agreements = await storage.listNonSolicitationAgreements(status as string | undefined);
      res.json(agreements);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/non-solicitation-agreements/:id", requireAuth, async (req, res) => {
    try {
      const agreement = await storage.getNonSolicitationAgreement(req.params.id);
      if (!agreement) {
        return res.status(404).json({ error: "Non-solicitation agreement not found" });
      }
      res.json(agreement);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/non-solicitation-agreements", requireAuth, async (req, res) => {
    try {
      const { captchaToken, ...formData } = req.body;
      
      if (captchaToken) {
        const captchaResult = await verifyCaptcha(captchaToken);
        if (!captchaResult.success) {
          return res.status(400).json({ error: "CAPTCHA verification failed" });
        }
      }
      
      const data = insertNonSolicitationSchema.omit({ captchaToken: true }).parse(formData);
      const agreement = await storage.createNonSolicitationAgreement(data);
      res.status(201).json(agreement);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/admin/non-solicitation-agreements/:id", requireAuth, async (req, res) => {
    try {
      const data = updateNonSolicitationSchema.parse(req.body);
      const agreement = await storage.updateNonSolicitationAgreement(req.params.id, data);
      if (!agreement) {
        return res.status(404).json({ error: "Non-solicitation agreement not found" });
      }
      res.json(agreement);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/admin/non-solicitation-agreements/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteNonSolicitationAgreement(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Non-solicitation agreement not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/non-solicitation-agreements/:id/send-email", requireAuth, async (req, res) => {
    try {
      const agreement = await storage.getNonSolicitationAgreement(req.params.id);
      if (!agreement) {
        return res.status(404).json({ error: "Non-solicitation agreement not found" });
      }

      const { recipientEmail } = req.body;
      const emailTo = recipientEmail || agreement.email;

      await sendEmail({
        to: emailTo,
        subject: "Non-Solicitation & Placement Agreement - Private In-Home Caregiver",
        html: `
          <h2>Non-Solicitation & Placement Agreement</h2>
          <p>Dear ${agreement.clientFullName},</p>
          <p>Thank you for signing the Non-Solicitation & Placement Agreement with Private In-Home Caregiver.</p>
          <h3>Agreement Details:</h3>
          <ul>
            <li><strong>Responsible Party:</strong> ${agreement.responsibleParty}</li>
            <li><strong>Agreement Date:</strong> ${agreement.agreementDate}</li>
            <li><strong>Placement Option:</strong> ${agreement.placementOption === 'option_a' ? 'Immediate Buyout Fee ($3,500.00)' : agreement.placementOption === 'option_b' ? 'Transition after 300 hours + $1,500.00 Fee' : '12-month Non-Solicitation Agreement'}</li>
          </ul>
          <p>If you have any questions, please contact us at info@privateinhomecaregiver.com or call 617-686-0595.</p>
          <p>Sincerely,<br/>Private In-Home Caregiver Team</p>
        `
      });

      await storage.markNonSolicitationEmailSent(req.params.id);
      res.json({ success: true, message: "Email sent successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== Initial Assessments =====
  app.get("/api/admin/initial-assessments", requireAuth, async (req, res) => {
    try {
      const { status } = req.query;
      const assessments = await storage.listInitialAssessments(status as string | undefined);
      res.json(assessments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/initial-assessments/:id", requireAuth, async (req, res) => {
    try {
      const assessment = await storage.getInitialAssessment(req.params.id);
      if (!assessment) {
        return res.status(404).json({ error: "Initial assessment not found" });
      }
      res.json(assessment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/initial-assessments", requireAuth, async (req, res) => {
    try {
      const { captchaToken, ...formData } = req.body;
      
      if (captchaToken) {
        const captchaResult = await verifyCaptcha(captchaToken);
        if (!captchaResult.success) {
          return res.status(400).json({ error: "CAPTCHA verification failed" });
        }
      }
      
      const data = insertInitialAssessmentSchema.omit({ captchaToken: true }).parse(formData);
      const assessment = await storage.createInitialAssessment(data);
      res.status(201).json(assessment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/admin/initial-assessments/:id", requireAuth, async (req, res) => {
    try {
      const data = updateInitialAssessmentSchema.parse(req.body);
      const assessment = await storage.updateInitialAssessment(req.params.id, data);
      if (!assessment) {
        return res.status(404).json({ error: "Initial assessment not found" });
      }
      res.json(assessment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/admin/initial-assessments/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteInitialAssessment(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Initial assessment not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/initial-assessments/:id/send-email", requireAuth, async (req, res) => {
    try {
      const assessment = await storage.getInitialAssessment(req.params.id);
      if (!assessment) {
        return res.status(404).json({ error: "Initial assessment not found" });
      }

      const { recipientEmail } = req.body;
      const emailTo = recipientEmail || assessment.email;

      await sendEmail({
        to: emailTo,
        subject: "Initial Assessment & Service Agreement - Private In-Home Caregiver",
        html: `
          <h2>Initial Assessment & Service Agreement</h2>
          <p>Dear ${assessment.responsiblePartyName},</p>
          <p>Thank you for completing the Initial Assessment & Service Agreement for ${assessment.clientFullName}.</p>
          <h3>Service Details:</h3>
          <ul>
            <li><strong>Client:</strong> ${assessment.clientFullName}</li>
            <li><strong>Service Address:</strong> ${assessment.serviceAddress}</li>
            <li><strong>Service Start Date:</strong> ${assessment.serviceSchedule.serviceStartDate}</li>
            <li><strong>Service Days:</strong> ${assessment.serviceSchedule.serviceDays.join(', ')}</li>
            <li><strong>Shift Hours:</strong> ${assessment.serviceSchedule.shiftHours}</li>
            <li><strong>Level of Care:</strong> ${assessment.serviceSchedule.recommendedLevelOfCare}</li>
          </ul>
          <h3>Emergency Contact:</h3>
          <ul>
            <li><strong>Name:</strong> ${assessment.emergencyContact.emergencyContactName}</li>
            <li><strong>Phone:</strong> ${assessment.emergencyContact.emergencyContactPhone}</li>
            <li><strong>Preferred Hospital:</strong> ${assessment.emergencyContact.preferredHospital}</li>
          </ul>
          <p>We will be in touch shortly to confirm your caregiver assignment and schedule.</p>
          <p>If you have any questions, please contact us at info@privateinhomecaregiver.com or call 617-686-0595.</p>
          <p>Sincerely,<br/>Private In-Home Caregiver Team</p>
        `
      });

      await storage.markInitialAssessmentEmailSent(req.params.id);
      res.json({ success: true, message: "Email sent successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== Client Intakes (Admin) =====
  app.get("/api/admin/client-intakes", requireAuth, async (req, res) => {
    try {
      const { status } = req.query;
      const intakes = await storage.listClientIntakes(status as string | undefined);
      res.json(intakes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/client-intakes/:id", requireAuth, async (req, res) => {
    try {
      const intake = await storage.getClientIntake(req.params.id);
      if (!intake) {
        return res.status(404).json({ error: "Client intake not found" });
      }
      res.json(intake);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/client-intakes", requireAuth, async (req, res) => {
    try {
      const { captchaToken, ...formData } = req.body;
      
      if (captchaToken) {
        const captchaResult = await verifyCaptcha(captchaToken);
        if (!captchaResult.success) {
          return res.status(400).json({ error: "CAPTCHA verification failed" });
        }
      }
      
      const data = insertClientIntakeSchema.omit({ captchaToken: true }).parse(formData);
      const intake = await storage.createClientIntake(data);
      res.status(201).json(intake);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/admin/client-intakes/:id", requireAuth, async (req, res) => {
    try {
      const data = updateClientIntakeSchema.parse(req.body);
      const intake = await storage.updateClientIntake(req.params.id, data);
      if (!intake) {
        return res.status(404).json({ error: "Client intake not found" });
      }
      res.json(intake);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/admin/client-intakes/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteClientIntake(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Client intake not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/client-intakes/:id/send-email", requireAuth, async (req, res) => {
    try {
      const intake = await storage.getClientIntake(req.params.id);
      if (!intake) {
        return res.status(404).json({ error: "Client intake not found" });
      }

      const { recipientEmail } = req.body;
      const emailTo = recipientEmail || intake.clientEmail;

      await sendEmail({
        to: emailTo,
        subject: "Client Intake Confirmation - Private In-Home Caregiver",
        html: `
          <h2>Client Intake Confirmation</h2>
          <p>Dear ${intake.clientName},</p>
          <p>Thank you for completing your client intake form with Private In-Home Caregiver.</p>
          <h3>Your Information:</h3>
          <ul>
            <li><strong>Name:</strong> ${intake.clientName}</li>
            <li><strong>Email:</strong> ${intake.clientEmail}</li>
            <li><strong>Phone:</strong> ${intake.clientPhone}</li>
            ${intake.address ? `<li><strong>Address:</strong> ${intake.address}</li>` : ''}
            ${intake.preferredSchedule ? `<li><strong>Preferred Schedule:</strong> ${intake.preferredSchedule}</li>` : ''}
          </ul>
          ${intake.emergencyContactName ? `
          <h3>Emergency Contact:</h3>
          <ul>
            <li><strong>Name:</strong> ${intake.emergencyContactName}</li>
            <li><strong>Phone:</strong> ${intake.emergencyContactPhone}</li>
            <li><strong>Relationship:</strong> ${intake.emergencyContactRelationship}</li>
          </ul>
          ` : ''}
          <p>A member of our team will be in touch with you shortly to discuss your care needs and match you with an appropriate caregiver.</p>
          <p>If you have any questions, please contact us at info@privateinhomecaregiver.com or call 617-686-0595.</p>
          <p>Sincerely,<br/>Private In-Home Caregiver Team</p>
        `
      });

      await storage.markClientIntakeEmailSent(req.params.id);
      res.json({ success: true, message: "Email sent successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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

      // Facility Directory pages
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/facilities</loc>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.9</priority>\n';
      xml += '  </url>\n';

      // Facility type pages
      const facilityTypes = ['nursing-home', 'assisted-living', 'memory-care', 'independent-living', 'continuing-care', 'hospice', 'hospital'];
      facilityTypes.forEach(type => {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/facilities/${type}</loc>\n`;
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += '    <priority>0.8</priority>\n';
        xml += '  </url>\n';
      });

      // Individual Facility pages (all 796+ facilities)
      try {
        const facilities = await storage.listFacilities({ status: 'published' });
        facilities.forEach((facility: any) => {
          xml += '  <url>\n';
          xml += `    <loc>${baseUrl}/facility/${facility.slug}</loc>\n`;
          if (facility.updatedAt) {
            xml += `    <lastmod>${new Date(facility.updatedAt).toISOString()}</lastmod>\n`;
          }
          xml += '    <changefreq>monthly</changefreq>\n';
          xml += '    <priority>0.7</priority>\n';
          xml += '  </url>\n';
        });
      } catch (facilityError) {
        console.warn('Could not add facilities to sitemap:', facilityError);
      }

      // Hospital finder page
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/find-hospital</loc>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';

      // Care options pages
      const careOptions = ['home-care', 'assisted-living', 'nursing-homes', 'memory-care', 'hospice-palliative-care', 'independent-living'];
      careOptions.forEach(option => {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/${option}/massachusetts</loc>\n`;
        xml += '    <changefreq>monthly</changefreq>\n';
        xml += '    <priority>0.8</priority>\n';
        xml += '  </url>\n';
      });

      // Videos and Podcasts pages
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/videos</loc>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';
      
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/podcasts</loc>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';

      // Caregiver Resources page
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/caregiver-resources</loc>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';

      // Aging Resources page
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/aging-resources</loc>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';

      // Quiz pages
      const quizTypes = ['care-needs', 'caregiver-stress', 'daily-living', 'memory', 'fall-risk', 'medication', 'nutrition', 'social', 'financial', 'planning', 'caregiver-readiness', 'home-safety'];
      quizTypes.forEach(quiz => {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/quiz/${quiz}</loc>\n`;
        xml += '    <changefreq>monthly</changefreq>\n';
        xml += '    <priority>0.6</priority>\n';
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
            isActive: "yes",
            galleryImages: [],
            highlights: []
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
  // City FAQs API Routes
  // =============================================

  // Public: Get city FAQs by location slug
  app.get("/api/directory/locations/:slug/faqs", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const faqs = await storage.getCityFaqsBySlug(slug);
      res.json(faqs);
    } catch (error: any) {
      console.error("Error getting city FAQs:", error);
      res.status(500).json({ message: "Failed to get city FAQs" });
    }
  });

  // Admin: Create city FAQ
  app.post("/api/directory/city-faqs", requireAuth, async (req: Request, res: Response) => {
    try {
      const faq = await storage.createCityFaq(req.body);
      res.status(201).json(faq);
    } catch (error: any) {
      console.error("Error creating city FAQ:", error);
      res.status(500).json({ message: "Failed to create city FAQ" });
    }
  });

  // Admin: Update city FAQ
  app.patch("/api/directory/city-faqs/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateCityFaq(id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "FAQ not found" });
      }
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating city FAQ:", error);
      res.status(500).json({ message: "Failed to update city FAQ" });
    }
  });

  // Admin: Delete city FAQ
  app.delete("/api/directory/city-faqs/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCityFaq(id);
      if (!deleted) {
        return res.status(404).json({ message: "FAQ not found" });
      }
      res.json({ message: "FAQ deleted" });
    } catch (error: any) {
      console.error("Error deleting city FAQ:", error);
      res.status(500).json({ message: "Failed to delete city FAQ" });
    }
  });

  // Admin: Enrich location with Google Places data
  app.post("/api/directory/locations/:id/enrich", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const location = await storage.getMaLocation(id);
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }

      const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
      if (!GOOGLE_PLACES_API_KEY) {
        return res.status(500).json({ message: "Google Places API key not configured" });
      }

      // Search for city images from Google Places
      const searchQuery = `${location.name} Massachusetts landmarks scenic`;
      const placesResponse = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
          "X-Goog-FieldMask": "places.id,places.photos,places.displayName",
        },
        body: JSON.stringify({
          textQuery: searchQuery,
          locationBias: {
            rectangle: {
              low: { latitude: 41.2, longitude: -73.5 },
              high: { latitude: 42.9, longitude: -69.9 },
            },
          },
          maxResultCount: 5,
        }),
      });

      if (!placesResponse.ok) {
        const errorText = await placesResponse.text();
        console.error("Google Places API error:", errorText);
        return res.status(500).json({ message: "Failed to fetch from Google Places" });
      }

      const placesData = await placesResponse.json();
      const places = placesData.places || [];
      
      // Extract photo URLs
      const galleryImages: string[] = [];
      for (const place of places) {
        if (place.photos && place.photos.length > 0) {
          for (const photo of place.photos.slice(0, 3)) {
            if (photo.name) {
              const photoUrl = `https://places.googleapis.com/v1/${photo.name}/media?maxWidthPx=1200&key=${GOOGLE_PLACES_API_KEY}`;
              galleryImages.push(photoUrl);
            }
          }
        }
      }

      const heroImageUrl = galleryImages.length > 0 ? galleryImages[0] : null;
      const googlePlaceId = places.length > 0 ? places[0].id : null;

      const enrichedLocation = await storage.enrichLocationWithPlaces(id, {
        heroImageUrl: heroImageUrl || undefined,
        galleryImages,
        googlePlaceId: googlePlaceId || undefined,
      });

      res.json(enrichedLocation);
    } catch (error: any) {
      console.error("Error enriching location:", error);
      res.status(500).json({ message: "Failed to enrich location" });
    }
  });

  // Admin: Seed city FAQs for a location
  app.post("/api/directory/locations/:id/seed-faqs", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const location = await storage.getMaLocation(id);
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }

      // Generate location-specific FAQs
      const faqTemplates = [
        {
          question: `What types of in-home care services are available in ${location.name}, MA?`,
          answer: `PrivateInHomeCareGiver offers comprehensive in-home care services throughout ${location.name}, Massachusetts, including personal care assistance, companion care, homemaking services, dementia and Alzheimer's care, respite care, and post-hospital recovery support. All our caregivers serving ${location.name} are thoroughly vetted, trained, and dedicated to providing compassionate care.`,
          category: "services",
          sortOrder: 0
        },
        {
          question: `How much does private pay home care cost in ${location.name}?`,
          answer: `Our private pay home care services in ${location.name} are competitively priced based on the level of care needed and hours of service. We offer flexible scheduling options from a few hours per week to 24/7 live-in care. Contact us for a free consultation and personalized care assessment to receive an accurate quote for your family's needs.`,
          category: "pricing",
          sortOrder: 1
        },
        {
          question: `Do you provide caregivers who speak languages other than English in ${location.name}?`,
          answer: `Yes! We understand the diverse communities in ${location.name} and ${location.county} County. We strive to match clients with caregivers who speak their preferred language whenever possible, including Spanish, Portuguese, Chinese, and other languages common in Massachusetts.`,
          category: "caregivers",
          sortOrder: 2
        },
        {
          question: `How quickly can you start providing care in ${location.name}?`,
          answer: `We can often begin providing care in ${location.name} within 24-48 hours of completing an initial assessment. For urgent situations, we may be able to arrange same-day care placement. Our team works diligently to match your loved one with the right caregiver as quickly as possible.`,
          category: "availability",
          sortOrder: 3
        },
        {
          question: `Are your caregivers in ${location.name} licensed and insured?`,
          answer: `Absolutely. All PrivateInHomeCareGiver caregivers serving ${location.name} undergo comprehensive background checks, are properly insured, and receive ongoing training. We ensure compliance with all Massachusetts state regulations for home care services.`,
          category: "qualifications",
          sortOrder: 4
        },
        {
          question: `What areas in ${location.county} County do you serve besides ${location.name}?`,
          answer: `In addition to ${location.name}, we provide in-home care services throughout ${location.county} County and neighboring areas. Our coverage extends across most of Massachusetts, ensuring families can receive quality care regardless of their location in the Commonwealth.`,
          category: "coverage",
          sortOrder: 5
        },
        {
          question: `Do you accept Medicare or MassHealth for home care in ${location.name}?`,
          answer: `PrivateInHomeCareGiver is a private pay agency, which means we do not accept Medicare or MassHealth (Medicaid). However, this allows us to offer personalized, flexible care without the restrictions of insurance programs. Long-term care insurance and veterans benefits may help cover the cost of our services.`,
          category: "payment",
          sortOrder: 6
        },
        {
          question: `Can I meet the caregiver before they start working with my family in ${location.name}?`,
          answer: `Yes, we encourage families in ${location.name} to meet potential caregivers before care begins. We arrange an introductory meeting so you can ensure the caregiver is a good fit for your loved one's personality, needs, and preferences.`,
          category: "process",
          sortOrder: 7
        }
      ];

      // Create FAQs for this location
      const createdFaqs = [];
      for (const template of faqTemplates) {
        const faq = await storage.createCityFaq({
          locationId: location.id,
          ...template,
          isActive: "yes"
        });
        createdFaqs.push(faq);
      }

      res.status(201).json({
        message: `Created ${createdFaqs.length} FAQs for ${location.name}`,
        faqs: createdFaqs
      });
    } catch (error: any) {
      console.error("Error seeding city FAQs:", error);
      res.status(500).json({ message: "Failed to seed city FAQs" });
    }
  });

  // Seed endpoint: Enrich ALL locations with Google Places images (no auth for initial run)
  app.post("/api/seed/enrich-locations", async (req: Request, res: Response) => {
    try {
      const skipEnriched = req.query.skipEnriched !== "false";
      const batchSize = parseInt(req.query.batchSize as string) || 5;
      const limit = parseInt(req.query.limit as string) || 100;
      
      const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
      if (!GOOGLE_PLACES_API_KEY) {
        return res.status(500).json({ message: "Google Places API key not configured" });
      }
      
      // Get all locations
      const allLocations = await storage.listMaLocations();
      let locationsToEnrich = allLocations;
      
      if (skipEnriched) {
        locationsToEnrich = allLocations.filter(l => !l.heroImageUrl);
      }
      
      // Limit the number of locations to process
      locationsToEnrich = locationsToEnrich.slice(0, limit);
      
      if (locationsToEnrich.length === 0) {
        return res.json({
          message: "No locations to enrich",
          total: allLocations.length,
          alreadyEnriched: allLocations.filter(l => l.heroImageUrl).length
        });
      }
      
      console.log(`Starting enrichment for ${locationsToEnrich.length} locations...`);
      
      let successful = 0;
      let failed = 0;
      const results: { name: string; success: boolean; error?: string }[] = [];
      
      for (let i = 0; i < locationsToEnrich.length; i++) {
        const location = locationsToEnrich[i];
        try {
          const searchQuery = `${location.name}, Massachusetts, USA`;
          
          const placesResponse = await fetch("https://places.googleapis.com/v1/places:searchText", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
              "X-Goog-FieldMask": "places.id,places.displayName,places.photos"
            },
            body: JSON.stringify({ textQuery: searchQuery, maxResultCount: 1 })
          });
          
          if (!placesResponse.ok) {
            const errorText = await placesResponse.text();
            console.error(`Google Places API error for ${location.name}:`, errorText);
            results.push({ name: location.name, success: false, error: "API error" });
            failed++;
            continue;
          }
          
          const placesData = await placesResponse.json();
          const places = placesData.places || [];
          
          let heroImageUrl: string | undefined;
          let galleryImages: string[] = [];
          
          if (places.length > 0 && places[0].photos && places[0].photos.length > 0) {
            const photos = places[0].photos.slice(0, 5);
            for (const photo of photos) {
              const photoUrl = `https://places.googleapis.com/v1/${photo.name}/media?maxWidthPx=1200&key=${GOOGLE_PLACES_API_KEY}`;
              if (!heroImageUrl) {
                heroImageUrl = photoUrl;
              } else {
                galleryImages.push(photoUrl);
              }
            }
          }
          
          const googlePlaceId = places.length > 0 ? places[0].id : null;
          
          await storage.enrichLocationWithPlaces(location.id, {
            heroImageUrl,
            galleryImages,
            googlePlaceId: googlePlaceId || undefined
          });
          
          console.log(`[${i + 1}/${locationsToEnrich.length}] Enriched: ${location.name} - ${heroImageUrl ? 'Has image' : 'No image'}`);
          results.push({ name: location.name, success: true });
          successful++;
          
          // Rate limiting - wait between requests
          if (i < locationsToEnrich.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        } catch (error: any) {
          console.error(`Error enriching ${location.name}:`, error.message);
          results.push({ name: location.name, success: false, error: error.message });
          failed++;
        }
      }
      
      res.json({
        message: "Location enrichment complete",
        total: locationsToEnrich.length,
        successful,
        failed,
        results
      });
    } catch (error: any) {
      console.error("Error in location enrichment:", error);
      res.status(500).json({ message: "Failed to enrich locations", error: String(error) });
    }
  });

  // Seed endpoint: Seed FAQs for ALL locations (no auth for initial run)
  app.post("/api/seed/location-faqs", async (req: Request, res: Response) => {
    try {
      const skipExisting = req.query.skipExisting !== "false";
      
      // Get all locations
      const allLocations = await storage.listMaLocations();
      
      let locationsToSeed = allLocations;
      
      if (skipExisting) {
        // Check which locations already have FAQs
        const locationsWithFaqs: string[] = [];
        for (const loc of allLocations) {
          const faqs = await storage.listCityFaqs(loc.id);
          if (faqs.length > 0) {
            locationsWithFaqs.push(loc.id);
          }
        }
        locationsToSeed = allLocations.filter(l => !locationsWithFaqs.includes(l.id));
      }
      
      if (locationsToSeed.length === 0) {
        return res.json({
          message: "No locations to seed FAQs for",
          total: allLocations.length,
          alreadyHaveFaqs: allLocations.length - locationsToSeed.length
        });
      }
      
      console.log(`Seeding FAQs for ${locationsToSeed.length} locations...`);
      
      let successful = 0;
      let totalFaqs = 0;
      
      for (const location of locationsToSeed) {
        const faqTemplates = [
          {
            question: `What types of senior care services are available in ${location.name}, MA?`,
            answer: `PrivateInHomeCareGiver offers comprehensive private pay senior care services throughout ${location.name}, Massachusetts, including personal care assistance, companion care, homemaking services, dementia and Alzheimer's care, respite care, and post-hospital recovery support. All our caregivers serving ${location.name} seniors are thoroughly vetted, trained, and dedicated to providing compassionate care.`,
            category: "services",
            sortOrder: 0
          },
          {
            question: `How much does private pay senior home care cost in ${location.name}?`,
            answer: `Our private pay senior home care services in ${location.name} are competitively priced based on the level of care needed and hours of service. We offer flexible scheduling options from a few hours per week to 24/7 live-in care. Contact us for a free consultation and personalized care assessment to receive an accurate quote for your senior family member's needs.`,
            category: "pricing",
            sortOrder: 1
          },
          {
            question: `Do you provide caregivers who speak languages other than English in ${location.name}?`,
            answer: `Yes! We understand the diverse senior communities in ${location.name} and ${location.county} County. We strive to match elderly clients with caregivers who speak their preferred language whenever possible, including Spanish, Portuguese, Chinese, and other languages common in Massachusetts.`,
            category: "caregivers",
            sortOrder: 2
          },
          {
            question: `How quickly can you start providing senior care in ${location.name}?`,
            answer: `We can often begin providing senior care in ${location.name} within 24-48 hours of completing an initial assessment. For urgent situations, we may be able to arrange same-day care placement. Our team works diligently to match your elderly loved one with the right caregiver as quickly as possible.`,
            category: "availability",
            sortOrder: 3
          },
          {
            question: `Are your senior caregivers in ${location.name} licensed and insured?`,
            answer: `Absolutely. All PrivateInHomeCareGiver caregivers serving seniors in ${location.name} undergo comprehensive background checks, are properly insured, and receive ongoing training. We ensure compliance with all Massachusetts state regulations for home care services.`,
            category: "qualifications",
            sortOrder: 4
          },
          {
            question: `What areas in ${location.county} County do you serve besides ${location.name}?`,
            answer: `In addition to ${location.name}, we provide senior in-home care services throughout ${location.county} County and neighboring areas. Our coverage extends across most of Massachusetts, ensuring senior families can receive quality care regardless of their location in the Commonwealth.`,
            category: "coverage",
            sortOrder: 5
          },
          {
            question: `Do you accept Medicare or MassHealth for senior care in ${location.name}?`,
            answer: `PrivateInHomeCareGiver is exclusively a private pay senior care agency, which means we do not accept Medicare or MassHealth (Medicaid). However, this allows us to offer personalized, flexible care for seniors without the restrictions of government insurance programs. Long-term care insurance and veterans benefits (VA Aid & Attendance) may help cover the cost of our services.`,
            category: "payment",
            sortOrder: 6
          },
          {
            question: `Can I meet the caregiver before they start working with my senior family member in ${location.name}?`,
            answer: `Yes, we encourage families in ${location.name} to meet potential caregivers before care begins. We arrange an introductory meeting so you can ensure the caregiver is a good fit for your elderly loved one's personality, needs, and preferences.`,
            category: "process",
            sortOrder: 7
          }
        ];
        
        for (const template of faqTemplates) {
          await storage.createCityFaq({
            locationId: location.id,
            ...template,
            isActive: "yes"
          });
          totalFaqs++;
        }
        
        successful++;
        console.log(`Seeded FAQs for ${location.name} (${successful}/${locationsToSeed.length})`);
      }
      
      res.json({
        message: "FAQ seeding complete",
        locationsSeeded: successful,
        totalFaqsCreated: totalFaqs
      });
    } catch (error: any) {
      console.error("Error seeding location FAQs:", error);
      res.status(500).json({ message: "Failed to seed location FAQs", error: String(error) });
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

  // Admin: Generate AI metadata for video
  app.post("/api/admin/videos/:id/generate-metadata", requireAuth, async (req: Request, res: Response) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      const prompt = `You are an SEO/GEO expert for a Massachusetts in-home care company called PrivateInHomeCareGiver. 
Generate optimized metadata for a video with the following details:

Title: ${video.title}
Current Description: ${video.description || 'No description'}
Category: ${video.category}
Duration: ${video.duration ? `${Math.floor(video.duration / 60)} minutes` : 'Unknown'}

Generate the following fields in JSON format:
{
  "metaTitle": "SEO-optimized title (max 60 chars)",
  "metaDescription": "SEO-optimized description (max 160 chars)",
  "keywords": ["array", "of", "relevant", "keywords"],
  "topics": ["main", "topics", "covered"],
  "learningObjectives": ["what viewers will learn"],
  "targetAudience": "who this video is for",
  "schemaMarkup": {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": "video title",
    "description": "video description",
    "thumbnailUrl": "${video.thumbnailUrl || ''}",
    "uploadDate": "${video.createdAt}",
    "duration": "PT${video.duration ? Math.floor(video.duration / 60) : 0}M",
    "contentUrl": "${video.videoUrl || video.embedUrl || ''}",
    "publisher": {
      "@type": "Organization",
      "name": "PrivateInHomeCareGiver",
      "logo": {
        "@type": "ImageObject",
        "url": "https://privateinhomecaregiver.com/logo.png"
      }
    }
  }
}

Focus on Massachusetts senior care, in-home care, caregiving, and healthcare topics.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an SEO/GEO expert. Output valid JSON only." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      const metadata = JSON.parse(response.choices[0]?.message?.content || "{}");
      res.json(metadata);
    } catch (error: any) {
      console.error("AI metadata generation error:", error);
      res.status(500).json({ message: "Failed to generate metadata", error: error.message });
    }
  });

  // Admin: Generate AI metadata for podcast
  app.post("/api/admin/podcasts/:id/generate-metadata", requireAuth, async (req: Request, res: Response) => {
    try {
      const podcast = await storage.getPodcast(req.params.id);
      if (!podcast) {
        return res.status(404).json({ message: "Podcast not found" });
      }

      const prompt = `You are an SEO/GEO expert for a Massachusetts in-home care company called PrivateInHomeCareGiver.
Generate optimized metadata for a podcast episode with the following details:

Title: ${podcast.title}
Current Description: ${podcast.description || 'No description'}
Category: ${podcast.category}
Duration: ${podcast.duration ? `${Math.floor(podcast.duration / 60)} minutes` : 'Unknown'}
Episode Number: ${podcast.episodeNumber || 'N/A'}

Generate the following fields in JSON format:
{
  "metaTitle": "SEO-optimized title (max 60 chars)",
  "metaDescription": "SEO-optimized description (max 160 chars)",
  "keywords": ["array", "of", "relevant", "keywords"],
  "topics": ["main", "topics", "covered"],
  "learningObjectives": ["what listeners will learn"],
  "targetAudience": "who this podcast is for",
  "schemaMarkup": {
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    "name": "episode title",
    "description": "episode description",
    "datePublished": "${podcast.createdAt}",
    "duration": "PT${podcast.duration ? Math.floor(podcast.duration / 60) : 0}M",
    "url": "${podcast.audioUrl || podcast.embedUrl || ''}",
    "partOfSeries": {
      "@type": "PodcastSeries",
      "name": "PrivateInHomeCareGiver Podcast",
      "url": "https://privateinhomecaregiver.com/podcasts"
    }
  }
}

Focus on Massachusetts senior care, in-home care, caregiving, and healthcare topics.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an SEO/GEO expert. Output valid JSON only." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      const metadata = JSON.parse(response.choices[0]?.message?.content || "{}");
      res.json(metadata);
    } catch (error: any) {
      console.error("AI metadata generation error:", error);
      res.status(500).json({ message: "Failed to generate metadata", error: error.message });
    }
  });

  // Admin: Generate AI thumbnail for video
  app.post("/api/admin/videos/:id/generate-thumbnail", requireAuth, async (req: Request, res: Response) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      const prompt = `Professional healthcare thumbnail image for a video about "${video.title}". 
Style: Clean, modern, warm colors, professional healthcare setting. 
Theme: Massachusetts in-home senior care, caregiving, family support.
Category: ${video.category}.
Requirements: No text, photorealistic, welcoming, trustworthy, 16:9 aspect ratio.`;

      const response = await openai.images.generate({
        model: "gpt-image-1",
        prompt,
        n: 1,
        size: "1024x1024",
      });

      const imageData = response.data?.[0];
      if (!imageData?.b64_json) {
        throw new Error("No image generated");
      }

      // Save image to public folder
      const fileName = `video-thumb-${video.id}-${Date.now()}.png`;
      const filePath = path.join(process.cwd(), "public", "thumbnails", fileName);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, Buffer.from(imageData.b64_json, "base64"));

      const thumbnailUrl = `/thumbnails/${fileName}`;
      
      // Update video with new thumbnail
      await storage.updateVideo(req.params.id, { thumbnailUrl });

      res.json({ thumbnailUrl, message: "Thumbnail generated successfully" });
    } catch (error: any) {
      console.error("AI thumbnail generation error:", error);
      res.status(500).json({ message: "Failed to generate thumbnail", error: error.message });
    }
  });

  // Admin: Extract thumbnail from video file using ffmpeg
  app.post("/api/admin/videos/:id/extract-thumbnail", requireAuth, async (req: Request, res: Response) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      if (!video.videoUrl) {
        return res.status(400).json({ message: "Video URL is required to extract thumbnail" });
      }

      // Handle different video storage paths
      let videoPath: string;
      if (video.videoUrl.startsWith('/uploads/')) {
        videoPath = path.join(process.cwd(), 'public', video.videoUrl);
      } else if (video.videoUrl.startsWith('/videos/')) {
        videoPath = path.join(process.cwd(), 'public', video.videoUrl);
      } else if (video.videoUrl.startsWith('http')) {
        return res.status(400).json({ message: "Cannot extract thumbnail from external URLs. Use AI thumbnail generation instead." });
      } else {
        videoPath = path.join(process.cwd(), 'public', video.videoUrl);
      }
      
      // Check if video file exists
      try {
        await fs.access(videoPath);
      } catch {
        return res.status(404).json({ message: "Video file not found on disk" });
      }

      // Create thumbnails directory if it doesn't exist
      const thumbnailDir = path.join(process.cwd(), 'public', 'thumbnails');
      await fs.mkdir(thumbnailDir, { recursive: true });

      const fileName = `video-snapshot-${video.id}-${Date.now()}.jpg`;
      const thumbnailPath = path.join(thumbnailDir, fileName);

      // Validate timestamp format strictly (HH:MM:SS format only)
      const timestampPattern = /^\d{2}:\d{2}:\d{2}$/;
      const rawTimestamp = req.body.timestamp || '00:00:05';
      
      if (!timestampPattern.test(rawTimestamp)) {
        return res.status(400).json({ message: "Invalid timestamp format. Use HH:MM:SS format." });
      }

      // Use spawn instead of exec to prevent command injection
      const { spawn } = await import('child_process');
      
      const runFfmpeg = (ts: string): Promise<void> => {
        return new Promise((resolve, reject) => {
          const ffmpegProcess = spawn('ffmpeg', [
            '-i', videoPath,
            '-ss', ts,
            '-vframes', '1',
            '-q:v', '2',
            thumbnailPath,
            '-y'
          ]);
          
          ffmpegProcess.on('close', (code) => {
            if (code === 0) {
              resolve();
            } else {
              reject(new Error(`ffmpeg exited with code ${code}`));
            }
          });
          
          ffmpegProcess.on('error', (err) => {
            reject(err);
          });
        });
      };

      try {
        await runFfmpeg(rawTimestamp);
      } catch (ffmpegError: any) {
        // If timestamp is past video length, try extracting from 1 second
        await runFfmpeg('00:00:01');
      }

      const thumbnailUrl = `/thumbnails/${fileName}`;
      
      // Update video with new thumbnail
      await storage.updateVideo(req.params.id, { thumbnailUrl });

      res.json({ thumbnailUrl, message: "Thumbnail extracted from video successfully" });
    } catch (error: any) {
      console.error("Video thumbnail extraction error:", error);
      res.status(500).json({ message: "Failed to extract thumbnail", error: error.message });
    }
  });

  // Admin: Fetch YouTube video metadata (duration and thumbnail)
  app.post("/api/admin/videos/:id/fetch-youtube-metadata", requireAuth, async (req: Request, res: Response) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      // Get YouTube URL from embedUrl or videoUrl
      const youtubeUrl = video.embedUrl || video.videoUrl;
      if (!youtubeUrl) {
        return res.status(400).json({ message: "No video URL found" });
      }

      const details = await fetchYouTubeVideoDetails(youtubeUrl);
      if (!details) {
        return res.status(400).json({ message: "Could not fetch YouTube video details. Make sure the URL is a valid YouTube video." });
      }

      // Update the video with correct duration and thumbnail
      await storage.updateVideo(req.params.id, {
        duration: details.duration,
        thumbnailUrl: details.thumbnailUrl,
      });

      res.json({
        duration: details.duration,
        formattedDuration: formatDuration(details.duration),
        thumbnailUrl: details.thumbnailUrl,
        title: details.title,
        message: "YouTube metadata fetched successfully"
      });
    } catch (error: any) {
      console.error("YouTube metadata fetch error:", error);
      res.status(500).json({ message: "Failed to fetch YouTube metadata", error: error.message });
    }
  });

  // Public: Fetch YouTube metadata for any URL (used by admin form)
  app.post("/api/youtube/metadata", requireAuth, async (req: Request, res: Response) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }

      const details = await fetchYouTubeVideoDetails(url);
      if (!details) {
        return res.status(400).json({ message: "Could not fetch YouTube video details" });
      }

      res.json({
        duration: details.duration,
        formattedDuration: formatDuration(details.duration),
        thumbnailUrl: details.thumbnailUrl,
        title: details.title,
        description: details.description,
      });
    } catch (error: any) {
      console.error("YouTube metadata fetch error:", error);
      res.status(500).json({ message: "Failed to fetch YouTube metadata", error: error.message });
    }
  });

  // Admin: Generate AI thumbnail for podcast
  app.post("/api/admin/podcasts/:id/generate-thumbnail", requireAuth, async (req: Request, res: Response) => {
    try {
      const podcast = await storage.getPodcast(req.params.id);
      if (!podcast) {
        return res.status(404).json({ message: "Podcast not found" });
      }

      const prompt = `Professional podcast cover art for an episode about "${podcast.title}". 
Style: Modern, warm colors, clean design, podcast-style artwork.
Theme: Massachusetts in-home senior care, caregiving, family support.
Category: ${podcast.category}.
Requirements: No text, podcast cover style, square format, professional, welcoming.`;

      const response = await openai.images.generate({
        model: "gpt-image-1",
        prompt,
        n: 1,
        size: "1024x1024",
      });

      const imageData = response.data?.[0];
      if (!imageData?.b64_json) {
        throw new Error("No image generated");
      }

      // Save image to public folder
      const fileName = `podcast-thumb-${podcast.id}-${Date.now()}.png`;
      const filePath = path.join(process.cwd(), "public", "thumbnails", fileName);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, Buffer.from(imageData.b64_json, "base64"));

      const thumbnailUrl = `/thumbnails/${fileName}`;
      
      // Update podcast with new thumbnail
      await storage.updatePodcast(req.params.id, { thumbnailUrl });

      res.json({ thumbnailUrl, message: "Thumbnail generated successfully" });
    } catch (error: any) {
      console.error("AI thumbnail generation error:", error);
      res.status(500).json({ message: "Failed to generate thumbnail", error: error.message });
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

  // Test endpoint: Enrich a single facility with Google Places photos
  app.post("/api/test/enrich-facility/:id", async (req: Request, res: Response) => {
    try {
      const facility = await storage.getFacility(req.params.id);
      if (!facility) {
        return res.status(404).json({ message: "Facility not found" });
      }
      
      // Pass full facility object to enrichFacility
      const result = await enrichFacility(facility);
      if (!result || !result.success) {
        return res.json({ 
          success: false, 
          error: result?.error || "Failed to enrich facility",
          facility: facility
        });
      }
      
      // Update facility with enriched data including photos
      const updateData: any = {
        lastEnrichedAt: new Date()
      };
      
      if (result.data) {
        if (result.data.heroImageUrl) {
          updateData.heroImageUrl = result.data.heroImageUrl;
        }
        if (result.data.galleryImages && result.data.galleryImages.length > 0) {
          updateData.galleryImages = result.data.galleryImages;
        }
        if (result.data.address) updateData.address = result.data.address;
        if (result.data.phone) updateData.phone = result.data.phone;
        if (result.data.website) updateData.website = result.data.website;
        if (result.data.rating) updateData.overallRating = result.data.rating;
        if (result.data.reviewCount) updateData.reviewCount = result.data.reviewCount;
        if (result.data.googleMapsUrl) updateData.googleMapsUrl = result.data.googleMapsUrl;
        if (result.data.businessStatus) updateData.businessStatus = result.data.businessStatus;
        updateData.isClosed = result.data.isClosed;
      }
      
      const updated = await storage.updateFacility(facility.id, updateData);
      res.json({ 
        success: true, 
        facility: updated,
        enrichmentResult: result 
      });
    } catch (error) {
      console.error("Error enriching facility:", error);
      res.status(500).json({ message: "Failed to enrich facility" });
    }
  });

  // Bulk enrich all facilities with Google Places photos (parallel processing)
  app.post("/api/test/enrich-all-facilities", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 796;
      const batchSize = parseInt(req.query.batchSize as string) || 10;
      
      // Get all facilities (will search Google Places for each)
      const allFacilities = await storage.listFacilities();
      const facilitiesToEnrich = allFacilities
        .filter(f => !f.heroImageUrl) // Only enrich those without hero image
        .slice(0, limit);
      
      console.log(`Enriching ${facilitiesToEnrich.length} facilities in batches of ${batchSize}...`);
      
      let enriched = 0;
      let failed = 0;
      const results: any[] = [];
      
      // Process in parallel batches
      for (let i = 0; i < facilitiesToEnrich.length; i += batchSize) {
        const batch = facilitiesToEnrich.slice(i, i + batchSize);
        console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(facilitiesToEnrich.length/batchSize)}...`);
        
        const batchResults = await Promise.all(
          batch.map(async (facility) => {
            try {
              const result = await enrichFacility(facility);
              if (result.success && result.data) {
                const updateData: any = { lastEnrichedAt: new Date() };
                if (result.data.heroImageUrl) updateData.heroImageUrl = result.data.heroImageUrl;
                if (result.data.galleryImages && result.data.galleryImages.length > 0) {
                  updateData.galleryImages = result.data.galleryImages;
                }
                if (result.data.address) updateData.address = result.data.address;
                if (result.data.phone) updateData.phone = result.data.phone;
                if (result.data.rating) updateData.overallRating = result.data.rating;
                if (result.data.reviewCount) updateData.reviewCount = result.data.reviewCount;
                if (result.data.googlePlaceId) updateData.googlePlaceId = result.data.googlePlaceId;
                if (result.data.googleMapsUrl) updateData.googleMapsUrl = result.data.googleMapsUrl;
                if (result.data.businessStatus) updateData.businessStatus = result.data.businessStatus;
                updateData.isClosed = result.data.isClosed;
                
                await storage.updateFacility(facility.id, updateData);
                enriched++;
                return { 
                  id: facility.id, 
                  name: facility.name, 
                  success: true, 
                  hasPhoto: !!result.data.heroImageUrl,
                  photoUrl: result.data.heroImageUrl?.substring(0, 100)
                };
              }
              return { id: facility.id, name: facility.name, success: false, error: result.error };
            } catch (err) {
              failed++;
              return { id: facility.id, name: facility.name, success: false, error: String(err) };
            }
          })
        );
        results.push(...batchResults);
        
        // Small delay between batches to avoid rate limiting
        if (i + batchSize < facilitiesToEnrich.length) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      res.json({
        total: facilitiesToEnrich.length,
        enriched,
        failed,
        results: results.slice(0, 50) // Return first 50 results
      });
    } catch (error) {
      console.error("Error in bulk enrichment:", error);
      res.status(500).json({ message: "Failed to enrich facilities" });
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

  // Public: Get facility FAQs by slug
  app.get("/api/facilities/:slug/faqs", async (req: Request, res: Response) => {
    try {
      const facility = await storage.getFacilityBySlug(req.params.slug);
      if (!facility || facility.status !== "published") {
        return res.status(404).json({ message: "Facility not found" });
      }
      const faqs = await storage.listFacilityFaqs(facility.id);
      res.json(faqs);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      res.status(500).json({ message: "Failed to fetch FAQs" });
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

  // Admin: List FAQs for a facility
  app.get("/api/admin/facilities/:id/faqs", requireAuth, async (req: Request, res: Response) => {
    try {
      const faqs = await storage.listFacilityFaqs(req.params.id);
      res.json(faqs);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      res.status(500).json({ message: "Failed to fetch FAQs" });
    }
  });

  // Admin: Create FAQ for a facility
  app.post("/api/admin/facilities/:id/faqs", requireAuth, async (req: Request, res: Response) => {
    try {
      const parsed = insertFacilityFaqSchema.safeParse({
        facilityId: req.params.id,
        ...req.body,
      });
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid FAQ data", errors: parsed.error.errors });
      }
      const faq = await storage.createFacilityFaq(parsed.data);
      res.status(201).json(faq);
    } catch (error) {
      console.error("Error creating FAQ:", error);
      res.status(500).json({ message: "Failed to create FAQ" });
    }
  });

  // Admin: Update FAQ
  app.patch("/api/admin/facility-faqs/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const parsed = updateFacilityFaqSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid FAQ data", errors: parsed.error.errors });
      }
      const faq = await storage.updateFacilityFaq(req.params.id, parsed.data);
      if (!faq) {
        return res.status(404).json({ message: "FAQ not found" });
      }
      res.json(faq);
    } catch (error) {
      console.error("Error updating FAQ:", error);
      res.status(500).json({ message: "Failed to update FAQ" });
    }
  });

  // Admin: Delete FAQ
  app.delete("/api/admin/facility-faqs/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteFacilityFaq(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "FAQ not found" });
      }
      res.json({ message: "FAQ deleted" });
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      res.status(500).json({ message: "Failed to delete FAQ" });
    }
  });

  // Admin: Enrich single facility with Google Places data
  app.post("/api/admin/facilities/:id/enrich", requireAuth, async (req: Request, res: Response) => {
    try {
      const facility = await storage.getFacility(req.params.id);
      if (!facility) {
        return res.status(404).json({ message: "Facility not found" });
      }
      
      const result = await enrichFacility(facility);
      
      if (result.success && result.data) {
        // Smart change detection using hash
        const newHash = createDataHash({
          address: result.data.address,
          phone: result.data.phone,
          rating: result.data.rating,
        });
        
        const existingHash = facility.dataHash;
        const dataChanged = existingHash !== newHash;
        
        const updated = await storage.updateFacility(facility.id, {
          address: result.data.address || facility.address,
          phone: result.data.phone || facility.phone,
          website: result.data.website || facility.website,
          overallRating: result.data.rating || facility.overallRating,
          googleMapsUrl: result.data.googleMapsUrl,
          googlePlaceId: result.data.googlePlaceId,
          businessStatus: result.data.businessStatus,
          isClosed: result.data.isClosed,
          heroImageUrl: result.data.heroImageUrl || facility.heroImageUrl,
          galleryImages: result.data.galleryImages.length > 0 ? result.data.galleryImages : (facility.galleryImages || undefined),
          lastEnrichedAt: new Date(),
          dataHash: newHash,
          needsRegeneration: dataChanged ? "yes" : facility.needsRegeneration,
        });
        res.json({ 
          success: true, 
          dataChanged,
          facility: updated, 
          enrichment: result, 
          reviewCount: result.data.reviewCount,
          hasPhoto: !!result.data.heroImageUrl
        });
      } else {
        res.json({ success: false, error: result.error, facility });
      }
    } catch (error) {
      console.error("Error enriching facility:", error);
      res.status(500).json({ message: "Failed to enrich facility" });
    }
  });
  
  // Admin: Get facility data statistics (stale data reporting)
  app.get("/api/admin/facilities/stats", requireAuth, async (req: Request, res: Response) => {
    try {
      const facilities = await storage.listFacilities({});
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      
      const stats = {
        total: facilities.length,
        enriched: facilities.filter(f => f.googlePlaceId).length,
        notEnriched: facilities.filter(f => !f.googlePlaceId).length,
        withPhone: facilities.filter(f => f.phone).length,
        withRating: facilities.filter(f => f.overallRating).length,
        needsRegeneration: facilities.filter(f => f.needsRegeneration === "yes").length,
        closed: facilities.filter(f => f.isClosed === "yes").length,
        staleData: {
          over30Days: facilities.filter(f => f.lastEnrichedAt && new Date(f.lastEnrichedAt) < thirtyDaysAgo).length,
          over90Days: facilities.filter(f => f.lastEnrichedAt && new Date(f.lastEnrichedAt) < ninetyDaysAgo).length,
          neverEnriched: facilities.filter(f => !f.lastEnrichedAt && !f.googlePlaceId).length,
        },
        byType: {} as Record<string, number>,
        byCounty: {} as Record<string, number>,
      };
      
      // Count by facility type
      facilities.forEach(f => {
        stats.byType[f.facilityType] = (stats.byType[f.facilityType] || 0) + 1;
      });
      
      // Count by county
      facilities.forEach(f => {
        if (f.county) {
          stats.byCounty[f.county] = (stats.byCounty[f.county] || 0) + 1;
        }
      });
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching facility stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });
  
  // Admin: Get facilities needing regeneration
  app.get("/api/admin/facilities/needs-regeneration", requireAuth, async (req: Request, res: Response) => {
    try {
      const facilities = await storage.listFacilities({});
      const needsRegen = facilities.filter(f => f.needsRegeneration === "yes");
      res.json(needsRegen);
    } catch (error) {
      console.error("Error fetching facilities needing regeneration:", error);
      res.status(500).json({ message: "Failed to fetch facilities" });
    }
  });
  
  // Admin: Mark facility regeneration complete
  app.post("/api/admin/facilities/:id/mark-regenerated", requireAuth, async (req: Request, res: Response) => {
    try {
      const facility = await storage.updateFacility(req.params.id, {
        needsRegeneration: "no",
      });
      if (!facility) {
        return res.status(404).json({ message: "Facility not found" });
      }
      res.json(facility);
    } catch (error) {
      console.error("Error marking facility regenerated:", error);
      res.status(500).json({ message: "Failed to update facility" });
    }
  });

  // Admin: Enrich all facilities with Google Places data (batch)
  app.post("/api/admin/facilities/enrich-all", requireAuth, async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const skipEnriched = req.query.skipEnriched !== "false";
      
      let facilities = await storage.listFacilities({});
      
      if (skipEnriched) {
        facilities = facilities.filter(f => !f.googlePlaceId);
      }
      
      facilities = facilities.slice(0, limit);
      
      if (facilities.length === 0) {
        return res.json({ 
          message: "No facilities to enrich", 
          total: 0,
          successful: 0,
          failed: 0 
        });
      }
      
      console.log(`Starting enrichment for ${facilities.length} facilities...`);
      
      const results: EnrichmentResult[] = [];
      let successful = 0;
      let failed = 0;
      
      for (const facility of facilities) {
        const result = await enrichFacility(facility);
        results.push(result);
        
        if (result.success && result.data) {
          try {
            await storage.updateFacility(facility.id, {
              address: result.data.address || facility.address,
              phone: result.data.phone || facility.phone,
              website: result.data.website || facility.website,
              overallRating: result.data.rating || facility.overallRating,
              googleMapsUrl: result.data.googleMapsUrl,
              googlePlaceId: result.data.googlePlaceId,
            });
            successful++;
            console.log(`[${successful + failed}/${facilities.length}] Enriched: ${facility.name}`);
          } catch (updateError) {
            console.error(`Failed to update facility ${facility.name}:`, updateError);
            failed++;
          }
        } else {
          failed++;
          console.log(`[${successful + failed}/${facilities.length}] Failed: ${facility.name} - ${result.error}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      res.json({
        message: `Enrichment complete`,
        total: facilities.length,
        successful,
        failed,
        results: results.slice(0, 10),
      });
    } catch (error) {
      console.error("Error in batch enrichment:", error);
      res.status(500).json({ message: "Failed to enrich facilities" });
    }
  });

  // Seed endpoint to enrich facilities with Google Places data (no auth for initial run)
  app.post("/api/seed/enrich-facilities", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 25;
      const skipEnriched = req.query.skipEnriched !== "false";
      
      let facilities = await storage.listFacilities({});
      
      if (skipEnriched) {
        facilities = facilities.filter(f => !f.googlePlaceId);
      }
      
      const totalRemaining = facilities.length;
      facilities = facilities.slice(0, limit);
      
      if (facilities.length === 0) {
        return res.json({ 
          message: "No facilities to enrich", 
          total: 0,
          remaining: 0,
          successful: 0,
          failed: 0 
        });
      }
      
      console.log(`Starting enrichment for ${facilities.length} facilities (${totalRemaining} remaining)...`);
      
      let successful = 0;
      let failed = 0;
      let unchanged = 0;
      const errors: string[] = [];
      
      for (const facility of facilities) {
        const result = await enrichFacility(facility);
        
        if (result.success && result.data) {
          try {
            // Smart change detection using hash
            const newHash = createDataHash({
              address: result.data.address,
              phone: result.data.phone,
              rating: result.data.rating,
            });
            
            const existingHash = facility.dataHash;
            const dataChanged = existingHash !== newHash;
            
            if (!dataChanged && facility.googlePlaceId) {
              // Data unchanged - just update lastEnrichedAt timestamp
              await storage.updateFacility(facility.id, {
                lastEnrichedAt: new Date(),
              });
              unchanged++;
              console.log(`[${successful + failed + unchanged}/${facilities.length}] ✅ No changes for ${facility.name}. Skipping update.`);
            } else {
              // Data changed or first enrichment - update all fields and mark for regeneration
              await storage.updateFacility(facility.id, {
                address: result.data.address || facility.address,
                phone: result.data.phone || facility.phone,
                website: result.data.website || facility.website,
                overallRating: result.data.rating || facility.overallRating,
                googleMapsUrl: result.data.googleMapsUrl,
                googlePlaceId: result.data.googlePlaceId,
                businessStatus: result.data.businessStatus,
                isClosed: result.data.isClosed,
                heroImageUrl: result.data.heroImageUrl || facility.heroImageUrl,
                galleryImages: result.data.galleryImages.length > 0 ? result.data.galleryImages : (facility.galleryImages || undefined),
                lastEnrichedAt: new Date(),
                dataHash: newHash,
                needsRegeneration: dataChanged ? "yes" : "no",
              });
              successful++;
              const closedFlag = result.data.isClosed === "yes" ? " [CLOSED]" : "";
              const changeFlag = dataChanged ? "🔄 Data changed." : "";
              const photoFlag = result.data.heroImageUrl ? "📷" : "";
              console.log(`[${successful + failed + unchanged}/${facilities.length}] ${changeFlag}${photoFlag} Enriched: ${facility.name} - Phone: ${result.data.phone || 'N/A'}${closedFlag}`);
            }
          } catch (updateError) {
            console.error(`Failed to update facility ${facility.name}:`, updateError);
            failed++;
            errors.push(`Update error for ${facility.name}`);
          }
        } else {
          failed++;
          errors.push(`${facility.name}: ${result.error}`);
          console.log(`[${successful + failed + unchanged}/${facilities.length}] Failed: ${facility.name} - ${result.error}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      res.json({
        message: `Enrichment complete`,
        processed: facilities.length,
        remaining: totalRemaining - facilities.length,
        successful,
        unchanged,
        failed,
        errors: errors.slice(0, 10),
      });
    } catch (error) {
      console.error("Error in batch enrichment:", error);
      res.status(500).json({ message: "Failed to enrich facilities", error: String(error) });
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
        facilityType: f.type as "nursing-home" | "assisted-living" | "memory-care" | "independent-living" | "continuing-care" | "hospice",
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
        specializations: f.specializations || [],
        totalBeds: f.capacity,
        yearEstablished: f.yearEstablished,
        licenseNumber: f.licenseNumber,
        overallRating: f.overallRating?.toString(),
        staffRating: f.staffRating?.toString(),
        facilityRating: f.facilityRating?.toString(),
        careRating: f.careRating?.toString(),
        priceMin: f.priceRangeMin,
        priceMax: f.priceRangeMax,
        acceptsMedicare: (f.acceptsMedicare ? "yes" : "no") as "yes" | "no" | "unknown",
        acceptsMedicaid: (f.acceptsMedicaid ? "yes" : "no") as "yes" | "no" | "unknown",
        acceptsPrivatePay: f.acceptsPrivatePay ? "yes" : "no",
        acceptsLongTermInsurance: f.acceptsLongTermInsurance ? "yes" : "no",
        status: f.status,
        featured: "no",
        keywords: [] as string[],
        certifications: [] as string[],
        galleryImages: [] as string[],
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

  // Seed endpoint for Massachusetts hospitals
  app.post("/api/seed/hospitals", async (req: Request, res: Response) => {
    try {
      const force = req.query.force === "true";
      const existing = await storage.listFacilities({ facilityType: "hospital" });
      
      if (existing.length > 0 && !force) {
        return res.json({ message: `${existing.length} hospitals already seeded. Use ?force=true to reseed.` });
      }

      // Delete existing hospitals if force mode
      if (force && existing.length > 0) {
        for (const hospital of existing) {
          await storage.deleteFacility(hospital.id);
        }
      }

      // Map hospital data to facility format
      const hospitalsForStorage = hospitalSeedData.map((h) => ({
        name: h.name,
        slug: h.slug,
        facilityType: h.facilityType as "hospital",
        address: h.address,
        city: h.city,
        state: h.state,
        zipCode: h.zipCode,
        county: h.county,
        phone: h.phone,
        website: h.website,
        description: h.description,
        shortDescription: h.shortDescription,
        services: h.services || [],
        amenities: h.amenities || [],
        specializations: h.specializations || [],
        totalBeds: h.totalBeds,
        overallRating: h.overallRating?.toString(),
        status: h.status || "published",
        featured: "no",
        sortOrder: h.sortOrder,
        keywords: [] as string[],
        certifications: [] as string[],
        galleryImages: [] as string[],
        acceptsMedicare: "yes" as const,
        acceptsMedicaid: "yes" as const,
      }));

      const created = [];
      for (const hospitalData of hospitalsForStorage) {
        const hospital = await storage.createFacility(hospitalData);
        created.push(hospital);
      }

      res.json({ 
        message: `Successfully seeded ${created.length} Massachusetts hospitals`,
        count: created.length 
      });
    } catch (error) {
      console.error("Error seeding hospitals:", error);
      res.status(500).json({ message: "Failed to seed hospitals" });
    }
  });

  // Seed endpoint for facility FAQs - generates personalized FAQs using actual facility data
  app.post("/api/seed/facility-faqs", async (req: Request, res: Response) => {
    try {
      const force = req.query.force === "true";
      const facilities = await storage.listFacilities({ status: "published" });
      
      // If force mode, delete all existing FAQs first
      if (force) {
        for (const facility of facilities) {
          const existingFaqs = await storage.listFacilityFaqs(facility.id);
          for (const faq of existingFaqs) {
            await storage.deleteFacilityFaq(faq.id);
          }
        }
      }
      
      // Helper function to generate personalized FAQs based on actual facility data
      const generatePersonalizedFaqs = (facility: any) => {
        const name = facility.name;
        const city = facility.city || "Massachusetts";
        const address = facility.address ? `${facility.address}, ${city}, MA` : `${city}, MA`;
        const phone = facility.phone || "our main phone number";
        const type = facility.facilityType;
        const beds = facility.totalBeds;
        const rating = facility.overallRating;
        const services = facility.services?.length > 0 ? facility.services.slice(0, 5).join(", ") : null;
        const amenities = facility.amenities?.length > 0 ? facility.amenities.slice(0, 5).join(", ") : null;
        const acceptsMedicare = facility.acceptsMedicare === "yes";
        const acceptsMedicaid = facility.acceptsMedicaid === "yes";
        
        const typeLabels: Record<string, string> = {
          "nursing-home": "nursing home",
          "assisted-living": "assisted living community",
          "memory-care": "memory care community",
          "independent-living": "independent living community",
          "continuing-care": "continuing care retirement community",
          "hospice": "hospice provider",
          "hospital": "hospital"
        };
        const typeLabel = typeLabels[type] || "care facility";
        
        const faqs: Array<{ question: string; answer: string; category: string }> = [];
        
        // Location FAQ
        faqs.push({
          category: "Location",
          question: `Where is ${name} located?`,
          answer: `${name} is located at ${address}. We serve seniors and families throughout ${city} and the surrounding Massachusetts communities. For directions or to schedule a visit, please call ${phone}.`
        });
        
        // Contact FAQ
        faqs.push({
          category: "Contact",
          question: `How do I contact ${name}?`,
          answer: `You can reach ${name} by calling ${phone}${facility.website ? ` or visiting our website at ${facility.website}` : ""}. Our team is available to answer your questions about our services, schedule tours, and discuss your care needs.`
        });
        
        // Insurance FAQ - personalized based on actual data
        if (acceptsMedicare || acceptsMedicaid) {
          const insuranceTypes = [];
          if (acceptsMedicare) insuranceTypes.push("Medicare");
          if (acceptsMedicaid) insuranceTypes.push("MassHealth (Medicaid)");
          faqs.push({
            category: "Insurance",
            question: `Does ${name} accept Medicare or MassHealth?`,
            answer: `Yes, ${name} accepts ${insuranceTypes.join(" and ")} for eligible services. We also accept most private insurance plans and private pay. Please contact our admissions team to verify coverage for your specific situation and discuss payment options.`
          });
        } else {
          faqs.push({
            category: "Insurance",
            question: `What payment options does ${name} accept?`,
            answer: `${name} accepts various payment options including private pay and private insurance. Please contact our admissions team to discuss coverage options and verify your specific insurance plan. We can work with you to find the best payment solution for your care needs.`
          });
        }
        
        // Capacity FAQ - if we have bed data
        if (beds && beds > 0) {
          faqs.push({
            category: "Capacity",
            question: `How many beds does ${name} have?`,
            answer: `${name} has ${beds} beds available for residents. Our ${typeLabel} is designed to provide personalized care in a comfortable environment. Availability may vary, so please contact us to inquire about current openings.`
          });
        }
        
        // Rating FAQ - if we have rating data
        if (rating) {
          faqs.push({
            category: "Quality",
            question: `What is the quality rating for ${name}?`,
            answer: `${name} has an overall rating of ${rating} out of 5 stars. We are committed to providing high-quality care and continuously improving our services. Our ratings reflect our dedication to resident satisfaction and care excellence.`
          });
        }
        
        // Services FAQ - if we have services data
        if (services) {
          faqs.push({
            category: "Services",
            question: `What services does ${name} offer?`,
            answer: `${name} offers a range of services including ${services}, and more. Our ${typeLabel} is designed to meet the diverse needs of our residents. Contact us for a complete list of services available.`
          });
        }
        
        // Amenities FAQ - if we have amenities data
        if (amenities) {
          faqs.push({
            category: "Amenities",
            question: `What amenities are available at ${name}?`,
            answer: `${name} features amenities including ${amenities}, among others. We strive to create a comfortable, home-like environment for all our residents. Schedule a tour to see our amenities in person.`
          });
        }
        
        // Type-specific FAQs
        if (type === "nursing-home") {
          faqs.push({
            category: "Care",
            question: `What level of nursing care is provided at ${name}?`,
            answer: `${name} provides 24/7 skilled nursing care including medication management, wound care, physical therapy, occupational therapy, and speech therapy. Our licensed nurses and certified nursing assistants are on staff around the clock to ensure residents receive the care they need.`
          });
          faqs.push({
            category: "Admissions",
            question: `What is the admission process at ${name}?`,
            answer: `The admission process at ${name} begins with an initial assessment by our clinical team. We evaluate medical needs, create a personalized care plan, and review insurance coverage. Call ${phone} to schedule an assessment and tour.`
          });
        } else if (type === "assisted-living") {
          faqs.push({
            category: "Care",
            question: `What assistance is available at ${name}?`,
            answer: `${name} provides assistance with daily activities including bathing, dressing, medication management, meal preparation, and housekeeping. Our staff is available 24/7 while residents maintain their independence and dignity.`
          });
        } else if (type === "memory-care") {
          faqs.push({
            category: "Safety",
            question: `How does ${name} ensure safety for memory care residents?`,
            answer: `${name} features secured entrances and exits, 24-hour supervision, emergency call systems, and specialized staff trained in dementia care. Our secure environment is designed to support residents with Alzheimer's and other forms of dementia.`
          });
        } else if (type === "hospital") {
          faqs.push({
            category: "Emergency",
            question: `Does ${name} have an emergency department?`,
            answer: `${name} provides emergency medical services. For medical emergencies, call 911 or visit our emergency department. Our emergency team is equipped to handle a wide range of medical situations 24 hours a day, 7 days a week.`
          });
          faqs.push({
            category: "Appointments",
            question: `How do I schedule an appointment at ${name}?`,
            answer: `You can schedule appointments at ${name} by calling ${phone}. For specialty services, your primary care physician can provide a referral. Many departments also offer online scheduling through our patient portal.`
          });
        } else if (type === "hospice") {
          faqs.push({
            category: "Eligibility",
            question: `Who is eligible for hospice care from ${name}?`,
            answer: `${name} provides hospice care for patients with a life expectancy of six months or less as certified by a physician. Our services focus on comfort, dignity, and quality of life. Medicare, Medicaid, and most insurance plans cover hospice care.`
          });
        }
        
        // Tour FAQ - for all facilities
        faqs.push({
          category: "Visits",
          question: `Can I schedule a tour of ${name}?`,
          answer: `Yes! We welcome prospective residents and families to tour ${name}. During your visit, you can see our facilities, meet our staff, and ask questions about our care programs. Call ${phone} to schedule your tour today.`
        });
        
        return faqs;
      };

      let createdCount = 0;
      let skippedCount = 0;
      for (const facility of facilities) {
        // Check if this facility already has FAQs (per-facility idempotence)
        const existingFaqs = await storage.listFacilityFaqs(facility.id);
        if (existingFaqs.length > 0 && !force) {
          skippedCount++;
          continue; // Skip facilities that already have FAQs
        }
        
        // Generate personalized FAQs for this facility
        const faqs = generatePersonalizedFaqs(facility);

        for (let i = 0; i < faqs.length; i++) {
          const faq = faqs[i];
          await storage.createFacilityFaq({
            facilityId: facility.id,
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            displayOrder: i,
            isActive: "yes",
          });
          createdCount++;
        }
      }

      res.json({ 
        message: `Successfully seeded ${createdCount} personalized FAQs for ${facilities.length - skippedCount} facilities (${skippedCount} skipped, already had FAQs)`,
        facilitiesCount: facilities.length,
        skipped: skippedCount,
        faqsCount: createdCount 
      });
    } catch (error) {
      console.error("Error seeding facility FAQs:", error);
      res.status(500).json({ message: "Failed to seed facility FAQs" });
    }
  });

  // Seed endpoint for article images - assigns unique senior-focused images to all articles
  app.post("/api/seed/article-images", async (req: Request, res: Response) => {
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      // Get all stock images
      const stockImagesDir = path.join(process.cwd(), 'attached_assets', 'stock_images');
      const allImages = fs.readdirSync(stockImagesDir)
        .filter((f: string) => f.endsWith('.jpg') || f.endsWith('.png'))
        .map((f: string) => `/attached_assets/stock_images/${f}`);
      
      if (allImages.length === 0) {
        return res.status(400).json({ message: "No stock images found" });
      }
      
      // Get all articles
      const articles = await storage.listArticles();
      
      // Comprehensive keyword to image pattern mapping for senior care
      const keywordPatterns: Array<{ keywords: string[]; patterns: string[] }> = [
        { keywords: ["nutrition", "eating", "diet", "food", "meal"], patterns: ["nutrition", "eating", "meal", "cookin"] },
        { keywords: ["medication", "medicine", "prescription", "pills", "drug"], patterns: ["medica", "taking_", "pills"] },
        { keywords: ["caregiver", "burnout", "self-care", "stress"], patterns: ["caregiver", "respite"] },
        { keywords: ["exercise", "physical", "mobility", "walking", "fitness", "stretching"], patterns: ["exercise", "stretching", "walking", "yoga", "couple_walki"] },
        { keywords: ["dementia", "alzheimer", "memory loss", "cognitive decline"], patterns: ["dementia", "alzh", "memory_care", "man_with_dem"] },
        { keywords: ["safety", "fall", "prevent", "accident", "home safety"], patterns: ["safety", "home_safety", "grab_bar"] },
        { keywords: ["doctor", "appointment", "checkup", "screening", "medical"], patterns: ["doctor", "couple_at_doc", "blood_pressure", "citizen_blood"] },
        { keywords: ["hospice", "palliative", "end of life", "comfort care"], patterns: ["hospice", "end_of_life", "comfort"] },
        { keywords: ["brain", "cognitive", "puzzle", "mental stimulation"], patterns: ["brain", "cognitive", "puzzle"] },
        { keywords: ["social", "isolation", "loneliness", "connection", "friends"], patterns: ["social", "friend", "conversation"] },
        { keywords: ["legal", "planning", "estate", "documents", "advance directive"], patterns: ["legal", "document"] },
        { keywords: ["mental health", "depression", "anxiety", "emotional"], patterns: ["mental_health"] },
        { keywords: ["family", "loved one", "grandchildren", "generation"], patterns: ["family", "grandmother", "multigenerational", "grandchild"] },
        { keywords: ["technology", "tablet", "computer", "digital"], patterns: ["tablet", "technology"] },
        { keywords: ["holiday", "celebration", "christmas", "thanksgiving"], patterns: ["holiday", "celebration"] },
        { keywords: ["veteran", "military", "va benefits"], patterns: ["veteran", "military"] },
        { keywords: ["respite", "break", "relief"], patterns: ["respite"] },
        { keywords: ["personal care", "bathing", "hygiene", "grooming", "pca"], patterns: ["personal_care", "hygiene", "home_health_aide"] },
        { keywords: ["hospital", "discharge", "transition"], patterns: ["hospital", "discharge", "nurse_caring"] },
        { keywords: ["heart", "cardiac", "blood pressure", "cardiovascular"], patterns: ["heart", "blood_pressure", "citizen_blood"] },
        { keywords: ["diabetes", "blood sugar", "glucose"], patterns: ["diabetes", "blood_sugar"] },
        { keywords: ["sleep", "insomnia", "rest", "night"], patterns: ["sleep", "sleepin", "peaceful"] },
        { keywords: ["hydration", "water", "fluid", "dehydration"], patterns: ["drinking", "water"] },
        { keywords: ["wound", "pressure", "skin"], patterns: ["wound", "care_medical"] },
        { keywords: ["adult day", "day program", "activities"], patterns: ["adult_day", "program"] },
        { keywords: ["emergency", "preparedness", "first aid"], patterns: ["emergency", "prepared"] },
        { keywords: ["reminiscence", "memories", "photos", "life review"], patterns: ["reminiscence", "photo", "memories"] },
        { keywords: ["vision", "eye", "glasses", "sight"], patterns: ["vision", "eye"] },
        { keywords: ["hearing", "deaf", "hearing aid"], patterns: ["hearing"] },
        { keywords: ["wheelchair", "walker", "mobility aid", "cane"], patterns: ["wheelchair", "mobility", "walking_cane", "man_with_wal"] },
        { keywords: ["chronic", "condition", "disease management", "pain"], patterns: ["chronic", "disease"] },
        { keywords: ["dental", "oral", "teeth"], patterns: ["dental", "oral"] },
        { keywords: ["home modification", "accessibility", "ramp", "grab bar"], patterns: ["modification", "accessibility"] },
        { keywords: ["abuse", "neglect", "elder abuse", "protection"], patterns: ["protection", "elder_protection"] },
        { keywords: ["companion", "friendship", "visit"], patterns: ["companion", "friend"] },
        { keywords: ["home care", "in-home", "aging in place"], patterns: ["home_health", "aide_hel", "caregiver_helping"] },
        { keywords: ["communication", "talking", "conversation"], patterns: ["conversation", "talking", "social_conne"] },
      ];
      
      // Senior-focused fallback images (happy seniors, care interactions)
      const seniorFallbackPatterns = ["happy_elderly", "elderly_senior", "nurse_caring", "senior_couple", "elderly_couple", "grandmother", "senior_woman", "elderly_man"];
      
      // Track used images to ensure uniqueness
      const usedImages = new Set<string>();
      let updatedCount = 0;
      
      // Function to find images matching patterns
      const findMatchingImages = (patterns: string[]): string[] => {
        return allImages.filter((img: string) => 
          patterns.some(pattern => img.toLowerCase().includes(pattern.toLowerCase()))
        );
      };
      
      // Function to find best matching image for an article
      const findBestImage = (title: string, category: string): string => {
        const titleLower = title.toLowerCase();
        
        // Check each keyword pattern
        for (const { keywords, patterns } of keywordPatterns) {
          if (keywords.some(kw => titleLower.includes(kw))) {
            const matchingImages = findMatchingImages(patterns);
            for (const img of matchingImages) {
              if (!usedImages.has(img)) {
                usedImages.add(img);
                return img;
              }
            }
          }
        }
        
        // Category-based fallback patterns
        const categoryPatterns: Record<string, string[]> = {
          "Health & Wellness": ["nutrition", "exercise", "doctor", "health", "stretching", "yoga", "blood_pressure"],
          "Caregiver Support": ["caregiver", "family", "respite", "home_health"],
          "Dementia Care": ["dementia", "alzh", "memory", "man_with_dem"],
          "Safety": ["safety", "home_safety", "grab_bar", "modification"],
          "Care Guides": ["home_health", "aide_hel", "caregiver", "nurse_caring"],
          "Financial Planning": ["legal", "document", "senior_couple"],
          "Legal Planning": ["legal", "document"],
          "Types of Care": ["hospice", "adult_day", "nurse_caring"],
          "Massachusetts Resources": ["senior_couple", "happy_elderly"],
          "Alzheimer's & Dementia": ["dementia", "alzh", "memory", "man_with_dem"],
        };
        
        const patterns = categoryPatterns[category] || [];
        if (patterns.length > 0) {
          const matchingImages = findMatchingImages(patterns);
          for (const img of matchingImages) {
            if (!usedImages.has(img)) {
              usedImages.add(img);
              return img;
            }
          }
        }
        
        // Senior-focused fallback
        const seniorImages = findMatchingImages(seniorFallbackPatterns);
        for (const img of seniorImages) {
          if (!usedImages.has(img)) {
            usedImages.add(img);
            return img;
          }
        }
        
        // Last resort: any unused image
        for (const img of allImages) {
          if (!usedImages.has(img)) {
            usedImages.add(img);
            return img;
          }
        }
        
        // If all images are used, start reusing (shouldn't happen with 150+ images for 102 articles)
        return allImages[updatedCount % allImages.length];
      };
      
      // Use parallel processing for faster image updates
      const imagePromises = articles.map(async (article) => {
        const imageUrl = findBestImage(article.title, article.category || "");
        await storage.updateArticle(article.id, { heroImageUrl: imageUrl });
        return 1;
      });
      
      const results = await Promise.all(imagePromises);
      const finalCount = results.reduce((sum, val) => sum + val, 0);
      
      res.json({ 
        message: `Successfully updated ${finalCount} articles with unique senior-focused images`,
        articlesUpdated: finalCount,
        totalImages: allImages.length
      });
    } catch (error) {
      console.error("Error seeding article images:", error);
      res.status(500).json({ message: "Failed to seed article images" });
    }
  });

  // Seed endpoint for article content - generates 2000+ word articles with proper links
  app.post("/api/seed/article-content", async (req: Request, res: Response) => {
    try {
      const articles = await storage.listArticles();
      const CONSULTATION_LINK = "https://www.privateinhomecaregiver.com/consultation";
      const BASE_URL = "https://www.privateinhomecaregiver.com";
      
      // Related article slugs for internal linking
      const relatedArticles: Record<string, string[]> = {
        nutrition: ["create-medication-management-system", "importance-foot-care-seniors", "hydration-tips-elderly"],
        medication: ["nutrition-guide-seniors-healthy-eating", "handle-medical-appointments-seniors", "regular-health-screenings-seniors"],
        dementia: ["brain-games-cognitive-health", "create-meaningful-activities-seniors", "understanding-dementia-care-guide-families"],
        safety: ["home-safety-checklist-seniors-fall-prevention", "preventing-caregiver-burnout-self-care", "elder-abuse-prevention"],
        caregiver: ["preventing-caregiver-burnout-self-care", "home-health-aides-vs-cnas", "complete-guide-in-home-care-massachusetts"],
        exercise: ["nutrition-guide-seniors-healthy-eating", "brain-games-cognitive-health", "importance-foot-care-seniors"],
        hospice: ["advance-care-planning", "grief-loss-seniors", "hospital-home-transitions"],
        default: ["complete-guide-in-home-care-massachusetts", "preventing-caregiver-burnout-self-care", "home-safety-checklist-seniors-fall-prevention"]
      };
      
      // Generate direct answer based on topic
      const getDirectAnswer = (title: string): string => {
        const t = title.toLowerCase();
        if (t.includes("nutrition") || t.includes("eating")) return "Senior nutrition focuses on meeting the unique dietary needs of older adults, including increased protein for muscle maintenance, calcium and vitamin D for bone health, and adequate hydration. A balanced diet with colorful fruits and vegetables, lean proteins, whole grains, and healthy fats supports overall health and helps manage chronic conditions.";
        if (t.includes("medication")) return "Effective medication management for seniors involves using pill organizers, setting reminders, maintaining an updated medication list, understanding potential drug interactions, and communicating regularly with healthcare providers. Proper medication management prevents dangerous errors and ensures treatments work as intended.";
        if (t.includes("dementia") || t.includes("alzheimer")) return "Dementia care involves creating safe, structured environments, using clear communication techniques, maintaining consistent routines, and providing meaningful activities that match the person's abilities. Professional caregivers trained in dementia care can help families navigate the unique challenges of memory-related conditions.";
        if (t.includes("safety") || t.includes("fall")) return "Home safety for seniors includes removing tripping hazards, installing grab bars in bathrooms, ensuring adequate lighting, securing loose rugs, and organizing frequently used items within easy reach. These modifications can reduce fall risk by up to 50% and support safe aging in place.";
        if (t.includes("caregiver") || t.includes("burnout")) return "Caregiver burnout prevention requires regular respite breaks, maintaining personal health and social connections, setting realistic expectations, accepting help from others, and recognizing early warning signs of stress. Support groups and professional resources provide essential emotional support for family caregivers.";
        if (t.includes("exercise") || t.includes("physical")) return "Safe exercise for seniors includes walking, swimming, chair exercises, gentle stretching, and balance training. Regular physical activity improves strength, flexibility, balance, and cognitive function while reducing the risk of falls and chronic disease progression.";
        if (t.includes("hospice") || t.includes("palliative")) return "Hospice and palliative care focus on comfort, dignity, and quality of life for those with serious illness. Hospice is for terminal conditions with a prognosis of six months or less, while palliative care can be provided alongside curative treatment at any stage of illness.";
        return "Quality in-home care helps Massachusetts seniors maintain independence and dignity while aging in place. Professional caregivers provide personalized assistance with daily activities, medication reminders, companionship, and specialized care for conditions like dementia, adapting services as needs change.";
      };
      
      // Generate FAQ items based on topic
      const getFaqItems = (title: string): Array<{question: string; answer: string}> => {
        const t = title.toLowerCase();
        if (t.includes("nutrition") || t.includes("eating")) return [
          { question: "What are the most important nutrients for seniors?", answer: "Key nutrients for seniors include protein for muscle maintenance, calcium and vitamin D for bone health, B12 for energy and cognitive function, fiber for digestive health, and omega-3 fatty acids for heart and brain health." },
          { question: "How can I encourage a senior with poor appetite to eat?", answer: "Offer smaller, more frequent meals; make food visually appealing; include favorite foods; provide companionship during meals; address any dental or swallowing issues; and consult a healthcare provider if appetite loss persists." },
          { question: "Should seniors take nutritional supplements?", answer: "While whole foods should be the primary nutrition source, supplements like vitamin D, B12, and calcium may be beneficial for seniors who cannot meet needs through diet alone. Always consult a healthcare provider before starting supplements." }
        ];
        if (t.includes("medication")) return [
          { question: "How can I help a senior manage multiple medications?", answer: "Use a weekly pill organizer, create a medication schedule, set reminders or alarms, maintain an updated medication list for all healthcare appointments, and consider professional medication management support from a caregiver or pharmacist." },
          { question: "What are signs of medication problems in seniors?", answer: "Watch for confusion, dizziness, falls, changes in appetite or sleep, unusual fatigue, and behavioral changes. These could indicate drug interactions, side effects, or incorrect dosing requiring immediate healthcare attention." },
          { question: "How often should medication lists be reviewed?", answer: "Medication lists should be reviewed at every healthcare appointment, when any new medication is added, after any hospitalization, and at least annually with a pharmacist for a comprehensive medication review." }
        ];
        if (t.includes("dementia") || t.includes("alzheimer")) return [
          { question: "What are early warning signs of dementia?", answer: "Early signs include memory loss affecting daily life, difficulty with familiar tasks, confusion about time or place, trouble with words, misplacing items, poor judgment, social withdrawal, and mood or personality changes." },
          { question: "How can I communicate effectively with someone who has dementia?", answer: "Use simple, clear sentences; maintain eye contact; speak slowly and calmly; avoid arguing or correcting; offer limited choices; use visual cues; and focus on emotions rather than facts when the person is confused." },
          { question: "What activities are beneficial for people with dementia?", answer: "Beneficial activities include music therapy, looking at photo albums, simple crafts, gentle exercise, gardening, sorting tasks, and reminiscence activities. Activities should match the person's current abilities and interests." }
        ];
        if (t.includes("safety") || t.includes("fall")) return [
          { question: "What are the most important home modifications for senior safety?", answer: "Key modifications include installing grab bars in bathrooms, improving lighting throughout the home, removing throw rugs and tripping hazards, adding handrails on stairs, and ensuring clear pathways for mobility aids." },
          { question: "How can seniors prevent falls at home?", answer: "Prevent falls by wearing non-slip footwear, using assistive devices as recommended, keeping frequently used items within reach, exercising regularly to maintain strength and balance, and having regular vision and hearing checkups." },
          { question: "When should a senior consider hiring in-home care for safety?", answer: "Consider in-home care when a senior has experienced falls, has difficulty with daily activities, shows confusion about medications, struggles with meal preparation, or when family caregivers need support with supervision and care." }
        ];
        // Default FAQs
        return [
          { question: "What is the difference between home care and home health care?", answer: "Home care provides non-medical assistance with daily activities like bathing, dressing, and meal preparation. Home health care involves medical services like wound care and physical therapy, typically ordered by a physician and covered by Medicare." },
          { question: "How do I know if my loved one needs in-home care?", answer: "Signs include difficulty with daily activities, poor nutrition or hygiene, medication errors, increased falls, social isolation, caregiver burnout, or the senior expressing feeling overwhelmed managing independently." },
          { question: "What questions should I ask when choosing a home care provider?", answer: "Ask about caregiver screening and training, supervision practices, backup plans, communication protocols, costs, insurance acceptance, and how care plans are developed and adjusted as needs change." }
        ];
      };
      
      // Article content templates by topic keywords
      const generateArticleContent = (title: string, category: string, heroImageUrl?: string): string => {
        const titleLower = title.toLowerCase();
        const directAnswer = getDirectAnswer(title);
        const faqItems = getFaqItems(title);
        const imageUrl = heroImageUrl || "/attached_assets/stock_images/happy_elderly_senior.jpg";
        
        // Determine related articles for internal linking
        let relatedSlugs = relatedArticles.default;
        for (const [key, slugs] of Object.entries(relatedArticles)) {
          if (titleLower.includes(key)) {
            relatedSlugs = slugs;
            break;
          }
        }
        
        // H1, Hero Image, and Direct Answer block
        const headerBlock = `<h1>${title}</h1>
<img src="${imageUrl}" alt="${title}" class="hero-image" width="800" height="450" loading="eager" />
<div class="direct-answer" itemscope itemtype="https://schema.org/Answer">
<p itemprop="text"><strong>${directAnswer}</strong></p>
</div>
`;

        // Related articles section
        const relatedArticlesSection = `
<h2>Related Articles</h2>
<ul>
${relatedSlugs.map(slug => `<li><a href="${BASE_URL}/articles/${slug}">${slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</a></li>`).join('\n')}
</ul>
`;

        // Schema-marked FAQ section
        const faqSection = `
<h2>Frequently Asked Questions</h2>
<div itemscope itemtype="https://schema.org/FAQPage">
${faqItems.map(faq => `<div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
<h3 itemprop="name">${faq.question}</h3>
<div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
<p itemprop="text">${faq.answer}</p>
</div>
</div>`).join('\n')}
</div>
`;

        // JSON-LD FAQ Schema
        const faqJsonLd = `
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
${faqItems.map(faq => `    {
      "@type": "Question",
      "name": "${faq.question.replace(/"/g, '\\"')}",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "${faq.answer.replace(/"/g, '\\"')}"
      }
    }`).join(',\n')}
  ]
}
</script>
`;
        
        // Common sections that appear in all articles - extended for 2000+ word count
        const ctaSection = `
<h2>Get Professional In-Home Care Support</h2>
<p>Finding the right care solution for your loved one can feel overwhelming, especially when balancing work, family responsibilities, and the emotional weight of watching a parent or spouse need more help than before. At Private In-Home Caregiver, we understand the unique challenges Massachusetts families face when seeking quality senior care. Our experienced team of Personal Care Assistants (PCAs) provides compassionate, personalized care that helps seniors maintain their independence and dignity at home.</p>
<p>Whether you need assistance with daily activities like bathing, dressing, and meal preparation, companionship to combat isolation and loneliness, or specialized dementia care from trained professionals, we're here to help. Our care coordinators take the time to understand each family's unique situation, developing customized care plans that address specific needs while respecting individual preferences and routines.</p>
<p>We proudly serve families throughout Massachusetts, from Boston and Cambridge to Worcester, Springfield, and communities across the Commonwealth. Our caregivers undergo thorough background checks, comprehensive training, and ongoing supervision to ensure the highest quality of care. <a href="${CONSULTATION_LINK}">Schedule a free consultation</a> with our care coordinators to discuss your family's unique needs and learn how we can support your loved one's journey to better health and wellbeing. There's no obligation, and the call takes just 15-20 minutes to help you understand your options.</p>

<h2>Why Massachusetts Families Choose Private In-Home Caregiver</h2>
<p>Choosing a home care provider is one of the most important decisions a family can make. At Private In-Home Caregiver, we've built our reputation on reliability, compassion, and excellence in care delivery. Our approach centers on treating each client as we would want our own family members to be treated, with dignity, respect, and genuine warmth.</p>
<p>Our caregivers become trusted partners in your loved one's care journey. They develop meaningful relationships with clients and families, providing consistent, personalized attention that facility-based care simply cannot match. We carefully match caregivers with clients based on personality, interests, and care needs, ensuring compatibility and comfort from the very first visit.</p>
<p>We understand that needs can change over time. Whether your loved one requires just a few hours of help each week or needs 24-hour care, our flexible scheduling adapts to your situation. We offer various care options including <a href="${BASE_URL}/services/personal-care">personal care assistance</a>, <a href="${BASE_URL}/services/companionship">companionship services</a>, <a href="${BASE_URL}/services/homemaking">homemaking support</a>, and <a href="${BASE_URL}/services/dementia-care">specialized dementia care</a>. Contact us today to learn how we can help your family.</p>
`;

        const maResourcesSection = `
<h2>Massachusetts Senior Care Resources</h2>
<p>Massachusetts is fortunate to have an extensive network of resources supporting seniors and their families. Understanding and accessing these resources can significantly improve quality of life and reduce the burden on family caregivers. The state's Aging Services Access Points (ASAPs) serve as central coordinating agencies, helping families navigate the complex landscape of senior services.</p>
<p>The <a href="${BASE_URL}/aging-resources">24 ASAPs across Massachusetts</a> provide free assistance with accessing various programs including home care, nutrition services, transportation, and benefits counseling. They can help determine eligibility for MassHealth, Medicaid waiver programs, and other financial assistance that may help cover care costs. Every Massachusetts senior, regardless of income, can benefit from ASAP services.</p>
<p>For families exploring different care settings, our <a href="${BASE_URL}/find-care">Massachusetts Care Directory</a> offers comprehensive information on nursing homes, assisted living facilities, memory care communities, adult day programs, and in-home care providers throughout the Commonwealth. The directory includes facility ratings, services offered, and contact information to help you compare options.</p>
<p>Additional state resources include the Massachusetts Executive Office of Elder Affairs, which oversees programs and policies affecting older adults; the Massachusetts Senior Medicare Patrol, which helps protect seniors from healthcare fraud; and various community programs offering meals, transportation, and social activities. Our <a href="${BASE_URL}/caregiver-resources">Caregiver Resources Hub</a> provides links to these and many other helpful resources, along with educational articles and tools designed specifically for family caregivers.</p>

<h2>Understanding Your Care Options</h2>
<p>Every family's situation is unique, and the best care solution depends on many factors including the level of assistance needed, personal preferences, family involvement, financial resources, and future planning considerations. Taking time to understand all available options helps ensure informed decisions that align with your loved one's values and goals.</p>
<p>In-home care offers numerous advantages for seniors who wish to age in place. Remaining in familiar surroundings can provide comfort, maintain routines, and support overall wellbeing. In-home care can range from a few hours of help each week to around-the-clock assistance, adapting as needs change over time. Visit our <a href="${BASE_URL}/services">services page</a> to learn more about the types of in-home care we provide.</p>
<p>Some families find that a combination of care types works best. For example, in-home care might be supplemented with adult day programs for socialization, or respite care might provide relief when primary caregivers need a break. Our care coordinators can help you explore options and design a care plan that works for your family's specific situation.</p>
<p>Planning ahead whenever possible leads to better outcomes. Consider discussing care preferences with your loved one while they can still participate in decision-making. Document wishes through advance directives and ensure appropriate legal documents like healthcare proxy and power of attorney are in place. The <a href="${BASE_URL}/articles">articles section</a> of our website offers guidance on these important planning steps.</p>

<h2>The Importance of Quality Care</h2>
<p>Quality care makes a measurable difference in senior health outcomes, satisfaction, and overall quality of life. Research consistently shows that seniors who receive appropriate, compassionate care experience fewer hospitalizations, better management of chronic conditions, improved mental health, and greater overall wellbeing. The relationship between caregiver and care recipient often becomes one of the most meaningful connections in a senior's daily life.</p>
<p>When evaluating care providers, look for organizations that prioritize caregiver training, perform thorough background checks, provide ongoing supervision and support, and maintain open communication with families. Quality providers also demonstrate flexibility, adapting care plans as needs change and remaining responsive to feedback and concerns.</p>
<p>Family involvement remains important even when professional care is in place. Regular check-ins, participation in care planning, and maintaining strong relationships with both your loved one and their caregivers supports the best outcomes. Don't hesitate to advocate for your loved one's needs and preferences throughout the care journey.</p>
<p>At Private In-Home Caregiver, quality is our highest priority. We invest in our caregivers through comprehensive training programs, competitive compensation, and a supportive work environment because we know that well-supported caregivers provide better care. Our care coordinators maintain regular contact with families to ensure satisfaction and address any concerns promptly. We're committed to being true partners in your loved one's care.</p>
`;

        // Nutrition articles
        if (titleLower.includes("nutrition") || titleLower.includes("eating") || titleLower.includes("diet") || titleLower.includes("food") || titleLower.includes("meal")) {
          return `${headerBlock}
<p>Proper nutrition plays a vital role in maintaining health and quality of life for seniors. As we age, our bodies undergo significant changes that affect how we process and absorb nutrients, making thoughtful meal planning more important than ever. This comprehensive guide explores the essential aspects of senior nutrition, providing practical strategies for maintaining optimal health through dietary choices.</p>

<h2>Understanding Nutritional Needs in Older Adults</h2>
<p>The nutritional requirements of seniors differ significantly from younger adults. Metabolism naturally slows with age, meaning fewer calories are needed to maintain a healthy weight. However, the need for essential nutrients often increases. Protein requirements, for example, may be higher in older adults to help maintain muscle mass and support immune function.</p>
<p>Many seniors face challenges that can impact their nutritional status, including changes in taste and smell, dental problems, difficulty swallowing, and decreased appetite. Medications can also affect nutrient absorption and appetite. Understanding these factors helps caregivers and family members develop effective strategies for ensuring adequate nutrition.</p>
<p>Key nutrients that deserve special attention in senior nutrition include calcium and vitamin D for bone health, B vitamins for energy and cognitive function, fiber for digestive health, and omega-3 fatty acids for heart and brain health. A <a href="${BASE_URL}/caregiver-resources">qualified caregiver</a> can help monitor dietary intake and ensure nutritional needs are being met.</p>

<h2>Planning Balanced Meals for Seniors</h2>
<p>Creating balanced meals for seniors requires attention to both nutritional content and practical considerations. Meals should include a variety of colorful vegetables and fruits, lean proteins, whole grains, and healthy fats. Portion sizes may need adjustment based on activity levels and individual health conditions.</p>
<p>Texture modifications may be necessary for seniors with swallowing difficulties or dental issues. Softening foods, pureeing meals, or choosing naturally soft options can help ensure adequate intake while maintaining dignity and enjoyment during mealtimes. Working with a healthcare provider or registered dietitian can help develop meal plans that address specific needs.</p>
<p>Hydration is equally important but often overlooked. Many seniors experience decreased thirst sensation, making dehydration a significant risk. Encouraging regular fluid intake through water, herbal teas, soups, and water-rich fruits and vegetables helps maintain proper hydration levels throughout the day.</p>

<h2>Addressing Common Nutritional Challenges</h2>
<p>Many seniors experience reduced appetite, which can lead to inadequate nutrition over time. Strategies to address this include offering smaller, more frequent meals rather than three large meals, making foods visually appealing, and incorporating favorite foods when possible. Social meals with family members or companions can also stimulate appetite.</p>
<p>Chronic conditions such as diabetes, heart disease, and kidney disease may require specialized dietary approaches. Working with healthcare providers to understand any necessary restrictions while still meeting nutritional needs is essential. Our <a href="${BASE_URL}/services/personal-care">personal care assistants</a> can help prepare meals that align with medical recommendations.</p>
<p>For seniors with dementia, mealtime can present unique challenges. Simplifying food choices, providing adequate time for eating, minimizing distractions, and using adaptive utensils can help maintain independence and adequate nutrition. Caregivers trained in <a href="${BASE_URL}/services/dementia-care">dementia care</a> understand these special considerations.</p>

<h2>The Role of Supplements in Senior Nutrition</h2>
<p>While whole foods should form the foundation of senior nutrition, supplements may be beneficial in certain situations. Vitamin D supplementation is often recommended for seniors who have limited sun exposure or difficulty absorbing this nutrient. Calcium supplements may help those unable to meet requirements through diet alone.</p>
<p>B12 deficiency becomes more common with age due to decreased absorption, and supplementation may be necessary. However, it's important to consult with healthcare providers before starting any supplements, as some can interact with medications or be harmful in excessive amounts.</p>
<p>Protein supplements or meal replacement drinks can be helpful for seniors struggling to meet protein needs through regular meals. These should complement rather than replace whole foods and should be selected based on individual nutritional requirements and preferences.</p>

<h2>Creating a Supportive Mealtime Environment</h2>
<p>The dining environment significantly impacts eating habits and enjoyment. Creating a calm, pleasant atmosphere for meals can enhance appetite and nutrition. This includes proper lighting, comfortable seating, minimal distractions, and adequate time for eating without rushing.</p>
<p>For seniors who eat alone, providing companionship during meals can make a significant difference. Whether through family visits, community meal programs, or <a href="${BASE_URL}/services/companionship">companion care services</a>, social interaction during mealtimes supports both nutritional and emotional wellbeing.</p>
<p>Maintaining familiar routines and incorporating cultural or personal food preferences helps preserve dignity and enjoyment around food. Celebrating special occasions with favorite meals and involving seniors in meal planning when possible supports autonomy and engagement.</p>

<h2>Food Safety Considerations</h2>
<p>Seniors are at higher risk for foodborne illness due to age-related changes in immune function. Proper food safety practices are essential, including thorough cooking of meats, proper food storage, attention to expiration dates, and careful handling of raw foods.</p>
<p>Kitchen safety is also important, particularly for seniors with memory issues or physical limitations. Removing hazards, using timers, and having assistance available during food preparation can prevent accidents while allowing participation in cooking activities.</p>

<h2>Working with Professional Caregivers</h2>
<p>Professional in-home caregivers can provide valuable support for senior nutrition. From grocery shopping and meal preparation to feeding assistance and monitoring intake, caregivers help ensure nutritional needs are met while respecting preferences and promoting independence.</p>
<p>At Private In-Home Caregiver, our Massachusetts-based team understands the importance of nutrition in overall health. Our Personal Care Assistants receive training in meal preparation, dietary modifications, and supporting seniors with various eating challenges. <a href="${CONSULTATION_LINK}">Contact us today</a> to learn how we can support your loved one's nutritional wellbeing.</p>

${maResourcesSection}

${ctaSection}

<h2>Key Takeaways</h2>
<ul>
<li>Nutritional needs change with age, requiring adjusted approaches to meal planning</li>
<li>Hydration is essential and often overlooked in senior nutrition</li>
<li>Social mealtimes can improve appetite and nutritional intake</li>
<li>Food safety practices are especially important for seniors</li>
<li>Professional caregivers can provide valuable meal preparation and monitoring support</li>
<li>Supplements should complement, not replace, a balanced diet</li>
</ul>

${relatedArticlesSection}

${faqSection}

${faqJsonLd}
`;
        }
        
        // Medication management articles
        if (titleLower.includes("medication") || titleLower.includes("medicine") || titleLower.includes("prescription") || titleLower.includes("drug")) {
          return `${headerBlock}
<p>Managing medications effectively is one of the most critical aspects of senior healthcare. With the average older adult taking multiple prescription medications daily, proper medication management becomes essential for preventing dangerous drug interactions, ensuring treatment effectiveness, and maintaining overall health. This guide provides comprehensive strategies for creating and maintaining a safe, effective medication management system.</p>

<h2>Understanding the Importance of Medication Management</h2>
<p>Medication errors are among the most common and preventable health risks for seniors. According to healthcare research, medication non-adherence and errors contribute to nearly 125,000 deaths annually in the United States. For seniors, the risks are particularly high due to multiple prescriptions, age-related changes in drug metabolism, and potential cognitive challenges.</p>
<p>Polypharmacy, the use of multiple medications simultaneously, is common among older adults. While often necessary for managing multiple health conditions, it increases the complexity of medication schedules and the risk of harmful drug interactions. A systematic approach to medication management helps mitigate these risks.</p>
<p>Proper medication management also supports treatment effectiveness. When medications are taken correctly and consistently, health conditions are better controlled, potentially reducing hospitalizations and improving quality of life. Our <a href="${BASE_URL}/services/personal-care">personal care services</a> include medication reminders to support adherence.</p>

<h2>Creating an Organized Medication System</h2>
<p>The foundation of good medication management is organization. Start by creating a complete medication list that includes all prescription drugs, over-the-counter medications, vitamins, and supplements. This list should include the medication name, dosage, prescribing doctor, pharmacy, and purpose of each medication.</p>
<p>Keep this list updated and share it with all healthcare providers at every appointment. Pharmacists can review the list to check for potential interactions. The list should be easily accessible in case of emergencies, with copies kept at home and given to family members or caregivers.</p>
<p>Pill organizers are invaluable tools for medication management. Weekly pill boxes with separate compartments for different times of day help ensure the right medications are taken at the right times. For more complex regimens, electronic pill dispensers with alarms and lockable compartments provide additional support.</p>

<h2>Establishing Medication Routines</h2>
<p>Consistency is key to medication adherence. Taking medications at the same times each day, linked to daily activities like meals or bedtime, helps establish sustainable routines. Setting alarms on phones or clocks provides additional reminders.</p>
<p>Understanding why each medication is prescribed helps motivate adherence. When seniors understand the purpose of their medications and the consequences of skipping doses, they're more likely to follow their regimen consistently. Healthcare providers should be asked to explain each medication's role in treatment.</p>
<p>For caregivers, maintaining detailed medication logs helps track adherence and identify any patterns of missed doses or side effects. These logs can be shared with healthcare providers to optimize treatment plans. Our <a href="${BASE_URL}/caregiver-resources">caregiver resources</a> include medication tracking tools and templates.</p>

<h2>Managing Prescription Refills</h2>
<p>Running out of medication can lead to dangerous gaps in treatment. Establishing a systematic approach to refills prevents this problem. Sign up for automatic refills at the pharmacy when available, and set reminders to order refills at least a week before running out.</p>
<p>Using a single pharmacy for all prescriptions allows the pharmacist to monitor for drug interactions and simplifies the refill process. Many pharmacies offer medication synchronization services that align all prescription refill dates, reducing the number of pharmacy visits needed.</p>
<p>Mail-order pharmacy services can be convenient for maintenance medications, often offering 90-day supplies at reduced costs. However, ensure proper storage of delivered medications and have a backup plan for urgent needs or new prescriptions.</p>

<h2>Recognizing and Reporting Side Effects</h2>
<p>Seniors are particularly susceptible to medication side effects due to age-related changes in how the body processes drugs. Common side effects include dizziness, fatigue, confusion, appetite changes, and digestive issues. Some side effects may mimic symptoms of aging or other conditions, making them harder to identify.</p>
<p>Maintaining open communication with healthcare providers about any new symptoms is essential. Never stop taking a prescribed medication without consulting a doctor, as sudden discontinuation can be dangerous. Keep a symptom diary to help identify any patterns related to medications.</p>
<p>Regular medication reviews with healthcare providers help identify medications that may no longer be necessary or beneficial. Deprescribing, the process of safely reducing or stopping medications, can improve quality of life and reduce side effect burden when appropriate.</p>

<h2>Safe Medication Storage and Disposal</h2>
<p>Proper storage ensures medication effectiveness and safety. Most medications should be kept in a cool, dry place away from direct sunlight. Despite common practice, bathrooms are often too humid for proper medication storage. Kitchen cabinets away from the stove or a bedroom dresser may be better options.</p>
<p>Keep medications in their original containers with labels intact. Never mix different medications in the same container, except in designated pill organizers for immediate use. Store medications out of reach of children and pets who may visit the home.</p>
<p>Dispose of expired or discontinued medications safely through pharmacy take-back programs or following FDA guidelines for home disposal. Avoid flushing medications unless specifically instructed, as this can contaminate water supplies.</p>

<h2>The Role of Caregivers in Medication Management</h2>
<p>For seniors with memory issues, physical limitations, or complex medication regimens, caregiver support with medication management is invaluable. Caregivers can help organize medications, provide reminders, administer medications if needed, and monitor for side effects.</p>
<p>Professional in-home caregivers receive training in medication management best practices. At Private In-Home Caregiver, our Massachusetts-based team helps families establish and maintain effective medication systems. <a href="${CONSULTATION_LINK}">Schedule a consultation</a> to discuss how we can support your loved one's medication management needs.</p>

${maResourcesSection}

${ctaSection}

<h2>Key Takeaways</h2>
<ul>
<li>Maintain a complete, updated list of all medications to share with healthcare providers</li>
<li>Use pill organizers and alarms to support consistent medication routines</li>
<li>Establish a systematic approach to prescription refills to prevent gaps</li>
<li>Monitor for side effects and communicate any concerns with healthcare providers</li>
<li>Store medications properly and dispose of expired medications safely</li>
<li>Professional caregivers can provide valuable medication management support</li>
</ul>

${relatedArticlesSection}

${faqSection}

${faqJsonLd}
`;
        }

        // Caregiver burnout/support articles
        if (titleLower.includes("caregiver") || titleLower.includes("burnout") || titleLower.includes("self-care") || titleLower.includes("caring for")) {
          return `${headerBlock}
<p>Caring for an aging loved one is one of the most meaningful acts of love, yet it can also be one of the most demanding experiences a person faces. Caregiver burnout is a real and serious condition that affects millions of family caregivers nationwide. Understanding the signs of burnout and implementing effective self-care strategies is essential for maintaining both your health and your ability to provide quality care.</p>

<h2>Understanding Caregiver Burnout</h2>
<p>Caregiver burnout is a state of physical, emotional, and mental exhaustion that occurs when caregivers don't get the help they need or try to do more than they're physically or financially able. The demands of caregiving can be overwhelming, particularly when caring for someone with significant health challenges or dementia.</p>
<p>Burnout develops gradually as caregivers pour more and more of themselves into their role while neglecting their own needs. Warning signs include constant fatigue, sleep problems, changes in appetite, withdrawal from friends and activities, feelings of hopelessness, and increased irritability or anxiety.</p>
<p>Research shows that family caregivers have higher rates of depression, anxiety, and chronic illness than non-caregivers. The stress of caregiving can affect immune function, increase blood pressure, and impact heart health. Recognizing the importance of self-care isn't selfish—it's essential for sustainable caregiving.</p>

<h2>Recognizing the Signs of Burnout</h2>
<p>Physical symptoms of caregiver burnout include exhaustion, frequent illnesses, body aches, changes in sleep patterns, and neglect of your own health appointments. You may find yourself getting sick more often or taking longer to recover from minor illnesses.</p>
<p>Emotional signs include feeling overwhelmed, helpless, or hopeless, increased anxiety or depression, resentment toward the person you're caring for, loss of interest in activities you once enjoyed, and social withdrawal. You may notice increased irritability or mood swings.</p>
<p>Behavioral changes such as increased alcohol or medication use, neglecting responsibilities, and abandoning hobbies and social activities are also warning signs. If you notice these changes in yourself, it's time to take action. Our <a href="${BASE_URL}/caregiver-resources">caregiver resources</a> provide support and guidance for family caregivers.</p>

<h2>Essential Self-Care Strategies</h2>
<p>Self-care for caregivers begins with giving yourself permission to prioritize your own needs. This isn't selfish—you cannot pour from an empty cup. Start by identifying small, manageable ways to care for yourself each day, whether it's a short walk, a phone call with a friend, or fifteen minutes of quiet time.</p>
<p>Maintain your own health by keeping up with medical appointments, taking prescribed medications, eating nutritious meals, and getting adequate sleep. It's easy to let your own health slide when focused on someone else's care, but this ultimately undermines your ability to provide care.</p>
<p>Physical activity is one of the most effective stress relievers. Even brief periods of exercise can improve mood and energy levels. Find activities you enjoy, whether walking, swimming, yoga, or gardening. Consider exercises you can do at home during brief breaks in caregiving.</p>

<h2>Building a Support Network</h2>
<p>No one should caregive alone. Building a support network is essential for sustainable caregiving. Reach out to family members, friends, neighbors, and faith communities. Be specific when asking for help—people often want to help but don't know what's needed.</p>
<p>Support groups for caregivers provide invaluable emotional support and practical advice. Connecting with others who understand the challenges of caregiving reduces isolation and provides perspective. Many communities offer in-person groups, and online options are available for those with limited time or mobility.</p>
<p>Professional support services can provide significant relief. <a href="${BASE_URL}/services/respite-care">Respite care</a> gives primary caregivers regular breaks while ensuring loved ones receive quality care. Adult day programs, in-home care services, and other professional resources can be part of a comprehensive support plan.</p>

<h2>Setting Boundaries and Asking for Help</h2>
<p>Learning to set boundaries is crucial for caregiver wellbeing. Recognize that you have limits and that exceeding them benefits no one. Saying no to requests that exceed your capacity, setting realistic expectations for what you can accomplish, and communicating your needs clearly are all healthy boundary-setting behaviors.</p>
<p>Asking for help can feel difficult, but it's a sign of strength, not weakness. Make a list of tasks others could help with—grocery shopping, transportation to appointments, yard work, or simply sitting with your loved one while you take a break. Then identify people who might assist with each task.</p>
<p>Consider family meetings to discuss care responsibilities and distribute tasks more equitably. Even family members who live far away can contribute through financial support, research, coordinating appointments, or providing emotional support through regular calls.</p>

<h2>Managing Stress and Emotions</h2>
<p>Caregiving brings complex emotions, including grief, guilt, anger, and anxiety. Acknowledging these feelings rather than suppressing them is important for emotional health. Many caregivers experience anticipatory grief as they watch a loved one decline, and this grief deserves recognition and processing.</p>
<p>Stress management techniques such as deep breathing, meditation, progressive muscle relaxation, and mindfulness can help manage day-to-day stress. Even brief practices incorporated into daily routines can make a significant difference in stress levels.</p>
<p>Professional counseling can provide valuable support for managing the emotional challenges of caregiving. A therapist experienced with caregiver issues can help process difficult emotions, develop coping strategies, and work through family dynamics that may complicate caregiving.</p>

<h2>The Importance of Respite Care</h2>
<p>Respite care provides temporary relief for primary caregivers, allowing time to rest, recharge, and attend to personal needs. Respite can range from a few hours to several weeks and can take place in the home, at an adult day center, or in a residential facility.</p>
<p>Regular respite breaks are not a luxury but a necessity for sustainable caregiving. Studies show that caregivers who take regular breaks have better physical and mental health, provide higher quality care, and are able to continue caregiving longer.</p>
<p>At Private In-Home Caregiver, we provide <a href="${BASE_URL}/services/respite-care">respite care services</a> throughout Massachusetts. Our trained caregivers step in to provide quality care while you take time for yourself. <a href="${CONSULTATION_LINK}">Contact us</a> to learn about respite options that fit your needs and schedule.</p>

${maResourcesSection}

${ctaSection}

<h2>Key Takeaways</h2>
<ul>
<li>Caregiver burnout is a serious condition that requires attention and action</li>
<li>Recognizing warning signs early allows for intervention before burnout becomes severe</li>
<li>Self-care is not selfish—it's essential for sustainable caregiving</li>
<li>Building a support network and asking for help are signs of strength</li>
<li>Respite care provides essential breaks that benefit both caregivers and care recipients</li>
<li>Professional support services can significantly reduce caregiver stress</li>
</ul>

${relatedArticlesSection}

${faqSection}

${faqJsonLd}
`;
        }

        // Dementia/Alzheimer's articles
        if (titleLower.includes("dementia") || titleLower.includes("alzheimer") || titleLower.includes("memory") || titleLower.includes("cognitive")) {
          return `${headerBlock}
<p>Dementia affects millions of families across America, bringing unique challenges that require specialized knowledge, patience, and compassion. Whether you're newly facing a dementia diagnosis or have been providing care for some time, understanding the progression of the disease and effective care strategies can significantly improve quality of life for both the person with dementia and their caregivers.</p>

<h2>Understanding Dementia and Its Progression</h2>
<p>Dementia is not a single disease but a general term describing symptoms affecting memory, thinking, and social abilities severely enough to interfere with daily life. Alzheimer's disease is the most common cause of dementia, accounting for 60-80% of cases, but other forms include vascular dementia, Lewy body dementia, and frontotemporal dementia.</p>
<p>Dementia typically progresses through stages, though the progression varies by individual. Early stages may involve mild memory loss, difficulty finding words, and challenges with planning and organization. Middle stages bring more significant memory problems, confusion, personality changes, and increasing need for assistance with daily activities. Late stages involve severe impairment in memory and physical function.</p>
<p>Understanding that dementia is a brain disease helps caregivers respond with compassion rather than frustration. The person with dementia isn't being difficult on purpose—their brain is processing information differently due to disease-related changes. Our <a href="${BASE_URL}/services/dementia-care">dementia care specialists</a> are trained to provide patient, understanding care throughout all stages.</p>

<h2>Creating a Safe and Supportive Environment</h2>
<p>Environmental modifications can enhance safety and reduce confusion for people with dementia. Good lighting, clearly marked rooms, removal of trip hazards, and secured doors and windows help prevent accidents. Keeping the environment familiar and consistent reduces disorientation.</p>
<p>Safety devices such as stove knob covers, medication lockboxes, door alarms, and GPS tracking devices can help maintain safety while preserving as much independence as possible. Regular safety assessments help identify new hazards as the disease progresses.</p>
<p>Visual cues and simplified environments support remaining abilities. Clear labeling on doors and drawers, contrasting colors to distinguish surfaces, and removing clutter help people with dementia navigate their environment more easily. The <a href="${BASE_URL}/articles/home-safety-checklist-for-seniors">home safety checklist</a> provides additional guidance.</p>

<h2>Effective Communication Strategies</h2>
<p>Communication changes as dementia progresses, but meaningful connection remains possible throughout the disease. Use simple, clear sentences and speak slowly and calmly. Allow extra time for responses and avoid interrupting or finishing sentences.</p>
<p>Non-verbal communication becomes increasingly important. Maintain eye contact, use gentle touch, and pay attention to tone of voice. Body language, facial expressions, and emotional tone often communicate more than words as verbal abilities decline.</p>
<p>When confusion arises, avoid arguing or correcting. Instead, redirect attention gently, validate feelings, and focus on emotional connection rather than facts. Entering the person's reality, rather than insisting on your own, reduces distress and maintains dignity.</p>

<h2>Managing Behavioral Changes</h2>
<p>Behavioral changes in dementia, including agitation, aggression, wandering, and resistance to care, often result from unmet needs, environmental factors, or physical discomfort. Learning to identify triggers helps prevent and manage challenging behaviors.</p>
<p>Common triggers include pain, hunger, thirst, need for toileting, overstimulation, understimulation, fatigue, and medication effects. Addressing the underlying cause is more effective than trying to stop the behavior directly. A symptom diary can help identify patterns and triggers.</p>
<p>Non-pharmacological approaches should be tried first for behavioral management. These include music therapy, reminiscence activities, validation therapy, structured routines, and environmental modifications. Medications may be considered when other approaches are insufficient, but should be used cautiously due to potential side effects in older adults.</p>

<h2>Supporting Daily Activities</h2>
<p>Maintaining involvement in daily activities supports dignity, purpose, and remaining abilities. Break tasks into simple steps and provide assistance only as needed. Allow extra time and accept that tasks may not be completed perfectly.</p>
<p>Adapt activities to current abilities. Someone who enjoyed complex cooking may still find satisfaction in simple food preparation tasks. A former gardener might enjoy arranging flowers or watering plants. The goal is engagement and enjoyment, not perfection.</p>
<p>Establish consistent daily routines that provide structure and predictability. Regular times for meals, activities, and rest reduce confusion and anxiety. Flexibility within the routine allows for good days and difficult days. Our <a href="${BASE_URL}/services/personal-care">personal care services</a> include activity support tailored to individual interests and abilities.</p>

<h2>Caring for Physical Health</h2>
<p>Physical health needs require careful attention as dementia progresses. Regular medical check-ups help monitor overall health and identify treatable conditions that may worsen cognitive symptoms. Ensure the care team understands how to communicate effectively with the person with dementia.</p>
<p>Nutrition often becomes challenging as the disease progresses. Changes in appetite, difficulty using utensils, forgetting to eat, and swallowing difficulties may all arise. Finger foods, nutrient-dense options, and patient assistance during meals help maintain adequate nutrition.</p>
<p>Physical activity, adapted to abilities, supports both physical and cognitive health. Walking, gentle stretching, dancing, and other movement activities improve mood, sleep, and physical function. Even in advanced stages, range-of-motion exercises and sensory activities provide benefits.</p>

<h2>Planning for the Future</h2>
<p>Early conversations about values, preferences, and legal/financial matters allow the person with dementia to participate in decisions about their future care. Establishing power of attorney, healthcare proxy, and advance directives while capacity remains ensures wishes are documented and respected.</p>
<p>Care needs will increase as dementia progresses, making it important to explore care options early. Understanding what services are available, what insurance and benefits cover, and what family resources exist helps prepare for future needs. The <a href="${BASE_URL}/find-care">Massachusetts Care Directory</a> helps families explore local options.</p>
<p>Respite and support services help families sustain caregiving over the long term. Adult day programs, in-home care, support groups, and respite care provide essential relief for primary caregivers. Planning for regular breaks prevents caregiver burnout.</p>

${maResourcesSection}

${ctaSection}

<h2>Key Takeaways</h2>
<ul>
<li>Dementia is a brain disease requiring specialized understanding and approaches</li>
<li>Environmental modifications enhance safety and support remaining abilities</li>
<li>Effective communication adapts to changing abilities while maintaining connection</li>
<li>Behavioral changes often signal unmet needs that can be addressed</li>
<li>Daily routines and meaningful activities support quality of life</li>
<li>Early planning allows for involvement in future care decisions</li>
</ul>

${relatedArticlesSection}

${faqSection}

${faqJsonLd}
`;
        }

        // Safety/fall prevention articles
        if (titleLower.includes("safety") || titleLower.includes("fall") || titleLower.includes("prevent") || titleLower.includes("accident")) {
          return `${headerBlock}
<p>Falls are the leading cause of injury-related death and hospitalization among seniors. Each year, one in four adults over 65 experiences a fall, with many resulting in serious injuries such as hip fractures and head trauma. The good news is that most falls are preventable through proactive safety measures, environmental modifications, and health management.</p>

<h2>Understanding Fall Risk Factors</h2>
<p>Multiple factors contribute to fall risk in older adults. Physical factors include muscle weakness, balance problems, vision impairment, and certain medical conditions such as arthritis, diabetes, and Parkinson's disease. Understanding individual risk factors helps target prevention efforts.</p>
<p>Medications are significant contributors to fall risk. Drugs that cause dizziness, drowsiness, or blood pressure changes increase the likelihood of falls. Regular medication reviews with healthcare providers help identify and address medication-related fall risks.</p>
<p>Environmental hazards such as poor lighting, slippery floors, loose rugs, and cluttered walkways contribute to many falls. Home safety modifications can significantly reduce these environmental risks. Our <a href="${BASE_URL}/services/homemaking">homemaking services</a> include maintaining safe, clutter-free living spaces.</p>

<h2>Home Safety Assessment and Modifications</h2>
<p>A thorough home safety assessment identifies hazards throughout the living space. Start at the entrance and work through each room, looking for potential trip hazards, adequate lighting, sturdy handrails, and accessible frequently-used items.</p>
<p>The bathroom is the most dangerous room in the home for seniors. Install grab bars near the toilet and in the shower/tub area. Use non-slip mats in the tub and on bathroom floors. Consider a raised toilet seat and shower chair for added safety. Ensure adequate lighting, including nightlights.</p>
<p>Throughout the home, secure or remove loose rugs, eliminate extension cords crossing walkways, arrange furniture to create clear pathways, and install adequate lighting in all areas, especially stairs. Keep frequently used items within easy reach to avoid the need for step stools or reaching. The <a href="${BASE_URL}/articles">home safety resources</a> provide detailed room-by-room checklists.</p>

<h2>Improving Strength and Balance</h2>
<p>Physical exercise is one of the most effective fall prevention strategies. Exercises that improve leg strength, balance, and flexibility reduce fall risk significantly. Tai Chi, yoga adapted for seniors, and specific balance exercises have proven benefits.</p>
<p>Walking regularly helps maintain strength and mobility. Start with short distances and gradually increase as endurance improves. Using a cane or walker when needed provides additional stability. Proper footwear—sturdy, low-heeled shoes with non-slip soles—also supports safe mobility.</p>
<p>Physical therapy can address specific balance and strength deficits. A physical therapist can assess individual needs, design personalized exercise programs, and recommend assistive devices if needed. Medicare and many insurance plans cover physical therapy for fall prevention.</p>

<h2>Managing Health Conditions</h2>
<p>Many medical conditions increase fall risk and require careful management. Vision problems should be addressed with regular eye exams and updated prescriptions. Hearing loss affects balance and should be evaluated and treated. Blood pressure fluctuations, particularly orthostatic hypotension, require monitoring and management.</p>
<p>Foot problems including pain, numbness, and improper footwear contribute to falls. Regular foot care, appropriate footwear, and addressing any foot conditions help maintain safe mobility. Custom orthotics may be recommended for some individuals.</p>
<p>Chronic conditions such as diabetes and arthritis require ongoing management to prevent complications that increase fall risk. Working closely with healthcare providers to optimize management of all health conditions supports overall safety.</p>

<h2>Medication Safety</h2>
<p>Regular medication reviews help identify drugs that may contribute to fall risk. Discuss all medications, including over-the-counter drugs and supplements, with healthcare providers. Never stop taking prescribed medications without consulting a doctor, but do ask about alternatives if side effects include dizziness or drowsiness.</p>
<p>Proper medication management prevents errors that could lead to falls or other problems. Use pill organizers, set reminders, and follow dosing instructions carefully. Avoid alcohol when taking medications that cause drowsiness, and be cautious when starting new medications.</p>
<p>Some medications require extra precautions, such as rising slowly to prevent dizziness or avoiding certain activities. Understanding these precautions and following them consistently helps prevent medication-related falls. Our <a href="${BASE_URL}/services/personal-care">personal care assistants</a> can provide medication reminders and support.</p>

<h2>Using Assistive Devices Safely</h2>
<p>Assistive devices such as canes, walkers, and wheelchairs can significantly improve safety and independence when used properly. These devices should be properly fitted and adjusted for the individual user. Incorrect height or style can actually increase fall risk.</p>
<p>Learning to use assistive devices correctly is essential. Physical therapists or occupational therapists can provide instruction on proper techniques, including using devices on stairs, uneven surfaces, and in tight spaces. Regular maintenance ensures devices remain in good working order.</p>
<p>Consider additional assistive technologies such as medical alert systems that allow seniors to call for help if a fall occurs. Bed rails, motion-sensor lights, and other devices can provide additional safety support depending on individual needs.</p>

<h2>Creating a Fall Prevention Plan</h2>
<p>A comprehensive fall prevention plan addresses multiple risk factors and involves the entire care team. Start with a healthcare provider assessment to identify individual risk factors. Then conduct a home safety assessment and make necessary modifications.</p>
<p>Include exercise in the prevention plan, whether through formal physical therapy, exercise classes, or home exercises. Address vision, hearing, and foot health. Review medications regularly and manage chronic conditions optimally.</p>
<p>Know what to do if a fall occurs. Practice getting up safely from the floor if possible, or know how to get comfortable and call for help if unable to get up. Having a phone accessible and a medical alert system provides additional security. Consider having a family member or <a href="${BASE_URL}/services/companionship">companion caregiver</a> check in regularly.</p>

${maResourcesSection}

${ctaSection}

<h2>Key Takeaways</h2>
<ul>
<li>Most falls are preventable through proactive safety measures</li>
<li>Home modifications significantly reduce environmental fall risks</li>
<li>Exercise that improves strength and balance is highly effective for fall prevention</li>
<li>Regular medication reviews help identify drugs that increase fall risk</li>
<li>Assistive devices must be properly fitted and used correctly</li>
<li>A comprehensive fall prevention plan addresses multiple risk factors</li>
</ul>

${relatedArticlesSection}

${faqSection}

${faqJsonLd}
`;
        }

        // Exercise/physical activity articles
        if (titleLower.includes("exercise") || titleLower.includes("physical") || titleLower.includes("fitness") || titleLower.includes("activity") || titleLower.includes("mobility")) {
          return `${headerBlock}
<p>Regular physical activity is one of the most powerful tools for maintaining health, independence, and quality of life in older adults. Research consistently shows that exercise benefits seniors in numerous ways, from strengthening muscles and bones to improving mood and cognitive function. The best part? It's never too late to start, and even small amounts of activity provide meaningful benefits.</p>

<h2>The Benefits of Exercise for Seniors</h2>
<p>Physical activity provides extensive benefits for older adults. Regular exercise helps maintain strength and mobility, reducing the risk of falls and the injuries that can result. Weight-bearing exercises support bone health, helping prevent osteoporosis and fractures.</p>
<p>Exercise supports cardiovascular health by improving heart function, blood pressure, and cholesterol levels. It helps manage chronic conditions including diabetes, arthritis, and heart disease. Physical activity also supports immune function, helping seniors stay healthier and recover more quickly from illness.</p>
<p>Mental health benefits of exercise are equally significant. Regular physical activity reduces symptoms of depression and anxiety, improves sleep quality, and enhances overall mood. Research shows that exercise even supports cognitive function and may help reduce the risk of dementia. Our <a href="${BASE_URL}/services/companionship">companion caregivers</a> can encourage and support regular physical activity.</p>

<h2>Types of Exercise for Older Adults</h2>
<p>A well-rounded exercise program includes four types of activity: endurance, strength, balance, and flexibility. Each provides unique benefits, and the best programs incorporate all four types throughout the week.</p>
<p>Endurance or aerobic exercises raise breathing and heart rate, improving cardiovascular health and stamina. Walking, swimming, cycling, and dancing are all excellent options that can be adapted to various fitness levels. Aim for at least 150 minutes of moderate-intensity aerobic activity per week.</p>
<p>Strength training maintains and builds muscle mass, which naturally declines with age. Stronger muscles support daily activities, from carrying groceries to rising from a chair. Exercises using weights, resistance bands, or body weight can be done at home or in a gym setting.</p>

<h2>Balance and Flexibility Exercises</h2>
<p>Balance exercises are crucial for fall prevention. Simple activities like standing on one foot, heel-to-toe walking, and tai chi improve balance and reduce fall risk. These exercises can be done daily and require no special equipment.</p>
<p>Flexibility exercises keep muscles and joints limber, supporting comfortable movement and reducing injury risk. Stretching should be done after muscles are warmed up, holding each stretch for 10-30 seconds without bouncing. Yoga is an excellent option that combines flexibility, balance, and strength training.</p>
<p>Many community centers, gyms, and senior centers offer classes specifically designed for older adults. These classes provide structured exercise in a social setting with instructor guidance on proper form. The <a href="${BASE_URL}/aging-resources">Massachusetts Aging Resources</a> page lists local programs and resources.</p>

<h2>Getting Started Safely</h2>
<p>Before starting a new exercise program, consult with a healthcare provider, especially if you have chronic conditions, haven't exercised recently, or experience symptoms like chest pain, dizziness, or shortness of breath. Your doctor can provide guidance on appropriate activities and any precautions to take.</p>
<p>Start slowly and progress gradually. Even five or ten minutes of activity is beneficial when just starting out. Gradually increase duration and intensity as fitness improves. The key is consistency rather than intensity—regular moderate exercise provides more benefits than occasional intense workouts.</p>
<p>Listen to your body. Some muscle soreness is normal when starting a new exercise routine, but sharp pain is a signal to stop. Stay hydrated, especially in warm weather. Exercise during cooler parts of the day in summer, and wear appropriate clothing and footwear.</p>

<h2>Exercising with Health Conditions</h2>
<p>Many chronic conditions actually improve with appropriate exercise. Arthritis patients often find that regular movement reduces stiffness and pain. People with diabetes benefit from exercise's blood sugar-lowering effects. Heart disease patients can exercise safely with proper guidance and monitoring.</p>
<p>Adaptations make exercise accessible for those with physical limitations. Chair exercises provide options for those unable to stand. Water aerobics reduces joint stress. Modified poses make yoga accessible to people with various abilities. Working with a physical therapist can help develop a safe, effective program for any limitation.</p>
<p>If you have concerns about exercising with a health condition, ask your healthcare provider for a referral to physical therapy or a certified fitness professional with experience in senior fitness. They can design a program that accounts for your specific needs and limitations.</p>

<h2>Staying Motivated</h2>
<p>Finding motivation to exercise regularly can be challenging. Setting realistic goals helps—start with achievable targets and celebrate progress. Track your activity to see improvement over time and identify patterns that support or hinder consistency.</p>
<p>Exercise with others whenever possible. Walking with a friend, joining a group class, or exercising with family members makes activity more enjoyable and provides accountability. Social support significantly improves exercise adherence.</p>
<p>Choose activities you enjoy. Exercise doesn't have to mean gym workouts—dancing, gardening, playing with grandchildren, and walking in nature all count. The best exercise is the one you'll actually do, so find activities that bring you pleasure. Our <a href="${BASE_URL}/services/companionship">companion caregivers</a> can provide exercise support and encouragement.</p>

<h2>Incorporating Activity into Daily Life</h2>
<p>Beyond formal exercise sessions, increasing daily movement supports health. Take the stairs when possible, park farther from destinations, walk during phone calls, and stand up regularly if you've been sitting. These small changes add up over time.</p>
<p>Household activities like cleaning, gardening, and cooking provide physical activity. Make these tasks work harder for you by adding extra movements, carrying smaller loads more frequently, or putting extra energy into scrubbing and sweeping.</p>
<p>Reduce sedentary time by limiting prolonged sitting. Stand or walk during commercials, use a timer to remind you to get up regularly, and consider a standing desk for activities like reading or puzzles. Even light activity during breaks from sitting provides benefits.</p>

${maResourcesSection}

${ctaSection}

<h2>Key Takeaways</h2>
<ul>
<li>Exercise benefits seniors in numerous physical and mental ways</li>
<li>A well-rounded program includes endurance, strength, balance, and flexibility</li>
<li>Start slowly and progress gradually, listening to your body</li>
<li>Most health conditions improve with appropriate exercise</li>
<li>Social support and enjoyable activities improve exercise consistency</li>
<li>Increasing daily movement supplements formal exercise</li>
</ul>

${relatedArticlesSection}

${faqSection}

${faqJsonLd}
`;
        }

        // Sleep articles
        if (titleLower.includes("sleep") || titleLower.includes("insomnia") || titleLower.includes("rest")) {
          return `${headerBlock}
<p>Quality sleep is essential for health and wellbeing at every age, but sleep patterns often change as we get older. Many seniors experience difficulty falling asleep, staying asleep, or feeling rested after sleep. Understanding these changes and implementing effective strategies can significantly improve sleep quality and overall health for older adults.</p>

<h2>How Sleep Changes with Age</h2>
<p>Normal aging brings changes to sleep patterns and architecture. Older adults tend to become sleepier earlier in the evening and wake earlier in the morning—a shift in circadian rhythm that's completely normal. Sleep also becomes lighter, with more time spent in lighter sleep stages and less in deep, restorative sleep.</p>
<p>While the need for sleep doesn't significantly decrease with age—most adults need 7-9 hours—the ability to get uninterrupted sleep often declines. Older adults typically wake more frequently during the night and may find it harder to fall back asleep. This can result in daytime fatigue despite spending adequate time in bed.</p>
<p>Distinguishing normal age-related changes from sleep disorders is important. While some changes are expected, persistent difficulty sleeping, excessive daytime sleepiness, or sleep that significantly impacts daily functioning should be discussed with a healthcare provider. Our <a href="${BASE_URL}/services/personal-care">personal care services</a> include helping establish healthy sleep routines.</p>

<h2>Common Sleep Problems in Seniors</h2>
<p>Insomnia—difficulty falling asleep, staying asleep, or waking too early—affects many older adults. It may be related to medical conditions, medications, psychological factors, or poor sleep habits. Chronic insomnia can significantly impact quality of life and health.</p>
<p>Sleep apnea, characterized by repeated breathing interruptions during sleep, is common in older adults and often undiagnosed. Symptoms include loud snoring, gasping during sleep, morning headaches, and excessive daytime sleepiness. Untreated sleep apnea increases risk for heart disease, stroke, and cognitive problems.</p>
<p>Restless leg syndrome causes uncomfortable sensations in the legs and an irresistible urge to move them, particularly when trying to fall asleep. Periodic limb movement disorder involves involuntary leg movements during sleep. Both conditions disrupt sleep quality and are treatable.</p>

<h2>Medical Conditions Affecting Sleep</h2>
<p>Many chronic conditions common in older adults can interfere with sleep. Pain from arthritis, back problems, or other conditions makes comfortable sleep difficult. Cardiovascular conditions, respiratory problems, and neurological disorders all impact sleep quality.</p>
<p>Mental health conditions, particularly depression and anxiety, frequently disrupt sleep. The relationship is bidirectional—poor sleep can worsen mental health, and mental health problems impair sleep. Addressing both together often produces better results.</p>
<p>Dementia often causes significant sleep disturbances, including confusion and agitation at night (sundowning), reversal of day-night patterns, and frequent nighttime waking. Managing sleep in dementia requires specialized approaches. Our <a href="${BASE_URL}/services/dementia-care">dementia care services</a> address these unique challenges.</p>

<h2>Medications and Sleep</h2>
<p>Many medications commonly taken by seniors can affect sleep. Some cause drowsiness, others interfere with falling or staying asleep, and some affect sleep architecture even without the person being aware. Reviewing medications with healthcare providers can identify potential sleep-disrupting drugs.</p>
<p>While sleeping pills may seem like an obvious solution, they carry significant risks for older adults. Many sleep medications increase fall risk, can cause daytime confusion, and may worsen sleep apnea. When sleep medication is necessary, careful selection and monitoring are essential.</p>
<p>Natural sleep aids, including melatonin, may be helpful for some people but are not universally effective or completely without risks. Discuss any sleep supplements with healthcare providers, as some can interact with medications or medical conditions.</p>

<h2>Good Sleep Hygiene Practices</h2>
<p>Sleep hygiene refers to habits and practices that promote good sleep quality. Maintaining a consistent sleep schedule—going to bed and waking at the same times daily, including weekends—helps regulate the body's internal clock and improve sleep quality.</p>
<p>Create a sleep-conducive bedroom environment. Keep the room cool, dark, and quiet. Use the bed only for sleep and intimacy, not for watching TV or reading. Invest in a comfortable mattress and pillows. Consider blackout curtains, white noise machines, or earplugs if needed.</p>
<p>Develop a relaxing bedtime routine that signals the body it's time for sleep. This might include a warm bath, gentle stretching, reading, or listening to calm music. Avoid stimulating activities, screens, and bright lights in the hour before bed.</p>

<h2>Daytime Habits That Affect Sleep</h2>
<p>What you do during the day significantly impacts nighttime sleep. Regular physical activity promotes better sleep, but avoid vigorous exercise close to bedtime. Morning or afternoon exercise is ideal. Exposure to natural light during the day helps maintain healthy circadian rhythms.</p>
<p>Limit caffeine, particularly in the afternoon and evening. Be aware that caffeine is found not only in coffee but also in tea, cola, chocolate, and some medications. Alcohol may help you fall asleep initially but disrupts sleep later in the night and should be limited.</p>
<p>Limit naps to 20-30 minutes in the early afternoon if needed. Longer or later naps can interfere with nighttime sleep. If you find you can't sleep at night, try reducing or eliminating naps to build sleep pressure.</p>

<h2>When to Seek Professional Help</h2>
<p>If sleep problems persist despite good sleep hygiene practices, professional evaluation is warranted. Sleep disorders are treatable, and addressing them can significantly improve quality of life and health. Keep a sleep diary to share with healthcare providers.</p>
<p>Cognitive behavioral therapy for insomnia (CBT-I) is considered the first-line treatment for chronic insomnia and is more effective than sleeping pills with lasting benefits. This structured program helps change thoughts and behaviors that interfere with sleep.</p>
<p>Sleep studies may be recommended to diagnose conditions like sleep apnea. Treatment with CPAP machines, dental appliances, or other approaches can dramatically improve sleep quality and reduce associated health risks.</p>

${maResourcesSection}

${ctaSection}

<h2>Key Takeaways</h2>
<ul>
<li>Some sleep changes are normal with aging, but persistent problems warrant attention</li>
<li>Many sleep disorders are treatable once properly diagnosed</li>
<li>Medications should be reviewed for potential sleep effects</li>
<li>Good sleep hygiene practices support better sleep quality</li>
<li>Daytime habits including exercise and light exposure affect nighttime sleep</li>
<li>Professional help is available for persistent sleep problems</li>
</ul>

${relatedArticlesSection}

${faqSection}

${faqJsonLd}
`;
        }

        // Hospice/palliative/end of life articles
        if (titleLower.includes("hospice") || titleLower.includes("palliative") || titleLower.includes("end of life") || titleLower.includes("terminal")) {
          return `${headerBlock}
<p>When facing a serious illness, understanding the options for comfort-focused care helps families make informed decisions that align with their values and goals. Hospice and palliative care offer specialized support that prioritizes quality of life and comfort, yet many families are uncertain about what these services entail and when to consider them.</p>

<h2>Understanding Palliative Care</h2>
<p>Palliative care is specialized medical care focused on providing relief from the symptoms, pain, and stress of serious illness. The goal is to improve quality of life for both the patient and their family. Importantly, palliative care can be provided alongside curative treatments—it's not just for end-of-life situations.</p>
<p>Palliative care teams typically include doctors, nurses, social workers, chaplains, and other specialists who work together to address physical, emotional, social, and spiritual needs. This comprehensive approach provides an extra layer of support beyond standard medical care.</p>
<p>Anyone with a serious illness can benefit from palliative care, regardless of prognosis. Conditions commonly treated include cancer, heart failure, COPD, kidney disease, Alzheimer's disease, and ALS. The earlier palliative care is introduced, the more benefit patients typically receive. Our <a href="${BASE_URL}/services">care services</a> can complement palliative care programs.</p>

<h2>Understanding Hospice Care</h2>
<p>Hospice is a type of palliative care specifically for people facing a terminal illness with a life expectancy of six months or less if the disease runs its normal course. Hospice focuses entirely on comfort rather than cure, helping patients live as fully and comfortably as possible in their remaining time.</p>
<p>To qualify for hospice under Medicare, a physician must certify that the patient has a terminal illness with a life expectancy of six months or less. The patient typically agrees to forgo curative treatments, though some hospice programs offer more flexibility. Patients can leave hospice and resume curative treatment at any time if they choose.</p>
<p>Hospice can be provided in various settings, including the patient's home, nursing homes, assisted living facilities, or dedicated hospice centers. The choice depends on patient preferences, care needs, and available resources. Most hospice care in the United States is provided in the home.</p>

<h2>Services Provided by Hospice</h2>
<p>Hospice provides comprehensive support for patients and families. Medical services include physician oversight, nursing care, pain and symptom management, and medications related to the terminal diagnosis. The focus is on comfort and dignity.</p>
<p>Support services include medical equipment such as hospital beds, wheelchairs, and oxygen; medical supplies; and aide services for personal care. Respite care gives family caregivers temporary relief. Hospice also provides bereavement support for families for up to a year after the patient's death.</p>
<p>Emotional and spiritual support is integral to hospice care. Social workers help with emotional needs and practical concerns. Chaplains provide spiritual support regardless of religious background. Trained volunteers offer companionship and assistance with various tasks.</p>

<h2>The Difference Between Hospice and Palliative Care</h2>
<p>While hospice is a form of palliative care, there are important distinctions. Palliative care can be provided at any stage of illness and alongside curative treatments. Hospice is specifically for those who have decided to stop curative treatment and focus on comfort, typically with a prognosis of six months or less.</p>
<p>Palliative care may be provided by the patient's regular healthcare team or by specialized palliative care providers. Hospice involves a dedicated interdisciplinary team that becomes the primary care team, with the patient's regular doctor able to remain involved.</p>
<p>Both hospice and palliative care are covered by Medicare and most insurance plans, though coverage details vary. Hospice is a particularly comprehensive benefit, covering most costs related to the terminal illness. The <a href="${BASE_URL}/articles/paying-for-in-home-care-massachusetts">payment options guide</a> provides more information on coverage.</p>

<h2>When to Consider Hospice</h2>
<p>Knowing when to consider hospice can be difficult. Signs that hospice might be appropriate include frequent hospitalizations, declining ability to perform daily activities, progressive weight loss and weakness, increased pain or other symptoms, and a general sense that the focus should shift from cure to comfort.</p>
<p>Many people wish they had started hospice sooner. Studies show that patients who enroll in hospice earlier often live longer than expected and report better quality of life. The average hospice stay is only about three weeks, though the benefit allows for six months of care.</p>
<p>Having conversations about goals of care before a crisis allows for thoughtful decision-making. Ask doctors about prognosis and what to expect. Discuss what matters most to the patient. Consider completing advance directives that document preferences. Our <a href="${BASE_URL}/caregiver-resources">caregiver resources</a> include guidance on these conversations.</p>

<h2>Making the Most of Hospice Care</h2>
<p>Effective communication with the hospice team ensures needs are met. Be open about symptoms, concerns, and preferences. Ask questions and request explanations when needed. The hospice team is there to support the entire family, not just the patient.</p>
<p>Take advantage of all the services hospice offers. Many families don't realize the full range of support available. Respite care, volunteer services, and bereavement support are often underutilized resources that can make a significant difference.</p>
<p>Allow yourself to receive help. This is a difficult time, and accepting support is not a sign of weakness. Family caregivers need care too. The hospice team understands this and is there to support everyone involved.</p>

<h2>Complementing Hospice with Additional Care</h2>
<p>While hospice provides excellent medical support, families may need additional help with daily caregiving. In-home caregivers can provide around-the-clock support that hospice alone may not offer, helping with personal care, household tasks, and companionship.</p>
<p>At Private In-Home Caregiver, we work alongside hospice teams to provide the continuous care families need. Our Personal Care Assistants offer compassionate support during this difficult time. <a href="${CONSULTATION_LINK}">Contact us</a> to discuss how we can help your family.</p>

${maResourcesSection}

${ctaSection}

<h2>Key Takeaways</h2>
<ul>
<li>Palliative care focuses on comfort and can be provided alongside curative treatment</li>
<li>Hospice is for terminal illness and focuses entirely on comfort and quality of life</li>
<li>Hospice provides comprehensive support including medical, emotional, and spiritual care</li>
<li>Earlier enrollment in hospice often leads to better quality of life</li>
<li>Hospice is typically covered by Medicare and most insurance</li>
<li>Additional in-home care can complement hospice services</li>
</ul>

${relatedArticlesSection}

${faqSection}

${faqJsonLd}
`;
        }

        // Default general senior care article for any topic
        return `${headerBlock}
<p>Caring for aging loved ones requires knowledge, compassion, and access to the right resources. Whether you're a family caregiver or helping a senior navigate their care options, understanding the landscape of senior care helps ensure the best possible outcomes. This comprehensive guide provides essential information for families navigating the journey of elder care.</p>

<h2>Understanding Senior Care Needs</h2>
<p>As people age, their care needs evolve and often increase. Physical changes may require assistance with daily activities such as bathing, dressing, and meal preparation. Cognitive changes may necessitate supervision and support with medication management and safety. Emotional needs for companionship and engagement remain important throughout life.</p>
<p>Assessing care needs accurately helps determine the most appropriate type of care. Needs assessments consider physical abilities, cognitive function, medical conditions, social support, living environment, and personal preferences. Healthcare providers, social workers, and geriatric care managers can help with this assessment.</p>
<p>Care needs can change suddenly due to illness or injury, or gradually over time. Regular reassessment ensures that care plans remain appropriate. Open communication among family members, healthcare providers, and caregivers supports timely adjustments to care. Our <a href="${BASE_URL}/services">care services</a> can be adjusted as needs change.</p>

<h2>Types of Care Available</h2>
<p>In-home care provides support in the familiar environment of home. Services range from a few hours of companionship or housekeeping to 24-hour personal care assistance. For many seniors, remaining at home as long as possible is a priority, and in-home care makes this possible.</p>
<p>Adult day programs offer structured activities, social interaction, and supervision during daytime hours while allowing seniors to return home each evening. These programs provide respite for family caregivers while meeting participants' social and care needs.</p>
<p>Residential options include assisted living facilities for those needing help with daily activities, memory care communities specializing in dementia care, and skilled nursing facilities for those requiring medical care. The <a href="${BASE_URL}/find-care">Massachusetts Care Directory</a> helps families explore local options across all care settings.</p>

<h2>Navigating the Care System</h2>
<p>The senior care system can feel overwhelming to navigate. Multiple agencies, programs, and funding sources exist, each with different eligibility requirements and application processes. Understanding where to start and how to access resources is half the battle.</p>
<p>Massachusetts Aging Services Access Points (ASAPs) serve as central resources for seniors and families. These agencies provide information, referrals, and assistance with accessing various programs and services. The <a href="${BASE_URL}/aging-resources">aging resources page</a> provides contact information for all ASAPs across the state.</p>
<p>Healthcare providers, hospital discharge planners, and social workers can also help connect families with appropriate resources. Don't hesitate to ask for help navigating the system—that's what these professionals are there for.</p>

<h2>Financial Considerations</h2>
<p>Understanding care costs and payment options is essential for planning. In-home care is typically paid for out of pocket, though long-term care insurance, veterans benefits, and some Medicaid programs may provide coverage. Researching payment options early allows for better planning.</p>
<p>Medicare covers limited home health care when medically necessary but does not cover ongoing personal care or custodial services. Medicaid programs, including MassHealth in Massachusetts, may cover home care for those who qualify based on income and assets. Application processes can be complex, so assistance is often helpful.</p>
<p>Planning ahead for potential care needs is wise. Long-term care insurance, if obtained early enough, can help cover future care costs. Financial advisors with experience in elder care can help families plan for various scenarios.</p>

<h2>Choosing Quality Care Providers</h2>
<p>Selecting care providers, whether for in-home care or facility-based services, is an important decision. Quality indicators include proper licensing and accreditation, caregiver training and supervision, positive references and reviews, and clear communication about services and costs.</p>
<p>Interview potential providers thoroughly. Ask about caregiver screening and training, supervision practices, backup plans if a caregiver is unavailable, and how concerns are addressed. Trust your instincts about whether a provider will be a good fit for your family.</p>
<p>At Private In-Home Caregiver, we're committed to providing quality care from trained, compassionate Personal Care Assistants. <a href="${CONSULTATION_LINK}">Schedule a free consultation</a> to learn more about our approach to care and how we can support your family.</p>

<h2>Supporting Family Caregivers</h2>
<p>Family caregivers provide the majority of elder care in America, often at significant cost to their own health, careers, and finances. Recognizing the importance of caregiver support is essential for sustainable caregiving.</p>
<p>Respite care—temporary relief for primary caregivers—is one of the most important support services. Regular breaks prevent burnout and allow caregivers to maintain their own health and relationships. Our <a href="${BASE_URL}/services/respite-care">respite care services</a> provide this essential relief.</p>
<p>Support groups connect caregivers with others who understand their challenges. Education about caregiving skills and self-care strategies builds confidence and resilience. The <a href="${BASE_URL}/caregiver-resources">caregiver resources hub</a> provides information, tools, and support for family caregivers.</p>

<h2>Planning for the Future</h2>
<p>Advance planning addresses both practical and values-based considerations for future care. Legal documents including healthcare proxy, durable power of attorney, and living will ensure that wishes are documented and someone is authorized to make decisions if the person cannot.</p>
<p>Conversations about care preferences—where to live, what matters most, what is unacceptable—help families understand what their loved one wants. These conversations can be difficult but are much easier before a crisis than in the middle of one.</p>
<p>Reviewing and updating plans regularly ensures they remain current. As circumstances and preferences change, documents and arrangements may need adjustment. Keeping important documents accessible and ensuring key family members know where to find them prepares for emergencies.</p>

${maResourcesSection}

${ctaSection}

<h2>Key Takeaways</h2>
<ul>
<li>Understanding and regularly assessing care needs ensures appropriate care plans</li>
<li>Multiple types of care exist to meet varying needs and preferences</li>
<li>Resources like ASAPs help families navigate the care system</li>
<li>Understanding payment options supports better financial planning</li>
<li>Quality care providers demonstrate proper credentials and clear communication</li>
<li>Advance planning prepares families for future care decisions</li>
</ul>

${relatedArticlesSection}

${faqSection}

${faqJsonLd}
`;
      };
      
      // Use parallel processing for faster updates
      const updatePromises = articles.map(async (article) => {
        const content = generateArticleContent(article.title, article.category || "");
        if (content) {
          await storage.updateArticle(article.id, { body: content });
          return 1;
        }
        return 0;
      });
      
      const results = await Promise.all(updatePromises);
      const updatedCount = results.reduce((sum: number, val: number) => sum + val, 0);
      
      res.json({ 
        message: `Successfully generated content for ${updatedCount} articles`,
        articlesUpdated: updatedCount
      });
    } catch (error) {
      console.error("Error seeding article content:", error);
      res.status(500).json({ message: "Failed to seed article content" });
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
        },
        {
          slug: "hospice-palliative-care-assessment",
          title: "Hospice & Palliative Care Assessment",
          subtitle: "Compassionate end-of-life care guidance",
          description: "This assessment helps you understand hospice and palliative care options for your loved one.",
          category: "facility",
          targetType: "hospice",
          facilityType: "hospice",
          status: "published",
          resultTitle: "Your Care Guidance",
          resultDescription: "Based on your responses, here are recommendations for comfort-focused care.",
          ctaText: "Find Hospice Providers",
          ctaUrl: "/facilities/hospice",
          metaTitle: "Hospice & Palliative Care Assessment | PrivateInHomeCareGiver",
          metaDescription: "Get guidance on hospice and palliative care options for your loved one in Massachusetts.",
          questions: [
            { text: "What is the current health situation?", options: [
              { value: "serious", label: "Serious illness with ongoing treatment", score: 1 },
              { value: "declining", label: "Declining health despite treatment", score: 2 },
              { value: "terminal", label: "Terminal diagnosis received", score: 3 },
              { value: "end-of-life", label: "End-of-life care needed", score: 4 }
            ]},
            { text: "What type of care is most needed?", type: "multiple_choice", options: [
              { value: "pain", label: "Pain and symptom management", score: 2 },
              { value: "emotional", label: "Emotional and spiritual support", score: 1 },
              { value: "family", label: "Family caregiver respite", score: 1 },
              { value: "planning", label: "End-of-life planning assistance", score: 2 },
              { value: "daily", label: "Daily personal care assistance", score: 2 }
            ]},
            { text: "Where would care ideally be provided?", options: [
              { value: "home", label: "At home with family", score: 2 },
              { value: "facility", label: "In a hospice facility", score: 2 },
              { value: "nursing", label: "In current nursing home", score: 2 },
              { value: "unsure", label: "Unsure - need guidance", score: 1 }
            ]},
            { text: "How soon is care needed?", options: [
              { value: "immediately", label: "Immediately", score: 4 },
              { value: "days", label: "Within a few days", score: 3 },
              { value: "weeks", label: "Within a few weeks", score: 2 },
              { value: "planning", label: "Planning ahead", score: 1 }
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

  // Seed initial video content
  app.post("/api/seed/videos", async (req: Request, res: Response) => {
    try {
      const existingVideos = await storage.listVideos();
      if (existingVideos.length > 0 && !req.query.force) {
        return res.json({ message: "Videos already exist. Use ?force=true to reseed.", count: existingVideos.length });
      }

      // Delete existing if force=true
      if (req.query.force && existingVideos.length > 0) {
        for (const video of existingVideos) {
          await storage.deleteVideo(video.id);
        }
      }

      const videoData = [
        {
          title: "Concierge Services Massachusetts - Live Life on Your Own Terms",
          slug: "concierge-services-massachusetts",
          description: "Discover premium concierge care services in Massachusetts that help seniors maintain independence while receiving personalized support. Learn how concierge caregiving goes beyond basic care to enhance quality of life.",
          category: "services",
          videoType: "upload",
          videoUrl: "/videos/concierge-services-massachusetts.mp4",
          thumbnailUrl: "",
          duration: 180,
          speakerName: "PrivateInHomeCareGiver",
          speakerTitle: "Massachusetts Home Care Experts",
          topics: ["concierge care", "luxury senior care", "personalized services", "Massachusetts home care"],
          targetAudience: "Families seeking premium care options for elderly loved ones",
          learningObjectives: ["Understand concierge care services", "Learn benefits of personalized care", "Discover Massachusetts care options"],
          metaTitle: "Concierge Care Services Massachusetts | Premium Senior Care",
          metaDescription: "Learn about premium concierge care services for seniors in Massachusetts. Personalized support that helps your loved ones live life on their own terms.",
          keywords: ["concierge care", "premium senior care", "Massachusetts home care", "personalized elder care"],
          featured: "yes",
          sortOrder: 1,
          status: "published",
        },
        {
          title: "Dementia Care Massachusetts - 7 Essential Options Explained",
          slug: "dementia-care-massachusetts-options",
          description: "Comprehensive guide to dementia care options in Massachusetts. Learn about the 7 essential care pathways available for families navigating memory care decisions.",
          category: "dementia-care",
          videoType: "upload",
          videoUrl: "/videos/dementia-care-massachusetts.mp4",
          thumbnailUrl: "",
          duration: 210,
          speakerName: "PrivateInHomeCareGiver",
          speakerTitle: "Memory Care Specialists",
          topics: ["dementia care", "memory care", "Alzheimer's support", "Massachusetts care options"],
          targetAudience: "Families caring for loved ones with dementia or Alzheimer's",
          learningObjectives: ["Understand 7 dementia care options", "Learn about memory care services", "Navigate care decisions"],
          metaTitle: "7 Dementia Care Options in Massachusetts | Expert Guide",
          metaDescription: "Explore 7 essential dementia care options in Massachusetts. Expert guidance for families navigating memory care for loved ones.",
          keywords: ["dementia care", "memory care Massachusetts", "Alzheimer's care", "senior memory support"],
          featured: "yes",
          sortOrder: 2,
          status: "published",
        },
        {
          title: "Home Care Costs Greater Boston - Expert Analysis",
          slug: "home-care-costs-greater-boston",
          description: "Expert analysis of home care costs in Greater Boston. Understand pricing structures, what affects rates, and how to budget for quality in-home care services.",
          category: "cost-analysis",
          videoType: "upload",
          videoUrl: "/videos/home-care-costs-greater-boston.mp4",
          thumbnailUrl: "",
          duration: 195,
          speakerName: "PrivateInHomeCareGiver",
          speakerTitle: "Care Cost Analysts",
          topics: ["home care costs", "Greater Boston pricing", "care budgeting", "affordable care options"],
          targetAudience: "Families researching home care costs in the Boston area",
          learningObjectives: ["Understand home care pricing", "Learn cost factors", "Budget effectively for care"],
          metaTitle: "Home Care Costs in Greater Boston | 2025 Price Analysis",
          metaDescription: "Expert analysis of home care costs in Greater Boston. Learn what affects pricing and how to budget for quality in-home care.",
          keywords: ["home care costs", "Boston care prices", "in-home care rates", "care budgeting"],
          featured: "no",
          sortOrder: 3,
          status: "published",
        },
        {
          title: "In-Home Care in Newton MA - 5 Essential Tips for Families",
          slug: "in-home-care-newton-ma-tips",
          description: "Essential tips for families seeking in-home care in Newton, Massachusetts. Learn how to find, evaluate, and hire quality caregivers for your loved ones.",
          category: "care-tips",
          videoType: "upload",
          videoUrl: "/videos/in-home-care-newton-ma.mp4",
          thumbnailUrl: "",
          duration: 240,
          speakerName: "PrivateInHomeCareGiver",
          speakerTitle: "Newton MA Care Specialists",
          topics: ["Newton MA care", "hiring caregivers", "family care tips", "local care resources"],
          targetAudience: "Newton, MA families seeking in-home care solutions",
          learningObjectives: ["Find quality caregivers", "Evaluate care providers", "Navigate local care options"],
          metaTitle: "In-Home Care Newton MA | 5 Essential Family Tips",
          metaDescription: "5 essential tips for finding in-home care in Newton, MA. Expert guidance for families seeking quality caregivers.",
          keywords: ["Newton MA home care", "in-home caregivers", "elder care tips", "family care guide"],
          featured: "no",
          sortOrder: 4,
          status: "published",
        },
        {
          title: "Private Home Care Cambridge MA - Expert 2025 Guide",
          slug: "private-home-care-cambridge-ma-guide",
          description: "Comprehensive 2025 guide to private home care services in Cambridge, Massachusetts. Everything families need to know about finding quality care in the Cambridge area.",
          category: "guides",
          videoType: "upload",
          videoUrl: "/videos/private-home-care-cambridge-ma.mp4",
          thumbnailUrl: "",
          duration: 420,
          speakerName: "PrivateInHomeCareGiver",
          speakerTitle: "Cambridge Care Experts",
          topics: ["Cambridge home care", "private caregivers", "local care services", "2025 care guide"],
          targetAudience: "Cambridge, MA residents seeking private home care",
          learningObjectives: ["Navigate Cambridge care options", "Understand private care benefits", "Find qualified providers"],
          metaTitle: "Private Home Care Cambridge MA | Expert 2025 Guide",
          metaDescription: "Complete 2025 guide to private home care in Cambridge, MA. Expert insights for families seeking quality care services.",
          keywords: ["Cambridge home care", "private caregivers MA", "Cambridge senior care", "home care guide"],
          featured: "yes",
          sortOrder: 5,
          status: "published",
        },
        {
          title: "Senior Companion Services Greater Boston",
          slug: "senior-companion-greater-boston",
          description: "Learn about senior companion and escort services in Greater Boston. Discover how companionship care enriches the lives of elderly adults and provides family peace of mind.",
          category: "companionship",
          videoType: "upload",
          videoUrl: "/videos/senior-companion-greater-boston.mp4",
          thumbnailUrl: "",
          duration: 360,
          speakerName: "PrivateInHomeCareGiver",
          speakerTitle: "Companionship Care Team",
          topics: ["companion care", "senior companionship", "escort services", "social engagement"],
          targetAudience: "Families seeking companionship services for elderly loved ones",
          learningObjectives: ["Understand companion care", "Learn service benefits", "Find local providers"],
          metaTitle: "Senior Companion Services Greater Boston | Companionship Care",
          metaDescription: "Explore senior companion and escort services in Greater Boston. Quality companionship care for elderly adults.",
          keywords: ["senior companion", "companion care Boston", "elderly companionship", "escort services"],
          featured: "no",
          sortOrder: 6,
          status: "published",
        },
        {
          title: "Private In-Home Care Lexington Massachusetts - Expert Analysis",
          slug: "private-care-lexington-massachusetts",
          description: "Expert analysis of private in-home care options in Lexington, Massachusetts. Understand what makes Lexington unique for senior care services.",
          category: "local-guides",
          videoType: "upload",
          videoUrl: "/videos/private-care-lexington-massachusetts.mp4",
          thumbnailUrl: "",
          duration: 255,
          speakerName: "PrivateInHomeCareGiver",
          speakerTitle: "Lexington Care Analysts",
          topics: ["Lexington care", "private home care", "local senior services", "expert analysis"],
          targetAudience: "Lexington, MA residents researching home care options",
          learningObjectives: ["Understand Lexington care landscape", "Evaluate private care options", "Make informed decisions"],
          metaTitle: "Private Home Care Lexington MA | Expert Analysis",
          metaDescription: "Expert analysis of private in-home care in Lexington, Massachusetts. Insights for families seeking quality care.",
          keywords: ["Lexington home care", "private caregivers", "MA senior care", "local care analysis"],
          featured: "no",
          sortOrder: 7,
          status: "published",
        },
        {
          title: "Private In-Home Care Massachusetts - Peace of Mind for Families",
          slug: "private-care-massachusetts-peace-of-mind",
          description: "Discover how private in-home care in Massachusetts provides peace of mind for families. Learn about the emotional and practical benefits of professional home care.",
          category: "family-support",
          videoType: "upload",
          videoUrl: "/videos/private-care-massachusetts-peace-of-mind.mp4",
          thumbnailUrl: "",
          duration: 200,
          speakerName: "PrivateInHomeCareGiver",
          speakerTitle: "Family Care Consultants",
          topics: ["family peace of mind", "home care benefits", "caregiver support", "emotional wellness"],
          targetAudience: "Family members concerned about elderly loved ones",
          learningObjectives: ["Understand care benefits", "Reduce family stress", "Find reliable support"],
          metaTitle: "Home Care Peace of Mind | Massachusetts Families",
          metaDescription: "Learn how private in-home care provides peace of mind for Massachusetts families caring for elderly loved ones.",
          keywords: ["family peace of mind", "home care benefits", "Massachusetts caregivers", "elder care support"],
          featured: "no",
          sortOrder: 8,
          status: "published",
        },
        {
          title: "Purposeful Aging Massachusetts - The Ageless Spirit of Seniors",
          slug: "purposeful-aging-massachusetts",
          description: "Celebrating purposeful aging in Massachusetts. Discover how seniors maintain vibrant, meaningful lives with the right support and community engagement.",
          category: "lifestyle",
          videoType: "upload",
          videoUrl: "/videos/purposeful-aging-massachusetts.mp4",
          thumbnailUrl: "",
          duration: 175,
          speakerName: "PrivateInHomeCareGiver",
          speakerTitle: "Aging Well Advocates",
          topics: ["purposeful aging", "senior wellness", "active aging", "community engagement"],
          targetAudience: "Seniors and families interested in aging well",
          learningObjectives: ["Embrace purposeful aging", "Maintain active lifestyle", "Build meaningful connections"],
          metaTitle: "Purposeful Aging in Massachusetts | Ageless Spirit",
          metaDescription: "Celebrating purposeful aging in Massachusetts. How seniors maintain vibrant, meaningful lives with support.",
          keywords: ["purposeful aging", "senior wellness", "aging well", "Massachusetts seniors"],
          featured: "no",
          sortOrder: 9,
          status: "published",
        }
      ];

      const createdVideos = [];
      for (const video of videoData) {
        const created = await storage.createVideo(video);
        createdVideos.push(created);
      }

      res.json({
        message: `Successfully seeded ${createdVideos.length} videos`,
        count: createdVideos.length,
        videos: createdVideos.map(v => ({ slug: v.slug, title: v.title }))
      });
    } catch (error) {
      console.error("Error seeding videos:", error);
      res.status(500).json({ message: "Failed to seed videos", error: String(error) });
    }
  });

  // Import videos from YouTube channel
  app.post("/api/admin/videos/import-youtube-channel", requireAuth, async (req: Request, res: Response) => {
    try {
      const { channelUrl } = req.body;
      
      if (!channelUrl) {
        return res.status(400).json({ message: "Channel URL is required" });
      }

      console.log("[YouTube Import] Fetching videos from channel:", channelUrl);
      const channelVideos = await fetchChannelVideos(channelUrl);

      if (channelVideos.length === 0) {
        return res.status(404).json({ message: "No videos found in channel or channel not accessible" });
      }

      const existingVideos = await storage.listVideos();
      const existingYouTubeIds = new Set(
        existingVideos
          .filter(v => v.embedUrl?.includes("youtube"))
          .map(v => {
            const match = v.embedUrl?.match(/embed\/([a-zA-Z0-9_-]+)/);
            return match ? match[1] : null;
          })
          .filter(Boolean)
      );

      const importedVideos = [];
      const skippedVideos = [];

      for (const video of channelVideos) {
        if (existingYouTubeIds.has(video.videoId)) {
          skippedVideos.push({ title: video.title, reason: "Already exists" });
          continue;
        }

        const slug = video.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .substring(0, 80);

        const existingSlug = await storage.getVideoBySlug(slug);
        const finalSlug = existingSlug ? `${slug}-${video.videoId.substring(0, 6)}` : slug;

        const shortDescription = video.description.split("\n\n")[0].substring(0, 500);

        const videoData = {
          title: video.title,
          slug: finalSlug,
          description: shortDescription,
          category: "care-tips",
          videoType: "youtube",
          embedUrl: `https://www.youtube.com/embed/${video.videoId}`,
          thumbnailUrl: video.thumbnailUrl,
          duration: video.duration,
          speakerName: "PrivateInHomeCareGiver",
          speakerTitle: "Massachusetts Home Care Experts",
          topics: [],
          targetAudience: "Families seeking senior care information",
          learningObjectives: [],
          metaTitle: video.title,
          metaDescription: shortDescription.substring(0, 160),
          keywords: ["senior care", "Massachusetts", "in-home care", "elder care"],
          featured: "no",
          sortOrder: 0,
          status: "published",
        };

        const created = await storage.createVideo(videoData);
        importedVideos.push({ title: created.title, slug: created.slug, videoId: video.videoId });
      }

      res.json({
        message: `Imported ${importedVideos.length} videos, skipped ${skippedVideos.length}`,
        imported: importedVideos,
        skipped: skippedVideos,
        total: channelVideos.length
      });
    } catch (error) {
      console.error("Error importing YouTube channel:", error);
      res.status(500).json({ message: "Failed to import videos", error: String(error) });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
