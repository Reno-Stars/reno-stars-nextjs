'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { updateCompanyInfo } from '@/app/actions/admin/company';
import FormField from '@/components/admin/FormField';
import ImageUrlInput from '@/components/admin/ImageUrlInput';
import VideoUrlInput from '@/components/admin/VideoUrlInput';
import EditModeToggle from '@/components/admin/EditModeToggle';
import FormAlerts from '@/components/admin/FormAlerts';
import { useFormToast } from '@/components/admin/useFormToast';
import { inputStyle, readOnlyStyle } from '@/components/admin/shared-styles';
import { CARD, GOLD, GOLD_HOVER, TEXT_MUTED, SURFACE, neu } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';
import type { DbCompanyInfo } from '@/lib/db/schema';

interface CompanyFormProps {
  company: DbCompanyInfo;
}

export default function CompanyForm({ company }: CompanyFormProps) {
  const t = useAdminTranslations();
  const [editing, setEditing] = useState(false);
  const [state, formAction, isPending] = useActionState(updateCompanyInfo, {});
  useFormToast(state, t.company.saved);

  const fieldStyle = editing ? inputStyle : readOnlyStyle;
  const sectionHeaderStyle: React.CSSProperties = {
    fontSize: '0.75rem', fontWeight: 600, color: TEXT_MUTED,
    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem',
  };

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
        <EditModeToggle editing={editing} setEditing={setEditing} />
        <FormAlerts state={state} />

        <fieldset disabled={!editing} style={{ border: 'none', padding: 0, margin: 0 }}>
          {/* Business Info */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={sectionHeaderStyle}>
              {t.company.sectionBusiness}
            </div>
            <div style={{ backgroundColor: SURFACE, borderRadius: '8px', padding: '1rem' }}>
              <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                <FormField label={t.company.nameLabel} htmlFor="name">
                  <input id="name" name="name" defaultValue={company.name} required style={fieldStyle} />
                </FormField>
                <FormField label={t.company.tagline} htmlFor="tagline">
                  <input id="tagline" name="tagline" defaultValue={company.tagline ?? ''} style={fieldStyle} />
                </FormField>
                <FormField label={t.company.phone} htmlFor="phone">
                  <input id="phone" name="phone" defaultValue={company.phone ?? ''} style={fieldStyle} />
                </FormField>
                <FormField label={t.company.email} htmlFor="email">
                  <input id="email" name="email" type="email" defaultValue={company.email ?? ''} style={fieldStyle} />
                </FormField>
              </div>
            </div>
          </div>

          {/* Location */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={sectionHeaderStyle}>
              {t.company.sectionLocation}
            </div>
            <div style={{ backgroundColor: SURFACE, borderRadius: '8px', padding: '1rem' }}>
              <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                <FormField label={t.company.address} htmlFor="address">
                  <input id="address" name="address" defaultValue={company.address ?? ''} style={fieldStyle} />
                </FormField>
                <div aria-hidden="true" />
                <FormField label={t.company.geoLatitude} htmlFor="geoLatitude">
                  <input id="geoLatitude" name="geoLatitude" defaultValue={company.geoLatitude ?? ''} style={fieldStyle} />
                </FormField>
                <FormField label={t.company.geoLongitude} htmlFor="geoLongitude">
                  <input id="geoLongitude" name="geoLongitude" defaultValue={company.geoLongitude ?? ''} style={fieldStyle} />
                </FormField>
              </div>
            </div>
          </div>

          {/* Marketing */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={sectionHeaderStyle}>
              {t.company.sectionMarketing}
            </div>
            <div style={{ backgroundColor: SURFACE, borderRadius: '8px', padding: '1rem' }}>
              <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                <FormField label={t.company.quoteUrl} htmlFor="quoteUrl">
                  <input id="quoteUrl" name="quoteUrl" defaultValue={company.quoteUrl ?? ''} style={fieldStyle} />
                </FormField>
              </div>
            </div>
          </div>

          <ImageUrlInput name="logoUrl" label={t.company.logoUrl} defaultValue={company.logoUrl ?? ''} disabled={!editing} />
          <VideoUrlInput name="heroVideoUrl" label={t.company.heroVideoUrl} defaultValue={company.heroVideoUrl ?? ''} disabled={!editing} />
          <ImageUrlInput name="heroImageUrl" label={t.company.heroImageUrl} defaultValue={company.heroImageUrl ?? ''} disabled={!editing} />

          {editing && (
            <button
              type="submit"
              disabled={isPending}
              style={{
                marginTop: '1rem',
                padding: '0.625rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isPending ? GOLD_HOVER : GOLD,
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: isPending ? 'not-allowed' : 'pointer',
                opacity: isPending ? 0.7 : 1,
              }}
            >
              {isPending ? t.common.saving : t.common.save}
            </button>
          )}
        </fieldset>
      </div>
    </form>
  );
}
