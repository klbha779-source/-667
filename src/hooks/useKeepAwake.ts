import { useEffect, useRef, useState } from 'react';

export function useKeepAwake(enabled: boolean = true) {
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);
  const [lastTouchTime, setLastTouchTime] = useState<string | null>(null);
  const [showTouchPulse, setShowTouchPulse] = useState(false);
  const wakeLockRef = useRef<any>(null);

  // 1. Web Screen Wake Lock API
  useEffect(() => {
    if (!enabled) {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
      setIsWakeLockActive(false);
      return;
    }

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          const lock = await (navigator as any).wakeLock.request('screen');
          wakeLockRef.current = lock;
          setIsWakeLockActive(true);

          lock.addEventListener('release', () => {
            setIsWakeLockActive(false);
          });
        }
      } catch (err) {
        console.warn('Wake Lock request failed:', err);
      }
    };

    requestWakeLock();

    // Re-acquire lock if tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [enabled]);

  // 2. Periodic Touch Keepalive Every 5 Minutes (300 seconds)
  useEffect(() => {
    if (!enabled) return;

    const triggerSimulatedTouch = () => {
      // Create synthetic touch & pointer events
      try {
        const touchEvent = new TouchEvent('touchstart', {
          bubbles: true,
          cancelable: true,
          view: window,
        });
        document.body.dispatchEvent(touchEvent);

        const clickEvent = new MouseEvent('mousemove', {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: window.innerWidth / 2,
          clientY: window.innerHeight / 2,
        });
        document.body.dispatchEvent(clickEvent);
      } catch (e) {
        // Fallback event dispatch
        window.dispatchEvent(new Event('resize'));
      }

      // Visual pulse on screen
      setShowTouchPulse(true);
      const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastTouchTime(timeStr);

      setTimeout(() => {
        setShowTouchPulse(false);
      }, 1500);
    };

    // Trigger initial keepalive immediately
    triggerSimulatedTouch();

    // Repeat every 5 minutes (300,000 milliseconds)
    const interval = setInterval(triggerSimulatedTouch, 300000);

    return () => clearInterval(interval);
  }, [enabled]);

  return { isWakeLockActive, lastTouchTime, showTouchPulse };
}
