import DesignItemForm from '../DesignItemForm';
import { createDesignItem } from '@/app/actions/admin/designs';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default async function NewDesignItemPage() {
  return (
    <div>
      <AdminPageHeader titleKey="designs.addDesignItem" backHref="/admin/designs" backLabelKey="nav.designs" />
      <DesignItemForm action={createDesignItem} isNew />
    </div>
  );
}
