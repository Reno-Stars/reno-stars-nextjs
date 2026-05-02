'use client';

import { useState } from 'react';
import { ADMIN_LOCALES, fieldKey, isNativeLocale } from '@/lib/admin/locale-keys';
import { gtxTranslate } from '@/lib/admin/gtx-translate';
import { useLocalizedForm } from './LocalizedFormContext';
import { GOLD, NAVY } from '@/lib/theme';

/**
 * Calls Google's free gtx endpoint to translate every empty locale value
 * from EN. Skips locales that already have content. Updates the form
 * provider's state in-place; persistence happens on form submit.
 */
export default function TranslateAllButton() {
  const { values, fieldNames, patchValues } = useLocalizedForm();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  async function run() {
    if (busy) return;
    setBusy(true);
    setProgress('Starting...');

    const patch: Record<string, string> = {};
    let done = 0;
    let total = 0;

    // Pre-count
    for (const name of fieldNames) {
      const en = values[fieldKey(name, 'en')];
      if (!en) continue;
      for (const loc of ADMIN_LOCALES) {
        if (isNativeLocale(loc) && loc !== 'zh') continue; // skip en (source)
        if (loc === 'en') continue;
        const k = fieldKey(name, loc);
        if (!values[k]) total++;
      }
    }

    if (total === 0) {
      setProgress('All locales already filled');
      setBusy(false);
      return;
    }

    for (const name of fieldNames) {
      const en = values[fieldKey(name, 'en')];
      if (!en) continue;
      for (const loc of ADMIN_LOCALES) {
        if (loc === 'en') continue;
        const k = fieldKey(name, loc);
        if (values[k]) continue; // skip-if-exists

        try {
          const translated = await gtxTranslate(en, loc, 'en');
          if (translated) patch[k] = translated;
        } catch {
          // gtx hiccups happen — skip this cell, leave it empty so a future
          // run (or the bulk-translate cron) can fill it
        }
        done++;
        setProgress(`${done} / ${total}`);
        // gentle pacing to avoid throttling
        await new Promise((r) => setTimeout(r, 120));
      }
    }

    patchValues(patch);
    setProgress(`Done — ${Object.keys(patch).length} translated`);
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={run}
      disabled={busy}
      style={{
        padding: '0.375rem 0.75rem',
        fontSize: '0.75rem',
        fontWeight: 600,
        color: 'white',
        backgroundColor: busy ? '#999' : GOLD,
        border: 'none',
        borderRadius: '6px',
        cursor: busy ? 'wait' : 'pointer',
        boxShadow: `0 1px 0 ${NAVY}`,
      }}
    >
      {busy ? `Translating… ${progress ?? ''}` : '🌐 Auto-fill missing locales'}
    </button>
  );
}
