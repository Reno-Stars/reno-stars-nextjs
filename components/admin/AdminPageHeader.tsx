'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
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
  /** Link to view the item on the public site */
  viewHref?: string;
}

export default function AdminPageHeader({ titleKey, actionKey, actionHref, viewHref }: AdminPageHeaderProps) {
  const t = useAdminTranslations();
  const title = resolve(t as unknown as Record<string, unknown>, titleKey);
  const actionLabel = actionKey ? resolve(t as unknown as Record<string, unknown>, actionKey) : undefined;

  return (
    <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <h1 style={{ color: NAVY, fontSize: '1.5rem', fontWeight: 700 }}>{title}</h1>
        {viewHref && (
          <a
            href={viewHref}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              backgroundColor: 'rgba(27,54,93,0.08)',
              color: NAVY,
              textDecoration: 'none',
              fontSize: '0.75rem',
              fontWeight: 500,
            }}
            title={t.common.preview}
          >
            <ExternalLink size={14} />
            {t.common.preview}
          </a>
        )}
      </div>
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
