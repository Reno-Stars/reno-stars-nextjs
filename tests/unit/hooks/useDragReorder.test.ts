import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDragReorder } from '@/hooks/useDragReorder';

interface TestItem {
  id: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
}

const testItems: TestItem[] = [
  { id: '1', name: 'Item 1', displayOrder: 0, isActive: true },
  { id: '2', name: 'Item 2', displayOrder: 1, isActive: true },
  { id: '3', name: 'Item 3', displayOrder: 2, isActive: true },
  { id: '4', name: 'Item 4', displayOrder: 3, isActive: false },
];

describe('useDragReorder', () => {
  const mockOnReorder = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockOnError = vi.fn();

  const defaultOptions = {
    items: testItems,
    getId: (item: TestItem) => item.id,
    getDisplayOrder: (item: TestItem) => item.displayOrder,
    isIncluded: (item: TestItem) => item.isActive,
    onReorder: mockOnReorder,
    onSuccess: mockOnSuccess,
    onError: mockOnError,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnReorder.mockResolvedValue({});
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useDragReorder(defaultOptions));

    expect(result.current.draggedId).toBeNull();
    expect(result.current.dragOverId).toBeNull();
    expect(result.current.localOrder).toBeNull();
    expect(result.current.isReordering).toBe(false);
  });

  it('sets draggedId on drag start', () => {
    const { result } = renderHook(() => useDragReorder(defaultOptions));

    const mockEvent = {
      clientX: 100,
      clientY: 100,
      dataTransfer: {
        effectAllowed: '',
        setData: vi.fn(),
        setDragImage: vi.fn(),
      },
      currentTarget: document.createElement('div'),
    } as unknown as React.DragEvent;

    act(() => {
      result.current.handleDragStart(mockEvent, '1');
    });

    expect(result.current.draggedId).toBe('1');
  });

  it('sets dragOverId on drag over different item', () => {
    const { result } = renderHook(() => useDragReorder(defaultOptions));

    // First start dragging item 1
    const startEvent = {
      clientX: 100,
      clientY: 100,
      dataTransfer: {
        effectAllowed: '',
        setData: vi.fn(),
        setDragImage: vi.fn(),
      },
      currentTarget: document.createElement('div'),
    } as unknown as React.DragEvent;

    act(() => {
      result.current.handleDragStart(startEvent, '1');
    });

    // Then drag over item 2
    const overEvent = {
      preventDefault: vi.fn(),
      dataTransfer: { dropEffect: '' },
    } as unknown as React.DragEvent;

    act(() => {
      result.current.handleDragOver(overEvent, '2');
    });

    expect(result.current.dragOverId).toBe('2');
  });

  it('clears dragOverId on drag leave', () => {
    const { result } = renderHook(() => useDragReorder(defaultOptions));

    // Start dragging and drag over
    const startEvent = {
      clientX: 100,
      clientY: 100,
      dataTransfer: {
        effectAllowed: '',
        setData: vi.fn(),
        setDragImage: vi.fn(),
      },
      currentTarget: document.createElement('div'),
    } as unknown as React.DragEvent;

    act(() => {
      result.current.handleDragStart(startEvent, '1');
    });

    const overEvent = {
      preventDefault: vi.fn(),
      dataTransfer: { dropEffect: '' },
    } as unknown as React.DragEvent;

    act(() => {
      result.current.handleDragOver(overEvent, '2');
    });

    expect(result.current.dragOverId).toBe('2');

    act(() => {
      result.current.handleDragLeave();
    });

    expect(result.current.dragOverId).toBeNull();
  });

  it('resets state on drag end', () => {
    const { result } = renderHook(() => useDragReorder(defaultOptions));

    const startEvent = {
      clientX: 100,
      clientY: 100,
      dataTransfer: {
        effectAllowed: '',
        setData: vi.fn(),
        setDragImage: vi.fn(),
      },
      currentTarget: document.createElement('div'),
    } as unknown as React.DragEvent;

    act(() => {
      result.current.handleDragStart(startEvent, '1');
    });

    expect(result.current.draggedId).toBe('1');

    act(() => {
      result.current.handleDragEnd();
    });

    expect(result.current.draggedId).toBeNull();
    expect(result.current.dragOverId).toBeNull();
  });

  it('calls onReorder with correct order after drop', async () => {
    const { result } = renderHook(() => useDragReorder(defaultOptions));

    // Start dragging item 1
    const startEvent = {
      clientX: 100,
      clientY: 100,
      dataTransfer: {
        effectAllowed: '',
        setData: vi.fn(),
        setDragImage: vi.fn(),
      },
      currentTarget: document.createElement('div'),
    } as unknown as React.DragEvent;

    act(() => {
      result.current.handleDragStart(startEvent, '1');
    });

    // Drop on item 3 (move item 1 to position 2)
    const dropEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.DragEvent;

    await act(async () => {
      result.current.handleDrop(dropEvent, '3');
    });

    // Should reorder: [2, 3, 1] (item 1 moved to after item 3)
    expect(mockOnReorder).toHaveBeenCalledWith(['2', '3', '1']);
  });

  it('calls onSuccess after successful reorder', async () => {
    mockOnReorder.mockResolvedValue({});

    const { result } = renderHook(() => useDragReorder(defaultOptions));

    const startEvent = {
      clientX: 100,
      clientY: 100,
      dataTransfer: {
        effectAllowed: '',
        setData: vi.fn(),
        setDragImage: vi.fn(),
      },
      currentTarget: document.createElement('div'),
    } as unknown as React.DragEvent;

    act(() => {
      result.current.handleDragStart(startEvent, '1');
    });

    const dropEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.DragEvent;

    await act(async () => {
      result.current.handleDrop(dropEvent, '2');
    });

    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('calls onError and reverts on failed reorder', async () => {
    mockOnReorder.mockResolvedValue({ error: 'Failed to reorder' });

    const { result } = renderHook(() => useDragReorder(defaultOptions));

    const startEvent = {
      clientX: 100,
      clientY: 100,
      dataTransfer: {
        effectAllowed: '',
        setData: vi.fn(),
        setDragImage: vi.fn(),
      },
      currentTarget: document.createElement('div'),
    } as unknown as React.DragEvent;

    act(() => {
      result.current.handleDragStart(startEvent, '1');
    });

    const dropEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.DragEvent;

    await act(async () => {
      result.current.handleDrop(dropEvent, '2');
    });

    expect(mockOnError).toHaveBeenCalledWith('Failed to reorder');
    expect(result.current.localOrder).toBeNull(); // Reverted
  });

  it('shouldNavigate returns true when no significant drag', () => {
    const { result } = renderHook(() => useDragReorder(defaultOptions));

    const clickEvent = {
      clientX: 100,
      clientY: 100,
    } as React.MouseEvent;

    expect(result.current.shouldNavigate(clickEvent)).toBe(true);
  });

  it('shouldNavigate returns false after significant drag', () => {
    const { result } = renderHook(() => useDragReorder(defaultOptions));

    // Simulate drag start
    const startEvent = {
      clientX: 100,
      clientY: 100,
      dataTransfer: {
        effectAllowed: '',
        setData: vi.fn(),
        setDragImage: vi.fn(),
      },
      currentTarget: document.createElement('div'),
    } as unknown as React.DragEvent;

    act(() => {
      result.current.handleDragStart(startEvent, '1');
    });

    // Click event far from start
    const clickEvent = {
      clientX: 120, // 20px away
      clientY: 100,
    } as React.MouseEvent;

    expect(result.current.shouldNavigate(clickEvent)).toBe(false);
  });

  it('ignores drop on same item', async () => {
    const { result } = renderHook(() => useDragReorder(defaultOptions));

    const startEvent = {
      clientX: 100,
      clientY: 100,
      dataTransfer: {
        effectAllowed: '',
        setData: vi.fn(),
        setDragImage: vi.fn(),
      },
      currentTarget: document.createElement('div'),
    } as unknown as React.DragEvent;

    act(() => {
      result.current.handleDragStart(startEvent, '1');
    });

    const dropEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.DragEvent;

    await act(async () => {
      result.current.handleDrop(dropEvent, '1'); // Drop on same item
    });

    expect(mockOnReorder).not.toHaveBeenCalled();
  });
});
