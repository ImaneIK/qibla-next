import { AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

interface CompassAccuracyProps {
  heading: number | null;
  latitude: number;
  longitude: number;
}

/**
 * Calculate magnetic declination (variance) for a location.
 * Shows the difference between true north and magnetic north.
 */
function getMagneticDeclination(latitude: number, longitude: number): number {
  // Simplified WMM (World Magnetic Model) 2024
  // Real implementation would use full WMM data tables
  
  const year = new Date().getFullYear();
  const decimalYear = year + new Date().getMonth() / 12;
  
  // Rough approximation based on location
  let declination = 0;
  
  // Western hemisphere tends negative (west of north)
  if (longitude < 0) {
    declination = -5 - Math.abs(longitude) * 0.1;
  } else {
    declination = Math.abs(longitude) * 0.1;
  }
  
  // Latitude effect
  if (latitude > 45) {
    declination *= 1.2;
  } else if (latitude < -45) {
    declination *= 0.8;
  }
  
  return declination;
}

function getAccuracyLevel(declination: number): { level: string; color: string; icon: React.ReactNode } {
  const absDec = Math.abs(declination);
  
  if (absDec < 2) {
    return {
      level: 'Excellent',
      color: 'text-green-500 bg-green-500/10',
      icon: <CheckCircle className="w-4 h-4" />,
    };
  } else if (absDec < 5) {
    return {
      level: 'Good',
      color: 'text-blue-500 bg-blue-500/10',
      icon: <TrendingUp className="w-4 h-4" />,
    };
  } else if (absDec < 10) {
    return {
      level: 'Fair',
      color: 'text-yellow-500 bg-yellow-500/10',
      icon: <AlertCircle className="w-4 h-4" />,
    };
  } else {
    return {
      level: 'Poor',
      color: 'text-orange-500 bg-orange-500/10',
      icon: <AlertCircle className="w-4 h-4" />,
    };
  }
}

export default function CompassAccuracy({ heading, latitude, longitude }: CompassAccuracyProps) {
  const declination = getMagneticDeclination(latitude, longitude);
  const accuracy = getAccuracyLevel(declination);
  const t = useLanguage().t;

  return (
    <div className="w-full max-w-[420px] animate-fade-up" style={{ animationDelay: '0.3s' }}>
      <div className={`glass-strong rounded-2xl p-4 space-y-3`}>
        {/* Accuracy Level */}
        <div className={`flex items-center gap-3 p-3 rounded-lg ${accuracy.color}`}>
          {accuracy.icon}
          <div className="flex-1">
            <div className="font-semibold text-sm">{t.Magnetic_Accuracy}</div>
            <div className="text-xs opacity-75">{accuracy.level} • {Math.abs(declination).toFixed(1)}° variance</div>
          </div>
        </div>

        {/* Declination Info */}
        <div className="text-xs text-muted-foreground space-y-1 bg-muted/30 p-3 rounded-lg">
          <div className="flex justify-between">
            <span>{t.Magnetic_Variance}:</span>
            <span className="font-mono font-semibold">
              {declination > 0 ? '+' : ''}{declination.toFixed(1)}°
            </span>
          </div>
          <div className="flex justify-between">
            <span>{t.Direction}:</span>
            <span className="font-mono">
              {declination > 0 ? 'East of North' : 'West of North'}
            </span>
          </div>
          <div className="text-xs opacity-70 mt-2">
            📍 {t.note1}
          </div>
        </div>

        {/* Sensor Status */}
        {heading !== null && (
          <div className="text-xs text-muted-foreground space-y-1 bg-success/10 p-3 rounded-lg border border-success/30">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-success" />
              <span>{t.Sensors_active_and_reading}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}