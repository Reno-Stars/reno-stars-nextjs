'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { updateAboutSections } from '@/app/actions/admin/about';
import BilingualTextarea from '@/components/admin/BilingualTextarea';
import EditModeToggle from '@/components/admin/EditModeToggle';
import FormAlerts from '@/components/admin/FormAlerts';
import { useFormToast } from '@/components/admin/useFormToast';
import SubmitButton from '@/components/admin/SubmitButton';
import { CARD, neu } from '@/lib/theme';
import type { DbAboutSections } from '@/lib/db/schema';

interface AboutFormProps {
  about: DbAboutSections;
}

export default function AboutForm({ about }: AboutFormProps) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, isPending] = useActionState(updateAboutSections, {});
  useFormToast(state, 'About sections updated.');

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
        <FormAlerts state={state} successMessage="Updated successfully." />

        <fieldset disabled={!editing} style={{ border: 'none', padding: 0, margin: 0 }}>
          <BilingualTextarea
            nameEn="ourJourneyEn"
            nameZh="ourJourneyZh"
            label="Our Journey"
            defaultValueEn={about.ourJourneyEn ?? ''}
            defaultValueZh={about.ourJourneyZh ?? ''}
            rows={4}
          />

          <BilingualTextarea
            nameEn="whatWeOfferEn"
            nameZh="whatWeOfferZh"
            label="What We Offer"
            defaultValueEn={about.whatWeOfferEn ?? ''}
            defaultValueZh={about.whatWeOfferZh ?? ''}
            rows={4}
          />

          <BilingualTextarea
            nameEn="ourValuesEn"
            nameZh="ourValuesZh"
            label="Our Values"
            defaultValueEn={about.ourValuesEn ?? ''}
            defaultValueZh={about.ourValuesZh ?? ''}
            rows={4}
          />

          <BilingualTextarea
            nameEn="whyChooseUsEn"
            nameZh="whyChooseUsZh"
            label="Why Choose Us"
            defaultValueEn={about.whyChooseUsEn ?? ''}
            defaultValueZh={about.whyChooseUsZh ?? ''}
            rows={4}
          />

          <BilingualTextarea
            nameEn="letsBuildTogetherEn"
            nameZh="letsBuildTogetherZh"
            label="Let's Build Together"
            defaultValueEn={about.letsBuildTogetherEn ?? ''}
            defaultValueZh={about.letsBuildTogetherZh ?? ''}
            rows={4}
          />

          {editing && (
            <div style={{ marginTop: '1rem' }}>
              <SubmitButton isPending={isPending} label="Save Changes" />
            </div>
          )}
        </fieldset>
      </div>
    </form>
  );
}
