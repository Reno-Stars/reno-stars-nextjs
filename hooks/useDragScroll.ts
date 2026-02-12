'use client';

import { useRef, useCallback } from 'react';

/** Drag threshold in pixels - movement below this is considered a click, not a drag */
const DRAG_THRESHOLD_PX = 3;

/** Duration in ms for the elastic bounce-back animation */
const SCROLL_BOUNCE_DURATION_MS = 300;

/** Resistance multiplier for elastic overscroll (0-1, lower = more resistance) */
const ELASTIC_RESISTANCE = 0.4;

interface DragState {
  isDown: boolean;
  startX: number;
  scrollLeft: number;
  container: HTMLDivElement | null;
  hasMoved: boolean;
}

/**
 * Custom hook for drag-to-scroll functionality with elastic bounce effect.
 * Uses Pointer Events API for reliable cross-device support.
 *
 * @returns Object with event handlers and drag state checker
 */
export function useDragScroll() {
  const dragRef = useRef<DragState>({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
    container: null,
    hasMoved: false,
  });

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Don't capture pointer if clicking on an interactive element (button, link)
    const target = e.target;
    if (target instanceof HTMLElement && target.closest('button, a, [role="button"]')) {
      return;
    }

    const container = e.currentTarget;
    container.setPointerCapture(e.pointerId);
    dragRef.current = {
      isDown: true,
      startX: e.clientX,
      scrollLeft: container.scrollLeft,
      container,
      hasMoved: false,
    };
    container.style.cursor = 'grabbing';
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    container.releasePointerCapture(e.pointerId);
    dragRef.current.isDown = false;
    container.style.cursor = 'grab';

    // Elastic bounce back to bounds
    const maxScroll = container.scrollWidth - container.clientWidth;
    container.style.scrollBehavior = 'smooth';
    if (container.scrollLeft < 0) {
      container.scrollLeft = 0;
    } else if (container.scrollLeft > maxScroll && maxScroll > 0) {
      container.scrollLeft = maxScroll;
    }
    setTimeout(() => {
      container.style.scrollBehavior = 'auto';
    }, SCROLL_BOUNCE_DURATION_MS);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.isDown) return;
    e.preventDefault();

    const container = e.currentTarget;
    const dx = e.clientX - dragRef.current.startX;

    if (Math.abs(dx) > DRAG_THRESHOLD_PX) {
      dragRef.current.hasMoved = true;
    }

    const newScrollLeft = dragRef.current.scrollLeft - dx;
    const maxScroll = container.scrollWidth - container.clientWidth;

    // Elastic resistance at edges
    if (newScrollLeft < 0) {
      container.scrollLeft = newScrollLeft * ELASTIC_RESISTANCE;
    } else if (newScrollLeft > maxScroll && maxScroll > 0) {
      container.scrollLeft = maxScroll + (newScrollLeft - maxScroll) * ELASTIC_RESISTANCE;
    } else {
      container.scrollLeft = newScrollLeft;
    }
  }, []);

  /**
   * Check if a drag just occurred. Returns true if dragged, false otherwise.
   * Resets the flag when called, so subsequent calls return false.
   */
  const wasJustDragging = useCallback(() => {
    if (dragRef.current.hasMoved) {
      dragRef.current.hasMoved = false;
      return true;
    }
    return false;
  }, []);

  /** Stop click propagation on container */
  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return {
    /** Attach to onPointerDown */
    handlePointerDown,
    /** Attach to onPointerUp and onPointerCancel */
    handlePointerUp,
    /** Attach to onPointerMove */
    handlePointerMove,
    /** Check if user just dragged (resets flag on call) */
    wasJustDragging,
    /** Stop click propagation on container (attach to onClick) */
    stopPropagation,
  };
}
