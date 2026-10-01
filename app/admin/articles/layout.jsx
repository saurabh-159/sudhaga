import { pageHead } from '@/lib/pageMeta';

export const metadata = pageHead({
  title: 'Blog articles',
  description: 'Manage Sudhaga blog articles.',
  canonical: '/admin/articles',
  indexable: false,
});

export default function Layout({ children }) {
  return children;
}
