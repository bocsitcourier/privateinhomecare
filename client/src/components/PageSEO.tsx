import { Helmet } from "react-helmet";
import { usePageMeta } from "@/hooks/usePageMeta";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface PageSEOProps {
  pageSlug: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
  canonicalPath?: string;
  includeMaGeoTargeting?: boolean;
  geoRegion?: string;
  geoPlacename?: string;
  geoPosition?: string;
  pageType?: "website" | "article" | "local_business" | "service" | "profile";
  breadcrumbs?: BreadcrumbItem[];
  articleData?: {
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    section?: string;
  };
  serviceData?: {
    serviceName?: string;
    serviceType?: string;
    areaServed?: string;
  };
  noindex?: boolean;
}

const COMPANY_INFO = {
  name: "PrivateInHomeCareGiver",
  legalName: "Private InHome CareGiver LLC",
  phone: "+1-617-686-0595",
  email: "info@privateinhomecaregiver.com",
  address: {
    streetAddress: "Massachusetts",
    addressLocality: "Boston",
    addressRegion: "MA",
    postalCode: "02101",
    addressCountry: "US"
  },
  url: "https://privateinhomecaregiver.com",
  logo: "https://privateinhomecaregiver.com/logo.png",
  sameAs: [
    "https://www.facebook.com/privateinhomecaregiver",
    "https://www.linkedin.com/company/privateinhomecaregiver"
  ],
  priceRange: "$$-$$$",
  paymentAccepted: "Private Pay, Long-term Care Insurance, VA Benefits",
  description: "Massachusetts' trusted private pay in-home senior care provider. We offer personal care, companionship, homemaking, and dementia care services for seniors throughout the Commonwealth."
};

export default function PageSEO({ 
  pageSlug, 
  fallbackTitle, 
  fallbackDescription, 
  canonicalPath,
  includeMaGeoTargeting = false,
  geoRegion = "US-MA",
  geoPlacename = "Massachusetts",
  geoPosition = "42.4072;-71.3824",
  pageType = "website",
  breadcrumbs,
  articleData,
  serviceData,
  noindex = false
}: PageSEOProps) {
  const pageMeta = usePageMeta(pageSlug);

  const title = pageMeta?.title || fallbackTitle || "PrivateInHomeCareGiver";
  const description = pageMeta?.description || fallbackDescription || "";
  const ogTitle = pageMeta?.ogTitle || title;
  const ogDescription = pageMeta?.ogDescription || description;
  const ogImageUrl = pageMeta?.ogImageUrl || `${COMPANY_INFO.url}/og-default.jpg`;
  const keywords = pageMeta?.keywords || [];

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : COMPANY_INFO.url;
  const canonicalUrl = canonicalPath 
    ? `${baseUrl}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`
    : typeof window !== 'undefined' ? `${baseUrl}${window.location.pathname}` : baseUrl;

  // Private pay focused keywords - NO MassHealth/Medicare references
  const allKeywords = includeMaGeoTargeting ? [
    "Massachusetts private pay home care",
    "MA senior care services",
    "Boston area private caregivers",
    "Massachusetts elderly care",
    "private in-home care Massachusetts",
    "senior companion care MA",
    ...keywords
  ] : keywords;

  // Generate Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": ["HomeHealthCareService", "LocalBusiness", "MedicalBusiness", "ProfessionalService"],
    "@id": `${COMPANY_INFO.url}/#organization`,
    name: COMPANY_INFO.name,
    legalName: COMPANY_INFO.legalName,
    url: COMPANY_INFO.url,
    logo: COMPANY_INFO.logo,
    image: ogImageUrl,
    description: COMPANY_INFO.description,
    telephone: COMPANY_INFO.phone,
    email: COMPANY_INFO.email,
    priceRange: COMPANY_INFO.priceRange,
    paymentAccepted: COMPANY_INFO.paymentAccepted,
    currenciesAccepted: "USD",
    address: {
      "@type": "PostalAddress",
      ...COMPANY_INFO.address
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 42.4072,
      longitude: -71.3824
    },
    areaServed: {
      "@type": "State",
      name: "Massachusetts",
      containedInPlace: {
        "@type": "Country",
        name: "United States"
      }
    },
    sameAs: COMPANY_INFO.sameAs,
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59"
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Senior Care Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Personal Care",
            description: "Assistance with bathing, grooming, dressing, toileting, and mobility for seniors"
          }
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Companion Care",
            description: "Friendly companionship, conversation, activities, and social engagement for elderly adults"
          }
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Homemaking Services",
            description: "Meal preparation, light housekeeping, laundry, and errands for seniors"
          }
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Dementia Care",
            description: "Specialized memory care support for seniors with Alzheimer's and dementia"
          }
        }
      ]
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "127",
      bestRating: "5"
    }
  };

  // Generate Breadcrumb Schema
  const breadcrumbSchema = breadcrumbs && breadcrumbs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`
    }))
  } : null;

  // Generate Article Schema
  const articleSchema = articleData ? {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: description,
    image: ogImageUrl,
    author: {
      "@type": "Organization",
      name: articleData.author || COMPANY_INFO.name
    },
    publisher: {
      "@type": "Organization",
      name: COMPANY_INFO.name,
      logo: {
        "@type": "ImageObject",
        url: COMPANY_INFO.logo
      }
    },
    datePublished: articleData.publishedTime,
    dateModified: articleData.modifiedTime,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl
    }
  } : null;

  // Determine OG type
  const ogType = pageType === "article" ? "article" : 
                 pageType === "profile" ? "profile" : "website";

  // Build the meta elements array for geo targeting
  const geoMetas = includeMaGeoTargeting ? [
    <meta key="geo-region" name="geo.region" content={geoRegion} />,
    <meta key="geo-place" name="geo.placename" content={geoPlacename} />,
    <meta key="geo-position" name="geo.position" content={geoPosition} />,
    <meta key="icbm" name="ICBM" content={geoPosition.replace(';', ', ')} />,
    <meta key="dc-coverage" name="dc.coverage" content="Massachusetts, United States" />
  ] : [];

  // Article metas
  const articleMetas = articleData ? [
    articleData.publishedTime && <meta key="article-pub" property="article:published_time" content={articleData.publishedTime} />,
    articleData.modifiedTime && <meta key="article-mod" property="article:modified_time" content={articleData.modifiedTime} />,
    articleData.section && <meta key="article-sec" property="article:section" content={articleData.section} />,
    <meta key="article-author" property="article:author" content={articleData.author || COMPANY_INFO.name} />
  ].filter(Boolean) : [];

  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {allKeywords.length > 0 && <meta name="keywords" content={allKeywords.join(', ')} />}
      <link rel="canonical" href={canonicalUrl} />
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"} />
      <meta name="googlebot" content={noindex ? "noindex, nofollow" : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"} />
      <meta name="bingbot" content={noindex ? "noindex, nofollow" : "index, follow"} />
      <meta name="author" content={COMPANY_INFO.name} />
      <meta name="publisher" content={COMPANY_INFO.name} />
      <meta name="copyright" content={`© ${new Date().getFullYear()} ${COMPANY_INFO.name}`} />
      {geoMetas}
      <meta property="og:title" content={ogTitle} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={COMPANY_INFO.name} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:type" content={ogType} />
      <meta property="og:locale" content="en_US" />
      {articleMetas}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={ogDescription || description} />
      <meta name="twitter:image" content={ogImageUrl} />
      <meta name="twitter:site" content="@PrivateInHomeCare" />
      <meta name="twitter:creator" content="@PrivateInHomeCare" />
      <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
      {breadcrumbSchema && <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>}
      {articleSchema && <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>}
    </Helmet>
  );
}

// Export company info for use in other components
export { COMPANY_INFO };
