import { useState, useCallback, useRef, useEffect } from 'react';

/** Minimum pixel movement to distinguish a drag from a click */
const DRAG_THRESHOLD_PX = 5;

interface DragReorderState<T> {
  draggedId: string | null;
  dragOverId: string | null;
  localOrder: T[] | null;
  isReordering: boolean;
}

interface DragReorderActions {
  handleDragStart: (e: React.DragEvent, id: string) => void;
  handleDragOver: (e: React.DragEvent, id: string) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent, targetId: string) => void;
  handleDragEnd: () => void;
  shouldNavigate: (e: React.MouseEvent) => boolean;
}

interface UseDragReorderOptions<T> {
  items: T[];
  getId: (item: T) => string;
  getDisplayOrder: (item: T) => number;
  isIncluded: (item: T) => boolean;
  onReorder: (orderedIds: string[]) => Promise<{ error?: string }>;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useDragReorder<T>({
  items,
  getId,
  getDisplayOrder,
  isIncluded,
  onReorder,
  onSuccess,
  onError,
}: UseDragReorderOptions<T>): DragReorderState<T> & DragReorderActions {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [localOrder, setLocalOrder] = useState<T[] | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const mountedRef = useRef(true);

  // Track mounted state to prevent state updates after unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDraggedId(id);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    if (e.currentTarget instanceof HTMLElement) {
      e.dataTransfer.setDragImage(e.currentTarget, 50, 50);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedId && id !== draggedId) {
      setDragOverId(id);
    }
  }, [draggedId]);

  const handleDragLeave = useCallback(() => {
    setDragOverId(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverId(null);

    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    // Optimistic reorder
    const currentItems = localOrder ?? [...items];
    const includedItems = currentItems
      .filter(isIncluded)
      .sort((a, b) => getDisplayOrder(a) - getDisplayOrder(b));

    const draggedIndex = includedItems.findIndex((item) => getId(item) === draggedId);
    const targetIndex = includedItems.findIndex((item) => getId(item) === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedId(null);
      return;
    }

    // Reorder the array
    const newOrder = [...includedItems];
    const [draggedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);

    // Merge back with excluded items (appended at end - only included items are reorderable)
    const excluded = currentItems.filter((item) => !isIncluded(item));
    setLocalOrder([...newOrder, ...excluded]);
    setDraggedId(null);

    // Save to server with proper cleanup handling
    setIsReordering(true);
    onReorder(newOrder.map(getId))
      .then((result) => {
        // Guard against state updates after unmount
        if (!mountedRef.current) return;

        if (result.error) {
          onError?.(result.error);
          setLocalOrder(null); // Revert on error
        } else {
          onSuccess?.();
          setLocalOrder(null); // Clear local state, use server data
        }
        setIsReordering(false);
      })
      .catch(() => {
        // Guard against state updates after unmount
        if (!mountedRef.current) return;

        onError?.('Failed to reorder items');
        setLocalOrder(null);
        setIsReordering(false);
      });
  }, [draggedId, items, localOrder, getId, getDisplayOrder, isIncluded, onReorder, onSuccess, onError]);

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDragOverId(null);
    dragStartPos.current = null;
  }, []);

  const shouldNavigate = useCallback((e: React.MouseEvent): boolean => {
    if (dragStartPos.current) {
      const dx = Math.abs(e.clientX - dragStartPos.current.x);
      const dy = Math.abs(e.clientY - dragStartPos.current.y);
      if (dx > DRAG_THRESHOLD_PX || dy > DRAG_THRESHOLD_PX) {
        return false;
      }
    }
    return true;
  }, []);

  return {
    draggedId,
    dragOverId,
    localOrder,
    isReordering,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    shouldNavigate,
  };
}
