'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import FormField from '@/components/admin/FormField';
import EditModeToggle from '@/components/admin/EditModeToggle';
import FormAlerts from '@/components/admin/FormAlerts';
import { useFormToast } from '@/components/admin/useFormToast';
import { inputStyle, readOnlyStyle, textareaStyle, readOnlyTextareaStyle } from '@/components/admin/shared-styles';
import SubmitButton from '@/components/admin/SubmitButton';
import { CARD, NAVY, neu } from '@/lib/theme';
import { useAdminTranslations } from '@/lib/admin/translations';

interface FaqFormProps {
  action: (
    prevState: { success?: boolean; error?: string },
    formData: FormData
  ) => Promise<{ success?: boolean; error?: string }>;
  initialData?: {
    questionEn: string;
    questionZh: string;
    answerEn: string;
    answerZh: string;
    displayOrder: number;
    isActive: boolean;
  };
  isNew?: boolean;
}

export default function FaqForm({ action, initialData, isNew = false }: FaqFormProps) {
  const t = useAdminTranslations();
  const [editing, setEditing] = useState(isNew);
  const [state, formAction, isPending] = useActionState(action, {});
  useFormToast(state, t.faqs.saved);

  const fieldStyle = editing ? inputStyle : readOnlyStyle;
  const taStyle = editing ? textareaStyle : readOnlyTextareaStyle;

  const defaults = initialData ?? {
    questionEn: '',
    questionZh: '',
    answerEn: '',
    answerZh: '',
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
          <FormField label={t.faqs.questionEn} htmlFor="questionEn">
            <input id="questionEn" name="questionEn" defaultValue={defaults.questionEn} required style={fieldStyle} />
          </FormField>
          <FormField label={t.faqs.questionZh} htmlFor="questionZh">
            <input id="questionZh" name="questionZh" defaultValue={defaults.questionZh} required style={fieldStyle} />
          </FormField>

          <FormField label={`${t.faqs.answer} (EN)`} htmlFor="answerEn">
            <textarea id="answerEn" name="answerEn" rows={4} defaultValue={defaults.answerEn} required style={taStyle} />
          </FormField>
          <FormField label={`${t.faqs.answer} (ZH)`} htmlFor="answerZh">
            <textarea id="answerZh" name="answerZh" rows={4} defaultValue={defaults.answerZh} required style={taStyle} />
          </FormField>

          <FormField label={t.faqs.displayOrder} htmlFor="displayOrder">
            <input id="displayOrder" name="displayOrder" type="number" min={0} defaultValue={defaults.displayOrder} required style={{ ...fieldStyle, maxWidth: '150px' }} />
          </FormField>

          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: NAVY, fontSize: '0.875rem' }}>
              <input type="checkbox" name="isActive" defaultChecked={defaults.isActive} />
              {t.faqs.active}
            </label>
          </div>

          {editing && (
            <SubmitButton isPending={isPending} label={isNew ? t.faqs.createFaq : t.faqs.updateFaq} />
          )}
        </fieldset>
      </div>
    </form>
  );
}
