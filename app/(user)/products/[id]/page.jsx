'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductDetails from '@/components/user/ProductDetails';
import { api, shapeProduct } from '@/lib/apiClient';

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    api(`/api/products/${id}`)
      .then((data) => setProduct(shapeProduct(data)))
      .catch(() => setMissing(true));
  }, [id]);

  if (missing) return <p className="px-4 py-16 text-center">Product not found.</p>;
  if (!product) return <p className="px-4 py-16 text-center">Loading…</p>;
  return <ProductDetails product={product} />;
}
