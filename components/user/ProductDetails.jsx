'use client';

import Link from 'next/link';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import { useCatalog } from '@/components/user/CatalogProvider';
import ProductCard from '@/components/user/ProductCard';
import ProductImage from '@/components/user/ProductImage';
import Breadcrumbs from '@/components/user/Breadcrumbs';
import { productAlt, productCrumbs } from '@/lib/storePath';
import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import {
  Star,
  Heart,
  ShoppingCart,
  Truck,
  Shield,
  RefreshCw,
  Minus,
  Plus,
  Share2,
  Check,
  ThumbsUp,
  Flame,
  BadgeCheck,
  PenLine,
} from 'lucide-react';

function categoryLabel(slug) {
  if (!slug) return '';
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function buildGallery(product) {
  const unique = [product.image, ...(product.images || [])].filter(Boolean);
  if (!unique.length) return [''];
  return unique.slice(0, 4);
}

export default function ProductDetails({ product, relatedProducts = [] }) {
  const router = useRouter();
  const { addToCart, toggleWishlist, isWishlisted, closeCart, products } = useCatalog();
  const wishlisted = isWishlisted(product.id);
  const [activeImage, setActiveImage] = useState(0);
  const [cartError, setCartError] = useState('');
  const [selectedColor, setSelectedColor] = useState('Black');
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [copied, setCopied] = useState(false);

  const gallery = buildGallery(product);
  const inStock = Number(product.stock ?? 0) > 0;
  const reviewCount = Number(product.numReviews || 0);
  const catalogRelated = products
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 4);
  const related = (relatedProducts.length ? relatedProducts : catalogRelated).slice(0, 4);

  const colors = [
    { name: 'Black', class: 'bg-gray-900' },
    { name: 'White', class: 'bg-white border border-gray-300' },
    { name: 'Navy', class: 'bg-blue-900' },
    { name: 'Maroon', class: 'bg-red-800' },
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL'];

  const discount =
    product.originalPrice && product.price && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const stockLeft = product.stock ?? 10;
  const stockPercent = Math.min(100, (stockLeft / 50) * 100);

  async function saveWishlist() {
    setCartError('');
    try {
      await toggleWishlist(product.id);
    } catch (error) {
      setCartError(error.message);
    }
  }

  async function addItem(goCheckout) {
    setCartError('');
    try {
      await addToCart(product.id, quantity, product);
      if (goCheckout) {
        closeCart();
        router.push('/checkout');
      }
    } catch (error) {
      setCartError(error.message === 'Unauthorized' ? 'Please login to add items.' : error.message);
    }
  }

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="mx-auto max-w-8xl px-4 py-6 pb-28 md:py-8 lg:pb-8">
      <Breadcrumbs items={productCrumbs(product)} />

      <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-10 xl:gap-12">
        {/* LEFT — sticky gallery: thumbs column + main image */}
        <div className="flex w-full flex-col-reverse gap-3 lg:sticky lg:top-[8.75rem] lg:flex-row lg:items-stretch lg:gap-4 lg:self-start">
          <div className="flex gap-2 overflow-x-auto pb-1 lg:w-20 lg:shrink-0 lg:flex-col lg:justify-start lg:gap-3 lg:overflow-visible lg:pb-0">
            {gallery.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImage(i)}
                aria-label={`View image ${i + 1}`}
                className={`relative aspect-[3/4] w-14 shrink-0 overflow-hidden rounded-lg transition duration-300 sm:w-16 lg:w-full ${
                  activeImage === i
                    ? 'ring-2 ring-neutral-900 ring-offset-1'
                    : 'opacity-70 ring-1 ring-black/10 hover:opacity-100'
                }`}
              >
                <ProductImage
                  src={img}
                  alt={`${productAlt(product)}, image ${i + 1}`}
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>

          <div className="group relative min-h-[min(62vh,520px)] min-w-0 flex-1 overflow-hidden rounded-xl bg-[#f3ebe3] ring-1 ring-black/5 lg:min-h-[min(78vh,720px)]">
            <ProductImage
              src={gallery[activeImage]}
              alt={productAlt(product)}
              className="object-cover object-top transition duration-700 group-hover:scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />

            {discount > 0 ? (
              <div className="absolute left-3 top-3 z-10 sm:left-4 sm:top-4">
                <span className="inline-flex items-center rounded-full bg-neutral-950 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                  -{discount}% off
                </span>
              </div>
            ) : null}

            <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 sm:right-4 sm:top-4">
              <button
                type="button"
                onClick={saveWishlist}
                aria-label="Add to wishlist"
                className={`flex h-9 w-9 items-center justify-center rounded-full shadow-md backdrop-blur-md transition hover:scale-105 active:scale-95 ${
                  wishlisted ? 'bg-red-500 text-white' : 'bg-white/90 text-neutral-700 hover:text-red-500'
                }`}
              >
                <Heart className={`h-4 w-4 ${wishlisted ? 'fill-current' : ''}`} />
              </button>

              <button
                type="button"
                onClick={copyShareLink}
                aria-label="Share product"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow-md backdrop-blur-md transition hover:scale-105 active:scale-95"
              >
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Share2 className="h-4 w-4" />}
              </button>
            </div>

            <div className="absolute bottom-3 right-3 z-10 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm sm:bottom-4 sm:right-4">
              {activeImage + 1} / {gallery.length}
            </div>
          </div>
        </div>

        {/* RIGHT — scrolls while gallery stays sticky */}
        <div className="lg:pt-1">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] ${inStock ? 'text-emerald-700' : 'text-neutral-500'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
              {inStock ? 'In stock' : 'Out of stock'}
            </span>
            {product.tag ? (
              <>
                <span className="text-neutral-300">·</span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  {product.tag}
                </span>
              </>
            ) : null}
          </div>

          <h1 className="text-balance text-[1.65rem] font-medium leading-[1.15] tracking-tight text-neutral-950 md:text-[2.15rem]">
            {product.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-neutral-500">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < Math.floor(product.rating || 0)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-neutral-200'
                    }`}
                  />
                ))}
              </div>
              <span className="font-medium text-neutral-900">{product.rating}</span>
            </div>
            <span className="hidden h-3 w-px bg-neutral-200 sm:block" />
            {reviewCount > 0 ? (
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className="underline-offset-2 transition hover:text-neutral-900 hover:underline"
              >
                {reviewCount} reviews
              </button>
            ) : null}
          </div>

          <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-y border-neutral-200/80 py-5">
            <span className="text-3xl font-medium tracking-tight text-neutral-950 md:text-[2.35rem]">
              ₹{product.price?.toLocaleString('en-IN')}
            </span>
            {product.originalPrice && product.originalPrice > product.price ? (
              <span className="text-base text-neutral-400 line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            ) : null}
            {discount > 0 ? (
              <span className="text-sm font-medium text-emerald-700">
                Save ₹{(product.originalPrice - product.price).toLocaleString('en-IN')} ({discount}% off)
              </span>
            ) : null}
          </div>

          <p className="mt-5 text-[15px] leading-relaxed text-neutral-600">
            {product.description ||
              'Premium quality product crafted with care. Features modern design, durable materials, and exceptional performance.'}
          </p>

          <div className="mt-8">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Colour — <span className="text-neutral-900">{selectedColor}</span>
            </p>
            <div className="flex flex-wrap gap-3">
              {colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedColor(c.name)}
                  aria-label={c.name}
                  title={c.name}
                  className={`relative h-9 w-9 rounded-full transition ${c.class} ${
                    selectedColor === c.name
                      ? 'ring-2 ring-neutral-950 ring-offset-2'
                      : 'ring-1 ring-black/10 hover:ring-black/25'
                  }`}
                >
                  {selectedColor === c.name ? (
                    <Check
                      className={`absolute inset-0 m-auto h-3.5 w-3.5 ${
                        c.name === 'White' ? 'text-neutral-900' : 'text-white'
                      }`}
                    />
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
                Size — <span className="text-neutral-900">{selectedSize}</span>
              </p>
              <button
                type="button"
                className="text-xs text-neutral-500 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-900 hover:decoration-neutral-900"
              >
                Size guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSize(s)}
                  className={`h-11 min-w-[3.15rem] px-3.5 text-sm font-medium transition ${
                    selectedSize === s
                      ? 'bg-neutral-950 text-white'
                      : 'bg-[#f6f1ea] text-neutral-800 ring-1 ring-black/5 hover:bg-neutral-200/70'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7 flex items-center gap-3 border-l-2 border-neutral-950/80 bg-[#f6f1ea] px-4 py-3">
            <Flame className="h-4 w-4 shrink-0 text-neutral-800" strokeWidth={1.75} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-neutral-900">Selling fast</span>
                <span className="text-xs font-medium text-neutral-600">Only {stockLeft} left</span>
              </div>
              <div className="mt-2 h-1 w-full overflow-hidden bg-neutral-300/60">
                <div
                  className="h-full bg-neutral-950 transition-all duration-700"
                  style={{ width: `${Math.max(12, 100 - stockPercent)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <div className="flex h-12 items-center bg-[#f6f1ea] ring-1 ring-black/5">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-full w-11 items-center justify-center text-neutral-600 transition hover:bg-black/5"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-10 text-center text-sm font-medium tabular-nums text-neutral-950">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="flex h-full w-11 items-center justify-center text-neutral-600 transition hover:bg-black/5"
                aria-label="Increase quantity"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <Button
              className="group h-12 flex-1 gap-2 rounded-none bg-neutral-950 text-sm font-medium tracking-wide hover:bg-neutral-800"
              onClick={() => addItem(false)}
              disabled={!inStock}
            >
              <ShoppingCart className="h-4 w-4 transition-transform group-hover:scale-105" />
              {inStock ? 'Add to Cart' : 'Out of stock'}
            </Button>
          </div>
          {cartError ? <p className="mt-2 text-sm text-red-600">{cartError}</p> : null}

          <button
            type="button"
            onClick={() => addItem(true)}
            className="mt-3 flex h-12 w-full items-center justify-center border border-neutral-950 text-sm font-medium tracking-wide text-neutral-950 transition hover:bg-neutral-950 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!inStock}
          >
            {inStock ? 'Buy Now — Instant Checkout' : 'Out of stock'}
          </button>

          <ul className="mt-8 grid grid-cols-2 gap-px overflow-hidden bg-neutral-200/80 sm:grid-cols-3 [&>li:last-child]:col-span-2 sm:[&>li:last-child]:col-span-1">
            {[
              {
                icon: Truck,
                title: 'Free delivery',
                sub: 'By tomorrow, 6 PM',
              },
              {
                icon: RefreshCw,
                title: 'Easy returns',
                sub: '7-day hassle-free',
              },
              {
                icon: Shield,
                title: 'Secure pay',
                sub: 'Encrypted checkout',
              },
            ].map((item) => (
              <li key={item.title} className="flex items-start gap-3 bg-white px-4 py-4">
                <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-neutral-800" strokeWidth={1.6} />
                <div>
                  <p className="text-sm font-medium text-neutral-950">{item.title}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">{item.sub}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <section className="mt-16 md:mt-20">
        <div className="flex gap-1 overflow-x-auto border-b border-neutral-200 pb-px">
          {[
            { id: 'description', label: 'Description' },
            { id: 'specs', label: 'Specifications' },
            { id: 'reviews', label: `Reviews (${reviewCount})` },
            { id: 'shipping', label: 'Shipping & Returns' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`relative shrink-0 whitespace-nowrap px-4 py-3.5 text-sm transition md:px-5 ${
                activeTab === t.id
                  ? 'font-medium text-neutral-950'
                  : 'text-neutral-400 hover:text-neutral-700'
              }`}
            >
              {t.label}
              {activeTab === t.id ? (
                <span className="absolute inset-x-4 bottom-0 h-0.5 bg-neutral-950 md:inset-x-5" />
              ) : null}
            </button>
          ))}
        </div>

        <div className="py-8 md:py-10">
          {activeTab === 'description' ? (
            <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                  About this piece
                </p>
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-neutral-600 md:text-base">
                  {product.description ||
                    'This premium product is designed with the finest materials and crafted to perfection.'}
                </p>
                <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-neutral-500">
                  Soft hand-feel, refined embroidery, and a silhouette made for festive evenings and
                  everyday elegance alike. Pair with statement jewellery or keep it minimal.
                </p>
              </div>

              <div className="bg-[#f6f1ea] p-6 md:p-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
                  Key highlights
                </p>
                <ul className="mt-5 space-y-3.5">
                  {[
                    'Premium quality materials with long-lasting durability',
                    'Modern, minimalist design that suits every style',
                    'Lightweight and comfortable for extended use',
                    'Backed by our 1-year warranty',
                    'Ethically sourced and responsibly manufactured',
                  ].map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-950">
                        <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
                      </span>
                      <span className="text-sm leading-snug text-neutral-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}

          {activeTab === 'specs' ? (
            <div className="overflow-hidden border border-neutral-200">
              <div className="grid sm:grid-cols-2">
                {[
                  { label: 'Brand', value: 'Sudhaga' },
                  { label: 'SKU', value: product.id?.toUpperCase() || 'N/A' },
                  { label: 'Material', value: 'Premium Blend' },
                  { label: 'Category', value: categoryLabel(product.category) },
                  { label: 'Stock', value: `${stockLeft} pieces` },
                  { label: 'Warranty', value: '1 Year' },
                  { label: 'Country of Origin', value: 'India' },
                  { label: 'Care Instructions', value: 'Dry clean recommended' },
                ].map((spec, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between gap-4 px-5 py-4 ${
                      i % 2 === 0 ? 'bg-white' : 'bg-[#faf7f2]'
                    } sm:odd:bg-white sm:even:bg-[#faf7f2] border-b border-neutral-100 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0`}
                  >
                    <span className="text-sm text-neutral-500">{spec.label}</span>
                    <span className="text-right text-sm font-medium text-neutral-900">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {activeTab === 'reviews' && reviewCount < 1 ? (
            <p className="py-8 text-sm text-neutral-500">No reviews yet.</p>
          ) : null}

          {activeTab === 'reviews' && reviewCount > 0 ? (
            <div className="space-y-8">
              {/* Summary */}
              <div className="grid gap-6 lg:grid-cols-[1fr_1.35fr]">
                <div className="flex flex-col justify-between bg-[#f6f1ea] p-6 md:p-8">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
                      Customer rating
                    </p>
                    <div className="mt-4 flex items-end gap-3">
                      <span className="text-6xl font-medium leading-none tracking-tight text-neutral-950">
                        {product.rating}
                      </span>
                      <span className="mb-1.5 text-sm text-neutral-500">/ 5</span>
                    </div>
                    <div className="mt-3 flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating || 0)
                              ? 'fill-[#c4a574] text-[#c4a574]'
                              : 'text-neutral-300'
                          }`}
                          strokeWidth={1.5}
                        />
                      ))}
                    </div>
                    <p className="mt-3 text-sm text-neutral-600">
                      Based on <span className="font-medium text-neutral-900">{product.reviews ?? 128}</span> verified
                      reviews
                    </p>
                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-3 border-t border-neutral-900/10 pt-5">
                    <div>
                      <p className="text-xl font-medium text-neutral-950">94%</p>
                      <p className="mt-0.5 text-xs text-neutral-500">Recommend this</p>
                    </div>
                    <div>
                      <p className="text-xl font-medium text-neutral-950">4.8</p>
                      <p className="mt-0.5 text-xs text-neutral-500">Fit & quality</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between border border-neutral-200 p-6 md:p-8">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
                      Rating breakdown
                    </p>
                    <div className="mt-5 space-y-3">
                      {[
                        { stars: 5, pct: 78, count: 100 },
                        { stars: 4, pct: 15, count: 19 },
                        { stars: 3, pct: 5, count: 6 },
                        { stars: 2, pct: 1, count: 2 },
                        { stars: 1, pct: 1, count: 1 },
                      ].map((r) => (
                        <button
                          key={r.stars}
                          type="button"
                          className="group flex w-full items-center gap-3 text-left"
                          aria-label={`Filter ${r.stars} star reviews`}
                        >
                          <span className="flex w-10 items-center gap-1 text-xs font-medium text-neutral-700">
                            {r.stars}
                            <Star className="h-3 w-3 fill-[#c4a574] text-[#c4a574]" strokeWidth={1.5} />
                          </span>
                          <div className="h-1.5 flex-1 overflow-hidden bg-neutral-100">
                            <div
                              className="h-full bg-neutral-950 transition group-hover:bg-neutral-700"
                              style={{ width: `${r.pct}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-xs tabular-nums text-neutral-500">{r.pct}%</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="mt-8 inline-flex h-11 w-full items-center justify-center gap-2 bg-neutral-950 text-sm font-medium tracking-wide text-white transition hover:bg-neutral-800 sm:w-auto sm:min-w-[11rem] sm:self-start"
                  >
                    <PenLine className="h-3.5 w-3.5" />
                    Write a review
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col gap-3 border-y border-neutral-200 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-neutral-600">
                  Showing <span className="font-medium text-neutral-950">3</span> of{' '}
                  <span className="font-medium text-neutral-950">{product.reviews ?? 128}</span> reviews
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Most recent', 'Highest rated', 'With photos'].map((filter, i) => (
                    <button
                      key={filter}
                      type="button"
                      className={`px-3.5 py-1.5 text-xs font-medium transition ${
                        i === 0
                          ? 'bg-neutral-950 text-white'
                          : 'bg-[#f6f1ea] text-neutral-700 hover:bg-neutral-200/80'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Review list */}
              <div className="space-y-5">
                {[
                  {
                    name: 'Aditya K.',
                    rating: 5,
                    date: '2 days ago',
                    title: 'Exactly as described',
                    text: 'Excellent quality! Exactly as described. Delivery was super fast. Highly recommended for festive wear.',
                    avatar: 'https://i.pravatar.cc/80?img=12',
                    verified: true,
                    size: 'M',
                    helpful: 24,
                    photos: [gallery[0], gallery[1]],
                  },
                  {
                    name: 'Meera S.',
                    rating: 5,
                    date: '1 week ago',
                    title: 'Premium finish & packaging',
                    text: 'Love it! The finish is premium and the packaging was beautiful. Worth every rupee — the embroidery looks even better in person.',
                    avatar: 'https://i.pravatar.cc/80?img=45',
                    verified: true,
                    size: 'S',
                    helpful: 18,
                    photos: [gallery[2]],
                  },
                  {
                    name: 'Rohan M.',
                    rating: 4,
                    date: '2 weeks ago',
                    title: 'Great value, size runs slightly small',
                    text: 'Great value for money. Slightly smaller than expected but overall happy with the purchase. Colour is rich and true to the photos.',
                    avatar: 'https://i.pravatar.cc/80?img=15',
                    verified: true,
                    size: 'L',
                    helpful: 9,
                    photos: [],
                  },
                ].map((rev, i) => (
                  <article
                    key={i}
                    className="border border-neutral-200 bg-white p-5 transition hover:border-neutral-300 md:p-6"
                  >
                    <div className="flex items-start gap-3.5">
                      <img
                        src={rev.avatar}
                        alt={rev.name}
                        className="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-black/5"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <p className="text-sm font-medium text-neutral-950">{rev.name}</p>
                          {rev.verified ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                              <BadgeCheck className="h-3.5 w-3.5" />
                              Verified buy
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, idx) => (
                              <Star
                                key={idx}
                                className={`h-3 w-3 ${
                                  idx < rev.rating
                                    ? 'fill-[#c4a574] text-[#c4a574]'
                                    : 'text-neutral-200'
                                }`}
                                strokeWidth={1.5}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] text-neutral-400">·</span>
                          <span className="text-xs text-neutral-500">Size {rev.size}</span>
                          <span className="text-[11px] text-neutral-400">·</span>
                          <span className="text-xs text-neutral-400">{rev.date}</span>
                        </div>
                      </div>
                    </div>

                    <h4 className="mt-4 text-sm font-medium text-neutral-950 md:text-[15px]">{rev.title}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-600">{rev.text}</p>

                    {rev.photos?.length ? (
                      <div className="mt-4 flex gap-2">
                        {rev.photos.map((src, pi) => (
                          <button
                            key={pi}
                            type="button"
                            className="h-16 w-14 overflow-hidden bg-[#f6f1ea] ring-1 ring-black/5 transition hover:ring-neutral-400 sm:h-[4.5rem] sm:w-14"
                            aria-label={`Review photo ${pi + 1}`}
                          >
                            <img src={src} alt="" className="h-full w-full object-cover object-top" />
                          </button>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 transition hover:text-neutral-900"
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                        Helpful · {rev.helpful}
                      </button>
                      <button
                        type="button"
                        className="text-xs font-medium text-neutral-500 transition hover:text-neutral-900"
                      >
                        Report
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <button
                type="button"
                className="w-full border border-neutral-200 py-3.5 text-sm font-medium text-neutral-800 transition hover:border-neutral-400 hover:bg-[#f6f1ea]"
              >
                Load more reviews
              </button>
            </div>
          ) : null}

          {activeTab === 'shipping' ? (
            <div className="grid gap-6 md:grid-cols-2 md:gap-8">
              <div className="border border-neutral-200 bg-white p-6 md:p-7">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center bg-[#f6f1ea]">
                    <Truck className="h-4 w-4 text-neutral-900" strokeWidth={1.6} />
                  </span>
                  <h4 className="text-sm font-medium tracking-wide text-neutral-950">
                    Shipping information
                  </h4>
                </div>
                <ul className="space-y-3 text-sm text-neutral-600">
                  {[
                    'Free delivery on orders above ₹999',
                    'Standard delivery: 3–5 business days',
                    'Express delivery available at checkout',
                    'Cash on Delivery available',
                    'Real-time tracking via SMS & email',
                  ].map((line) => (
                    <li key={line} className="flex gap-2.5">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-400" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border border-neutral-200 bg-white p-6 md:p-7">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center bg-[#f6f1ea]">
                    <RefreshCw className="h-4 w-4 text-neutral-900" strokeWidth={1.6} />
                  </span>
                  <h4 className="text-sm font-medium tracking-wide text-neutral-950">
                    Returns & refunds
                  </h4>
                </div>
                <ul className="space-y-3 text-sm text-neutral-600">
                  {[
                    '7-day easy return policy',
                    'Free pickup from your doorstep',
                    'Instant refunds to original payment method',
                    'Exchange available for size/colour issues',
                    'No return on personal care items',
                  ].map((line) => (
                    <li key={line} className="flex gap-2.5">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-400" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {related.length > 0 ? (
        <section className="mt-16 border-t border-neutral-200 pt-12 md:mt-20 md:pt-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                {categoryLabel(product.category) || 'More pieces'}
              </p>
              <h2 className="mt-2 text-2xl font-medium tracking-tight text-neutral-950 md:text-3xl">
                You may also like
              </h2>
            </div>
            {product.category ? (
              <Link
                href={`/categories/${product.category}`}
                className="shrink-0 text-sm font-medium text-neutral-700 underline-offset-4 transition hover:text-neutral-950 hover:underline"
              >
                View all
              </Link>
            ) : null}
          </div>
          <div className="sm:hidden">
            <Swiper grabCursor spaceBetween={12} slidesPerView={2}>
              {related.map((item) => (
                <SwiperSlide key={item.id} className="!h-auto">
                  <ProductCard product={item} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          <div className="hidden gap-x-4 gap-y-8 sm:grid sm:grid-cols-2 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center gap-2 border-t border-gray-200 bg-white p-3 shadow-2xl lg:hidden">
        <button
          type="button"
          onClick={saveWishlist}
          className={`flex h-12 w-12 items-center justify-center rounded-xl border transition-all duration-300 ${
            wishlisted
              ? 'border-red-500 bg-red-500 text-white'
              : 'border-gray-200 text-gray-700'
          }`}
          aria-label="Wishlist"
        >
          <Heart className={`h-5 w-5 ${wishlisted ? 'fill-current' : ''}`} />
        </button>

        <Button className="h-12 min-w-0 flex-1 gap-2 px-3 text-sm" onClick={() => addItem(false)} disabled={!inStock}>
          <ShoppingCart className="h-4 w-4 shrink-0" />
          <span className="truncate">{inStock ? `Add · ₹${product.price?.toLocaleString('en-IN')}` : 'Out of stock'}</span>
        </Button>
      </div>
    </div>
  );
}
