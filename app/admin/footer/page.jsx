'use client';

import { useEffect, useState } from 'react';
import FooterLinkTable from '@/components/admin/FooterLinkTable';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { api } from '@/lib/apiClient';

function shape(link) {
  return {
    ...link,
    id: String(link._id || link.id),
    published: link.published !== false,
    url: link.url || '',
  };
}

export default function AdminFooter() {
  const [links, setLinks] = useState([]);
  const [error, setError] = useState('');

  const load = () => {
    api('/api/footer-links')
      .then((data) => setLinks((data || []).map(shape)))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="Footer"
        description="Change the Help and Follow text, and paste the page or social profile URL. Only admins can edit these links."
        action={{ href: '/admin/footer/create', label: '+ Add link' }}
      />
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      <FooterLinkTable
        links={links}
        onDelete={async (id) => {
          if (!window.confirm('Delete this footer link? It will leave the store footer.')) return;
          try {
            await api(`/api/footer-links/${id}`, { method: 'DELETE' });
            load();
          } catch (err) {
            setError(err.message);
          }
        }}
      />
    </div>
  );
}
