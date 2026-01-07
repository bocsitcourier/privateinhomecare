import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import QuizEngine from "@/components/QuizEngine";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { QuizWithQuestions } from "@shared/schema";

export default function QuizPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: quiz, isLoading, error } = useQuery<QuizWithQuestions>({
    queryKey: [`/api/quizzes/${slug}`],
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-12 px-4">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-12 text-center">
              <h2 className="text-2xl font-bold mb-4">Quiz Not Found</h2>
              <p className="text-muted-foreground">
                The quiz you're looking for doesn't exist or is no longer available.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{quiz.metaTitle || `${quiz.title} | PrivateInHomeCareGiver`}</title>
        <meta 
          name="description" 
          content={quiz.metaDescription || `Take our ${quiz.title} to find the right care solution for your loved one.`} 
        />
        <meta property="og:title" content={quiz.metaTitle || quiz.title} />
        <meta property="og:description" content={quiz.metaDescription || quiz.description || ""} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`${window.location.origin}/quiz/${quiz.slug}`} />
      </Helmet>

      <Header />

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-3" data-testid="text-quiz-title">
              {quiz.title}
            </h1>
            {quiz.subtitle && (
              <p className="text-xl text-muted-foreground mb-4">{quiz.subtitle}</p>
            )}
            {quiz.description && (
              <p className="text-muted-foreground">{quiz.description}</p>
            )}
          </div>

          <QuizEngine 
            quiz={quiz}
            onComplete={(result) => {
              console.log("Quiz completed:", result);
            }}
          />

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Your information is secure and will never be shared.
              <br />
              We'll use it only to provide personalized care recommendations.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
