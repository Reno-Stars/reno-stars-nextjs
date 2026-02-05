import { getAllContactsAdmin } from '@/lib/db/queries';
import ContactsListClient from './ContactsListClient';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default async function ContactsAdminPage() {
  const contacts = await getAllContactsAdmin();

  return (
    <div>
      <AdminPageHeader titleKey="contacts.title" />
      <ContactsListClient contacts={contacts} />
    </div>
  );
}
