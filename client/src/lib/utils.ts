import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a raw Google Places photo URL to a server-side proxy URL.
 * Handles expired/restricted API keys by routing through the backend.
 */
export function proxyImageUrl(url: string | null | undefined): string | null | undefined {
  if (!url) return url;
  if (url.startsWith('/api/proxy/')) return url;
  if (url.startsWith('/attached_assets/') || url.startsWith('/photos/') || url.startsWith('http') === false) return url;
  if (url.includes('places.googleapis.com')) {
    const match = url.match(/\/v1\/(places\/[^/]+\/photos\/[^/?]+)/);
    if (match) {
      return `/api/proxy/location-photo?name=${encodeURIComponent(match[1])}&w=1200`;
    }
  }
  return url;
}
