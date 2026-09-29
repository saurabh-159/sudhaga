import ProductForm from '@/components/admin/ProductForm';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default function CreateProduct() {
  return (
    <div>
      <AdminPageHeader
        title="Add product"
        description="Fill in details, media, and attribute combinations for a new listing."
      />
      <ProductForm />
    </div>
  );
}
