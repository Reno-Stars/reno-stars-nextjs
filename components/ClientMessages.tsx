import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { pickMessages } from '@/i18n/pickMessages';
import { SHELL_NAMESPACES } from '@/i18n/clientNamespaces';

interface ClientMessagesProps {
  /**
   * Namespaces this route's CLIENT subtree reads, dotted paths allowed
   * (`guides.kitchenCost`). Server components do not belong here — they read
   * through `getTranslations`, which never touches the client payload.
   */
  ns: readonly string[];
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
export default async function ClientMessages({ ns, children }: ClientMessagesProps) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider
      messages={pickMessages(messages as Record<string, unknown>, [
        ...SHELL_NAMESPACES,
        ...ns,
      ])}
    >
      {children}
    </NextIntlClientProvider>
  );
}
