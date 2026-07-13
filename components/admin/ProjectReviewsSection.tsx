'use client';

import { useEffect, useState, useTransition, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { createProjectReview, updateProjectReview, deleteProjectReview } from '@/app/actions/admin/project-reviews';
import ConfirmDialog from './ConfirmDialog';
import FormField from './FormField';
import SubmitButton from './SubmitButton';
import Tooltip from './Tooltip';
import { useFormToast } from './useFormToast';
import { useToast } from './ToastProvider';
import { inputStyle, textareaStyle, selectStyle } from './shared-styles';
import { CARD, NAVY, GOLD, TEXT_MID, SURFACE, ERROR, neu } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import { REVIEW_SOURCES, REVIEW_BODY_LANGS } from '@/lib/project-reviews';
import { localeNames, type Locale } from '@/i18n/config';

/** Serializable project_reviews row passed from the admin server page. */
export interface AdminProjectReview {
  id: string;
  /** Linked project — null for unlinked reviews (shown only on /reviews). */
  projectId: string | null;
  source: string;
  authorName: string;
  rating: number;
  body: string;
  bodyLang: string;
  /** ISO 'YYYY-MM-DD' (month precision — day normalized to 01). */
  reviewDate: string;
  ownerResponse: string | null;
  sourceUrl: string | null;
}

/** Option for the review form's optional project link select. */
export interface ReviewProjectOption {
  id: string;
  label: string;
}

interface ProjectReviewsSectionProps {
  /** Pre-selected project for NEW reviews (null on the unlinked-reviews page). */
  defaultProjectId: string | null;
  /** Projects offered by the "linked project" select. */
  projectOptions: ReviewProjectOption[];
  reviews: AdminProjectReview[];
}

const BODY_PREVIEW_LENGTH = 140;

// messages/admin/*.ts is owned by another theme; the NEW review-source field
// uses this inline en/zh label (the admin UI is bilingual) rather than adding a
// key there. Human-readable platform names for the <option>s.
const SOURCE_FIELD_LABEL: Record<string, string> = { en: 'Review Source', zh: '评价来源' };
const SOURCE_FIELD_TOOLTIP: Record<string, string> = {
  en: 'Platform the review was posted on. Google shows Google branding on the card; other platforms show a neutral "Verified Review" mark.',
  zh: '评价发布的平台。Google 会在卡片上显示 Google 标识；其他平台显示中性的“认证评价”标记。',
};
// Brand platforms are proper nouns — never translated. Keyed by review source.
const SOURCE_OPTION_LABELS: Record<string, string> = {
  google: 'Google',
  yelp: 'Yelp',
  houzz: 'Houzz',
  facebook: 'Facebook',
  homestars: 'HomeStars',
};
// 'other' is a generic word (not a brand), so it localizes with the admin UI
// locale — otherwise a zh admin session shows "Other" in English among the
// Chinese field labels.
const OTHER_OPTION_LABEL: Record<string, string> = { en: 'Other', zh: '其他' };

function ratingStars(rating: number): string {
  const filled = Math.min(5, Math.max(0, rating));
  return '★'.repeat(filled) + '☆'.repeat(5 - filled);
}

interface ReviewMetaFieldsProps {
  initialData?: AdminProjectReview;
}

/**
 * Rating / date / language / source selects for the review form — extracted so
 * ReviewForm stays under the 50-line rule (#34) and so the widened language set
 * (#10) and new source select (#29) live in one place.
 */
function ReviewMetaFields({ initialData }: ReviewMetaFieldsProps) {
  const t = useAdminTranslations();
  const { locale } = useAdminLocale();
  const sourceLabel = SOURCE_FIELD_LABEL[locale] ?? SOURCE_FIELD_LABEL.en;
  const sourceTooltip = SOURCE_FIELD_TOOLTIP[locale] ?? SOURCE_FIELD_TOOLTIP.en;

  return (
    <>
      <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 1rem' }}>
        <FormField label={t.projectReviews.rating} htmlFor="reviewRating" tooltip={t.projectReviews.tooltips.rating}>
          <select id="reviewRating" name="rating" defaultValue={String(initialData?.rating ?? 5)} style={selectStyle}>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>{ratingStars(r)} ({r})</option>
            ))}
          </select>
        </FormField>
        <FormField label={t.projectReviews.reviewDate} htmlFor="reviewDate" tooltip={t.projectReviews.tooltips.reviewDate}>
          <input id="reviewDate" name="reviewDate" type="month" defaultValue={initialData?.reviewDate.slice(0, 7) ?? ''} required style={inputStyle} />
        </FormField>
        <FormField label={t.projectReviews.bodyLang} htmlFor="reviewBodyLang" tooltip={t.projectReviews.tooltips.bodyLang}>
          <select id="reviewBodyLang" name="bodyLang" defaultValue={initialData?.bodyLang ?? 'en'} style={selectStyle}>
            {REVIEW_BODY_LANGS.map((lang) => (
              <option key={lang} value={lang}>{localeNames[lang as Locale] ?? lang}</option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField label={sourceLabel} htmlFor="reviewSource" tooltip={sourceTooltip}>
        <select id="reviewSource" name="source" defaultValue={initialData?.source ?? 'google'} style={selectStyle}>
          {REVIEW_SOURCES.map((src) => (
            <option key={src} value={src}>
              {src === 'other'
                ? OTHER_OPTION_LABEL[locale] ?? OTHER_OPTION_LABEL.en
                : SOURCE_OPTION_LABELS[src] ?? src}
            </option>
          ))}
        </select>
      </FormField>
    </>
  );
}

interface ReviewFormProps {
  action: (
    prevState: { success?: boolean; error?: string },
    formData: FormData
  ) => Promise<{ success?: boolean; error?: string }>;
  initialData?: AdminProjectReview;
  /** Project pre-selected in the linked-project select for NEW reviews. */
  defaultProjectId: string | null;
  projectOptions: ReviewProjectOption[];
  onSaved: () => void;
  onCancel: () => void;
}

function ReviewForm({ action, initialData, defaultProjectId, projectOptions, onSaved, onCancel }: ReviewFormProps) {
  const t = useAdminTranslations();
  const [state, formAction, isPending] = useActionState(action, {});
  useFormToast(state, t.projectReviews.saved);

  useEffect(() => {
    if (state.success) onSaved();
  }, [state, onSaved]);

  return (
    <form action={formAction} style={{ backgroundColor: SURFACE, borderRadius: '8px', padding: '1rem', marginBottom: '0.5rem' }}>
      <FormField label={t.projectReviews.authorName} htmlFor="reviewAuthorName" tooltip={t.projectReviews.tooltips.authorName}>
        <input id="reviewAuthorName" name="authorName" defaultValue={initialData?.authorName ?? ''} required maxLength={120} style={inputStyle} placeholder="Lisa Jung" />
      </FormField>

      <FormField label={t.projectReviews.project} htmlFor="reviewProjectId" tooltip={t.projectReviews.tooltips.project}>
        <select
          id="reviewProjectId"
          name="projectId"
          defaultValue={initialData ? (initialData.projectId ?? '') : (defaultProjectId ?? '')}
          style={selectStyle}
        >
          <option value="">{t.projectReviews.noProject}</option>
          {projectOptions.map((option) => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
      </FormField>

      <ReviewMetaFields initialData={initialData} />

      <FormField label={t.projectReviews.body} htmlFor="reviewBody" tooltip={t.projectReviews.tooltips.body}>
        <textarea id="reviewBody" name="body" defaultValue={initialData?.body ?? ''} required rows={5} style={textareaStyle} />
      </FormField>

      <FormField label={t.projectReviews.sourceUrl} htmlFor="reviewSourceUrl" tooltip={t.projectReviews.tooltips.sourceUrl}>
        <input id="reviewSourceUrl" name="sourceUrl" type="url" defaultValue={initialData?.sourceUrl ?? ''} maxLength={500} style={inputStyle} placeholder="https://maps.google.com/..." />
      </FormField>

      <FormField label={t.projectReviews.ownerResponse} htmlFor="reviewOwnerResponse" tooltip={t.projectReviews.tooltips.ownerResponse}>
        <textarea id="reviewOwnerResponse" name="ownerResponse" defaultValue={initialData?.ownerResponse ?? ''} rows={3} style={textareaStyle} />
      </FormField>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <SubmitButton isPending={isPending} />
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          style={{ padding: '0.625rem 1.5rem', borderRadius: '8px', border: `1.5px solid ${NAVY}`, backgroundColor: 'transparent', color: NAVY, fontWeight: 600, fontSize: '0.875rem', cursor: isPending ? 'not-allowed' : 'pointer' }}
        >
          {t.common.cancel}
        </button>
      </div>
    </form>
  );
}

interface ReviewRowProps {
  review: AdminProjectReview;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * Read-only display of one saved review (author, rating, date, source link,
 * body/owner-response previews, edit/delete). Extracted from the section's map
 * body so ProjectReviewsSection stays under the 50-line rule (#34).
 */
function ReviewRow({ review, onEdit, onDelete }: ReviewRowProps) {
  const t = useAdminTranslations();
  return (
    <div style={{ backgroundColor: SURFACE, borderRadius: '8px', padding: '0.75rem', marginBottom: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
        <span style={{ color: NAVY, fontWeight: 600, fontSize: '0.875rem' }}>{review.authorName}</span>
        <span aria-label={`${review.rating}/5`} style={{ color: GOLD, fontSize: '0.8125rem', letterSpacing: '1px' }}>{ratingStars(review.rating)}</span>
        <span style={{ color: TEXT_MID, fontSize: '0.75rem' }}>{review.reviewDate.slice(0, 7)}</span>
        <span style={{ color: TEXT_MID, fontSize: '0.75rem', textTransform: 'capitalize' }}>
          {review.sourceUrl ? (
            <a href={review.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: TEXT_MID, textDecoration: 'underline' }}>
              {review.source}
            </a>
          ) : (
            review.source
          )}
        </span>
      </div>
      <p style={{ color: NAVY, fontSize: '0.8125rem', margin: '0 0 0.375rem', whiteSpace: 'pre-line' }}>
        {review.body.length > BODY_PREVIEW_LENGTH ? `${review.body.slice(0, BODY_PREVIEW_LENGTH)}…` : review.body}
      </p>
      {review.ownerResponse && (
        <p style={{ color: TEXT_MID, fontSize: '0.75rem', margin: '0 0 0.375rem' }}>
          {t.projectReviews.ownerResponse}: {review.ownerResponse.length > BODY_PREVIEW_LENGTH ? `${review.ownerResponse.slice(0, BODY_PREVIEW_LENGTH)}…` : review.ownerResponse}
        </p>
      )}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={onEdit}
          style={{ color: NAVY, background: 'none', border: `1px solid ${NAVY}`, borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
        >
          {t.common.edit}
        </button>
        <button
          type="button"
          onClick={onDelete}
          style={{ color: ERROR, background: 'none', border: `1px solid ${ERROR}`, borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
        >
          {t.common.delete}
        </button>
      </div>
    </div>
  );
}

interface DeleteReviewDialogProps {
  open: boolean;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Delete-confirmation dialog for a review — the review-specific labels around
 *  the shared ConfirmDialog, extracted so the section stays small (#34). */
function DeleteReviewDialog({ open, loading, onConfirm, onCancel }: DeleteReviewDialogProps) {
  const t = useAdminTranslations();
  return (
    <ConfirmDialog
      open={open}
      title={t.projectReviews.deleteReview}
      message={t.projectReviews.deleteMessage}
      onConfirm={onConfirm}
      onCancel={onCancel}
      loading={loading}
    />
  );
}

interface ReviewListProps {
  reviews: AdminProjectReview[];
  editingId: string | 'new' | null;
  defaultProjectId: string | null;
  projectOptions: ReviewProjectOption[];
  onEdit: (id: string | 'new' | null) => void;
  onSaved: () => void;
  onDelete: (id: string) => void;
}

/** The review rows / inline edit forms plus the "add review" affordance —
 *  extracted so ProjectReviewsSection's own body stays under 50 lines (#34). */
function ReviewList({ reviews, editingId, defaultProjectId, projectOptions, onEdit, onSaved, onDelete }: ReviewListProps) {
  const t = useAdminTranslations();
  return (
    <>
      {reviews.length === 0 && editingId !== 'new' && (
        <p style={{ color: TEXT_MID, fontSize: '0.8125rem', margin: '0 0 0.75rem' }}>
          {t.projectReviews.noReviews}
        </p>
      )}

      {reviews.map((review) =>
        editingId === review.id ? (
          <ReviewForm
            key={review.id}
            action={updateProjectReview.bind(null, review.id)}
            initialData={review}
            defaultProjectId={defaultProjectId}
            projectOptions={projectOptions}
            onSaved={onSaved}
            onCancel={() => onEdit(null)}
          />
        ) : (
          <ReviewRow
            key={review.id}
            review={review}
            onEdit={() => onEdit(review.id)}
            onDelete={() => onDelete(review.id)}
          />
        )
      )}

      {editingId === 'new' ? (
        <ReviewForm
          action={createProjectReview}
          defaultProjectId={defaultProjectId}
          projectOptions={projectOptions}
          onSaved={onSaved}
          onCancel={() => onEdit(null)}
        />
      ) : (
        <button
          type="button"
          onClick={() => onEdit('new')}
          style={{ color: GOLD, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, padding: 0 }}
        >
          {t.projectReviews.addReview}
        </button>
      )}
    </>
  );
}

/**
 * "Verified Reviews" admin section — manages project-linked verified client
 * reviews (project_reviews). Rendered as a standalone card BELOW the project
 * edit form (it owns its own <form> elements, so it cannot nest inside
 * ProjectForm's form). Every mutation revalidates the project's public pages
 * via the server actions; the router.refresh() re-reads the list.
 */
export default function ProjectReviewsSection({ defaultProjectId, projectOptions, reviews }: ProjectReviewsSectionProps) {
  const t = useAdminTranslations();
  const router = useRouter();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeletePending, startDeleteTransition] = useTransition();

  // Close any open form when switching projects.
  useEffect(() => {
    setEditingId(null);
    setDeleteId(null);
  }, [defaultProjectId]);

  const handleSaved = () => {
    setEditingId(null);
    router.refresh();
  };

  const handleDelete = () => {
    if (!deleteId) return;
    startDeleteTransition(async () => {
      const result = await deleteProjectReview(deleteId);
      if (result.error) {
        toast(result.error, 'error');
      } else {
        toast(t.projectReviews.deleted, 'success');
        router.refresh();
      }
      setDeleteId(null);
    });
  };

  return (
    <div
      className="admin-form-card"
      style={{ backgroundColor: CARD, borderRadius: '12px', padding: '1.5rem', boxShadow: neu(6), maxWidth: '900px', marginTop: '1.5rem' }}
    >
      <DeleteReviewDialog
        open={deleteId !== null}
        loading={isDeletePending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem' }}>
        <span style={{ color: NAVY, fontWeight: 600, fontSize: '0.8125rem' }}>
          {t.projectReviews.title}
        </span>
        <Tooltip content={t.projectReviews.tooltip} />
      </div>

      <ReviewList
        reviews={reviews}
        editingId={editingId}
        defaultProjectId={defaultProjectId}
        projectOptions={projectOptions}
        onEdit={setEditingId}
        onSaved={handleSaved}
        onDelete={setDeleteId}
      />
    </div>
  );
}
