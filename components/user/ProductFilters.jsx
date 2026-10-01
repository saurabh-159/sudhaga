'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, SlidersHorizontal, X } from 'lucide-react';
import { lockBodyScroll } from '@/lib/scrollLock';
import {
  SORT_OPTIONS,
  activeFilterCount,
  clearedFilters,
  listingHref,
  priceSelectionLabel,
} from '@/lib/listingQuery';

const COLOR_HEX = {
  black: '#1c1917',
  white: '#f7f4ef',
  red: '#9b2335',
  pink: '#e7a3b5',
  orange: '#e07a3d',
  purple: '#6b4c7a',
  blue: '#3d5a80',
  green: '#3f6b4d',
  beige: '#d9c7ae',
  gold: '#c4a35a',
  maroon: '#6e2430',
  yellow: '#e3c15a',
  brown: '#7a5340',
  grey: '#8a8680',
  gray: '#8a8680',
  navy: '#1e2a4a',
  cream: '#f3eadb',
  ivory: '#f6f1e7',
};

function groupTitle(group) {
  if (group.name && group.name.toLowerCase() !== group.slug) return group.name;
  return group.slug.charAt(0).toUpperCase() + group.slug.slice(1);
}

function withAttr(filters, slug, value) {
  const current = filters.attrs[slug] || [];
  const nextValues = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
  const attrs = { ...filters.attrs };
  if (nextValues.length) attrs[slug] = nextValues;
  else delete attrs[slug];
  return { ...filters, attrs };
}

function FilterPanel({ pathname, filters, facets, showCategories, onNavigate }) {
  const router = useRouter();
  const [minDraft, setMinDraft] = useState(filters.min ?? '');
  const [maxDraft, setMaxDraft] = useState(filters.max ?? '');
  const [expanded, setExpanded] = useState({});
  const clearHref = listingHref(pathname, clearedFilters(filters));
  const active = activeFilterCount(filters);

  useEffect(() => {
    setMinDraft(filters.min ?? '');
    setMaxDraft(filters.max ?? '');
  }, [filters.min, filters.max]);

  const go = (next) => {
    onNavigate?.();
    router.push(listingHref(pathname, next), { scroll: false });
  };

  const submitPrice = (event) => {
    event.preventDefault();
    const min = String(minDraft).trim() === '' ? null : Math.round(Number(minDraft));
    const max = String(maxDraft).trim() === '' ? null : Math.round(Number(maxDraft));
    go({
      ...filters,
      min: Number.isFinite(min) && min >= 0 ? min : null,
      max: Number.isFinite(max) && max >= 0 ? max : null,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 border-b border-black/[0.06] pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Filters</p>
        {active > 0 ? (
          <Link href={clearHref} scroll={false} onClick={onNavigate} className="text-xs font-medium text-neutral-500 underline-offset-2 hover:text-neutral-950 hover:underline">
            Clear all
          </Link>
        ) : null}
      </div>

      {showCategories && facets.categories.length > 0 ? (
        <fieldset className="border-b border-black/[0.06] py-5">
          <legend className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Category</legend>
          <div className="space-y-1">
            {facets.categories.map((category) => {
              const on = filters.categories.includes(category.slug);
              const categories = on
                ? filters.categories.filter((slug) => slug !== category.slug)
                : [...filters.categories, category.slug];
              return (
                <Link
                  key={category.slug}
                  href={listingHref(pathname, { ...filters, categories })}
                  scroll={false}
                  onClick={onNavigate}
                  className="flex items-center justify-between gap-3 rounded-lg py-1.5 text-sm text-neutral-800 hover:text-neutral-950"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${on ? 'border-neutral-950 bg-neutral-950 text-white' : 'border-neutral-300 bg-white'}`}>
                      {on ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                    </span>
                    <span className="truncate">{category.name}</span>
                  </span>
                  <span className="text-xs tabular-nums text-neutral-400">{category.count}</span>
                </Link>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {facets.priceRanges.length > 0 ? (
        <fieldset className="border-b border-black/[0.06] py-5">
          <legend className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Price</legend>
          <div className="space-y-1">
            {facets.priceRanges.map((range) => {
              const on = range.min === filters.min && range.max === filters.max;
              const next = on ? { ...filters, min: null, max: null } : { ...filters, min: range.min, max: range.max };
              return (
                <Link
                  key={range.id}
                  href={listingHref(pathname, next)}
                  scroll={false}
                  onClick={onNavigate}
                  className="flex items-center justify-between gap-3 rounded-lg py-1.5 text-sm text-neutral-800 hover:text-neutral-950"
                >
                  <span className="flex items-center gap-2.5">
                    <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${on ? 'border-neutral-950' : 'border-neutral-300'}`}>
                      {on ? <span className="h-2 w-2 rounded-full bg-neutral-950" /> : null}
                    </span>
                    {range.label}
                  </span>
                  <span className="text-xs tabular-nums text-neutral-400">{range.count}</span>
                </Link>
              );
            })}
          </div>
          <form onSubmit={submitPrice} className="mt-4 flex items-center gap-2">
            <input
              inputMode="numeric"
              aria-label="Minimum price"
              placeholder="Min"
              value={minDraft}
              onChange={(event) => setMinDraft(event.target.value.replace(/[^\d]/g, ''))}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-950"
            />
            <span className="text-neutral-300">–</span>
            <input
              inputMode="numeric"
              aria-label="Maximum price"
              placeholder="Max"
              value={maxDraft}
              onChange={(event) => setMaxDraft(event.target.value.replace(/[^\d]/g, ''))}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-950"
            />
            <button type="submit" className="shrink-0 rounded-lg bg-neutral-950 px-3 py-2 text-xs font-semibold text-white">
              Go
            </button>
          </form>
        </fieldset>
      ) : null}

      {facets.attributes.map((group) => {
        const title = groupTitle(group);
        const selected = filters.attrs[group.slug] || [];
        const open = expanded[group.slug];
        const options = open ? group.options : group.options.slice(0, 6);
        const isSize = group.slug === 'size';
        const isColor = group.slug === 'color' || group.slug === 'colour';
        return (
          <fieldset key={group.slug} className="border-b border-black/[0.06] py-5">
            <legend className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">{title}</legend>
            {isSize ? (
              <div className="flex flex-wrap gap-2">
                {options.map((option) => {
                  const on = selected.includes(option.value);
                  return (
                    <Link
                      key={option.value}
                      href={listingHref(pathname, withAttr(filters, group.slug, option.value))}
                      scroll={false}
                      onClick={onNavigate}
                      aria-pressed={on}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                        on ? 'border-neutral-950 bg-neutral-950 text-white' : 'border-black/10 bg-white text-neutral-700 hover:border-neutral-400'
                      }`}
                    >
                      {option.value}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-1">
                {options.map((option) => {
                  const on = selected.includes(option.value);
                  const hex = isColor ? COLOR_HEX[option.value.toLowerCase()] : null;
                  return (
                    <Link
                      key={option.value}
                      href={listingHref(pathname, withAttr(filters, group.slug, option.value))}
                      scroll={false}
                      onClick={onNavigate}
                      className="flex items-center justify-between gap-3 rounded-lg py-1.5 text-sm text-neutral-800 hover:text-neutral-950"
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        {isColor ? (
                          <span
                            className={`h-4 w-4 shrink-0 rounded-full border ${on ? 'ring-2 ring-neutral-950 ring-offset-2' : 'border-black/10'}`}
                            style={{ backgroundColor: hex || '#e7e0d8' }}
                          />
                        ) : (
                          <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${on ? 'border-neutral-950 bg-neutral-950 text-white' : 'border-neutral-300 bg-white'}`}>
                            {on ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                          </span>
                        )}
                        <span className="truncate">{option.value}</span>
                      </span>
                      <span className="text-xs tabular-nums text-neutral-400">{option.count}</span>
                    </Link>
                  );
                })}
              </div>
            )}
            {group.options.length > 6 ? (
              <button
                type="button"
                onClick={() => setExpanded((prev) => ({ ...prev, [group.slug]: !prev[group.slug] }))}
                className="mt-2 text-xs font-medium text-neutral-500 underline-offset-2 hover:text-neutral-950 hover:underline"
              >
                {open ? 'Show less' : `Show all ${group.options.length}`}
              </button>
            ) : null}
          </fieldset>
        );
      })}

      {facets.inStock > 0 || facets.onSale > 0 ? (
        <fieldset className="py-5">
          <legend className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Availability</legend>
          <div className="space-y-1">
            {facets.inStock > 0 ? (
              <Link
                href={listingHref(pathname, { ...filters, inStock: !filters.inStock })}
                scroll={false}
                onClick={onNavigate}
                className="flex items-center justify-between gap-3 rounded-lg py-1.5 text-sm text-neutral-800 hover:text-neutral-950"
              >
                <span className="flex items-center gap-2.5">
                  <span className={`flex h-4 w-4 items-center justify-center rounded border ${filters.inStock ? 'border-neutral-950 bg-neutral-950 text-white' : 'border-neutral-300 bg-white'}`}>
                    {filters.inStock ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                  </span>
                  In stock
                </span>
                <span className="text-xs tabular-nums text-neutral-400">{facets.inStock}</span>
              </Link>
            ) : null}
            {facets.onSale > 0 ? (
              <Link
                href={listingHref(pathname, { ...filters, onSale: !filters.onSale })}
                scroll={false}
                onClick={onNavigate}
                className="flex items-center justify-between gap-3 rounded-lg py-1.5 text-sm text-neutral-800 hover:text-neutral-950"
              >
                <span className="flex items-center gap-2.5">
                  <span className={`flex h-4 w-4 items-center justify-center rounded border ${filters.onSale ? 'border-neutral-950 bg-neutral-950 text-white' : 'border-neutral-300 bg-white'}`}>
                    {filters.onSale ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                  </span>
                  On sale
                </span>
                <span className="text-xs tabular-nums text-neutral-400">{facets.onSale}</span>
              </Link>
            ) : null}
          </div>
        </fieldset>
      ) : null}
    </div>
  );
}

function chipsFor(filters, facets) {
  const chips = [];
  for (const slug of filters.categories) {
    const category = facets.categories.find((item) => item.slug === slug);
    chips.push({
      key: `category:${slug}`,
      label: category?.name || slug,
      next: { ...filters, categories: filters.categories.filter((item) => item !== slug) },
    });
  }
  if (filters.min != null || filters.max != null) {
    chips.push({
      key: 'price',
      label: priceSelectionLabel(filters.min, filters.max),
      next: { ...filters, min: null, max: null },
    });
  }
  if (filters.inStock) {
    chips.push({ key: 'stock', label: 'In stock', next: { ...filters, inStock: false } });
  }
  if (filters.onSale) {
    chips.push({ key: 'sale', label: 'On sale', next: { ...filters, onSale: false } });
  }
  for (const [slug, values] of Object.entries(filters.attrs || {})) {
    for (const value of values) {
      chips.push({
        key: `${slug}:${value}`,
        label: value,
        next: withAttr(filters, slug, value),
      });
    }
  }
  if (filters.sort && filters.sort !== 'newest') {
    const option = SORT_OPTIONS.find((item) => item.id === filters.sort);
    chips.push({ key: 'sort', label: option?.label || 'Sorted', next: { ...filters, sort: 'newest' } });
  }
  return chips;
}

export default function ProductFilters({ pathname, filters, facets, total, showCategories = false, children }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const active = activeFilterCount(filters);
  const chips = chipsFor(filters, facets);
  const clearHref = listingHref(pathname, clearedFilters(filters));

  useEffect(() => {
    if (!open) return undefined;
    const unlock = lockBodyScroll();
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      unlock();
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const panelProps = { pathname, filters, facets, showCategories, onNavigate: () => setOpen(false) };

  return (
    <div className="lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:items-start lg:gap-10">
      <aside className="sticky top-[7.75rem] hidden max-h-[calc(100vh-8.5rem)] overflow-y-auto lg:block">
        <FilterPanel {...panelProps} onNavigate={undefined} />
      </aside>

      <div className="min-w-0">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-neutral-500">
            Showing <span className="font-semibold text-neutral-950">{total}</span>{' '}
            {total === 1 ? 'piece' : 'pieces'}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-neutral-800 lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filter
              {active > 0 ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-950 px-1.5 text-[10px] font-semibold text-white">
                  {active}
                </span>
              ) : null}
            </button>
            <div className="relative">
              <select
                aria-label="Sort products"
                value={filters.sort || 'newest'}
                onChange={(event) =>
                  router.push(listingHref(pathname, { ...filters, sort: event.target.value }), { scroll: false })
                }
                className="appearance-none rounded-full border border-black/10 bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-neutral-800 outline-none"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {chips.length > 0 ? (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
              <Link
                key={chip.key}
                href={listingHref(pathname, chip.next)}
                scroll={false}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#f3ebe3] px-3 py-1.5 text-xs font-medium text-neutral-800 hover:bg-[#eadfce]"
              >
                {chip.label}
                <X className="h-3 w-3" />
              </Link>
            ))}
            <Link href={clearHref} scroll={false} className="text-xs font-medium text-neutral-500 underline-offset-2 hover:text-neutral-950 hover:underline">
              Clear all
            </Link>
          </div>
        ) : null}

        {children}
      </div>

      <div className={`fixed inset-0 z-[60] lg:hidden ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
        <button
          type="button"
          aria-label="Close filters"
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
          className={`absolute inset-y-0 left-0 flex w-[min(100%,22rem)] flex-col bg-white shadow-2xl transition-transform duration-200 ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">
            <p className="text-sm font-semibold text-neutral-950">Filter</p>
            <button type="button" aria-label="Close filters" onClick={() => setOpen(false)} className="rounded-full p-1 text-neutral-500 hover:text-neutral-950">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 pb-4">
            <FilterPanel {...panelProps} />
          </div>
          <div className="border-t border-black/[0.06] p-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full rounded-full bg-neutral-950 py-3 text-sm font-semibold text-white"
            >
              Show {total} {total === 1 ? 'piece' : 'pieces'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
