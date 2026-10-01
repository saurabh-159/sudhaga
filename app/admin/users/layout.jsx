import { pageHead } from '@/lib/pageMeta';

export const metadata = pageHead({
  title: 'Users',
  description: 'Manage Sudhaga users.',
  canonical: '/admin/users',
  indexable: false,
});

export default function Layout({ children }) {
  return children;
}
