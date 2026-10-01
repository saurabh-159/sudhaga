'use client';

import Button from '../ui/Button';
import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';

export default function CategoryTable({ categories = [], onDelete }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/8 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/6 bg-neutral-50/80 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Slug</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Blurb</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t border-black/5">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={c.image}
                      alt=""
                      className="h-12 w-12 rounded-lg object-cover object-top ring-1 ring-black/5"
                    />
                    <span className="font-medium text-neutral-900">{c.name}</span>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-neutral-500 sm:table-cell">{c.slug}</td>
                <td className="hidden max-w-xs truncate px-4 py-3 text-neutral-600 md:table-cell">
                  {c.blurb}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/categories/${c.id}/edit`}>
                      <Button type="button" variant="outline" size="sm">
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onDelete?.(c.id)}
                    >
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
