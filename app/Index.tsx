"use client";

import { useMemo } from 'react';
import { useQibla } from './hooks/useQibla';
import { useDeviceOrientation } from './hooks/useDeviceOrientation';
import BackgroundPattern from './components/BackgroundPattern';
import LanguageSwitcher from './components/LanguageSwitcher';
import PermissionCard from './components/PermissionCard';
import CompassSection from './components/CompassSection';
import LocationDisplay from './components/LocationDisplay';
import StatusSection from './components/StatusSection';
import LocationInfo from './components/LocationInfo';
import PrayerTimes from './components/PrayerTimes';
import CompassAccuracy from './components/CompassAccuracy';
import NightNavigation from './components/NightNavigation';
import GravityNorthFinder from './components/GravityNorthFinder';
import { useLanguage } from './hooks/useLanguage';
import { Loader2 } from 'lucide-react';
import ThemeToggle from './components/ui/ThemeToggle';


const Index = () => {
  const { language, t, isRTL, changeLanguage } = useLanguage();

  const {
    loadingLocation,
    locationRequested,
    locationError,
    latitude,
    longitude,
    qiblaDirection = null,
    distanceToMecca,
    permissionState,
    requestLocation,
  } = useQibla();

  const {
    heading: phoneHeading,
    isSupported: compassSupported,
    needsPermission: compassNeedsPermission,
    permissionGranted: compassGranted,
    requestPermission: requestCompass,
  } = useDeviceOrientation();

  const isAligned = useMemo(() => {
    if (qiblaDirection == null || phoneHeading === null) return false;
    let diff = Math.abs(qiblaDirection - phoneHeading) % 360;
    if (diff > 180) diff = 360 - diff;
    return diff <= 5;
  }, [qiblaDirection, phoneHeading]);

  return (
    <div className={`relative min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8 overflow-hidden ${isRTL ? 'dir-rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <BackgroundPattern />

      <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-[420px]">
        {/* Language switcher */}
        <div className="z-20 animate-fade-up flex items-center gap-2">
          <LanguageSwitcher current={language} onChange={changeLanguage} />
          <ThemeToggle />
        </div>

        {/* Header */}
        <header className="text-center animate-fade-up pt-10">
          <h1 className="text-3xl font-serif font-bold gold-text tracking-wide">
            {t.title}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t.subtitle}
          </p>
        </header>

        {/* Main content */}
        {!locationRequested && !loadingLocation ? (
          <PermissionCard type="welcome" onRequest={requestLocation} t={t} />
        ) : loadingLocation ? (
          <div className="flex flex-col items-center gap-4 py-16 animate-fade-up">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">{t.detecting}</p>
          </div>
        ) : locationError ? (
          <PermissionCard type="location" onRequest={requestLocation} t={t} isDenied={permissionState === 'denied'} />
        ) : compassNeedsPermission && !compassGranted ? (
          <>
            {qiblaDirection !== null && (
              <CompassSection
                qiblaDirection={qiblaDirection}
                phoneHeading={null}
                isAligned={false}
                t={t}
              />
            )}
            <PermissionCard type="compass" onRequest={requestCompass} t={t} />
          </>
        ) : qiblaDirection !== null ? (
          <>

          {/* Location: City & Country */}
            {latitude !== null && longitude !== null && (
              <LocationDisplay latitude={latitude} longitude={longitude} t={t} />
            )}


            <CompassSection
              qiblaDirection={qiblaDirection}
              phoneHeading={phoneHeading}
              isAligned={isAligned}
              t={t}
            />
            <StatusSection
              loadingLocation={false}
              isAligned={isAligned}
              hasCompass={compassSupported}
              phoneHeading={phoneHeading}
              t={t}
            />
            {latitude !== null && longitude !== null && (
              <LocationInfo
                latitude={latitude}
                longitude={longitude}
                qiblaDirection={qiblaDirection}
                distanceToMecca={distanceToMecca}
                t={t}
              />
            )}
          </>
        ) : null}

          {/* NEW: Prayer Times */}
            {latitude !== null && longitude !== null && (
              <PrayerTimes latitude={latitude} longitude={longitude} t={t} />
            )}

            {/* NEW: Compass Accuracy */}
            {latitude !== null && longitude !== null && (
              <CompassAccuracy heading={phoneHeading} latitude={latitude} longitude={longitude} />
            )}

             {/* Night Navigation Guide */}
            {latitude !== null && longitude !== null && qiblaDirection !== null && (
              <NightNavigation
                qiblaDirection={qiblaDirection}
                latitude={latitude}
                longitude={longitude}
                t={t}
              />
            )}

            {/* Gravity-Based North Finder (Backup for compass-less phones) */}
            {!compassSupported && latitude !== null && longitude !== null && (
              <GravityNorthFinder t={t} />
            )}

        {/* Footer */}
        <footer className="text-center mt-4 animate-fade-up" style={{ animationDelay: '0.8s' }}>
          <p className="text-muted-foreground/50 text-xs">
            {t.bismillah}
          </p>
          <p className="text-muted-foreground/50 text-xs mt-1">
            {t.qiblaVerse}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
