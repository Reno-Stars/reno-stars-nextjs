import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { trustBadges } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { isValidUUID } from '@/lib/admin/auth';
import TrustBadgeForm from '../TrustBadgeForm';
import { updateTrustBadge } from '@/app/actions/admin/trust-badges';
import { NAVY } from '@/lib/theme';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTrustBadgePage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidUUID(id)) notFound();
  const rows = await db.select().from(trustBadges).where(eq(trustBadges.id, id)).limit(1);
  const badge = rows[0];
  if (!badge) notFound();

  const boundAction = updateTrustBadge.bind(null, id);

  return (
    <div>
      <h1 style={{ color: NAVY, fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        Edit Trust Badge
      </h1>
      <TrustBadgeForm
        action={boundAction}
        initialData={{
          badgeEn: badge.badgeEn,
          badgeZh: badge.badgeZh,
          displayOrder: badge.displayOrder,
          isActive: badge.isActive,
        }}
      />
    </div>
  );
}
