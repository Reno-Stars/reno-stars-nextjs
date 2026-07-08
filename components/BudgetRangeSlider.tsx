'use client';

import { useId } from 'react';
import { GOLD, TEXT, TEXT_MID, CARD, neu } from '@/lib/theme';

interface BudgetRangeSliderProps {
  /** Full selectable extent in dollars, e.g. [3000, 170000]. */
  bounds: [number, number];
  /** Current selection; null = untouched ("any budget"). */
  value: [number, number] | null;
  onChange: (v: [number, number] | null) => void;
  step?: number;
  ariaLabelMin: string;
  ariaLabelMax: string;
  /** Label shown when the full extent is selected. */
  allLabel: string;
}

function fmt(n: number): string {
  return n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;
}

/**
 * Dual-thumb budget range slider (two overlaid native <input type="range">
 * elements — track clicks land on the nearer thumb, keyboard works per-thumb).
 * Emits null when the selection covers the full extent, meaning "no filter".
 */
export default function BudgetRangeSlider({ bounds, value, onChange, step = 1000, ariaLabelMin, ariaLabelMax, allLabel }: BudgetRangeSliderProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [minB, maxB] = bounds;
  const [lo, hi] = value ?? bounds;

  const emit = (nextLo: number, nextHi: number) => {
    if (nextLo <= minB && nextHi >= maxB) onChange(null);
    else onChange([nextLo, nextHi]);
  };

  const pct = (v: number) => ((v - minB) / Math.max(1, maxB - minB)) * 100;

  return (
    <div
      className="flex items-center gap-3 px-4 py-2 rounded-lg select-none"
      style={{ boxShadow: neu(3), backgroundColor: CARD, minWidth: 240 }}
    >
      <span className="text-sm whitespace-nowrap" style={{ color: value ? TEXT : TEXT_MID }}>
        {value ? `${fmt(lo)} – ${fmt(hi)}` : allLabel}
      </span>
      <div className={`relative flex-1 h-6 budget-slider-${uid}`} style={{ minWidth: 120 }}>
        {/* track */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 rounded-full" style={{ backgroundColor: `${TEXT_MID}30` }} />
        {/* gold fill between thumbs */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full"
          style={{ backgroundColor: GOLD, left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
        />
        <input
          type="range" min={minB} max={maxB} step={step} value={lo}
          aria-label={ariaLabelMin}
          onChange={(e) => emit(Math.min(Number(e.target.value), hi - step), hi)}
          className="dual-range absolute inset-0 w-full appearance-none bg-transparent"
        />
        <input
          type="range" min={minB} max={maxB} step={step} value={hi}
          aria-label={ariaLabelMax}
          onChange={(e) => emit(lo, Math.max(Number(e.target.value), lo + step))}
          className="dual-range absolute inset-0 w-full appearance-none bg-transparent"
        />
        {/* thumb styling: inputs ignore pointer events except on their thumbs,
            so the two overlaid ranges never block each other */}
        <style>{`
          .budget-slider-${uid} .dual-range { pointer-events: none; height: 100%; }
          .budget-slider-${uid} .dual-range::-webkit-slider-thumb {
            -webkit-appearance: none; appearance: none; pointer-events: auto;
            width: 16px; height: 16px; border-radius: 9999px;
            background: ${GOLD}; border: 2px solid #fff;
            box-shadow: 0 1px 3px rgba(0,0,0,.35); cursor: pointer;
          }
          .budget-slider-${uid} .dual-range::-moz-range-thumb {
            pointer-events: auto; width: 16px; height: 16px; border-radius: 9999px;
            background: ${GOLD}; border: 2px solid #fff;
            box-shadow: 0 1px 3px rgba(0,0,0,.35); cursor: pointer;
          }
          .budget-slider-${uid} .dual-range::-webkit-slider-runnable-track { background: transparent; }
          .budget-slider-${uid} .dual-range::-moz-range-track { background: transparent; }
        `}</style>
      </div>
    </div>
  );
}
