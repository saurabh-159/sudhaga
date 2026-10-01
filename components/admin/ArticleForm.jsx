'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import AdminFormSection from './AdminFormSection';
import { api } from '@/lib/apiClient';

function linksToText(links = []) {
  return links.map((link) => `${link.label} | ${link.href}`).join('\n');
}

export default function ArticleForm({ initial = {} }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [published, setPublished] = useState(initial.published !== false);
  const [image, setImage] = useState(initial.image || '');

  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const body = new FormData();
    body.append('file', file);
    const uploaded = await api('/api/upload', { method: 'POST', body });
    setImage(uploaded.url);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const payload = {
      title: form.get('title'),
      slug: form.get('slug'),
      excerpt: form.get('excerpt'),
      body: form.get('body'),
      image,
      imageAlt: form.get('imageAlt'),
      focusKeyword: form.get('focusKeyword'),
      seoTitle: form.get('seoTitle'),
      metaDescription: form.get('metaDescription'),
      links: form.get('links'),
      published,
    };
    try {
      if (initial._id || initial.id) {
        await api(`/api/articles/${initial._id || initial.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await api('/api/articles', { method: 'POST', body: JSON.stringify(payload) });
      }
      router.push('/admin/articles');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const liveSlug = initial.slug ? `/blog/${initial.slug}` : '';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AdminFormSection
        title="Article"
        description="Page-level finding: /blog/[slug]. Published articles are server-rendered, with a title, schema, and links into the shop."
      >
        <Input label="Title" name="title" defaultValue={initial.title} required />
        <Input
          label="URL slug"
          name="slug"
          defaultValue={initial.slug}
          placeholder="how-to-choose-a-suit-set"
          hint={liveSlug ? `Live URL: ${liveSlug}` : 'Leave blank to build the URL from the title.'}
        />
        <Textarea label="Short intro" name="excerpt" defaultValue={initial.excerpt} rows={2} />
        <Textarea label="Article" name="body" defaultValue={initial.body} rows={10} required hint="Separate paragraphs with a blank line." />
        <label className="flex items-center gap-3 text-sm text-neutral-800">
          <input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} className="h-4 w-4" />
          Publish on the site
        </label>
      </AdminFormSection>

      <AdminFormSection title="Links inside the article" description="One internal link per line: label, a pipe, then a site path.">
        <Textarea
          label="Shop links"
          name="links"
          defaultValue={linksToText(initial.links)}
          rows={4}
          placeholder={'Shop suit sets | /categories/suit-sets\nShipping | /shipping'}
          hint="These become crawlable links on the article. Use paths that start with /."
        />
      </AdminFormSection>

      <AdminFormSection title="Search result" description="Optional. Leave blank to use the title and intro in Google.">
        <Input label="Focus keyword" name="focusKeyword" defaultValue={initial.focusKeyword} />
        <Input label="Google title" name="seoTitle" defaultValue={initial.seoTitle} />
        <Textarea label="Google description" name="metaDescription" defaultValue={initial.metaDescription} rows={3} />
        <Input label="Image alt text" name="imageAlt" defaultValue={initial.imageAlt} />
      </AdminFormSection>

      <AdminFormSection title="Photo" description="Optional image at the top of the article.">
        <Input label="Upload photo" type="file" accept="image/*" onChange={upload} />
        <Input label="Photo URL" value={image} onChange={(event) => setImage(event.target.value)} />
      </AdminFormSection>

      <div className="flex flex-wrap items-center gap-3 border-t border-black/6 pt-5">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save article'}</Button>
        <Link href="/admin/articles">
          <Button type="button" variant="outline">Cancel</Button>
        </Link>
      </div>
    </form>
  );
}
