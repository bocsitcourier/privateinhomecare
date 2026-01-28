import { Switch, Route, useLocation } from "wouter";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ScheduleCallBanner from "@/components/ScheduleCallBanner";
import ApplyJobBanner from "@/components/ApplyJobBanner";

// Eager load critical pages
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

// Lazy load other pages for code splitting
const AdminPage = lazy(() => import("@/pages/admin"));
const AdminProfile = lazy(() => import("@/pages/admin/profile"));
const AdminInquiries = lazy(() => import("@/pages/admin/inquiries"));
const AdminApplications = lazy(() => import("@/pages/admin/applications"));
const AdminReferrals = lazy(() => import("@/pages/admin/referrals"));
const AdminFacilities = lazy(() => import("@/pages/admin/facilities"));
const ServicesPage = lazy(() => import("@/pages/services"));
const ConsultationPage = lazy(() => import("@/pages/consultation"));
const CaregiversPage = lazy(() => import("@/pages/caregivers"));
const CaregiverProfilePage = lazy(() => import("@/pages/caregiver-profile"));
const ArticlesPage = lazy(() => import("@/pages/articles"));
const ArticlePage = lazy(() => import("@/pages/article"));
const CareersPage = lazy(() => import("@/pages/careers"));
const ApplyPage = lazy(() => import("@/pages/apply"));
const CityPage = lazy(() => import("@/pages/city"));
const PrivacyPolicyPage = lazy(() => import("@/pages/privacy-policy"));
const NonSolicitationPolicyPage = lazy(() => import("@/pages/non-solicitation-policy"));
const IntakePage = lazy(() => import("@/pages/intake"));
const CaregiverLogPage = lazy(() => import("@/pages/caregiver-log"));
const HipaaAcknowledgmentPage = lazy(() => import("@/pages/hipaa-acknowledgment"));
const ApplicationThankYouPage = lazy(() => import("@/pages/application-thank-you"));
const ResourcesPage = lazy(() => import("@/pages/resources"));
const TermsAndConditionsPage = lazy(() => import("@/pages/terms-and-conditions"));
const ReferAFriendPage = lazy(() => import("@/pages/refer-a-friend"));
const DirectoryPage = lazy(() => import("@/pages/directory"));
const CareTypeStatePage = lazy(() => import("@/pages/care-type-state"));
const CareTypeLocationPage = lazy(() => import("@/pages/care-type-location"));
const VideosPage = lazy(() => import("@/pages/videos"));
const VideoDetailPage = lazy(() => import("@/pages/video-detail"));
const PodcastsPage = lazy(() => import("@/pages/podcasts"));
const CaregiverResourcesPage = lazy(() => import("@/pages/caregiver-resources"));
const NursingHomesPage = lazy(() => import("@/pages/care-options/nursing-homes"));
const AssistedLivingPage = lazy(() => import("@/pages/care-options/assisted-living"));
const MemoryCarePage = lazy(() => import("@/pages/care-options/memory-care"));
const IndependentLivingPage = lazy(() => import("@/pages/care-options/independent-living"));
const HomeCareOverviewPage = lazy(() => import("@/pages/care-options/home-care"));
const HospicePalliativeCarePage = lazy(() => import("@/pages/care-options/hospice-palliative-care"));
const FacilityDirectoryPage = lazy(() => import("@/pages/facility-directory"));
const FacilityDetailPage = lazy(() => import("@/pages/facility-detail"));
const QuizPage = lazy(() => import("@/pages/quiz"));
const AdminQuizLeads = lazy(() => import("@/pages/admin/quiz-leads"));
const AdminArticles = lazy(() => import("@/pages/admin/articles"));
const AdminVideos = lazy(() => import("@/pages/admin/videos"));
const AdminPodcasts = lazy(() => import("@/pages/admin/podcasts"));
const AgingResourcesPage = lazy(() => import("@/pages/aging-resources"));
const FindHospitalPage = lazy(() => import("@/pages/find-hospital"));

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/services" component={ServicesPage} />
        <Route path="/consultation" component={ConsultationPage} />
        <Route path="/caregivers" component={CaregiversPage} />
        <Route path="/caregivers/:id" component={CaregiverProfilePage} />
        <Route path="/articles" component={ArticlesPage} />
        <Route path="/articles/:slug" component={ArticlePage} />
        <Route path="/careers" component={CareersPage} />
        <Route path="/apply" component={ApplyPage} />
        <Route path="/resources" component={ResourcesPage} />
        <Route path="/caregiver-resources" component={CaregiverResourcesPage} />
        <Route path="/videos" component={VideosPage} />
        <Route path="/videos/:slug" component={VideoDetailPage} />
        <Route path="/podcasts" component={PodcastsPage} />
        <Route path="/aging-resources" component={AgingResourcesPage} />
        <Route path="/find-hospital" component={FindHospitalPage} />
        <Route path="/application-thank-you" component={ApplicationThankYouPage} />
        <Route path="/directory" component={DirectoryPage} />
        <Route path="/locations/:citySlug" component={CityPage} />
        <Route path="/nursing-homes/massachusetts" component={NursingHomesPage} />
        <Route path="/assisted-living/massachusetts" component={AssistedLivingPage} />
        <Route path="/memory-care/massachusetts" component={MemoryCarePage} />
        <Route path="/independent-living/massachusetts" component={IndependentLivingPage} />
        <Route path="/home-care/massachusetts" component={HomeCareOverviewPage} />
        <Route path="/hospice-palliative-care/massachusetts" component={HospicePalliativeCarePage} />
        <Route path="/facilities" component={FacilityDirectoryPage} />
        <Route path="/facilities/:type" component={FacilityDirectoryPage} />
        <Route path="/facility/:slug" component={FacilityDetailPage} />
        <Route path="/:careType/massachusetts/:citySlug" component={CareTypeLocationPage} />
        <Route path="/:careType/massachusetts" component={CareTypeStatePage} />
        <Route path="/privacy-policy" component={PrivacyPolicyPage} />
        <Route path="/non-solicitation-policy" component={NonSolicitationPolicyPage} />
        <Route path="/terms-and-conditions" component={TermsAndConditionsPage} />
        <Route path="/intake" component={IntakePage} />
        <Route path="/caregiver-log" component={CaregiverLogPage} />
        <Route path="/hipaa-acknowledgment" component={HipaaAcknowledgmentPage} />
        <Route path="/refer-a-friend" component={ReferAFriendPage} />
        <Route path="/quiz/:slug" component={QuizPage} />
        <Route path="/admin/quiz-leads" component={AdminQuizLeads} />
        <Route path="/admin/articles" component={AdminArticles} />
        <Route path="/admin/videos" component={AdminVideos} />
        <Route path="/admin/podcasts" component={AdminPodcasts} />
        <Route path="/admin/inquiries" component={AdminInquiries} />
        <Route path="/admin/applications" component={AdminApplications} />
        <Route path="/admin/referrals" component={AdminReferrals} />
        <Route path="/admin/facilities" component={AdminFacilities} />
        <Route path="/admin/profile" component={AdminProfile} />
        <Route path="/admin" component={AdminPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith('/admin');

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {!isAdminRoute && <ScheduleCallBanner />}
        {!isAdminRoute && <ApplyJobBanner />}
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
