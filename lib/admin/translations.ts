import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import en, { type AdminMessages } from '@/messages/admin/en';
import zh from '@/messages/admin/zh';

const messages: Record<string, AdminMessages> = { en, zh };

export function useAdminTranslations(): AdminMessages {
  const { locale } = useAdminLocale();
  return messages[locale] ?? en;
}

export type { AdminMessages };
