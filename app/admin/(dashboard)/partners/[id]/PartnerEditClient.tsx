'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import PartnerForm from '../PartnerForm';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/admin/ToastProvider';
import { useAdminTranslations } from '@/lib/admin/translations';
import { deletePartner } from '@/app/actions/admin/partners';
import { CARD, ERROR, neu, TEXT_MID } from '@/lib/theme';

interface PartnerEditClientProps {
  id: string;
  action: (
    prevState: { success?: boolean; error?: string },
    formData: FormData
  ) => Promise<{ success?: boolean; error?: string }>;
  initialData: {
    nameEn: string;
    nameZh: string;
    logoUrl: string;
    websiteUrl: string | null;
    displayOrder: number;
    isActive: boolean;
    isHiddenVisually: boolean;
  };
}

export default function PartnerEditClient({ id, action, initialData }: PartnerEditClientProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const t = useAdminTranslations();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deletePartner(id);
      if (result.error) {
        toast(result.error, 'error');
      } else {
        toast(t.partners.deleted, 'success');
        router.push('/admin/partners');
      }
      setShowDeleteDialog(false);
    });
  };

  return (
    <>
      <PartnerForm action={action} initialData={initialData} />

      <div
        style={{
          backgroundColor: CARD,
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: neu(6),
          maxWidth: '800px',
          marginTop: '1.5rem',
        }}
      >
        <h3 style={{ color: ERROR, fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          {t.common.delete}
        </h3>
        <p style={{ color: TEXT_MID, fontSize: '0.875rem', marginBottom: '1rem' }}>
          {t.partners.deleteMessage}
        </p>
        <button
          type="button"
          onClick={() => setShowDeleteDialog(true)}
          disabled={isPending}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            backgroundColor: ERROR,
            color: '#fff',
            border: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: isPending ? 'not-allowed' : 'pointer',
            opacity: isPending ? 0.7 : 1,
            transition: 'opacity 0.2s, filter 0.2s',
          }}
          onMouseEnter={(e) => {
            if (!isPending) e.currentTarget.style.filter = 'brightness(0.9)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = 'brightness(1)';
          }}
        >
          {t.partners.deletePartner}
        </button>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        title={t.partners.deletePartner}
        message={t.partners.deleteMessage}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        loading={isPending}
      />
    </>
  );
}
