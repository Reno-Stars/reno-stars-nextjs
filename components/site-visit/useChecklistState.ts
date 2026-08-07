'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'renostars:site-visit:v1';

interface ChecklistState {
  checks: Record<string, boolean>;
  notes: Record<string, string>;
}

const EMPTY: ChecklistState = { checks: {}, notes: {} };

/**
 * Ticks and notes for the site-visit checklist, persisted to localStorage.
 *
 * Keyed by stable check id (`always:parking`, `cond:asbestos`, `step:vanity:2`)
 * rather than by scope, so changing the add-on selection mid-visit keeps every
 * tick that is still on screen. Nothing leaves the device — there is no account
 * to hang this off, and a site visit is a single session on one phone.
 */
export function useChecklistState() {
  const [state, setState] = useState<ChecklistState>(EMPTY);
  // Guards against writing the empty initial state over real saved data during
  // the first render pass, before the effect below has read localStorage.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ChecklistState>;
        setState({ checks: parsed.checks ?? {}, notes: parsed.notes ?? {} });
      }
    } catch {
      // Private mode, quota, or corrupt JSON — start clean rather than break
      // the page. The checklist is still fully usable without persistence.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore — see above.
    }
  }, [state, hydrated]);

  const toggle = useCallback((id: string) => {
    setState((s) => ({ ...s, checks: { ...s.checks, [id]: !s.checks[id] } }));
  }, []);

  const setNote = useCallback((id: string, value: string) => {
    setState((s) => ({ ...s, notes: { ...s.notes, [id]: value } }));
  }, []);

  const reset = useCallback(() => setState(EMPTY), []);

  return { checks: state.checks, notes: state.notes, toggle, setNote, reset, hydrated };
}
