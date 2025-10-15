import Header from "@/components/Header";
import PageSEO from "@/components/PageSEO";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

export default function ResourcesPage() {
  const handleDownload = (brochureUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = brochureUrl;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <PageSEO
        pageSlug="resources"
        fallbackTitle="Resources & Guides - Getting Started with Home Care | PrivateInHomeCareGiver"
        fallbackDescription="Download our comprehensive home care guides and learn everything you need to know about choosing the right care for your loved one in Massachusetts."
        canonicalPath="/resources"
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-primary/5 to-secondary/5 py-16">
            <div className="container mx-auto px-4 max-w-6xl">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4" data-testid="text-page-title">
                Getting Started with Home Care
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl" data-testid="text-page-description">
                Access our comprehensive guides, brochures, and resources to help you make informed decisions about in-home care for your loved ones.
              </p>
            </div>
          </section>

          {/* Main Content */}
          <section className="py-16">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="grid md:grid-cols-2 gap-12 items-start">
                
                {/* Left: Brochure Preview */}
                <div className="space-y-6">
                  <div 
                    className="relative bg-gradient-to-br from-primary to-secondary rounded-lg overflow-hidden shadow-xl aspect-[3/4] flex items-center justify-center group hover-elevate"
                    data-testid="card-brochure-preview"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a] via-primary to-[#f97316] opacity-90"></div>
                    <div className="relative z-10 text-white p-8 text-center">
                      <div className="mb-6">
                        <div className="inline-block bg-white/20 rounded-full p-3 mb-4">
                          <FileText className="w-12 h-12" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold mb-4">
                        Private In-Home Care
                      </h3>
                      <p className="text-lg mb-2 font-semibold">
                        Your Partner for Compassionate, Professional Senior Support
                      </p>
                      <div className="mt-8 pt-8 border-t border-white/30">
                        <p className="text-sm opacity-90 mb-2">
                          Comprehensive Guide Covering:
                        </p>
                        <ul className="text-sm space-y-1 opacity-90">
                          <li>• Our Rigorous Approach to Care</li>
                          <li>• Personalized Care Plans</li>
                          <li>• Complete Service Catalog</li>
                          <li>• How to Get Started</li>
                        </ul>
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-white rounded-full p-3 shadow-lg">
                      <Download className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  
                  {/* Additional Brochure Info */}
                  <div className="bg-card rounded-lg p-6 border" data-testid="card-brochure-details">
                    <h4 className="font-semibold text-foreground mb-2">About This Guide</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      A comprehensive brochure designed to address the emotional concerns of families while demonstrating our rigorous standards and commitment to excellence.
                    </p>
                    <Button 
                      onClick={() => handleDownload('/brochures/home-care-guide.html', 'Private-InHome-Care-Guide.html')}
                      className="w-full"
                      data-testid="button-download-brochure"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Complete Guide
                    </Button>
                  </div>
                </div>

                {/* Right: FAQ Accordion */}
                <div className="space-y-4">
                  <Accordion type="single" collapsible className="space-y-3">
                    
                    <AccordionItem 
                      value="item-1" 
                      className="border rounded-lg px-6 bg-card"
                      data-testid="accordion-faq-1"
                    >
                      <AccordionTrigger className="text-lg font-semibold hover:no-underline py-5">
                        Is home care right for me?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-5">
                        <p className="mb-4">
                          Home care is ideal if you or your loved one values independence and prefers to remain in familiar surroundings while receiving professional support. It's especially beneficial for those who:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                          <li>Need assistance with daily activities like bathing, dressing, or meal preparation</li>
                          <li>Require companionship and emotional support</li>
                          <li>Want to maintain their routine and lifestyle at home</li>
                          <li>Are recovering from surgery or managing chronic conditions</li>
                          <li>Need medication reminders and health monitoring</li>
                        </ul>
                        <p className="mt-4">
                          Our free in-home assessment can help you determine if home care is the right choice for your situation.
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem 
                      value="item-2" 
                      className="border rounded-lg px-6 bg-card"
                      data-testid="accordion-faq-2"
                    >
                      <AccordionTrigger className="text-lg font-semibold hover:no-underline py-5">
                        Can my family afford home care?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-5">
                        <p className="mb-4">
                          Home care is often more affordable than you might think, especially when compared to assisted living facilities or nursing homes. We offer:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                          <li><strong>Flexible scheduling:</strong> Pay only for the hours you need, from a few hours per week to 24/7 care</li>
                          <li><strong>Customized care plans:</strong> Services tailored to your budget and specific needs</li>
                          <li><strong>Insurance options:</strong> Some long-term care insurance policies and veterans' benefits may cover home care</li>
                          <li><strong>Family cost-sharing:</strong> Multiple family members can contribute to care costs</li>
                        </ul>
                        <p className="mt-4">
                          During your free consultation, we'll provide transparent pricing and help you explore all available payment options and financial assistance programs.
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem 
                      value="item-3" 
                      className="border rounded-lg px-6 bg-card"
                      data-testid="accordion-faq-3"
                    >
                      <AccordionTrigger className="text-lg font-semibold hover:no-underline py-5">
                        How to talk with your aging loved one about home care
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-5">
                        <p className="mb-4">
                          Starting the conversation about home care can be challenging. Here are some tips to make it easier:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                          <li><strong>Choose the right time:</strong> Have the conversation when everyone is relaxed, not during a crisis</li>
                          <li><strong>Listen first:</strong> Ask about their concerns, fears, and preferences before presenting solutions</li>
                          <li><strong>Focus on independence:</strong> Emphasize how home care helps them stay in their home and maintain autonomy</li>
                          <li><strong>Start small:</strong> Suggest trying care for just a few hours per week initially</li>
                          <li><strong>Involve them in decisions:</strong> Let them choose their caregiver and help design their care plan</li>
                          <li><strong>Share your concerns:</strong> Honestly express your worries about their safety and well-being</li>
                        </ul>
                        <p className="mt-4">
                          Our care coordinators are experienced in these conversations and can participate in family meetings to help facilitate the discussion.
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem 
                      value="item-4" 
                      className="border rounded-lg px-6 bg-card"
                      data-testid="accordion-faq-4"
                    >
                      <AccordionTrigger className="text-lg font-semibold hover:no-underline py-5">
                        Understanding the different types of home care
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-5">
                        <p className="mb-4">
                          Download our comprehensive guide to learn more about the similarities and differences between non-medical home care, home health, and private duty nursing to determine which would be the best fit for you or your loved one.
                        </p>
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
                          <p className="text-sm mb-3 font-medium text-foreground">
                            Our guide covers:
                          </p>
                          <ul className="text-sm space-y-2 mb-4">
                            <li>• <strong>Non-Medical Home Care:</strong> Companionship, personal care, and daily living assistance</li>
                            <li>• <strong>Home Health Care:</strong> Skilled nursing and therapy services prescribed by a physician</li>
                            <li>• <strong>Private Duty Nursing:</strong> 24/7 medical care for complex health conditions</li>
                            <li>• Key differences in services, qualifications, and insurance coverage</li>
                            <li>• How to choose the right level of care for your situation</li>
                          </ul>
                          <Button 
                            onClick={() => handleDownload('/brochures/home-care-guide.html', 'Understanding-Home-Care-Types.html')}
                            className="w-full"
                            data-testid="button-download-types-guide"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Guide
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                  </Accordion>

                  {/* CTA Card */}
                  <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-8 border border-primary/20 mt-8" data-testid="card-cta">
                    <h3 className="text-2xl font-bold text-foreground mb-3">
                      Still Have Questions?
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Schedule a free, no-obligation consultation with our care experts. We'll answer all your questions and help you create a personalized care plan.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        asChild 
                        size="lg"
                        data-testid="button-schedule-consultation"
                      >
                        <a href="/consultation">Schedule Free Consultation</a>
                      </Button>
                      <Button 
                        asChild 
                        variant="outline" 
                        size="lg"
                        data-testid="button-view-services"
                      >
                        <a href="/services">View Our Services</a>
                      </Button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* Additional Resources Section */}
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4 max-w-6xl">
              <h2 className="text-3xl font-bold text-foreground mb-8" data-testid="text-additional-resources">
                Additional Resources
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                
                <div className="bg-card rounded-lg p-6 border hover-elevate" data-testid="card-resource-articles">
                  <div className="bg-primary/10 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Care Articles</h3>
                  <p className="text-muted-foreground mb-4">
                    Expert advice and tips on caregiving, senior health, and wellness topics.
                  </p>
                  <Button asChild variant="outline" data-testid="button-browse-articles">
                    <a href="/articles">Browse Articles</a>
                  </Button>
                </div>

                <div className="bg-card rounded-lg p-6 border hover-elevate" data-testid="card-resource-caregivers">
                  <div className="bg-secondary/10 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Meet Our Caregivers</h3>
                  <p className="text-muted-foreground mb-4">
                    Learn about our professionally trained and compassionate care team.
                  </p>
                  <Button asChild variant="outline" data-testid="button-view-caregivers">
                    <a href="/caregivers">View Caregivers</a>
                  </Button>
                </div>

                <div className="bg-card rounded-lg p-6 border hover-elevate" data-testid="card-resource-careers">
                  <div className="bg-accent/10 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Join Our Team</h3>
                  <p className="text-muted-foreground mb-4">
                    Explore rewarding career opportunities in home care across Massachusetts.
                  </p>
                  <Button asChild variant="outline" data-testid="button-view-careers">
                    <a href="/careers">View Careers</a>
                  </Button>
                </div>

              </div>
            </div>
          </section>

        </main>
      </div>
    </>
  );
}
