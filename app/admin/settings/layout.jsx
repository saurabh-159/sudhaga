import { pageHead } from '@/lib/pageMeta';

export const metadata = pageHead({
  title: 'Settings',
  description: 'Sudhaga store settings.',
  canonical: '/admin/settings',
  indexable: false,
});

export default function Layout({ children }) {
  return children;
}
