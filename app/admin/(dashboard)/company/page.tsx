import { db } from '@/lib/db';
import { companyInfo } from '@/lib/db/schema';
import CompanyForm from './CompanyForm';
import { NAVY } from '@/lib/theme';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default async function CompanyPage() {
  const rows = await db.select().from(companyInfo).limit(1);
  const company = rows[0] ?? null;

  return (
    <div>
      <AdminPageHeader titleKey="company.title" />
      {company ? (
        <CompanyForm company={company} />
      ) : (
        <p style={{ color: NAVY }}>No company info found. Run db:seed first.</p>
      )}
    </div>
  );
}
