import OfferCarousel from '@/components/user/home/OfferCarousel';
import Navbar from '@/components/user/Navbar';
import Footer from '@/components/user/Footer';
import CartDrawer from '@/components/user/CartDrawer';
import { CatalogProvider } from '@/components/user/CatalogProvider';

export default function UserLayout({ children }) {
  return (
    <CatalogProvider>
      <OfferCarousel />
      <Navbar />
      <CartDrawer />
      <main className="min-h-screen overflow-x-clip">{children}</main>
      <Footer />
    </CatalogProvider>
  );
}