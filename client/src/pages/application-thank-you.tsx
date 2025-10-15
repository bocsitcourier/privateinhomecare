import { useEffect } from "react";
import { Link } from "wouter";
import { CheckCircle2, Briefcase, Home, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import PageSEO from "@/components/PageSEO";

export default function ApplicationThankYouPage() {
  return (
    <div className="min-h-screen bg-background">
      <PageSEO 
        pageSlug="application-thank-you"
        fallbackTitle="Application Received — PrivateInHomeCareGiver"
        fallbackDescription="Thank you for your job application. We will review your submission and contact you soon."
      />
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="text-center">
          <CardContent className="py-12">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-primary/10 p-4">
                <CheckCircle2 className="h-16 w-16 text-primary" data-testid="icon-success" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold mb-4" data-testid="heading-thank-you">
              Application Submitted Successfully!
            </h1>
            
            <p className="text-lg text-muted-foreground mb-6" data-testid="text-confirmation">
              Thank you for your interest in joining our caregiving team. We have received your application and will review your qualifications carefully.
            </p>

            <div className="bg-muted/50 rounded-lg p-6 mb-8 max-w-lg mx-auto">
              <h2 className="font-semibold mb-3 flex items-center justify-center gap-2">
                <Mail className="h-5 w-5" />
                What happens next?
              </h2>
              <ul className="text-sm text-muted-foreground space-y-2 text-left">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Our HR team will review your application within 3-5 business days</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>If your qualifications match our needs, we'll contact you via email or phone</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Please check your email regularly for updates on your application status</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="default" data-testid="button-view-jobs">
                <Link href="/careers">
                  <Briefcase className="mr-2 h-4 w-4" />
                  View Other Positions
                </Link>
              </Button>
              <Button asChild variant="outline" data-testid="button-home">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Return Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
