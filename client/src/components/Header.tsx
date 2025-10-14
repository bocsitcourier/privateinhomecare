import { Menu, Phone, Mail } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import logo from "@assets/Private InHome CareGiver_1760037444526.png";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="hover-elevate px-2 py-1 rounded-md transition" data-testid="link-logo">
              <img 
                src={logo} 
                alt="Private InHome CareGiver - Everyone Deserves Compassion & Dignity" 
                className="h-[150px] md:h-[200px] lg:h-[250px] w-auto object-contain"
                data-testid="img-logo"
              />
            </Link>

            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
              <a href="/#about" data-testid="link-about" className="text-foreground hover-elevate px-3 py-2 rounded-md transition">About</a>
              <Link href="/services" data-testid="link-services" className="text-foreground hover-elevate px-3 py-2 rounded-md transition">Services</Link>
              <a href="/#areas" data-testid="link-locations" className="text-foreground hover-elevate px-3 py-2 rounded-md transition">Locations</a>
              <Link href="/articles" data-testid="link-articles" className="text-foreground hover-elevate px-3 py-2 rounded-md transition">Articles</Link>
              <Link href="/caregivers" data-testid="link-find-caregivers" className="text-foreground hover-elevate px-3 py-2 rounded-md transition">
                Find Caregivers
              </Link>
              <Link href="/careers" data-testid="link-careers" className="text-foreground hover-elevate px-3 py-2 rounded-md transition">Careers</Link>
            </nav>

            <div className="flex items-center gap-3">
              <Button
                asChild
                className="hidden lg:flex bg-primary text-primary-foreground"
                data-testid="button-contact-us"
              >
                <Link href="/consultation">Contact Us</Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="button-menu-toggle"
                className="flex-shrink-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-500 dark:hover:text-green-400 dark:hover:bg-green-950"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            data-testid="menu-overlay"
          />
          <nav className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-background border-l shadow-lg z-50 overflow-y-auto">
            <div className="p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-primary">Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="button-menu-close"
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-500 dark:hover:text-green-400 dark:hover:bg-green-950"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </div>
              
              <a 
                href="/#about" 
                className="text-foreground hover-elevate px-3 py-3 rounded-md text-base" 
                data-testid="link-about-mobile"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </a>
              <Link 
                href="/services" 
                className="text-foreground hover-elevate px-3 py-3 rounded-md text-base" 
                data-testid="link-services-mobile"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              <a 
                href="/#areas" 
                className="text-foreground hover-elevate px-3 py-3 rounded-md text-base" 
                data-testid="link-locations-mobile"
                onClick={() => setMobileMenuOpen(false)}
              >
                Locations
              </a>
              <Link 
                href="/articles" 
                className="text-foreground hover-elevate px-3 py-3 rounded-md text-base" 
                data-testid="link-articles-mobile"
                onClick={() => setMobileMenuOpen(false)}
              >
                Articles
              </Link>
              <Link 
                href="/caregivers" 
                className="text-foreground hover-elevate px-3 py-3 rounded-md text-base" 
                data-testid="link-find-caregivers-mobile"
                onClick={() => setMobileMenuOpen(false)}
              >
                Find Caregivers
              </Link>
              <Link 
                href="/resources" 
                className="text-foreground hover-elevate px-3 py-3 rounded-md text-base" 
                data-testid="link-resources-mobile"
                onClick={() => setMobileMenuOpen(false)}
              >
                Resources
              </Link>
              <Link 
                href="/careers" 
                className="text-foreground hover-elevate px-3 py-3 rounded-md text-base" 
                data-testid="link-careers-mobile"
                onClick={() => setMobileMenuOpen(false)}
              >
                Careers
              </Link>
              <a 
                href="/#contact" 
                className="text-foreground hover-elevate px-3 py-3 rounded-md text-base" 
                data-testid="link-contact-mobile"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </a>
              <Link 
                href="/admin" 
                className="text-foreground hover-elevate px-3 py-3 rounded-md text-base" 
                data-testid="link-admin-mobile"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </Link>
              
              <div className="pt-4 border-t mt-2 flex flex-col gap-3 lg:hidden">
                <a 
                  href="tel:+16176860595" 
                  className="flex items-center gap-2 text-primary hover:underline px-3 py-2 rounded-md"
                  data-testid="link-phone-mobile"
                >
                  <Phone className="w-4 h-4" />
                  <span>+1 (617) 686-0595</span>
                </a>
                <a 
                  href="mailto:info@privateinhomecaregiver.com" 
                  className="flex items-center gap-2 text-primary hover:underline px-3 py-2 rounded-md"
                  data-testid="link-email-mobile"
                >
                  <Mail className="w-4 h-4" />
                  <span>info@privateinhomecaregiver.com</span>
                </a>
              </div>
            </div>
          </nav>
        </>
      )}
    </>
  );
}
