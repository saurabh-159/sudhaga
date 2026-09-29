'use client';

import { useEffect, useState } from 'react';
import UserTable from '@/components/admin/UserTable';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { api, shapeUser } from '@/lib/apiClient';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api('/api/users')
      .then((data) => setUsers((data || []).map(shapeUser)))
      .catch(() => setUsers([]));
  }, []);

  return (
    <div>
      <AdminPageHeader title="Users" description="Customers and admin accounts." />
      <UserTable users={users} />
    </div>
  );
}
