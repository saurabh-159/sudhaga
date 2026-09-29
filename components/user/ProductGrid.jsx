import ProductCard from './ProductCard';

export default function ProductGrid({ products = [] }) {
  if (!products.length) return <p className="text-center py-10 text-gray-500">No products found.</p>;
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 md:gap-x-5">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}