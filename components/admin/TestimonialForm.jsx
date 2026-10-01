'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import AdminFormSection from './AdminFormSection';
import { api } from '@/lib/apiClient';

export default function TestimonialForm({ initial = {} }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [active, setActive] = useState(initial.active !== false);
  const [avatar, setAvatar] = useState(initial.avatar || '');

  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const body = new FormData();
    body.append('file', file);
    const uploaded = await api('/api/upload', { method: 'POST', body });
    setAvatar(uploaded.url);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const payload = {
      name: form.get('name'),
      role: form.get('role'),
      location: form.get('location'),
      rating: Number(form.get('rating')),
      text: form.get('text'),
      order: form.get('order') || 0,
      avatar,
      active,
    };
    try {
      if (initial._id || initial.id) {
        await api(`/api/testimonials/${initial._id || initial.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await api('/api/testimonials', { method: 'POST', body: JSON.stringify(payload) });
      }
      router.push('/admin/testimonials');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AdminFormSection title="Customer review" description="Active reviews appear in the homepage carousel.">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Name" name="name" defaultValue={initial.name} required />
          <Input label="Role" name="role" defaultValue={initial.role} />
          <Input label="City" name="location" defaultValue={initial.location} />
          <Input label="Rating" name="rating" type="number" min="1" max="5" defaultValue={initial.rating || 5} required />
          <Input label="Sort order" name="order" type="number" defaultValue={initial.order ?? 0} />
        </div>
        <Textarea label="Review" name="text" defaultValue={initial.text} rows={4} required hint="SEO task 14. Only a real customer review. Do not invent ratings or quotes." />
        <label className="flex items-center gap-3 text-sm text-neutral-800">
          <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} className="h-4 w-4" />
          Show on homepage
        </label>
      </AdminFormSection>

      <AdminFormSection title="Photo" description="Optional portrait. A URL or upload both work.">
        <Input label="Upload photo" type="file" accept="image/*" onChange={upload} />
        <Input label="Photo URL" value={avatar} onChange={(event) => setAvatar(event.target.value)} />
        {avatar ? <img src={avatar} alt="" className="h-16 w-16 rounded-full object-cover" /> : null}
      </AdminFormSection>

      <div className="flex flex-wrap items-center gap-3 border-t border-black/6 pt-5">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save review'}</Button>
        <Link href="/admin/testimonials">
          <Button type="button" variant="outline">Cancel</Button>
        </Link>
      </div>
    </form>
  );
}
