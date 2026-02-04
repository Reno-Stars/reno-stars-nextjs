import { getAllContactsAdmin } from '@/lib/db/queries';
import ContactsListClient from './ContactsListClient';
import { NAVY } from '@/lib/theme';

export default async function ContactsAdminPage() {
  const contacts = await getAllContactsAdmin();

  return (
    <div>
      <h1 style={{ color: NAVY, fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        Contact Submissions
      </h1>
      <ContactsListClient contacts={contacts} />
    </div>
  );
}
