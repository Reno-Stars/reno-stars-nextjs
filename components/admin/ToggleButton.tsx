'use client';

import { GOLD, TEXT_MID } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';

interface ToggleButtonProps {
  isActive: boolean;
  isPending: boolean;
  onClick: () => void;
  ariaLabel: string;
  activeLabel?: string;
  inactiveLabel?: string;
}

export default function ToggleButton({
  isActive,
  isPending,
  onClick,
  ariaLabel,
  activeLabel,
  inactiveLabel,
}: ToggleButtonProps) {
  const t = useAdminTranslations();
  const yesLabel = activeLabel ?? t.common.yes;
  const noLabel = inactiveLabel ?? t.common.no;

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        background: 'none',
        border: 'none',
        cursor: isPending ? 'not-allowed' : 'pointer',
        color: isActive ? GOLD : TEXT_MID,
        fontSize: '0.8125rem',
      }}
    >
      {isActive ? yesLabel : noLabel}
    </button>
  );
}
