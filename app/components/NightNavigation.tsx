import { useState } from 'react';
import { Moon, Star, Navigation, Sun, Heart } from 'lucide-react';

interface NightNavigationProps {
  qiblaDirection: number;
  latitude: number;
  longitude: number;
  t: any;
}

export default function NightNavigation({
  qiblaDirection,
  latitude,
  longitude,
  t,
}: NightNavigationProps) {
  const [activeTab, setActiveTab] = useState<'sun' | 'stars' | 'moon' | 'compass'>('sun');

  const isNorthernHemisphere = latitude > 0;

  // Calculate moon phase (simplified)
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const date = today.getDate();

  const lunarDay = Math.floor(
    (date + Math.floor((month - 1) * 30.6) + Math.floor((year - 2000) * 365.25)) % 29.53
  );
  const moonRise = (6 + (lunarDay / 29.53) * 12) % 24;

  const tabs = [
    { key: 'sun' as const, icon: '☀️', label: t.sunTab },
    { key: 'stars' as const, icon: '⭐', label: t.starsTab },
    { key: 'moon' as const, icon: '🌙', label: t.moonTab },
    { key: 'compass' as const, icon: '🧭', label: t.compassTab },
  ];

  return (
    <div className="w-full max-w-[420px] animate-fade-up space-y-4" style={{ animationDelay: '0.6s' }}>
      <div className="glass-strong rounded-2xl p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <Navigation className="w-5 h-5 text-primary" />
          <h3 className="font-serif text-lg font-semibold text-foreground">{t.navigationTitle}</h3>
        </div>
        <p className="text-xs text-muted-foreground">{t.navigationDesc}</p>

        {/* Tabs */}
        <div className="grid grid-cols-4 gap-1.5 bg-muted/30 p-2 rounded-lg">
          {tabs.map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted/50'
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-3">
          {/* SUN TAB */}
          {activeTab === 'sun' && (
            <div className="space-y-3">
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 space-y-2">
                <div className="font-semibold text-sm flex items-center gap-2">
                  <Sun className="w-4 h-4 text-primary" />
                  {t.sunMethodTitle}
                </div>
                <p className="text-xs text-muted-foreground">{t.sunMethodDesc}</p>
                <div className="text-xs text-muted-foreground space-y-1.5">
                  <p>☀️ {t.sunStep1}</p>
                  <p>🕛 {t.sunStep2}</p>
                  <p>📍 {t.sunStep3}</p>
                  <p>📏 {t.sunStep4}</p>
                </div>
              </div>

              <div className="bg-muted/20 p-3 rounded-lg">
                <div className="text-xs text-muted-foreground space-y-2">
                  <p>
                    {t.afterFindingNorth}
                    <br />
                    <code className="bg-muted/50 px-2 py-1 rounded text-xs">
                      {t.yourQiblaDirection} = {qiblaDirection.toFixed(0)}° {t.clockwiseFromNorth}
                    </code>
                  </p>
                </div>
              </div>

              <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg">
                💡 <strong>{t.proTips}:</strong> {t.sunShadowTip}
              </div>
            </div>
          )}

          {/* STARS TAB */}
          {activeTab === 'stars' && (
            <div className="space-y-3">
              {isNorthernHemisphere ? (
                <>
                  <div className="bg-success/10 border border-success/30 rounded-lg p-3 space-y-2">
                    <div className="font-semibold text-sm flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      {t.findPolaris}
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p><strong>{t.bigDipperStep}</strong></p>
                      <p><strong>{t.pointerStarsStep}</strong></p>
                      <p><strong>{t.polarisDistanceStep}</strong></p>
                      <p><strong>{t.polarisNorthInfo}</strong> ✓</p>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 space-y-2">
                    <div className="text-xs text-muted-foreground space-y-2">
                      <p>
                        {t.afterFindingNorth}
                        <br />
                        <code className="bg-muted/50 px-2 py-1 rounded text-xs">
                          {t.yourQiblaDirection} = {qiblaDirection.toFixed(0)}° {t.clockwiseFromNorth}
                        </code>
                      </p>
                      <p>
                        • <strong>0°</strong> = {t.north}<br />
                        • <strong>90°</strong> = {t.east}<br />
                        • <strong>180°</strong> = {t.south}<br />
                        • <strong>270°</strong> = {t.west}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg">
                    💡 <strong>{t.proTips}:</strong> {t.outstretchedArmTip}
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-success/10 border border-success/30 rounded-lg p-3 space-y-2">
                    <div className="font-semibold text-sm flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      {t.findSouthernCross}
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p><strong>{t.southernCrossInstructions}</strong></p>
                      <p><strong>{t.southernCrossAxis}</strong></p>
                      <p><strong>{t.southernCrossPole}</strong> ✓</p>
                      <p><strong>{t.southernCrossNorth}</strong></p>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 space-y-2">
                    <div className="text-xs text-muted-foreground space-y-2">
                      <p>
                        {t.afterFindingNorth}
                        <br />
                        <code className="bg-muted/50 px-2 py-1 rounded text-xs">
                          {t.yourQiblaDirection} = {qiblaDirection.toFixed(0)}° {t.clockwiseFromNorth}
                        </code>
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* MOON TAB */}
          {activeTab === 'moon' && (
            <div className="space-y-3">
              <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 space-y-2">
                <div className="font-semibold text-sm">{t.moonMethodTitle}</div>
                <div className="text-xs text-muted-foreground space-y-2">
                  <p><strong>{t.moonNorthernInfo}</strong></p>
                  <p><strong>{t.moonSouthernInfo}</strong></p>
                  <div className="mt-3 bg-muted/30 p-2 rounded">
                    <p className="font-semibold mb-1">{t.moonToday}</p>
                    <p>{t.lunarDayText} {lunarDay}/29.53 (age: {(lunarDay % 29.53).toFixed(1)} days)</p>
                    <p>{t.moonRiseText}{Math.floor(moonRise)}:00</p>
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg">
                ⚠️ <strong>{t.note}:</strong> {t.moonNote}
              </div>
            </div>
          )}

          {/* COMPASS TAB */}
          {activeTab === 'compass' && (
            <div className="space-y-3">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 space-y-2">
                <div className="font-semibold text-sm flex items-center gap-2">
                  <Navigation className="w-4 h-4" />
                  {t.compassInstructionsHeader}
                </div>
                <div className="text-xs text-muted-foreground space-y-2">
                  <p><strong>{t.compassInstructions}</strong></p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>{t.compassStep1}</li>
                    <li>{t.compassStep2}</li>
                    <li>{t.compassStep3}</li>
                    <li>{t.compassStep4}</li>
                    <li>{t.compassStep5}</li>
                  </ol>
                  <div className="mt-3 bg-success/10 p-2 rounded border border-success/30">
                    <p className="font-semibold mb-1">{t.yourQiblaDirection}</p>
                    <p className="font-mono text-base">{qiblaDirection.toFixed(0)}°</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Reference Card */}
        <div className="bg-muted/30 rounded-lg p-3 space-y-2">
          <div className="font-semibold text-xs text-foreground">{t.quickReference}</div>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div><strong>{t.north}:</strong> 0° / 360°</div>
            <div><strong>{t.east}:</strong> 90°</div>
            <div><strong>{t.south}:</strong> 180°</div>
            <div><strong>{t.west}:</strong> 270°</div>
            <div className="col-span-2">
              <strong className="text-primary">{t.yourQiblaDirection}:</strong> {qiblaDirection.toFixed(0)}° ≈{' '}
              {getDirectionName(qiblaDirection)}
            </div>
          </div>
        </div>
      </div>

      {/* Last Resort Section */}
      <div className="glass-strong rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          <h3 className="font-serif text-lg font-semibold text-foreground">{t.lastResortTitle}</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{t.lastResortDesc}</p>

        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 space-y-3">
          <div className="space-y-1">
            <p className="text-sm text-foreground italic leading-relaxed">"{t.lastResortHadith1}"</p>
            <p className="text-xs text-muted-foreground">{t.lastResortHadith1Source}</p>
          </div>
          <div className="border-t border-border/30 pt-3 space-y-1">
            <p className="text-sm text-foreground italic leading-relaxed">"{t.lastResortHadith2}"</p>
            <p className="text-xs text-muted-foreground">{t.lastResortHadith2Source}</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed bg-muted/20 p-3 rounded-lg">
          🤲 {t.lastResortAdvice}
        </p>
      </div>
    </div>
  );
}

function getDirectionName(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}
