import { cache } from 'react';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function plainAttributes(attributes) {
  if (!Array.isArray(attributes)) return [];
  return attributes
    .map((row) => {
      const options = Array.isArray(row?.options)
        ? row.options
            .filter((option) => option?.slug && option.value != null && String(option.value) !== '')
            .map((option) => ({
              name: option.name || option.slug,
              slug: option.slug,
              value: String(option.value),
            }))
        : [];
      if (!options.length || row?.price == null || row.price === '') return null;
      return { price: Number(row.price), options };
    })
    .filter(Boolean);
}

export function toPublicProduct(product) {
  if (!product) return null;
  const category = product.category;
  const slug = category && typeof category === 'object' ? category.slug || '' : String(category || '');
  return {
    id: String(product._id || product.id),
    slug: product.slug || '',
    name: product.name || '',
    description: product.description || '',
    image: product.image || '',
    images: Array.isArray(product.images) ? product.images.filter(Boolean) : [],
    price: Number(product.price || 0),
    originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
    stock: product.stock ?? 0,
    rating: Number(product.rating || 0),
    numReviews: Number(product.numReviews || 0),
    category: slug,
    categoryName: category && typeof category === 'object' ? category.name || '' : '',
    seoTitle: product.seoTitle || '',
    metaDescription: product.metaDescription || '',
    focusKeyword: product.focusKeyword || '',
    imageAlt: product.imageAlt || '',
    attributes: plainAttributes(product.attributes),
  };
}

function toPublicCategory(category, count = 0) {
  return {
    id: String(category._id),
    name: category.name || '',
    slug: category.slug || '',
    blurb: category.blurb || '',
    image: category.image || '',
    imageFocus: category.imageFocus || 'center',
    imageFit: category.imageFit || '',
    imageBg: category.imageBg || '',
    seoTitle: category.seoTitle || '',
    metaDescription: category.metaDescription || '',
    focusKeyword: category.focusKeyword || '',
    imageAlt: category.imageAlt || '',
    answerText: category.answerText || '',
    count,
  };
}

async function countByCategoryId() {
  const counts = await Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
  return new Map(counts.map((row) => [String(row._id), row.count]));
}

function isObjectId(id) {
  const value = String(id || '');
  return mongoose.Types.ObjectId.isValid(value) && String(new mongoose.Types.ObjectId(value)) === value;
}

async function loadProduct(filter) {
  await connectDB();
  const product = await Product.findOne(filter).populate('category', 'name slug').lean();
  return toPublicProduct(product);
}

export const getProductById = cache(async (id) => {
  if (!isObjectId(id)) return null;
  return loadProduct({ _id: id });
});

export const resolveProductPath = cache(async (param) => {
  const key = String(param || '').trim();
  if (!key) return null;
  const bySlug = await loadProduct({ slug: key });
  if (bySlug) return { product: bySlug };
  if (!isObjectId(key)) return null;
  const byId = await loadProduct({ _id: key });
  if (!byId) return null;
  if (byId.slug) return { redirect: `/products/${byId.slug}` };
  return { product: byId };
});

export const getRelatedProducts = cache(async (product) => {
  if (!product?.id || !product.category) return [];
  await connectDB();
  const category = await Category.findOne({ slug: product.category }).select('_id').lean();
  if (!category) return [];
  const rows = await Product.find({ category: category._id, _id: { $ne: product.id } })
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();
  return rows.map(toPublicProduct);
});

export const listProducts = cache(async (page = 1, limit = 12, search = '') => {
  await connectDB();
  const safeLimit = Math.min(48, Math.max(1, Number(limit) || 12));
  const filter = {};
  const term = String(search || '').trim();
  if (term) filter.name = { $regex: escapeRegex(term), $options: 'i' };
  const total = await Product.countDocuments(filter);
  const pages = total ? Math.ceil(total / safeLimit) : 0;
  const requested = Number.parseInt(String(page || '1'), 10);
  const safePage = pages ? Math.min(Math.max(1, Number.isFinite(requested) ? requested : 1), pages) : 1;
  const products = await Product.find(filter)
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit)
    .lean();
  return {
    products: products.map(toPublicProduct),
    total,
    page: safePage,
    pages,
  };
});

export const listCategories = cache(async () => {
  await connectDB();
  const [categories, counts] = await Promise.all([
    Category.find().sort({ createdAt: -1 }).lean(),
    countByCategoryId(),
  ]);
  return categories.map((category) => toPublicCategory(category, counts.get(String(category._id)) || 0));
});

export const getCategoryView = cache(async (slug) => {
  const key = String(slug || '').trim();
  if (!key) return null;
  await connectDB();
  const category = await Category.findOne({ slug: key }).lean();
  if (!category) return null;
  const [products, others, counts] = await Promise.all([
    Product.find({ category: category._id }).populate('category', 'name slug').sort({ createdAt: -1 }).lean(),
    Category.find({ _id: { $ne: category._id } }).sort({ createdAt: -1 }).limit(4).lean(),
    countByCategoryId(),
  ]);
  return {
    category: toPublicCategory(category, counts.get(String(category._id)) || 0),
    products: products.map(toPublicProduct),
    others: others.map((item) => toPublicCategory(item, counts.get(String(item._id)) || 0)),
  };
});

export async function listSitemapEntries() {
  await connectDB();
  const [products, categories] = await Promise.all([
    Product.find().select('slug updatedAt').lean(),
    Category.find().select('slug updatedAt').lean(),
  ]);
  return {
    products: products
      .filter((product) => product.slug)
      .map((product) => ({
        slug: product.slug,
        updatedAt: product.updatedAt || null,
      })),
    categories: categories
      .filter((category) => category.slug)
      .map((category) => ({
        slug: category.slug,
        updatedAt: category.updatedAt || null,
      })),
  };
}
