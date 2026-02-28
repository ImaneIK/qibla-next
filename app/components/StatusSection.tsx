import { Loader2 } from 'lucide-react';
import { Translations } from '../hooks/useLanguage';

interface StatusSectionProps {
  loadingLocation: boolean;
  isAligned: boolean;
  hasCompass: boolean;
  phoneHeading: number | null;
  t: Translations;
}

const StatusSection = ({ loadingLocation, isAligned, hasCompass, phoneHeading, t }: StatusSectionProps) => {
  let message: string;
  let statusClass: string;

  if (loadingLocation) {
    message = t.calculating;
    statusClass = 'text-muted-foreground';
  } else if (!hasCompass || phoneHeading === null) {
    message = t.compassNA;
    statusClass = 'text-muted-foreground';
  } else if (isAligned) {
    message = t.facingQibla;
    statusClass = 'text-success animate-pulse-success';
  } else {
    message = t.turnPhone;
    statusClass = 'text-muted-foreground';
  }

  return (
    <div className="flex items-center justify-center gap-2 animate-fade-up" style={{ animationDelay: '0.4s' }}>
      {loadingLocation && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
      <p className={`text-sm font-medium transition-colors duration-500 ${statusClass}`}>
        {message}
      </p>
    </div>
  );
};

export default StatusSection;
