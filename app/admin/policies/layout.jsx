import { pageHead } from '@/lib/pageMeta';

export const metadata = pageHead({
  title: 'Policies',
  description: 'Manage Sudhaga contact details and policy pages.',
  canonical: '/admin/policies',
  indexable: false,
});

export default function Layout({ children }) {
  return children;
}
