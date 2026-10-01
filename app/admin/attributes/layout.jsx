import { pageHead } from '@/lib/pageMeta';

export const metadata = pageHead({
  title: 'Attributes',
  description: 'Manage Sudhaga product attributes.',
  canonical: '/admin/attributes',
  indexable: false,
});

export default function Layout({ children }) {
  return children;
}
