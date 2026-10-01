import { pageHead } from '@/lib/pageMeta';

export const metadata = pageHead({
  title: 'Orders',
  description: 'Manage Sudhaga orders.',
  canonical: '/admin/orders',
  indexable: false,
});

export default function Layout({ children }) {
  return children;
}
