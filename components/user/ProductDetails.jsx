'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Button from '@/components/ui/Button';
import { useCatalog } from '@/components/user/CatalogProvider';
import ProductCard from '@/components/user/ProductCard';
import ProductImage from '@/components/user/ProductImage';
import Breadcrumbs from '@/components/user/Breadcrumbs';
import { productAlt, productCrumbs } from '@/lib/storePath';
import { shareProduct } from '@/lib/shareProduct';
import { lockBodyScroll } from '@/lib/scrollLock';
import { chooseVariant, matchVariant, selectionOf, skuWithOptions, variantGroups } from '@/lib/variants';
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
  X,
} from 'lucide-react';

const SIZE_GUIDE = [
  { size: 'XS', bust: '32" / 81 cm', waist: '26" / 66 cm', hip: '35" / 89 cm' },
  { size: 'S', bust: '34" / 86 cm', waist: '28" / 71 cm', hip: '37" / 94 cm' },
  { size: 'M', bust: '36" / 91 cm', waist: '30" / 76 cm', hip: '39" / 99 cm' },
  { size: 'L', bust: '38" / 97 cm', waist: '32" / 81 cm', hip: '41" / 104 cm' },
  { size: 'XL', bust: '40" / 102 cm', waist: '34" / 86 cm', hip: '43" / 109 cm' },
];

const MEASURE_STEPS = [
  { label: 'Bust', text: 'Around the fullest part of the chest, tape level with the floor.' },
  { label: 'Waist', text: 'Around the natural waist, where the body narrows.' },
  { label: 'Hip', text: 'Around the fullest part of the hips, about 8 inches below the waist.' },
];

const FALLBACK_COLORS = [
  { name: 'Black', className: 'bg-neutral-950' },
  { name: 'White', className: 'bg-white ring-1 ring-black/15' },
  { name: 'Navy', className: 'bg-blue-950' },
  { name: 'Maroon', className: 'bg-red-900' },
];

const FALLBACK_SIZES = ['XS', 'S', 'M', 'L', 'XL'];

function SizeGuideDialog({ selectedSize, availableSizes, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-[80]">
      <button type="button" aria-label="Close size guide" className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="size-guide-title"
        className="absolute left-1/2 top-1/2 flex max-h-[min(88vh,640px)] w-[min(100%-1.5rem,36rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden bg-white shadow-[0_24px_80px_rgba(22,19,17,0.22)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-black/[0.06] px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Fit</p>
            <h2 id="size-guide-title" className="mt-1 text-lg font-medium text-neutral-950">
              Size guide
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close size guide"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 transition hover:bg-[#f3ebe3]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5">
          <p className="text-sm leading-relaxed text-neutral-600">
            Body measurements for kurta, lehenga, and suit sets. If you fall between two sizes, pick the larger one.
            Tap a size to select it.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-black/[0.08] text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  <th className="py-2.5 pr-3 font-semibold">Size</th>
                  <th className="py-2.5 pr-3 font-semibold">Bust</th>
                  <th className="py-2.5 pr-3 font-semibold">Waist</th>
                  <th className="py-2.5 font-semibold">Hip</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_GUIDE.map((row) => {
                  const offered = availableSizes.includes(row.size);
                  const active = selectedSize === row.size;
                  return (
                    <tr key={row.size} className={active ? 'bg-[#f6f1ea]' : 'border-b border-black/[0.04]'}>
                      <td className="py-2.5 pr-3">
                        <button
                          type="button"
                          disabled={!offered}
                          onClick={() => onSelect(row.size)}
                          className={`min-w-10 px-2 py-1 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40 ${
                            active ? 'bg-neutral-950 text-white' : 'text-neutral-950 hover:bg-neutral-100'
                          }`}
                        >
                          {row.size}
                        </button>
                      </td>
                      <td className="py-2.5 pr-3 text-neutral-700">{row.bust}</td>
                      <td className="py-2.5 pr-3 text-neutral-700">{row.waist}</td>
                      <td className="py-2.5 text-neutral-700">{row.hip}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {MEASURE_STEPS.map((step) => (
              <div key={step.label} className="bg-[#faf7f3] px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">{step.label}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-neutral-700">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function categoryLabel(slug) {
  if (!slug) return '';
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

const COLOR_CLASS = {
  black: 'bg-neutral-950',
  white: 'bg-white ring-1 ring-black/15',
  red: 'bg-red-700',
  pink: 'bg-pink-400',
  orange: 'bg-orange-500',
  purple: 'bg-purple-800',
  blue: 'bg-blue-800',
  navy: 'bg-blue-950',
  green: 'bg-emerald-700',
  beige: 'bg-[#e6d3b3]',
  gold: 'bg-amber-400',
  maroon: 'bg-red-900',
  yellow: 'bg-yellow-300',
  cream: 'bg-[#f3e6d0]',
  grey: 'bg-neutral-400',
  gray: 'bg-neutral-400',
};

const LIGHT_COLORS = new Set(['white', 'beige', 'gold', 'yellow', 'cream', 'ivory', 'pink']);

function colorClass(name) {
  return COLOR_CLASS[String(name || '').trim().toLowerCase()] || 'bg-neutral-300';
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
  const [picked, setPicked] = useState(null);
  const [pickedFor, setPickedFor] = useState(product.id);
  if (pickedFor !== product.id) {
    setPickedFor(product.id);
    setPicked(null);
  }
  const selection = picked || selectionOf(product.attributes?.[0]);
  const [fallbackColor, setFallbackColor] = useState('Black');
  const [fallbackSize, setFallbackSize] = useState('M');
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [copied, setCopied] = useState(false);

  const gallery = buildGallery(product);
  const groups = variantGroups(product.attributes);
  const sizeGroup = groups.find((group) => group.slug === 'size');
  const colorGroup = groups.find((group) => group.slug === 'color' || group.slug === 'colour');
  const sizes = sizeGroup?.values?.length ? sizeGroup.values : FALLBACK_SIZES;
  const selectedSize = sizeGroup ? selection[sizeGroup.slug] || sizes[0] : fallbackSize;
  const selectedColor = colorGroup ? selection[colorGroup.slug] || colorGroup.values[0] : fallbackColor;
  const colorChoices = colorGroup?.values?.length
    ? colorGroup.values.map((name) => ({ name, className: colorClass(name) }))
    : FALLBACK_COLORS;
  const active = matchVariant(product.attributes, selection) || product.attributes?.[0] || null;
  const activePrice = active && product.attributes?.length ? Number(active.price) : Number(product.price || 0);
  const activeSku = active?.sku || product.sku || '';
  const lineOptions = groups.length
    ? active?.options || []
    : [
        { name: 'Color', slug: 'color', value: selectedColor },
        { name: 'Size', slug: 'size', value: selectedSize },
      ];
  const displaySku = groups.length ? activeSku : skuWithOptions(product.sku, lineOptions) || activeSku;
  const inStock = Number(product.stock ?? 0) > 0;
  const reviewCount = Number(product.numReviews || 0);
  const catalogRelated = products
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 4);
  const related = (relatedProducts.length ? relatedProducts : catalogRelated).slice(0, 4);

  const discount =
    product.originalPrice && activePrice && product.originalPrice > activePrice
      ? Math.round(((product.originalPrice - activePrice) / product.originalPrice) * 100)
      : 0;

  const stockLeft = product.stock ?? 10;
  const stockPercent = Math.min(100, (stockLeft / 50) * 100);

  useEffect(() => {
    if (!sizeGuideOpen) return undefined;
    const unlock = lockBodyScroll();
    function onKey(event) {
      if (event.key === 'Escape') setSizeGuideOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => {
      unlock();
      document.removeEventListener('keydown', onKey);
    };
  }, [sizeGuideOpen]);

  function selectOption(slug, value) {
    const row = chooseVariant(product.attributes, selection, slug, value);
    if (row) setPicked(selectionOf(row));
  }

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
      await addToCart(product.id, quantity, product, {
        sku: displaySku,
        options: lineOptions,
      });
      if (goCheckout) {
        closeCart();
        router.push('/checkout');
      }
    } catch (error) {
      setCartError(error.message === 'Unauthorized' ? 'Please login to add items.' : error.message);
    }
  }

  const copyShareLink = async () => {
    const result = await shareProduct(product, window.location.href);
    if (result !== 'copied' && result !== 'shared') return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 pb-28 sm:px-6 md:py-8 lg:px-8 lg:pb-8">
      <Breadcrumbs items={productCrumbs(product)} />

      <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-10 xl:gap-12">
        {/* LEFT — sticky gallery: thumbs column + main image */}
        <div className="flex w-full flex-col-reverse gap-3 lg:sticky lg:top-[7.75rem] lg:flex-row lg:items-stretch lg:gap-4 lg:self-start">
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
              ₹{activePrice.toLocaleString('en-IN')}
            </span>
            {product.originalPrice && product.originalPrice > activePrice ? (
              <span className="text-base text-neutral-400 line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            ) : null}
            {discount > 0 ? (
              <span className="text-sm font-medium text-emerald-700">
                Save ₹{(product.originalPrice - activePrice).toLocaleString('en-IN')} ({discount}% off)
              </span>
            ) : null}
          </div>
          {activeSku ? (
            <p className="mt-3 text-xs tracking-wide text-neutral-500">
              SKU <span className="font-medium text-neutral-900">{displaySku}</span>
            </p>
          ) : null}

          <p className="mt-5 text-[15px] leading-relaxed text-neutral-600">
            {product.description ||
              'Premium quality product crafted with care. Features modern design, durable materials, and exceptional performance.'}
          </p>

          {groups.length === 0 ? (
            <div className="mt-8">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
                Colour — <span className="text-neutral-900">{selectedColor}</span>
              </p>
              <div className="flex flex-wrap gap-3">
                {colorChoices.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setFallbackColor(color.name)}
                    aria-label={color.name}
                    title={color.name}
                    className={`relative h-9 w-9 rounded-full transition ${color.className} ${
                      selectedColor === color.name
                        ? 'ring-2 ring-neutral-950 ring-offset-2'
                        : 'ring-1 ring-black/10 hover:ring-black/25'
                    }`}
                  >
                    {selectedColor === color.name ? (
                      <Check
                        className={`absolute inset-0 m-auto h-3.5 w-3.5 ${
                          color.name === 'White' ? 'text-neutral-900' : 'text-white'
                        }`}
                      />
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {groups.map((group) => {
            const isColor = group.slug === 'color' || group.slug === 'colour';
            const isSize = group.slug === 'size';
            const selected = selection[group.slug];
            return (
              <div key={group.slug} className="mt-8">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
                    {group.name} — <span className="text-neutral-900">{selected}</span>
                  </p>
                  {isSize ? (
                    <button
                      type="button"
                      onClick={() => setSizeGuideOpen(true)}
                      className="text-xs font-medium text-neutral-700 underline decoration-neutral-400 underline-offset-4 transition hover:text-neutral-950 hover:decoration-neutral-950"
                    >
                      Size guide
                    </button>
                  ) : null}
                </div>
                <div className={`flex flex-wrap ${isColor ? 'gap-3' : 'gap-2'}`}>
                  {group.values.map((value) =>
                    isColor ? (
                      <button
                        key={value}
                        type="button"
                        onClick={() => selectOption(group.slug, value)}
                        aria-label={value}
                        title={value}
                        className={`relative h-9 w-9 rounded-full transition ${colorClass(value)} ${
                          selected === value
                            ? 'ring-2 ring-neutral-950 ring-offset-2'
                            : 'ring-1 ring-black/10 hover:ring-black/25'
                        }`}
                      >
                        {selected === value ? (
                          <Check
                            className={`absolute inset-0 m-auto h-3.5 w-3.5 ${
                              LIGHT_COLORS.has(String(value).toLowerCase()) ? 'text-neutral-900' : 'text-white'
                            }`}
                          />
                        ) : null}
                      </button>
                    ) : (
                      <button
                        key={value}
                        type="button"
                        onClick={() => selectOption(group.slug, value)}
                        className={`h-11 min-w-[3.15rem] px-3.5 text-sm font-medium transition ${
                          selected === value
                            ? 'bg-neutral-950 text-white'
                            : 'bg-[#f6f1ea] text-neutral-800 ring-1 ring-black/5 hover:bg-neutral-200/70'
                        }`}
                      >
                        {value}
                      </button>
                    ),
                  )}
                </div>
              </div>
            );
          })}

          {groups.length === 0 ? (
            <div className="mt-8">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
                  Size — <span className="text-neutral-900">{selectedSize}</span>
                </p>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-xs font-medium text-neutral-700 underline decoration-neutral-400 underline-offset-4 transition hover:text-neutral-950 hover:decoration-neutral-950"
                >
                  Size guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setFallbackSize(size)}
                    className={`h-11 min-w-[3.15rem] px-3.5 text-sm font-medium transition ${
                      selectedSize === size
                        ? 'bg-neutral-950 text-white'
                        : 'bg-[#f6f1ea] text-neutral-800 ring-1 ring-black/5 hover:bg-neutral-200/70'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

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
                  { label: 'SKU', value: displaySku || 'N/A' },
                  ...lineOptions.map((option) => ({ label: option.name, value: option.value })),
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
          <span className="truncate">{inStock ? `Add · ₹${activePrice.toLocaleString('en-IN')}` : 'Out of stock'}</span>
        </Button>
      </div>

      {sizeGuideOpen
        ? createPortal(
            <SizeGuideDialog
              selectedSize={selectedSize}
              availableSizes={sizes}
              onSelect={(size) => {
                if (sizeGroup) selectOption(sizeGroup.slug, size);
                else setFallbackSize(size);
                setSizeGuideOpen(false);
              }}
              onClose={() => setSizeGuideOpen(false)}
            />,
            document.body,
          )
        : null}
    </div>
  );
}
