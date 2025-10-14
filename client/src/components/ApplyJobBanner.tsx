import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Briefcase, X } from "lucide-react";

const STORAGE_KEY = "applyJobBannerClosed";

export default function ApplyJobBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [location] = useLocation();

  useEffect(() => {
    // Check if banner was closed on THIS specific page
    const closedPage = localStorage.getItem(STORAGE_KEY);
    setIsVisible(closedPage !== location);
  }, [location]);

  const handleClose = () => {
    // Store the current page where banner was closed
    localStorage.setItem(STORAGE_KEY, location);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed right-6 bottom-6 md:right-8 md:bottom-8 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500" 
      data-testid="floating-job-button"
    >
      <div className="relative group">
        <Link
          href="/apply"
          className="flex items-center gap-2 md:gap-3 bg-red-500 hover:bg-red-600 text-white px-3 py-2 md:px-6 md:py-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-red-500/50 w-[160px] md:w-[200px]"
          data-testid="link-apply-job-banner"
        >
          <div className="w-8 h-8 md:w-12 md:h-12 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-4 h-4 md:w-6 md:h-6" />
          </div>
          <span className="font-semibold text-sm md:text-lg whitespace-nowrap pr-1 md:pr-2">
            Find a job
          </span>
        </Link>
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 w-6 h-6 bg-gray-800 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Close find job button"
          data-testid="button-close-job-banner"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
