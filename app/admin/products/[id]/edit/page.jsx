'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { api, shapeProduct } from '@/lib/apiClient';

export default function EditProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    api(`/api/products/${id}`)
      .then((data) => setProduct(shapeProduct(data)))
      .catch(() => setMissing(true));
  }, [id]);

  if (missing) return <p className="p-6">Product not found.</p>;
  if (!product) return <p className="p-6">Loading product…</p>;

  return (
    <div>
      <AdminPageHeader
        title="Edit product"
        description={`Update details and attribute combinations for “${product.name}”.`}
      />
      <ProductForm key={product.id} initial={product} />
    </div>
  );
}
