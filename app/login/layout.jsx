import { pageHead } from '@/lib/pageMeta';

export const metadata = pageHead({
  title: 'Login',
  description: 'Sign in to the Sudhaga admin.',
  canonical: '/login',
  indexable: false,
});

export default function LoginLayout({ children }) {
  return children;
}
