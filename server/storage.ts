import { 
  type User, type InsertUser,
  type RecoveryCode, type InsertRecoveryCode,
  type Job, type InsertJob, type UpdateJob,
  type Article, type InsertArticle, type UpdateArticle,
  type ArticleFaq, type InsertArticleFaq, type UpdateArticleFaq,
  type Inquiry, type InsertInquiry, type UpdateInquiry, type Reply,
  type PageMeta, type InsertPageMeta, type UpdatePageMeta,
  type Caregiver, type InsertCaregiver, type UpdateCaregiver,
  type JobApplication, type InsertJobApplication,
  type IntakeForm, type InsertIntakeForm, type UpdateIntakeForm,
  type CaregiverLog, type InsertCaregiverLog, type UpdateCaregiverLog,
  type HipaaAcknowledgment, type InsertHipaaAcknowledgment, type UpdateHipaaAcknowledgment,
  type LeadMagnet, type InsertLeadMagnet,
  type Referral, type InsertReferral, type UpdateReferral,
  type MaLocation, type InsertMaLocation, type UpdateMaLocation,
  type CareTypePage, type InsertCareTypePage, type UpdateCareTypePage,
  type LocationFaq, type InsertLocationFaq, type UpdateLocationFaq,
  type LocationReview, type InsertLocationReview, type UpdateLocationReview,
  type ServiceType, type InsertServiceType,
  type LocationService, type InsertLocationService,
  type CareType,
  users,
  recoveryCodes,
  jobs,
  articles,
  articleFaqs,
  inquiries,
  pageMeta,
  caregivers,
  jobApplications,
  intakeForms,
  caregiverLogs,
  hipaaAcknowledgments,
  leadMagnets,
  referrals,
  maLocations,
  careTypePages,
  locationFaqs,
  locationReviews,
  serviceTypes,
  locationServices
} from "@shared/schema";
import { randomUUID } from "crypto";
import { slugify, generateUniqueSlug } from "@shared/utils";
import { eq, and, or, desc, sql, isNull, gte, lte } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(userId: string, hashedPassword: string): Promise<User | undefined>;
  
  createRecoveryCodes(userId: string, codeHashes: string[]): Promise<RecoveryCode[]>;
  getRecoveryCodes(userId: string): Promise<RecoveryCode[]>;
  markRecoveryCodeUsed(userId: string, codeHash: string): Promise<boolean>;
  deleteRecoveryCodes(userId: string): Promise<boolean>;
  
  listJobs(status?: string): Promise<Job[]>;
  getJob(id: string): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, job: UpdateJob): Promise<Job | undefined>;
  deleteJob(id: string): Promise<boolean>;
  publishJob(id: string): Promise<Job | undefined>;
  unpublishJob(id: string): Promise<Job | undefined>;
  
  listArticles(status?: string): Promise<Article[]>;
  getArticle(id: string): Promise<Article | undefined>;
  getArticleBySlug(slug: string): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: string, article: UpdateArticle): Promise<Article | undefined>;
  deleteArticle(id: string): Promise<boolean>;
  publishArticle(id: string): Promise<Article | undefined>;
  unpublishArticle(id: string): Promise<Article | undefined>;
  
  listArticleFaqs(articleId: string): Promise<ArticleFaq[]>;
  getArticleFaq(id: string): Promise<ArticleFaq | undefined>;
  createArticleFaq(faq: InsertArticleFaq): Promise<ArticleFaq>;
  updateArticleFaq(id: string, faq: UpdateArticleFaq): Promise<ArticleFaq | undefined>;
  deleteArticleFaq(id: string): Promise<boolean>;
  
  listInquiries(status?: string): Promise<Inquiry[]>;
  getInquiry(id: string): Promise<Inquiry | undefined>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  updateInquiry(id: string, inquiry: UpdateInquiry): Promise<Inquiry | undefined>;
  updateInquiryStatus(id: string, status: string): Promise<Inquiry | undefined>;
  addInquiryReply(id: string, reply: Reply): Promise<Inquiry | undefined>;
  
  listPageMeta(): Promise<PageMeta[]>;
  getPageMeta(pageSlug: string): Promise<PageMeta | undefined>;
  upsertPageMeta(meta: InsertPageMeta | UpdatePageMeta): Promise<PageMeta>;
  deletePageMeta(pageSlug: string): Promise<boolean>;
  
  listCaregivers(filters?: { location?: string; minRate?: number; maxRate?: number; status?: string }): Promise<Caregiver[]>;
  getCaregiver(id: string): Promise<Caregiver | undefined>;
  createCaregiver(caregiver: InsertCaregiver): Promise<Caregiver>;
  updateCaregiver(id: string, caregiver: UpdateCaregiver): Promise<Caregiver | undefined>;
  deleteCaregiver(id: string): Promise<boolean>;
  publishCaregiver(id: string): Promise<Caregiver | undefined>;
  unpublishCaregiver(id: string): Promise<Caregiver | undefined>;
  
  listJobApplications(jobId?: string): Promise<JobApplication[]>;
  getJobApplication(id: string): Promise<JobApplication | undefined>;
  createJobApplication(application: Omit<InsertJobApplication, 'captchaToken'>): Promise<JobApplication>;
  updateJobApplicationStatus(id: string, status: string): Promise<JobApplication | undefined>;
  
  listIntakeForms(status?: string): Promise<IntakeForm[]>;
  getIntakeForm(id: string): Promise<IntakeForm | undefined>;
  createIntakeForm(form: Omit<InsertIntakeForm, 'captchaToken'>): Promise<IntakeForm>;
  updateIntakeForm(id: string, form: UpdateIntakeForm): Promise<IntakeForm | undefined>;
  updateIntakeFormStatus(id: string, status: string, reviewedBy?: string): Promise<IntakeForm | undefined>;
  updateIntakeFormNotes(id: string, notes: string): Promise<IntakeForm | undefined>;
  
  listCaregiverLogs(status?: string, clientName?: string): Promise<CaregiverLog[]>;
  getCaregiverLog(id: string): Promise<CaregiverLog | undefined>;
  createCaregiverLog(log: Omit<InsertCaregiverLog, 'captchaToken'>): Promise<CaregiverLog>;
  updateCaregiverLog(id: string, log: UpdateCaregiverLog): Promise<CaregiverLog | undefined>;
  updateCaregiverLogStatus(id: string, status: string, reviewedBy?: string): Promise<CaregiverLog | undefined>;
  updateCaregiverLogNotes(id: string, notes: string): Promise<CaregiverLog | undefined>;
  
  listHipaaAcknowledgments(status?: string): Promise<HipaaAcknowledgment[]>;
  getHipaaAcknowledgment(id: string): Promise<HipaaAcknowledgment | undefined>;
  createHipaaAcknowledgment(acknowledgment: Omit<InsertHipaaAcknowledgment, 'captchaToken'>): Promise<HipaaAcknowledgment>;
  updateHipaaAcknowledgment(id: string, acknowledgment: UpdateHipaaAcknowledgment): Promise<HipaaAcknowledgment | undefined>;
  updateHipaaAcknowledgmentStatus(id: string, status: string, reviewedBy?: string): Promise<HipaaAcknowledgment | undefined>;
  updateHipaaAcknowledgmentNotes(id: string, notes: string): Promise<HipaaAcknowledgment | undefined>;
  
  listLeadMagnets(): Promise<LeadMagnet[]>;
  getLeadMagnet(id: string): Promise<LeadMagnet | undefined>;
  createLeadMagnet(lead: Omit<InsertLeadMagnet, 'captchaToken'>): Promise<LeadMagnet>;
  
  listReferrals(status?: string): Promise<Referral[]>;
  getReferral(id: string): Promise<Referral | undefined>;
  createReferral(referral: Omit<InsertReferral, 'captchaToken'>): Promise<Referral>;
  updateReferral(id: string, referral: UpdateReferral): Promise<Referral | undefined>;
  updateReferralStatus(id: string, status: string, reviewedBy?: string): Promise<Referral | undefined>;
  updateReferralNotes(id: string, notes: string): Promise<Referral | undefined>;
  updateReferralTracking(id: string, hoursCompleted: string): Promise<Referral | undefined>;
  issueCreditForReferral(id: string, creditedBy: string): Promise<Referral | undefined>;
  
  // Massachusetts Care Directory
  listMaLocations(filters?: { county?: string; isCity?: string; isActive?: string }): Promise<MaLocation[]>;
  getMaLocation(id: string): Promise<MaLocation | undefined>;
  getMaLocationBySlug(slug: string): Promise<MaLocation | undefined>;
  createMaLocation(location: InsertMaLocation): Promise<MaLocation>;
  updateMaLocation(id: string, location: UpdateMaLocation): Promise<MaLocation | undefined>;
  deleteMaLocation(id: string): Promise<boolean>;
  
  listCareTypePages(filters?: { locationId?: string; careType?: CareType; status?: string }): Promise<CareTypePage[]>;
  getCareTypePage(id: string): Promise<CareTypePage | undefined>;
  getCareTypePageBySlug(slug: string): Promise<CareTypePage | undefined>;
  createCareTypePage(page: InsertCareTypePage): Promise<CareTypePage>;
  updateCareTypePage(id: string, page: UpdateCareTypePage): Promise<CareTypePage | undefined>;
  deleteCareTypePage(id: string): Promise<boolean>;
  publishCareTypePage(id: string): Promise<CareTypePage | undefined>;
  unpublishCareTypePage(id: string): Promise<CareTypePage | undefined>;
  
  listLocationFaqs(careTypePageId: string): Promise<LocationFaq[]>;
  createLocationFaq(faq: InsertLocationFaq): Promise<LocationFaq>;
  updateLocationFaq(id: string, faq: UpdateLocationFaq): Promise<LocationFaq | undefined>;
  deleteLocationFaq(id: string): Promise<boolean>;
  
  listLocationReviews(careTypePageId: string): Promise<LocationReview[]>;
  createLocationReview(review: InsertLocationReview): Promise<LocationReview>;
  updateLocationReview(id: string, review: UpdateLocationReview): Promise<LocationReview | undefined>;
  deleteLocationReview(id: string): Promise<boolean>;
  
  listServiceTypes(category?: string): Promise<ServiceType[]>;
  createServiceType(service: InsertServiceType): Promise<ServiceType>;
  
  searchLocations(query: string, careType?: CareType): Promise<{ locations: MaLocation[]; pages: CareTypePage[] }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private recoveryCodes: Map<string, RecoveryCode>;
  private jobs: Map<string, Job>;
  private articles: Map<string, Article>;
  private articleFaqsMap: Map<string, ArticleFaq>;
  private inquiries: Map<string, Inquiry>;
  private pageMetas: Map<string, PageMeta>;
  private caregivers: Map<string, Caregiver>;
  private jobApplications: Map<string, JobApplication>;
  private intakeForms: Map<string, IntakeForm>;
  private caregiverLogs: Map<string, CaregiverLog>;
  private hipaaAcknowledgments: Map<string, HipaaAcknowledgment>;
  private leadMagnets: Map<string, LeadMagnet>;
  private referrals: Map<string, Referral>;
  private maLocationsMap: Map<string, MaLocation>;
  private careTypePagesMap: Map<string, CareTypePage>;
  private locationFaqsMap: Map<string, LocationFaq>;
  private locationReviewsMap: Map<string, LocationReview>;
  private serviceTypesMap: Map<string, ServiceType>;
  private locationServicesMap: Map<string, LocationService>;

  constructor() {
    this.users = new Map();
    this.recoveryCodes = new Map();
    this.jobs = new Map();
    this.articles = new Map();
    this.articleFaqsMap = new Map();
    this.inquiries = new Map();
    this.pageMetas = new Map();
    this.caregivers = new Map();
    this.jobApplications = new Map();
    this.intakeForms = new Map();
    this.caregiverLogs = new Map();
    this.hipaaAcknowledgments = new Map();
    this.leadMagnets = new Map();
    this.referrals = new Map();
    this.maLocationsMap = new Map();
    this.careTypePagesMap = new Map();
    this.locationFaqsMap = new Map();
    this.locationReviewsMap = new Map();
    this.serviceTypesMap = new Map();
    this.locationServicesMap = new Map();
    
    this.seedDefaultData();
  }

  private seedDefaultData() {
    const defaultPages = [
      {
        pageSlug: 'home',
        title: 'PrivateInHomeCareGiver — Compassionate In-Home Care Services in Massachusetts',
        description: 'Compassionate private in-home care services and PCA jobs across Massachusetts.',
        ogTitle: 'PrivateInHomeCareGiver — In-Home Care Services in Massachusetts',
        ogDescription: 'Compassionate private in-home care services across Massachusetts.',
        ogImageUrl: '',
        keywords: ['in-home care', 'Massachusetts', 'PCA', 'elderly care'],
        updatedAt: new Date(),
      }
    ];

    defaultPages.forEach(page => {
      const id = randomUUID();
      this.pageMetas.set(page.pageSlug, { id, ...page });
    });
    
    const defaultJobs = [
      {
        id: randomUUID(),
        title: 'Home Health Aide (HHA) - Full/Part Time',
        type: 'Full-Time',
        description: 'Provide non-medical assistance, personal care, and companionship in clients\' homes. Must have valid HHA certification.',
        requirements: 'Valid HHA certification required. CPR certified preferred. Reliable transportation needed.',
        payRange: '$22-26/hr',
        location: 'Boston, MA',
        status: 'published',
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        title: 'Personal Care Assistant (PCA)',
        type: 'Part-Time',
        description: 'Assist clients with daily living activities, personal care, and light housekeeping. Flexible hours available.',
        requirements: 'PCA certification preferred. Previous caregiving experience required.',
        payRange: '$20-24/hr',
        location: 'Cambridge, MA',
        status: 'published',
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
    
    defaultJobs.forEach(job => {
      this.jobs.set(job.id, job);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    // Defensive: validate input
    if (!id || typeof id !== 'string') {
      return undefined;
    }
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Defensive: validate input
    if (!username || typeof username !== 'string') {
      return undefined;
    }
    const normalizedUsername = username.trim().toLowerCase();
    return Array.from(this.users.values()).find(
      (user) => user?.username?.toLowerCase() === normalizedUsername,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Defensive: validate input
    if (!insertUser || !insertUser.username || !insertUser.password) {
      throw new Error("Invalid user data: username and password are required");
    }
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      passwordUpdatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<User | undefined> {
    // Defensive: validate inputs
    if (!userId || typeof userId !== 'string') {
      return undefined;
    }
    if (!hashedPassword || typeof hashedPassword !== 'string') {
      return undefined;
    }
    
    const user = this.users.get(userId);
    if (!user) {
      return undefined;
    }
    const updatedUser: User = {
      ...user,
      password: hashedPassword,
      passwordUpdatedAt: new Date()
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async createRecoveryCodes(userId: string, codeHashes: string[]): Promise<RecoveryCode[]> {
    const codes: RecoveryCode[] = [];
    for (const codeHash of codeHashes) {
      const id = randomUUID();
      const code: RecoveryCode = {
        id,
        userId,
        codeHash,
        createdAt: new Date(),
        usedAt: null
      };
      this.recoveryCodes.set(id, code);
      codes.push(code);
    }
    return codes;
  }

  async getRecoveryCodes(userId: string): Promise<RecoveryCode[]> {
    return Array.from(this.recoveryCodes.values()).filter(
      code => code.userId === userId
    );
  }

  async markRecoveryCodeUsed(userId: string, codeHash: string): Promise<boolean> {
    const code = Array.from(this.recoveryCodes.values()).find(
      c => c.userId === userId && c.codeHash === codeHash && !c.usedAt
    );
    if (!code) {
      return false;
    }
    const updatedCode: RecoveryCode = {
      ...code,
      usedAt: new Date()
    };
    this.recoveryCodes.set(code.id, updatedCode);
    return true;
  }

  async deleteRecoveryCodes(userId: string): Promise<boolean> {
    const codesToDelete = Array.from(this.recoveryCodes.values()).filter(
      code => code.userId === userId
    );
    codesToDelete.forEach(code => this.recoveryCodes.delete(code.id));
    return true;
  }

  async listJobs(status?: string): Promise<Job[]> {
    const jobs = Array.from(this.jobs.values());
    if (status) {
      return jobs.filter(j => j.status === status);
    }
    return jobs.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getJob(id: string): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async createJob(job: InsertJob): Promise<Job> {
    const id = randomUUID();
    const now = new Date();
    const newJob: Job = {
      id,
      title: job.title,
      type: job.type,
      description: job.description,
      requirements: job.requirements ?? null,
      payRange: job.payRange ?? null,
      location: job.location ?? null,
      status: job.status ?? 'draft',
      createdAt: now,
      updatedAt: now,
      publishedAt: job.status === 'published' ? now : null,
    };
    this.jobs.set(id, newJob);
    return newJob;
  }

  async updateJob(id: string, updates: UpdateJob): Promise<Job | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    
    const updated: Job = {
      ...job,
      ...updates,
      updatedAt: new Date(),
    };
    this.jobs.set(id, updated);
    return updated;
  }

  async deleteJob(id: string): Promise<boolean> {
    return this.jobs.delete(id);
  }

  async publishJob(id: string): Promise<Job | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    
    const updated: Job = {
      ...job,
      status: 'published',
      publishedAt: new Date(),
      updatedAt: new Date(),
    };
    this.jobs.set(id, updated);
    return updated;
  }

  async unpublishJob(id: string): Promise<Job | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    
    const updated: Job = {
      ...job,
      status: 'draft',
      updatedAt: new Date(),
    };
    this.jobs.set(id, updated);
    return updated;
  }

  async listArticles(status?: string): Promise<Article[]> {
    const articles = Array.from(this.articles.values());
    if (status) {
      return articles.filter(a => a.status === status);
    }
    return articles.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getArticle(id: string): Promise<Article | undefined> {
    return this.articles.get(id);
  }

  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    return Array.from(this.articles.values()).find(a => a.slug === slug);
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const id = randomUUID();
    const now = new Date();
    
    let slug: string;
    if (article.slug) {
      slug = slugify(article.slug);
    } else {
      slug = slugify(article.title);
    }
    
    const existingSlugs = Array.from(this.articles.values()).map(a => a.slug);
    slug = generateUniqueSlug(slug, existingSlugs);
    
    const newArticle: Article = {
      id,
      title: article.title,
      slug,
      excerpt: article.excerpt ?? null,
      body: article.body,
      category: article.category ?? 'Care Tips',
      heroImageUrl: article.heroImageUrl ?? null,
      metaTitle: article.metaTitle ?? null,
      metaDescription: article.metaDescription ?? null,
      keywords: article.keywords || null,
      status: article.status ?? 'draft',
      createdAt: now,
      updatedAt: now,
      publishedAt: article.status === 'published' ? now : null,
    };
    this.articles.set(id, newArticle);
    return newArticle;
  }

  async updateArticle(id: string, updates: UpdateArticle): Promise<Article | undefined> {
    const article = this.articles.get(id);
    if (!article) return undefined;
    
    let newSlug = article.slug;
    if (updates.slug) {
      newSlug = slugify(updates.slug);
      const existingSlugs = Array.from(this.articles.values())
        .filter(a => a.id !== id)
        .map(a => a.slug);
      newSlug = generateUniqueSlug(newSlug, existingSlugs);
    } else if (updates.title && updates.title !== article.title) {
      const baseSlug = slugify(updates.title);
      const existingSlugs = Array.from(this.articles.values())
        .filter(a => a.id !== id)
        .map(a => a.slug);
      newSlug = generateUniqueSlug(baseSlug, existingSlugs);
    }
    
    const updated: Article = {
      ...article,
      ...updates,
      slug: newSlug,
      updatedAt: new Date(),
    };
    this.articles.set(id, updated);
    return updated;
  }

  async deleteArticle(id: string): Promise<boolean> {
    return this.articles.delete(id);
  }

  async publishArticle(id: string): Promise<Article | undefined> {
    const article = this.articles.get(id);
    if (!article) return undefined;
    
    const updated: Article = {
      ...article,
      status: 'published',
      publishedAt: new Date(),
      updatedAt: new Date(),
    };
    this.articles.set(id, updated);
    return updated;
  }

  async unpublishArticle(id: string): Promise<Article | undefined> {
    const article = this.articles.get(id);
    if (!article) return undefined;
    
    const updated: Article = {
      ...article,
      status: 'draft',
      updatedAt: new Date(),
    };
    this.articles.set(id, updated);
    return updated;
  }

  async listArticleFaqs(articleId: string): Promise<ArticleFaq[]> {
    const faqs = Array.from(this.articleFaqsMap.values())
      .filter(f => f.articleId === articleId && f.isActive === 'yes')
      .sort((a, b) => a.displayOrder - b.displayOrder);
    return faqs;
  }

  async getArticleFaq(id: string): Promise<ArticleFaq | undefined> {
    return this.articleFaqsMap.get(id);
  }

  async createArticleFaq(faq: InsertArticleFaq): Promise<ArticleFaq> {
    const id = randomUUID();
    const now = new Date();
    const newFaq: ArticleFaq = {
      id,
      articleId: faq.articleId,
      question: faq.question,
      answer: faq.answer,
      displayOrder: faq.displayOrder ?? 0,
      isActive: faq.isActive ?? 'yes',
      createdAt: now,
      updatedAt: now,
    };
    this.articleFaqsMap.set(id, newFaq);
    return newFaq;
  }

  async updateArticleFaq(id: string, faq: UpdateArticleFaq): Promise<ArticleFaq | undefined> {
    const existing = this.articleFaqsMap.get(id);
    if (!existing) return undefined;
    const updated: ArticleFaq = {
      ...existing,
      ...faq,
      updatedAt: new Date(),
    };
    this.articleFaqsMap.set(id, updated);
    return updated;
  }

  async deleteArticleFaq(id: string): Promise<boolean> {
    return this.articleFaqsMap.delete(id);
  }

  async listInquiries(status?: string): Promise<Inquiry[]> {
    const inquiries = Array.from(this.inquiries.values());
    if (status) {
      return inquiries.filter(i => i.status === status);
    }
    return inquiries.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getInquiry(id: string): Promise<Inquiry | undefined> {
    return this.inquiries.get(id);
  }

  async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
    const id = randomUUID();
    const now = new Date();
    const agreementTimestamp = (inquiry.agreedToTerms === "yes" && inquiry.agreedToPolicy === "yes") ? now : null;
    const newInquiry: Inquiry = {
      id,
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      service: inquiry.service ?? null,
      message: inquiry.message ?? null,
      agreedToTerms: inquiry.agreedToTerms,
      agreedToPolicy: inquiry.agreedToPolicy,
      agreementTimestamp,
      status: 'pending',
      replies: null,
      createdAt: now,
      updatedAt: now,
    };
    this.inquiries.set(id, newInquiry);
    return newInquiry;
  }

  async updateInquiry(id: string, inquiry: UpdateInquiry): Promise<Inquiry | undefined> {
    const existing = this.inquiries.get(id);
    if (!existing) return undefined;
    
    const updated: Inquiry = {
      ...existing,
      ...inquiry,
      replies: inquiry.replies ?? existing.replies,
      updatedAt: new Date(),
    };
    this.inquiries.set(id, updated);
    return updated;
  }

  async updateInquiryStatus(id: string, status: string): Promise<Inquiry | undefined> {
    const inquiry = this.inquiries.get(id);
    if (!inquiry) return undefined;
    
    const updated: Inquiry = {
      ...inquiry,
      status,
      updatedAt: new Date(),
    };
    this.inquiries.set(id, updated);
    return updated;
  }

  async addInquiryReply(id: string, reply: Reply): Promise<Inquiry | undefined> {
    const inquiry = this.inquiries.get(id);
    if (!inquiry) return undefined;
    
    const replyWithMeta = {
      id: randomUUID(),
      ...reply,
      sentAt: new Date().toISOString(),
    };
    
    const updated: Inquiry = {
      ...inquiry,
      replies: [...(inquiry.replies || []), replyWithMeta],
      status: 'replied',
      updatedAt: new Date(),
    };
    this.inquiries.set(id, updated);
    return updated;
  }

  async listPageMeta(): Promise<PageMeta[]> {
    return Array.from(this.pageMetas.values()).sort((a, b) => 
      a.pageSlug.localeCompare(b.pageSlug)
    );
  }

  async getPageMeta(pageSlug: string): Promise<PageMeta | undefined> {
    return this.pageMetas.get(pageSlug);
  }

  async upsertPageMeta(meta: InsertPageMeta | UpdatePageMeta): Promise<PageMeta> {
    const existing = this.pageMetas.get(meta.pageSlug);
    
    if (existing) {
      const updated: PageMeta = {
        ...existing,
        ...meta,
        updatedAt: new Date(),
      };
      this.pageMetas.set(meta.pageSlug, updated);
      return updated;
    } else {
      const id = randomUUID();
      const insertMeta = meta as InsertPageMeta;
      const newMeta: PageMeta = {
        id,
        pageSlug: insertMeta.pageSlug,
        title: insertMeta.title,
        description: insertMeta.description ?? null,
        ogTitle: insertMeta.ogTitle ?? null,
        ogDescription: insertMeta.ogDescription ?? null,
        ogImageUrl: insertMeta.ogImageUrl ?? null,
        keywords: insertMeta.keywords || null,
        updatedAt: new Date(),
      };
      this.pageMetas.set(meta.pageSlug, newMeta);
      return newMeta;
    }
  }

  async deletePageMeta(pageSlug: string): Promise<boolean> {
    return this.pageMetas.delete(pageSlug);
  }

  async listCaregivers(filters?: { location?: string; minRate?: number; maxRate?: number; status?: string }): Promise<Caregiver[]> {
    let caregivers = Array.from(this.caregivers.values());
    
    if (filters?.location) {
      caregivers = caregivers.filter(c => 
        c.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }
    
    if (filters?.minRate !== undefined) {
      caregivers = caregivers.filter(c => c.hourlyRate >= filters.minRate!);
    }
    
    if (filters?.maxRate !== undefined) {
      caregivers = caregivers.filter(c => c.hourlyRate <= filters.maxRate!);
    }
    
    if (filters?.status) {
      caregivers = caregivers.filter(c => c.status === filters.status);
    }
    
    return caregivers.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getCaregiver(id: string): Promise<Caregiver | undefined> {
    return this.caregivers.get(id);
  }

  async createCaregiver(insertCaregiver: InsertCaregiver): Promise<Caregiver> {
    const id = randomUUID();
    const now = new Date();
    const status = insertCaregiver.status ?? 'active';
    const caregiver: Caregiver = {
      id,
      ...insertCaregiver,
      photoUrl: insertCaregiver.photoUrl ?? null,
      status,
      rating: 0,
      reviewCount: 0,
      publishedAt: status === 'active' ? now : null,
      createdAt: now,
      updatedAt: now,
    };
    this.caregivers.set(id, caregiver);
    return caregiver;
  }

  async updateCaregiver(id: string, updateCaregiver: UpdateCaregiver): Promise<Caregiver | undefined> {
    const existing = this.caregivers.get(id);
    if (!existing) return undefined;

    const updated: Caregiver = {
      ...existing,
      ...updateCaregiver,
      updatedAt: new Date(),
    };
    this.caregivers.set(id, updated);
    return updated;
  }

  async deleteCaregiver(id: string): Promise<boolean> {
    return this.caregivers.delete(id);
  }

  async publishCaregiver(id: string): Promise<Caregiver | undefined> {
    const caregiver = this.caregivers.get(id);
    if (!caregiver) return undefined;

    const updated: Caregiver = {
      ...caregiver,
      status: 'active',
      publishedAt: new Date(),
      updatedAt: new Date(),
    };
    this.caregivers.set(id, updated);
    return updated;
  }

  async unpublishCaregiver(id: string): Promise<Caregiver | undefined> {
    const caregiver = this.caregivers.get(id);
    if (!caregiver) return undefined;

    const updated: Caregiver = {
      ...caregiver,
      status: 'inactive',
      publishedAt: null,
      updatedAt: new Date(),
    };
    this.caregivers.set(id, updated);
    return updated;
  }

  async listJobApplications(jobId?: string): Promise<JobApplication[]> {
    const applications = Array.from(this.jobApplications.values());
    if (jobId) {
      return applications.filter(a => a.jobId === jobId);
    }
    return applications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getJobApplication(id: string): Promise<JobApplication | undefined> {
    return this.jobApplications.get(id);
  }

  async createJobApplication(insertApplication: Omit<InsertJobApplication, 'captchaToken'>): Promise<JobApplication> {
    const id = randomUUID();
    const now = new Date();
    const agreementTimestamp = (insertApplication.agreedToTerms === "yes" && insertApplication.agreedToPolicy === "yes") ? now : null;
    const application: JobApplication = {
      id,
      ...insertApplication,
      address: insertApplication.address ?? null,
      certificationType: insertApplication.certificationType ?? null,
      drivingStatus: insertApplication.drivingStatus ?? null,
      availability: insertApplication.availability ?? [],
      startDate: insertApplication.startDate ?? null,
      yearsExperience: insertApplication.yearsExperience ?? null,
      specialSkills: insertApplication.specialSkills ?? [],
      resumeUrl: insertApplication.resumeUrl ?? null,
      coverLetter: insertApplication.coverLetter ?? null,
      consent: insertApplication.consent ?? null,
      agreedToTerms: insertApplication.agreedToTerms,
      agreedToPolicy: insertApplication.agreedToPolicy,
      agreementTimestamp,
      status: 'pending',
      createdAt: now,
    };
    this.jobApplications.set(id, application);
    return application;
  }

  async updateJobApplicationStatus(id: string, status: string): Promise<JobApplication | undefined> {
    const application = this.jobApplications.get(id);
    if (!application) return undefined;

    const updated: JobApplication = {
      ...application,
      status,
    };
    this.jobApplications.set(id, updated);
    return updated;
  }

  async listIntakeForms(status?: string): Promise<IntakeForm[]> {
    const forms = Array.from(this.intakeForms.values());
    if (status) {
      return forms.filter(f => f.status === status);
    }
    return forms.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getIntakeForm(id: string): Promise<IntakeForm | undefined> {
    return this.intakeForms.get(id);
  }

  async createIntakeForm(form: Omit<InsertIntakeForm, 'captchaToken'>): Promise<IntakeForm> {
    const id = randomUUID();
    const now = new Date();
    const agreementTimestamp = (form.agreedToTerms === "yes" && form.agreedToPolicy === "yes") ? now : null;
    const newForm: IntakeForm = {
      id,
      ...form,
      dateOfBirth: form.dateOfBirth ?? null,
      agreedToTerms: form.agreedToTerms,
      agreedToPolicy: form.agreedToPolicy,
      agreementTimestamp,
      status: 'pending',
      reviewedAt: null,
      reviewedBy: null,
      notes: null,
      createdAt: now,
      updatedAt: now,
    };
    this.intakeForms.set(id, newForm);
    return newForm;
  }

  async updateIntakeForm(id: string, form: UpdateIntakeForm): Promise<IntakeForm | undefined> {
    const existing = this.intakeForms.get(id);
    if (!existing) return undefined;
    
    const updated: IntakeForm = {
      ...existing,
      ...form,
      updatedAt: new Date(),
    };
    this.intakeForms.set(id, updated);
    return updated;
  }

  async updateIntakeFormStatus(id: string, status: string, reviewedBy?: string): Promise<IntakeForm | undefined> {
    const form = this.intakeForms.get(id);
    if (!form) return undefined;
    
    const updated: IntakeForm = {
      ...form,
      status,
      reviewedAt: new Date(),
      reviewedBy: reviewedBy ?? null,
      updatedAt: new Date(),
    };
    this.intakeForms.set(id, updated);
    return updated;
  }

  async updateIntakeFormNotes(id: string, notes: string): Promise<IntakeForm | undefined> {
    const form = this.intakeForms.get(id);
    if (!form) return undefined;
    
    const updated: IntakeForm = {
      ...form,
      notes,
      updatedAt: new Date(),
    };
    this.intakeForms.set(id, updated);
    return updated;
  }

  async listCaregiverLogs(status?: string, clientName?: string): Promise<CaregiverLog[]> {
    const logs = Array.from(this.caregiverLogs.values());
    let filtered = logs;
    
    if (status) {
      filtered = filtered.filter(l => l.status === status);
    }
    if (clientName) {
      filtered = filtered.filter(l => l.clientName.toLowerCase().includes(clientName.toLowerCase()));
    }
    
    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getCaregiverLog(id: string): Promise<CaregiverLog | undefined> {
    return this.caregiverLogs.get(id);
  }

  async createCaregiverLog(log: Omit<InsertCaregiverLog, 'captchaToken'>): Promise<CaregiverLog> {
    const id = randomUUID();
    const now = new Date();
    const agreementTimestamp = (log.agreedToTerms === "yes" && log.agreedToPolicy === "yes") ? now : null;
    const newLog: CaregiverLog = {
      id,
      ...log,
      shiftEndTime: log.shiftEndTime ?? null,
      agreedToTerms: log.agreedToTerms,
      agreedToPolicy: log.agreedToPolicy,
      agreementTimestamp,
      status: 'submitted',
      reviewedAt: null,
      reviewedBy: null,
      notes: null,
      createdAt: now,
      updatedAt: now,
    };
    this.caregiverLogs.set(id, newLog);
    return newLog;
  }

  async updateCaregiverLog(id: string, log: UpdateCaregiverLog): Promise<CaregiverLog | undefined> {
    const existing = this.caregiverLogs.get(id);
    if (!existing) return undefined;
    
    const updated: CaregiverLog = {
      ...existing,
      ...log,
      updatedAt: new Date(),
    };
    this.caregiverLogs.set(id, updated);
    return updated;
  }

  async updateCaregiverLogStatus(id: string, status: string, reviewedBy?: string): Promise<CaregiverLog | undefined> {
    const log = this.caregiverLogs.get(id);
    if (!log) return undefined;
    
    const updated: CaregiverLog = {
      ...log,
      status,
      reviewedAt: new Date(),
      reviewedBy: reviewedBy ?? null,
      updatedAt: new Date(),
    };
    this.caregiverLogs.set(id, updated);
    return updated;
  }

  async updateCaregiverLogNotes(id: string, notes: string): Promise<CaregiverLog | undefined> {
    const log = this.caregiverLogs.get(id);
    if (!log) return undefined;
    
    const updated: CaregiverLog = {
      ...log,
      notes,
      updatedAt: new Date(),
    };
    this.caregiverLogs.set(id, updated);
    return updated;
  }

  async listHipaaAcknowledgments(status?: string): Promise<HipaaAcknowledgment[]> {
    const acknowledgments = Array.from(this.hipaaAcknowledgments.values());
    let filtered = acknowledgments;
    
    if (status) {
      filtered = filtered.filter(a => a.status === status);
    }
    
    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getHipaaAcknowledgment(id: string): Promise<HipaaAcknowledgment | undefined> {
    return this.hipaaAcknowledgments.get(id);
  }

  async createHipaaAcknowledgment(acknowledgment: Omit<InsertHipaaAcknowledgment, 'captchaToken'>): Promise<HipaaAcknowledgment> {
    const id = randomUUID();
    const now = new Date();
    const agreementTimestamp = (acknowledgment.agreedToTerms === "yes" && acknowledgment.agreedToPolicy === "yes") ? now : null;
    const newAcknowledgment: HipaaAcknowledgment = {
      id,
      ...acknowledgment,
      relationshipToClient: acknowledgment.relationshipToClient ?? null,
      clientRefused: acknowledgment.clientRefused ?? "no",
      refusalDate: acknowledgment.refusalDate ?? null,
      refusalTime: acknowledgment.refusalTime ?? null,
      staffName: acknowledgment.staffName ?? null,
      staffSignature: acknowledgment.staffSignature ?? null,
      refusalReason: acknowledgment.refusalReason ?? null,
      agreedToTerms: acknowledgment.agreedToTerms,
      agreedToPolicy: acknowledgment.agreedToPolicy,
      agreementTimestamp,
      status: 'submitted',
      reviewedAt: null,
      reviewedBy: null,
      notes: null,
      createdAt: now,
      updatedAt: now,
    };
    this.hipaaAcknowledgments.set(id, newAcknowledgment);
    return newAcknowledgment;
  }

  async updateHipaaAcknowledgment(id: string, acknowledgment: UpdateHipaaAcknowledgment): Promise<HipaaAcknowledgment | undefined> {
    const existing = this.hipaaAcknowledgments.get(id);
    if (!existing) return undefined;
    
    const updated: HipaaAcknowledgment = {
      ...existing,
      ...acknowledgment,
      updatedAt: new Date(),
    };
    this.hipaaAcknowledgments.set(id, updated);
    return updated;
  }

  async updateHipaaAcknowledgmentStatus(id: string, status: string, reviewedBy?: string): Promise<HipaaAcknowledgment | undefined> {
    const acknowledgment = this.hipaaAcknowledgments.get(id);
    if (!acknowledgment) return undefined;
    
    const updated: HipaaAcknowledgment = {
      ...acknowledgment,
      status,
      reviewedAt: new Date(),
      reviewedBy: reviewedBy ?? null,
      updatedAt: new Date(),
    };
    this.hipaaAcknowledgments.set(id, updated);
    return updated;
  }

  async updateHipaaAcknowledgmentNotes(id: string, notes: string): Promise<HipaaAcknowledgment | undefined> {
    const acknowledgment = this.hipaaAcknowledgments.get(id);
    if (!acknowledgment) return undefined;
    
    const updated: HipaaAcknowledgment = {
      ...acknowledgment,
      notes,
      updatedAt: new Date(),
    };
    this.hipaaAcknowledgments.set(id, updated);
    return updated;
  }

  async listLeadMagnets(): Promise<LeadMagnet[]> {
    return Array.from(this.leadMagnets.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getLeadMagnet(id: string): Promise<LeadMagnet | undefined> {
    return this.leadMagnets.get(id);
  }

  async createLeadMagnet(lead: Omit<InsertLeadMagnet, 'captchaToken'>): Promise<LeadMagnet> {
    const id = randomUUID();
    const now = new Date();
    const agreementTimestamp = (lead.agreedToTerms === "yes" && lead.agreedToPolicy === "yes") ? now : null;
    
    const newLead: LeadMagnet = {
      id,
      email: lead.email,
      name: lead.name ?? null,
      resourceId: lead.resourceId,
      resourceTitle: lead.resourceTitle,
      source: lead.source ?? null,
      agreedToTerms: lead.agreedToTerms,
      agreedToPolicy: lead.agreedToPolicy,
      agreementTimestamp,
      createdAt: now,
    };
    this.leadMagnets.set(id, newLead);
    return newLead;
  }

  async listReferrals(status?: string): Promise<Referral[]> {
    const referralList = Array.from(this.referrals.values());
    if (status) {
      return referralList.filter(r => r.status === status).sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return referralList.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getReferral(id: string): Promise<Referral | undefined> {
    return this.referrals.get(id);
  }

  async createReferral(referral: Omit<InsertReferral, 'captchaToken'>): Promise<Referral> {
    const id = randomUUID();
    const now = new Date();
    const trackingCode = `REF-${randomUUID().split('-')[0].toUpperCase()}`;
    const agreementTimestamp = (referral.agreedToTerms === "yes" && referral.agreedToPolicy === "yes") ? now : null;
    
    const newReferral: Referral = {
      id,
      referrerName: referral.referrerName,
      referrerEmail: referral.referrerEmail,
      referrerPhone: referral.referrerPhone,
      relationshipToReferred: referral.relationshipToReferred,
      referredName: referral.referredName,
      referredPhone: referral.referredPhone,
      referredEmail: referral.referredEmail ?? null,
      referredLocation: referral.referredLocation,
      primaryNeedForCare: referral.primaryNeedForCare,
      additionalInfo: referral.additionalInfo ?? null,
      website: referral.website ?? null,
      agreedToTerms: referral.agreedToTerms,
      agreedToPolicy: referral.agreedToPolicy,
      agreementTimestamp,
      consentToContact: referral.consentToContact,
      acknowledgedCreditTerms: referral.acknowledgedCreditTerms,
      acknowledgedComplianceTerms: referral.acknowledgedComplianceTerms,
      status: "pending",
      trackingCode,
      hoursCompleted: "0",
      creditIssued: "no",
      creditIssuedDate: null,
      notes: referral.notes ?? null,
      reviewedAt: null,
      reviewedBy: null,
      createdAt: now,
      updatedAt: now,
    };
    this.referrals.set(id, newReferral);
    return newReferral;
  }

  async updateReferral(id: string, referral: UpdateReferral): Promise<Referral | undefined> {
    const existing = this.referrals.get(id);
    if (!existing) return undefined;
    
    const updated: Referral = {
      ...existing,
      ...referral,
      updatedAt: new Date(),
    };
    this.referrals.set(id, updated);
    return updated;
  }

  async updateReferralStatus(id: string, status: string, reviewedBy?: string): Promise<Referral | undefined> {
    const referral = this.referrals.get(id);
    if (!referral) return undefined;
    
    const updated: Referral = {
      ...referral,
      status,
      reviewedAt: new Date(),
      reviewedBy: reviewedBy ?? null,
      updatedAt: new Date(),
    };
    this.referrals.set(id, updated);
    return updated;
  }

  async updateReferralNotes(id: string, notes: string): Promise<Referral | undefined> {
    const referral = this.referrals.get(id);
    if (!referral) return undefined;
    
    const updated: Referral = {
      ...referral,
      notes,
      updatedAt: new Date(),
    };
    this.referrals.set(id, updated);
    return updated;
  }

  async updateReferralTracking(id: string, hoursCompleted: string): Promise<Referral | undefined> {
    const referral = this.referrals.get(id);
    if (!referral) return undefined;
    
    const updated: Referral = {
      ...referral,
      hoursCompleted,
      updatedAt: new Date(),
    };
    this.referrals.set(id, updated);
    return updated;
  }

  async issueCreditForReferral(id: string, creditedBy: string): Promise<Referral | undefined> {
    const referral = this.referrals.get(id);
    if (!referral) return undefined;
    
    const now = new Date();
    const updated: Referral = {
      ...referral,
      creditIssued: "yes",
      creditIssuedDate: now,
      status: "credited",
      reviewedBy: creditedBy,
      reviewedAt: now,
      updatedAt: now,
    };
    this.referrals.set(id, updated);
    return updated;
  }

  // MA Care Directory - MemStorage implementations
  async listMaLocations(filters?: { county?: string; isCity?: string; isActive?: string }): Promise<MaLocation[]> {
    let locations = Array.from(this.maLocationsMap.values());
    if (filters?.county) locations = locations.filter(l => l.county === filters.county);
    if (filters?.isCity) locations = locations.filter(l => l.isCity === filters.isCity);
    if (filters?.isActive) locations = locations.filter(l => l.isActive === filters.isActive);
    return locations.sort((a, b) => a.name.localeCompare(b.name));
  }

  async getMaLocation(id: string): Promise<MaLocation | undefined> {
    return this.maLocationsMap.get(id);
  }

  async getMaLocationBySlug(slug: string): Promise<MaLocation | undefined> {
    return Array.from(this.maLocationsMap.values()).find(l => l.slug === slug);
  }

  async createMaLocation(location: InsertMaLocation): Promise<MaLocation> {
    const id = randomUUID();
    const now = new Date();
    const newLocation: MaLocation = { id, ...location, zipCodes: location.zipCodes || [], population: location.population ?? null, latitude: location.latitude ?? null, longitude: location.longitude ?? null, createdAt: now, updatedAt: now };
    this.maLocationsMap.set(id, newLocation);
    return newLocation;
  }

  async updateMaLocation(id: string, location: UpdateMaLocation): Promise<MaLocation | undefined> {
    const existing = this.maLocationsMap.get(id);
    if (!existing) return undefined;
    const updated: MaLocation = { ...existing, ...location, updatedAt: new Date() };
    this.maLocationsMap.set(id, updated);
    return updated;
  }

  async deleteMaLocation(id: string): Promise<boolean> {
    return this.maLocationsMap.delete(id);
  }

  async listCareTypePages(filters?: { locationId?: string; careType?: CareType; status?: string }): Promise<CareTypePage[]> {
    let pages = Array.from(this.careTypePagesMap.values());
    if (filters?.locationId) pages = pages.filter(p => p.locationId === filters.locationId);
    if (filters?.careType) pages = pages.filter(p => p.careType === filters.careType);
    if (filters?.status) pages = pages.filter(p => p.status === filters.status);
    return pages;
  }

  async getCareTypePage(id: string): Promise<CareTypePage | undefined> {
    return this.careTypePagesMap.get(id);
  }

  async getCareTypePageBySlug(slug: string): Promise<CareTypePage | undefined> {
    return Array.from(this.careTypePagesMap.values()).find(p => p.slug === slug);
  }

  async createCareTypePage(page: InsertCareTypePage): Promise<CareTypePage> {
    const id = randomUUID();
    const now = new Date();
    const newPage: CareTypePage = { id, ...page, keywords: page.keywords || [], servicesHighlights: page.servicesHighlights || [], heroTitle: page.heroTitle ?? null, heroSubtitle: page.heroSubtitle ?? null, overviewContent: page.overviewContent ?? null, whyChooseUsContent: page.whyChooseUsContent ?? null, localInfo: page.localInfo ?? null, ctaPhone: page.ctaPhone ?? null, metaTitle: page.metaTitle ?? null, metaDescription: page.metaDescription ?? null, aiGenerated: page.aiGenerated ?? "no", lastEditedBy: page.lastEditedBy ?? null, publishedAt: null, aiGeneratedAt: null, createdAt: now, updatedAt: now };
    this.careTypePagesMap.set(id, newPage);
    return newPage;
  }

  async updateCareTypePage(id: string, page: UpdateCareTypePage): Promise<CareTypePage | undefined> {
    const existing = this.careTypePagesMap.get(id);
    if (!existing) return undefined;
    const updated: CareTypePage = { ...existing, ...page, updatedAt: new Date() };
    this.careTypePagesMap.set(id, updated);
    return updated;
  }

  async deleteCareTypePage(id: string): Promise<boolean> {
    return this.careTypePagesMap.delete(id);
  }

  async publishCareTypePage(id: string): Promise<CareTypePage | undefined> {
    const page = this.careTypePagesMap.get(id);
    if (!page) return undefined;
    const updated: CareTypePage = { ...page, status: "published", publishedAt: new Date(), updatedAt: new Date() };
    this.careTypePagesMap.set(id, updated);
    return updated;
  }

  async unpublishCareTypePage(id: string): Promise<CareTypePage | undefined> {
    const page = this.careTypePagesMap.get(id);
    if (!page) return undefined;
    const updated: CareTypePage = { ...page, status: "draft", publishedAt: null, updatedAt: new Date() };
    this.careTypePagesMap.set(id, updated);
    return updated;
  }

  async listLocationFaqs(careTypePageId: string): Promise<LocationFaq[]> {
    return Array.from(this.locationFaqsMap.values()).filter(f => f.careTypePageId === careTypePageId).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async createLocationFaq(faq: InsertLocationFaq): Promise<LocationFaq> {
    const id = randomUUID();
    const now = new Date();
    const newFaq: LocationFaq = { id, ...faq, createdAt: now, updatedAt: now };
    this.locationFaqsMap.set(id, newFaq);
    return newFaq;
  }

  async updateLocationFaq(id: string, faq: UpdateLocationFaq): Promise<LocationFaq | undefined> {
    const existing = this.locationFaqsMap.get(id);
    if (!existing) return undefined;
    const updated: LocationFaq = { ...existing, ...faq, updatedAt: new Date() };
    this.locationFaqsMap.set(id, updated);
    return updated;
  }

  async deleteLocationFaq(id: string): Promise<boolean> {
    return this.locationFaqsMap.delete(id);
  }

  async listLocationReviews(careTypePageId: string): Promise<LocationReview[]> {
    return Array.from(this.locationReviewsMap.values()).filter(r => r.careTypePageId === careTypePageId);
  }

  async createLocationReview(review: InsertLocationReview): Promise<LocationReview> {
    const id = randomUUID();
    const now = new Date();
    const newReview: LocationReview = { id, ...review, reviewerLocation: review.reviewerLocation ?? null, reviewDate: review.reviewDate ?? null, createdAt: now, updatedAt: now };
    this.locationReviewsMap.set(id, newReview);
    return newReview;
  }

  async updateLocationReview(id: string, review: UpdateLocationReview): Promise<LocationReview | undefined> {
    const existing = this.locationReviewsMap.get(id);
    if (!existing) return undefined;
    const updated: LocationReview = { ...existing, ...review, updatedAt: new Date() };
    this.locationReviewsMap.set(id, updated);
    return updated;
  }

  async deleteLocationReview(id: string): Promise<boolean> {
    return this.locationReviewsMap.delete(id);
  }

  async listServiceTypes(category?: string): Promise<ServiceType[]> {
    let types = Array.from(this.serviceTypesMap.values());
    if (category) types = types.filter(t => t.category === category);
    return types.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async createServiceType(service: InsertServiceType): Promise<ServiceType> {
    const id = randomUUID();
    const now = new Date();
    const newService: ServiceType = { id, ...service, description: service.description ?? null, createdAt: now };
    this.serviceTypesMap.set(id, newService);
    return newService;
  }

  async searchLocations(query: string, careType?: CareType): Promise<{ locations: MaLocation[]; pages: CareTypePage[] }> {
    const q = query.toLowerCase();
    const locations = Array.from(this.maLocationsMap.values()).filter(l => 
      l.name.toLowerCase().includes(q) || 
      l.county.toLowerCase().includes(q) ||
      (l.zipCodes && l.zipCodes.some(z => z.includes(q)))
    );
    let pages = Array.from(this.careTypePagesMap.values()).filter(p => 
      locations.some(l => l.id === p.locationId) && p.status === "published"
    );
    if (careType) pages = pages.filter(p => p.careType === careType);
    return { locations, pages };
  }
}

export class DbStorage implements IStorage {
  private db: any;

  constructor(dbInstance: any) {
    this.db = dbInstance;
  }

  async getUser(id: string): Promise<User | undefined> {
    if (!id || typeof id !== 'string') {
      return undefined;
    }
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!username || typeof username !== 'string') {
      return undefined;
    }
    const normalizedUsername = username.trim().toLowerCase();
    const result = await this.db.select().from(users).where(sql`lower(${users.username}) = ${normalizedUsername}`).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!insertUser || !insertUser.username || !insertUser.password) {
      throw new Error("Invalid user data: username and password are required");
    }
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<User | undefined> {
    if (!userId || typeof userId !== 'string') {
      return undefined;
    }
    if (!hashedPassword || typeof hashedPassword !== 'string') {
      return undefined;
    }
    const result = await this.db.update(users)
      .set({ password: hashedPassword, passwordUpdatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async createRecoveryCodes(userId: string, codeHashes: string[]): Promise<RecoveryCode[]> {
    const values = codeHashes.map(codeHash => ({ userId, codeHash }));
    const result = await this.db.insert(recoveryCodes).values(values).returning();
    return result;
  }

  async getRecoveryCodes(userId: string): Promise<RecoveryCode[]> {
    return await this.db.select().from(recoveryCodes).where(eq(recoveryCodes.userId, userId));
  }

  async markRecoveryCodeUsed(userId: string, codeHash: string): Promise<boolean> {
    const result = await this.db.update(recoveryCodes)
      .set({ usedAt: new Date() })
      .where(and(
        eq(recoveryCodes.userId, userId),
        eq(recoveryCodes.codeHash, codeHash),
        isNull(recoveryCodes.usedAt)
      ))
      .returning();
    return result.length > 0;
  }

  async deleteRecoveryCodes(userId: string): Promise<boolean> {
    await this.db.delete(recoveryCodes).where(eq(recoveryCodes.userId, userId));
    return true;
  }

  async listJobs(status?: string): Promise<Job[]> {
    if (status) {
      return await this.db.select().from(jobs).where(eq(jobs.status, status)).orderBy(desc(jobs.createdAt));
    }
    return await this.db.select().from(jobs).orderBy(desc(jobs.createdAt));
  }

  async getJob(id: string): Promise<Job | undefined> {
    const result = await this.db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
    return result[0];
  }

  async createJob(job: InsertJob): Promise<Job> {
    const result = await this.db.insert(jobs).values({
      ...job,
      status: job.status ?? 'draft',
      publishedAt: job.status === 'published' ? new Date() : null,
    }).returning();
    return result[0];
  }

  async updateJob(id: string, updates: UpdateJob): Promise<Job | undefined> {
    const result = await this.db.update(jobs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(jobs.id, id))
      .returning();
    return result[0];
  }

  async deleteJob(id: string): Promise<boolean> {
    const result = await this.db.delete(jobs).where(eq(jobs.id, id)).returning();
    return result.length > 0;
  }

  async publishJob(id: string): Promise<Job | undefined> {
    const result = await this.db.update(jobs)
      .set({ status: 'published', publishedAt: new Date(), updatedAt: new Date() })
      .where(eq(jobs.id, id))
      .returning();
    return result[0];
  }

  async unpublishJob(id: string): Promise<Job | undefined> {
    const result = await this.db.update(jobs)
      .set({ status: 'draft', updatedAt: new Date() })
      .where(eq(jobs.id, id))
      .returning();
    return result[0];
  }

  async listArticles(status?: string): Promise<Article[]> {
    if (status) {
      return await this.db.select().from(articles).where(eq(articles.status, status)).orderBy(desc(articles.createdAt));
    }
    return await this.db.select().from(articles).orderBy(desc(articles.createdAt));
  }

  async getArticle(id: string): Promise<Article | undefined> {
    const result = await this.db.select().from(articles).where(eq(articles.id, id)).limit(1);
    return result[0];
  }

  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    const result = await this.db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
    return result[0];
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    let slug: string;
    if (article.slug) {
      slug = slugify(article.slug);
    } else {
      slug = slugify(article.title);
    }
    
    const existingArticles = await this.db.select({ slug: articles.slug }).from(articles);
    const existingSlugs = existingArticles.map(a => a.slug);
    slug = generateUniqueSlug(slug, existingSlugs);
    
    const result = await this.db.insert(articles).values({
      ...article,
      slug,
      status: article.status ?? 'draft',
      publishedAt: article.status === 'published' ? new Date() : null,
    }).returning();
    return result[0];
  }

  async updateArticle(id: string, updates: UpdateArticle): Promise<Article | undefined> {
    const existing = await this.getArticle(id);
    if (!existing) return undefined;
    
    let newSlug = existing.slug;
    if (updates.slug) {
      newSlug = slugify(updates.slug);
      const existingArticles = await this.db.select({ slug: articles.slug }).from(articles).where(sql`${articles.id} != ${id}`);
      const existingSlugs = existingArticles.map(a => a.slug);
      newSlug = generateUniqueSlug(newSlug, existingSlugs);
    } else if (updates.title && updates.title !== existing.title) {
      const baseSlug = slugify(updates.title);
      const existingArticles = await this.db.select({ slug: articles.slug }).from(articles).where(sql`${articles.id} != ${id}`);
      const existingSlugs = existingArticles.map(a => a.slug);
      newSlug = generateUniqueSlug(baseSlug, existingSlugs);
    }
    
    const result = await this.db.update(articles)
      .set({ ...updates, slug: newSlug, updatedAt: new Date() })
      .where(eq(articles.id, id))
      .returning();
    return result[0];
  }

  async deleteArticle(id: string): Promise<boolean> {
    const result = await this.db.delete(articles).where(eq(articles.id, id)).returning();
    return result.length > 0;
  }

  async publishArticle(id: string): Promise<Article | undefined> {
    const result = await this.db.update(articles)
      .set({ status: 'published', publishedAt: new Date(), updatedAt: new Date() })
      .where(eq(articles.id, id))
      .returning();
    return result[0];
  }

  async unpublishArticle(id: string): Promise<Article | undefined> {
    const result = await this.db.update(articles)
      .set({ status: 'draft', updatedAt: new Date() })
      .where(eq(articles.id, id))
      .returning();
    return result[0];
  }

  async listArticleFaqs(articleId: string): Promise<ArticleFaq[]> {
    return await this.db.select().from(articleFaqs)
      .where(and(eq(articleFaqs.articleId, articleId), eq(articleFaqs.isActive, 'yes')))
      .orderBy(articleFaqs.displayOrder);
  }

  async getArticleFaq(id: string): Promise<ArticleFaq | undefined> {
    const result = await this.db.select().from(articleFaqs).where(eq(articleFaqs.id, id)).limit(1);
    return result[0];
  }

  async createArticleFaq(faq: InsertArticleFaq): Promise<ArticleFaq> {
    const result = await this.db.insert(articleFaqs).values({
      ...faq,
      isActive: faq.isActive ?? 'yes',
      displayOrder: faq.displayOrder ?? 0,
    }).returning();
    return result[0];
  }

  async updateArticleFaq(id: string, faq: UpdateArticleFaq): Promise<ArticleFaq | undefined> {
    const result = await this.db.update(articleFaqs)
      .set({ ...faq, updatedAt: new Date() })
      .where(eq(articleFaqs.id, id))
      .returning();
    return result[0];
  }

  async deleteArticleFaq(id: string): Promise<boolean> {
    const result = await this.db.delete(articleFaqs).where(eq(articleFaqs.id, id)).returning();
    return result.length > 0;
  }

  async listInquiries(status?: string): Promise<Inquiry[]> {
    if (status) {
      return await this.db.select().from(inquiries).where(eq(inquiries.status, status)).orderBy(desc(inquiries.createdAt));
    }
    return await this.db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
  }

  async getInquiry(id: string): Promise<Inquiry | undefined> {
    const result = await this.db.select().from(inquiries).where(eq(inquiries.id, id)).limit(1);
    return result[0];
  }

  async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
    const agreementTimestamp = (inquiry.agreedToTerms === "yes" && inquiry.agreedToPolicy === "yes") ? new Date() : null;
    const result = await this.db.insert(inquiries).values({
      ...inquiry,
      agreementTimestamp,
      status: 'pending',
    }).returning();
    return result[0];
  }

  async updateInquiry(id: string, updates: UpdateInquiry): Promise<Inquiry | undefined> {
    const result = await this.db.update(inquiries)
      .set({ ...updates, updatedAt: new Date() } as any)
      .where(eq(inquiries.id, id))
      .returning();
    return result[0];
  }

  async updateInquiryStatus(id: string, status: string): Promise<Inquiry | undefined> {
    const result = await this.db.update(inquiries)
      .set({ status, updatedAt: new Date() })
      .where(eq(inquiries.id, id))
      .returning();
    return result[0];
  }

  async addInquiryReply(id: string, reply: Reply): Promise<Inquiry | undefined> {
    const existing = await this.getInquiry(id);
    if (!existing) return undefined;
    
    const replyWithMeta = {
      id: randomUUID(),
      ...reply,
      sentAt: new Date().toISOString(),
    };
    
    const currentReplies = existing.replies || [];
    const newReplies = [...currentReplies, replyWithMeta];
    
    const result = await this.db.update(inquiries)
      .set({ replies: newReplies as any, status: 'replied', updatedAt: new Date() })
      .where(eq(inquiries.id, id))
      .returning();
    return result[0];
  }

  async listPageMeta(): Promise<PageMeta[]> {
    return await this.db.select().from(pageMeta).orderBy(pageMeta.pageSlug);
  }

  async getPageMeta(pageSlug: string): Promise<PageMeta | undefined> {
    const result = await this.db.select().from(pageMeta).where(eq(pageMeta.pageSlug, pageSlug)).limit(1);
    return result[0];
  }

  async upsertPageMeta(meta: InsertPageMeta | UpdatePageMeta): Promise<PageMeta> {
    const result = await this.db.insert(pageMeta)
      .values(meta as InsertPageMeta)
      .onConflictDoUpdate({
        target: pageMeta.pageSlug,
        set: { 
          ...meta, 
          updatedAt: new Date() 
        }
      })
      .returning();
    return result[0];
  }

  async deletePageMeta(pageSlug: string): Promise<boolean> {
    const result = await this.db.delete(pageMeta).where(eq(pageMeta.pageSlug, pageSlug)).returning();
    return result.length > 0;
  }

  async listCaregivers(filters?: { location?: string; minRate?: number; maxRate?: number; status?: string }): Promise<Caregiver[]> {
    const conditions = [];
    
    if (filters?.location) {
      conditions.push(sql`lower(${caregivers.location}) like lower(${'%' + filters.location + '%'})`);
    }
    
    if (filters?.minRate !== undefined) {
      conditions.push(gte(caregivers.hourlyRate, filters.minRate));
    }
    
    if (filters?.maxRate !== undefined) {
      conditions.push(lte(caregivers.hourlyRate, filters.maxRate));
    }
    
    if (filters?.status) {
      conditions.push(eq(caregivers.status, filters.status));
    }
    
    if (conditions.length > 0) {
      return await this.db.select().from(caregivers).where(and(...conditions)).orderBy(desc(caregivers.createdAt));
    }
    
    return await this.db.select().from(caregivers).orderBy(desc(caregivers.createdAt));
  }

  async getCaregiver(id: string): Promise<Caregiver | undefined> {
    const result = await this.db.select().from(caregivers).where(eq(caregivers.id, id)).limit(1);
    return result[0];
  }

  async createCaregiver(insertCaregiver: InsertCaregiver): Promise<Caregiver> {
    const status = insertCaregiver.status ?? 'active';
    const result = await this.db.insert(caregivers).values({
      ...insertCaregiver,
      status,
      rating: 0,
      reviewCount: 0,
      publishedAt: status === 'active' ? new Date() : null,
    }).returning();
    return result[0];
  }

  async updateCaregiver(id: string, updateCaregiver: UpdateCaregiver): Promise<Caregiver | undefined> {
    const result = await this.db.update(caregivers)
      .set({ ...updateCaregiver, updatedAt: new Date() })
      .where(eq(caregivers.id, id))
      .returning();
    return result[0];
  }

  async deleteCaregiver(id: string): Promise<boolean> {
    const result = await this.db.delete(caregivers).where(eq(caregivers.id, id)).returning();
    return result.length > 0;
  }

  async publishCaregiver(id: string): Promise<Caregiver | undefined> {
    const result = await this.db.update(caregivers)
      .set({ status: 'active', publishedAt: new Date(), updatedAt: new Date() })
      .where(eq(caregivers.id, id))
      .returning();
    return result[0];
  }

  async unpublishCaregiver(id: string): Promise<Caregiver | undefined> {
    const result = await this.db.update(caregivers)
      .set({ status: 'inactive', publishedAt: null, updatedAt: new Date() })
      .where(eq(caregivers.id, id))
      .returning();
    return result[0];
  }

  async listJobApplications(jobId?: string): Promise<JobApplication[]> {
    if (jobId) {
      return await this.db.select().from(jobApplications).where(eq(jobApplications.jobId, jobId)).orderBy(desc(jobApplications.createdAt));
    }
    return await this.db.select().from(jobApplications).orderBy(desc(jobApplications.createdAt));
  }

  async getJobApplication(id: string): Promise<JobApplication | undefined> {
    const result = await this.db.select().from(jobApplications).where(eq(jobApplications.id, id)).limit(1);
    return result[0];
  }

  async createJobApplication(insertApplication: Omit<InsertJobApplication, 'captchaToken'>): Promise<JobApplication> {
    const agreementTimestamp = (insertApplication.agreedToTerms === "yes" && insertApplication.agreedToPolicy === "yes") ? new Date() : null;
    const result = await this.db.insert(jobApplications).values({
      ...insertApplication,
      agreementTimestamp,
      status: 'pending',
    }).returning();
    return result[0];
  }

  async updateJobApplicationStatus(id: string, status: string): Promise<JobApplication | undefined> {
    const result = await this.db.update(jobApplications)
      .set({ status })
      .where(eq(jobApplications.id, id))
      .returning();
    return result[0];
  }

  async listIntakeForms(status?: string): Promise<IntakeForm[]> {
    if (status) {
      return await this.db.select().from(intakeForms).where(eq(intakeForms.status, status)).orderBy(desc(intakeForms.createdAt));
    }
    return await this.db.select().from(intakeForms).orderBy(desc(intakeForms.createdAt));
  }

  async getIntakeForm(id: string): Promise<IntakeForm | undefined> {
    const result = await this.db.select().from(intakeForms).where(eq(intakeForms.id, id)).limit(1);
    return result[0];
  }

  async createIntakeForm(form: Omit<InsertIntakeForm, 'captchaToken'>): Promise<IntakeForm> {
    const agreementTimestamp = (form.agreedToTerms === "yes" && form.agreedToPolicy === "yes") ? new Date() : null;
    const result = await this.db.insert(intakeForms).values({
      ...form,
      agreementTimestamp,
      status: 'pending',
    }).returning();
    return result[0];
  }

  async updateIntakeForm(id: string, form: UpdateIntakeForm): Promise<IntakeForm | undefined> {
    const result = await this.db.update(intakeForms)
      .set({ ...form, updatedAt: new Date() })
      .where(eq(intakeForms.id, id))
      .returning();
    return result[0];
  }

  async updateIntakeFormStatus(id: string, status: string, reviewedBy?: string): Promise<IntakeForm | undefined> {
    const result = await this.db.update(intakeForms)
      .set({ 
        status, 
        reviewedAt: new Date(), 
        reviewedBy: reviewedBy ?? null,
        updatedAt: new Date() 
      })
      .where(eq(intakeForms.id, id))
      .returning();
    return result[0];
  }

  async updateIntakeFormNotes(id: string, notes: string): Promise<IntakeForm | undefined> {
    const result = await this.db.update(intakeForms)
      .set({ notes, updatedAt: new Date() })
      .where(eq(intakeForms.id, id))
      .returning();
    return result[0];
  }

  async listCaregiverLogs(status?: string, clientName?: string): Promise<CaregiverLog[]> {
    const conditions = [];
    
    if (status) {
      conditions.push(eq(caregiverLogs.status, status));
    }
    
    if (clientName) {
      conditions.push(sql`lower(${caregiverLogs.clientName}) like lower(${'%' + clientName + '%'})`);
    }
    
    if (conditions.length > 0) {
      return await this.db.select().from(caregiverLogs).where(and(...conditions)).orderBy(desc(caregiverLogs.createdAt));
    }
    
    return await this.db.select().from(caregiverLogs).orderBy(desc(caregiverLogs.createdAt));
  }

  async getCaregiverLog(id: string): Promise<CaregiverLog | undefined> {
    const result = await this.db.select().from(caregiverLogs).where(eq(caregiverLogs.id, id)).limit(1);
    return result[0];
  }

  async createCaregiverLog(log: Omit<InsertCaregiverLog, 'captchaToken'>): Promise<CaregiverLog> {
    const agreementTimestamp = (log.agreedToTerms === "yes" && log.agreedToPolicy === "yes") ? new Date() : null;
    const result = await this.db.insert(caregiverLogs).values({
      ...log,
      agreementTimestamp,
      status: 'submitted',
    }).returning();
    return result[0];
  }

  async updateCaregiverLog(id: string, log: UpdateCaregiverLog): Promise<CaregiverLog | undefined> {
    const result = await this.db.update(caregiverLogs)
      .set({ ...log, updatedAt: new Date() })
      .where(eq(caregiverLogs.id, id))
      .returning();
    return result[0];
  }

  async updateCaregiverLogStatus(id: string, status: string, reviewedBy?: string): Promise<CaregiverLog | undefined> {
    const result = await this.db.update(caregiverLogs)
      .set({ 
        status, 
        reviewedAt: new Date(), 
        reviewedBy: reviewedBy ?? null,
        updatedAt: new Date() 
      })
      .where(eq(caregiverLogs.id, id))
      .returning();
    return result[0];
  }

  async updateCaregiverLogNotes(id: string, notes: string): Promise<CaregiverLog | undefined> {
    const result = await this.db.update(caregiverLogs)
      .set({ notes, updatedAt: new Date() })
      .where(eq(caregiverLogs.id, id))
      .returning();
    return result[0];
  }

  async listHipaaAcknowledgments(status?: string): Promise<HipaaAcknowledgment[]> {
    if (status) {
      return await this.db.select().from(hipaaAcknowledgments).where(eq(hipaaAcknowledgments.status, status)).orderBy(desc(hipaaAcknowledgments.createdAt));
    }
    return await this.db.select().from(hipaaAcknowledgments).orderBy(desc(hipaaAcknowledgments.createdAt));
  }

  async getHipaaAcknowledgment(id: string): Promise<HipaaAcknowledgment | undefined> {
    const result = await this.db.select().from(hipaaAcknowledgments).where(eq(hipaaAcknowledgments.id, id)).limit(1);
    return result[0];
  }

  async createHipaaAcknowledgment(acknowledgment: Omit<InsertHipaaAcknowledgment, 'captchaToken'>): Promise<HipaaAcknowledgment> {
    const agreementTimestamp = (acknowledgment.agreedToTerms === "yes" && acknowledgment.agreedToPolicy === "yes") ? new Date() : null;
    const result = await this.db.insert(hipaaAcknowledgments).values({
      ...acknowledgment,
      agreementTimestamp,
      status: 'submitted',
    }).returning();
    return result[0];
  }

  async updateHipaaAcknowledgment(id: string, acknowledgment: UpdateHipaaAcknowledgment): Promise<HipaaAcknowledgment | undefined> {
    const result = await this.db.update(hipaaAcknowledgments)
      .set({ ...acknowledgment, updatedAt: new Date() })
      .where(eq(hipaaAcknowledgments.id, id))
      .returning();
    return result[0];
  }

  async updateHipaaAcknowledgmentStatus(id: string, status: string, reviewedBy?: string): Promise<HipaaAcknowledgment | undefined> {
    const result = await this.db.update(hipaaAcknowledgments)
      .set({ 
        status, 
        reviewedAt: new Date(), 
        reviewedBy: reviewedBy ?? null,
        updatedAt: new Date() 
      })
      .where(eq(hipaaAcknowledgments.id, id))
      .returning();
    return result[0];
  }

  async updateHipaaAcknowledgmentNotes(id: string, notes: string): Promise<HipaaAcknowledgment | undefined> {
    const result = await this.db.update(hipaaAcknowledgments)
      .set({ notes, updatedAt: new Date() })
      .where(eq(hipaaAcknowledgments.id, id))
      .returning();
    return result[0];
  }

  async listLeadMagnets(): Promise<LeadMagnet[]> {
    return await this.db.select().from(leadMagnets).orderBy(desc(leadMagnets.createdAt));
  }

  async getLeadMagnet(id: string): Promise<LeadMagnet | undefined> {
    const result = await this.db.select().from(leadMagnets).where(eq(leadMagnets.id, id)).limit(1);
    return result[0];
  }

  async createLeadMagnet(lead: Omit<InsertLeadMagnet, 'captchaToken'>): Promise<LeadMagnet> {
    const agreementTimestamp = (lead.agreedToTerms === "yes" && lead.agreedToPolicy === "yes") ? new Date() : null;
    const result = await this.db.insert(leadMagnets)
      .values({
        email: lead.email,
        name: lead.name ?? null,
        resourceId: lead.resourceId,
        resourceTitle: lead.resourceTitle,
        source: lead.source ?? null,
        agreedToTerms: lead.agreedToTerms,
        agreedToPolicy: lead.agreedToPolicy,
        agreementTimestamp,
      })
      .returning();
    return result[0];
  }

  async listReferrals(status?: string): Promise<Referral[]> {
    if (status) {
      return await this.db.select().from(referrals)
        .where(eq(referrals.status, status))
        .orderBy(desc(referrals.createdAt));
    }
    return await this.db.select().from(referrals).orderBy(desc(referrals.createdAt));
  }

  async getReferral(id: string): Promise<Referral | undefined> {
    const result = await this.db.select().from(referrals).where(eq(referrals.id, id)).limit(1);
    return result[0];
  }

  async createReferral(referral: Omit<InsertReferral, 'captchaToken'>): Promise<Referral> {
    const trackingCode = `REF-${randomUUID().split('-')[0].toUpperCase()}`;
    const agreementTimestamp = (referral.agreedToTerms === "yes" && referral.agreedToPolicy === "yes") ? new Date() : null;
    
    const result = await this.db.insert(referrals)
      .values({
        referrerName: referral.referrerName,
        referrerEmail: referral.referrerEmail,
        referrerPhone: referral.referrerPhone,
        relationshipToReferred: referral.relationshipToReferred,
        referredName: referral.referredName,
        referredPhone: referral.referredPhone,
        referredEmail: referral.referredEmail ?? null,
        referredLocation: referral.referredLocation,
        primaryNeedForCare: referral.primaryNeedForCare,
        additionalInfo: referral.additionalInfo ?? null,
        website: referral.website ?? null,
        agreedToTerms: referral.agreedToTerms,
        agreedToPolicy: referral.agreedToPolicy,
        agreementTimestamp,
        consentToContact: referral.consentToContact,
        acknowledgedCreditTerms: referral.acknowledgedCreditTerms,
        acknowledgedComplianceTerms: referral.acknowledgedComplianceTerms,
        trackingCode,
      })
      .returning();
    return result[0];
  }

  async updateReferral(id: string, referral: UpdateReferral): Promise<Referral | undefined> {
    const result = await this.db.update(referrals)
      .set({ ...referral, updatedAt: new Date() })
      .where(eq(referrals.id, id))
      .returning();
    return result[0];
  }

  async updateReferralStatus(id: string, status: string, reviewedBy?: string): Promise<Referral | undefined> {
    const result = await this.db.update(referrals)
      .set({ 
        status,
        reviewedAt: new Date(),
        reviewedBy: reviewedBy ?? null,
        updatedAt: new Date()
      })
      .where(eq(referrals.id, id))
      .returning();
    return result[0];
  }

  async updateReferralNotes(id: string, notes: string): Promise<Referral | undefined> {
    const result = await this.db.update(referrals)
      .set({ notes, updatedAt: new Date() })
      .where(eq(referrals.id, id))
      .returning();
    return result[0];
  }

  async updateReferralTracking(id: string, hoursCompleted: string): Promise<Referral | undefined> {
    const result = await this.db.update(referrals)
      .set({ hoursCompleted, updatedAt: new Date() })
      .where(eq(referrals.id, id))
      .returning();
    return result[0];
  }

  async issueCreditForReferral(id: string, creditedBy: string): Promise<Referral | undefined> {
    const now = new Date();
    const result = await this.db.update(referrals)
      .set({ 
        creditIssued: "yes",
        creditIssuedDate: now,
        status: "credited",
        reviewedBy: creditedBy,
        reviewedAt: now,
        updatedAt: now
      })
      .where(eq(referrals.id, id))
      .returning();
    return result[0];
  }

  // MA Care Directory - DbStorage implementations
  async listMaLocations(filters?: { county?: string; isCity?: string; isActive?: string }): Promise<MaLocation[]> {
    const conditions = [];
    if (filters?.county) conditions.push(eq(maLocations.county, filters.county));
    if (filters?.isCity) conditions.push(eq(maLocations.isCity, filters.isCity));
    if (filters?.isActive) conditions.push(eq(maLocations.isActive, filters.isActive));
    if (conditions.length > 0) {
      return await this.db.select().from(maLocations).where(and(...conditions)).orderBy(maLocations.name);
    }
    return await this.db.select().from(maLocations).orderBy(maLocations.name);
  }

  async getMaLocation(id: string): Promise<MaLocation | undefined> {
    const result = await this.db.select().from(maLocations).where(eq(maLocations.id, id)).limit(1);
    return result[0];
  }

  async getMaLocationBySlug(slug: string): Promise<MaLocation | undefined> {
    const result = await this.db.select().from(maLocations).where(eq(maLocations.slug, slug)).limit(1);
    return result[0];
  }

  async createMaLocation(location: InsertMaLocation): Promise<MaLocation> {
    const result = await this.db.insert(maLocations).values(location).returning();
    return result[0];
  }

  async updateMaLocation(id: string, location: UpdateMaLocation): Promise<MaLocation | undefined> {
    const result = await this.db.update(maLocations).set({ ...location, updatedAt: new Date() }).where(eq(maLocations.id, id)).returning();
    return result[0];
  }

  async deleteMaLocation(id: string): Promise<boolean> {
    const result = await this.db.delete(maLocations).where(eq(maLocations.id, id)).returning();
    return result.length > 0;
  }

  async listCareTypePages(filters?: { locationId?: string; careType?: CareType; status?: string }): Promise<CareTypePage[]> {
    const conditions = [];
    if (filters?.locationId) conditions.push(eq(careTypePages.locationId, filters.locationId));
    if (filters?.careType) conditions.push(eq(careTypePages.careType, filters.careType));
    if (filters?.status) conditions.push(eq(careTypePages.status, filters.status));
    if (conditions.length > 0) {
      return await this.db.select().from(careTypePages).where(and(...conditions));
    }
    return await this.db.select().from(careTypePages);
  }

  async getCareTypePage(id: string): Promise<CareTypePage | undefined> {
    const result = await this.db.select().from(careTypePages).where(eq(careTypePages.id, id)).limit(1);
    return result[0];
  }

  async getCareTypePageBySlug(slug: string): Promise<CareTypePage | undefined> {
    const result = await this.db.select().from(careTypePages).where(eq(careTypePages.slug, slug)).limit(1);
    return result[0];
  }

  async createCareTypePage(page: InsertCareTypePage): Promise<CareTypePage> {
    const result = await this.db.insert(careTypePages).values(page).returning();
    return result[0];
  }

  async updateCareTypePage(id: string, page: UpdateCareTypePage): Promise<CareTypePage | undefined> {
    const result = await this.db.update(careTypePages).set({ ...page, updatedAt: new Date() }).where(eq(careTypePages.id, id)).returning();
    return result[0];
  }

  async deleteCareTypePage(id: string): Promise<boolean> {
    const result = await this.db.delete(careTypePages).where(eq(careTypePages.id, id)).returning();
    return result.length > 0;
  }

  async publishCareTypePage(id: string): Promise<CareTypePage | undefined> {
    const result = await this.db.update(careTypePages).set({ status: "published", publishedAt: new Date(), updatedAt: new Date() }).where(eq(careTypePages.id, id)).returning();
    return result[0];
  }

  async unpublishCareTypePage(id: string): Promise<CareTypePage | undefined> {
    const result = await this.db.update(careTypePages).set({ status: "draft", publishedAt: null, updatedAt: new Date() }).where(eq(careTypePages.id, id)).returning();
    return result[0];
  }

  async listLocationFaqs(careTypePageId: string): Promise<LocationFaq[]> {
    return await this.db.select().from(locationFaqs).where(eq(locationFaqs.careTypePageId, careTypePageId)).orderBy(locationFaqs.sortOrder);
  }

  async createLocationFaq(faq: InsertLocationFaq): Promise<LocationFaq> {
    const result = await this.db.insert(locationFaqs).values(faq).returning();
    return result[0];
  }

  async updateLocationFaq(id: string, faq: UpdateLocationFaq): Promise<LocationFaq | undefined> {
    const result = await this.db.update(locationFaqs).set({ ...faq, updatedAt: new Date() }).where(eq(locationFaqs.id, id)).returning();
    return result[0];
  }

  async deleteLocationFaq(id: string): Promise<boolean> {
    const result = await this.db.delete(locationFaqs).where(eq(locationFaqs.id, id)).returning();
    return result.length > 0;
  }

  async listLocationReviews(careTypePageId: string): Promise<LocationReview[]> {
    return await this.db.select().from(locationReviews).where(eq(locationReviews.careTypePageId, careTypePageId));
  }

  async createLocationReview(review: InsertLocationReview): Promise<LocationReview> {
    const result = await this.db.insert(locationReviews).values(review).returning();
    return result[0];
  }

  async updateLocationReview(id: string, review: UpdateLocationReview): Promise<LocationReview | undefined> {
    const result = await this.db.update(locationReviews).set({ ...review, updatedAt: new Date() }).where(eq(locationReviews.id, id)).returning();
    return result[0];
  }

  async deleteLocationReview(id: string): Promise<boolean> {
    const result = await this.db.delete(locationReviews).where(eq(locationReviews.id, id)).returning();
    return result.length > 0;
  }

  async listServiceTypes(category?: string): Promise<ServiceType[]> {
    if (category) {
      return await this.db.select().from(serviceTypes).where(eq(serviceTypes.category, category)).orderBy(serviceTypes.sortOrder);
    }
    return await this.db.select().from(serviceTypes).orderBy(serviceTypes.sortOrder);
  }

  async createServiceType(service: InsertServiceType): Promise<ServiceType> {
    const result = await this.db.insert(serviceTypes).values(service).returning();
    return result[0];
  }

  async searchLocations(query: string, careType?: CareType): Promise<{ locations: MaLocation[]; pages: CareTypePage[] }> {
    const q = `%${query.toLowerCase()}%`;
    const locations = await this.db.select().from(maLocations).where(
      or(
        sql`lower(${maLocations.name}) like ${q}`,
        sql`lower(${maLocations.county}) like ${q}`
      )
    );
    
    const locationIds = locations.map((l: MaLocation) => l.id);
    if (locationIds.length === 0) return { locations: [], pages: [] };
    
    let pagesQuery = this.db.select().from(careTypePages).where(
      and(
        sql`${careTypePages.locationId} = ANY(${locationIds})`,
        eq(careTypePages.status, "published")
      )
    );
    
    if (careType) {
      pagesQuery = pagesQuery.where(eq(careTypePages.careType, careType));
    }
    
    const pages = await pagesQuery;
    return { locations, pages };
  }
}

// Development: Use MemStorage (in-memory) for Replit
// Production: Switch to DbStorage when deploying to Digital Ocean with DATABASE_URL
// Uncomment the following lines for production with PostgreSQL:
const { db } = await import("./db");
export const storage = new DbStorage(db);

// export const storage = new MemStorage();
// const { db } = await import("./db");
