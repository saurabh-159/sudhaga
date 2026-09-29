'use client';

import Link from 'next/link';
import Button from '../ui/Button';
import { Pencil, Trash2 } from 'lucide-react';

export default function TestimonialTable({ reviews = [], onDelete }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/8 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/6 bg-neutral-50/80 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Rating</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">
                  No reviews yet.
                </td>
              </tr>
            ) : null}
            {reviews.map((review) => (
              <tr key={review.id} className="border-t border-black/5">
                <td className="px-4 py-3">
                  <p className="font-medium text-neutral-950">{review.name}</p>
                  <p className="mt-0.5 max-w-md truncate text-xs text-neutral-500">{review.text}</p>
                </td>
                <td className="hidden px-4 py-3 text-neutral-700 sm:table-cell">{review.rating}/5</td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <span className={review.active ? 'text-emerald-700' : 'text-neutral-400'}>
                    {review.active ? 'Visible' : 'Hidden'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/testimonials/${review.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                    </Link>
                    <Button variant="danger" size="sm" onClick={() => onDelete?.(review.id)}>
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
