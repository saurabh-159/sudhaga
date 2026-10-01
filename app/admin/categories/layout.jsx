import { pageHead } from '@/lib/pageMeta';

export const metadata = pageHead({
  title: 'Categories',
  description: 'Manage Sudhaga categories.',
  canonical: '/admin/categories',
  indexable: false,
});

export default function Layout({ children }) {
  return children;
}
