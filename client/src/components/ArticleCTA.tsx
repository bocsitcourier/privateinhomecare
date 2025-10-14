import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Phone, Users, MapPin, Download } from "lucide-react";
import { Link } from "wouter";

interface ArticleCTAProps {
  category?: string | null;
}

export default function ArticleCTA({ category }: ArticleCTAProps) {
  const categoryLower = category?.toLowerCase() || '';
  
  // Use word boundaries for MA to avoid matching "dementia", "homemaking", etc.
  const isLocalContent = categoryLower.includes('local') || 
                         categoryLower.includes('massachusetts') ||
                         categoryLower === 'ma' ||
                         /\bma\b/.test(categoryLower) || // Word boundary check for "MA"
                         categoryLower.includes('location') ||
                         categoryLower.includes('city') ||
                         categoryLower.includes('regional');
  
  const isCaregivingContent = categoryLower.includes('caregiver') ||
                               categoryLower.includes('career') ||
                               categoryLower.includes('employment') ||
                               categoryLower.includes('job');

  return (
    <div className="space-y-8 mt-12" data-testid="container-article-cta">
      {/* Primary CTA - Free Consultation */}
      <Card className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background border-primary/20">
        <CardContent className="p-8 md:p-10 text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Learn More About Our Services?
          </h3>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Schedule a free, no-obligation consultation to discuss your family's unique needs and discover how we can provide the compassionate care your loved one deserves.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" asChild data-testid="button-cta-consultation">
              <Link href="/consultation">
                <Phone className="w-5 h-5 mr-2" />
                Request Free Consultation
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild data-testid="button-cta-services">
              <Link href="/services">
                <FileText className="w-5 h-5 mr-2" />
                Explore Our Services
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Secondary CTAs - Context-based */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Downloadable Resources */}
        <Card className="hover-elevate">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-2">Free Resources & Guides</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Download our comprehensive family guide to choosing in-home care in Massachusetts.
                </p>
                <Button variant="outline" size="sm" asChild data-testid="button-cta-downloads">
                  <Link href="/resources">
                    Download Guides
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Context-based CTA */}
        {isCaregivingContent ? (
          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-secondary/10">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg mb-2">Join Our Caregiving Team</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Explore rewarding career opportunities with competitive pay and comprehensive training.
                  </p>
                  <Button variant="outline" size="sm" asChild data-testid="button-cta-careers">
                    <Link href="/careers">
                      View Career Opportunities
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : isLocalContent ? (
          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-accent/10">
                  <MapPin className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg mb-2">Find Care in Your Area</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Discover how we serve families throughout Massachusetts with local, trusted caregivers.
                  </p>
                  <Button variant="outline" size="sm" asChild data-testid="button-cta-locations">
                    <Link href="/locations/boston">
                      Explore Local Services
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-accent/10">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg mb-2">Meet Our Caregivers</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get to know our compassionate, professionally trained caregiving team.
                  </p>
                  <Button variant="outline" size="sm" asChild data-testid="button-cta-caregivers">
                    <Link href="/caregivers">
                      Meet Our Team
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Trust Indicators */}
      <Card className="bg-muted/50">
        <CardContent className="p-6 md:p-8">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">10+</div>
              <p className="text-sm text-muted-foreground">Years of Experience</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <p className="text-sm text-muted-foreground">Families Served</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <p className="text-sm text-muted-foreground">Care Available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
