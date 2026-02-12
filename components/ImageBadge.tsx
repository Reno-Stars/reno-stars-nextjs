import type { useTranslations } from 'next-intl';
import { NAVY, GOLD, TEXT_MUTED } from '@/lib/theme';

/** Before/after badge with optional click tip */
export function BeforeAfterBadge({
  isBefore,
  t,
  compact,
  showClickTip,
  hasPair,
}: {
  isBefore?: boolean;
  t: ReturnType<typeof useTranslations>;
  compact?: boolean;
  /** Show "click to see before/after" tip */
  showClickTip?: boolean;
  /** Whether this image has a paired before/after counterpart */
  hasPair?: boolean;
}) {
  if (isBefore == null) return null;

  const label = isBefore ? t('projects.beforeLabel') : t('projects.afterLabel');
  const variant = isBefore ? 'before' : 'after';

  // Show click tip if requested and there's a counterpart
  const shouldShowTip = showClickTip && hasPair;
  const tipText = isBefore
    ? t('projects.clickToSeeAfter')
    : t('projects.clickToSeeBefore');

  return (
    <div className="absolute top-2 left-2 z-10 flex items-center gap-2">
      <span
        className={`${compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs'} rounded font-semibold text-white`}
        style={{ backgroundColor: variant === 'before' ? NAVY : GOLD }}
      >
        {label}
      </span>
      {shouldShowTip && (
        <span
          className="px-2 py-1 text-xs rounded font-medium"
          style={{
            backgroundColor: 'rgba(255,255,255,0.9)',
            color: TEXT_MUTED,
            backdropFilter: 'blur(4px)',
          }}
        >
          {tipText}
        </span>
      )}
    </div>
  );
}
