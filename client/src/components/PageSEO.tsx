import { Helmet } from "react-helmet";
import { usePageMeta } from "@/hooks/usePageMeta";

interface PageSEOProps {
  pageSlug: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
  canonicalPath?: string;
}

export default function PageSEO({ pageSlug, fallbackTitle, fallbackDescription, canonicalPath }: PageSEOProps) {
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

  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      
      <link rel="canonical" href={canonicalUrl} />
      
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
