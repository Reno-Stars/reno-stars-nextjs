'use client';

import { useEffect, useId, useState } from 'react';
import { GOLD, TEXT, TEXT_MID, TEXT_MUTED, CARD, SURFACE_ALT, neu } from '@/lib/theme';
import { BUDGET_PRESETS, presetForSelection } from '@/lib/budget-presets';
import { ChevronDown } from 'lucide-react';

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

  // Preset dropdown state: matching preset slug, 'all' when untouched, or
  // 'custom' when the thumbs/inputs sit on a non-preset range.
  const activePreset = presetForSelection(value, bounds);
  const presetValue = value ? (activePreset?.slug ?? 'custom') : 'all';
  const onPresetChange = (slug: string) => {
    if (slug === 'all') { onChange(null); return; }
    const p = BUDGET_PRESETS.find((x) => x.slug === slug);
    if (!p) return;
    const lo2 = Math.max(p.min, minB);
    const hi2 = Math.min(p.max ?? Number.MAX_SAFE_INTEGER, maxB);
    emit(lo2, hi2);
  };

  const numStyle: React.CSSProperties = {
    backgroundColor: SURFACE_ALT,
    color: value ? TEXT : TEXT_MID,
    boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.10)',
  };

  return (
    <div
      className="flex flex-wrap sm:flex-nowrap items-center gap-x-2.5 gap-y-2.5 px-3 py-2 rounded-lg select-none w-full"
      style={{ boxShadow: neu(3), backgroundColor: CARD }}
      title={value ? undefined : allLabel}
    >
      <div className="relative flex-1 sm:flex-none order-1">
        <select
          value={presetValue}
          onChange={(e) => onPresetChange(e.target.value)}
          aria-label={allLabel}
          className="appearance-none w-full sm:w-auto pl-2.5 pr-7 py-1.5 text-xs font-medium rounded-md cursor-pointer outline-none"
          style={{ backgroundColor: SURFACE_ALT, color: value ? TEXT : TEXT_MID, border: 'none', boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.10)' }}
        >
          <option value="all">{allLabel}</option>
          {BUDGET_PRESETS.map((p) => (
            <option key={p.slug} value={p.slug}>{p.label}</option>
          ))}
          {presetValue === 'custom' && <option value="custom" disabled>{`$${lo.toLocaleString()} – $${hi.toLocaleString()}`}</option>}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: TEXT_MUTED }} aria-hidden="true" />
      </div>
      <div className="relative shrink-0 order-2">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: TEXT_MUTED }}>$</span>
        <input
          type="text" inputMode="numeric" value={loText}
          aria-label={ariaLabelMin}
          onChange={(e) => setLoText(e.target.value)}
          onBlur={commitLo}
          onKeyDown={onEnter(commitLo)}
          className="text-xs rounded-md pl-5 pr-2 py-1.5 text-right outline-none w-[74px]"
          style={numStyle}
        />
      </div>
      <div className={`relative h-7 w-full order-last sm:order-3 sm:w-auto sm:flex-1 budget-slider-${uid}`} style={{ minWidth: 0 }}>
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
          @media (pointer: coarse) {
            .budget-slider-${uid} .dual-range::-webkit-slider-thumb { width: 22px; height: 22px; }
            .budget-slider-${uid} .dual-range::-moz-range-thumb { width: 22px; height: 22px; }
          }
        `}</style>
      </div>
      <div className="relative shrink-0 order-3 sm:order-4">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: TEXT_MUTED }}>$</span>
        <input
          type="text" inputMode="numeric" value={hiText}
          aria-label={ariaLabelMax}
          onChange={(e) => setHiText(e.target.value)}
          onBlur={commitHi}
          onKeyDown={onEnter(commitHi)}
          className="text-xs rounded-md pl-5 pr-2 py-1.5 text-right outline-none w-[74px]"
          style={numStyle}
        />
      </div>
    </div>
  );
}
