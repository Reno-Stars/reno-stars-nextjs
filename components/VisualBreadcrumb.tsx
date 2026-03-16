import { Link } from '@/navigation';
import { ChevronRight } from 'lucide-react';
import { SURFACE_ALT, TEXT, TEXT_MID, TEXT_MUTED } from '@/lib/theme';

interface BreadcrumbItem {
  href?: string;
  label: string;
  className?: string;
}

interface VisualBreadcrumbProps {
  items: BreadcrumbItem[];
  variant?: 'dark' | 'light';
  className?: string;
  containerClassName?: string;
}

export default function VisualBreadcrumb({
  items,
  variant = 'dark',
  className,
  containerClassName,
}: VisualBreadcrumbProps) {
  const isDark = variant === 'dark';

  return (
    <nav
      aria-label="Breadcrumb"
      className={isDark ? className : `py-4 px-4 sm:px-6 lg:px-8 ${className || ''}`.trim()}
      style={isDark ? undefined : { backgroundColor: SURFACE_ALT }}
    >
      <ol
        className={`flex items-center gap-2 text-sm list-none m-0 p-0 ${isDark ? 'mb-4' : ''} ${containerClassName || (isDark ? '' : 'max-w-7xl mx-auto')}`.trim()}
      >
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li
              key={item.label}
              className={`flex items-center gap-2 ${isLast && isDark ? 'text-white' : ''} ${item.className || ''}`.trim()}
              {...(isLast ? { 'aria-current': 'page' as const } : {})}
              style={isLast && !isDark ? { color: TEXT } : undefined}
            >
              {i > 0 && (
                <ChevronRight
                  aria-hidden="true"
                  className={`w-4 h-4 ${isDark ? 'text-white/40' : ''}`}
                  style={isDark ? undefined : { color: TEXT_MUTED }}
                />
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={isDark ? 'text-white/60 hover:text-white transition-colors' : 'hover:underline'}
                  style={isDark ? undefined : { color: TEXT_MID }}
                >
                  {item.label}
                </Link>
              ) : (
                item.label
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
