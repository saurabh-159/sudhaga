import { notFound, redirect } from 'next/navigation';
import LegalPage from '@/components/user/LegalPage';
import { getPublishedCustomPolicy } from '@/lib/policies';
import { SYSTEM_PATHS } from '@/lib/policyInput';
import { pageHead } from '@/lib/pageMeta';
import { metaDescription } from '@/lib/site';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  if (SYSTEM_PATHS[slug]) {
    return pageHead({
      title: 'Policy',
      description: 'Sudhaga policy page.',
      canonical: SYSTEM_PATHS[slug],
    });
  }
  try {
    const policy = await getPublishedCustomPolicy(slug);
    if (!policy) {
      return pageHead({
        title: 'Page not found',
        description: 'That page is not available at Sudhaga.',
        canonical: '/contact',
        indexable: false,
      });
    }
    return pageHead({
      title: policy.title,
      description: metaDescription(policy.summary || policy.body),
      canonical: `/policies/${policy.slug}`,
    });
  } catch {
    return pageHead({
      title: 'Page unavailable',
      description: 'This page is temporarily unavailable.',
      canonical: `/policies/${slug}`,
      indexable: false,
    });
  }
}

export default async function CustomPolicyPage({ params }) {
  const { slug } = await params;
  if (SYSTEM_PATHS[slug]) redirect(SYSTEM_PATHS[slug]);

  let policy;
  try {
    policy = await getPublishedCustomPolicy(slug);
  } catch {
    return <p className="px-4 py-16 text-center">This page is temporarily unavailable. Please try again.</p>;
  }
  if (!policy) notFound();
  return <LegalPage policy={policy} />;
}
