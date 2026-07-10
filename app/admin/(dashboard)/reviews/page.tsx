import { isNull, desc, asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { projectReviews, projects } from '@/lib/db/schema';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import UnlinkedReviewsClient from './UnlinkedReviewsClient';

/**
 * Admin surface for UNLINKED verified client reviews (project_id IS NULL).
 *
 * Linked reviews are managed under each project's edit form on the site
 * detail page; unlinked ones are invisible there (the per-project filter
 * never matches NULL), so this page is their only management surface. The
 * form's project select can link a review to a project (moving its
 * management to the project's section) or keep it unlinked (shown only on
 * the public /reviews hub).
 */
export default async function AdminUnlinkedReviewsPage() {
  const [reviewRows, projectRows] = await Promise.all([
    db
      .select({
        id: projectReviews.id,
        projectId: projectReviews.projectId,
        source: projectReviews.source,
        authorName: projectReviews.authorName,
        rating: projectReviews.rating,
        body: projectReviews.body,
        bodyLang: projectReviews.bodyLang,
        reviewDate: projectReviews.reviewDate,
        ownerResponse: projectReviews.ownerResponse,
        sourceUrl: projectReviews.sourceUrl,
      })
      .from(projectReviews)
      .where(isNull(projectReviews.projectId))
      .orderBy(desc(projectReviews.reviewDate)),
    db
      .select({ id: projects.id, titleEn: projects.titleEn })
      .from(projects)
      .orderBy(asc(projects.titleEn)),
  ]);

  return (
    <div>
      <AdminPageHeader titleKey="projectReviews.unlinkedTitle" viewHref="/en/reviews" />
      <UnlinkedReviewsClient
        reviews={reviewRows}
        projectOptions={projectRows.map((p: typeof projectRows[number]) => ({ id: p.id, label: p.titleEn }))}
      />
    </div>
  );
}
