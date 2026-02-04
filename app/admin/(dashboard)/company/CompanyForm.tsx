'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { updateCompanyInfo } from '@/app/actions/admin/company';
import FormField from '@/components/admin/FormField';
import ImageUrlInput from '@/components/admin/ImageUrlInput';
import { useFormToast } from '@/components/admin/useFormToast';
import { inputStyle } from '@/components/admin/shared-styles';
import { CARD, NAVY, GOLD, GOLD_HOVER, TEXT_MID, SUCCESS, SUCCESS_BG, ERROR, ERROR_BG, neu } from '@/lib/theme';
import type { DbCompanyInfo } from '@/lib/db/schema';

interface CompanyFormProps {
  company: DbCompanyInfo;
}

const readOnlyStyle: React.CSSProperties = {
  ...inputStyle,
  opacity: 0.7,
  cursor: 'default',
};

export default function CompanyForm({ company }: CompanyFormProps) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, isPending] = useActionState(updateCompanyInfo, {});
  useFormToast(state, 'Company info updated.');

  const fieldStyle = editing ? inputStyle : readOnlyStyle;

  return (
    <form action={formAction}>
      <div
        style={{
          backgroundColor: CARD,
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: neu(6),
          maxWidth: '800px',
        }}
      >
        {/* Header with Edit / Cancel button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: GOLD,
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Edit
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(false)}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '8px',
                border: `1px solid ${TEXT_MID}`,
                backgroundColor: 'transparent',
                color: TEXT_MID,
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          )}
        </div>

        {state.error && (
          <div role="alert" style={{ backgroundColor: ERROR_BG, color: ERROR, padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {state.error}
          </div>
        )}
        {state.success && (
          <div role="alert" style={{ backgroundColor: SUCCESS_BG, color: SUCCESS, padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            Updated successfully.
          </div>
        )}

        <fieldset disabled={!editing} style={{ border: 'none', padding: 0, margin: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <FormField label="Company Name" htmlFor="name">
              <input id="name" name="name" defaultValue={company.name} required style={fieldStyle} />
            </FormField>
            <FormField label="Tagline" htmlFor="tagline">
              <input id="tagline" name="tagline" defaultValue={company.tagline ?? ''} style={fieldStyle} />
            </FormField>
            <FormField label="Phone" htmlFor="phone">
              <input id="phone" name="phone" defaultValue={company.phone ?? ''} style={fieldStyle} />
            </FormField>
            <FormField label="Email" htmlFor="email">
              <input id="email" name="email" type="email" defaultValue={company.email ?? ''} style={fieldStyle} />
            </FormField>
            <FormField label="Address" htmlFor="address">
              <input id="address" name="address" defaultValue={company.address ?? ''} style={fieldStyle} />
            </FormField>
            <FormField label="Quote URL" htmlFor="quoteUrl">
              <input id="quoteUrl" name="quoteUrl" defaultValue={company.quoteUrl ?? ''} style={fieldStyle} />
            </FormField>
            <FormField label="Founding Year" htmlFor="foundingYear">
              <input id="foundingYear" name="foundingYear" type="number" defaultValue={company.foundingYear ?? ''} style={fieldStyle} />
            </FormField>
            <FormField label="Team Size" htmlFor="teamSize">
              <input id="teamSize" name="teamSize" type="number" defaultValue={company.teamSize ?? ''} style={fieldStyle} />
            </FormField>
            <FormField label="Warranty" htmlFor="warranty">
              <input id="warranty" name="warranty" defaultValue={company.warranty ?? ''} style={fieldStyle} />
            </FormField>
            <FormField label="Liability Coverage" htmlFor="liabilityCoverage">
              <input id="liabilityCoverage" name="liabilityCoverage" defaultValue={company.liabilityCoverage ?? ''} style={fieldStyle} />
            </FormField>
            <FormField label="Rating" htmlFor="rating">
              <input id="rating" name="rating" defaultValue={company.rating ?? ''} style={fieldStyle} />
            </FormField>
            <FormField label="Review Count" htmlFor="reviewCount">
              <input id="reviewCount" name="reviewCount" type="number" defaultValue={company.reviewCount ?? ''} style={fieldStyle} />
            </FormField>
            <FormField label="Rating Source" htmlFor="ratingSource">
              <input id="ratingSource" name="ratingSource" defaultValue={company.ratingSource ?? ''} style={fieldStyle} />
            </FormField>
            <FormField label="Geo Latitude" htmlFor="geoLatitude">
              <input id="geoLatitude" name="geoLatitude" defaultValue={company.geoLatitude ?? ''} style={fieldStyle} />
            </FormField>
            <FormField label="Geo Longitude" htmlFor="geoLongitude">
              <input id="geoLongitude" name="geoLongitude" defaultValue={company.geoLongitude ?? ''} style={fieldStyle} />
            </FormField>
          </div>

          <ImageUrlInput name="logoUrl" label="Logo URL" defaultValue={company.logoUrl ?? ''} />

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
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </fieldset>
      </div>
    </form>
  );
}
