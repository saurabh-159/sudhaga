import Link from 'next/link';

const statusStyles = {
  Delivered: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Shipped: 'bg-sky-50 text-sky-800 border-sky-200',
  Pending: 'bg-amber-50 text-amber-800 border-amber-200',
};

export default function OrderTable({ orders = [] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/8 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/6 bg-neutral-50/80 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Items</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-black/5">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="font-medium text-neutral-900 underline-offset-2 hover:underline"
                  >
                    {o.id}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-600">{o.date}</td>
                <td className="hidden px-4 py-3 text-neutral-600 sm:table-cell">{o.items}</td>
                <td className="px-4 py-3 text-neutral-800">
                  ₹{o.total.toLocaleString('en-IN')}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      statusStyles[o.status] || 'border-neutral-200 bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
