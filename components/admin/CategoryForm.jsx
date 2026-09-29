'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import AdminFormSection from './AdminFormSection';
import { api } from '@/lib/apiClient';

export default function CategoryForm({ initial = {} }) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState(initial.image || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function uploadImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const body = new FormData();
    body.append('file', file);
    const uploaded = await api('/api/upload', { method: 'POST', body });
    setImageUrl(uploaded.url);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const payload = {
      name: form.get('name'),
      slug: form.get('slug'),
      blurb: form.get('blurb'),
      image: imageUrl,
    };
    try {
      if (initial.id) {
        await api(`/api/categories/${initial.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await api('/api/categories', { method: 'POST', body: JSON.stringify(payload) });
      }
      router.push('/admin/categories');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <AdminFormSection
        title="Category details"
        description="How this category appears on the storefront and in filters."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Name"
            name="name"
            defaultValue={initial.name}
            placeholder="Suit Sets"
            required
          />
          <Input
            label="Slug"
            name="slug"
            defaultValue={initial.slug}
            placeholder="suit-sets"
            hint="URL path — lowercase, hyphenated"
            required
          />
        </div>
        <Textarea
          label="Short blurb"
          name="blurb"
          defaultValue={initial.blurb}
          placeholder="Embroidered & festive suits"
          rows={2}
        />
        <Input label="Upload image" type="file" accept="image/*" onChange={uploadImage} />
        <Input
          label="Image URL"
          name="image"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          placeholder="https://ik.imagekit.io/..."
        />
        {imageUrl ? (
          <div className="overflow-hidden rounded-xl border border-black/8 bg-[#f3ebe3]">
            <img
              src={imageUrl}
              alt=""
              className="h-36 w-full object-cover object-top"
            />
          </div>
        ) : null}
      </AdminFormSection>

      <div className="flex flex-wrap items-center gap-3 border-t border-black/6 pt-5">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save category'}</Button>
        <Link href="/admin/categories">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}
