'use client';

import { NAVY } from '@/lib/theme';

interface DragHandleProps {
  /** Whether the handle is currently visible/active */
  active?: boolean;
  /** Color override for the dots */
  color?: string;
}

const dotBase: React.CSSProperties = { width: '3px', height: '3px', borderRadius: '50%' };
const rowStyle: React.CSSProperties = { display: 'flex', gap: '2px' };

/**
 * 6-dot drag handle pattern for draggable items.
 * Shows 2 columns x 2 rows of small dots.
 */
export default function DragHandle({ active = false, color = NAVY }: DragHandleProps) {
  const dot: React.CSSProperties = { ...dotBase, backgroundColor: color };

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
      <div style={rowStyle}>
        <div style={dot} />
        <div style={dot} />
      </div>
      <div style={rowStyle}>
        <div style={dot} />
        <div style={dot} />
      </div>
    </div>
  );
}
