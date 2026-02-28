import { useMemo } from 'react';
import { useDeviceOrientation } from './useDeviceOrientation';

const KAABA_LAT = 21.4225;
const KAABA_LON = 39.8262;

/**
 * Calculate the bearing from user's position to the Kaaba.
 * Uses the spherical law of cosines for initial bearing.
 */
function getQiblaDirection(lat: number, lon: number): number {
  const kaabaLat = KAABA_LAT * Math.PI / 180;
  const kaabaLon = KAABA_LON * Math.PI / 180;
  const userLat = lat * Math.PI / 180;
  const userLon = lon * Math.PI / 180;
  const dLon = kaabaLon - userLon;

  const y = Math.sin(dLon);
  const x = Math.cos(userLat) * Math.tan(kaabaLat) - Math.sin(userLat) * Math.cos(dLon);

  let bearing = Math.atan2(y, x) * (180 / Math.PI);
  return (bearing + 360) % 360;
}

/**
 * Qibla compass hook — combines device orientation with Qibla bearing.
 *
 * Separated from useDeviceOrientation to keep concerns clean:
 *   useDeviceOrientation → raw heading data + permissions
 *   useQiblaCompass      → Qibla-specific rotation + alignment
 *
 * @param userLat  — user's latitude
 * @param userLon  — user's longitude
 * @param debug    — forward debug flag to orientation hook
 */
export function useQiblaCompass(userLat: number, userLon: number) {
  const { heading } = useDeviceOrientation();

  const qibla = getQiblaDirection(userLat, userLon);

  const rotation = useMemo(() => {
    if (heading === null) return 0;
    return (heading - qibla + 360) % 360; // Corrected formula
  }, [heading, qibla]);

  const isAligned = useMemo(() => {
    if (heading === null) return false;
    const diff = Math.abs((heading - qibla + 360) % 360);
    return diff <= 5 || diff >= 355;
  }, [heading, qibla]);

  return { rotation, isAligned, qibla };
}
