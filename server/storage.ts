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
  type CityFaq, type InsertCityFaq, type UpdateCityFaq,
  type ServiceType, type InsertServiceType,
  type LocationService, type InsertLocationService,
  type CareType,
  type Video, type InsertVideo, type UpdateVideo,
  type Podcast, type InsertPodcast, type UpdatePodcast,
  type Facility, type InsertFacility, type UpdateFacility,
  type FacilityReview, type InsertFacilityReview, type UpdateFacilityReview,
  type FacilityFaq, type InsertFacilityFaq, type UpdateFacilityFaq,
  type QuizDefinition, type InsertQuizDefinition, type UpdateQuizDefinition,
  type QuizQuestion, type InsertQuizQuestion, type UpdateQuizQuestion,
  type QuizLead, type InsertQuizLead, type UpdateQuizLead,
  type QuizResponse, type InsertQuizResponse,
  type QuizWithQuestions, type QuizLeadWithResponses,
  type PageView, type InsertPageView,
  type MediaEvent, type InsertMediaEvent,
  type NonSolicitationAgreement, type InsertNonSolicitation, type UpdateNonSolicitation,
  type InitialAssessment, type InsertInitialAssessment, type UpdateInitialAssessment,
  type ClientIntake, type InsertClientIntake, type UpdateClientIntake,
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
  locationServices,
  cityFaqs,
  videos,
  podcasts,
  facilities,
  facilityReviews,
  facilityFaqs,
  quizDefinitions,
  quizQuestions,
  quizLeads,
  quizResponses,
  pageViews,
  mediaEvents,
  nonSolicitationAgreements,
  initialAssessments,
  clientIntakes
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
  getCareTypePageByCareTypeAndCity(careType: string, citySlug: string): Promise<{ page: CareTypePage; location: MaLocation; faqs: LocationFaq[]; reviews: LocationReview[] } | undefined>;
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
  
  // City FAQs (directly linked to locations)
  listCityFaqs(locationId: string): Promise<CityFaq[]>;
  getCityFaqsBySlug(slug: string): Promise<CityFaq[]>;
  createCityFaq(faq: InsertCityFaq): Promise<CityFaq>;
  updateCityFaq(id: string, faq: UpdateCityFaq): Promise<CityFaq | undefined>;
  deleteCityFaq(id: string): Promise<boolean>;
  
  // Location enrichment
  enrichLocationWithPlaces(id: string, data: { heroImageUrl?: string; galleryImages?: string[]; googlePlaceId?: string }): Promise<MaLocation | undefined>;
  
  listServiceTypes(category?: string): Promise<ServiceType[]>;
  createServiceType(service: InsertServiceType): Promise<ServiceType>;
  
  searchLocations(query: string, careType?: CareType): Promise<{ locations: MaLocation[]; pages: CareTypePage[] }>;
  
  // Videos
  listVideos(status?: string, category?: string): Promise<Video[]>;
  getVideo(id: string): Promise<Video | undefined>;
  getVideoBySlug(slug: string): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: string, video: UpdateVideo): Promise<Video | undefined>;
  deleteVideo(id: string): Promise<boolean>;
  publishVideo(id: string): Promise<Video | undefined>;
  unpublishVideo(id: string): Promise<Video | undefined>;
  incrementVideoViews(id: string): Promise<Video | undefined>;
  
  // Podcasts
  listPodcasts(status?: string, category?: string): Promise<Podcast[]>;
  getPodcast(id: string): Promise<Podcast | undefined>;
  getPodcastBySlug(slug: string): Promise<Podcast | undefined>;
  createPodcast(podcast: InsertPodcast): Promise<Podcast>;
  updatePodcast(id: string, podcast: UpdatePodcast): Promise<Podcast | undefined>;
  deletePodcast(id: string): Promise<boolean>;
  publishPodcast(id: string): Promise<Podcast | undefined>;
  unpublishPodcast(id: string): Promise<Podcast | undefined>;
  incrementPodcastPlays(id: string): Promise<Podcast | undefined>;
  
  // Facilities
  listFacilities(filters?: { facilityType?: string; city?: string; county?: string; status?: string; featured?: string }): Promise<Facility[]>;
  getFacility(id: string): Promise<Facility | undefined>;
  getFacilityBySlug(slug: string): Promise<Facility | undefined>;
  createFacility(facility: InsertFacility): Promise<Facility>;
  updateFacility(id: string, facility: UpdateFacility): Promise<Facility | undefined>;
  deleteFacility(id: string): Promise<boolean>;
  publishFacility(id: string): Promise<Facility | undefined>;
  unpublishFacility(id: string): Promise<Facility | undefined>;
  searchFacilities(query: string, facilityType?: string): Promise<Facility[]>;
  
  // Facility Reviews
  listFacilityReviews(facilityId: string, status?: string): Promise<FacilityReview[]>;
  getFacilityReview(id: string): Promise<FacilityReview | undefined>;
  createFacilityReview(review: InsertFacilityReview): Promise<FacilityReview>;
  updateFacilityReview(id: string, review: UpdateFacilityReview): Promise<FacilityReview | undefined>;
  deleteFacilityReview(id: string): Promise<boolean>;
  approveFacilityReview(id: string): Promise<FacilityReview | undefined>;
  rejectFacilityReview(id: string): Promise<FacilityReview | undefined>;
  
  // Facility FAQs
  listFacilityFaqs(facilityId: string): Promise<FacilityFaq[]>;
  getFacilityFaq(id: string): Promise<FacilityFaq | undefined>;
  createFacilityFaq(faq: InsertFacilityFaq): Promise<FacilityFaq>;
  updateFacilityFaq(id: string, faq: UpdateFacilityFaq): Promise<FacilityFaq | undefined>;
  deleteFacilityFaq(id: string): Promise<boolean>;
  
  // Quiz Definitions
  listQuizzes(status?: string, category?: string): Promise<QuizDefinition[]>;
  getQuiz(id: string): Promise<QuizDefinition | undefined>;
  getQuizBySlug(slug: string): Promise<QuizDefinition | undefined>;
  getQuizWithQuestions(slug: string): Promise<QuizWithQuestions | undefined>;
  createQuiz(quiz: InsertQuizDefinition): Promise<QuizDefinition>;
  updateQuiz(id: string, quiz: UpdateQuizDefinition): Promise<QuizDefinition | undefined>;
  deleteQuiz(id: string): Promise<boolean>;
  publishQuiz(id: string): Promise<QuizDefinition | undefined>;
  unpublishQuiz(id: string): Promise<QuizDefinition | undefined>;
  
  // Quiz Questions
  listQuizQuestions(quizId: string): Promise<QuizQuestion[]>;
  getQuizQuestion(id: string): Promise<QuizQuestion | undefined>;
  createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion>;
  updateQuizQuestion(id: string, question: UpdateQuizQuestion): Promise<QuizQuestion | undefined>;
  deleteQuizQuestion(id: string): Promise<boolean>;
  
  // Quiz Leads
  listQuizLeads(filters?: { quizId?: string; status?: string; startDate?: Date; endDate?: Date }): Promise<QuizLead[]>;
  getQuizLead(id: string): Promise<QuizLead | undefined>;
  getQuizLeadWithResponses(id: string): Promise<QuizLeadWithResponses | undefined>;
  createQuizLead(lead: InsertQuizLead): Promise<QuizLead>;
  updateQuizLead(id: string, lead: UpdateQuizLead): Promise<QuizLead | undefined>;
  deleteQuizLead(id: string): Promise<boolean>;
  markQuizLeadEmailSent(id: string): Promise<QuizLead | undefined>;
  
  // Quiz Responses
  createQuizResponse(response: InsertQuizResponse): Promise<QuizResponse>;
  listQuizResponsesByLead(leadId: string): Promise<QuizResponse[]>;
  
  // Quiz Analytics
  getQuizLeadStats(): Promise<{ total: number; new: number; contacted: number; qualified: number; converted: number }>;
  
  // Analytics - Page Views and Media Events
  createPageView(view: InsertPageView): Promise<PageView>;
  createMediaEvent(event: InsertMediaEvent): Promise<MediaEvent>;
  getAnalyticsSummary(): Promise<{
    totalPageViews: number;
    uniqueVisitors: number;
    topPages: { slug: string; views: number }[];
    dailyTraffic: { day: string; views: number }[];
    mediaPlays: { type: string; count: number }[];
  }>;
  
  // Non-Solicitation Agreements
  listNonSolicitationAgreements(status?: string): Promise<NonSolicitationAgreement[]>;
  getNonSolicitationAgreement(id: string): Promise<NonSolicitationAgreement | undefined>;
  createNonSolicitationAgreement(agreement: Omit<InsertNonSolicitation, 'captchaToken'>): Promise<NonSolicitationAgreement>;
  updateNonSolicitationAgreement(id: string, agreement: UpdateNonSolicitation): Promise<NonSolicitationAgreement | undefined>;
  deleteNonSolicitationAgreement(id: string): Promise<boolean>;
  markNonSolicitationEmailSent(id: string): Promise<NonSolicitationAgreement | undefined>;
  
  // Initial Assessments
  listInitialAssessments(status?: string): Promise<InitialAssessment[]>;
  getInitialAssessment(id: string): Promise<InitialAssessment | undefined>;
  createInitialAssessment(assessment: Omit<InsertInitialAssessment, 'captchaToken'>): Promise<InitialAssessment>;
  updateInitialAssessment(id: string, assessment: UpdateInitialAssessment): Promise<InitialAssessment | undefined>;
  deleteInitialAssessment(id: string): Promise<boolean>;
  markInitialAssessmentEmailSent(id: string): Promise<InitialAssessment | undefined>;
  
  // Client Intakes (admin)
  listClientIntakes(status?: string): Promise<ClientIntake[]>;
  getClientIntake(id: string): Promise<ClientIntake | undefined>;
  createClientIntake(intake: Omit<InsertClientIntake, 'captchaToken'>): Promise<ClientIntake>;
  updateClientIntake(id: string, intake: UpdateClientIntake): Promise<ClientIntake | undefined>;
  deleteClientIntake(id: string): Promise<boolean>;
  markClientIntakeEmailSent(id: string): Promise<ClientIntake | undefined>;
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
  private videosMap: Map<string, Video>;
  private podcastsMap: Map<string, Podcast>;
  private facilitiesMap: Map<string, Facility>;
  private facilityReviewsMap: Map<string, FacilityReview>;
  private facilityFaqsMap: Map<string, FacilityFaq>;
  private quizDefinitionsMap: Map<string, QuizDefinition>;
  private quizQuestionsMap: Map<string, QuizQuestion>;
  private quizLeadsMap: Map<string, QuizLead>;
  private quizResponsesMap: Map<string, QuizResponse>;
  private pageViewsMap: Map<string, PageView>;
  private mediaEventsMap: Map<string, MediaEvent>;
  private nonSolicitationAgreementsMap: Map<string, NonSolicitationAgreement>;
  private initialAssessmentsMap: Map<string, InitialAssessment>;
  private clientIntakesMap: Map<string, ClientIntake>;

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
    this.videosMap = new Map();
    this.podcastsMap = new Map();
    this.facilitiesMap = new Map();
    this.facilityReviewsMap = new Map();
    this.facilityFaqsMap = new Map();
    this.quizDefinitionsMap = new Map();
    this.quizQuestionsMap = new Map();
    this.quizLeadsMap = new Map();
    this.quizResponsesMap = new Map();
    this.pageViewsMap = new Map();
    this.mediaEventsMap = new Map();
    this.nonSolicitationAgreementsMap = new Map();
    this.initialAssessmentsMap = new Map();
    this.clientIntakesMap = new Map();
    
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

  async getCareTypePageByCareTypeAndCity(careType: string, citySlug: string): Promise<{ page: CareTypePage; location: MaLocation; faqs: LocationFaq[]; reviews: LocationReview[] } | undefined> {
    const location = await this.getMaLocationBySlug(citySlug);
    if (!location) return undefined;
    
    const page = Array.from(this.careTypePagesMap.values()).find(
      p => p.careType === careType && p.locationId === location.id && p.status === "published"
    );
    if (!page) return undefined;
    
    const faqs = await this.listLocationFaqs(page.id);
    const reviews = await this.listLocationReviews(page.id);
    
    return { page, location, faqs, reviews };
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

  // City FAQs implementation
  private cityFaqsMap = new Map<string, CityFaq>();

  async listCityFaqs(locationId: string): Promise<CityFaq[]> {
    return Array.from(this.cityFaqsMap.values())
      .filter(f => f.locationId === locationId && f.isActive === "yes")
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getCityFaqsBySlug(slug: string): Promise<CityFaq[]> {
    const location = await this.getMaLocationBySlug(slug);
    if (!location) return [];
    return this.listCityFaqs(location.id);
  }

  async createCityFaq(faq: InsertCityFaq): Promise<CityFaq> {
    const id = randomUUID();
    const now = new Date();
    const newFaq: CityFaq = { 
      id, 
      ...faq, 
      category: faq.category ?? "general",
      sortOrder: faq.sortOrder ?? 0,
      isActive: faq.isActive ?? "yes",
      createdAt: now, 
      updatedAt: now 
    };
    this.cityFaqsMap.set(id, newFaq);
    return newFaq;
  }

  async updateCityFaq(id: string, faq: UpdateCityFaq): Promise<CityFaq | undefined> {
    const existing = this.cityFaqsMap.get(id);
    if (!existing) return undefined;
    const updated: CityFaq = { ...existing, ...faq, updatedAt: new Date() };
    this.cityFaqsMap.set(id, updated);
    return updated;
  }

  async deleteCityFaq(id: string): Promise<boolean> {
    return this.cityFaqsMap.delete(id);
  }

  async enrichLocationWithPlaces(id: string, data: { heroImageUrl?: string; galleryImages?: string[]; googlePlaceId?: string }): Promise<MaLocation | undefined> {
    const existing = this.maLocationsMap.get(id);
    if (!existing) return undefined;
    const updated: MaLocation = { 
      ...existing, 
      heroImageUrl: data.heroImageUrl ?? existing.heroImageUrl,
      galleryImages: data.galleryImages ?? existing.galleryImages,
      googlePlaceId: data.googlePlaceId ?? existing.googlePlaceId,
      lastEnrichedAt: new Date(),
      updatedAt: new Date() 
    };
    this.maLocationsMap.set(id, updated);
    return updated;
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

  // Videos implementation
  async listVideos(status?: string, category?: string): Promise<Video[]> {
    let videos = Array.from(this.videosMap.values());
    if (status) videos = videos.filter(v => v.status === status);
    if (category) videos = videos.filter(v => v.category === category);
    return videos.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getVideo(id: string): Promise<Video | undefined> {
    return this.videosMap.get(id);
  }

  async getVideoBySlug(slug: string): Promise<Video | undefined> {
    return Array.from(this.videosMap.values()).find(v => v.slug === slug);
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const id = randomUUID();
    const now = new Date();
    const existingSlugs = Array.from(this.videosMap.values()).map(v => v.slug);
    const slug = video.slug || generateUniqueSlug(video.title, existingSlugs);
    const newVideo: Video = {
      id,
      title: video.title,
      slug,
      description: video.description ?? null,
      category: video.category || "care-tips",
      videoType: video.videoType || "upload",
      videoUrl: video.videoUrl ?? null,
      embedUrl: video.embedUrl ?? null,
      thumbnailUrl: video.thumbnailUrl ?? null,
      duration: video.duration ?? null,
      metaTitle: video.metaTitle ?? null,
      metaDescription: video.metaDescription ?? null,
      keywords: video.keywords || [],
      featured: video.featured || "no",
      sortOrder: video.sortOrder || 0,
      status: video.status || "draft",
      publishedAt: null,
      viewCount: 0,
      createdAt: now,
      updatedAt: now
    };
    this.videosMap.set(id, newVideo);
    return newVideo;
  }

  async updateVideo(id: string, video: UpdateVideo): Promise<Video | undefined> {
    const existing = this.videosMap.get(id);
    if (!existing) return undefined;
    const updated: Video = { ...existing, ...video, updatedAt: new Date() };
    this.videosMap.set(id, updated);
    return updated;
  }

  async deleteVideo(id: string): Promise<boolean> {
    return this.videosMap.delete(id);
  }

  async publishVideo(id: string): Promise<Video | undefined> {
    const existing = this.videosMap.get(id);
    if (!existing) return undefined;
    const updated: Video = { ...existing, status: "published", publishedAt: new Date(), updatedAt: new Date() };
    this.videosMap.set(id, updated);
    return updated;
  }

  async unpublishVideo(id: string): Promise<Video | undefined> {
    const existing = this.videosMap.get(id);
    if (!existing) return undefined;
    const updated: Video = { ...existing, status: "draft", publishedAt: null, updatedAt: new Date() };
    this.videosMap.set(id, updated);
    return updated;
  }

  async incrementVideoViews(id: string): Promise<Video | undefined> {
    const existing = this.videosMap.get(id);
    if (!existing) return undefined;
    const updated: Video = { ...existing, viewCount: existing.viewCount + 1 };
    this.videosMap.set(id, updated);
    return updated;
  }

  // Podcasts implementation
  async listPodcasts(status?: string, category?: string): Promise<Podcast[]> {
    let podcasts = Array.from(this.podcastsMap.values());
    if (status) podcasts = podcasts.filter(p => p.status === status);
    if (category) podcasts = podcasts.filter(p => p.category === category);
    return podcasts.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getPodcast(id: string): Promise<Podcast | undefined> {
    return this.podcastsMap.get(id);
  }

  async getPodcastBySlug(slug: string): Promise<Podcast | undefined> {
    return Array.from(this.podcastsMap.values()).find(p => p.slug === slug);
  }

  async createPodcast(podcast: InsertPodcast): Promise<Podcast> {
    const id = randomUUID();
    const now = new Date();
    const existingSlugs = Array.from(this.podcastsMap.values()).map(p => p.slug);
    const slug = podcast.slug || generateUniqueSlug(podcast.title, existingSlugs);
    const newPodcast: Podcast = {
      id,
      title: podcast.title,
      slug,
      description: podcast.description ?? null,
      category: podcast.category || "tips-and-advice",
      audioType: podcast.audioType || "upload",
      audioUrl: podcast.audioUrl ?? null,
      embedUrl: podcast.embedUrl ?? null,
      thumbnailUrl: podcast.thumbnailUrl ?? null,
      episodeNumber: podcast.episodeNumber ?? null,
      seasonNumber: podcast.seasonNumber ?? null,
      duration: podcast.duration ?? null,
      showNotes: podcast.showNotes ?? null,
      transcript: podcast.transcript ?? null,
      hostName: podcast.hostName ?? null,
      guestName: podcast.guestName ?? null,
      guestTitle: podcast.guestTitle ?? null,
      metaTitle: podcast.metaTitle ?? null,
      metaDescription: podcast.metaDescription ?? null,
      keywords: podcast.keywords || [],
      featured: podcast.featured || "no",
      sortOrder: podcast.sortOrder || 0,
      status: podcast.status || "draft",
      publishedAt: null,
      playCount: 0,
      createdAt: now,
      updatedAt: now
    };
    this.podcastsMap.set(id, newPodcast);
    return newPodcast;
  }

  async updatePodcast(id: string, podcast: UpdatePodcast): Promise<Podcast | undefined> {
    const existing = this.podcastsMap.get(id);
    if (!existing) return undefined;
    const updated: Podcast = { ...existing, ...podcast, updatedAt: new Date() };
    this.podcastsMap.set(id, updated);
    return updated;
  }

  async deletePodcast(id: string): Promise<boolean> {
    return this.podcastsMap.delete(id);
  }

  async publishPodcast(id: string): Promise<Podcast | undefined> {
    const existing = this.podcastsMap.get(id);
    if (!existing) return undefined;
    const updated: Podcast = { ...existing, status: "published", publishedAt: new Date(), updatedAt: new Date() };
    this.podcastsMap.set(id, updated);
    return updated;
  }

  async unpublishPodcast(id: string): Promise<Podcast | undefined> {
    const existing = this.podcastsMap.get(id);
    if (!existing) return undefined;
    const updated: Podcast = { ...existing, status: "draft", publishedAt: null, updatedAt: new Date() };
    this.podcastsMap.set(id, updated);
    return updated;
  }

  async incrementPodcastPlays(id: string): Promise<Podcast | undefined> {
    const existing = this.podcastsMap.get(id);
    if (!existing) return undefined;
    const updated: Podcast = { ...existing, playCount: existing.playCount + 1 };
    this.podcastsMap.set(id, updated);
    return updated;
  }

  // Facilities
  async listFacilities(filters?: { facilityType?: string; city?: string; county?: string; status?: string; featured?: string }): Promise<Facility[]> {
    let list = Array.from(this.facilitiesMap.values());
    if (filters?.facilityType) {
      list = list.filter(f => f.facilityType === filters.facilityType);
    }
    if (filters?.city) {
      list = list.filter(f => f.city.toLowerCase() === filters.city!.toLowerCase());
    }
    if (filters?.county) {
      list = list.filter(f => f.county?.toLowerCase() === filters.county!.toLowerCase());
    }
    if (filters?.status) {
      list = list.filter(f => f.status === filters.status);
    }
    if (filters?.featured) {
      list = list.filter(f => f.featured === filters.featured);
    }
    return list.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  }

  async getFacility(id: string): Promise<Facility | undefined> {
    return this.facilitiesMap.get(id);
  }

  async getFacilityBySlug(slug: string): Promise<Facility | undefined> {
    return Array.from(this.facilitiesMap.values()).find(f => f.slug === slug);
  }

  async createFacility(facility: InsertFacility): Promise<Facility> {
    const id = randomUUID();
    const slug = facility.slug || slugify(facility.name);
    const now = new Date();
    const newFacility: Facility = {
      ...facility,
      id,
      slug,
      state: facility.state || "MA",
      zipCode: facility.zipCode || null,
      county: facility.county || null,
      latitude: facility.latitude || null,
      longitude: facility.longitude || null,
      phone: facility.phone || null,
      website: facility.website || null,
      email: facility.email || null,
      description: facility.description || null,
      shortDescription: facility.shortDescription || null,
      totalBeds: facility.totalBeds || null,
      certifiedBeds: facility.certifiedBeds || null,
      heroImageUrl: facility.heroImageUrl || null,
      galleryImages: facility.galleryImages || [],
      services: facility.services || [],
      amenities: facility.amenities || [],
      specializations: facility.specializations || [],
      priceRangeMin: facility.priceRangeMin || null,
      priceRangeMax: facility.priceRangeMax || null,
      pricingNotes: facility.pricingNotes || null,
      overallRating: facility.overallRating || null,
      reviewCount: 0,
      acceptsMedicare: facility.acceptsMedicare || "unknown",
      acceptsMedicaid: facility.acceptsMedicaid || "unknown",
      licensedBy: facility.licensedBy || null,
      licenseNumber: facility.licenseNumber || null,
      certifications: facility.certifications || [],
      healthInspectionRating: facility.healthInspectionRating || null,
      staffingRating: facility.staffingRating || null,
      qualityRating: facility.qualityRating || null,
      metaTitle: facility.metaTitle || null,
      metaDescription: facility.metaDescription || null,
      keywords: facility.keywords || [],
      featured: facility.featured || "no",
      sortOrder: facility.sortOrder || 0,
      status: facility.status || "draft",
      publishedAt: null,
      dataSource: facility.dataSource || null,
      externalId: facility.externalId || null,
      createdAt: now,
      updatedAt: now,
    };
    this.facilitiesMap.set(id, newFacility);
    return newFacility;
  }

  async updateFacility(id: string, facility: UpdateFacility): Promise<Facility | undefined> {
    const existing = this.facilitiesMap.get(id);
    if (!existing) return undefined;
    const updated: Facility = { ...existing, ...facility, updatedAt: new Date() };
    this.facilitiesMap.set(id, updated);
    return updated;
  }

  async deleteFacility(id: string): Promise<boolean> {
    return this.facilitiesMap.delete(id);
  }

  async publishFacility(id: string): Promise<Facility | undefined> {
    const existing = this.facilitiesMap.get(id);
    if (!existing) return undefined;
    const updated: Facility = { ...existing, status: "published", publishedAt: new Date(), updatedAt: new Date() };
    this.facilitiesMap.set(id, updated);
    return updated;
  }

  async unpublishFacility(id: string): Promise<Facility | undefined> {
    const existing = this.facilitiesMap.get(id);
    if (!existing) return undefined;
    const updated: Facility = { ...existing, status: "draft", publishedAt: null, updatedAt: new Date() };
    this.facilitiesMap.set(id, updated);
    return updated;
  }

  async searchFacilities(query: string, facilityType?: string): Promise<Facility[]> {
    const lowerQuery = query.toLowerCase();
    let list = Array.from(this.facilitiesMap.values()).filter(f =>
      f.name.toLowerCase().includes(lowerQuery) ||
      f.city.toLowerCase().includes(lowerQuery) ||
      f.address.toLowerCase().includes(lowerQuery) ||
      f.description?.toLowerCase().includes(lowerQuery)
    );
    if (facilityType) {
      list = list.filter(f => f.facilityType === facilityType);
    }
    return list;
  }

  // Facility Reviews
  async listFacilityReviews(facilityId: string, status?: string): Promise<FacilityReview[]> {
    let list = Array.from(this.facilityReviewsMap.values()).filter(r => r.facilityId === facilityId);
    if (status) {
      list = list.filter(r => r.status === status);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getFacilityReview(id: string): Promise<FacilityReview | undefined> {
    return this.facilityReviewsMap.get(id);
  }

  async createFacilityReview(review: InsertFacilityReview): Promise<FacilityReview> {
    const id = randomUUID();
    const now = new Date();
    const newReview: FacilityReview = {
      ...review,
      id,
      title: review.title || null,
      reviewerRelation: review.reviewerRelation || null,
      visitDate: review.visitDate || null,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };
    this.facilityReviewsMap.set(id, newReview);
    return newReview;
  }

  async updateFacilityReview(id: string, review: UpdateFacilityReview): Promise<FacilityReview | undefined> {
    const existing = this.facilityReviewsMap.get(id);
    if (!existing) return undefined;
    const updated: FacilityReview = { ...existing, ...review, updatedAt: new Date() };
    this.facilityReviewsMap.set(id, updated);
    return updated;
  }

  async deleteFacilityReview(id: string): Promise<boolean> {
    return this.facilityReviewsMap.delete(id);
  }

  async approveFacilityReview(id: string): Promise<FacilityReview | undefined> {
    const existing = this.facilityReviewsMap.get(id);
    if (!existing) return undefined;
    const updated: FacilityReview = { ...existing, status: "approved", updatedAt: new Date() };
    this.facilityReviewsMap.set(id, updated);
    return updated;
  }

  async rejectFacilityReview(id: string): Promise<FacilityReview | undefined> {
    const existing = this.facilityReviewsMap.get(id);
    if (!existing) return undefined;
    const updated: FacilityReview = { ...existing, status: "rejected", updatedAt: new Date() };
    this.facilityReviewsMap.set(id, updated);
    return updated;
  }

  // Facility FAQs
  async listFacilityFaqs(facilityId: string): Promise<FacilityFaq[]> {
    return Array.from(this.facilityFaqsMap.values())
      .filter(faq => faq.facilityId === facilityId && faq.isActive === "yes")
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async getFacilityFaq(id: string): Promise<FacilityFaq | undefined> {
    return this.facilityFaqsMap.get(id);
  }

  async createFacilityFaq(faq: InsertFacilityFaq): Promise<FacilityFaq> {
    const id = randomUUID();
    const newFaq: FacilityFaq = {
      ...faq,
      id,
      category: faq.category || null,
      displayOrder: faq.displayOrder || 0,
      isActive: faq.isActive || "yes",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.facilityFaqsMap.set(id, newFaq);
    return newFaq;
  }

  async updateFacilityFaq(id: string, faq: UpdateFacilityFaq): Promise<FacilityFaq | undefined> {
    const existing = this.facilityFaqsMap.get(id);
    if (!existing) return undefined;
    const updated: FacilityFaq = { ...existing, ...faq, updatedAt: new Date() };
    this.facilityFaqsMap.set(id, updated);
    return updated;
  }

  async deleteFacilityFaq(id: string): Promise<boolean> {
    return this.facilityFaqsMap.delete(id);
  }

  // Quiz Definitions
  async listQuizzes(status?: string, category?: string): Promise<QuizDefinition[]> {
    let quizzes = Array.from(this.quizDefinitionsMap.values());
    if (status) quizzes = quizzes.filter(q => q.status === status);
    if (category) quizzes = quizzes.filter(q => q.category === category);
    return quizzes.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getQuiz(id: string): Promise<QuizDefinition | undefined> {
    return this.quizDefinitionsMap.get(id);
  }

  async getQuizBySlug(slug: string): Promise<QuizDefinition | undefined> {
    return Array.from(this.quizDefinitionsMap.values()).find(q => q.slug === slug);
  }

  async getQuizWithQuestions(slug: string): Promise<QuizWithQuestions | undefined> {
    const quiz = await this.getQuizBySlug(slug);
    if (!quiz) return undefined;
    const questions = Array.from(this.quizQuestionsMap.values())
      .filter(q => q.quizId === quiz.id)
      .sort((a, b) => a.displayOrder - b.displayOrder);
    return { ...quiz, questions };
  }

  async createQuiz(quiz: InsertQuizDefinition): Promise<QuizDefinition> {
    const id = randomUUID();
    const now = new Date();
    const existingSlugs = Array.from(this.quizDefinitionsMap.values()).map(q => q.slug);
    const slug = quiz.slug || generateUniqueSlug(quiz.title, existingSlugs);
    const newQuiz: QuizDefinition = {
      id,
      slug,
      title: quiz.title,
      subtitle: quiz.subtitle || null,
      description: quiz.description || null,
      category: quiz.category,
      targetType: quiz.targetType,
      heroImageUrl: quiz.heroImageUrl || null,
      resultTitle: quiz.resultTitle || null,
      resultDescription: quiz.resultDescription || null,
      ctaText: quiz.ctaText || "Get Your Free Care Assessment",
      ctaUrl: quiz.ctaUrl || null,
      metaTitle: quiz.metaTitle || null,
      metaDescription: quiz.metaDescription || null,
      status: quiz.status || "draft",
      sortOrder: quiz.sortOrder || 0,
      createdAt: now,
      updatedAt: now,
    };
    this.quizDefinitionsMap.set(id, newQuiz);
    return newQuiz;
  }

  async updateQuiz(id: string, quiz: UpdateQuizDefinition): Promise<QuizDefinition | undefined> {
    const existing = this.quizDefinitionsMap.get(id);
    if (!existing) return undefined;
    const updated: QuizDefinition = { ...existing, ...quiz, updatedAt: new Date() };
    this.quizDefinitionsMap.set(id, updated);
    return updated;
  }

  async deleteQuiz(id: string): Promise<boolean> {
    // Also delete associated questions
    Array.from(this.quizQuestionsMap.values())
      .filter(q => q.quizId === id)
      .forEach(q => this.quizQuestionsMap.delete(q.id));
    return this.quizDefinitionsMap.delete(id);
  }

  async publishQuiz(id: string): Promise<QuizDefinition | undefined> {
    const existing = this.quizDefinitionsMap.get(id);
    if (!existing) return undefined;
    const updated: QuizDefinition = { ...existing, status: "published", updatedAt: new Date() };
    this.quizDefinitionsMap.set(id, updated);
    return updated;
  }

  async unpublishQuiz(id: string): Promise<QuizDefinition | undefined> {
    const existing = this.quizDefinitionsMap.get(id);
    if (!existing) return undefined;
    const updated: QuizDefinition = { ...existing, status: "draft", updatedAt: new Date() };
    this.quizDefinitionsMap.set(id, updated);
    return updated;
  }

  // Quiz Questions
  async listQuizQuestions(quizId: string): Promise<QuizQuestion[]> {
    return Array.from(this.quizQuestionsMap.values())
      .filter(q => q.quizId === quizId)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async getQuizQuestion(id: string): Promise<QuizQuestion | undefined> {
    return this.quizQuestionsMap.get(id);
  }

  async createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion> {
    const id = randomUUID();
    const now = new Date();
    const newQuestion: QuizQuestion = {
      id,
      quizId: question.quizId,
      questionText: question.questionText,
      questionType: question.questionType || "single_choice",
      helpText: question.helpText || null,
      options: question.options || [],
      isRequired: question.isRequired || "yes",
      displayOrder: question.displayOrder || 0,
      scoreWeight: question.scoreWeight || 1,
      createdAt: now,
      updatedAt: now,
    };
    this.quizQuestionsMap.set(id, newQuestion);
    return newQuestion;
  }

  async updateQuizQuestion(id: string, question: UpdateQuizQuestion): Promise<QuizQuestion | undefined> {
    const existing = this.quizQuestionsMap.get(id);
    if (!existing) return undefined;
    const updated: QuizQuestion = { ...existing, ...question, updatedAt: new Date() };
    this.quizQuestionsMap.set(id, updated);
    return updated;
  }

  async deleteQuizQuestion(id: string): Promise<boolean> {
    return this.quizQuestionsMap.delete(id);
  }

  // Quiz Leads
  async listQuizLeads(filters?: { quizId?: string; status?: string; startDate?: Date; endDate?: Date }): Promise<QuizLead[]> {
    let leads = Array.from(this.quizLeadsMap.values());
    if (filters?.quizId) leads = leads.filter(l => l.quizId === filters.quizId);
    if (filters?.status) leads = leads.filter(l => l.status === filters.status);
    if (filters?.startDate) leads = leads.filter(l => l.createdAt >= filters.startDate!);
    if (filters?.endDate) leads = leads.filter(l => l.createdAt <= filters.endDate!);
    return leads.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getQuizLead(id: string): Promise<QuizLead | undefined> {
    return this.quizLeadsMap.get(id);
  }

  async getQuizLeadWithResponses(id: string): Promise<QuizLeadWithResponses | undefined> {
    const lead = this.quizLeadsMap.get(id);
    if (!lead) return undefined;
    const quiz = this.quizDefinitionsMap.get(lead.quizId);
    if (!quiz) return undefined;
    const responses = Array.from(this.quizResponsesMap.values())
      .filter(r => r.leadId === id)
      .map(r => {
        const question = this.quizQuestionsMap.get(r.questionId);
        return { ...r, question: question! };
      })
      .filter(r => r.question);
    return { ...lead, quiz, responses };
  }

  async createQuizLead(lead: InsertQuizLead): Promise<QuizLead> {
    const id = randomUUID();
    const now = new Date();
    const newLead: QuizLead = {
      id,
      quizId: lead.quizId,
      name: lead.name,
      email: lead.email,
      phone: lead.phone || null,
      leadScore: 0,
      urgencyLevel: lead.urgencyLevel || null,
      sourcePage: lead.sourcePage || null,
      referrer: lead.referrer || null,
      utmSource: lead.utmSource || null,
      utmMedium: lead.utmMedium || null,
      utmCampaign: lead.utmCampaign || null,
      status: "new",
      assignedTo: lead.assignedTo || null,
      notes: lead.notes || null,
      ipAddress: lead.ipAddress || null,
      userAgent: lead.userAgent || null,
      emailSent: "no",
      emailSentAt: null,
      createdAt: now,
      updatedAt: now,
    };
    this.quizLeadsMap.set(id, newLead);
    return newLead;
  }

  async updateQuizLead(id: string, lead: UpdateQuizLead): Promise<QuizLead | undefined> {
    const existing = this.quizLeadsMap.get(id);
    if (!existing) return undefined;
    const updated: QuizLead = { ...existing, ...lead, updatedAt: new Date() };
    this.quizLeadsMap.set(id, updated);
    return updated;
  }

  async deleteQuizLead(id: string): Promise<boolean> {
    // Also delete associated responses
    Array.from(this.quizResponsesMap.values())
      .filter(r => r.leadId === id)
      .forEach(r => this.quizResponsesMap.delete(r.id));
    return this.quizLeadsMap.delete(id);
  }

  async markQuizLeadEmailSent(id: string): Promise<QuizLead | undefined> {
    const existing = this.quizLeadsMap.get(id);
    if (!existing) return undefined;
    const updated: QuizLead = { ...existing, emailSent: "yes", emailSentAt: new Date(), updatedAt: new Date() };
    this.quizLeadsMap.set(id, updated);
    return updated;
  }

  // Quiz Responses
  async createQuizResponse(response: InsertQuizResponse): Promise<QuizResponse> {
    const id = randomUUID();
    const newResponse: QuizResponse = {
      id,
      leadId: response.leadId,
      questionId: response.questionId,
      answerValue: response.answerValue || null,
      answerValues: response.answerValues || [],
      answerText: response.answerText || null,
      scoreContribution: response.scoreContribution || 0,
      createdAt: new Date(),
    };
    this.quizResponsesMap.set(id, newResponse);
    
    // Update lead score
    const lead = this.quizLeadsMap.get(response.leadId);
    if (lead) {
      const updatedLead: QuizLead = { 
        ...lead, 
        leadScore: lead.leadScore + (response.scoreContribution || 0),
        updatedAt: new Date()
      };
      this.quizLeadsMap.set(response.leadId, updatedLead);
    }
    
    return newResponse;
  }

  async listQuizResponsesByLead(leadId: string): Promise<QuizResponse[]> {
    return Array.from(this.quizResponsesMap.values()).filter(r => r.leadId === leadId);
  }

  // Quiz Analytics
  async getQuizLeadStats(): Promise<{ total: number; new: number; contacted: number; qualified: number; converted: number }> {
    const leads = Array.from(this.quizLeadsMap.values());
    return {
      total: leads.length,
      new: leads.filter(l => l.status === "new").length,
      contacted: leads.filter(l => l.status === "contacted").length,
      qualified: leads.filter(l => l.status === "qualified").length,
      converted: leads.filter(l => l.status === "converted").length,
    };
  }

  // Analytics methods
  async createPageView(view: InsertPageView): Promise<PageView> {
    const id = randomUUID();
    const newView: PageView = {
      id,
      slug: view.slug,
      referrer: view.referrer || null,
      userAgent: view.userAgent || null,
      ipMasked: view.ipMasked || null,
      timestamp: new Date(),
    };
    this.pageViewsMap.set(id, newView);
    return newView;
  }

  async createMediaEvent(event: InsertMediaEvent): Promise<MediaEvent> {
    const id = randomUUID();
    const newEvent: MediaEvent = {
      id,
      mediaId: event.mediaId || null,
      mediaTitle: event.mediaTitle || null,
      eventType: event.eventType,
      mediaType: event.mediaType,
      timestamp: new Date(),
    };
    this.mediaEventsMap.set(id, newEvent);
    return newEvent;
  }

  async getAnalyticsSummary(): Promise<{
    totalPageViews: number;
    uniqueVisitors: number;
    topPages: { slug: string; views: number }[];
    dailyTraffic: { day: string; views: number }[];
    mediaPlays: { type: string; count: number }[];
  }> {
    const views = Array.from(this.pageViewsMap.values());
    const events = Array.from(this.mediaEventsMap.values());
    
    const slugCounts = views.reduce((acc, v) => {
      acc[v.slug] = (acc[v.slug] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topPages = Object.entries(slugCounts)
      .map(([slug, views]) => ({ slug, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
    
    const dayCounts = views.reduce((acc, v) => {
      const day = v.timestamp.toISOString().split('T')[0];
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const dailyTraffic = Object.entries(dayCounts)
      .map(([day, views]) => ({ day, views }))
      .sort((a, b) => a.day.localeCompare(b.day))
      .slice(-7);
    
    const mediaTypeCounts = events
      .filter(e => e.eventType === 'play')
      .reduce((acc, e) => {
        acc[e.mediaType] = (acc[e.mediaType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    const mediaPlays = Object.entries(mediaTypeCounts)
      .map(([type, count]) => ({ type, count }));
    
    const uniqueIps = new Set(views.map(v => v.ipMasked).filter(Boolean));
    
    return {
      totalPageViews: views.length,
      uniqueVisitors: uniqueIps.size,
      topPages,
      dailyTraffic,
      mediaPlays,
    };
  }

  // Non-Solicitation Agreements
  async listNonSolicitationAgreements(status?: string): Promise<NonSolicitationAgreement[]> {
    let agreements = Array.from(this.nonSolicitationAgreementsMap.values());
    if (status) {
      agreements = agreements.filter(a => a.status === status);
    }
    return agreements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getNonSolicitationAgreement(id: string): Promise<NonSolicitationAgreement | undefined> {
    return this.nonSolicitationAgreementsMap.get(id);
  }

  async createNonSolicitationAgreement(agreement: Omit<InsertNonSolicitation, 'captchaToken'>): Promise<NonSolicitationAgreement> {
    const id = randomUUID();
    const now = new Date();
    const newAgreement: NonSolicitationAgreement = {
      id,
      clientFullName: agreement.clientFullName,
      responsibleParty: agreement.responsibleParty,
      billingAddress: agreement.billingAddress,
      email: agreement.email,
      phone: agreement.phone ?? null,
      placementOption: agreement.placementOption,
      agreementTerms: agreement.agreementTerms,
      penaltyAcknowledgments: agreement.penaltyAcknowledgments,
      electronicSignature: agreement.electronicSignature,
      agreementDate: agreement.agreementDate,
      assignedClientId: agreement.assignedClientId ?? null,
      status: agreement.status || 'active',
      emailSentAt: null,
      notes: agreement.notes ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.nonSolicitationAgreementsMap.set(id, newAgreement);
    return newAgreement;
  }

  async updateNonSolicitationAgreement(id: string, agreement: UpdateNonSolicitation): Promise<NonSolicitationAgreement | undefined> {
    const existing = this.nonSolicitationAgreementsMap.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...agreement, updatedAt: new Date() };
    this.nonSolicitationAgreementsMap.set(id, updated);
    return updated;
  }

  async deleteNonSolicitationAgreement(id: string): Promise<boolean> {
    return this.nonSolicitationAgreementsMap.delete(id);
  }

  async markNonSolicitationEmailSent(id: string): Promise<NonSolicitationAgreement | undefined> {
    const existing = this.nonSolicitationAgreementsMap.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, emailSentAt: new Date(), updatedAt: new Date() };
    this.nonSolicitationAgreementsMap.set(id, updated);
    return updated;
  }

  // Initial Assessments
  async listInitialAssessments(status?: string): Promise<InitialAssessment[]> {
    let assessments = Array.from(this.initialAssessmentsMap.values());
    if (status) {
      assessments = assessments.filter(a => a.status === status);
    }
    return assessments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getInitialAssessment(id: string): Promise<InitialAssessment | undefined> {
    return this.initialAssessmentsMap.get(id);
  }

  async createInitialAssessment(assessment: Omit<InsertInitialAssessment, 'captchaToken'>): Promise<InitialAssessment> {
    const id = randomUUID();
    const now = new Date();
    const newAssessment: InitialAssessment = {
      id,
      email: assessment.email,
      clientFullName: assessment.clientFullName,
      clientDateOfBirth: assessment.clientDateOfBirth,
      serviceAddress: assessment.serviceAddress,
      responsiblePartyName: assessment.responsiblePartyName,
      responsiblePartyRelationship: assessment.responsiblePartyRelationship,
      billingEmail: assessment.billingEmail,
      primaryPhone: assessment.primaryPhone,
      careAssessment: assessment.careAssessment,
      homeSafety: assessment.homeSafety,
      serviceSchedule: assessment.serviceSchedule,
      financialAgreement: assessment.financialAgreement,
      legalAcknowledgments: assessment.legalAcknowledgments,
      emergencyContact: assessment.emergencyContact,
      electronicSignature: assessment.electronicSignature,
      signatureDate: assessment.signatureDate,
      assignedClientId: assessment.assignedClientId ?? null,
      status: assessment.status || 'pending',
      emailSentAt: null,
      reviewedAt: null,
      reviewedBy: null,
      notes: assessment.notes ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.initialAssessmentsMap.set(id, newAssessment);
    return newAssessment;
  }

  async updateInitialAssessment(id: string, assessment: UpdateInitialAssessment): Promise<InitialAssessment | undefined> {
    const existing = this.initialAssessmentsMap.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...assessment, updatedAt: new Date() };
    this.initialAssessmentsMap.set(id, updated);
    return updated;
  }

  async deleteInitialAssessment(id: string): Promise<boolean> {
    return this.initialAssessmentsMap.delete(id);
  }

  async markInitialAssessmentEmailSent(id: string): Promise<InitialAssessment | undefined> {
    const existing = this.initialAssessmentsMap.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, emailSentAt: new Date(), updatedAt: new Date() };
    this.initialAssessmentsMap.set(id, updated);
    return updated;
  }

  // Client Intakes
  async listClientIntakes(status?: string): Promise<ClientIntake[]> {
    let intakes = Array.from(this.clientIntakesMap.values());
    if (status) {
      intakes = intakes.filter(i => i.status === status);
    }
    return intakes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getClientIntake(id: string): Promise<ClientIntake | undefined> {
    return this.clientIntakesMap.get(id);
  }

  async createClientIntake(intake: Omit<InsertClientIntake, 'captchaToken'>): Promise<ClientIntake> {
    const id = randomUUID();
    const now = new Date();
    const newIntake: ClientIntake = {
      id,
      clientName: intake.clientName,
      clientEmail: intake.clientEmail,
      clientPhone: intake.clientPhone,
      dateOfBirth: intake.dateOfBirth ?? null,
      address: intake.address ?? null,
      emergencyContactName: intake.emergencyContactName ?? null,
      emergencyContactPhone: intake.emergencyContactPhone ?? null,
      emergencyContactRelationship: intake.emergencyContactRelationship ?? null,
      insuranceProvider: intake.insuranceProvider ?? null,
      insurancePolicyNumber: intake.insurancePolicyNumber ?? null,
      primaryPhysician: intake.primaryPhysician ?? null,
      physicianPhone: intake.physicianPhone ?? null,
      medicalConditions: intake.medicalConditions ?? null,
      medications: intake.medications ?? null,
      allergies: intake.allergies ?? null,
      mobilityStatus: intake.mobilityStatus ?? null,
      dietaryRestrictions: intake.dietaryRestrictions ?? null,
      careNeeds: intake.careNeeds || [],
      preferredSchedule: intake.preferredSchedule ?? null,
      additionalNotes: intake.additionalNotes ?? null,
      assignedCaregiverId: intake.assignedCaregiverId ?? null,
      status: intake.status || 'pending',
      emailSentAt: null,
      createdAt: now,
      updatedAt: now,
    };
    this.clientIntakesMap.set(id, newIntake);
    return newIntake;
  }

  async updateClientIntake(id: string, intake: UpdateClientIntake): Promise<ClientIntake | undefined> {
    const existing = this.clientIntakesMap.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...intake, updatedAt: new Date() };
    this.clientIntakesMap.set(id, updated);
    return updated;
  }

  async deleteClientIntake(id: string): Promise<boolean> {
    return this.clientIntakesMap.delete(id);
  }

  async markClientIntakeEmailSent(id: string): Promise<ClientIntake | undefined> {
    const existing = this.clientIntakesMap.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, emailSentAt: new Date(), updatedAt: new Date() };
    this.clientIntakesMap.set(id, updated);
    return updated;
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

  async getCareTypePageByCareTypeAndCity(careType: string, citySlug: string): Promise<{ page: CareTypePage; location: MaLocation; faqs: LocationFaq[]; reviews: LocationReview[] } | undefined> {
    const location = await this.getMaLocationBySlug(citySlug);
    if (!location) return undefined;
    
    const pageResult = await this.db.select().from(careTypePages).where(
      and(
        eq(careTypePages.careType, careType),
        eq(careTypePages.locationId, location.id),
        eq(careTypePages.status, "published")
      )
    ).limit(1);
    
    if (pageResult.length === 0) return undefined;
    const page = pageResult[0];
    
    const faqs = await this.listLocationFaqs(page.id);
    const reviews = await this.listLocationReviews(page.id);
    
    return { page, location, faqs, reviews };
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

  // City FAQs implementation
  async listCityFaqs(locationId: string): Promise<CityFaq[]> {
    return await this.db.select().from(cityFaqs)
      .where(and(eq(cityFaqs.locationId, locationId), eq(cityFaqs.isActive, "yes")))
      .orderBy(cityFaqs.sortOrder);
  }

  async getCityFaqsBySlug(slug: string): Promise<CityFaq[]> {
    const location = await this.getMaLocationBySlug(slug);
    if (!location) return [];
    return this.listCityFaqs(location.id);
  }

  async createCityFaq(faq: InsertCityFaq): Promise<CityFaq> {
    const result = await this.db.insert(cityFaqs).values(faq).returning();
    return result[0];
  }

  async updateCityFaq(id: string, faq: UpdateCityFaq): Promise<CityFaq | undefined> {
    const result = await this.db.update(cityFaqs).set({ ...faq, updatedAt: new Date() }).where(eq(cityFaqs.id, id)).returning();
    return result[0];
  }

  async deleteCityFaq(id: string): Promise<boolean> {
    const result = await this.db.delete(cityFaqs).where(eq(cityFaqs.id, id)).returning();
    return result.length > 0;
  }

  async enrichLocationWithPlaces(id: string, data: { heroImageUrl?: string; galleryImages?: string[]; googlePlaceId?: string }): Promise<MaLocation | undefined> {
    const result = await this.db.update(maLocations).set({
      heroImageUrl: data.heroImageUrl,
      galleryImages: data.galleryImages,
      googlePlaceId: data.googlePlaceId,
      lastEnrichedAt: new Date(),
      updatedAt: new Date()
    }).where(eq(maLocations.id, id)).returning();
    return result[0];
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

  // Videos implementation
  async listVideos(status?: string, category?: string): Promise<Video[]> {
    let query = this.db.select().from(videos);
    if (status && category) {
      query = query.where(and(eq(videos.status, status), eq(videos.category, category)));
    } else if (status) {
      query = query.where(eq(videos.status, status));
    } else if (category) {
      query = query.where(eq(videos.category, category));
    }
    return await query.orderBy(videos.sortOrder);
  }

  async getVideo(id: string): Promise<Video | undefined> {
    const result = await this.db.select().from(videos).where(eq(videos.id, id)).limit(1);
    return result[0];
  }

  async getVideoBySlug(slug: string): Promise<Video | undefined> {
    const result = await this.db.select().from(videos).where(eq(videos.slug, slug)).limit(1);
    return result[0];
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const existingVideos = await this.db.select({ slug: videos.slug }).from(videos);
    const existingSlugs = existingVideos.map((v: { slug: string }) => v.slug);
    const slug = video.slug || generateUniqueSlug(video.title, existingSlugs);
    const result = await this.db.insert(videos).values({ ...video, slug }).returning();
    return result[0];
  }

  async updateVideo(id: string, video: UpdateVideo): Promise<Video | undefined> {
    const result = await this.db.update(videos).set({ ...video, updatedAt: new Date() }).where(eq(videos.id, id)).returning();
    return result[0];
  }

  async deleteVideo(id: string): Promise<boolean> {
    const result = await this.db.delete(videos).where(eq(videos.id, id)).returning();
    return result.length > 0;
  }

  async publishVideo(id: string): Promise<Video | undefined> {
    const result = await this.db.update(videos).set({ status: "published", publishedAt: new Date(), updatedAt: new Date() }).where(eq(videos.id, id)).returning();
    return result[0];
  }

  async unpublishVideo(id: string): Promise<Video | undefined> {
    const result = await this.db.update(videos).set({ status: "draft", publishedAt: null, updatedAt: new Date() }).where(eq(videos.id, id)).returning();
    return result[0];
  }

  async incrementVideoViews(id: string): Promise<Video | undefined> {
    const result = await this.db.update(videos).set({ viewCount: sql`${videos.viewCount} + 1` }).where(eq(videos.id, id)).returning();
    return result[0];
  }

  // Podcasts implementation
  async listPodcasts(status?: string, category?: string): Promise<Podcast[]> {
    let query = this.db.select().from(podcasts);
    if (status && category) {
      query = query.where(and(eq(podcasts.status, status), eq(podcasts.category, category)));
    } else if (status) {
      query = query.where(eq(podcasts.status, status));
    } else if (category) {
      query = query.where(eq(podcasts.category, category));
    }
    return await query.orderBy(podcasts.sortOrder);
  }

  async getPodcast(id: string): Promise<Podcast | undefined> {
    const result = await this.db.select().from(podcasts).where(eq(podcasts.id, id)).limit(1);
    return result[0];
  }

  async getPodcastBySlug(slug: string): Promise<Podcast | undefined> {
    const result = await this.db.select().from(podcasts).where(eq(podcasts.slug, slug)).limit(1);
    return result[0];
  }

  async createPodcast(podcast: InsertPodcast): Promise<Podcast> {
    const existingPodcasts = await this.db.select({ slug: podcasts.slug }).from(podcasts);
    const existingSlugs = existingPodcasts.map((p: { slug: string }) => p.slug);
    const slug = podcast.slug || generateUniqueSlug(podcast.title, existingSlugs);
    const result = await this.db.insert(podcasts).values({ ...podcast, slug }).returning();
    return result[0];
  }

  async updatePodcast(id: string, podcast: UpdatePodcast): Promise<Podcast | undefined> {
    const result = await this.db.update(podcasts).set({ ...podcast, updatedAt: new Date() }).where(eq(podcasts.id, id)).returning();
    return result[0];
  }

  async deletePodcast(id: string): Promise<boolean> {
    const result = await this.db.delete(podcasts).where(eq(podcasts.id, id)).returning();
    return result.length > 0;
  }

  async publishPodcast(id: string): Promise<Podcast | undefined> {
    const result = await this.db.update(podcasts).set({ status: "published", publishedAt: new Date(), updatedAt: new Date() }).where(eq(podcasts.id, id)).returning();
    return result[0];
  }

  async unpublishPodcast(id: string): Promise<Podcast | undefined> {
    const result = await this.db.update(podcasts).set({ status: "draft", publishedAt: null, updatedAt: new Date() }).where(eq(podcasts.id, id)).returning();
    return result[0];
  }

  async incrementPodcastPlays(id: string): Promise<Podcast | undefined> {
    const result = await this.db.update(podcasts).set({ playCount: sql`${podcasts.playCount} + 1` }).where(eq(podcasts.id, id)).returning();
    return result[0];
  }

  // Facilities
  async listFacilities(filters?: { facilityType?: string; city?: string; county?: string; status?: string; featured?: string }): Promise<Facility[]> {
    let query = this.db.select().from(facilities);
    const conditions = [];
    if (filters?.facilityType) {
      conditions.push(eq(facilities.facilityType, filters.facilityType));
    }
    if (filters?.city) {
      conditions.push(sql`lower(${facilities.city}) = ${filters.city.toLowerCase()}`);
    }
    if (filters?.county) {
      conditions.push(sql`lower(${facilities.county}) = ${filters.county.toLowerCase()}`);
    }
    if (filters?.status) {
      conditions.push(eq(facilities.status, filters.status));
    }
    if (filters?.featured) {
      conditions.push(eq(facilities.featured, filters.featured));
    }
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    return query.orderBy(facilities.sortOrder, facilities.name);
  }

  async getFacility(id: string): Promise<Facility | undefined> {
    const result = await this.db.select().from(facilities).where(eq(facilities.id, id)).limit(1);
    return result[0];
  }

  async getFacilityBySlug(slug: string): Promise<Facility | undefined> {
    const result = await this.db.select().from(facilities).where(eq(facilities.slug, slug)).limit(1);
    return result[0];
  }

  async createFacility(facility: InsertFacility): Promise<Facility> {
    const existingFacilities = await this.db.select({ slug: facilities.slug }).from(facilities);
    const existingSlugs = existingFacilities.map((f: { slug: string }) => f.slug);
    const slug = facility.slug || generateUniqueSlug(facility.name, existingSlugs);
    const result = await this.db.insert(facilities).values({ ...facility, slug }).returning();
    return result[0];
  }

  async updateFacility(id: string, facility: UpdateFacility): Promise<Facility | undefined> {
    const result = await this.db.update(facilities).set({ ...facility, updatedAt: new Date() }).where(eq(facilities.id, id)).returning();
    return result[0];
  }

  async deleteFacility(id: string): Promise<boolean> {
    const result = await this.db.delete(facilities).where(eq(facilities.id, id)).returning();
    return result.length > 0;
  }

  async publishFacility(id: string): Promise<Facility | undefined> {
    const result = await this.db.update(facilities).set({ status: "published", publishedAt: new Date(), updatedAt: new Date() }).where(eq(facilities.id, id)).returning();
    return result[0];
  }

  async unpublishFacility(id: string): Promise<Facility | undefined> {
    const result = await this.db.update(facilities).set({ status: "draft", publishedAt: null, updatedAt: new Date() }).where(eq(facilities.id, id)).returning();
    return result[0];
  }

  async searchFacilities(query: string, facilityType?: string): Promise<Facility[]> {
    const lowerQuery = `%${query.toLowerCase()}%`;
    let dbQuery = this.db.select().from(facilities).where(
      or(
        sql`lower(${facilities.name}) LIKE ${lowerQuery}`,
        sql`lower(${facilities.city}) LIKE ${lowerQuery}`,
        sql`lower(${facilities.address}) LIKE ${lowerQuery}`,
        sql`lower(${facilities.description}) LIKE ${lowerQuery}`
      )
    );
    if (facilityType) {
      dbQuery = dbQuery.where(eq(facilities.facilityType, facilityType));
    }
    return dbQuery;
  }

  // Facility Reviews
  async listFacilityReviews(facilityId: string, status?: string): Promise<FacilityReview[]> {
    let query = this.db.select().from(facilityReviews).where(eq(facilityReviews.facilityId, facilityId));
    if (status) {
      query = query.where(eq(facilityReviews.status, status));
    }
    return query.orderBy(desc(facilityReviews.createdAt));
  }

  async getFacilityReview(id: string): Promise<FacilityReview | undefined> {
    const result = await this.db.select().from(facilityReviews).where(eq(facilityReviews.id, id)).limit(1);
    return result[0];
  }

  async createFacilityReview(review: InsertFacilityReview): Promise<FacilityReview> {
    const result = await this.db.insert(facilityReviews).values(review).returning();
    return result[0];
  }

  async updateFacilityReview(id: string, review: UpdateFacilityReview): Promise<FacilityReview | undefined> {
    const result = await this.db.update(facilityReviews).set({ ...review, updatedAt: new Date() }).where(eq(facilityReviews.id, id)).returning();
    return result[0];
  }

  async deleteFacilityReview(id: string): Promise<boolean> {
    const result = await this.db.delete(facilityReviews).where(eq(facilityReviews.id, id)).returning();
    return result.length > 0;
  }

  async approveFacilityReview(id: string): Promise<FacilityReview | undefined> {
    const result = await this.db.update(facilityReviews).set({ status: "approved", updatedAt: new Date() }).where(eq(facilityReviews.id, id)).returning();
    return result[0];
  }

  async rejectFacilityReview(id: string): Promise<FacilityReview | undefined> {
    const result = await this.db.update(facilityReviews).set({ status: "rejected", updatedAt: new Date() }).where(eq(facilityReviews.id, id)).returning();
    return result[0];
  }

  // Facility FAQs
  async listFacilityFaqs(facilityId: string): Promise<FacilityFaq[]> {
    return this.db.select().from(facilityFaqs)
      .where(and(eq(facilityFaqs.facilityId, facilityId), eq(facilityFaqs.isActive, "yes")))
      .orderBy(facilityFaqs.displayOrder);
  }

  async getFacilityFaq(id: string): Promise<FacilityFaq | undefined> {
    const result = await this.db.select().from(facilityFaqs).where(eq(facilityFaqs.id, id));
    return result[0];
  }

  async createFacilityFaq(faq: InsertFacilityFaq): Promise<FacilityFaq> {
    const result = await this.db.insert(facilityFaqs).values(faq).returning();
    return result[0];
  }

  async updateFacilityFaq(id: string, faq: UpdateFacilityFaq): Promise<FacilityFaq | undefined> {
    const result = await this.db.update(facilityFaqs).set({ ...faq, updatedAt: new Date() }).where(eq(facilityFaqs.id, id)).returning();
    return result[0];
  }

  async deleteFacilityFaq(id: string): Promise<boolean> {
    const result = await this.db.delete(facilityFaqs).where(eq(facilityFaqs.id, id)).returning();
    return result.length > 0;
  }

  // Quiz Definitions
  async listQuizzes(status?: string, category?: string): Promise<QuizDefinition[]> {
    let query = this.db.select().from(quizDefinitions);
    const conditions = [];
    if (status) conditions.push(eq(quizDefinitions.status, status));
    if (category) conditions.push(eq(quizDefinitions.category, category));
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    return query.orderBy(quizDefinitions.sortOrder);
  }

  async getQuiz(id: string): Promise<QuizDefinition | undefined> {
    const result = await this.db.select().from(quizDefinitions).where(eq(quizDefinitions.id, id)).limit(1);
    return result[0];
  }

  async getQuizBySlug(slug: string): Promise<QuizDefinition | undefined> {
    const result = await this.db.select().from(quizDefinitions).where(eq(quizDefinitions.slug, slug)).limit(1);
    return result[0];
  }

  async getQuizWithQuestions(slug: string): Promise<QuizWithQuestions | undefined> {
    const quiz = await this.getQuizBySlug(slug);
    if (!quiz) return undefined;
    const questions = await this.db.select().from(quizQuestions).where(eq(quizQuestions.quizId, quiz.id)).orderBy(quizQuestions.displayOrder);
    return { ...quiz, questions };
  }

  async createQuiz(quiz: InsertQuizDefinition): Promise<QuizDefinition> {
    const existingSlugs = await this.db.select({ slug: quizDefinitions.slug }).from(quizDefinitions);
    const slugList = existingSlugs.map((s: { slug: string }) => s.slug);
    const slug = quiz.slug || generateUniqueSlug(quiz.title, slugList);
    const result = await this.db.insert(quizDefinitions).values({ ...quiz, slug }).returning();
    return result[0];
  }

  async updateQuiz(id: string, quiz: UpdateQuizDefinition): Promise<QuizDefinition | undefined> {
    const result = await this.db.update(quizDefinitions).set({ ...quiz, updatedAt: new Date() }).where(eq(quizDefinitions.id, id)).returning();
    return result[0];
  }

  async deleteQuiz(id: string): Promise<boolean> {
    const result = await this.db.delete(quizDefinitions).where(eq(quizDefinitions.id, id)).returning();
    return result.length > 0;
  }

  async publishQuiz(id: string): Promise<QuizDefinition | undefined> {
    const result = await this.db.update(quizDefinitions).set({ status: "published", updatedAt: new Date() }).where(eq(quizDefinitions.id, id)).returning();
    return result[0];
  }

  async unpublishQuiz(id: string): Promise<QuizDefinition | undefined> {
    const result = await this.db.update(quizDefinitions).set({ status: "draft", updatedAt: new Date() }).where(eq(quizDefinitions.id, id)).returning();
    return result[0];
  }

  // Quiz Questions
  async listQuizQuestions(quizId: string): Promise<QuizQuestion[]> {
    return this.db.select().from(quizQuestions).where(eq(quizQuestions.quizId, quizId)).orderBy(quizQuestions.displayOrder);
  }

  async getQuizQuestion(id: string): Promise<QuizQuestion | undefined> {
    const result = await this.db.select().from(quizQuestions).where(eq(quizQuestions.id, id)).limit(1);
    return result[0];
  }

  async createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion> {
    const result = await this.db.insert(quizQuestions).values(question).returning();
    return result[0];
  }

  async updateQuizQuestion(id: string, question: UpdateQuizQuestion): Promise<QuizQuestion | undefined> {
    const result = await this.db.update(quizQuestions).set({ ...question, updatedAt: new Date() }).where(eq(quizQuestions.id, id)).returning();
    return result[0];
  }

  async deleteQuizQuestion(id: string): Promise<boolean> {
    const result = await this.db.delete(quizQuestions).where(eq(quizQuestions.id, id)).returning();
    return result.length > 0;
  }

  // Quiz Leads
  async listQuizLeads(filters?: { quizId?: string; status?: string; startDate?: Date; endDate?: Date }): Promise<QuizLead[]> {
    let query = this.db.select().from(quizLeads);
    const conditions = [];
    if (filters?.quizId) conditions.push(eq(quizLeads.quizId, filters.quizId));
    if (filters?.status) conditions.push(eq(quizLeads.status, filters.status));
    if (filters?.startDate) conditions.push(gte(quizLeads.createdAt, filters.startDate));
    if (filters?.endDate) conditions.push(lte(quizLeads.createdAt, filters.endDate));
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    return query.orderBy(desc(quizLeads.createdAt));
  }

  async getQuizLead(id: string): Promise<QuizLead | undefined> {
    const result = await this.db.select().from(quizLeads).where(eq(quizLeads.id, id)).limit(1);
    return result[0];
  }

  async getQuizLeadWithResponses(id: string): Promise<QuizLeadWithResponses | undefined> {
    const lead = await this.getQuizLead(id);
    if (!lead) return undefined;
    const quiz = await this.getQuiz(lead.quizId);
    if (!quiz) return undefined;
    const responses = await this.db.select().from(quizResponses).where(eq(quizResponses.leadId, id));
    const questions = await this.db.select().from(quizQuestions).where(eq(quizQuestions.quizId, quiz.id));
    const questionMap = new Map(questions.map((q: QuizQuestion) => [q.id, q]));
    const responsesWithQuestions = responses.map((r: QuizResponse) => ({
      ...r,
      question: questionMap.get(r.questionId)!
    })).filter((r: any) => r.question);
    return { ...lead, quiz, responses: responsesWithQuestions };
  }

  async createQuizLead(lead: InsertQuizLead): Promise<QuizLead> {
    const result = await this.db.insert(quizLeads).values(lead).returning();
    return result[0];
  }

  async updateQuizLead(id: string, lead: UpdateQuizLead): Promise<QuizLead | undefined> {
    const result = await this.db.update(quizLeads).set({ ...lead, updatedAt: new Date() }).where(eq(quizLeads.id, id)).returning();
    return result[0];
  }

  async deleteQuizLead(id: string): Promise<boolean> {
    const result = await this.db.delete(quizLeads).where(eq(quizLeads.id, id)).returning();
    return result.length > 0;
  }

  async markQuizLeadEmailSent(id: string): Promise<QuizLead | undefined> {
    const result = await this.db.update(quizLeads).set({ emailSent: "yes", emailSentAt: new Date(), updatedAt: new Date() }).where(eq(quizLeads.id, id)).returning();
    return result[0];
  }

  // Quiz Responses
  async createQuizResponse(response: InsertQuizResponse): Promise<QuizResponse> {
    const result = await this.db.insert(quizResponses).values(response).returning();
    // Update lead score
    if (response.scoreContribution) {
      const lead = await this.getQuizLead(response.leadId);
      if (lead) {
        await this.db.update(quizLeads).set({ 
          leadScore: lead.leadScore + response.scoreContribution,
          updatedAt: new Date()
        }).where(eq(quizLeads.id, response.leadId));
      }
    }
    return result[0];
  }

  async listQuizResponsesByLead(leadId: string): Promise<QuizResponse[]> {
    return this.db.select().from(quizResponses).where(eq(quizResponses.leadId, leadId));
  }

  // Quiz Analytics
  async getQuizLeadStats(): Promise<{ total: number; new: number; contacted: number; qualified: number; converted: number }> {
    const leads = await this.db.select().from(quizLeads);
    return {
      total: leads.length,
      new: leads.filter((l: QuizLead) => l.status === "new").length,
      contacted: leads.filter((l: QuizLead) => l.status === "contacted").length,
      qualified: leads.filter((l: QuizLead) => l.status === "qualified").length,
      converted: leads.filter((l: QuizLead) => l.status === "converted").length,
    };
  }

  // Analytics methods
  async createPageView(view: InsertPageView): Promise<PageView> {
    const result = await this.db.insert(pageViews).values(view).returning();
    return result[0];
  }

  async createMediaEvent(event: InsertMediaEvent): Promise<MediaEvent> {
    const result = await this.db.insert(mediaEvents).values(event).returning();
    return result[0];
  }

  async getAnalyticsSummary(): Promise<{
    totalPageViews: number;
    uniqueVisitors: number;
    topPages: { slug: string; views: number }[];
    dailyTraffic: { day: string; views: number }[];
    mediaPlays: { type: string; count: number }[];
  }> {
    const views = await this.db.select().from(pageViews);
    const events = await this.db.select().from(mediaEvents);
    
    const slugCounts = views.reduce((acc: Record<string, number>, v: PageView) => {
      acc[v.slug] = (acc[v.slug] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topPages = Object.entries(slugCounts)
      .map(([slug, views]) => ({ slug, views: views as number }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
    
    const dayCounts = views.reduce((acc: Record<string, number>, v: PageView) => {
      const day = v.timestamp.toISOString().split('T')[0];
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const dailyTraffic = Object.entries(dayCounts)
      .map(([day, views]) => ({ day, views: views as number }))
      .sort((a, b) => a.day.localeCompare(b.day))
      .slice(-7);
    
    const mediaTypeCounts = events
      .filter((e: MediaEvent) => e.eventType === 'play')
      .reduce((acc: Record<string, number>, e: MediaEvent) => {
        acc[e.mediaType] = (acc[e.mediaType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    const mediaPlays = Object.entries(mediaTypeCounts)
      .map(([type, count]) => ({ type, count: count as number }));
    
    const uniqueIps = new Set(views.map((v: PageView) => v.ipMasked).filter(Boolean));
    
    return {
      totalPageViews: views.length,
      uniqueVisitors: uniqueIps.size,
      topPages,
      dailyTraffic,
      mediaPlays,
    };
  }

  // Non-Solicitation Agreements
  async listNonSolicitationAgreements(status?: string): Promise<NonSolicitationAgreement[]> {
    let query = this.db.select().from(nonSolicitationAgreements);
    if (status) {
      query = query.where(eq(nonSolicitationAgreements.status, status));
    }
    return await query.orderBy(desc(nonSolicitationAgreements.createdAt));
  }

  async getNonSolicitationAgreement(id: string): Promise<NonSolicitationAgreement | undefined> {
    const result = await this.db.select().from(nonSolicitationAgreements)
      .where(eq(nonSolicitationAgreements.id, id)).limit(1);
    return result[0];
  }

  async createNonSolicitationAgreement(agreement: Omit<InsertNonSolicitation, 'captchaToken'>): Promise<NonSolicitationAgreement> {
    const result = await this.db.insert(nonSolicitationAgreements).values(agreement).returning();
    return result[0];
  }

  async updateNonSolicitationAgreement(id: string, agreement: UpdateNonSolicitation): Promise<NonSolicitationAgreement | undefined> {
    const result = await this.db.update(nonSolicitationAgreements)
      .set({ ...agreement, updatedAt: new Date() })
      .where(eq(nonSolicitationAgreements.id, id))
      .returning();
    return result[0];
  }

  async deleteNonSolicitationAgreement(id: string): Promise<boolean> {
    const result = await this.db.delete(nonSolicitationAgreements)
      .where(eq(nonSolicitationAgreements.id, id))
      .returning();
    return result.length > 0;
  }

  async markNonSolicitationEmailSent(id: string): Promise<NonSolicitationAgreement | undefined> {
    const result = await this.db.update(nonSolicitationAgreements)
      .set({ emailSentAt: new Date(), updatedAt: new Date() })
      .where(eq(nonSolicitationAgreements.id, id))
      .returning();
    return result[0];
  }

  // Initial Assessments
  async listInitialAssessments(status?: string): Promise<InitialAssessment[]> {
    let query = this.db.select().from(initialAssessments);
    if (status) {
      query = query.where(eq(initialAssessments.status, status));
    }
    return await query.orderBy(desc(initialAssessments.createdAt));
  }

  async getInitialAssessment(id: string): Promise<InitialAssessment | undefined> {
    const result = await this.db.select().from(initialAssessments)
      .where(eq(initialAssessments.id, id)).limit(1);
    return result[0];
  }

  async createInitialAssessment(assessment: Omit<InsertInitialAssessment, 'captchaToken'>): Promise<InitialAssessment> {
    const result = await this.db.insert(initialAssessments).values(assessment).returning();
    return result[0];
  }

  async updateInitialAssessment(id: string, assessment: UpdateInitialAssessment): Promise<InitialAssessment | undefined> {
    const result = await this.db.update(initialAssessments)
      .set({ ...assessment, updatedAt: new Date() })
      .where(eq(initialAssessments.id, id))
      .returning();
    return result[0];
  }

  async deleteInitialAssessment(id: string): Promise<boolean> {
    const result = await this.db.delete(initialAssessments)
      .where(eq(initialAssessments.id, id))
      .returning();
    return result.length > 0;
  }

  async markInitialAssessmentEmailSent(id: string): Promise<InitialAssessment | undefined> {
    const result = await this.db.update(initialAssessments)
      .set({ emailSentAt: new Date(), updatedAt: new Date() })
      .where(eq(initialAssessments.id, id))
      .returning();
    return result[0];
  }

  // Client Intakes
  async listClientIntakes(status?: string): Promise<ClientIntake[]> {
    let query = this.db.select().from(clientIntakes);
    if (status) {
      query = query.where(eq(clientIntakes.status, status));
    }
    return await query.orderBy(desc(clientIntakes.createdAt));
  }

  async getClientIntake(id: string): Promise<ClientIntake | undefined> {
    const result = await this.db.select().from(clientIntakes)
      .where(eq(clientIntakes.id, id)).limit(1);
    return result[0];
  }

  async createClientIntake(intake: Omit<InsertClientIntake, 'captchaToken'>): Promise<ClientIntake> {
    const result = await this.db.insert(clientIntakes).values(intake).returning();
    return result[0];
  }

  async updateClientIntake(id: string, intake: UpdateClientIntake): Promise<ClientIntake | undefined> {
    const result = await this.db.update(clientIntakes)
      .set({ ...intake, updatedAt: new Date() })
      .where(eq(clientIntakes.id, id))
      .returning();
    return result[0];
  }

  async deleteClientIntake(id: string): Promise<boolean> {
    const result = await this.db.delete(clientIntakes)
      .where(eq(clientIntakes.id, id))
      .returning();
    return result.length > 0;
  }

  async markClientIntakeEmailSent(id: string): Promise<ClientIntake | undefined> {
    const result = await this.db.update(clientIntakes)
      .set({ emailSentAt: new Date(), updatedAt: new Date() })
      .where(eq(clientIntakes.id, id))
      .returning();
    return result[0];
  }
}

// Development: Use MemStorage (in-memory) for Replit
// Production: Switch to DbStorage when deploying to Digital Ocean with DATABASE_URL
// Uncomment the following lines for production with PostgreSQL:
const { db } = await import("./db");
export const storage = new DbStorage(db);

// export const storage = new MemStorage();
// const { db } = await import("./db");
