import AdminShell from '@/components/admin/AdminShell';
import { pageHead } from '@/lib/pageMeta';

export const metadata = pageHead({
  title: 'Admin',
  description: 'Sudhaga store admin.',
  canonical: '/admin',
  indexable: false,
});

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
