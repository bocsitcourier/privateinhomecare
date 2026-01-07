import { Helmet } from "react-helmet";
import { usePageMeta } from "@/hooks/usePageMeta";

interface PageSEOProps {
  pageSlug: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
  canonicalPath?: string;
  includeMaGeoTargeting?: boolean;
  geoRegion?: string;
  geoPlacename?: string;
  geoPosition?: string;
}

export default function PageSEO({ 
  pageSlug, 
  fallbackTitle, 
  fallbackDescription, 
  canonicalPath,
  includeMaGeoTargeting = false,
  geoRegion = "US-MA",
  geoPlacename = "Massachusetts",
  geoPosition = "42.4072;-71.3824"
}: PageSEOProps) {
  const pageMeta = usePageMeta(pageSlug);

  const title = pageMeta?.title || fallbackTitle || "PrivateInHomeCareGiver";
  const description = pageMeta?.description || fallbackDescription || "";
  const ogTitle = pageMeta?.ogTitle || title;
  const ogDescription = pageMeta?.ogDescription || description;
  const ogImageUrl = pageMeta?.ogImageUrl;
  const keywords = pageMeta?.keywords || [];

  const baseUrl = window.location.origin;
  const canonicalUrl = canonicalPath 
    ? `${baseUrl}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`
    : `${baseUrl}${window.location.pathname}`;

  const allKeywords = includeMaGeoTargeting ? [
    "Massachusetts in-home care",
    "MA home health care",
    "Boston area caregivers",
    "Massachusetts PCA services",
    "MassHealth home care",
    ...keywords
  ] : keywords;

  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {allKeywords.length > 0 && <meta name="keywords" content={allKeywords.join(', ')} />}
      
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Massachusetts Geo Targeting (opt-in) */}
      {includeMaGeoTargeting && (
        <>
          <meta name="geo.region" content={geoRegion} />
          <meta name="geo.placename" content={geoPlacename} />
          <meta name="geo.position" content={geoPosition} />
          <meta name="ICBM" content={geoPosition.replace(';', ', ')} />
        </>
      )}
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={ogTitle} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="PrivateInHomeCareGiver" />
      {ogDescription && <meta property="og:description" content={ogDescription} />}
      {ogImageUrl && <meta property="og:image" content={ogImageUrl} />}
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle} />
      {ogDescription && <meta name="twitter:description" content={ogDescription} />}
      {ogImageUrl && <meta name="twitter:image" content={ogImageUrl} />}
    </Helmet>
  );
}
