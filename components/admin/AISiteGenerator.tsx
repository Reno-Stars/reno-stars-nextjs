'use client';

import { useAdminTranslations } from '@/lib/admin/translations';
import { optimizeSiteDescriptionAction } from '@/app/actions/admin/optimize-content';
import type { SiteDescription } from '@/lib/ai/content-optimizer';
import AIFieldGenerator from './AIFieldGenerator';

interface AISiteGeneratorProps {
  /** Called when AI generates all text fields */
  onGenerate: (data: Omit<SiteDescription, 'detectedLanguage'>) => void;
  /** Whether the generator is disabled */
  disabled?: boolean;
}

/**
 * AI-powered site text generator.
 * Thin wrapper around AIFieldGenerator with site-specific action and translations.
 */
export default function AISiteGenerator({
  onGenerate,
  disabled,
}: AISiteGeneratorProps) {
  const t = useAdminTranslations();

  return (
    <AIFieldGenerator
      action={optimizeSiteDescriptionAction}
      onGenerate={onGenerate}
      placeholder={t.ai.siteNotesPlaceholder}
      tooltip={t.ai.siteNotesTooltip}
      disabled={disabled}
    />
  );
}
