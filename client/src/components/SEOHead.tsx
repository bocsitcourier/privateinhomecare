import { Helmet } from "react-helmet";

interface OrganizationSchema {
  type: "Organization";
  name: string;
  url: string;
  logo?: string;
  description?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  telephone?: string;
  email?: string;
  sameAs?: string[];
}

interface LocalBusinessSchema {
  type: "LocalBusiness" | "MedicalBusiness" | "NursingHome" | "Hospital";
  name: string;
  description?: string;
  url?: string;
  telephone?: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode?: string;
    addressCountry: string;
  };
  geo?: {
    latitude: string;
    longitude: string;
  };
  priceRange?: string;
  openingHours?: string[];
  aggregateRating?: {
    ratingValue: string;
    reviewCount: number;
  };
  image?: string;
  amenityFeature?: string[];
  medicalSpecialty?: string[];
}

interface ArticleSchema {
  type: "Article" | "BlogPosting" | "NewsArticle";
  headline: string;
  description?: string;
  image?: string;
  author?: string;
  publisher?: string;
  datePublished?: string;
  dateModified?: string;
  mainEntityOfPage?: string;
}

interface FAQSchema {
  type: "FAQPage";
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

interface BreadcrumbSchema {
  type: "BreadcrumbList";
  items: Array<{
    name: string;
    url: string;
  }>;
}

interface VideoSchema {
  type: "VideoObject";
  name: string;
  description?: string;
  thumbnailUrl?: string;
  uploadDate?: string;
  duration?: string;
  contentUrl?: string;
  embedUrl?: string;
}

interface ServiceSchema {
  type: "Service";
  name: string;
  description?: string;
  provider?: string;
  serviceType?: string;
  areaServed?: string;
}

type StructuredDataSchema = 
  | OrganizationSchema 
  | LocalBusinessSchema 
  | ArticleSchema 
  | FAQSchema 
  | BreadcrumbSchema
  | VideoSchema
  | ServiceSchema;

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "profile" | "place";
  twitterCard?: "summary" | "summary_large_image" | "app" | "player";
  noIndex?: boolean;
  noFollow?: boolean;
  geoRegion?: string;
  geoPlacename?: string;
  geoPosition?: string;
  structuredData?: StructuredDataSchema | StructuredDataSchema[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  articleSection?: string;
}

function generateStructuredData(schema: StructuredDataSchema): object {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://privateinhomecaregiver.com';
  
  switch (schema.type) {
    case "Organization":
      return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": schema.name,
        "url": schema.url,
        "logo": schema.logo,
        "description": schema.description,
        "address": schema.address ? {
          "@type": "PostalAddress",
          "streetAddress": schema.address.streetAddress,
          "addressLocality": schema.address.addressLocality,
          "addressRegion": schema.address.addressRegion,
          "postalCode": schema.address.postalCode,
          "addressCountry": schema.address.addressCountry || "US"
        } : undefined,
        "telephone": schema.telephone,
        "email": schema.email,
        "sameAs": schema.sameAs
      };

    case "LocalBusiness":
    case "MedicalBusiness":
    case "NursingHome":
    case "Hospital":
      return {
        "@context": "https://schema.org",
        "@type": schema.type,
        "name": schema.name,
        "description": schema.description,
        "url": schema.url,
        "telephone": schema.telephone,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": schema.address.streetAddress,
          "addressLocality": schema.address.addressLocality,
          "addressRegion": schema.address.addressRegion,
          "postalCode": schema.address.postalCode,
          "addressCountry": schema.address.addressCountry
        },
        "geo": schema.geo ? {
          "@type": "GeoCoordinates",
          "latitude": schema.geo.latitude,
          "longitude": schema.geo.longitude
        } : undefined,
        "priceRange": schema.priceRange,
        "openingHours": schema.openingHours,
        "aggregateRating": schema.aggregateRating ? {
          "@type": "AggregateRating",
          "ratingValue": schema.aggregateRating.ratingValue,
          "reviewCount": schema.aggregateRating.reviewCount,
          "bestRating": "5",
          "worstRating": "1"
        } : undefined,
        "image": schema.image,
        "amenityFeature": schema.amenityFeature?.map(a => ({
          "@type": "LocationFeatureSpecification",
          "name": a
        })),
        "medicalSpecialty": schema.medicalSpecialty
      };

    case "Article":
    case "BlogPosting":
    case "NewsArticle":
      return {
        "@context": "https://schema.org",
        "@type": schema.type,
        "headline": schema.headline,
        "description": schema.description,
        "image": schema.image,
        "author": schema.author ? {
          "@type": "Organization",
          "name": schema.author
        } : undefined,
        "publisher": {
          "@type": "Organization",
          "name": schema.publisher || "PrivateInHomeCareGiver",
          "logo": {
            "@type": "ImageObject",
            "url": `${baseUrl}/logo.png`
          }
        },
        "datePublished": schema.datePublished,
        "dateModified": schema.dateModified,
        "mainEntityOfPage": schema.mainEntityOfPage || {
          "@type": "WebPage",
          "@id": baseUrl
        }
      };

    case "FAQPage":
      return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": schema.questions.map(q => ({
          "@type": "Question",
          "name": q.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": q.answer
          }
        }))
      };

    case "BreadcrumbList":
      return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": schema.items.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.name,
          "item": item.url
        }))
      };

    case "VideoObject":
      return {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        "name": schema.name,
        "description": schema.description,
        "thumbnailUrl": schema.thumbnailUrl,
        "uploadDate": schema.uploadDate,
        "duration": schema.duration,
        "contentUrl": schema.contentUrl,
        "embedUrl": schema.embedUrl
      };

    case "Service":
      return {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": schema.name,
        "description": schema.description,
        "provider": schema.provider ? {
          "@type": "Organization",
          "name": schema.provider
        } : undefined,
        "serviceType": schema.serviceType,
        "areaServed": schema.areaServed ? {
          "@type": "State",
          "name": schema.areaServed
        } : undefined
      };

    default:
      return {};
  }
}

export default function SEOHead({
  title,
  description,
  canonicalUrl,
  keywords = [],
  ogTitle,
  ogDescription,
  ogImage,
  ogType = "website",
  twitterCard = "summary_large_image",
  noIndex = false,
  noFollow = false,
  geoRegion,
  geoPlacename,
  geoPosition,
  structuredData,
  author,
  publishedTime,
  modifiedTime,
  articleSection
}: SEOHeadProps) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://privateinhomecaregiver.com';
  const fullCanonicalUrl = canonicalUrl 
    ? (canonicalUrl.startsWith('http') ? canonicalUrl : `${baseUrl}${canonicalUrl.startsWith('/') ? canonicalUrl : `/${canonicalUrl}`}`)
    : `${baseUrl}${typeof window !== 'undefined' ? window.location.pathname : ''}`;

  const robotsContent = [
    noIndex ? 'noindex' : 'index',
    noFollow ? 'nofollow' : 'follow',
    'max-image-preview:large',
    'max-snippet:-1',
    'max-video-preview:-1'
  ].join(', ');

  const structuredDataArray = structuredData 
    ? (Array.isArray(structuredData) ? structuredData : [structuredData])
    : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      
      <link rel="canonical" href={fullCanonicalUrl} />
      
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />
      <meta name="bingbot" content={robotsContent} />
      
      {author && <meta name="author" content={author} />}
      
      {geoRegion && <meta name="geo.region" content={geoRegion} />}
      {geoPlacename && <meta name="geo.placename" content={geoPlacename} />}
      {geoPosition && (
        <>
          <meta name="geo.position" content={geoPosition} />
          <meta name="ICBM" content={geoPosition.replace(';', ', ')} />
        </>
      )}
      
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="PrivateInHomeCareGiver" />
      <meta property="og:locale" content="en_US" />
      {ogImage && <meta property="og:image" content={ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`} />}
      
      {ogType === "article" && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {articleSection && <meta property="article:section" content={articleSection} />}
          {author && <meta property="article:author" content={author} />}
        </>
      )}
      
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={ogTitle || title} />
      <meta name="twitter:description" content={ogDescription || description} />
      {ogImage && <meta name="twitter:image" content={ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`} />}
      
      {structuredDataArray.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(generateStructuredData(schema), null, 0)}
        </script>
      ))}
    </Helmet>
  );
}

export function generateFacilityKeywords(facility: {
  name: string;
  facilityType: string;
  city: string;
  county?: string;
  services?: string[];
  specializations?: string[];
}): string[] {
  const facilityTypeNames: Record<string, string> = {
    'nursing-home': 'nursing home',
    'assisted-living': 'assisted living',
    'memory-care': 'memory care',
    'independent-living': 'independent living',
    'continuing-care': 'continuing care retirement community',
    'hospice': 'hospice care',
    'hospital': 'hospital'
  };

  const typeName = facilityTypeNames[facility.facilityType] || facility.facilityType;
  const city = facility.city;
  const county = facility.county || '';

  const keywords = [
    `${typeName} in ${city} MA`,
    `${city} ${typeName}`,
    `${typeName} near ${city} Massachusetts`,
    `best ${typeName} ${city}`,
    `${city} MA ${typeName} facility`,
    `affordable ${typeName} in ${city}`,
    `top rated ${typeName} ${city} Massachusetts`,
    `${facility.name}`,
    `${facility.name} reviews`,
    `${facility.name} ${city}`,
  ];

  if (county) {
    keywords.push(
      `${typeName} in ${county} County MA`,
      `${county} County ${typeName}`,
      `${typeName} near ${county} Massachusetts`
    );
  }

  if (facility.services && facility.services.length > 0) {
    facility.services.slice(0, 5).forEach(service => {
      keywords.push(`${service} ${city} MA`);
      keywords.push(`${typeName} with ${service}`);
    });
  }

  if (facility.specializations && facility.specializations.length > 0) {
    facility.specializations.slice(0, 3).forEach(spec => {
      keywords.push(`${spec} care ${city}`);
      keywords.push(`${typeName} specializing in ${spec}`);
    });
  }

  keywords.push(
    `senior care ${city} Massachusetts`,
    `elder care facilities ${city}`,
    `long-term care ${city} MA`,
    `Medicare certified ${typeName} ${city}`,
    `Medicaid accepted ${typeName} ${city}`
  );

  return Array.from(new Set(keywords));
}

export function generateFacilityMetaDescription(facility: {
  name: string;
  facilityType: string;
  city: string;
  state?: string;
  overallRating?: string;
  reviewCount?: number;
  services?: string[];
  acceptsMedicare?: string;
  acceptsMedicaid?: string;
}): string {
  const facilityTypeNames: Record<string, string> = {
    'nursing-home': 'nursing home',
    'assisted-living': 'assisted living facility',
    'memory-care': 'memory care facility',
    'independent-living': 'independent living community',
    'continuing-care': 'continuing care retirement community',
    'hospice': 'hospice care provider',
    'hospital': 'hospital'
  };

  const typeName = facilityTypeNames[facility.facilityType] || 'senior care facility';
  let description = `${facility.name} is a ${typeName} in ${facility.city}, ${facility.state || 'MA'}. `;

  if (facility.overallRating && parseFloat(facility.overallRating) > 0) {
    description += `Rated ${facility.overallRating}/5`;
    if (facility.reviewCount && facility.reviewCount > 0) {
      description += ` based on ${facility.reviewCount} reviews`;
    }
    description += '. ';
  }

  if (facility.services && facility.services.length > 0) {
    const topServices = facility.services.slice(0, 3).join(', ');
    description += `Services include ${topServices}. `;
  }

  const insurance: string[] = [];
  if (facility.acceptsMedicare === 'yes') insurance.push('Medicare');
  if (facility.acceptsMedicaid === 'yes') insurance.push('Medicaid');
  if (insurance.length > 0) {
    description += `Accepts ${insurance.join(' and ')}. `;
  }

  description += `Find contact info, pricing, and reviews.`;

  return description.substring(0, 160);
}

export type { 
  OrganizationSchema, 
  LocalBusinessSchema, 
  ArticleSchema, 
  FAQSchema, 
  BreadcrumbSchema,
  VideoSchema,
  ServiceSchema,
  StructuredDataSchema,
  SEOHeadProps 
};
