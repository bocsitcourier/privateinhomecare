import { Menu, Phone, Mail, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@assets/Private InHome CareGiver_1760037444526.png";

const careTypes = [
  { slug: "personal-care", label: "Personal Care" },
  { slug: "companionship", label: "Companionship Care" },
  { slug: "homemaking", label: "Homemaking Services" },
  { slug: "dementia-care", label: "Dementia & Memory Care" },
  { slug: "respite-care", label: "Respite Care" },
  { slug: "live-in-care", label: "Live-In Care" },
  { slug: "post-hospital-care", label: "Post-Hospital Care" },
  { slug: "hospice-palliative-care", label: "Hospice & Palliative Care" },
];

const additionalServices = [
  { slug: "concierge-services", label: "Senior Concierge Services" },
  { slug: "non-medical-transportation", label: "Non-Medical Transportation" },
];

const careOptions = [
  { slug: "nursing-homes", label: "Nursing Homes" },
  { slug: "assisted-living", label: "Assisted Living" },
  { slug: "memory-care", label: "Memory Care" },
  { slug: "independent-living", label: "Independent Living" },
  { slug: "home-care", label: "Home Care" },
  { slug: "hospice-palliative-care", label: "Hospice & Palliative Care" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <Link href="/" className="hover-elevate px-2 py-1 rounded-md transition" data-testid="link-logo">
              <img 
                src={logo} 
                alt="Private InHome CareGiver - Premium Private Pay In-Home Senior Care Services in Massachusetts" 
                title="Private InHome CareGiver - Trusted Senior Care Across Massachusetts"
                className="h-[100px] md:h-[120px] lg:h-[140px] w-auto object-contain"
                data-testid="img-logo"
              />
            </Link>

            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
              <a href="/#about" data-testid="link-about" className="text-foreground hover-elevate px-3 py-2 rounded-md transition">About</a>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 text-foreground hover-elevate px-3 py-2 rounded-md transition" data-testid="link-services">
                    Services
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/services" data-testid="link-services-overview">
                      All Services
                    </Link>
                  </DropdownMenuItem>
                  <div className="h-px bg-border my-1" />
                  {careTypes.map((ct) => (
                    <DropdownMenuItem key={ct.slug} asChild>
                      <Link href={`/${ct.slug}/massachusetts`} data-testid={`link-${ct.slug}`}>
                        {ct.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <div className="h-px bg-border my-1" />
                  {additionalServices.map((svc) => (
                    <DropdownMenuItem key={svc.slug} asChild>
                      <Link href={`/${svc.slug}/massachusetts`} data-testid={`link-${svc.slug}`}>
                        {svc.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Link href="/locations" data-testid="link-locations" className="text-foreground hover-elevate px-3 py-2 rounded-md transition">Locations</Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 text-foreground hover-elevate px-3 py-2 rounded-md transition" data-testid="link-care-options">
                    Care Options
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/facilities" data-testid="link-facilities">
                      Find Facilities
                    </Link>
                  </DropdownMenuItem>
                  <div className="h-px bg-border my-1" />
                  {careOptions.map((co) => (
                    <DropdownMenuItem key={co.slug} asChild>
                      <Link href={`/${co.slug}/massachusetts`} data-testid={`link-${co.slug}`}>
                        {co.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 text-foreground hover-elevate px-3 py-2 rounded-md transition" data-testid="link-resources">
                    Resources
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/caregiver-resources" data-testid="link-caregiver-resources">
                      Caregiver Resources
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/articles" data-testid="link-articles">
                      Articles
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/videos" data-testid="link-videos">
                      Videos
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/podcasts" data-testid="link-podcasts">
                      Podcasts
                    </Link>
                  </DropdownMenuItem>
                  <div className="h-px bg-border my-1" />
                  <DropdownMenuItem asChild>
                    <Link href="/aging-resources" data-testid="link-aging-resources">
                      Aging Resources
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/find-hospital" data-testid="link-find-hospital">
                      Find a Hospital
                    </Link>
                  </DropdownMenuItem>
                  <div className="h-px bg-border my-1" />
                  <DropdownMenuItem asChild>
                    <Link href="/caregiver-log" data-testid="link-caregiver-log">
                      Caregiver Log
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-muted-foreground mb-2">Services</p>
                <div className="flex flex-col gap-1 pl-2">
                  <Link
                    href="/services"
                    className="text-foreground hover-elevate px-3 py-2 rounded-md text-sm font-medium"
                    data-testid="link-services-mobile"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    All Services
                  </Link>
                  {careTypes.map((ct) => (
                    <Link
                      key={ct.slug}
                      href={`/${ct.slug}/massachusetts`}
                      className="text-foreground hover-elevate px-3 py-2 rounded-md text-sm"
                      data-testid={`link-${ct.slug}-mobile`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {ct.label}
                    </Link>
                  ))}
                  <div className="h-px bg-border my-1" />
                  {additionalServices.map((svc) => (
                    <Link
                      key={svc.slug}
                      href={`/${svc.slug}/massachusetts`}
                      className="text-foreground hover-elevate px-3 py-2 rounded-md text-sm"
                      data-testid={`link-${svc.slug}-mobile`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {svc.label}
                    </Link>
                  ))}
                </div>
              </div>
              <Link 
                href="/locations" 
                className="text-foreground hover-elevate px-3 py-3 rounded-md text-base" 
                data-testid="link-locations-mobile"
                onClick={() => setMobileMenuOpen(false)}
              >
                Locations
              </Link>
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-muted-foreground mb-2">Care Options</p>
                <div className="flex flex-col gap-1 pl-2">
                  <Link
                    href="/facilities"
                    className="text-foreground hover-elevate px-3 py-2 rounded-md text-sm font-medium"
                    data-testid="link-facilities-mobile"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Find Facilities
                  </Link>
                  {careOptions.map((co) => (
                    <Link
                      key={co.slug}
                      href={`/${co.slug}/massachusetts`}
                      className="text-foreground hover-elevate px-3 py-2 rounded-md text-sm"
                      data-testid={`link-${co.slug}-mobile`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {co.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-muted-foreground mb-2">Resources</p>
                <div className="flex flex-col gap-1 pl-2">
                  <Link
                    href="/caregiver-resources"
                    className="text-foreground hover-elevate px-3 py-2 rounded-md text-sm"
                    data-testid="link-caregiver-resources-mobile"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Caregiver Resources
                  </Link>
                  <Link
                    href="/articles"
                    className="text-foreground hover-elevate px-3 py-2 rounded-md text-sm"
                    data-testid="link-articles-mobile"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Articles
                  </Link>
                  <Link
                    href="/videos"
                    className="text-foreground hover-elevate px-3 py-2 rounded-md text-sm"
                    data-testid="link-videos-mobile"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Videos
                  </Link>
                  <Link
                    href="/podcasts"
                    className="text-foreground hover-elevate px-3 py-2 rounded-md text-sm"
                    data-testid="link-podcasts-mobile"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Podcasts
                  </Link>
                  <Link
                    href="/aging-resources"
                    className="text-foreground hover-elevate px-3 py-2 rounded-md text-sm"
                    data-testid="link-aging-resources-mobile"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Aging Resources
                  </Link>
                  <Link
                    href="/find-hospital"
                    className="text-foreground hover-elevate px-3 py-2 rounded-md text-sm"
                    data-testid="link-find-hospital-mobile"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Find a Hospital
                  </Link>
                  <Link
                    href="/caregiver-log"
                    className="text-foreground hover-elevate px-3 py-2 rounded-md text-sm"
                    data-testid="link-caregiver-log-mobile"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Caregiver Log
                  </Link>
                </div>
              </div>
              <Link 
                href="/caregivers" 
                className="text-foreground hover-elevate px-3 py-3 rounded-md text-base" 
                data-testid="link-find-caregivers-mobile"
                onClick={() => setMobileMenuOpen(false)}
              >
                Find Caregivers
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
