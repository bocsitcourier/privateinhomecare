import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, Phone } from "lucide-react";
import { Link } from "wouter";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Page Not Found - Private InHome CareGiver</title>
        <meta name="description" content="The page you're looking for doesn't exist. Return to our homepage or contact us for assistance with in-home care services in Massachusetts." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Header />
      <div className="min-h-screen w-full flex items-center justify-center bg-background px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <AlertCircle className="h-20 w-20 text-primary" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Page Not Found
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            We couldn't find the page you're looking for. It may have been moved or deleted.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" className="w-full sm:w-auto" data-testid="button-home">
                <Home className="w-5 h-5 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Link href="/consultation">
              <Button size="lg" variant="outline" className="w-full sm:w-auto" data-testid="button-contact">
                <Phone className="w-5 h-5 mr-2" />
                Contact Us
              </Button>
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">
              Looking for something specific?
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/services" className="text-sm text-primary hover:underline">Services</Link>
              <span className="text-muted-foreground">•</span>
              <Link href="/careers" className="text-sm text-primary hover:underline">Careers</Link>
              <span className="text-muted-foreground">•</span>
              <Link href="/articles" className="text-sm text-primary hover:underline">Articles</Link>
              <span className="text-muted-foreground">•</span>
              <Link href="/intake" className="text-sm text-primary hover:underline">Client Intake</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
