'use client';

import { useState, useCallback, useEffect } from 'react';
import { NAVY, GOLD, SURFACE, ERROR } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';
import { optimizeShortTextAction } from '@/app/actions/admin/optimize-content';
import Tooltip from './Tooltip';
import { inputStyle } from './shared-styles';

interface AIBilingualTextareaProps {
  nameEn: string;
  nameZh: string;
  label: string;
  defaultValueEn?: string;
  defaultValueZh?: string;
  required?: boolean;
  rows?: number;
  tooltip?: string;
  /** Whether the fields are disabled */
  disabled?: boolean;
}

const textareaStyle = {
  ...inputStyle,
  resize: 'vertical' as const,
};

const optimizeButtonStyle = {
  padding: '0.25rem 0.5rem',
  background: `linear-gradient(135deg, ${GOLD} 0%, #d4a030 100%)`,
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  fontSize: '0.6875rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  whiteSpace: 'nowrap' as const,
};

const optimizeButtonDisabledStyle = {
  ...optimizeButtonStyle,
  opacity: 0.6,
  cursor: 'not-allowed',
};

/**
 * Bilingual textarea with AI optimization button.
 * Paste text in one language, click AI button to translate and improve both.
 */
export default function AIBilingualTextarea({
  nameEn,
  nameZh,
  label,
  defaultValueEn = '',
  defaultValueZh = '',
  required = false,
  rows = 4,
  tooltip,
  disabled = false,
}: AIBilingualTextareaProps) {
  const t = useAdminTranslations();
  const [valueEn, setValueEn] = useState(defaultValueEn);
  const [valueZh, setValueZh] = useState(defaultValueZh);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state with props when they change (after save + revalidation)
  useEffect(() => {
    setValueEn(defaultValueEn);
    setValueZh(defaultValueZh);
  }, [defaultValueEn, defaultValueZh]);

  const handleOptimize = useCallback(async () => {
    // Use whichever field has content (prefer EN)
    const sourceText = valueEn.trim() || valueZh.trim();
    if (!sourceText) {
      setError(t.ai.emptyContent);
      return;
    }

    setIsOptimizing(true);
    setError(null);

    try {
      const result = await optimizeShortTextAction(sourceText);
      if (result.success) {
        setValueEn(result.data.textEn);
        setValueZh(result.data.textZh);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsOptimizing(false);
    }
  }, [valueEn, valueZh, t.ai.emptyContent]);

  const hasContent = valueEn.trim() || valueZh.trim();
  const buttonDisabled = isOptimizing || !hasContent || disabled;

  return (
    <fieldset style={{ marginBottom: '1rem', border: 'none', padding: 0, margin: 0 }} aria-busy={isOptimizing}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
        <legend
          style={{
            color: NAVY,
            fontWeight: 600,
            fontSize: '0.8125rem',
          }}
        >
          {label}
        </legend>
        {tooltip && <Tooltip content={tooltip} />}
        {!disabled && (
          <button
            type="button"
            onClick={handleOptimize}
            disabled={buttonDisabled}
            style={buttonDisabled ? optimizeButtonDisabledStyle : optimizeButtonStyle}
            title={t.ai.tooltip}
          >
            {isOptimizing ? t.ai.optimizing : t.ai.optimize}
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          style={{
            background: `${ERROR}15`,
            color: ERROR,
            padding: '0.375rem 0.5rem',
            borderRadius: '4px',
            marginBottom: '0.5rem',
            fontSize: '0.75rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Screen reader loading announcement */}
      {isOptimizing && (
        <div role="status" aria-live="polite" className="sr-only">
          {t.ai.optimizing}
        </div>
      )}

      <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <div>
          <label htmlFor={nameEn} style={{ fontSize: '0.6875rem', color: 'rgba(27,54,93,0.5)', marginBottom: '0.25rem', display: 'block' }}>
            <span role="img" aria-label="English">🇺🇸</span> EN
          </label>
          <textarea
            id={nameEn}
            name={nameEn}
            value={valueEn}
            onChange={(e) => setValueEn(e.target.value)}
            required={required}
            rows={rows}
            style={{ ...textareaStyle, background: SURFACE, opacity: disabled ? 0.6 : 1 }}
            disabled={disabled}
          />
        </div>
        <div>
          <label htmlFor={nameZh} style={{ fontSize: '0.6875rem', color: 'rgba(27,54,93,0.5)', marginBottom: '0.25rem', display: 'block' }}>
            <span role="img" aria-label="Chinese">🇨🇳</span> ZH
          </label>
          <textarea
            id={nameZh}
            name={nameZh}
            value={valueZh}
            onChange={(e) => setValueZh(e.target.value)}
            required={required}
            rows={rows}
            style={{ ...textareaStyle, background: SURFACE, opacity: disabled ? 0.6 : 1 }}
            disabled={disabled}
          />
        </div>
      </div>
    </fieldset>
  );
}
