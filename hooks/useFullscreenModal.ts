import { useEffect, useRef, useCallback } from 'react';

interface UseFullscreenModalOptions {
  isOpen: boolean;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Manages fullscreen overlay accessibility: scroll lock, focus trap,
 * keyboard navigation (Escape/Arrows/Tab), and return focus on close.
 */
export function useFullscreenModal({ isOpen, onClose, onPrev, onNext }: UseFullscreenModalOptions) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const prevOverflowRef = useRef<string>('');

  // Scroll lock
  useEffect(() => {
    if (isOpen) {
      prevOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = prevOverflowRef.current;
    }
    return () => {
      document.body.style.overflow = prevOverflowRef.current;
    };
  }, [isOpen]);

  // Focus management: move focus into overlay on open, return on close
  useEffect(() => {
    if (isOpen && overlayRef.current) {
      const firstFocusable = overlayRef.current.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      firstFocusable?.focus();
    }
    if (!isOpen && triggerRef.current) {
      triggerRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard handler
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'ArrowLeft' && onPrev) {
        e.preventDefault();
        onPrev();
        return;
      }
      if (e.key === 'ArrowRight' && onNext) {
        e.preventDefault();
        onNext();
        return;
      }
      // Focus trap
      if (e.key === 'Tab' && overlayRef.current) {
        const focusable = overlayRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onPrev, onNext]);

  const captureTrigger = useCallback((e: React.MouseEvent) => {
    triggerRef.current = e.currentTarget as HTMLElement;
  }, []);

  return { overlayRef, triggerRef, captureTrigger };
}
