'use client';

import { GOLD, GOLD_HOVER } from '@/lib/theme';

interface SubmitButtonProps {
  isPending: boolean;
  label?: string;
  pendingLabel?: string;
}

export default function SubmitButton({
  isPending,
  label = 'Save',
  pendingLabel = 'Saving...',
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isPending}
      style={{
        padding: '0.625rem 1.5rem',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: isPending ? GOLD_HOVER : GOLD,
        color: '#fff',
        fontWeight: 600,
        fontSize: '0.875rem',
        cursor: isPending ? 'not-allowed' : 'pointer',
        opacity: isPending ? 0.7 : 1,
      }}
    >
      {isPending ? pendingLabel : label}
    </button>
  );
}
