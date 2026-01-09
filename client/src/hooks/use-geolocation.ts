import { useState, useCallback, useEffect } from "react";

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
  permissionDenied: boolean;
}

export interface UseGeolocationReturn extends GeolocationState {
  requestLocation: () => void;
  clearLocation: () => void;
  isSupported: boolean;
}

const STORAGE_KEY = "user_location_preference";

export function useGeolocation(): UseGeolocationReturn {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
    permissionDenied: false,
  });

  const isSupported = typeof navigator !== "undefined" && "geolocation" in navigator;

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const { latitude, longitude, timestamp } = JSON.parse(stored);
        const oneHour = 60 * 60 * 1000;
        if (Date.now() - timestamp < oneHour) {
          setState(prev => ({
            ...prev,
            latitude,
            longitude,
          }));
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (!isSupported) {
      setState(prev => ({
        ...prev,
        error: "Geolocation is not supported by your browser",
        loading: false,
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setState({
          latitude,
          longitude,
          error: null,
          loading: false,
          permissionDenied: false,
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          latitude,
          longitude,
          timestamp: Date.now(),
        }));
      },
      (error) => {
        let errorMessage = "Unable to get your location";
        let permissionDenied = false;
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location access in your browser settings.";
            permissionDenied = true;
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }

        setState({
          latitude: null,
          longitude: null,
          error: errorMessage,
          loading: false,
          permissionDenied,
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }, [isSupported]);

  const clearLocation = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      latitude: null,
      longitude: null,
      error: null,
      loading: false,
      permissionDenied: false,
    });
  }, []);

  return {
    ...state,
    requestLocation,
    clearLocation,
    isSupported,
  };
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
