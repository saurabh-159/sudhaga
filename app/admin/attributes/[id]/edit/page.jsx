import AttributeForm from '@/components/admin/AttributeForm';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { attributes } from '@/lib/dummyData';
import { notFound } from 'next/navigation';

export default async function EditAttribute({ params }) {
  const { id } = await params;
  const attribute = attributes.find((a) => a.id === id);
  if (!attribute) notFound();

  return (
    <div>
      <AdminPageHeader
        title="Edit attribute"
        description={`Update values for “${attribute.name}”.`}
      />
      <AttributeForm initial={attribute} />
    </div>
  );
}
