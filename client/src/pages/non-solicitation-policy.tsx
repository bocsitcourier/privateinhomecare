import { Link } from "wouter";
import { ArrowLeft, Shield, AlertTriangle, DollarSign, Scale, FileCheck, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageSEO from "@/components/PageSEO";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function NonSolicitationPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <PageSEO 
        pageSlug="non-solicitation-policy"
        fallbackTitle="Non-Solicitation & Placement Agreement Policy - PrivateInHomeCareGiver"
        fallbackDescription="Comprehensive non-solicitation and placement agreement policy for PrivateInHomeCareGiver, outlining caregiver placement options, buyout fees, and Massachusetts law-compliant terms."
      />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/" data-testid="link-back-home">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 hover-elevate rounded-md px-3 py-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </div>
        </Link>

        <h1 className="text-4xl font-bold text-primary mb-4">Non-Solicitation & Placement Agreement Policy</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Understanding Your Options for Caregiver Placement and Private Hire Transition
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-green-200 dark:border-green-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                Option A
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">$3,500</div>
              <p className="text-xs text-muted-foreground">Immediate Buyout</p>
            </CardContent>
          </Card>
          <Card className="border-blue-200 dark:border-blue-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                Option B
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">$1,500</div>
              <p className="text-xs text-muted-foreground">After 300 Hours</p>
            </CardContent>
          </Card>
          <Card className="border-yellow-200 dark:border-yellow-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-yellow-600" />
                No Hire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">12 Months</div>
              <p className="text-xs text-muted-foreground">Non-Solicitation Period</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardContent className="prose prose-sm max-w-none pt-6">
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center gap-2">
                  <Scale className="h-6 w-6" />
                  Purpose and Scope
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  This Non-Solicitation & Placement Agreement Policy ("Policy") sets forth the terms and conditions governing the relationship between Private In-Home Caregiver, LLC ("Agency") and its Clients regarding the placement and potential private hire of caregivers. This Policy is designed to protect the substantial investment the Agency makes in recruiting, screening, training, and placing qualified Personal Care Assistants (PCAs) and other caregivers, while also providing clients with transparent options for transitioning to direct employment arrangements when appropriate.
                </p>
                <p className="text-foreground/80 leading-relaxed mt-4">
                  This Policy is enforceable under Massachusetts contract law and is designed to comply with all applicable state and federal regulations, including but not limited to Massachusetts General Laws Chapter 149 (Labor and Industries), Chapter 151B (Unlawful Discrimination), and applicable wage and hour laws. The Agency operates in full compliance with the Massachusetts Attorney General's Fair Labor Division guidelines.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center gap-2">
                  <FileCheck className="h-6 w-6" />
                  Definitions
                </h2>
                <ul className="space-y-3 text-foreground/80">
                  <li>
                    <strong>"Agency Caregiver"</strong> refers to any Personal Care Assistant (PCA), Home Health Aide (HHA), Companion, or other care professional who has been recruited, screened, trained, or placed by the Agency at any time within the preceding twelve (12) months.
                  </li>
                  <li>
                    <strong>"Client"</strong> refers to any individual, family member, legal guardian, or authorized representative who receives or arranges for care services through the Agency.
                  </li>
                  <li>
                    <strong>"Direct Hire"</strong> or <strong>"Private Hire"</strong> refers to any arrangement whereby a Client employs, contracts with, or otherwise engages an Agency Caregiver outside of the Agency relationship, whether for compensation or otherwise.
                  </li>
                  <li>
                    <strong>"Solicitation"</strong> includes any direct or indirect invitation, encouragement, or inducement for an Agency Caregiver to terminate their relationship with the Agency and enter into a private employment or contractual arrangement with the Client or any third party referred by the Client.
                  </li>
                  <li>
                    <strong>"Under-the-Table Payments"</strong> refers to any compensation provided to an Agency Caregiver outside of the Agency's billing and payment systems, including cash payments, gifts of substantial value, or other remuneration.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  Agency Investment and Rationale
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  The Agency acknowledges that clients may, at some point, wish to directly employ a caregiver they have come to know and trust through Agency services. The Agency has developed this Policy to provide a fair and transparent pathway for such transitions while protecting its legitimate business interests.
                </p>
                <p className="text-foreground/80 leading-relaxed mt-4">
                  The Agency makes substantial investments in each caregiver placement, including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-foreground/80 mt-2">
                  <li>Comprehensive background checks including CORI, national criminal database, and sex offender registry searches</li>
                  <li>Verification of professional references, employment history, and credentials</li>
                  <li>Skills assessment and competency evaluation</li>
                  <li>Initial and ongoing training in care techniques, safety protocols, and emergency procedures</li>
                  <li>Administrative support including scheduling, payroll, tax withholding, and insurance coverage</li>
                  <li>Liability insurance and workers' compensation coverage</li>
                  <li>Ongoing supervision, quality assurance, and care coordination</li>
                </ul>
                <p className="text-foreground/80 leading-relaxed mt-4">
                  These investments typically range from $2,500 to $5,000 per caregiver placement, exclusive of ongoing administrative and insurance costs. The placement options outlined below are designed to fairly compensate the Agency for these investments when a Client chooses to transition to a direct employment relationship.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center gap-2">
                  <DollarSign className="h-6 w-6" />
                  Placement Options
                </h2>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="option-a">
                    <AccordionTrigger className="text-lg font-semibold text-green-600">
                      Option A: Immediate Buyout ($3,500.00)
                    </AccordionTrigger>
                    <AccordionContent className="text-foreground/80 space-y-4">
                      <p>
                        For Clients who wish to immediately transition to a direct employment relationship with an Agency Caregiver, the Agency offers an Immediate Buyout option. Under this option:
                      </p>
                      <ul className="list-disc list-inside space-y-2">
                        <li>The Client pays a one-time Placement Buyout Fee of <strong>$3,500.00</strong></li>
                        <li>Payment is due in full prior to the caregiver's final shift with the Agency</li>
                        <li>Upon receipt of payment, the Agency releases all contractual restrictions on the caregiver's ability to work directly for the Client</li>
                        <li>The Agency provides the Client with any relevant caregiver documentation, including training records and certifications</li>
                        <li>The Client assumes full responsibility for all employer obligations including payroll taxes, insurance, and compliance with labor laws</li>
                      </ul>
                      <p>
                        This option is recommended for Clients who have developed a strong working relationship with a caregiver and are prepared to assume the administrative and legal responsibilities of direct employment.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="option-b">
                    <AccordionTrigger className="text-lg font-semibold text-blue-600">
                      Option B: Transition After 300 Hours + $1,500.00 Fee
                    </AccordionTrigger>
                    <AccordionContent className="text-foreground/80 space-y-4">
                      <p>
                        For Clients who prefer a more gradual transition, the Agency offers a Transition Program. Under this option:
                      </p>
                      <ul className="list-disc list-inside space-y-2">
                        <li>The Client continues to receive services through the Agency for a minimum of <strong>300 hours</strong> of care</li>
                        <li>Upon completion of the 300-hour requirement, the Client pays a reduced Placement Fee of <strong>$1,500.00</strong></li>
                        <li>The 300 hours must be completed within twelve (12) months of selecting this option</li>
                        <li>The Agency continues to provide full support, supervision, and insurance coverage during the transition period</li>
                        <li>This option allows both parties to ensure the caregiver-client relationship is suitable for long-term direct employment</li>
                      </ul>
                      <p>
                        This option is recommended for Clients who wish to confirm compatibility before committing to direct employment, or who prefer to spread the financial impact over time while continuing to benefit from Agency support services.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="no-hire">
                    <AccordionTrigger className="text-lg font-semibold text-yellow-600">
                      No Direct Hire: 12-Month Non-Solicitation Agreement
                    </AccordionTrigger>
                    <AccordionContent className="text-foreground/80 space-y-4">
                      <p>
                        For Clients who do not intend to directly hire an Agency Caregiver, the standard Non-Solicitation Agreement applies. Under this option:
                      </p>
                      <ul className="list-disc list-inside space-y-2">
                        <li>The Client agrees not to directly or indirectly solicit, hire, employ, or engage any Agency Caregiver for a period of <strong>twelve (12) months</strong> following the caregiver's last assignment with the Client</li>
                        <li>The prohibition extends to referrals of Agency Caregivers to other families, individuals, or organizations for private hire</li>
                        <li>No placement fee is required under this option</li>
                        <li>The Client continues to receive services through the Agency with full administrative, insurance, and supervisory support</li>
                      </ul>
                      <p>
                        This option is appropriate for Clients who prefer the convenience, security, and peace of mind that comes with Agency-managed care services, including professional liability coverage, backup caregiver availability, and administrative support.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6" />
                  Prohibited Conduct and Breach of Agreement
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  The following actions constitute a material breach of this Agreement and the Non-Solicitation provisions:
                </p>
                <ul className="list-disc list-inside space-y-2 text-foreground/80 mt-4">
                  <li>Directly or indirectly offering private employment to any Agency Caregiver without selecting Option A or Option B and paying the applicable Placement Fee</li>
                  <li>Referring an Agency Caregiver to any third party (including family members, friends, or acquaintances) for private hire</li>
                  <li>Making any under-the-table payments, cash payments, or other compensation to an Agency Caregiver outside of Agency billing channels</li>
                  <li>Encouraging, facilitating, or assisting an Agency Caregiver in terminating their relationship with the Agency for the purpose of private employment</li>
                  <li>Using any subterfuge, intermediary, or indirect means to circumvent the terms of this Policy</li>
                </ul>
                <p className="text-foreground/80 leading-relaxed mt-4">
                  Any under-the-table payments or off-the-books compensation to Agency Caregivers is strictly prohibited and constitutes an immediate breach of this Agreement. Such payments also expose the Client to significant legal and financial liability under Massachusetts wage and hour laws, tax regulations, and workers' compensation requirements.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center gap-2">
                  <Scale className="h-6 w-6" />
                  Remedies and Liquidated Damages
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  In the event of a breach of this Policy, the Client agrees to the following remedies:
                </p>
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mt-4">
                  <h3 className="font-semibold text-destructive mb-2">Liquidated Damages</h3>
                  <p className="text-foreground/80">
                    The Client agrees to pay <strong>$5,000.00</strong> as liquidated damages for any breach of the Non-Solicitation provisions. The parties agree that this amount represents a reasonable estimate of the Agency's damages, which would be difficult to calculate precisely, and is not intended as a penalty.
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-4 mt-4">
                  <h3 className="font-semibold text-foreground mb-2">Additional Remedies</h3>
                  <ul className="list-disc list-inside space-y-2 text-foreground/80">
                    <li>The Client shall be responsible for all reasonable attorney's fees and costs incurred by the Agency in enforcing this Agreement</li>
                    <li>The Client shall be responsible for all collection costs, including agency fees and court costs</li>
                    <li>The Agency reserves the right to seek injunctive relief to prevent ongoing or anticipated breaches</li>
                    <li>The Agency may terminate services immediately upon discovery of a breach</li>
                  </ul>
                </div>
                <p className="text-foreground/80 leading-relaxed mt-4">
                  The remedies set forth herein are cumulative and not exclusive. The Agency's failure to enforce any provision of this Policy shall not constitute a waiver of its right to enforce such provision in the future.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-primary mb-4">Massachusetts Law Compliance</h2>
                <p className="text-foreground/80 leading-relaxed">
                  This Policy is governed by and construed in accordance with the laws of the Commonwealth of Massachusetts. Any disputes arising under this Policy shall be resolved in the courts of the Commonwealth of Massachusetts, with venue in Suffolk County.
                </p>
                <p className="text-foreground/80 leading-relaxed mt-4">
                  The Agency operates in full compliance with all applicable Massachusetts employment laws, including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-foreground/80 mt-2">
                  <li>Massachusetts General Laws Chapter 149 (Labor and Industries)</li>
                  <li>Massachusetts General Laws Chapter 151 (Minimum Fair Wage Law)</li>
                  <li>Massachusetts General Laws Chapter 151A (Unemployment Insurance)</li>
                  <li>Massachusetts General Laws Chapter 152 (Workers' Compensation)</li>
                  <li>Executive Office of Health and Human Services regulations governing Personal Care Attendant services</li>
                </ul>
                <p className="text-foreground/80 leading-relaxed mt-4">
                  Non-solicitation agreements are recognized as enforceable under Massachusetts law when they protect legitimate business interests, are reasonable in scope and duration, and are supported by adequate consideration. This Policy has been drafted to satisfy these requirements and to provide fair and reasonable options for all parties.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-primary mb-4">Acknowledgment and Agreement</h2>
                <p className="text-foreground/80 leading-relaxed">
                  By signing the Non-Solicitation & Placement Agreement form, the Client acknowledges that they have read, understand, and agree to be bound by the terms of this Policy. The Client further acknowledges that:
                </p>
                <ul className="list-disc list-inside space-y-2 text-foreground/80 mt-4">
                  <li>They have had the opportunity to ask questions about this Policy and have received satisfactory answers</li>
                  <li>They have been advised of their right to consult with legal counsel before signing</li>
                  <li>They are signing this Agreement voluntarily and without coercion</li>
                  <li>This Agreement is supported by adequate consideration, including the Agency's agreement to provide care services</li>
                  <li>They understand the financial consequences of breaching this Agreement</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-primary mb-4">Contact Information</h2>
                <p className="text-foreground/80 leading-relaxed">
                  For questions about this Policy, placement options, or to request a copy of the Non-Solicitation & Placement Agreement form, please contact:
                </p>
                <div className="bg-muted rounded-lg p-4 mt-4">
                  <p className="font-semibold">Private In-Home Caregiver, LLC</p>
                  <p className="text-foreground/80">Email: info@privateinhomecaregiver.com</p>
                  <p className="text-foreground/80">Phone: 617-686-0595</p>
                  <p className="text-foreground/80">Massachusetts Licensed Home Care Agency</p>
                </div>
              </section>

              <section className="border-t pt-6">
                <p className="text-sm text-muted-foreground italic">
                  Last Updated: January 2026
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  This Policy may be updated from time to time. Clients will be notified of any material changes to this Policy. The most current version of this Policy is always available on our website and upon request.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Link href="/contact" data-testid="link-contact">
            <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover-elevate">
              Contact Us About Placement Options
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
