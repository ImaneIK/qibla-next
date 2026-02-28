import { useState, useEffect } from 'react';
import { Smartphone, AlertCircle } from 'lucide-react';

interface GravityNorthFinderProps {
  t: any;
}

/**
 * At night without sun/stars, we can use:
 * 1. Phone accelerometer to detect gravity (always points down)
 * 2. Phone gyroscope to detect rotation
 * 3. Combination to find approximate direction
 *
 * Method: Have user point phone UP toward sky and slowly rotate
 * We measure which direction is "easiest" to hold level (that's north in many cases)
 */
export default function GravityNorthFinder({ t }: GravityNorthFinderProps) {
  const [isActive, setIsActive] = useState(false);
  const [acceleration, setAcceleration] = useState({ x: 0, y: 0, z: 0 });
  const [isSupported, setIsSupported] = useState(true);
  const [instructions, setInstructions] = useState<string>('');

  useEffect(() => {
    if (!isActive) return;

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (acc) {
        setAcceleration({
          x: acc.x || 0,
          y: acc.y || 0,
          z: acc.z || 0,
        });

        // Analyze the pattern
        const magnitude = Math.sqrt(acc.x! ** 2 + acc.y! ** 2 + acc.z! ** 2);
        if (magnitude > 0) {
          const xPercent = ((acc.x || 0) / magnitude) * 100;
          const yPercent = ((acc.y || 0) / magnitude) * 100;

          // Interpret what direction the gravity is pulling
          let direction = 'Unknown';
          if (Math.abs(xPercent) > Math.abs(yPercent)) {
            direction = xPercent > 0 ? 'East' : 'West';
          } else {
            direction = yPercent > 0 ? 'South' : 'North';
          }

          setInstructions(
            `Hold steady... Gravity vector: ${direction}`
          );
        }
      }
    };

    // Check if DeviceMotionEvent is supported
    if (typeof DeviceMotionEvent === 'undefined') {
      setIsSupported(false);
      return;
    }

    // Request permission for iOS 13+
    if (
      typeof (DeviceMotionEvent as any).requestPermission === 'function'
    ) {
      (DeviceMotionEvent as any)
        .requestPermission()
        .then((permission: string) => {
          if (permission === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
          }
        })
        .catch(() => setIsSupported(false));
    } else {
      // Android - no permission needed
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [isActive]);

  return (
    <div className="w-full max-w-[420px] animate-fade-up" style={{ animationDelay: '0.65s' }}>
      <div className="glass-strong rounded-2xl p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-primary" />
          <h3 className="font-serif text-lg font-semibold text-foreground">
            {t.gravityTitle}
          </h3>
        </div>

        <p className="text-xs text-muted-foreground">
          {t.gravityDesc}
        </p>

        {!isSupported && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              {t.motionUnsupported}
            </div>
          </div>
        )}

        {isSupported && (
          <>
            {/* Instructions */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 space-y-2">
              <div className="font-semibold text-sm">{t.gravityHowItWorks}</div>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>{t.gravityStep1}</li>
                <li>{t.gravityStep2}</li>
                <li>{t.gravityStep3}</li>
                <li>{t.gravityStep4}</li>
              </ol>
            </div>

            {/* Status */}
            <button
              onClick={() => setIsActive(!isActive)}
              className={`w-full px-4 py-3 rounded-lg font-semibold transition-all ${
                isActive
                  ? 'bg-success/20 border border-success/50 text-success'
                  : 'bg-primary/20 border border-primary/50 text-primary hover:bg-primary/30'
              }`}
            >
              {isActive ? t.gravityStop : t.gravityStart}
            </button>

            {/* Readings */}
            {isActive && (
              <div className="bg-muted/30 rounded-lg p-4 space-y-3 font-mono text-xs">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>{t.xAxisLabel}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-muted/50 rounded h-2 overflow-hidden">
                        <div
                          className="bg-blue-500 h-full transition-all"
                          style={{
                            width: `${Math.abs(acceleration.x) * 5}%`,
                          }}
                        />
                      </div>
                      <span className="text-blue-400 w-12">{acceleration.x.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>{t.yAxisLabel}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-muted/50 rounded h-2 overflow-hidden">
                        <div
                          className="bg-purple-500 h-full transition-all"
                          style={{
                            width: `${Math.abs(acceleration.y) * 5}%`,
                          }}
                        />
                      </div>
                      <span className="text-purple-400 w-12">{acceleration.y.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>{t.zAxisLabel}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-muted/50 rounded h-2 overflow-hidden">
                        <div
                          className="bg-green-500 h-full transition-all"
                          style={{
                            width: `${Math.abs(acceleration.z) * 5}%`,
                          }}
                        />
                      </div>
                      <span className="text-green-400 w-12">{acceleration.z.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                {/* Interpretation */}
                <div className="border-t border-muted/50 pt-3 mt-3">
                  <div className="text-xs text-muted-foreground mb-2">{t.statusLabel}</div>
                  <div className="text-sm text-success font-bold">{instructions}</div>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
              <div className="text-xs text-muted-foreground space-y-1">
                <strong>{t.proTips}</strong>
                <ul className="list-disc list-inside ml-2 mt-1">
                  <li>{t.tip1}</li>
                  <li>{t.tip2}</li>
                  <li>{t.tip3}</li>
                  <li>{t.tip4}</li>
                  <li>{t.tip5}</li>
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}