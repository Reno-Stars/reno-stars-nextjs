'use client';

import { useAdminTranslations } from '@/lib/admin/translations';
import { optimizeProjectDescriptionAction } from '@/app/actions/admin/optimize-content';
import type { ProjectDescription } from '@/lib/ai/content-optimizer';
import AIFieldGenerator from './AIFieldGenerator';

interface AIProjectGeneratorProps {
  /** Called when AI generates all text fields */
  onGenerate: (data: Omit<ProjectDescription, 'detectedLanguage'>) => void;
  /** Whether the generator is disabled */
  disabled?: boolean;
}

/**
 * AI-powered project text generator.
 * Thin wrapper around AIFieldGenerator with project-specific action and translations.
 */
export default function AIProjectGenerator({
  onGenerate,
  disabled,
}: AIProjectGeneratorProps) {
  const t = useAdminTranslations();

  return (
    <AIFieldGenerator
      action={optimizeProjectDescriptionAction}
      onGenerate={onGenerate}
      placeholder={t.ai.projectNotesPlaceholder}
      tooltip={t.ai.projectNotesTooltip}
      disabled={disabled}
    />
  );
}
