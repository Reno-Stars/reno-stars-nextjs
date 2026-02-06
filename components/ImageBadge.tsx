import type { useTranslations } from 'next-intl';
import { NAVY, GOLD } from '@/lib/theme';

interface ImageBadgeProps {
  /** Translated label text (e.g. "Before" / "施工前") */
  label: string;
  /** Visual variant: navy background for before, gold for after */
  variant: 'before' | 'after';
  /** Compact size for small thumbnails */
  compact?: boolean;
}

export default function ImageBadge({ label, variant, compact }: ImageBadgeProps) {
  const sizeClasses = compact
    ? 'top-1 left-1 px-1.5 py-0.5 text-[10px]'
    : 'top-2 left-2 px-2 py-1 text-xs';

  return (
    <span
      className={`absolute ${sizeClasses} rounded font-semibold text-white z-10`}
      style={{ backgroundColor: variant === 'before' ? NAVY : GOLD }}
    >
      {label}
    </span>
  );
}

/** Convenience wrapper that handles the null check + label/variant derivation */
export function BeforeAfterBadge({
  isBefore,
  t,
  compact,
}: {
  isBefore?: boolean;
  t: ReturnType<typeof useTranslations>;
  compact?: boolean;
}) {
  if (isBefore == null) return null;
  return (
    <ImageBadge
      label={isBefore ? t('projects.beforeLabel') : t('projects.afterLabel')}
      variant={isBefore ? 'before' : 'after'}
      compact={compact}
    />
  );
}
