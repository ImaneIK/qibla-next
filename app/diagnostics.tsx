import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Activity } from 'lucide-react';

/**
 * COMPREHENSIVE COMPASS DIAGNOSTIC
 * 
 * Tests:
 * 1. Event firing (is browser receiving data?)
 * 2. Raw alpha values (is sensor calibrated?)
 * 3. Absolute orientation (is absolute flag set?)
 * 4. Event frequency (how many events per second?)
 * 5. Phone position required
 */
export default function CompassDiagnostic() {
  const [isListening, setIsListening] = useState(false);
  const [eventLog, setEventLog] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    eventFrequency: 0,
    alphaValues: [] as number[],
    absoluteCount: 0,
    relativeCount: 0,
    minAlpha: null as number | null,
    maxAlpha: null as number | null,
    alphaChange: 0,
  });
  const [phonePosition, setPhonePosition] = useState('flat');
  const [isCalibrating, setIsCalibrating] = useState(false);

  useEffect(() => {
    if (!isListening) return;

    let eventCount = 0;
    let lastTimestamp = Date.now();
    const alphas: number[] = [];

    const handleEvent = (event: DeviceOrientationEvent) => {
      eventCount++;

      const now = Date.now();
      const frequency = (eventCount / ((now - lastTimestamp) / 1000)).toFixed(1);

      const eventData = {
        timestamp: now,
        alpha: event.alpha?.toFixed(2) || 'null',
        beta: event.beta?.toFixed(2) || 'null',
        gamma: event.gamma?.toFixed(2) || 'null',
        absolute: event.absolute,
        eventNumber: eventCount,
        frequency,
      };

      if (event.alpha !== null) {
        alphas.push(event.alpha);
      }

      setEventLog((prev) => [eventData, ...prev.slice(0, 19)]); // Keep last 20

      // Update stats
      setStats((prev) => {
        const newAlphaValues = event.alpha !== null ? [...prev.alphaValues, event.alpha].slice(-100) : prev.alphaValues;
        const minAlpha = newAlphaValues.length > 0 ? Math.min(...newAlphaValues) : null;
        const maxAlpha = newAlphaValues.length > 0 ? Math.max(...newAlphaValues) : null;
        const alphaRange = minAlpha !== null && maxAlpha !== null ? maxAlpha - minAlpha : 0;

        return {
          totalEvents: eventCount,
          eventFrequency: parseFloat(frequency),
          alphaValues: newAlphaValues,
          absoluteCount: event.absolute ? prev.absoluteCount + 1 : prev.absoluteCount,
          relativeCount: !event.absolute ? prev.relativeCount + 1 : prev.relativeCount,
          minAlpha,
          maxAlpha,
          alphaChange: alphaRange,
        };
      });
    };

    window.addEventListener('deviceorientation', handleEvent);
    window.addEventListener('deviceorientationabsolute', (e) => {
      handleEvent(e as any);
    });

    return () => {
      window.removeEventListener('deviceorientation', handleEvent);
      window.removeEventListener('deviceorientationabsolute', handleEvent);
    };
  }, [isListening]);

  const getHealthStatus = () => {
    if (stats.totalEvents === 0) return { status: 'No Data', color: 'text-red-500 bg-red-500/10' };
    if (stats.eventFrequency < 5) return { status: 'Very Slow', color: 'text-orange-500 bg-orange-500/10' };
    if (stats.eventFrequency < 10) return { status: 'Slow', color: 'text-yellow-500 bg-yellow-500/10' };
    if (stats.alphaChange < 2) return { status: 'Not Moving', color: 'text-red-500 bg-red-500/10' };
    return { status: 'Healthy', color: 'text-green-500 bg-green-500/10' };
  };

  const health = getHealthStatus();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🔧 Compass Diagnostic</h1>
          <p className="text-slate-400">Debug why your compass isn't responding</p>
        </div>

        {/* Health Status */}
        <div className={`rounded-lg p-6 ${health.color} border border-current border-opacity-30`}>
          <div className="flex items-center gap-3">
            {health.status === 'Healthy' ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <AlertCircle className="w-6 h-6" />
            )}
            <div>
              <div className="text-2xl font-bold">{health.status}</div>
              <div className="text-sm opacity-75">
                {stats.totalEvents === 0
                  ? 'No sensor events detected'
                  : stats.alphaChange < 2
                  ? 'Events firing but no rotation detected'
                  : 'Sensor working normally'}
              </div>
            </div>
          </div>
        </div>

        {/* Phone Position Guide */}
        <div className="bg-slate-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Phone Position Guide
          </h2>

          <div className="grid grid-cols-3 gap-4">
            {[
              { pos: 'flat', emoji: '📱', label: 'Flat (Best)' },
              { pos: 'up', emoji: '☝️', label: 'Point Up' },
              { pos: 'rotate', emoji: '🔄', label: 'Rotate Slowly' },
            ].map((item) => (
              <button
                key={item.pos}
                onClick={() => setPhonePosition(item.pos)}
                className={`p-4 rounded-lg transition-all ${
                  phonePosition === item.pos
                    ? 'bg-blue-600 border border-blue-400'
                    : 'bg-slate-700 border border-slate-600 hover:bg-slate-600'
                }`}
              >
                <div className="text-4xl mb-2">{item.emoji}</div>
                <div className="text-sm font-medium">{item.label}</div>
              </button>
            ))}
          </div>

          <div className="bg-slate-900 p-4 rounded text-sm space-y-2">
            {phonePosition === 'flat' && (
              <>
                <p>✅ <strong>Best for testing:</strong></p>
                <p>1. Lay phone flat on a table</p>
                <p>2. Rotate phone 360° (keep flat)</p>
                <p>3. Alpha should change 0→360</p>
              </>
            )}
            {phonePosition === 'up' && (
              <>
                <p>✅ <strong>If flat doesn't work:</strong></p>
                <p>1. Hold phone pointing up (portrait)</p>
                <p>2. Slowly rotate side to side</p>
                <p>3. Watch alpha and gamma values</p>
              </>
            )}
            {phonePosition === 'rotate' && (
              <>
                <p>✅ <strong>Recalibration method:</strong></p>
                <p>1. Hold phone in front of you</p>
                <p>2. Make slow figure-8 motions</p>
                <p>3. This recalibrates magnetic sensors</p>
              </>
            )}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setIsListening(!isListening)}
            className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${
              isListening
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isListening ? '⏹ Stop Listening' : '▶ Start Listening'}
          </button>

          <button
            onClick={() => {
              setIsCalibrating(true);
              setTimeout(() => setIsCalibrating(false), 3000);
            }}
            disabled={isCalibrating}
            className="flex-1 px-6 py-3 rounded-lg font-bold bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
          >
            {isCalibrating ? '⏳ Calibrating...' : '🔄 Calibrate'}
          </button>

          <button
            onClick={() => {
              setEventLog([]);
              setStats({
                totalEvents: 0,
                eventFrequency: 0,
                alphaValues: [],
                absoluteCount: 0,
                relativeCount: 0,
                minAlpha: null,
                maxAlpha: null,
                alphaChange: 0,
              });
            }}
            className="flex-1 px-6 py-3 rounded-lg font-bold bg-slate-700 hover:bg-slate-600"
          >
            🗑️ Clear
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-3xl font-bold text-blue-400">{stats.totalEvents}</div>
            <div className="text-xs text-slate-400">Total Events</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-400">{stats.eventFrequency.toFixed(1)}</div>
            <div className="text-xs text-slate-400">Events/Sec</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-3xl font-bold text-purple-400">{stats.alphaChange.toFixed(1)}°</div>
            <div className="text-xs text-slate-400">Alpha Range</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-3xl font-bold text-yellow-400">
              {stats.absoluteCount > 0 ? '✅ ABS' : stats.relativeCount > 0 ? '⚠️ REL' : '❌'}
            </div>
            <div className="text-xs text-slate-400">Orientation Type</div>
          </div>
        </div>

        {/* Event Log */}
        <div className="bg-slate-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-bold">📊 Event Stream (Last 20)</h2>

          {stats.totalEvents === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No events received yet</p>
              <p className="text-xs mt-2">
                Make sure you're moving your phone and it's not in airplane mode
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="text-left py-2 px-2">#</th>
                    <th className="text-left py-2 px-2">Alpha</th>
                    <th className="text-left py-2 px-2">Beta</th>
                    <th className="text-left py-2 px-2">Gamma</th>
                    <th className="text-left py-2 px-2">Type</th>
                    <th className="text-left py-2 px-2">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {eventLog.map((event, i) => (
                    <tr key={i} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="py-2 px-2 text-slate-400">{event.eventNumber}</td>
                      <td className={`py-2 px-2 ${event.alpha === 'null' ? 'text-red-400' : 'text-green-400'}`}>
                        {event.alpha}°
                      </td>
                      <td className="py-2 px-2 text-blue-400">{event.beta}°</td>
                      <td className="py-2 px-2 text-purple-400">{event.gamma}°</td>
                      <td className="py-2 px-2">
                        <span className={event.absolute ? 'text-yellow-400' : 'text-cyan-400'}>
                          {event.absolute ? 'ABS' : 'REL'}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-slate-400">{event.frequency} Hz</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Diagnosis */}
        <div className="bg-slate-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-bold">🔍 Diagnosis</h2>

          {stats.totalEvents === 0 && (
            <div className="space-y-3 text-sm">
              <div className="bg-red-900/20 border border-red-500/30 rounded p-3">
                <strong>❌ No events firing</strong>
                <p className="text-xs mt-1">Try these fixes:</p>
                <ol className="list-decimal list-inside mt-2 space-y-1 text-xs">
                  <li>Check Settings → Apps → Chrome/Browser → Permissions → Motion & Orientation</li>
                  <li>Try different browser: Firefox, Samsung Internet</li>
                  <li>Restart phone</li>
                  <li>Disable WiFi and use cellular only</li>
                  <li>Check if device motion is disabled in accessibility settings</li>
                </ol>
              </div>
            </div>
          )}

          {stats.totalEvents > 0 && stats.alphaChange < 2 && (
            <div className="space-y-3 text-sm">
              <div className="bg-orange-900/20 border border-orange-500/30 rounded p-3">
                <strong>⚠️ Events firing but no rotation</strong>
                <p className="text-xs mt-1">Alpha range: {stats.minAlpha?.toFixed(1)}° to {stats.maxAlpha?.toFixed(1)}° (change: {stats.alphaChange.toFixed(1)}°)</p>
                <p className="text-xs mt-2">Try these fixes:</p>
                <ol className="list-decimal list-inside mt-2 space-y-1 text-xs">
                  <li>Calibrate magnetometer: Make figure-8 motions with phone</li>
                  <li>Move away from magnets and metal objects</li>
                  <li>Try again outdoors away from buildings</li>
                  <li>If always ~0° or ~180°, sensor might be broken</li>
                  <li>Restart phone and try again</li>
                </ol>
              </div>
            </div>
          )}

          {stats.eventFrequency > 0 && stats.eventFrequency < 5 && (
            <div className="space-y-3 text-sm">
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded p-3">
                <strong>🐢 Events slow ({stats.eventFrequency.toFixed(1)} Hz)</strong>
                <p className="text-xs mt-1">Should be ~10-60 Hz. Low frequency indicates:</p>
                <ol className="list-decimal list-inside mt-2 space-y-1 text-xs">
                  <li>Browser throttling (try closing other apps)</li>
                  <li>Low-power mode enabled (disable it)</li>
                  <li>Old Samsung A04 hardware limitation</li>
                  <li>Try WebGL heavy operations are running</li>
                </ol>
              </div>
            </div>
          )}

          {stats.totalEvents > 100 && stats.alphaChange > 10 && (
            <div className="space-y-3 text-sm">
              <div className="bg-green-900/20 border border-green-500/30 rounded p-3">
                <strong>✅ Compass is working!</strong>
                <p className="text-xs mt-1">Your sensor is responding correctly.</p>
                <p className="text-xs mt-2">If Qibla app still doesn't work:</p>
                <ol className="list-decimal list-inside mt-2 space-y-1 text-xs">
                  <li>Check if location permission is granted</li>
                  <li>Verify app is displaying orientation correctly</li>
                  <li>Check browser console for JavaScript errors</li>
                  <li>Try clearing browser cache: Settings → Chrome → Clear Data</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Device Info */}
        <div className="bg-slate-800 rounded-lg p-6 space-y-2 text-sm">
          <h2 className="text-xl font-bold mb-4">📱 Device Info</h2>
          <div>User Agent: {navigator.userAgent}</div>
          <div>Screen: {window.innerWidth}x{window.innerHeight}</div>
          <div>
            DeviceOrientation:
            {typeof window !== 'undefined' && 'DeviceOrientationEvent' in window ? ' ✅ Supported' : ' ❌ Not supported'}
          </div>
          <div>
            Absolute orientation:
            {stats.absoluteCount > 0 ? ' ✅ Available' : stats.relativeCount > 0 ? ' ⚠️ Relative only' : ' ❓ Unknown'}
          </div>
        </div>
      </div>
    </div>
  );
}