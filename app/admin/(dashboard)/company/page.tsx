import { db } from '@/lib/db';
import { companyInfo } from '@/lib/db/schema';
import CompanyForm from './CompanyForm';
import { NAVY } from '@/lib/theme';

export default async function CompanyPage() {
  const rows = await db.select().from(companyInfo).limit(1);
  const company = rows[0] ?? null;

  return (
    <div>
      <h1 style={{ color: NAVY, fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        Company Info
      </h1>
      {company ? (
        <CompanyForm company={company} />
      ) : (
        <p style={{ color: NAVY }}>No company info found. Run db:seed first.</p>
      )}
    </div>
  );
}
