import LegalPage from '@/components/user/LegalPage';
import { loadPublicPolicy } from '@/lib/policies';
import { pageHead } from '@/lib/pageMeta';
import { metaDescription } from '@/lib/site';

export async function generateMetadata() {
  const policy = await loadPublicPolicy('privacy');
  return pageHead({
    title: policy?.title || 'Privacy policy',
    description: metaDescription(policy?.summary || policy?.body, 'How Sudhaga handles personal information.'),
    canonical: '/privacy',
  });
}

export default async function PrivacyPage() {
  const policy = await loadPublicPolicy('privacy');
  return <LegalPage policy={policy} />;
}
