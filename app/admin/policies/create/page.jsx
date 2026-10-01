import PolicyForm from '@/components/admin/PolicyForm';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default function CreatePolicy() {
  return (
    <div>
      <AdminPageHeader
        title="Add page"
        description="Extra pages are published at /policies/your-slug and linked from the footer. Shipping, returns, privacy, and terms already exist."
      />
      <PolicyForm />
    </div>
  );
}
