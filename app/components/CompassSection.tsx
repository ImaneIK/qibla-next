"use client";
import { useMemo, useEffect, useState } from 'react';
import { Translations } from '../hooks/useLanguage';

interface CompassSectionProps {
  qiblaDirection: number;
  phoneHeading: number | null;
  isAligned: boolean;
  t: Translations;
}

const CompassSection = ({ qiblaDirection, phoneHeading, isAligned, t }: CompassSectionProps) => {
  const DIRECTIONS = [
    { label: t.N, deg: 0 },
    { label: t.E, deg: 90 },
    { label: t.S, deg: 180 },
    { label: t.W, deg: 270 },
  ];

  // Manual rotation for devices without sensors
  const [manualHeading, setManualHeading] = useState(0);
  const [useManual, setUseManual] = useState(phoneHeading === null);

  // Determine if we're in sensor mode or manual mode
  const isNoSensorMode = phoneHeading === null;

  // Use real heading if available, otherwise use manual
  const effectiveHeading = phoneHeading !== null ? phoneHeading : manualHeading;

  // Compass dial rotates opposite to phone heading
  const compassRotation = -effectiveHeading;

  // Arrow points toward qibla
  const arrowRotation = (qiblaDirection - effectiveHeading + 360) % 360;

  // Check alignment
  const currentIsAligned = useMemo(() => {
    let diff = Math.abs(qiblaDirection - effectiveHeading) % 360;
    if (diff > 180) diff = 360 - diff;
    return diff <= 5;
  }, [qiblaDirection, effectiveHeading]);

const tickMarks = useMemo(() => {
  const ticks = [];
  for (let i = 0; i < 360; i += 15) {
    const isMajor = i % 90 === 0;
    const isMid = i % 45 === 0;
    ticks.push(
      <div
        key={i}
        className="absolute inset-0"
        style={{ transform: `rotate(${i}deg)` }}
      >
        <div
          className={`absolute top-2 left-1/2 -translate-x-1/2 ${
            isMajor
              ? 'w-[2px] h-4 bg-amber-500/80'
              : isMid
              ? 'w-[1.5px] h-3 bg-amber-500/60'
              : 'w-[1px] h-2 bg-amber-500/40'
          }`}
        />
      </div>
    );
  }
  return ticks;
}, []);

  return (
    <div className="flex flex-col items-center gap-6 animate-fade-up" style={{ animationDelay: '0.2s' }}>
      {/* Warning for no sensors */}
      {isNoSensorMode && (
        <div className="text-xs text-orange-600 bg-orange-100 px-4 py-2 rounded-lg font-medium text-center w-full">
          📱 <strong>{t.noSensorsTitle}</strong>
          <br />
          {t.noSensorsBody}
        </div>
      )}

      <div className={`relative rounded-full p-1 ${currentIsAligned ? 'animate-pulse-success' : 'animate-breathe'}`}>
        <div
          className={`rounded-full p-[2px] ${
            currentIsAligned
              ? 'bg-gradient-to-br from-green-500 to-green-400/60'
              : 'bg-gradient-to-br from-primary via-primary/60 to-primary/30'
          }`}
        >
          <div className="relative w-[280px] h-[280px] rounded-full glass-strong shadow-inner flex items-center justify-center overflow-hidden">
            {/* Rotating compass dial */}
            <div
              className="absolute inset-3 rounded-full"
              style={{
                transform: `rotate(${compassRotation}deg)`,
                transition: 'transform 0.1s linear',
                willChange: 'transform',
                perspective: '1000px',
              }}
            >
              {tickMarks}
              {DIRECTIONS.map(({ label, deg }) => (
                <div
                  key={deg}
                  className="absolute inset-0"
                  style={{ transform: `rotate(${deg}deg)` }}
                >
                  <span
                    className={`absolute top-7 left-1/2 -translate-x-1/2 text-xs font-semibold ${
                      deg === 0 ? 'text-primary' : 'text-muted-foreground'
                    }`}
                    style={{ transform: `rotate(-${deg + compassRotation}deg)` }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Qibla arrow - rotates in real-time */}
            <div
              className="absolute inset-0 flex items-center justify-center z-10"
              style={{
                transform: `rotate(${arrowRotation}deg)`,
                transition: 'transform 0.15s linear',
                willChange: 'transform',
                perspective: '1000px',
              }}
            >
              <div className="relative flex flex-col items-center">
                <svg
                  width="40"
                  height="120"
                  viewBox="0 0 40 120"
                  className="drop-shadow-lg"
                  style={{
                    filter: currentIsAligned
                      ? 'drop-shadow(0 0 12px hsl(145 63% 49% / 0.5))'
                      : 'drop-shadow(0 0 8px hsl(43 65% 52% / 0.4))',
                  }}
                >
                  <polygon
                    points="20,5 32,45 20,38 8,45"
                    className={currentIsAligned ? 'fill-green-400' : ''}
                    fill={currentIsAligned ? undefined : 'url(#goldGrad)'}
                  />
                  <rect x="17" y="45" width="6" height="50" rx="3" className="fill-muted-foreground/20" />
                  <circle cx="20" cy="100" r="5" className="fill-muted-foreground/30" />
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="hsl(43 65% 52%)" />
                      <stop offset="50%" stopColor="hsl(43 80% 68%)" />
                      <stop offset="100%" stopColor="hsl(43 65% 52%)" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Center Kaaba icon */}
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center z-20 ${currentIsAligned ? 'bg-success/20' : 'bg-primary/15'}`}>
              <span className="text-lg">🕋</span>
            </div>
          </div>
        </div>
      </div>

      {/* Qibla bearing text */}
      <div className="flex items-center gap-2">
        <span className="font-mono-degree text-2xl gold-text font-medium">
          {Math.round(qiblaDirection)}°
        </span>
        <span className="text-muted-foreground text-sm">{t.qiblaBearing}</span>
      </div>

      {/* Manual controls for devices without sensors */}
      {isNoSensorMode && (
        <div className="w-full max-w-xs">
          <div className="flex flex-col items-center gap-4">
            {/* Heading display */}
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">{t.currentHeading}</div>
              <div className="text-4xl font-bold gold-text">{Math.round(manualHeading)}°</div>
            </div>

            {/* Directional pad */}
            <div className="flex flex-col justify-center items-center gap-2 ">
              {/* Top - Decrease heading */}
              <button
                onClick={() => setManualHeading((prev) => (prev - 15 + 360) % 360)}
                className="px-4 py-3 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-lg font-semibold transition-all"
              >
                ⬆️ {t.N}
              </button>

              
              <div className='flex gap-2 justify-center w-full'>
              
              {/* Left */}
              <button
                onClick={() => setManualHeading((prev) => (prev - 15 + 360) % 360)}
                className="flex-1 text-nowrap px-4 py-3 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-lg font-semibold transition-all"
              >
                ⬅️ {t.W}
              </button>

              {/* Center - Reset */}
              <button
                onClick={() => setManualHeading(0)}
                className=" text-nowrap flex-1 px-4 py-3 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-lg font-semibold transition-all text-xs"
              >
                {t.reset}
              </button>


                 {/* Right */}
              <button
                onClick={() => setManualHeading((prev) => (prev + 15) % 360)}
                className="flex-1 text-nowrap px-4 py-3 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-lg font-semibold transition-all"
              >
                {t.E} ➡️
              </button>
              
              </div>

             

              {/* Bottom */}
              <div onClick={() => setManualHeading((prev) => (prev + 15) % 360)} className=" px-4 py-3 bg-primary/20 border border-primary/50 rounded-lg font-semibold text-center">
                {t.S} ⬇️
              </div>
            </div>

            {/* Slider for fine adjustment */}
            <div className="w-full">
              <input
                type="range"
                min="0"
                max="360"
                value={manualHeading}
                onChange={(e) => setManualHeading(Number(e.target.value))}
                className="w-full h-2 bg-amber-500/20 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-xs text-muted-foreground text-center mt-2">
                {t.dragAdjust}
              </div>
            </div>

            {/* Status */}
            {currentIsAligned && (
              <div className="w-full bg-success/20 border border-success rounded-lg p-3 text-center">
                <div className="font-semibold text-success">{t.alignedMessage}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompassSection;