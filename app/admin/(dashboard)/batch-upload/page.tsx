import AdminPageHeader from '@/components/admin/AdminPageHeader';
import BatchUploadClient from './BatchUploadClient';

export default function BatchUploadPage() {
  return (
    <div>
      <AdminPageHeader titleKey="batchUpload.title" />
      <BatchUploadClient />
    </div>
  );
}
