import { MapPin, Compass, Settings } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Translations } from '../hooks/useLanguage';

interface PermissionCardProps {
  type: 'location' | 'compass' | 'welcome';
  onRequest: () => void;
  t: Translations;
  isDenied?: boolean;
}

const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent);

const PermissionCard = ({ type, onRequest, t, isDenied }: PermissionCardProps) => {
  const isLocation = type === 'location';
  const isWelcome = type === 'welcome';

  return (
    <div className="glass-strong rounded-2xl p-8 w-full max-w-xs mx-auto text-center animate-fade-up flex flex-col items-center gap-4">
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center gold-glow">
        {isWelcome || isLocation ? (
          <MapPin className="w-7 h-7 text-primary" />
        ) : (
          <Compass className="w-7 h-7 text-primary" />
        )}
      </div>
      <div>
        <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
          {isWelcome ? t.welcome : isLocation ? t.locationAccess : t.enableCompass}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {isWelcome ? t.tapToFind : isLocation ? t.locationDesc : t.compassDesc}
        </p>

        {/* iOS-specific denied instructions */}
        {isDenied && isLocation && isIOS() && (
          <div className="mt-3 p-3 rounded-lg bg-destructive/10 text-destructive text-xs leading-relaxed flex items-start gap-2">
            <Settings className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{t.iosLocationSettings}</span>
          </div>
        )}
      </div>
      <Button
        onClick={onRequest}
        className="w-full gold-gradient text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
      >
        {isWelcome ? t.findQibla : isDenied ? t.tryAgain : isLocation ? t.enableLocation : t.activateCompass}
      </Button>
    </div>
  );
};

export default PermissionCard;
