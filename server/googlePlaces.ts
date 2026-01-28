import type { Facility } from "@shared/schema";
import crypto from "crypto";

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACES_API_URL = "https://places.googleapis.com/v1/places:searchText";

// Create MD5 hash of key data fields to detect changes
export function createDataHash(data: { address?: string | null; phone?: string | null; rating?: string | null }): string {
  const hashInput = JSON.stringify({
    addr: data.address || "",
    ph: data.phone || "",
    rat: data.rating || "",
  });
  return crypto.createHash("md5").update(hashInput).digest("hex");
}

interface PlacePhoto {
  name: string;
  widthPx?: number;
  heightPx?: number;
  authorAttributions?: Array<{
    displayName?: string;
    uri?: string;
    photoUri?: string;
  }>;
}

interface PlaceResult {
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  websiteUri?: string;
  id?: string;
  displayName?: { text: string };
  businessStatus?: "OPERATIONAL" | "CLOSED_TEMPORARILY" | "CLOSED_PERMANENTLY";
  photos?: PlacePhoto[];
}

interface PlacesResponse {
  places?: PlaceResult[];
}

export interface EnrichmentResult {
  facilityId: string;
  facilityName: string;
  success: boolean;
  data?: {
    address: string | null;
    phone: string | null;
    website: string | null;
    rating: string | null;
    reviewCount: number;
    googleMapsUrl: string | null;
    googlePlaceId: string | null;
    businessStatus: string | null;
    isClosed: "yes" | "no";
    heroImageUrl: string | null;
    galleryImages: string[];
  };
  error?: string;
}

function buildPhotoUrl(photoName: string, maxWidth: number = 800): string {
  if (!GOOGLE_PLACES_API_KEY) return "";
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidth}&key=${GOOGLE_PLACES_API_KEY}`;
}

export async function enrichFacility(facility: Facility): Promise<EnrichmentResult> {
  if (!GOOGLE_PLACES_API_KEY) {
    return {
      facilityId: facility.id,
      facilityName: facility.name,
      success: false,
      error: "Google Places API key not configured",
    };
  }

  try {
    const searchQuery = `${facility.name} ${facility.city} Massachusetts`;
    
    const response = await fetch(PLACES_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.internationalPhoneNumber,places.rating,places.userRatingCount,places.googleMapsUri,places.websiteUri,places.businessStatus,places.photos",
      },
      body: JSON.stringify({
        textQuery: searchQuery,
        locationBias: {
          rectangle: {
            low: { latitude: 41.2, longitude: -73.5 },
            high: { latitude: 42.9, longitude: -69.9 },
          },
        },
        maxResultCount: 1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Google Places API error for ${facility.name}:`, errorText);
      return {
        facilityId: facility.id,
        facilityName: facility.name,
        success: false,
        error: `API error: ${response.status} - ${errorText.substring(0, 100)}`,
      };
    }

    const data: PlacesResponse = await response.json();
    
    if (!data.places || data.places.length === 0) {
      return {
        facilityId: facility.id,
        facilityName: facility.name,
        success: false,
        error: "No places found",
      };
    }

    const place = data.places[0];
    const isClosed = place.businessStatus === "CLOSED_PERMANENTLY" ? "yes" : "no";
    
    // Extract photo URLs from Google Places
    const photoUrls: string[] = [];
    if (place.photos && place.photos.length > 0) {
      for (const photo of place.photos.slice(0, 10)) {
        if (photo.name) {
          photoUrls.push(buildPhotoUrl(photo.name, 1200));
        }
      }
    }
    const heroImageUrl = photoUrls.length > 0 ? photoUrls[0] : null;
    
    return {
      facilityId: facility.id,
      facilityName: facility.name,
      success: true,
      data: {
        address: place.formattedAddress || null,
        phone: place.nationalPhoneNumber || place.internationalPhoneNumber || null,
        website: place.websiteUri || null,
        rating: place.rating ? String(place.rating) : null,
        reviewCount: place.userRatingCount || 0,
        googleMapsUrl: place.googleMapsUri || null,
        googlePlaceId: place.id || null,
        businessStatus: place.businessStatus || null,
        isClosed,
        heroImageUrl,
        galleryImages: photoUrls.slice(1),
      },
    };
  } catch (error) {
    console.error(`Error enriching facility ${facility.name}:`, error);
    return {
      facilityId: facility.id,
      facilityName: facility.name,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function enrichFacilitiesBatch(
  facilities: Facility[],
  onProgress?: (completed: number, total: number, result: EnrichmentResult) => void
): Promise<EnrichmentResult[]> {
  const results: EnrichmentResult[] = [];
  const total = facilities.length;
  const BATCH_SIZE = 5;
  const DELAY_BETWEEN_BATCHES = 1000;

  for (let i = 0; i < facilities.length; i += BATCH_SIZE) {
    const batch = facilities.slice(i, i + BATCH_SIZE);
    
    const batchResults = await Promise.all(
      batch.map(facility => enrichFacility(facility))
    );
    
    for (const result of batchResults) {
      results.push(result);
      if (onProgress) {
        onProgress(results.length, total, result);
      }
    }
    
    if (i + BATCH_SIZE < facilities.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
    }
  }

  return results;
}
