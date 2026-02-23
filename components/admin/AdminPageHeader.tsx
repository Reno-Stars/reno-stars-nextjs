'use client';

import Link from 'next/link';
import { ExternalLink, ChevronLeft } from 'lucide-react';
import { NAVY, GOLD, TEXT_MID } from '@/lib/theme';
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

/** Shared style for action buttons in admin page headers */
export const headerActionStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  color: '#fff',
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: '0.875rem',
};

interface HeaderAction {
  labelKey: string;
  href: string;
  color?: string;
}

interface AdminPageHeaderProps {
  titleKey: string;
  /** Single action button (legacy) */
  actionKey?: string;
  actionHref?: string;
  /** Multiple action buttons */
  actions?: HeaderAction[];
  /** Link to view the item on the public site */
  viewHref?: string;
  /** Back navigation link (href) */
  backHref?: string;
  /** Back navigation label key (resolved via translations) */
  backLabelKey?: string;
}

export default function AdminPageHeader({ titleKey, actionKey, actionHref, actions, viewHref, backHref, backLabelKey }: AdminPageHeaderProps) {
  const t = useAdminTranslations();
  const title = resolve(t as unknown as Record<string, unknown>, titleKey);

  // Build actions list: support both legacy single action and new multi-action prop
  const resolvedActions: { label: string; href: string; color: string }[] = [];
  if (actions) {
    for (const a of actions) {
      resolvedActions.push({
        label: resolve(t as unknown as Record<string, unknown>, a.labelKey),
        href: a.href,
        color: a.color ?? GOLD,
      });
    }
  } else if (actionKey && actionHref) {
    resolvedActions.push({
      label: resolve(t as unknown as Record<string, unknown>, actionKey),
      href: actionHref,
      color: GOLD,
    });
  }

  const backLabel = backLabelKey
    ? t.common.backTo.replace('{page}', resolve(t as unknown as Record<string, unknown>, backLabelKey))
    : undefined;

  return (
    <div className="admin-page-header" style={{ marginBottom: '1.5rem' }}>
      {backHref && backLabel && (
        <Link
          href={backHref}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            color: TEXT_MID,
            textDecoration: 'none',
            fontSize: '0.8125rem',
            marginBottom: '0.5rem',
          }}
        >
          <ChevronLeft size={16} />
          {backLabel}
        </Link>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
      {resolvedActions.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {resolvedActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              style={{ ...headerActionStyle, backgroundColor: action.color }}
            >
              {action.label}
            </Link>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
