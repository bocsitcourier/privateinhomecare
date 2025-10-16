import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import PageSEO from "@/components/PageSEO";
import { Link } from "wouter";
import type { Article } from "@shared/schema";

export default function ArticlesPage() {
  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  const publishedArticles = Array.isArray(articles) 
    ? articles.filter(a => a.status === 'published')
    : [];

  return (
    <>
      <PageSEO 
        pageSlug="articles"
        fallbackTitle="Articles & Resources | PrivateInHomeCareGiver"
        fallbackDescription="Read our latest articles about in-home care, caregiver tips, and resources for families in Massachusetts."
      />
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-page-title">
              Articles & Resources
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Expert advice, tips, and information about in-home care services in Massachusetts
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg"></div>
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded"></div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : publishedArticles.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground text-lg">
                  No articles available yet. Check back soon for helpful resources and information.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedArticles.map((article) => (
                <Link key={article.id} href={`/articles/${article.slug}`}>
                  <Card 
                    className="hover-elevate cursor-pointer h-full transition-all"
                    data-testid={`card-article-${article.id}`}
                  >
                    {article.heroImageUrl ? (
                      <img 
                        src={article.heroImageUrl} 
                        alt={article.title}
                        className="w-full h-48 object-contain rounded-t-lg"
                        data-testid={`img-article-${article.id}`}
                      />
                    ) : <svg 
                        className="w-full h-48 bg-muted rounded-t-lg"
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        data-testid={`svg-article-placeholder-${article.id}`}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>}
                    <CardHeader>
                      <CardTitle className="line-clamp-2" data-testid={`text-article-title-${article.id}`}>
                        {article.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {article.excerpt && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3" data-testid={`text-article-excerpt-${article.id}`}>
                          {article.excerpt}
                        </p>
                      )}
                      {/* {article.keywords && article.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {article.keywords.slice(0, 3).map(keyword => (
                            <Badge key={keyword} variant="outline" className="text-xs whitespace-pre-line">
                              {keyword}
                            </Badge>
                          ))}
                          {article.keywords.length > 3 && (
                            <Badge variant="outline" className="text-xs whitespace-pre-line">
                              +{article.keywords.length - 3}
                            </Badge>
                          )}
                        </div>
                      )} */}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
