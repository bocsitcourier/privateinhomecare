import Header from "@/components/Header";
import PageSEO from "@/components/PageSEO";

export default function TermsAndConditionsPage() {
  return (
    <>
      <PageSEO
        pageSlug="terms-and-conditions"
        fallbackTitle="Terms and Conditions - Service Agreement | PrivateInHomeCareGiver"
        fallbackDescription="Review our comprehensive service agreement and terms of service for private in-home care services in Massachusetts."
        canonicalPath="/terms-and-conditions"
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-background">
          <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl font-bold text-primary mb-8" data-testid="text-page-title">
              Terms and Conditions
            </h1>
            
            <div className="prose prose-lg max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">Comprehensive Service Agreement and Risk Mitigation Manual for Private In-Home Care Providers</h2>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3">Section 1: Introduction, Definitions, and Governing Principles</h3>
                
                <h4 className="text-lg font-semibold text-foreground mt-6 mb-2">1.1 Parties to the Agreement and Effective Date</h4>
                <p className="text-muted-foreground leading-relaxed">
                  This Service Agreement (the "Agreement") establishes the terms and conditions under which private in-home supportive care services are provided. The parties to this binding legal contract are formally identified as the Agency (Private InHome CareGiver - the Service Provider), the Client (the Service Recipient), and, if applicable, the Authorized Representative or Guarantor responsible for financial obligations and care coordination. The Agreement commences on a specified Effective Date and remains in force until terminated according to the terms stipulated herein. This document requires the full names, contact information, and legal capacity of all involved parties to be clearly stated at the time of execution.
                </p>

                <h4 className="text-lg font-semibold text-foreground mt-6 mb-2">1.2 Defining the Agency and Client Relationship</h4>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The relationship established by this Agreement is strictly for the provision of non-medical, private-pay supportive care services. The Agency is responsible for identifying, vetting, and managing the Caregiver workforce (who may be employees or independent contractors of the Agency). The central purpose of this contract is to outline specific services, roles, and expectations, thereby clarifying responsibilities and preventing future conflicts regarding tasks and compensation.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  It is essential to understand the regulatory context of this relationship. The structure of this service is designed to delineate legal roles explicitly. The Agency, or the entity responsible for the Caregiver, must manage compliance concerning its workforce, including adherence to wage and labor laws. Consequently, the Caregiver's performance is governed by the detailed Care Plan developed and approved by the Agency. The Client or the Authorized Representative must limit their direct supervision of the Caregiver strictly to tasks outlined in the Care Plan.
                </p>

                <h4 className="text-lg font-semibold text-foreground mt-6 mb-2">1.3 Scope of Services and Non-Medical Distinction</h4>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The services provided under this Agreement are non-medical in nature and include, but are not limited to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                  <li>Personal care assistance (bathing, grooming, toileting, dressing)</li>
                  <li>Companionship and emotional support</li>
                  <li>Light housekeeping and meal preparation</li>
                  <li>Medication reminders (not administration)</li>
                  <li>Transportation and escort services</li>
                  <li>Mobility assistance and fall prevention</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  These services do not include skilled nursing care, medical treatments, or any activities requiring licensure under Massachusetts healthcare regulations. The Agency does not provide medical advice, diagnosis, or treatment.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3">Section 2: Financial Terms and Payment Obligations</h3>
                
                <h4 className="text-lg font-semibold text-foreground mt-6 mb-2">2.1 Service Rates and Billing</h4>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Service rates are established based on the level of care required, hours of service, and any specialized needs. All rates are clearly communicated in writing prior to service commencement and may be adjusted with thirty (30) days written notice to the Client.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Billing occurs on a predetermined schedule (weekly, bi-weekly, or monthly). Invoices detail the dates of service, hours provided, services rendered, and total charges. The Client is responsible for payment regardless of whether services are utilized during the billing period, unless proper notice of cancellation is provided according to Section 4.
                </p>

                <h4 className="text-lg font-semibold text-foreground mt-6 mb-2">2.2 Payment Methods and Terms</h4>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Payment is due within fifteen (15) days of invoice date unless alternative arrangements are agreed upon in writing. Accepted payment methods include check, electronic transfer, credit card, or other methods as specified by the Agency. Late payments may incur finance charges at the maximum rate permitted by Massachusetts law.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  A deposit or advance payment may be required prior to service initiation. This deposit will be applied to the final invoice or returned within thirty (30) days of service termination, subject to any outstanding balances.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3">Section 3: Service Delivery and Care Standards</h3>
                
                <h4 className="text-lg font-semibold text-foreground mt-6 mb-2">3.1 Care Plan Development</h4>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  A comprehensive Care Plan will be developed in consultation with the Client and/or Authorized Representative. This plan outlines specific services, schedules, and any special requirements or preferences. The Care Plan serves as the governing document for service delivery and must be followed by all Caregivers.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  The Care Plan may be modified as needed with mutual agreement and written documentation. Regular reviews will be conducted to ensure the plan continues to meet the Client's evolving needs.
                </p>

                <h4 className="text-lg font-semibold text-foreground mt-6 mb-2">3.2 Caregiver Qualifications and Standards</h4>
                <p className="text-muted-foreground leading-relaxed">
                  All Caregivers are carefully screened, including background checks, reference verification, and skills assessment. Caregivers receive ongoing training in best practices for non-medical home care, safety protocols, and client rights. The Agency maintains full responsibility for Caregiver supervision, performance management, and compliance with all applicable employment laws.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3">Section 4: Cancellation and Termination</h3>
                
                <h4 className="text-lg font-semibold text-foreground mt-6 mb-2">4.1 Client-Initiated Termination</h4>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The Client may terminate this Agreement with fourteen (14) days written notice. During the notice period, all scheduled services must be paid for unless mutually agreed otherwise. Failure to provide proper notice may result in charges for the full notice period.
                </p>

                <h4 className="text-lg font-semibold text-foreground mt-6 mb-2">4.2 Agency-Initiated Termination</h4>
                <p className="text-muted-foreground leading-relaxed">
                  The Agency reserves the right to terminate services immediately if: (a) payment obligations are not met; (b) the Client or household members engage in abusive, threatening, or illegal behavior toward Caregivers; (c) the Client's needs exceed the scope of non-medical care; or (d) continued service poses safety risks to Caregivers or others.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3">Section 5: Liability and Indemnification</h3>
                
                <h4 className="text-lg font-semibold text-foreground mt-6 mb-2">5.1 Limitation of Liability</h4>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The Agency maintains appropriate insurance coverage and implements reasonable safeguards to protect Client welfare. However, the Agency's liability is limited to direct damages caused by gross negligence or willful misconduct. The Agency is not liable for:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                  <li>Injuries or incidents occurring outside of scheduled service hours</li>
                  <li>Pre-existing medical conditions or natural disease progression</li>
                  <li>Acts or omissions by third parties, including healthcare providers</li>
                  <li>Damages resulting from Client's failure to follow medical advice or Care Plan recommendations</li>
                </ul>

                <h4 className="text-lg font-semibold text-foreground mt-6 mb-2">5.2 Client Indemnification</h4>
                <p className="text-muted-foreground leading-relaxed">
                  The Client agrees to indemnify and hold harmless the Agency, its Caregivers, and representatives from any claims, damages, or expenses arising from: (a) false information provided by the Client; (b) failure to disclose relevant medical or safety information; (c) requests for services beyond the agreed Care Plan; or (d) actions by the Client or household members that create unsafe conditions.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3">Section 6: Privacy and Confidentiality</h3>
                
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The Agency maintains strict confidentiality standards in accordance with Massachusetts privacy laws and, where applicable, HIPAA regulations. All Client information, including health data, personal details, and service records, is protected and only shared with authorized parties as necessary for service delivery or as required by law.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Clients have the right to access their records, request corrections, and understand how their information is used. For complete details, please review our Privacy Policy.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3">Section 7: Dispute Resolution</h3>
                
                <h4 className="text-lg font-semibold text-foreground mt-6 mb-2">7.1 Informal Resolution</h4>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Any disputes arising from this Agreement should first be addressed through direct communication with the Agency's management. We are committed to resolving concerns promptly and fairly.
                </p>

                <h4 className="text-lg font-semibold text-foreground mt-6 mb-2">7.2 Mediation and Arbitration</h4>
                <p className="text-muted-foreground leading-relaxed">
                  If informal resolution is unsuccessful, disputes will be submitted to mediation. If mediation fails to resolve the matter within sixty (60) days, either party may pursue binding arbitration in accordance with Massachusetts law. The prevailing party in any legal proceeding may be entitled to reasonable attorney fees and costs.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-foreground mb-3">Section 8: Governing Law and Severability</h3>
                
                <p className="text-muted-foreground leading-relaxed mb-4">
                  This Agreement is governed by the laws of the Commonwealth of Massachusetts. If any provision is found to be unenforceable, the remaining provisions shall continue in full force and effect.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  This Agreement constitutes the entire understanding between the parties and supersedes all prior agreements or representations. Modifications must be made in writing and signed by authorized representatives of both parties.
                </p>
              </section>

              <section className="bg-primary/5 p-6 rounded-lg border border-primary/20 mt-8">
                <h3 className="text-xl font-semibold text-foreground mb-3">Contact Information</h3>
                <p className="text-muted-foreground mb-2">
                  For questions regarding these Terms and Conditions, please contact:
                </p>
                <p className="text-foreground font-medium">
                  Private InHome CareGiver<br />
                  3 Cabot Place, Ste. 10A<br />
                  Stoughton, MA 02072<br />
                  Phone: <a href="tel:+16176860595" className="text-primary hover:underline">+1 (617) 686-0595</a><br />
                  Email: <a href="mailto:info@privateinhomecaregiver.com" className="text-primary hover:underline">info@privateinhomecaregiver.com</a>
                </p>
              </section>

              <section className="text-sm text-muted-foreground pt-8 border-t">
                <p>
                  Last Updated: October 2025
                </p>
                <p className="mt-2">
                  By engaging our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
                </p>
              </section>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
