import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { faqs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { isValidUUID } from '@/lib/admin/auth';
import FaqForm from '../FaqForm';
import { updateFaq } from '@/app/actions/admin/faqs';
import { getAllServiceAreasAdmin } from '@/lib/db/queries';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFaqPage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidUUID(id)) notFound();
  const [rows, areas] = await Promise.all([
    db.select().from(faqs).where(eq(faqs.id, id)).limit(1),
    getAllServiceAreasAdmin(),
  ]);
  const faq = rows[0];
  if (!faq) notFound();

  const boundAction = updateFaq.bind(null, id);
  const serviceAreas = areas.map((a) => ({ id: a.id, nameEn: a.nameEn, nameZh: a.nameZh }));

  return (
    <div>
      <AdminPageHeader titleKey="faqs.editFaq" backHref="/admin/faqs" backLabelKey="nav.faqs" />
      <FaqForm
        action={boundAction}
        serviceAreas={serviceAreas}
        initialData={{
          questionEn: faq.questionEn,
          questionZh: faq.questionZh,
          answerEn: faq.answerEn,
          answerZh: faq.answerZh,
          serviceAreaId: faq.serviceAreaId ?? null,
          displayOrder: faq.displayOrder,
          isActive: faq.isActive,
        }}
      />
    </div>
  );
}
