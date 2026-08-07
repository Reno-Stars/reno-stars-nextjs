'use client';

import { useState } from 'react';
import { Check, StickyNote } from 'lucide-react';
import { GOLD, TEXT, TEXT_MID, TEXT_MUTED, CARD, SURFACE_ALT } from '@/lib/theme';

export type Severity = 'blocker' | 'high' | undefined;

interface CheckRowProps {
  id: string;
  label: string;
  hint?: string;
  severity?: Severity;
  severityLabel?: string;
  checked: boolean;
  note: string;
  noteLabel: string;
  notePlaceholder: string;
  onToggle: (id: string) => void;
  onNote: (id: string, value: string) => void;
}

const SEVERITY_STYLE: Record<string, { border: string; chip: string; chipBg: string }> = {
  blocker: { border: '#dc2626', chip: '#991b1b', chipBg: 'rgba(220,38,38,0.10)' },
  high: { border: '#F7931E', chip: '#8a4f00', chipBg: 'rgba(247,147,30,0.12)' },
};

/**
 * One tickable line with an optional explanatory hint and a collapsible note.
 *
 * The whole row is the label so it's a large tap target on a phone held in one
 * hand at a client's door. The note stays collapsed until asked for — a
 * dozen open textareas would bury the checks themselves.
 */
export default function CheckRow({
  id, label, hint, severity, severityLabel, checked, note, noteLabel,
  notePlaceholder, onToggle, onNote,
}: CheckRowProps) {
  const [noteOpen, setNoteOpen] = useState(Boolean(note));
  const sev = severity ? SEVERITY_STYLE[severity] : undefined;

  return (
    <li
      className="rounded-xl transition-colors"
      style={{
        background: checked ? SURFACE_ALT : CARD,
        borderLeft: sev ? `3px solid ${sev.border}` : '3px solid transparent',
      }}
    >
      <div className="flex items-start gap-2 p-3 sm:p-4">
        <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={checked}
            onChange={() => onToggle(id)}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2"
            style={{
              borderColor: checked ? GOLD : 'rgba(27,54,93,0.35)',
              background: checked ? GOLD : 'transparent',
            }}
          >
            {checked && <Check size={16} strokeWidth={3} color="#fff" />}
          </span>
          <span className="min-w-0 flex-1">
            <span
              className="block text-[15px] leading-snug sm:text-base"
              style={{
                color: checked ? TEXT_MUTED : TEXT,
                textDecoration: checked ? 'line-through' : 'none',
              }}
            >
              {label}
            </span>
            {severityLabel && (
              <span
                className="mt-1.5 inline-block rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
                style={{ color: sev?.chip, background: sev?.chipBg }}
              >
                {severityLabel}
              </span>
            )}
            {hint && (
              <span className="mt-1 block text-[13px] leading-relaxed" style={{ color: TEXT_MID, opacity: 0.75 }}>
                {hint}
              </span>
            )}
          </span>
        </label>

        {/* Icon-only trigger, right-aligned: a full-width "Notes" link under
            every check buried the checks themselves in a six-item card. */}
        {!noteOpen && (
          <button
            type="button"
            onClick={() => setNoteOpen(true)}
            aria-label={`${noteLabel} — ${label}`}
            title={noteLabel}
            className="-mt-0.5 shrink-0 rounded-lg p-2 transition-opacity hover:opacity-100"
            style={{ color: GOLD, opacity: note ? 1 : 0.45 }}
          >
            <StickyNote size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      {noteOpen && (
        <div className="px-3 pb-3 sm:px-4 sm:pb-4">
          <textarea
            value={note}
            onChange={(e) => onNote(id, e.target.value)}
            placeholder={notePlaceholder}
            rows={2}
            aria-label={`${noteLabel} — ${label}`}
            className="w-full resize-y rounded-lg border p-2 text-sm"
            style={{ borderColor: 'rgba(27,54,93,0.18)', background: '#fff', color: TEXT }}
          />
        </div>
      )}
    </li>
  );
}
