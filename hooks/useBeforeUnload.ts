import { useEffect, useRef, useCallback } from 'react';

/**
 * Warns users before navigating away from a page with unsaved changes.
 * Attaches a `beforeunload` event listener when `dirty` is true.
 *
 * @param dirty - Whether the form has unsaved changes.
 */
export function useBeforeUnload(dirty: boolean) {
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  const handler = useCallback((e: BeforeUnloadEvent) => {
    if (dirtyRef.current) {
      e.preventDefault();
    }
  }, []);

  useEffect(() => {
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [handler]);
}
