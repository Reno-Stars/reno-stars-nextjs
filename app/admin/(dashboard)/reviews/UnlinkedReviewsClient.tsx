'use client';

import ProjectReviewsSection, {
  type AdminProjectReview,
  type ReviewProjectOption,
} from '@/components/admin/ProjectReviewsSection';
import { TEXT_MID } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';

interface UnlinkedReviewsClientProps {
  reviews: AdminProjectReview[];
  projectOptions: ReviewProjectOption[];
}

/**
 * Client shell for /admin/reviews — an intro line plus the shared
 * ProjectReviewsSection with NO pre-selected project (new reviews default to
 * "no linked project"; the select can link them to any project).
 */
export default function UnlinkedReviewsClient({ reviews, projectOptions }: UnlinkedReviewsClientProps) {
  const t = useAdminTranslations();

  return (
    <div style={{ maxWidth: '900px' }}>
      <p style={{ color: TEXT_MID, fontSize: '0.875rem', margin: '0 0 0.5rem' }}>
        {t.projectReviews.unlinkedIntro}
      </p>
      <ProjectReviewsSection defaultProjectId={null} projectOptions={projectOptions} reviews={reviews} />
    </div>
  );
}
