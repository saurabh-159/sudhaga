import { connectDB } from '@/lib/mongodb';
import Banner from '@/models/Banner';
import Testimonial from '@/models/Testimonial';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { storePath } from '@/lib/storePath';

const HERO_SEED = [
  {
    placement: 'hero',
    title: 'New Arrivals',
    subtitle: 'Embroidered chanderi suits',
    badge: 'Just In',
    href: '/categories/suit-sets',
    image: '/products/priya-orange.jpg',
    imageAlt: 'Priya orange embroidered chanderi suit set',
    order: 1,
  },
  {
    placement: 'hero',
    title: 'Buy 1 Get 1',
    subtitle: 'Tyohar sale looks',
    href: '/products',
    image: '/products/mehka-red.jpg',
    imageAlt: 'Mehka red solid satin lehenga set',
    accent: true,
    order: 2,
  },
  {
    placement: 'hero',
    title: 'Lehenga Sets',
    subtitle: 'Ceremony-ready silhouettes',
    href: '/categories/lehenga-sets',
    image: '/products/mora-blue.jpg',
    imageAlt: 'Mora blue embroidered satin lehenga set',
    order: 3,
  },
  {
    placement: 'hero',
    title: 'Suit Sets',
    subtitle: 'Festive colour stories',
    href: '/categories/suit-sets',
    image: '/products/vibha-magenta.jpg',
    imageAlt: 'Vibha magenta solid chanderi suit set',
    order: 4,
  },
  {
    placement: 'hero',
    title: 'Kurta Sets',
    subtitle: 'Everyday ethnic ease',
    href: '/categories/kurta-sets',
    image: '/products/sabine-pink.jpg',
    imageAlt: 'Sabine pink printed cotton stripes kurta set',
    order: 5,
  },
  {
    placement: 'hero',
    title: 'Gotapatti',
    subtitle: 'Sparkle for every occasion',
    href: '/categories/suit-sets',
    image: '/products/sparkling-purple.png',
    imageAlt: 'Sparkling purple gotapatti suit set',
    order: 6,
  },
];

const EXTRA_SEED = [
  {
    placement: 'promo',
    title: 'Tyohar Sale',
    subtitle: 'Buy 1 Get 1 Free on festive ethnic wear — grab it before it ends',
    code: 'B1G1',
    cta: 'Shop Sale',
    href: '/products',
    image: '/products/shagun-pink.jpg',
    imageAlt: 'Shagun pink embroidered chanderi suit set',
    endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    order: 1,
  },
  {
    placement: 'deal-side',
    title: 'Mehka',
    href: '/categories/lehenga-sets',
    image: '/products/mehka-red.jpg',
    hoverImage: '/products/vibha-magenta.jpg',
    imageAlt: 'Mehka red solid satin lehenga set',
    order: 1,
  },
  {
    placement: 'deal-center',
    title: 'Two looks. One occasion.',
    subtitle: 'Ceremony red lehenga on the left, magenta chanderi suit on the right.',
    badge: 'The festive edit',
    cta: 'Shop the edit',
    href: '/categories/suit-sets',
    order: 1,
  },
  {
    placement: 'deal-side',
    title: 'Vibha',
    href: '/categories/suit-sets',
    image: '/products/vibha-magenta.jpg',
    hoverImage: '/products/mehka-red.jpg',
    imageAlt: 'Vibha magenta solid chanderi suit set',
    order: 2,
  },
];

const REVIEW_SEED = [
  {
    name: 'Priya Sharma',
    role: 'Fashion Blogger',
    avatar: 'https://i.pravatar.cc/150?img=47',
    rating: 5,
    text: 'Absolutely love the quality. The embroidery and fabric felt even better in person, and the suit arrived beautifully packed.',
    location: 'Mumbai',
    order: 1,
  },
  {
    name: 'Rahul Verma',
    role: 'Regular Shopper',
    avatar: 'https://i.pravatar.cc/150?img=12',
    rating: 5,
    text: 'Easy to shop, honest pricing, and the lehenga looked exactly like the photos. Will be ordering again for the next function.',
    location: 'Bangalore',
    order: 2,
  },
  {
    name: 'Ananya Iyer',
    role: 'Interior Designer',
    avatar: 'https://i.pravatar.cc/150?img=32',
    rating: 5,
    text: 'The curation is thoughtful. I keep finding festive pieces here that feel special without looking overdone.',
    location: 'Chennai',
    order: 3,
  },
  {
    name: 'Arjun Mehta',
    role: 'Gifting',
    avatar: 'https://i.pravatar.cc/150?img=15',
    rating: 4,
    text: 'Bought a suit set as a gift. The fit was true to size and the return process was simple when we needed a different colour.',
    location: 'Delhi',
    order: 4,
  },
  {
    name: 'Kavya Reddy',
    role: 'Photographer',
    avatar: 'https://i.pravatar.cc/150?img=45',
    rating: 5,
    text: 'Quiet luxury in the packaging and the clothes. The gotapatti work photographed beautifully and shipping was quick.',
    location: 'Hyderabad',
    order: 5,
  },
];

function shapeBanner(banner) {
  return {
    id: String(banner._id),
    placement: banner.placement,
    title: banner.title || '',
    subtitle: banner.subtitle || '',
    badge: banner.badge || '',
    href: storePath(banner.href),
    cta: banner.cta || '',
    code: banner.code || '',
    image: banner.image || '',
    hoverImage: banner.hoverImage || '',
    imageAlt: banner.imageAlt || banner.title || '',
    accent: Boolean(banner.accent),
    endsAt: banner.endsAt ? new Date(banner.endsAt).toISOString() : null,
    order: banner.order || 0,
    active: banner.active !== false,
  };
}

function shapeProduct(product) {
  const category = product.category;
  const slug = category && typeof category === 'object' ? category.slug || '' : '';
  return {
    id: String(product._id),
    slug: product.slug || '',
    name: product.name,
    image: product.image || '',
    price: Number(product.price || 0),
    originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
    stock: product.stock ?? 0,
    category: slug,
    categoryName: category && typeof category === 'object' ? category.name || '' : '',
    featured: Boolean(product.featured),
    bestSeller: Boolean(product.bestSeller),
  };
}

function shapeCategory(category, count) {
  return {
    id: String(category._id),
    name: category.name,
    slug: category.slug,
    blurb: category.blurb || '',
    image: category.image || '',
    imageFocus: category.imageFocus || 'center',
    imageFit: category.imageFit || '',
    imageBg: category.imageBg || '',
    count,
  };
}

async function seedIfEmpty() {
  if ((await Banner.countDocuments()) === 0) {
    await Banner.insertMany([...HERO_SEED, ...EXTRA_SEED]);
  }
  if ((await Testimonial.countDocuments()) === 0) {
    await Testimonial.insertMany(REVIEW_SEED);
  }
}

export async function getHomeContent() {
  await connectDB();
  await seedIfEmpty();

  const [banners, reviews, products, categories] = await Promise.all([
    Banner.find({ active: true }).sort({ order: 1, createdAt: 1 }).lean(),
    Testimonial.find({ active: true }).sort({ order: 1, createdAt: 1 }).lean(),
    Product.find().populate('category', 'name slug').sort({ createdAt: -1 }).limit(48).lean(),
    Category.find().sort({ name: 1 }).lean(),
  ]);

  const shapedProducts = products.map(shapeProduct);
  const counts = shapedProducts.reduce((map, product) => {
    if (product.category) map.set(product.category, (map.get(product.category) || 0) + 1);
    return map;
  }, new Map());

  const featuredPicks = shapedProducts.filter((product) => product.featured);
  const sellerPicks = shapedProducts.filter((product) => product.bestSeller);
  const salePicks = shapedProducts.filter((product) => product.originalPrice > product.price);
  const used = new Set();
  const takeUnique = (source, limit = 8) => {
    const picked = [];
    for (const product of source) {
      if (!product.id || used.has(product.id)) continue;
      used.add(product.id);
      picked.push(product);
      if (picked.length >= limit) break;
    }
    return picked;
  };
  const promo = banners.find((banner) => banner.placement === 'promo');
  const center = banners.find((banner) => banner.placement === 'deal-center');

  return {
    hero: banners.filter((banner) => banner.placement === 'hero').map(shapeBanner),
    promo: promo ? shapeBanner(promo) : null,
    deal: {
      sides: banners.filter((banner) => banner.placement === 'deal-side').map(shapeBanner),
      center: center ? shapeBanner(center) : null,
    },
    testimonials: reviews.map((review) => ({
      id: String(review._id),
      name: review.name,
      role: review.role || '',
      location: review.location || '',
      avatar: review.avatar || '',
      rating: review.rating || 5,
      text: review.text,
    })),
    categories: categories.map((category) => shapeCategory(category, counts.get(category.slug) || 0)),
    featured: takeUnique(featuredPicks.length ? featuredPicks : shapedProducts),
    bestSellers: takeUnique(sellerPicks.length ? sellerPicks : salePicks),
    newArrivals: takeUnique(shapedProducts),
  };
}
