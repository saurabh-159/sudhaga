import CategoryForm from '@/components/admin/CategoryForm';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default function CreateCategory() {
  return (
    <div>
      <AdminPageHeader
        title="Add category"
        description="Create a new collection for the storefront."
      />
      <CategoryForm />
    </div>
  );
}
