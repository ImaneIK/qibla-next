import { useState, useEffect, useCallback, useRef } from 'react';

export interface OrientationState {
  heading: number | null;
  isSupported: boolean;
  needsPermission: boolean;
  permissionGranted: boolean;
}

/**
 * BULLETPROOF Device Orientation Hook for Android
 * 
 * Key fixes:
 * 1. Simplified event handling - no complex boolean logic
 * 2. Direct alpha → heading conversion (360 - alpha) for Android
 * 3. Immediate listener attachment on Android (no permission delay)
 * 4. Robust error handling
 * 5. console.log statements to debug on device
 */
export function useDeviceOrientation(debug = true) {
  const [state, setState] = useState<OrientationState>({
    heading: null,
    isSupported: false,
    needsPermission: false,
    permissionGranted: false,
  });

  const lastHeading = useRef<number | null>(null);
  const frameRef = useRef<number>(0);
  const eventCountRef = useRef<number>(0);

  const handleOrientation = useCallback(
    (event: DeviceOrientationEvent) => {
      eventCountRef.current++;

      // Get raw values
      const alpha = event.alpha; // 0-360, rotation around Z axis
      const beta = event.beta;   // -180 to 180, rotation around X axis
      const gamma = event.gamma; // -90 to 90, rotation around Y axis

      if (debug && eventCountRef.current % 10 === 0) {
        console.log(
          `[useDeviceOrientation #${eventCountRef.current}] alpha=${alpha?.toFixed(1)}, beta=${beta?.toFixed(1)}, gamma=${gamma?.toFixed(1)}`
        );
      }

      // iOS: use webkitCompassHeading if available
      if ('webkitCompassHeading' in event) {
        const iosHeading = (event as any).webkitCompassHeading;
        console.log('[useDeviceOrientation] iOS detected, using webkitCompassHeading:', iosHeading);
        lastHeading.current = iosHeading;
        setState((s) => ({
          ...s,
          heading: iosHeading,
          permissionGranted: true,
        }));
        return;
      }

      // Android: alpha gives rotation around Z-axis
      // When phone is flat, alpha = 0 points to magnetic north
      // heading = 360 - alpha converts to compass bearing (0° = north, 90° = east, etc.)
      if (alpha !== null && alpha !== undefined) {
        let heading = 360 - alpha;

        // Normalize to 0-360
        heading = ((heading % 360) + 360) % 360;

        // Debounce with rAF to avoid excessive state updates
        cancelAnimationFrame(frameRef.current);
        frameRef.current = requestAnimationFrame(() => {
          // Initialize on first valid reading
          if (lastHeading.current === null) {
            lastHeading.current = heading;
            if (debug) console.log('[useDeviceOrientation] First reading:', heading.toFixed(1));
          } else {
            // Smooth the heading using weighted average
            let diff = heading - lastHeading.current;

            // Handle 360° wraparound
            if (diff > 180) diff -= 360;
            if (diff < -180) diff += 360;

            // Skip unrealistic jumps (sensor noise)
            if (Math.abs(diff) > 90) {
              if (debug) console.log('[useDeviceOrientation] Skipped jump:', diff.toFixed(1));
              return;
            }

            // Weighted smoothing: respond faster (0.4 instead of 0.2)
            heading = lastHeading.current + diff * 0.4;
            heading = ((heading % 360) + 360) % 360;
            lastHeading.current = heading;
          }

          setState((s) => ({
            ...s,
            heading,
            permissionGranted: true,
          }));

          if (debug && eventCountRef.current % 30 === 0) {
            console.log('[useDeviceOrientation] Updated heading:', heading.toFixed(1));
          }
        });
      }
    },
    [debug]
  );

  const requestPermission = useCallback(async () => {
    console.log('[useDeviceOrientation] requestPermission called');

    // iOS 13+ requires user gesture
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        console.log('[useDeviceOrientation] iOS permission response:', permission);

        if (permission === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation, true);
          setState((s) => ({
            ...s,
            permissionGranted: true,
            needsPermission: false,
          }));
        }
      } catch (error) {
        console.error('[useDeviceOrientation] iOS permission error:', error);
        setState((s) => ({ ...s, isSupported: false }));
      }
    }
  }, [handleOrientation]);

  useEffect(() => {
    console.log('[useDeviceOrientation] useEffect mounted');

    // Check if window exists (SSR)
    if (typeof window === 'undefined') {
      console.log('[useDeviceOrientation] No window object');
      return;
    }

    // Check if DeviceOrientationEvent is available
    if (!('DeviceOrientationEvent' in window)) {
      console.log('[useDeviceOrientation] DeviceOrientationEvent NOT supported');
      setState((s) => ({ ...s, isSupported: false }));
      return;
    }

    console.log('[useDeviceOrientation] ✅ DeviceOrientationEvent IS SUPPORTED');
    setState((s) => ({ ...s, isSupported: true }));

    // iOS 13+: Check for requestPermission function
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      console.log('[useDeviceOrientation] iOS 13+ detected - requires permission');
      setState((s) => ({ ...s, needsPermission: true }));
      return; // User must click button to request permission
    }

    // Android: Attach listeners immediately (no permission required pre-Android 6)
    console.log('[useDeviceOrientation] Android detected - attaching listeners immediately');

    window.addEventListener('deviceorientation', handleOrientation, true);

    // Some Android devices also support deviceorientationabsolute for true north
    if ('ondeviceorientationabsolute' in window) {
      console.log('[useDeviceOrientation] deviceorientationabsolute also supported');
      window.addEventListener('deviceorientationabsolute' as any, handleOrientation, true);
    }

    console.log('[useDeviceOrientation] Listeners attached ✅');

    // Cleanup
    return () => {
      console.log('[useDeviceOrientation] Cleaning up listeners');
      window.removeEventListener('deviceorientation', handleOrientation, true);
      window.removeEventListener('deviceorientationabsolute' as any, handleOrientation, true);
      cancelAnimationFrame(frameRef.current);
    };
  }, [handleOrientation, debug]);

  return { ...state, requestPermission };
}