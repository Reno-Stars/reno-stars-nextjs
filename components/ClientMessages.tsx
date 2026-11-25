import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { pickMessages } from '@/i18n/pickMessages';
import { SHELL_NAMESPACES } from '@/i18n/clientNamespaces';
import { stripClientPrices } from '@/lib/seo/client-price-messages';

interface ClientMessagesProps {
  /**
   * Namespaces this route's CLIENT subtree reads, dotted paths allowed
   * (`guides.kitchenCost`). Server components do not belong here — they read
   * through `getTranslations`, which never touches the client payload.
   */
  ns: readonly string[];
  /**
   * DI-15: serialize the messages exactly as on main (no price strip). Only
   * the service×city route passes it, for the 14 test-A pages. Blog and guides
   * routes keep their prices automatically (see `servesKeepContent`), so
   * their page files — and their sitemap lastmods — are untouched.
   */
  keepPrices?: boolean;
  children: React.ReactNode;
}

/**
 * Scope the client message payload to one route.
 *
 * Before this existed, `app/[locale]/layout.tsx` handed the whole merged
 * catalog (~296 KB/locale after its server-only blocklist) to
 * `NextIntlClientProvider`, so every page serialized `guides` (177.6 KB) and
 * `siteVisit` (31.9 KB) into its RSC payload whether or not it rendered them.
 * That was ~33% of the homepage's 823 KB of HTML.
 *
 * next-intl treats a nested provider's `messages` as ATOMIC — an inner
 * provider replaces the ancestor's messages rather than merging with them.
 * So SHELL_NAMESPACES is re-included here: without it, wrapping a page would
 * silently drop the shell strings from that subtree.
 */
function clientMessages(picked: Record<string, unknown>, keepPrices: boolean): Record<string, unknown> {
  return keepPrices ? picked : stripClientPrices(picked);
}

/**
 * DI-15 KEEP surfaces (blog index + posts, /guides/ index + cost guides) are
 * the only routes that serialize the `blog` / `guides.*` namespaces, so a
 * route asking for either keeps its prices. Every other route is stripped.
 */
export function servesKeepContent(ns: readonly string[]): boolean {
  return ns.some((n) => n === 'blog' || n === 'guides' || n.startsWith('guides.'));
}

export default async function ClientMessages({ ns, keepPrices = false, children }: ClientMessagesProps) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider
      messages={clientMessages(pickMessages(messages as Record<string, unknown>, [
        ...SHELL_NAMESPACES,
        ...ns,
      ]), keepPrices || servesKeepContent(ns))}
    >
      {children}
    </NextIntlClientProvider>
  );
}
