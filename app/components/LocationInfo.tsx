import { MapPin, Navigation } from 'lucide-react';
import { Translations } from '../hooks/useLanguage';

interface LocationInfoProps {
  latitude: number;
  longitude: number;
  qiblaDirection: number;
  distanceToMecca: number | null;
  t: Translations;
}

const LocationInfo = ({ latitude, longitude, qiblaDirection, distanceToMecca, t }: LocationInfoProps) => {
  return (
    <div className="glass rounded-xl p-4 w-full max-w-xs mx-auto animate-fade-up" style={{ animationDelay: '0.6s' }}>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-start gap-2">
          <MapPin className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-muted-foreground text-xs">{t.coordinates}</p>
            <p className="font-mono-degree text-xs text-foreground">
              {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Navigation className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-muted-foreground text-xs">{t.qibla}</p>
            <p className="font-mono-degree text-xs text-foreground">{Math.round(qiblaDirection)}°</p>
          </div>
        </div>
        {distanceToMecca && (
          <div className="col-span-2 flex items-center gap-2 pt-1 border-t border-border/30">
            <span className="text-xs text-muted-foreground">{t.distanceToMecca}</span>
            <span className="font-mono-degree text-xs text-foreground ml-auto">
              {Math.round(distanceToMecca).toLocaleString()} km
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationInfo;
