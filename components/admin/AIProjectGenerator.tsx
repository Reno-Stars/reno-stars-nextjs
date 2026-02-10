'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { NAVY, GOLD, SURFACE, ERROR, SUCCESS_BG, SUCCESS } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';
import { optimizeProjectDescriptionAction } from '@/app/actions/admin/optimize-content';
import Tooltip from './Tooltip';
import { inputStyle } from './shared-styles';

interface AIProjectGeneratorProps {
  /** Called when AI generates all text fields */
  onGenerate: (data: {
    descriptionEn: string;
    descriptionZh: string;
    challengeEn: string;
    challengeZh: string;
    solutionEn: string;
    solutionZh: string;
    badgeEn: string;
    badgeZh: string;
    metaTitleEn: string;
    metaTitleZh: string;
    metaDescriptionEn: string;
    metaDescriptionZh: string;
    focusKeywordEn: string;
    focusKeywordZh: string;
    seoKeywordsEn: string;
    seoKeywordsZh: string;
  }) => void;
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
  background: `linear-gradient(135deg, ${GOLD} 0%, #d4a030 100%)`,
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
 * AI-powered project text generator.
 * Paste project notes, click generate, and all text fields are populated.
 */
export default function AIProjectGenerator({
  onGenerate,
  disabled = false,
}: AIProjectGeneratorProps) {
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
      const result = await optimizeProjectDescriptionAction(notes);
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
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    } finally {
      if (mountedRef.current) {
        setIsGenerating(false);
      }
    }
  }, [notes, onGenerate, t.ai.emptyContent]);

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
        <Tooltip content={t.ai.projectNotesTooltip} />
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
        placeholder={t.ai.projectNotesPlaceholder}
        style={{ ...textareaStyle, opacity: disabled ? 0.6 : 1 }}
        disabled={disabled}
        aria-label={t.ai.projectNotesPlaceholder}
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
