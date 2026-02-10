'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import FormField from '@/components/admin/FormField';
import EditModeToggle from '@/components/admin/EditModeToggle';
import FormAlerts from '@/components/admin/FormAlerts';
import { useFormToast } from '@/components/admin/useFormToast';
import { inputStyle, readOnlyStyle } from '@/components/admin/shared-styles';
import SubmitButton from '@/components/admin/SubmitButton';
import { CARD, NAVY, neu } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';

interface TrustBadgeFormProps {
  action: (
    prevState: { success?: boolean; error?: string },
    formData: FormData
  ) => Promise<{ success?: boolean; error?: string }>;
  initialData?: {
    badgeEn: string;
    badgeZh: string;
    displayOrder: number;
    isActive: boolean;
  };
  isNew?: boolean;
}

export default function TrustBadgeForm({ action, initialData, isNew = false }: TrustBadgeFormProps) {
  const t = useAdminTranslations();
  const [editing, setEditing] = useState(isNew);
  const [state, formAction, isPending] = useActionState(action, {});
  useFormToast(state, t.trustBadges.saved);

  const fieldStyle = editing ? inputStyle : readOnlyStyle;

  const defaults = initialData ?? {
    badgeEn: '',
    badgeZh: '',
    displayOrder: 0,
    isActive: true,
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
        {!isNew && <EditModeToggle editing={editing} setEditing={setEditing} />}
        <FormAlerts state={state} />

        <fieldset disabled={!editing} style={{ border: 'none', padding: 0, margin: 0 }}>
          <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <FormField label={t.trustBadges.badgeEn} htmlFor="badgeEn">
              <input id="badgeEn" name="badgeEn" defaultValue={defaults.badgeEn} required style={fieldStyle} />
            </FormField>
            <FormField label={t.trustBadges.badgeZh} htmlFor="badgeZh">
              <input id="badgeZh" name="badgeZh" defaultValue={defaults.badgeZh} required style={fieldStyle} />
            </FormField>
          </div>

          <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <FormField label={t.trustBadges.displayOrder} htmlFor="displayOrder">
              <input id="displayOrder" name="displayOrder" type="number" min={0} defaultValue={defaults.displayOrder} required style={fieldStyle} />
            </FormField>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: NAVY, fontSize: '0.875rem' }}>
              <input type="checkbox" name="isActive" defaultChecked={defaults.isActive} />
              {t.trustBadges.isActive}
            </label>
          </div>

          {editing && (
            <SubmitButton isPending={isPending} label={isNew ? t.trustBadges.createTrustBadge : t.common.update} />
          )}
        </fieldset>
      </div>
    </form>
  );
}
