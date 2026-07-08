'use client';

import { useEffect, useId, useState } from 'react';
import { GOLD, TEXT, TEXT_MID, CARD, SURFACE_ALT, neu } from '@/lib/theme';

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

/**
 * Dual-thumb budget range slider with exact-value number inputs.
 * Two overlaid native <input type="range"> elements give per-thumb keyboard
 * and pointer control; the number inputs commit on blur/Enter for exact values.
 * Emits null when the selection covers the full extent, meaning "no filter".
 */
export default function BudgetRangeSlider({ bounds, value, onChange, step = 1000, ariaLabelMin, ariaLabelMax, allLabel }: BudgetRangeSliderProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [minB, maxB] = bounds;
  const [lo, hi] = value ?? bounds;

  // Local text state so typing isn't clamped mid-keystroke; commit on blur/Enter.
  const [loText, setLoText] = useState(String(lo));
  const [hiText, setHiText] = useState(String(hi));
  useEffect(() => { setLoText(String(lo)); }, [lo]);
  useEffect(() => { setHiText(String(hi)); }, [hi]);

  const emit = (nextLo: number, nextHi: number) => {
    if (nextLo <= minB && nextHi >= maxB) onChange(null);
    else onChange([nextLo, nextHi]);
  };

  const commitLo = () => {
    const n = parseInt(loText.replace(/[^0-9]/g, ''), 10);
    if (Number.isNaN(n)) { setLoText(String(lo)); return; }
    emit(Math.min(Math.max(n, minB), hi - step), hi);
  };
  const commitHi = () => {
    const n = parseInt(hiText.replace(/[^0-9]/g, ''), 10);
    if (Number.isNaN(n)) { setHiText(String(hi)); return; }
    emit(lo, Math.max(Math.min(n, maxB), lo + step));
  };
  const onEnter = (commit: () => void) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { commit(); (e.target as HTMLInputElement).blur(); }
  };

  const pct = (v: number) => ((v - minB) / Math.max(1, maxB - minB)) * 100;

  const numStyle: React.CSSProperties = {
    backgroundColor: SURFACE_ALT,
    color: value ? TEXT : TEXT_MID,
    width: 76,
    boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.12)',
  };

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg select-none"
      style={{ boxShadow: neu(3), backgroundColor: CARD, minWidth: 300 }}
      title={value ? undefined : allLabel}
    >
      <span className="text-xs" style={{ color: TEXT_MID }}>$</span>
      <input
        type="text" inputMode="numeric" value={loText}
        aria-label={ariaLabelMin}
        onChange={(e) => setLoText(e.target.value)}
        onBlur={commitLo}
        onKeyDown={onEnter(commitLo)}
        className="text-sm rounded-md px-2 py-1 text-right outline-none"
        style={numStyle}
      />
      <div className={`relative flex-1 h-6 budget-slider-${uid}`} style={{ minWidth: 110 }}>
        {/* track */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 rounded-full" style={{ backgroundColor: `${TEXT_MID}30` }} />
        {/* gold fill between thumbs */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full"
          style={{ backgroundColor: GOLD, left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
        />
        <input
          type="range" min={minB} max={maxB} step={step} value={lo}
          aria-label={`${ariaLabelMin} slider`}
          onChange={(e) => emit(Math.min(Number(e.target.value), hi - step), hi)}
          className="dual-range absolute inset-0 w-full appearance-none bg-transparent"
        />
        <input
          type="range" min={minB} max={maxB} step={step} value={hi}
          aria-label={`${ariaLabelMax} slider`}
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
      <span className="text-xs" style={{ color: TEXT_MID }}>$</span>
      <input
        type="text" inputMode="numeric" value={hiText}
        aria-label={ariaLabelMax}
        onChange={(e) => setHiText(e.target.value)}
        onBlur={commitHi}
        onKeyDown={onEnter(commitHi)}
        className="text-sm rounded-md px-2 py-1 text-right outline-none"
        style={numStyle}
      />
    </div>
  );
}
