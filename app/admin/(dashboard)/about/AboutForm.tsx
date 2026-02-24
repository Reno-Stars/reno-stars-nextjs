'use client';

import { useState, useMemo } from 'react';
import { useActionState } from 'react';
import { updateAboutSections } from '@/app/actions/admin/about';
import BilingualTextarea from '@/components/admin/BilingualTextarea';
import EditModeToggle from '@/components/admin/EditModeToggle';
import FormAlerts from '@/components/admin/FormAlerts';
import { useFormToast } from '@/components/admin/useFormToast';
import SubmitButton from '@/components/admin/SubmitButton';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import { CARD, GOLD, SURFACE_ALT, TEXT, TEXT_MID, neu } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';
import type { DbAboutSections } from '@/lib/db/schema';

interface AboutFormProps {
  about: DbAboutSections;
}

export default function AboutForm({ about }: AboutFormProps) {
  const t = useAdminTranslations();
  const { locale } = useAdminLocale();
  const [editing, setEditing] = useState(false);
  const [state, formAction, isPending] = useActionState(updateAboutSections, {});
  useFormToast(state, t.about.saved);

  const previewItems = useMemo(() => [
    { title: t.about.ourJourney, text: (locale === 'zh' ? about.ourJourneyZh : about.ourJourneyEn) ?? '' },
    { title: t.about.whatWeOffer, text: (locale === 'zh' ? about.whatWeOfferZh : about.whatWeOfferEn) ?? '' },
    { title: t.about.ourValues, text: (locale === 'zh' ? about.ourValuesZh : about.ourValuesEn) ?? '' },
    { title: t.about.whyChooseUs, text: (locale === 'zh' ? about.whyChooseUsZh : about.whyChooseUsEn) ?? '' },
    { title: t.about.letsBuildTogether, text: (locale === 'zh' ? about.letsBuildTogetherZh : about.letsBuildTogetherEn) ?? '' },
  ], [about, locale, t]);

  return (
    <>
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
        <EditModeToggle editing={editing} setEditing={setEditing} />
        <FormAlerts state={state} />

        <fieldset disabled={!editing} style={{ border: 'none', padding: 0, margin: 0 }}>
          <BilingualTextarea
            nameEn="ourJourneyEn"
            nameZh="ourJourneyZh"
            label={t.about.ourJourney}
            defaultValueEn={about.ourJourneyEn ?? ''}
            defaultValueZh={about.ourJourneyZh ?? ''}
            rows={4}
          />

          <BilingualTextarea
            nameEn="whatWeOfferEn"
            nameZh="whatWeOfferZh"
            label={t.about.whatWeOffer}
            defaultValueEn={about.whatWeOfferEn ?? ''}
            defaultValueZh={about.whatWeOfferZh ?? ''}
            rows={4}
          />

          <BilingualTextarea
            nameEn="ourValuesEn"
            nameZh="ourValuesZh"
            label={t.about.ourValues}
            defaultValueEn={about.ourValuesEn ?? ''}
            defaultValueZh={about.ourValuesZh ?? ''}
            rows={4}
          />

          <BilingualTextarea
            nameEn="whyChooseUsEn"
            nameZh="whyChooseUsZh"
            label={t.about.whyChooseUs}
            defaultValueEn={about.whyChooseUsEn ?? ''}
            defaultValueZh={about.whyChooseUsZh ?? ''}
            rows={4}
          />

          <BilingualTextarea
            nameEn="letsBuildTogetherEn"
            nameZh="letsBuildTogetherZh"
            label={t.about.letsBuildTogether}
            defaultValueEn={about.letsBuildTogetherEn ?? ''}
            defaultValueZh={about.letsBuildTogetherZh ?? ''}
            rows={4}
          />

          {editing && (
            <div style={{ marginTop: '1rem' }}>
              <SubmitButton isPending={isPending} />
            </div>
          )}
        </fieldset>
      </div>
    </form>

    {/* Landing page preview */}
    {previewItems.some((item) => item.text) && (
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: TEXT_MID, marginBottom: '1rem' }}>
          {t.about.landingPreview}
        </h3>
        <div
          style={{
            backgroundColor: SURFACE_ALT,
            borderRadius: 16,
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {previewItems.map((item) => (
              <div
                key={item.title}
                style={{
                  backgroundColor: CARD,
                  borderRadius: 16,
                  padding: '1.25rem',
                  boxShadow: neu(4),
                }}
              >
                <div style={{ width: 32, height: 2, borderRadius: 9999, marginBottom: '0.75rem', backgroundColor: GOLD }} />
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: TEXT, marginBottom: '0.375rem' }}>
                  {item.title}
                </div>
                <div
                  style={{
                    fontSize: '0.8125rem',
                    lineHeight: 1.6,
                    color: TEXT_MID,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {item.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
