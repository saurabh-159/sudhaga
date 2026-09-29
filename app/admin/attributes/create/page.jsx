import AttributeForm from '@/components/admin/AttributeForm';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default function CreateAttribute() {
  return (
    <div>
      <AdminPageHeader
        title="Add attribute"
        description="Create a new option group for products."
      />
      <AttributeForm />
    </div>
  );
}
