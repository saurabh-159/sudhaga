import { pageHead } from '@/lib/pageMeta';

export const metadata = pageHead({
  title: 'Products',
  description: 'Manage Sudhaga products.',
  canonical: '/admin/products',
  indexable: false,
});

export default function Layout({ children }) {
  return children;
}
