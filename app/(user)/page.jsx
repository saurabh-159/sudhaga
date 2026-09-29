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

export default async function HomePage() {
  const home = await getHomeContent();

  return (
    <div className="mx-auto w-full overflow-x-clip px-4">
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
  );
}
