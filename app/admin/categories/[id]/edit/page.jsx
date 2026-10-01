'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CategoryForm from '@/components/admin/CategoryForm';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { api, shapeCategory } from '@/lib/apiClient';

export default function EditCategory() {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    api(`/api/categories/${id}`)
      .then((data) => setCategory(shapeCategory(data)))
      .catch(() => setMissing(true));
  }, [id]);

  if (missing) return <p className="p-6">Category not found.</p>;
  if (!category) return <p className="p-6">Loading category…</p>;

  return (
    <div>
      <AdminPageHeader title="Edit category" description={`Update “${category.name}” and its search text.`} />
      <CategoryForm key={category.id} initial={category} />
    </div>
  );
}
