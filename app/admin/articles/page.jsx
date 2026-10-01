'use client';

import { useEffect, useState } from 'react';
import ArticleTable from '@/components/admin/ArticleTable';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { api } from '@/lib/apiClient';

function shape(article) {
  return { ...article, id: String(article._id || article.id) };
}

export default function AdminArticles() {
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState('');

  const load = () => {
    api('/api/articles')
      .then((data) => setArticles((data || []).map(shape)))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="Blog"
        description="Articles for /blog and /blog/[slug]. Hidden articles stay here and are left out of the public site and sitemap."
        action={{ href: '/admin/articles/create', label: '+ Add article' }}
      />
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      <ArticleTable
        articles={articles}
        onDelete={async (id) => {
          await api(`/api/articles/${id}`, { method: 'DELETE' });
          load();
        }}
      />
    </div>
  );
}
