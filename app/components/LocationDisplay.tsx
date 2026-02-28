import { useState, useEffect } from 'react';
import { MapPin, Loader } from 'lucide-react';

interface LocationDisplayProps {
  latitude: number;
  longitude: number;
  t: any;
}

interface LocationData {
  city: string;
  country: string;
  countryCode: string;
  state?: string;
  loading: boolean;
  error: string | null;
}

/**
 * Reverse geocoding using Open-Meteo (free, no API key needed)
 * or falls back to OpenStreetMap Nominatim
 */
async function reverseGeocode(lat: number, lon: number): Promise<Partial<LocationData>> {
  try {
    // Try Open-Meteo first (faster, no rate limiting)
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?latitude=${lat}&longitude=${lon}&language=en&format=json`,
      { method: 'GET' }
    );

    if (!response.ok) throw new Error('Open-Meteo failed');

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        city: result.name || 'Unknown',
        state: result.admin1 || undefined,
        country: result.country || 'Unknown',
        countryCode: result.country_code?.toUpperCase() || 'XX',
        loading: false,
        error: null,
      };
    }

    throw new Error('No results');
  } catch (error) {
    try {
      // Fallback to OpenStreetMap Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      );

      if (!response.ok) throw new Error('Nominatim failed');

      const data = await response.json();
      const address = data.address || {};

      return {
        city: address.city || address.town || address.village || 'Unknown',
        state: address.state || undefined,
        country: address.country || 'Unknown',
        countryCode: data.address?.country_code?.toUpperCase() || 'XX',
        loading: false,
        error: null,
      };
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
      return {
        loading: false,
        error: 'Could not fetch location name',
      };
    }
  }
}

export default function LocationDisplay({ latitude, longitude, t }: LocationDisplayProps) {
  const [location, setLocation] = useState<LocationData>({
    city: '',
    country: '',
    countryCode: '',
    loading: true,
    error: null,
  });

  useEffect(() => {
    setLocation((prev) => ({ ...prev, loading: true }));

    reverseGeocode(latitude, longitude).then((result) => {
      setLocation((prev) => ({
        ...prev,
        ...result,
        loading: false,
      }));
    });
  }, [latitude, longitude]);

  return (
    <div className="w-full max-w-[420px] animate-fade-up" style={{ animationDelay: '0.25s' }}>
      <div className="glass-strong rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <MapPin className="w-5 h-5 text-primary" />
          </div>

          <div className="flex-1">
            {location.loading ? (
              <div className="flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Detecting location...</span>
              </div>
            ) : location.error ? (
              <div className="text-sm text-muted-foreground">
                {location.city ? `${location.city}, ${location.country}` : 'Location unknown'}
              </div>
            ) : (
              <div>
                <div className="font-semibold text-foreground">
                  {location.city}
                  {location.state && `, ${location.state}`}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <span>🌍 {location.country}</span>
                  {location.countryCode && location.countryCode !== 'XX' && (
                    <span className="ml-1">({location.countryCode})</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Country flag emoji (best effort) */}
          {!location.loading && location.countryCode && location.countryCode !== 'XX' && (
            <div className="text-2xl flex-shrink-0">
              {getFlagEmoji(location.countryCode)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Convert country code to flag emoji
 * e.g., "US" → "🇺🇸"
 */
function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}