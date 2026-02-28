import { useState, useCallback, useRef } from 'react';

const KAABA_LAT = 21.4225;
const KAABA_LON = 39.8262;

export function getQiblaDirection(lat1: number, lon1: number): number {
  const kaabaLat = KAABA_LAT * Math.PI / 180;
  const kaabaLon = KAABA_LON * Math.PI / 180;
  const userLat = lat1 * Math.PI / 180;
  const userLon = lon1 * Math.PI / 180;
  const dLon = kaabaLon - userLon;
  const y = Math.sin(dLon);
  const x = Math.cos(userLat) * Math.tan(kaabaLat) - Math.sin(userLat) * Math.cos(dLon);
  let bearing = Math.atan2(y, x) * (180 / Math.PI);
  return (bearing + 360) % 360;
}

function getDistanceToMecca(lat: number, lon: number): number {
  const R = 6371;
  const dLat = (KAABA_LAT - lat) * Math.PI / 180;
  const dLon = (KAABA_LON - lon) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat * Math.PI / 180) * Math.cos(KAABA_LAT * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export type PermissionState = 'prompt' | 'granted' | 'denied' | 'unavailable';

export interface QiblaState {
  loadingLocation: boolean;
  locationRequested: boolean;
  locationError: string | null;
  latitude: number | null;
  longitude: number | null;
  qiblaDirection: number | null;
  distanceToMecca: number | null;
  permissionState: PermissionState;
}

export function useQibla() {
  const [state, setState] = useState<QiblaState>({
    loadingLocation: false,
    locationRequested: false,
    locationError: null,
    latitude: null,
    longitude: null,
    qiblaDirection: null,
    distanceToMecca: null,
    permissionState: 'prompt',
  });

  const safetyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(s => ({ ...s, loadingLocation: false, locationRequested: true, locationError: 'Geolocation not supported', permissionState: 'unavailable' }));
      return;
    }

    // Set loading state — user has tapped the button (satisfies iOS gesture requirement)
    setState(s => ({ ...s, loadingLocation: true, locationRequested: true, locationError: null }));

    // Safety timeout: if geolocation doesn't respond within 25s, stop spinning
    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    safetyTimeoutRef.current = setTimeout(() => {
      setState(s => {
        if (s.loadingLocation) {
          return { ...s, loadingLocation: false, locationError: 'Location request timed out. Please try again.' };
        }
        return s;
      });
    }, 25000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const distance = getDistanceToMecca(lat, lon);
        const qibla = getQiblaDirection(lat, lon);
        setState({
          loadingLocation: false,
          locationRequested: true,
          locationError: null,
          latitude: lat,
          longitude: lon,
          qiblaDirection: qibla,
          distanceToMecca: distance,
          permissionState: 'granted',
        });
      },
      (error) => {
        if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
        setState(s => ({
          ...s,
          loadingLocation: false,
          locationError: 'Unable to retrieve location',
          permissionState: error.code === error.PERMISSION_DENIED ? 'denied' : s.permissionState,
        }));
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  }, []);

  return { ...state, requestLocation };
}
