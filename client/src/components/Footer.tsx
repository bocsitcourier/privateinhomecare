import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="mt-12 bg-card border-t py-10">
      <div className="max-w-7xl mx-auto px-6 grid sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h4 className="font-semibold text-primary mb-3">Navigation</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="text-foreground/70 hover:text-primary">Home</Link></li>
            <li><Link href="/services" className="text-foreground/70 hover:text-primary">Services</Link></li>
            <li><Link href="/directory" className="text-foreground/70 hover:text-primary">Care Directory</Link></li>
            <li><Link href="/careers" className="text-foreground/70 hover:text-primary">Caregiver Careers</Link></li>
            <li><Link href="/refer-a-friend" className="text-foreground/70 hover:text-primary" data-testid="link-refer-friend-footer">Refer a Friend</Link></li>
            <li><Link href="/consultation" className="text-foreground/70 hover:text-primary">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-primary mb-3">Contact</h4>
          <p className="text-sm text-foreground/70">
            3 Cabot Place, Ste. 10A<br />
            Stoughton, MA 02072
          </p>
          <p className="mt-2 text-sm">
            Phone: <a href="tel:+16176860595" className="text-primary hover:underline" data-testid="link-footer-phone">+1 (617) 686-0595</a>
          </p>
          <p className="mt-1 text-sm">
            Email: <a href="mailto:info@privateinhomecaregiver.com" className="text-primary hover:underline" data-testid="link-footer-email">info@privateinhomecaregiver.com</a>
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-primary mb-3">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/facilities" className="text-foreground/70 hover:text-primary" data-testid="link-footer-facilities">Facility Directory</Link></li>
            <li><Link href="/caregiver-resources" className="text-foreground/70 hover:text-primary" data-testid="link-footer-resources">Care Resources</Link></li>
            <li><Link href="/quiz/personal-care-assessment" className="text-foreground/70 hover:text-primary" data-testid="link-footer-quiz">Care Assessment</Link></li>
            <li><Link href="/videos" className="text-foreground/70 hover:text-primary" data-testid="link-footer-videos">Videos</Link></li>
            <li><Link href="/podcasts" className="text-foreground/70 hover:text-primary" data-testid="link-footer-podcasts">Podcasts</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-primary mb-3">Resources</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/intake" className="text-foreground/70 hover:text-primary" data-testid="link-intake-form">Client Intake Form</Link></li>
            <li><Link href="/hipaa-acknowledgment" className="text-foreground/70 hover:text-primary" data-testid="link-hipaa-form">HIPAA Acknowledgment</Link></li>
            <li><Link href="/privacy-policy" className="text-foreground/70 hover:text-primary" data-testid="link-privacy-policy">Privacy Policy</Link></li>
            <li><Link href="/terms-and-conditions" className="text-foreground/70 hover:text-primary" data-testid="link-terms-conditions">Terms and Conditions</Link></li>
            <li><Link href="/non-solicitation-policy" className="text-foreground/70 hover:text-primary" data-testid="link-non-solicitation">Non-Solicitation Policy</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
        <p>© 2025 Private InHome CareGiver. Serving communities across Massachusetts.</p>
      </div>
    </footer>
  );
}
