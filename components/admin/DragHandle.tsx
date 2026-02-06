'use client';

import { NAVY } from '@/lib/theme';

interface DragHandleProps {
  /** Whether the handle is currently visible/active */
  active?: boolean;
  /** Color override for the dots */
  color?: string;
}

/**
 * 6-dot drag handle pattern for draggable items.
 * Shows 2 columns x 3 rows of small dots.
 */
export default function DragHandle({ active = false, color = NAVY }: DragHandleProps) {
  const dotStyle = {
    width: '3px',
    height: '3px',
    borderRadius: '50%',
    backgroundColor: color,
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        opacity: active ? 0.6 : 0.3,
        transition: 'opacity 0.15s',
      }}
      aria-hidden="true"
    >
      <div style={{ display: 'flex', gap: '2px' }}>
        <div style={dotStyle} />
        <div style={dotStyle} />
      </div>
      <div style={{ display: 'flex', gap: '2px' }}>
        <div style={dotStyle} />
        <div style={dotStyle} />
      </div>
    </div>
  );
}
