import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Youtube from '@tiptap/extension-youtube';
import Link from '@tiptap/extension-link';
import { TextAlign } from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Header from "@/components/Header";
import ArticleCTA from "@/components/ArticleCTA";
import { ArrowLeft, Share2, Check, HelpCircle } from "lucide-react";
import { Link as WouterLink } from "wouter";
import { Helmet } from "react-helmet";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { Article, ArticleFaq } from "@shared/schema";

export default function ArticlePage() {
  const [, params] = useRoute("/articles/:slug");
  const slug = params?.slug;
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { data: article, isLoading, error } = useQuery<Article>({
    queryKey: ["/api/articles", slug],
    queryFn: async () => {
      const response = await fetch(`/api/articles/${slug}`);
      if (!response.ok) {
        throw new Error("Article not found");
      }
      return response.json();
    },
    enabled: !!slug,
  });

  const { data: faqs } = useQuery<ArticleFaq[]>({
    queryKey: ["/api/articles", article?.id, "faqs"],
    queryFn: async () => {
      const response = await fetch(`/api/articles/${article?.id}/faqs`);
      if (!response.ok) {
        return [];
      }
      return response.json();
    },
    enabled: !!article?.id,
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-md my-4',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full my-4',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-border bg-muted font-bold p-2',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-border p-2',
        },
      }),
      Youtube.configure({
        width: 640,
        height: 360,
        HTMLAttributes: {
          class: 'rounded-md my-4',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: '',
    editable: false,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none',
      },
    },
  });

  // Update editor content when article is loaded
  useEffect(() => {
    if (editor && article?.body) {
      editor.commands.setContent(article.body);
    }
  }, [editor, article?.body]);

  const handleShare = async () => {
    const url = window.location.href;
    const title = article?.title || 'Article';
    const text = article?.excerpt || article?.metaDescription || '';

    // Try Web Share API first (mobile devices)
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        toast({
          title: "Shared successfully",
          description: "Article shared via native share",
        });
      } catch (err: any) {
        // User cancelled or error occurred
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      // Fallback: Copy link to clipboard
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast({
          title: "Link copied!",
          description: "Article link copied to clipboard",
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast({
          title: "Failed to copy",
          description: "Please copy the link manually",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-64 bg-muted rounded"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !article) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist or has been removed.</p>
            <WouterLink href="/articles">
              <Button data-testid="button-back-to-articles">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Articles
              </Button>
            </WouterLink>
          </div>
        </div>
      </>
    );
  }

  const canonicalUrl = `${window.location.origin}/articles/${article.slug}`;

  const structuredData: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "author": {
      "@type": "Organization",
      "name": "PrivateInHomeCareGiver",
      "url": window.location.origin
    },
    "publisher": {
      "@type": "Organization",
      "name": "PrivateInHomeCareGiver",
      "url": window.location.origin
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    "url": canonicalUrl
  };

  if (article.excerpt || article.metaDescription) {
    structuredData.description = article.excerpt || article.metaDescription;
  }

  if (article.heroImageUrl) {
    structuredData.image = article.heroImageUrl;
  }

  if (article.createdAt) {
    structuredData.datePublished = new Date(article.createdAt).toISOString();
  }

  if (article.updatedAt) {
    structuredData.dateModified = new Date(article.updatedAt).toISOString();
  } else if (article.createdAt) {
    structuredData.dateModified = new Date(article.createdAt).toISOString();
  }

  if (article.keywords && article.keywords.length > 0) {
    structuredData.keywords = article.keywords.join(', ');
  }

  if (article.category) {
    structuredData.articleSection = article.category;
  }

  const faqStructuredData = faqs && faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": window.location.origin
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Articles",
        "item": `${window.location.origin}/articles`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": article.title,
        "item": canonicalUrl
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{article.metaTitle || article.title} | Private InHome CareGiver</title>
        <meta name="description" content={article.metaDescription || article.excerpt || ''} />
        
        <link rel="canonical" href={canonicalUrl} />
        
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        
        {/* Massachusetts Geo Targeting - applied for MA-focused articles */}
        <meta name="geo.region" content="US-MA" />
        <meta name="geo.placename" content="Massachusetts" />
        <meta name="geo.position" content="42.4072;-71.3824" />
        <meta name="ICBM" content="42.4072, -71.3824" />
        
        {/* Article keywords - use article-specific keywords if available */}
        {article.keywords && article.keywords.length > 0 && (
          <meta name="keywords" content={article.keywords.join(', ')} />
        )}
        
        <meta property="og:title" content={article.metaTitle || article.title} />
        <meta property="og:description" content={article.metaDescription || article.excerpt || ''} />
        <meta property="og:url" content={canonicalUrl} />
        {article.heroImageUrl && <meta property="og:image" content={article.heroImageUrl} />}
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="PrivateInHomeCareGiver" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.metaTitle || article.title} />
        <meta name="twitter:description" content={article.metaDescription || article.excerpt || ''} />
        {article.heroImageUrl && <meta name="twitter:image" content={article.heroImageUrl} />}
        
        {article.createdAt && <meta property="article:published_time" content={new Date(article.createdAt).toISOString()} />}
        {article.category && <meta property="article:section" content={article.category} />}
        {article.keywords && article.keywords.map(keyword => (
          <meta key={keyword} property="article:tag" content={keyword} />
        ))}
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        {faqStructuredData && (
          <script type="application/ld+json">
            {JSON.stringify(faqStructuredData)}
          </script>
        )}
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbData)}
        </script>
      </Helmet>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <WouterLink href="/articles">
            <Button variant="ghost" className="mb-6" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Articles
            </Button>
          </WouterLink>

          {article.heroImageUrl && (
            <img 
              src={article.heroImageUrl} 
              alt={`${article.title} - Private In-Home Senior Care Article Massachusetts`}
              title={`${article.title} - Private InHome CareGiver Massachusetts`}
              className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
              data-testid="img-hero"
            />
          )}

          <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-title">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-xl text-muted-foreground mb-6" data-testid="text-excerpt">
              {article.excerpt}
            </p>
          )}

          <div className="flex items-center justify-between mb-8">
            {article.keywords && article.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2" data-testid="container-keywords">
                {article.keywords.map(keyword => (
                  <Badge key={keyword} variant="secondary" data-testid={`badge-keyword-${keyword}`}>
                    {keyword}
                  </Badge>
                ))}
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="ml-auto"
              data-testid="button-share"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </>
              )}
            </Button>
          </div>

          <div className="prose-editor prose-article" data-testid="container-body">
            <EditorContent editor={editor} />
          </div>

          {faqs && faqs.length > 0 && (
            <div className="mt-12 border-t pt-8" data-testid="container-faqs">
              <div className="flex items-center gap-2 mb-6">
                <HelpCircle className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={faq.id} value={`faq-${faq.id}`} data-testid={`accordion-faq-${index}`}>
                    <AccordionTrigger className="text-left font-medium" data-testid={`trigger-faq-${index}`}>
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground" data-testid={`content-faq-${index}`}>
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}

          {/* Article CTAs - Conversion Elements */}
          <ArticleCTA category={article.category} />
        </div>
      </div>
    </>
  );
}
