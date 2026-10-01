import { pageHead } from '@/lib/pageMeta';

export const metadata = pageHead({
  title: 'Account',
  description: 'Your Sudhaga account.',
  canonical: '/account',
  indexable: false,
});

export default function AccountLayout({ children }) {
  return children;
}
