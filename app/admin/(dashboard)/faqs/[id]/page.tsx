import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { faqs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { isValidUUID } from '@/lib/admin/auth';
import FaqForm from '../FaqForm';
import { updateFaq } from '@/app/actions/admin/faqs';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFaqPage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidUUID(id)) notFound();
  const rows = await db.select().from(faqs).where(eq(faqs.id, id)).limit(1);
  const faq = rows[0];
  if (!faq) notFound();

  const boundAction = updateFaq.bind(null, id);

  return (
    <div>
      <AdminPageHeader titleKey="faqs.editFaq" backHref="/admin/faqs" backLabelKey="nav.faqs" />
      <FaqForm
        action={boundAction}
        initialData={{
          questionEn: faq.questionEn,
          questionZh: faq.questionZh,
          answerEn: faq.answerEn,
          answerZh: faq.answerZh,
          displayOrder: faq.displayOrder,
          isActive: faq.isActive,
        }}
      />
    </div>
  );
}
