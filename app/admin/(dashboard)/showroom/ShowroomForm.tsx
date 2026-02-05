'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { updateShowroomInfo } from '@/app/actions/admin/showroom';
import FormField from '@/components/admin/FormField';
import BilingualTextarea from '@/components/admin/BilingualTextarea';
import EditModeToggle from '@/components/admin/EditModeToggle';
import FormAlerts from '@/components/admin/FormAlerts';
import { useFormToast } from '@/components/admin/useFormToast';
import { inputStyle, readOnlyStyle } from '@/components/admin/shared-styles';
import SubmitButton from '@/components/admin/SubmitButton';
import { CARD, neu } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';
import type { DbShowroomInfo } from '@/lib/db/schema';

interface ShowroomFormProps {
  showroom: DbShowroomInfo;
}

export default function ShowroomForm({ showroom }: ShowroomFormProps) {
  const t = useAdminTranslations();
  const [editing, setEditing] = useState(false);
  const [state, formAction, isPending] = useActionState(updateShowroomInfo, {});
  useFormToast(state, t.showroom.saved);

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
        <EditModeToggle editing={editing} setEditing={setEditing} />
        <FormAlerts state={state} />

        <fieldset disabled={!editing} style={{ border: 'none', padding: 0, margin: 0 }}>
          <FormField label={t.company.address} htmlFor="address">
            <input id="address" name="address" defaultValue={showroom.address ?? ''} style={fieldStyle} />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <FormField label={t.showroom.phone} htmlFor="phone">
              <input id="phone" name="phone" defaultValue={showroom.phone ?? ''} style={fieldStyle} />
            </FormField>
            <FormField label={t.showroom.email} htmlFor="email">
              <input id="email" name="email" type="email" defaultValue={showroom.email ?? ''} style={fieldStyle} />
            </FormField>
            <FormField label={t.showroom.hoursOpen} htmlFor="hoursOpen">
              <input id="hoursOpen" name="hoursOpen" defaultValue={showroom.hoursOpen ?? ''} style={fieldStyle} />
            </FormField>
            <FormField label={t.showroom.hoursClose} htmlFor="hoursClose">
              <input id="hoursClose" name="hoursClose" defaultValue={showroom.hoursClose ?? ''} style={fieldStyle} />
            </FormField>
          </div>

          <BilingualTextarea
            nameEn="appointmentTextEn"
            nameZh="appointmentTextZh"
            label={t.showroom.appointmentText}
            defaultValueEn={showroom.appointmentTextEn ?? ''}
            defaultValueZh={showroom.appointmentTextZh ?? ''}
            rows={3}
          />

          {editing && (
            <div style={{ marginTop: '1rem' }}>
              <SubmitButton isPending={isPending} />
            </div>
          )}
        </fieldset>
      </div>
    </form>
  );
}
