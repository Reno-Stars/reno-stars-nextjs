'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { NAVY, GOLD, GOLD_HOVER, SURFACE, ERROR, SUCCESS_BG, SUCCESS } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';
import Tooltip from './Tooltip';
import { inputStyle } from './shared-styles';

interface AIFieldGeneratorProps<T> {
  /** Server action that takes raw notes and returns generated fields */
  action: (notes: string) => Promise<{ success: true; data: T } | { success: false; error: string }>;
  /** Called when AI generates all text fields */
  onGenerate: (data: T) => void;
  /** Placeholder text for the notes textarea */
  placeholder: string;
  /** Tooltip text explaining what the generator does */
  tooltip: string;
  /** Whether the generator is disabled */
  disabled?: boolean;
}

const textareaStyle = {
  ...inputStyle,
  resize: 'vertical' as const,
  minHeight: '100px',
};

const generateButtonStyle = {
  padding: '0.5rem 1rem',
  background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_HOVER} 100%)`,
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  fontSize: '0.8125rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  whiteSpace: 'nowrap' as const,
};

const generateButtonDisabledStyle = {
  ...generateButtonStyle,
  opacity: 0.6,
  cursor: 'not-allowed',
};

/**
 * Generic AI-powered text field generator.
 * Paste notes, click generate, and fields are populated via onGenerate callback.
 * Used by AIProjectGenerator and AISiteGenerator.
 */
export default function AIFieldGenerator<T>({
  action,
  onGenerate,
  placeholder,
  tooltip,
  disabled = false,
}: AIFieldGeneratorProps<T>) {
  const t = useAdminTranslations();
  const [notes, setNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!notes.trim()) {
      setError(t.ai.emptyContent);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(false);

    // Clear any existing timeout
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }

    try {
      const result = await action(notes);
      if (!mountedRef.current) return;

      if (result.success) {
        onGenerate(result.data);
        setSuccess(true);
        // Clear success message after 3 seconds
        successTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            setSuccess(false);
          }
        }, 3000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : t.common.unexpectedError);
      }
    } finally {
      if (mountedRef.current) {
        setIsGenerating(false);
      }
    }
  }, [notes, action, onGenerate, t.ai.emptyContent, t.common.unexpectedError]);

  const buttonDisabled = isGenerating || !notes.trim() || disabled;

  return (
    <div
      style={{
        backgroundColor: SURFACE,
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1rem',
        border: `1px solid rgba(27,54,93,0.1)`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <span style={{ color: NAVY, fontWeight: 600, fontSize: '0.8125rem' }}>
          {t.ai.generateAll}
        </span>
        <Tooltip content={tooltip} />
      </div>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          style={{
            background: `${ERROR}15`,
            color: ERROR,
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            marginBottom: '0.75rem',
            fontSize: '0.75rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Success message */}
      {success && (
        <div
          role="status"
          style={{
            background: SUCCESS_BG,
            color: SUCCESS,
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            marginBottom: '0.75rem',
            fontSize: '0.75rem',
          }}
        >
          {t.ai.fieldsGenerated}
        </div>
      )}

      {/* Screen reader loading announcement */}
      {isGenerating && (
        <div role="status" aria-live="polite" className="sr-only">
          {t.ai.generatingAll}
        </div>
      )}

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={placeholder}
        style={{ ...textareaStyle, opacity: disabled ? 0.6 : 1 }}
        disabled={disabled}
        aria-label={placeholder}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={buttonDisabled}
          style={buttonDisabled ? generateButtonDisabledStyle : generateButtonStyle}
        >
          {isGenerating ? t.ai.generatingAll : t.ai.generateAll}
        </button>
      </div>
    </div>
  );
}
