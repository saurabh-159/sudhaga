import { pageHead } from '@/lib/pageMeta';

export const metadata = pageHead({
  title: 'Homepage',
  description: 'Manage Sudhaga homepage banners.',
  canonical: '/admin/banners',
  indexable: false,
});

export default function Layout({ children }) {
  return children;
}
