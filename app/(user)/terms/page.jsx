import LegalPage from '@/components/user/LegalPage';
import { loadPublicPolicy } from '@/lib/policies';
import { pageHead } from '@/lib/pageMeta';
import { metaDescription } from '@/lib/site';

export async function generateMetadata() {
  const policy = await loadPublicPolicy('terms');
  return pageHead({
    title: policy?.title || 'Terms and conditions',
    description: metaDescription(policy?.summary || policy?.body, 'Terms for shopping at Sudhaga.'),
    canonical: '/terms',
  });
}

export default async function TermsPage() {
  const policy = await loadPublicPolicy('terms');
  return <LegalPage policy={policy} />;
}
