import { pageHead } from '@/lib/pageMeta';

export const metadata = pageHead({
  title: 'Reviews',
  description: 'Manage Sudhaga homepage reviews.',
  canonical: '/admin/testimonials',
  indexable: false,
});

export default function Layout({ children }) {
  return children;
}
