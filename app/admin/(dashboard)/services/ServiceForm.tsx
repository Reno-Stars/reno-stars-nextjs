'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import BilingualInput from '@/components/admin/BilingualInput';
import BilingualTextarea from '@/components/admin/BilingualTextarea';
import FormField from '@/components/admin/FormField';
import ImageUrlInput from '@/components/admin/ImageUrlInput';
import EditModeToggle from '@/components/admin/EditModeToggle';
import FormAlerts from '@/components/admin/FormAlerts';
import SubmitButton from '@/components/admin/SubmitButton';
import { useFormToast } from '@/components/admin/useFormToast';
import { inputStyle, readOnlyStyle } from '@/components/admin/shared-styles';
import { CARD, NAVY, neu } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';

interface TagEntry {
  id: string;
  en: string;
  zh: string;
}

interface BenefitEntry {
  id: string;
  en: string;
  zh: string;
}

interface ServiceFormProps {
  action: (
    prevState: { success?: boolean; error?: string },
    formData: FormData
  ) => Promise<{ success?: boolean; error?: string }>;
  initialData?: {
    slug: string;
    titleEn: string;
    titleZh: string;
    descriptionEn: string;
    descriptionZh: string;
    longDescriptionEn: string | null;
    longDescriptionZh: string | null;
    iconUrl: string | null;
    imageUrl: string | null;
    displayOrder: number;
    tags?: { id: string; en: string; zh: string }[];
    benefits?: { id: string; en: string; zh: string }[];
  };
  isNew?: boolean;
}

const COLLAPSE_THRESHOLD = 3;

export default function ServiceForm({ action, initialData, isNew = false }: ServiceFormProps) {
  const t = useAdminTranslations();
  const [editing, setEditing] = useState(isNew);
  const [state, formAction, isPending] = useActionState(action, {});
  useFormToast(state, t.services.saved);

  const [tags, setTags] = useState<TagEntry[]>(
    initialData?.tags?.map((tag) => ({ ...tag })) ?? []
  );
  const [showAllTags, setShowAllTags] = useState(false);

  const [benefits, setBenefits] = useState<BenefitEntry[]>(
    initialData?.benefits?.map((b) => ({ ...b })) ?? []
  );
  const [showAllBenefits, setShowAllBenefits] = useState(false);

  const fieldStyle = editing ? inputStyle : readOnlyStyle;

  const defaults = initialData ?? {
    slug: '',
    titleEn: '',
    titleZh: '',
    descriptionEn: '',
    descriptionZh: '',
    longDescriptionEn: '',
    longDescriptionZh: '',
    iconUrl: '',
    imageUrl: '',
    displayOrder: 0,
  };

  const addTag = () => {
    setTags((prev) => [...prev, { id: crypto.randomUUID(), en: '', zh: '' }]);
  };

  const removeTag = (id: string) => {
    setTags((prev) => prev.filter((tag) => tag.id !== id));
  };

  const updateTag = (id: string, field: 'en' | 'zh', value: string) => {
    setTags((prev) => prev.map((tag) => (tag.id === id ? { ...tag, [field]: value } : tag)));
  };

  const visibleTags = showAllTags || tags.length <= COLLAPSE_THRESHOLD
    ? tags
    : tags.slice(0, COLLAPSE_THRESHOLD);

  const addBenefit = () => {
    setBenefits((prev) => [...prev, { id: crypto.randomUUID(), en: '', zh: '' }]);
  };

  const removeBenefit = (id: string) => {
    setBenefits((prev) => prev.filter((b) => b.id !== id));
  };

  const updateBenefit = (id: string, field: 'en' | 'zh', value: string) => {
    setBenefits((prev) => prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  };

  const visibleBenefits = showAllBenefits || benefits.length <= COLLAPSE_THRESHOLD
    ? benefits
    : benefits.slice(0, COLLAPSE_THRESHOLD);

  return (
    <form action={formAction}>
      <div
        className="admin-form-card"
        style={{
          backgroundColor: CARD,
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: neu(6),
          maxWidth: '800px',
        }}
      >
        {!isNew && <EditModeToggle editing={editing} setEditing={setEditing} />}
        <FormAlerts state={state} />

        <fieldset disabled={!editing} style={{ border: 'none', padding: 0, margin: 0 }}>
          <FormField label={t.services.slug} htmlFor="slug">
            <input id="slug" name="slug" defaultValue={defaults.slug} required style={fieldStyle} placeholder={t.services.slugPlaceholder} />
          </FormField>

          <BilingualInput nameEn="titleEn" nameZh="titleZh" label={t.services.nameLabel} defaultValueEn={defaults.titleEn} defaultValueZh={defaults.titleZh} required />
          <BilingualTextarea nameEn="descriptionEn" nameZh="descriptionZh" label={t.services.shortDescription} defaultValueEn={defaults.descriptionEn} defaultValueZh={defaults.descriptionZh} required rows={3} />
          <BilingualTextarea nameEn="longDescriptionEn" nameZh="longDescriptionZh" label={t.services.longDescription} defaultValueEn={defaults.longDescriptionEn ?? ''} defaultValueZh={defaults.longDescriptionZh ?? ''} rows={5} />

          <ImageUrlInput name="iconUrl" label={t.services.iconImage} defaultValue={defaults.iconUrl ?? ''} slug={defaults.slug || undefined} imageRole="icon" disabled={!editing} />

          <ImageUrlInput name="imageUrl" label={t.services.heroImage} defaultValue={defaults.imageUrl ?? ''} disabled={!editing} />

          <FormField label={t.services.displayOrder} htmlFor="displayOrder">
            <input id="displayOrder" name="displayOrder" type="number" min={0} defaultValue={defaults.displayOrder} required style={fieldStyle} />
          </FormField>

          {/* Service Tags */}
          <FormField label={t.services.tags}>
            <div className="space-y-2">
              {visibleTags.map((tag, idx) => (
                <div key={tag.id} className="flex items-center gap-2">
                  <input
                    name={`tags[${idx}].en`}
                    type="hidden"
                    value={tag.en}
                  />
                  <input
                    name={`tags[${idx}].zh`}
                    type="hidden"
                    value={tag.zh}
                  />
                  <input
                    type="text"
                    value={tag.en}
                    onChange={(e) => updateTag(tag.id, 'en', e.target.value)}
                    placeholder={t.services.tagPlaceholderEn}
                    aria-label={t.services.tagPlaceholderEn}
                    style={fieldStyle}
                    className="flex-1"
                  />
                  <input
                    type="text"
                    value={tag.zh}
                    onChange={(e) => updateTag(tag.id, 'zh', e.target.value)}
                    placeholder={t.services.tagPlaceholderZh}
                    aria-label={t.services.tagPlaceholderZh}
                    style={fieldStyle}
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeTag(tag.id)}
                    className="shrink-0 text-red-500 hover:text-red-700 p-1"
                    aria-label={t.common.remove}
                  >
                    ✕
                  </button>
                </div>
              ))}
              {/* Render hidden inputs for collapsed tags so they are submitted */}
              {!showAllTags && tags.length > COLLAPSE_THRESHOLD &&
                tags.slice(COLLAPSE_THRESHOLD).map((tag, i) => (
                  <span key={tag.id}>
                    <input type="hidden" name={`tags[${COLLAPSE_THRESHOLD + i}].en`} value={tag.en} />
                    <input type="hidden" name={`tags[${COLLAPSE_THRESHOLD + i}].zh`} value={tag.zh} />
                  </span>
                ))
              }
              {tags.length > COLLAPSE_THRESHOLD && (
                <button
                  type="button"
                  onClick={() => setShowAllTags(!showAllTags)}
                  className="text-sm font-medium"
                  style={{ color: NAVY }}
                >
                  {showAllTags
                    ? t.common.showLess
                    : t.common.showAll.replace('{count}', String(tags.length))
                  }
                </button>
              )}
              <button
                type="button"
                onClick={addTag}
                className="text-sm font-medium"
                style={{ color: NAVY }}
              >
                {t.services.addTag}
              </button>
            </div>
          </FormField>

          {/* Benefits (Why Us) */}
          <FormField label={t.services.benefits}>
            <div className="space-y-2">
              {visibleBenefits.map((b, idx) => (
                <div key={b.id} className="flex items-center gap-2">
                  <input
                    name={`benefits[${idx}].en`}
                    type="hidden"
                    value={b.en}
                  />
                  <input
                    name={`benefits[${idx}].zh`}
                    type="hidden"
                    value={b.zh}
                  />
                  <input
                    type="text"
                    value={b.en}
                    onChange={(e) => updateBenefit(b.id, 'en', e.target.value)}
                    placeholder={t.services.benefitPlaceholderEn}
                    aria-label={t.services.benefitPlaceholderEn}
                    style={fieldStyle}
                    className="flex-1"
                  />
                  <input
                    type="text"
                    value={b.zh}
                    onChange={(e) => updateBenefit(b.id, 'zh', e.target.value)}
                    placeholder={t.services.benefitPlaceholderZh}
                    aria-label={t.services.benefitPlaceholderZh}
                    style={fieldStyle}
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeBenefit(b.id)}
                    className="shrink-0 text-red-500 hover:text-red-700 p-1"
                    aria-label={t.common.remove}
                  >
                    ✕
                  </button>
                </div>
              ))}
              {/* Render hidden inputs for collapsed benefits so they are submitted */}
              {!showAllBenefits && benefits.length > COLLAPSE_THRESHOLD &&
                benefits.slice(COLLAPSE_THRESHOLD).map((b, i) => (
                  <span key={b.id}>
                    <input type="hidden" name={`benefits[${COLLAPSE_THRESHOLD + i}].en`} value={b.en} />
                    <input type="hidden" name={`benefits[${COLLAPSE_THRESHOLD + i}].zh`} value={b.zh} />
                  </span>
                ))
              }
              {benefits.length > COLLAPSE_THRESHOLD && (
                <button
                  type="button"
                  onClick={() => setShowAllBenefits(!showAllBenefits)}
                  className="text-sm font-medium"
                  style={{ color: NAVY }}
                >
                  {showAllBenefits
                    ? t.common.showLess
                    : t.common.showAll.replace('{count}', String(benefits.length))
                  }
                </button>
              )}
              <button
                type="button"
                onClick={addBenefit}
                className="text-sm font-medium"
                style={{ color: NAVY }}
              >
                {t.services.addBenefit}
              </button>
            </div>
          </FormField>

          {editing && (
            <SubmitButton isPending={isPending} label={isNew ? t.services.createService : t.common.update} />
          )}
        </fieldset>
      </div>
    </form>
  );
}
