'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import AdminFormSection from './AdminFormSection';
import SeoFields from './SeoFields';
import { Plus, X } from 'lucide-react';
import { attributes as defaultAttributes } from '@/lib/dummyData';
import { api, shapeCategory } from '@/lib/apiClient';

function attributeBySlug(slug) {
  return defaultAttributes.find((attr) => attr.slug === slug);
}

function combinationKey(options) {
  return [...options]
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .map((option) => `${option.slug}:${option.value}`)
    .join('|');
}

function savedCombinations(attributes) {
  if (!Array.isArray(attributes)) return [];
  return attributes
    .map((row) => {
      if (Array.isArray(row?.options) && row.options.length && row.price != null) {
        const options = row.options
          .filter((option) => option?.slug && option.value != null)
          .map((option) => ({
            name: option.name || attributeBySlug(option.slug)?.name || option.slug,
            slug: option.slug,
            value: String(option.value),
          }));
        return options.length ? { price: Number(row.price), sku: row.sku || '', options } : null;
      }
      if (row?.slug && row.value != null && row.amount != null) {
        return {
          price: Number(row.amount),
          sku: row.sku || '',
          options: [
            {
              name: row.name || attributeBySlug(row.slug)?.name || row.slug,
              slug: row.slug,
              value: String(row.value),
            },
          ],
        };
      }
      return null;
    })
    .filter(Boolean);
}

function slugsFromCombinations(rows) {
  const slugs = [];
  rows.forEach((row) => {
    row.options.forEach((option) => {
      if (attributeBySlug(option.slug) && !slugs.includes(option.slug)) slugs.push(option.slug);
    });
  });
  return slugs;
}

function dedupeCombinations(rows) {
  const seen = new Set();
  return rows.filter((row) => {
    const key = combinationKey(row.options);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function combinationLabel(options) {
  return options.map((option) => `${option.name} ${option.value}`).join(' · ');
}

export default function ProductForm({ initial = {} }) {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [imageUrl, setImageUrl] = useState(initial.image || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [combinations, setCombinations] = useState(() => savedCombinations(initial.attributes));
  const [selectedSlugs, setSelectedSlugs] = useState(() =>
    slugsFromCombinations(savedCombinations(initial.attributes))
  );
  const [typeToAdd, setTypeToAdd] = useState(() => {
    const used = slugsFromCombinations(savedCombinations(initial.attributes));
    return defaultAttributes.find((attr) => !used.includes(attr.slug))?.slug || '';
  });
  const [draftValues, setDraftValues] = useState(() => {
    const draft = {};
    slugsFromCombinations(savedCombinations(initial.attributes)).forEach((slug) => {
      draft[slug] = attributeBySlug(slug)?.values?.[0] || '';
    });
    return draft;
  });
  const [comboPrice, setComboPrice] = useState('');
  const [attrError, setAttrError] = useState('');
  const [featured, setFeatured] = useState(Boolean(initial.featured));
  const [bestSeller, setBestSeller] = useState(Boolean(initial.bestSeller));

  useEffect(() => {
    api('/api/categories')
      .then((data) => setCategories((data || []).map(shapeCategory)))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!initial.id) return;
    const rows = savedCombinations(initial.attributes);
    const slugs = slugsFromCombinations(rows);
    setCombinations(rows);
    setSelectedSlugs(slugs);
    setDraftValues(() => {
      const draft = {};
      slugs.forEach((slug) => {
        draft[slug] = attributeBySlug(slug)?.values?.[0] || '';
      });
      return draft;
    });
    setTypeToAdd(defaultAttributes.find((attr) => !slugs.includes(attr.slug))?.slug || '');
    setComboPrice('');
    setAttrError('');
  }, [initial.id, initial.attributes]);

  async function uploadImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const body = new FormData();
    body.append('file', file);
    const uploaded = await api('/api/upload', { method: 'POST', body });
    setImageUrl(uploaded.url);
  }

  const availableTypes = defaultAttributes.filter((attr) => !selectedSlugs.includes(attr.slug));
  const incomplete = combinations.some((row) =>
    selectedSlugs.some((slug) => !row.options.some((option) => option.slug === slug))
  );

  const addAttributeType = () => {
    if (!typeToAdd || selectedSlugs.includes(typeToAdd)) return;
    const attr = attributeBySlug(typeToAdd);
    const nextSlugs = [...selectedSlugs, typeToAdd];
    setSelectedSlugs(nextSlugs);
    setDraftValues((prev) => ({ ...prev, [typeToAdd]: attr?.values?.[0] || '' }));
    setTypeToAdd(defaultAttributes.find((item) => !nextSlugs.includes(item.slug))?.slug || '');
    setAttrError('');
  };

  const removeAttributeType = (slug) => {
    setSelectedSlugs((prev) => prev.filter((item) => item !== slug));
    setDraftValues((prev) => {
      const next = { ...prev };
      delete next[slug];
      return next;
    });
    setCombinations((prev) =>
      dedupeCombinations(
        prev
          .map((row) => ({
            ...row,
            options: row.options.filter((option) => option.slug !== slug),
          }))
          .filter((row) => row.options.length)
      )
    );
    if (!availableTypes.some((attr) => attr.slug === typeToAdd)) setTypeToAdd(slug);
    setAttrError('');
  };

  const addCombination = () => {
    if (!selectedSlugs.length) {
      setAttrError('Choose at least one attribute first.');
      return;
    }
    const price = Number(comboPrice);
    if (comboPrice === '' || Number.isNaN(price) || price < 0) {
      setAttrError('Enter a price for this combination.');
      return;
    }
    const options = selectedSlugs.map((slug) => {
      const attr = attributeBySlug(slug);
      return {
        name: attr?.name || slug,
        slug,
        value: draftValues[slug] || attr?.values?.[0] || '',
      };
    });
    if (options.some((option) => !option.value)) {
      setAttrError('Choose a value for every attribute.');
      return;
    }
    if (combinations.some((row) => combinationKey(row.options) === combinationKey(options))) {
      setAttrError('This combination is already added.');
      return;
    }
    setCombinations((prev) => [...prev, { price, options }]);
    setComboPrice('');
    setAttrError('');
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);
    if (incomplete) {
      setError('Some combinations are missing an attribute you added. Remove those rows and add them again.');
      setSaving(false);
      return;
    }
    const form = new FormData(event.currentTarget);
    const original = form.get('originalPrice');
    const payload = {
      name: form.get('name'),
      description: form.get('description') || '',
      seoTitle: form.get('seoTitle') || '',
      metaDescription: form.get('metaDescription') || '',
      focusKeyword: form.get('focusKeyword') || '',
      imageAlt: form.get('imageAlt') || '',
      price: Number(form.get('price')),
      stock: Number(form.get('stock') || 0),
      category: form.get('category'),
      image: imageUrl,
      featured,
      bestSeller,
      attributes: combinations.map((row) => ({
        sku: row.sku || '',
        price: row.price,
        options: row.options.map(({ name, slug, value }) => ({ name, slug, value })),
      })),
      ...(original ? { originalPrice: Number(original) } : {}),
    };
    try {
      if (initial.id) {
        await api(`/api/products/${initial.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await api('/api/products', { method: 'POST', body: JSON.stringify(payload) });
      }
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AdminFormSection title="Basic details" description="Name, pricing, and how this piece appears in the store.">
        <Input label="Product name" name="name" defaultValue={initial.name} placeholder="e.g. Priya Orange Embroidered Suit Set" hint="SEO task 4. This is the heading shoppers see on the product page." required />
        <Textarea label="Description" name="description" defaultValue={initial.description} placeholder="Short description for the product page…" rows={4} hint="SEO task 4. Visible text on the product page. Used as the Google description when the search description below is empty." />
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            key={categories.map((c) => c.id).join(',') || 'empty'}
            label="Category"
            name="category"
            defaultValue={initial.categoryId || categories[0]?.id}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            required
          />
          <Select
            label="Status"
            name="status"
            defaultValue={initial.status || 'published'}
            options={[
              { value: 'published', label: 'Published' },
              { value: 'draft', label: 'Draft' },
              { value: 'archived', label: 'Archived' },
            ]}
          />
        </div>
      </AdminFormSection>

      <SeoFields initial={initial} url={initial.slug ? `/products/${initial.slug}` : ''} />

      <AdminFormSection title="Pricing & inventory" description="Set selling price, compare-at price, and available stock. Stock 0 keeps the page online and shows Out of stock.">
        <div className="grid gap-4 md:grid-cols-3">
          <Input label="Price (₹)" name="price" type="number" min="0" defaultValue={initial.price} placeholder="5499" required />
          <Input label="Original price (₹)" name="originalPrice" type="number" min="0" defaultValue={initial.originalPrice} placeholder="7999" hint="Shown as struck-through MRP" />
          <Input label="Stock" name="stock" type="number" min="0" defaultValue={initial.stock} placeholder="12" required />
        </div>
        <p className="text-sm text-neutral-600">
          {initial.sku ? (
            <>
              Product SKU <span className="font-medium text-neutral-900">{initial.sku}</span>
            </>
          ) : (
            'A unique product SKU is created when you save. Colour and size combinations get their own SKUs.'
          )}
        </p>
      </AdminFormSection>

      <AdminFormSection
        title="Homepage"
        description="Choose where this product appears on the store homepage. New arrivals follow the latest products automatically."
      >
        <label className="flex items-center gap-3 text-sm text-neutral-800">
          <input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} className="h-4 w-4 rounded border-neutral-300" />
          Featured products
        </label>
        <label className="flex items-center gap-3 text-sm text-neutral-800">
          <input type="checkbox" checked={bestSeller} onChange={(event) => setBestSeller(event.target.checked)} className="h-4 w-4 rounded border-neutral-300" />
          Best sellers
        </label>
      </AdminFormSection>

      <AdminFormSection title="Media" description="Primary product image. Use a clear full-length shot when possible.">
        <Input label="Upload image" name="file" type="file" accept="image/*" onChange={uploadImage} />
        <Input label="Image URL" name="image" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://ik.imagekit.io/..." />
        {imageUrl ? (
          <div className="overflow-hidden rounded-xl border border-black/8 bg-[#f3ebe3]">
            <img src={imageUrl} alt="" className="h-40 w-full object-cover object-top md:h-52" />
          </div>
        ) : null}
      </AdminFormSection>

      <AdminFormSection
        title="Attributes"
        description="Each colour, size, and other combination gets its own SKU. That SKU is saved on the order, so you can see exactly which dress was bought."
      >
        {availableTypes.length > 0 ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <Select
                label="Attribute"
                value={typeToAdd}
                onChange={(event) => {
                  setTypeToAdd(event.target.value);
                  setAttrError('');
                }}
                options={availableTypes.map((attr) => ({ value: attr.slug, label: attr.name }))}
              />
            </div>
            <Button type="button" variant="outline" onClick={addAttributeType}>
              <Plus className="h-4 w-4" />
              Add attribute
            </Button>
          </div>
        ) : (
          <p className="text-sm text-neutral-500">All attributes are added.</p>
        )}

        {selectedSlugs.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-500">
            Add attributes such as Size and Color, then build combinations.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedSlugs.map((slug) => {
              const attr = attributeBySlug(slug);
              return (
                <span key={slug} className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm text-neutral-800">
                  {attr?.name || slug}
                  <button type="button" onClick={() => removeAttributeType(slug)} className="rounded p-0.5 text-neutral-400 transition hover:bg-white hover:text-neutral-900" aria-label={`Remove ${attr?.name || slug}`}>
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {selectedSlugs.length > 0 ? (
          <div className="space-y-4 rounded-xl border border-black/8 bg-neutral-50/70 p-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {selectedSlugs.map((slug) => {
                const attr = attributeBySlug(slug);
                return (
                  <Select
                    key={slug}
                    label={attr?.name || slug}
                    value={draftValues[slug] || ''}
                    onChange={(event) => {
                      setDraftValues((prev) => ({ ...prev, [slug]: event.target.value }));
                      setAttrError('');
                    }}
                    options={(attr?.values || []).map((value) => ({ value, label: value }))}
                  />
                );
              })}
              <Input
                label="Price (₹)"
                type="number"
                min="0"
                value={comboPrice}
                onChange={(event) => {
                  setComboPrice(event.target.value);
                  setAttrError('');
                }}
                placeholder="300"
              />
            </div>
            <Button type="button" variant="outline" onClick={addCombination}>
              <Plus className="h-4 w-4" />
              Add combination
            </Button>
          </div>
        ) : null}

        {attrError ? <p className="text-sm text-red-600">{attrError}</p> : null}
        {incomplete ? (
          <p className="text-sm text-amber-700">
            Some combinations are missing an attribute you added. Remove those rows and add them again.
          </p>
        ) : null}

        {combinations.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-8 text-center text-sm text-neutral-500">
            No combinations yet. Example: Size L · Color Red — ₹300.
          </p>
        ) : (
          <ul className="divide-y divide-black/6 overflow-hidden rounded-xl border border-black/8">
            {combinations.map((row, index) => (
              <li key={`${combinationKey(row.options)}-${row.price}`} className="flex items-center justify-between gap-3 bg-white px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900">{combinationLabel(row.options)}</p>
                  <p className="text-xs text-neutral-500">
                    ₹{row.price.toLocaleString('en-IN')}
                    {row.sku ? ` · SKU ${row.sku}` : ' · SKU is created when you save'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCombinations((prev) => prev.filter((_, i) => i !== index))}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
                  aria-label={`Remove ${combinationLabel(row.options)}`}
                >
                  <X className="h-3.5 w-3.5" />
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-neutral-500">
          Attribute options come from{' '}
          <Link href="/admin/attributes" className="font-medium text-neutral-900 underline-offset-2 hover:underline">
            Attributes
          </Link>
          .
        </p>
      </AdminFormSection>

      <div className="flex flex-wrap items-center gap-3 border-t border-black/6 pt-5">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save product'}</Button>
        <Link href="/admin/products">
          <Button type="button" variant="outline">Cancel</Button>
        </Link>
      </div>
    </form>
  );
}
