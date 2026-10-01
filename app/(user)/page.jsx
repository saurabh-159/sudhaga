import HeroBanner from '@/components/user/home/HeroBanner';
import CategoryShowcase from '@/components/user/home/CategoryShowcase';
import PromoBanner from '@/components/user/home/PromoBanner';
import FeaturedProducts from '@/components/user/home/FeaturedProducts';
import DealOfTheDay from '@/components/user/home/DealOfTheDay';
import BestSellers from '@/components/user/home/BestSellers';
import NewArrivals from '@/components/user/home/NewArrivals';
import TrustBar from '@/components/user/home/TrustBar';
import Testimonials from '@/components/user/home/Testimonials';
import { getHomeContent } from '@/lib/homeContent';
import { cleanCanonical } from '@/lib/canonical';
import JsonLd from '@/components/seo/JsonLd';
import { siteSchema } from '@/lib/schema';
import { getSiteUrl, HOME_DESCRIPTION, HOME_TITLE } from '@/lib/site';
import { pageHead } from '@/lib/pageMeta';

export async function generateMetadata({ searchParams }) {
  const canon = cleanCanonical('/', await searchParams);
  return pageHead({
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    canonical: `${getSiteUrl()}/`,
    indexable: !canon.robots,
    absoluteTitle: true,
  });
}

export default async function HomePage() {
  let home;
  try {
    home = await getHomeContent();
  } catch {
    return <p className="px-4 py-16 text-center">The shop is temporarily unavailable. Please try again.</p>;
  }

  return (
    <>
      <JsonLd data={siteSchema()} />
      <div className="mx-auto w-full max-w-[1400px] overflow-x-clip px-4 sm:px-6 lg:px-8">
      <h1 className="mx-auto mb-6 max-w-3xl pt-6 text-center text-2xl font-bold tracking-tight text-neutral-950 md:text-3xl">
        Ethnic wear for every celebration
      </h1>
      <HeroBanner slides={home.hero} />
      <CategoryShowcase categories={home.categories} />
      <PromoBanner promo={home.promo} />
      <FeaturedProducts products={home.featured} />
      <DealOfTheDay deal={home.deal} />
      <BestSellers products={home.bestSellers} />
      <NewArrivals products={home.newArrivals} />
      <Testimonials items={home.testimonials} />
      <TrustBar variant="dark" />
    </div>
    </>
  );
}
