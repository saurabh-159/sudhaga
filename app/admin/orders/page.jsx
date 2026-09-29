'use client';

import { useEffect, useState } from 'react';
import OrderTable from '@/components/admin/OrderTable';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { api, shapeOrder } from '@/lib/apiClient';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api('/api/orders')
      .then((data) =>
        setOrders(
          (data || []).map((order) => {
            const shaped = shapeOrder(order);
            return { ...shaped, items: shaped.itemCount };
          })
        )
      )
      .catch(() => setOrders([]));
  }, []);

  return (
    <div>
      <AdminPageHeader title="Orders" description="Track and fulfill customer orders." />
      <OrderTable orders={orders} />
    </div>
  );
}
