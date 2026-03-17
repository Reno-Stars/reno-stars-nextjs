'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import GalleryItemForm from '../GalleryItemForm';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/admin/ToastProvider';
import { useAdminTranslations } from '@/lib/admin/translations';
import { deleteGalleryItem } from '@/app/actions/admin/gallery';
import { CARD, ERROR, neu, TEXT_MID } from '@/lib/theme';
import type { GalleryCategoryOption } from '@/lib/admin/gallery-categories';

interface GalleryEditClientProps {
  id: string;
  action: (
    prevState: { success?: boolean; error?: string },
    formData: FormData
  ) => Promise<{ success?: boolean; error?: string }>;
  categoryOptions: GalleryCategoryOption[];
  initialData: {
    imageUrl: string;
    titleEn: string;
    titleZh: string;
    category: string;
    displayOrder: number;
    isPublished: boolean;
  };
}

export default function GalleryEditClient({ id, action, categoryOptions, initialData }: GalleryEditClientProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const t = useAdminTranslations();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteGalleryItem(id);
      if (result.error) {
        toast(result.error, 'error');
      } else {
        toast(t.gallery.deleted, 'success');
        router.push('/admin/gallery');
      }
      setShowDeleteDialog(false);
    });
  };

  return (
    <>
      <GalleryItemForm action={action} categoryOptions={categoryOptions} initialData={initialData} />

      {/* Delete Button */}
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
          {t.gallery.deleteMessage}
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
          {t.gallery.deleteGalleryItem}
        </button>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        title={t.gallery.deleteGalleryItem}
        message={t.gallery.deleteMessage}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        loading={isPending}
      />
    </>
  );
}
