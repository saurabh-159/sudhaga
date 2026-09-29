'use client';

import Link from 'next/link';
import Button from '../ui/Button';
import { Pencil, Trash2 } from 'lucide-react';

const LABELS = {
  hero: 'Hero',
  promo: 'Promo',
  'deal-side': 'Deal side',
  'deal-center': 'Deal center',
};

export default function BannerTable({ banners = [], onDelete }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/8 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/6 bg-neutral-50/80 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Banner</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Placement</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Link</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {banners.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">
                  No homepage banners yet.
                </td>
              </tr>
            ) : null}
            {banners.map((banner) => (
              <tr key={banner.id} className="border-t border-black/5">
                <td className="px-4 py-3">
                  <p className="font-medium text-neutral-950">{banner.title}</p>
                  <p className="mt-0.5 text-xs text-neutral-500 sm:hidden">{LABELS[banner.placement] || banner.placement}</p>
                </td>
                <td className="hidden px-4 py-3 text-neutral-700 sm:table-cell">{LABELS[banner.placement] || banner.placement}</td>
                <td className="hidden px-4 py-3 text-neutral-700 md:table-cell">{banner.href}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/banners/${banner.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                    </Link>
                    <Button variant="danger" size="sm" onClick={() => onDelete?.(banner.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
