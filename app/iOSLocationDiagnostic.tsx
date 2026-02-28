import { useState, useEffect } from 'react';
import { MapPin, AlertCircle, CheckCircle } from 'lucide-react';

export default function IOSLocationDiagnostic() {
  const [status, setStatus] = useState<string>('Ready to test');
  const [location, setLocation] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [attempts, setAttempts] = useState(0);
  const [isRequesting, setIsRequesting] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const checkPermission = async () => {
    addLog('Checking geolocation permission status...');
    
    // iOS doesn't have a permission query API like Android
    // We have to try requesting it
    if (!navigator.geolocation) {
      const msg = '❌ Geolocation API not available';
      addLog(msg);
      setError(msg);
      return;
    }

    addLog('✅ Geolocation API available');
    setStatus('Geolocation API available. Click "Request Location" to test permission.');
  };

  const requestLocation = async () => {
    setIsRequesting(true);
    setAttempts((prev) => prev + 1);
    setError('');
    setLocation(null);
    setStatus('Requesting location...');
    addLog(`Attempt #${attempts + 1}: Requesting location...`);

    if (!navigator.geolocation) {
      const msg = '❌ Geolocation not supported on this device';
      setError(msg);
      setStatus(msg);
      addLog(msg);
      setIsRequesting(false);
      return;
    }

    // Timeout after 15 seconds
    const timeout = setTimeout(() => {
      if (!location) {
        const msg = '⏱️ Location request timed out (15 seconds)';
        setError(msg);
        setStatus(msg);
        addLog(msg);
      }
    }, 15000);

    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeout);
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const accuracy = position.coords.accuracy;

          addLog(`✅ Location received!`);
          addLog(`   Latitude: ${lat.toFixed(6)}`);
          addLog(`   Longitude: ${lon.toFixed(6)}`);
          addLog(`   Accuracy: ±${accuracy.toFixed(0)} meters`);

          setLocation({
            latitude: lat,
            longitude: lon,
            accuracy: accuracy,
            timestamp: new Date(position.timestamp),
          });

          setStatus(`✅ Location found: ${lat.toFixed(4)}, ${lon.toFixed(4)} (Accuracy: ±${accuracy.toFixed(0)}m)`);
          setPermissionStatus('granted');
        },
        (error) => {
          clearTimeout(timeout);
          addLog(`❌ Location error: ${error.code} - ${error.message}`);

          let errorMsg = '';
          let permStatus = '';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg =
                '❌ Permission Denied - User rejected location access (or using private browsing)';
              permStatus = 'denied';
              addLog('   → User denied location permission in iOS prompt');
              addLog('   → OR app is in private browsing mode');
              break;

            case error.POSITION_UNAVAILABLE:
              errorMsg = '⚠️ Position Unavailable - GPS not working or signal lost';
              permStatus = 'unavailable';
              addLog('   → GPS not available (try outdoors)');
              addLog('   → WiFi-only location might be weak');
              break;

            case error.TIMEOUT:
              errorMsg = '⏱️ Timeout - Location took too long (>10 seconds)';
              permStatus = 'timeout';
              addLog('   → GPS is slow or poor signal');
              addLog('   → Try in open area away from buildings');
              break;

            default:
              errorMsg = `❌ Unknown Error: ${error.message}`;
              break;
          }

          setError(errorMsg);
          setStatus(errorMsg);
          setPermissionStatus(permStatus);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } catch (err: any) {
      clearTimeout(timeout);
      const msg = `Exception: ${err.message}`;
      addLog(msg);
      setError(msg);
      setStatus(msg);
    }

    setIsRequesting(false);
  };

  useEffect(() => {
    checkPermission();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 text-white p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">📍 iOS Location Diagnostic</h1>
          <p className="text-blue-200">Debug why your iPhone isn't getting location</p>
        </div>

        {/* Status */}
        <div className="bg-blue-800 rounded-lg p-6 border border-blue-500">
          <div className="flex items-start gap-4">
            {location ? (
              <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0 mt-1" />
            ) : error ? (
              <AlertCircle className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
            ) : (
              <MapPin className="w-8 h-8 text-yellow-400 flex-shrink-0 mt-1" />
            )}
            <div className="flex-1">
              <div className="text-lg font-semibold">{status}</div>
              {location && (
                <div className="text-sm text-blue-200 mt-2">
                  <div>📍 Latitude: {location.latitude.toFixed(6)}°</div>
                  <div>📍 Longitude: {location.longitude.toFixed(6)}°</div>
                  <div>📏 Accuracy: ±{location.accuracy.toFixed(0)} meters</div>
                  <div>⏰ Time: {location.timestamp.toLocaleString()}</div>
                </div>
              )}
              {error && <div className="text-sm text-red-300 mt-2">{error}</div>}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={requestLocation}
            disabled={isRequesting}
            className={`flex-1 px-6 py-3 rounded-lg font-bold text-lg transition-all ${
              isRequesting
                ? 'bg-gray-600 opacity-50 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isRequesting ? '⏳ Requesting...' : '📍 Request Location'}
          </button>

          <button
            onClick={() => {
              setLocation(null);
              setError('');
              setLogs([]);
              setAttempts(0);
              setStatus('Ready to test');
              setPermissionStatus(null);
            }}
            className="px-6 py-3 rounded-lg font-bold bg-slate-600 hover:bg-slate-700"
          >
            🗑️ Clear
          </button>
        </div>

        {/* Attempt Counter */}
        <div className="bg-blue-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-300">{attempts}</div>
          <div className="text-sm text-blue-200">Location Requests Attempted</div>
        </div>

        {/* iOS Specific Info */}
        <div className="bg-blue-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-bold">🍎 iOS Requirements</h2>

          <div className="space-y-3 text-sm">
            <div
              className={`p-3 rounded border ${
                navigator.geolocation
                  ? 'bg-green-900/20 border-green-500'
                  : 'bg-red-900/20 border-red-500'
              }`}
            >
              <div className="font-semibold">
                {navigator.geolocation ? '✅' : '❌'} Geolocation API
              </div>
              <div className="text-xs opacity-75">
                {navigator.geolocation ? 'Available' : 'Not available'}
              </div>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-500 p-3 rounded">
              <div className="font-semibold">⚠️ HTTPS Required</div>
              <div className="text-xs opacity-75">
                {window.location.protocol === 'https:'
                  ? '✅ Your app is using HTTPS'
                  : '❌ Your app is NOT using HTTPS (geolocation will fail)'}
              </div>
            </div>

            <div className="bg-blue-700/20 border border-blue-400 p-3 rounded">
              <div className="font-semibold">📱 Browser: {getBrowserName()}</div>
              <div className="text-xs opacity-75">{navigator.userAgent.substring(0, 60)}...</div>
            </div>
          </div>
        </div>

        {/* iOS-Specific Issues */}
        <div className="bg-blue-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-bold">❓ Common iOS Issues</h2>

          <div className="space-y-3 text-sm">
            <div className="bg-orange-900/20 border border-orange-500 p-3 rounded space-y-2">
              <div className="font-semibold">🔒 Private Browsing Mode</div>
              <div className="opacity-75">
                If using Safari in Private Mode:
                <ul className="list-disc list-inside mt-1 ml-2">
                  <li>Location will NOT work</li>
                  <li>Switch to Normal (non-private) mode</li>
                  <li>Then try again</li>
                </ul>
              </div>
            </div>

            <div className="bg-orange-900/20 border border-orange-500 p-3 rounded space-y-2">
              <div className="font-semibold">📍 Location Services Off</div>
              <div className="opacity-75">
                Go to Settings → Privacy → Location Services:
                <ul className="list-disc list-inside mt-1 ml-2">
                  <li>Location Services must be ON</li>
                  <li>Safari (or your browser) must have permission</li>
                  <li>Status should say "While Using"</li>
                </ul>
              </div>
            </div>

            <div className="bg-orange-900/20 border border-orange-500 p-3 rounded space-y-2">
              <div className="font-semibold">📡 First Time Prompt</div>
              <div className="opacity-75">
                First time accessing location:
                <ul className="list-disc list-inside mt-1 ml-2">
                  <li>iOS shows permission popup</li>
                  <li>You must tap "Allow"</li>
                  <li>If you tap "Don't Allow", try Settings → Reset</li>
                </ul>
              </div>
            </div>

            <div className="bg-orange-900/20 border border-orange-500 p-3 rounded space-y-2">
              <div className="font-semibold">🏢 Indoors</div>
              <div className="opacity-75">
                If location keeps failing:
                <ul className="list-disc list-inside mt-1 ml-2">
                  <li>GPS works better outdoors</li>
                  <li>WiFi-only indoor location is weak</li>
                  <li>Try near a window or outside</li>
                </ul>
              </div>
            </div>

            <div className="bg-orange-900/20 border border-orange-500 p-3 rounded space-y-2">
              <div className="font-semibold">🌐 Not HTTPS</div>
              <div className="opacity-75">
                If your app isn't using HTTPS:
                <ul className="list-disc list-inside mt-1 ml-2">
                  <li>iOS blocks geolocation on HTTP</li>
                  <li>Must be HTTPS to work</li>
                  <li>Check deployment URL in address bar</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Event Log */}
        <div className="bg-blue-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-bold">📋 Event Log</h2>

          {logs.length === 0 ? (
            <div className="text-center py-8 text-blue-300">
              <div>Click "Request Location" to start logging events</div>
            </div>
          ) : (
            <div className="bg-blue-900 rounded p-4 space-y-1 max-h-64 overflow-y-auto font-mono text-xs">
              {logs.map((log, i) => (
                <div key={i} className="text-blue-200">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Diagnosis */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-bold">🔍 Diagnosis & Solutions</h2>

            <div className="space-y-3 text-sm">
              {error.includes('Permission Denied') && (
                <>
                  <div>
                    <strong>Problem:</strong> iOS rejected location request
                  </div>
                  <div>
                    <strong>Solutions:</strong>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                      <li>Check if in Private Browsing Mode → Switch to Normal</li>
                      <li>Go to Settings → Privacy → Location Services → Enable for Safari</li>
                      <li>Go to Settings → Safari → Clear History and Website Data</li>
                      <li>Refresh the website and try again</li>
                      <li>If still denied, you must wait (iOS has cooldown)</li>
                      <li>Try again in 1-2 hours</li>
                    </ol>
                  </div>
                </>
              )}

              {error.includes('Position Unavailable') && (
                <>
                  <div>
                    <strong>Problem:</strong> GPS not working or poor signal
                  </div>
                  <div>
                    <strong>Solutions:</strong>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                      <li>Go outdoors (GPS works better outside)</li>
                      <li>Move away from buildings and trees</li>
                      <li>Wait 30 seconds for GPS to acquire signal</li>
                      <li>Airplane mode off (check control center)</li>
                      <li>Location Services enabled</li>
                      <li>Try again in a few minutes</li>
                    </ol>
                  </div>
                </>
              )}

              {error.includes('Timeout') && (
                <>
                  <div>
                    <strong>Problem:</strong> GPS taking too long to respond
                  </div>
                  <div>
                    <strong>Solutions:</strong>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                      <li>Try outdoors (GPS needs clear sky)</li>
                      <li>Give it 30-60 seconds to acquire</li>
                      <li>Turn off WiFi and use cellular data</li>
                      <li>Restart the phone</li>
                      <li>Enable "High Accuracy" location</li>
                    </ol>
                  </div>
                </>
              )}

              {error.includes('not available') && (
                <>
                  <div>
                    <strong>Problem:</strong> Geolocation API not available
                  </div>
                  <div>
                    <strong>Solutions:</strong>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                      <li>Update iOS to latest version</li>
                      <li>Update browser (Safari, Chrome, Firefox)</li>
                      <li>Try different browser</li>
                      <li>Make sure HTTPS is used</li>
                    </ol>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Testing Checklist */}
        <div className="bg-blue-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">✅ Testing Checklist</h2>
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" />
              <span>Not in Private Browsing mode</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" />
              <span>Location Services enabled (Settings)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" />
              <span>Safari/Browser has location permission</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" />
              <span>Using HTTPS (not HTTP)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" />
              <span>Outdoors or near window (for GPS)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" />
              <span>Airplane mode is OFF</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" />
              <span>Waiting 30+ seconds for GPS</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

function getBrowserName() {
  const ua = navigator.userAgent;
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edge')) return 'Edge';
  return 'Unknown';
}