'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import AdminFormSection from './AdminFormSection';
import { api } from '@/lib/apiClient';
import { FOOTER_SECTIONS } from '@/lib/footerLinkInput';

export default function FooterLinkForm({ initial = {} }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [published, setPublished] = useState(initial.published !== false);
  const id = initial._id || initial.id;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const payload = {
      section: form.get('section'),
      label: form.get('label'),
      url: form.get('url'),
      sort: Number(form.get('sort')),
      published,
    };
    try {
      if (id) {
        await api(`/api/footer-links/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await api('/api/footer-links', { method: 'POST', body: JSON.stringify(payload) });
      }
      router.push('/admin/footer');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AdminFormSection
        title="Footer link"
        description="Help links open pages on this site. Follow links open Instagram, X, Facebook, or any other profile. The store footer updates after you save."
      >
        <Select
          label="Column"
          name="section"
          defaultValue={initial.section || 'help'}
          options={FOOTER_SECTIONS}
        />
        <Input label="Link text" name="label" defaultValue={initial.label} required maxLength={40} />
        <Input
          label="URL"
          name="url"
          defaultValue={initial.url}
          required
          placeholder="https://instagram.com/yourbrand or /contact"
          hint="A site path such as /returns, or a full profile URL starting with https://"
        />
        <Input
          label="Order"
          name="sort"
          type="number"
          min="0"
          max="999"
          defaultValue={initial.sort ?? 100}
          hint="Lower numbers appear first in that column."
        />
        <label className="flex items-center gap-3 text-sm text-neutral-800">
          <input
            type="checkbox"
            checked={published}
            onChange={(event) => setPublished(event.target.checked)}
            className="h-4 w-4"
          />
          Show in the store footer
        </label>
      </AdminFormSection>

      <div className="flex flex-wrap items-center gap-3 border-t border-black/6 pt-5">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save link'}
        </Button>
        <Link href="/admin/footer">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}
