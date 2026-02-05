'use client';

import Link from 'next/link';
import { NAVY, GOLD } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';

// Simple dot-path resolver
function resolve(obj: Record<string, unknown>, path: string): string {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current && typeof current === 'object') {
      current = (current as Record<string, unknown>)[part];
    } else {
      return path;
    }
  }
  return typeof current === 'string' ? current : path;
}

interface AdminPageHeaderProps {
  titleKey: string;
  actionKey?: string;
  actionHref?: string;
}

export default function AdminPageHeader({ titleKey, actionKey, actionHref }: AdminPageHeaderProps) {
  const t = useAdminTranslations();
  const title = resolve(t as unknown as Record<string, unknown>, titleKey);
  const actionLabel = actionKey ? resolve(t as unknown as Record<string, unknown>, actionKey) : undefined;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
      <h1 style={{ color: NAVY, fontSize: '1.5rem', fontWeight: 700 }}>{title}</h1>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            backgroundColor: GOLD,
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
