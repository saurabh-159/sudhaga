'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ArticleForm from '@/components/admin/ArticleForm';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { api } from '@/lib/apiClient';

export default function EditArticle() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/api/articles/${id}`)
      .then(setArticle)
      .catch((err) => setError(err.message));
  }, [id]);

  return (
    <div>
      <AdminPageHeader title="Edit article" description="Changes show on the public article page after you save." />
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      {article ? <ArticleForm initial={article} /> : error ? null : <p className="text-sm text-neutral-500">Loading…</p>}
    </div>
  );
}
