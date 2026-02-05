import Link from 'next/link';
import { getAllFaqsAdmin } from '@/lib/db/queries';
import FaqsListClient from './FaqsListClient';
import { NAVY, GOLD } from '@/lib/theme';

export default async function FaqsAdminPage() {
  const faqs = await getAllFaqsAdmin();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ color: NAVY, fontSize: '1.5rem', fontWeight: 700 }}>FAQs</h1>
        <Link
          href="/admin/faqs/new"
          style={{
            backgroundColor: GOLD,
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          Add FAQ
        </Link>
      </div>
      <FaqsListClient faqs={faqs} />
    </div>
  );
}
