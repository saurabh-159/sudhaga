'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import AdminFormSection from './AdminFormSection';
import { api } from '@/lib/apiClient';
import { policyPath } from '@/lib/policyInput';

export default function PolicyForm({ initial = {} }) {
  const router = useRouter();
  const system = Boolean(initial.system);
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
      title: form.get('title'),
      slug: form.get('slug'),
      summary: form.get('summary'),
      body: form.get('body'),
      published: system ? true : published,
    };
    try {
      if (id) {
        await api(`/api/policies/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await api('/api/policies', { method: 'POST', body: JSON.stringify(payload) });
      }
      router.push('/admin/policies');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const livePath = initial.slug ? policyPath(initial) : '';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AdminFormSection
        title="Page"
        description={
          system
            ? 'This page stays published. Payment gateways and Google Merchant Center link to its URL, so the address cannot be changed.'
            : 'An extra page is published at /policies/your-slug and linked from the footer.'
        }
      >
        <Input label="Title" name="title" defaultValue={initial.title} required />
        <Input
          label="URL slug"
          name="slug"
          defaultValue={initial.slug}
          readOnly={system}
          placeholder="packaging"
          hint={
            livePath
              ? `Live URL: ${livePath}`
              : 'Leave blank to build the URL from the title. Reserved names such as shipping and privacy are already used.'
          }
        />
        <Textarea
          label="Short intro"
          name="summary"
          defaultValue={initial.summary}
          rows={2}
          hint="Shown under the title and used as the search description."
        />
        <Textarea
          label="Page text"
          name="body"
          defaultValue={initial.body}
          rows={14}
          required
          hint="Separate paragraphs with a blank line."
        />
        {initial.slug === 'shipping' ? (
          <p className="text-sm text-neutral-500">
            The public shipping page also shows the live checkout rule above this text: free delivery over ₹999, otherwise ₹49.
          </p>
        ) : null}
        {system ? null : (
          <label className="flex items-center gap-3 text-sm text-neutral-800">
            <input
              type="checkbox"
              checked={published}
              onChange={(event) => setPublished(event.target.checked)}
              className="h-4 w-4"
            />
            Publish on the site
          </label>
        )}
      </AdminFormSection>

      <div className="flex flex-wrap items-center gap-3 border-t border-black/6 pt-5">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save page'}
        </Button>
        <Link href="/admin/policies">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}
