import { pageHead } from '@/lib/pageMeta';

export const metadata = pageHead({
  title: 'Coupons',
  description: 'Manage Sudhaga coupons.',
  canonical: '/admin/coupons',
  indexable: false,
});

export default function Layout({ children }) {
  return children;
}
