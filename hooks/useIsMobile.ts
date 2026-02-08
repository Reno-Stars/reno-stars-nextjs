import { useState, useEffect } from 'react';

export function useIsMobile(breakpoint = 768): boolean {
  // Initialize with a function to avoid SSR hydration mismatch warning
  // On server, this returns false; on client, it reads the actual value
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(`(max-width: ${breakpoint}px)`).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
    // Sync state in case SSR value differs from client
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [breakpoint]);

  return isMobile;
}
