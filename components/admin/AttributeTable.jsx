'use client';

import Link from 'next/link';
import Button from '../ui/Button';
import { Pencil, Trash2 } from 'lucide-react';

export default function AttributeTable({ attributes = [], onDelete }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/8 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-black/6 bg-neutral-50/80 text-xs uppercase tracking-wide text-neutral-500">
          <tr>
            <th className="px-4 py-3 font-medium">Attribute</th>
            <th className="hidden px-4 py-3 font-medium sm:table-cell">Type</th>
            <th className="px-4 py-3 font-medium">Values</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {attributes.map((attr) => (
            <tr key={attr.id} className="border-t border-black/5 align-top">
              <td className="px-4 py-4">
                <p className="font-medium text-neutral-900">{attr.name}</p>
                <p className="mt-0.5 text-xs text-neutral-400">{attr.slug}</p>
              </td>
              <td className="hidden px-4 py-4 capitalize text-neutral-600 sm:table-cell">
                {attr.type}
              </td>
              <td className="px-4 py-4">
                <div className="flex max-w-md flex-wrap gap-1.5">
                  {attr.values.slice(0, 6).map((v) => (
                    <span
                      key={v}
                      className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs text-neutral-700"
                    >
                      {v}
                    </span>
                  ))}
                  {attr.values.length > 6 ? (
                    <span className="px-1 text-xs text-neutral-400">
                      +{attr.values.length - 6}
                    </span>
                  ) : null}
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex justify-end gap-2">
                  <Link href={`/admin/attributes/${attr.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete?.(attr.id)}
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
  );
}
