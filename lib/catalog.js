import { cache } from 'react';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { PRICE_RANGES, SORT_MAP, priceBounds } from '@/lib/listingQuery';
import { assignSkus, needsSku } from '@/lib/sku';

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
      return { sku: row.sku || '', price: Number(row.price), options };
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
    sku: product.sku || '',
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
  const product = await Product.findOne(filter).populate('category', 'name slug');
  if (!product) return null;
  if (needsSku(product)) await assignSkus(product);
  return toPublicProduct(product.toObject());
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

const SIZE_ORDER = ['xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl', 'free size'];
const GROUP_ORDER = ['size', 'color', 'colour', 'fabric', 'occasion', 'work'];

function emptyListing() {
  return { products: [], total: 0, page: 1, pages: 0 };
}

export function emptyFacets() {
  return { categories: [], priceRanges: [], inStock: 0, onSale: 0, attributes: [] };
}

function sortFacetOptions(slug, options) {
  const copy = [...options];
  if (slug !== 'size') {
    copy.sort((a, b) => a.value.localeCompare(b.value));
    return copy;
  }
  copy.sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(a.value.toLowerCase());
    const bi = SIZE_ORDER.indexOf(b.value.toLowerCase());
    if (ai === -1 && bi === -1) return a.value.localeCompare(b.value);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
  return copy;
}

function attributeClauses(attrs) {
  return Object.entries(attrs || {})
    .filter(([, values]) => values?.length)
    .map(([slug, values]) => ({
      'attributes.options': {
        $elemMatch: {
          slug: { $regex: `^${escapeRegex(slug)}$`, $options: 'i' },
          value: { $in: values },
        },
      },
    }));
}

async function buildProductFilter({ categorySlug = '', filters }) {
  const filter = {};
  const clauses = attributeClauses(filters.attrs);
  if (categorySlug) {
    const category = await Category.findOne({ slug: categorySlug }).select('_id').lean();
    if (!category) return null;
    filter.category = category._id;
  } else if (filters.categories?.length) {
    const categories = await Category.find({ slug: { $in: filters.categories } })
      .select('_id')
      .lean();
    if (!categories.length) return { empty: true };
    filter.category = { $in: categories.map((category) => category._id) };
  }
  const term = String(filters.search || '').trim();
  if (term) filter.name = { $regex: escapeRegex(term), $options: 'i' };
  if (filters.min != null || filters.max != null) {
    filter.price = priceBounds(filters.min, filters.max);
  }
  if (filters.inStock) filter.stock = { $gt: 0 };
  if (filters.onSale) clauses.push({ $expr: { $gt: ['$originalPrice', '$price'] } });
  if (clauses.length) filter.$and = clauses;
  return filter;
}

export async function listFilteredProducts({ page = 1, limit = 12, categorySlug = '', filters }) {
  await connectDB();
  const safeLimit = Math.min(48, Math.max(1, Number(limit) || 12));
  const filter = await buildProductFilter({ categorySlug, filters });
  if (!filter) return null;
  if (filter.empty) return emptyListing();
  const total = await Product.countDocuments(filter);
  const pages = total ? Math.ceil(total / safeLimit) : 0;
  const requested = Number.parseInt(String(page || '1'), 10);
  const safePage = pages ? Math.min(Math.max(1, Number.isFinite(requested) ? requested : 1), pages) : 1;
  const products = total
    ? await Product.find(filter)
        .populate('category', 'name slug')
        .sort(SORT_MAP[filters.sort] || SORT_MAP.newest)
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit)
        .lean()
    : [];
  return {
    products: products.map(toPublicProduct),
    total,
    page: safePage,
    pages,
  };
}

export async function getListingFacets({ categorySlug = '', search = '' } = {}) {
  await connectDB();
  const match = {};
  if (categorySlug) {
    const category = await Category.findOne({ slug: categorySlug }).select('_id').lean();
    if (!category) return null;
    match.category = category._id;
  }
  const term = String(search || '').trim();
  if (term) match.name = { $regex: escapeRegex(term), $options: 'i' };

  const [doc] = await Product.aggregate([
    { $match: match },
    {
      $facet: {
        ranges: [
          {
            $group: {
              _id: null,
              under5000: { $sum: { $cond: [{ $lte: ['$price', 5000] }, 1, 0] } },
              mid: {
                $sum: {
                  $cond: [{ $and: [{ $gte: ['$price', 5001] }, { $lte: ['$price', 8000] }] }, 1, 0],
                },
              },
              high: {
                $sum: {
                  $cond: [{ $and: [{ $gte: ['$price', 8001] }, { $lte: ['$price', 12000] }] }, 1, 0],
                },
              },
              over: { $sum: { $cond: [{ $gte: ['$price', 12001] }, 1, 0] } },
            },
          },
        ],
        stock: [{ $match: { stock: { $gt: 0 } } }, { $count: 'n' }],
        sale: [{ $match: { $expr: { $gt: ['$originalPrice', '$price'] } } }, { $count: 'n' }],
        categories: [{ $group: { _id: '$category', count: { $sum: 1 } } }],
        attributes: [
          { $unwind: '$attributes' },
          { $unwind: '$attributes.options' },
          {
            $group: {
              _id: { slug: '$attributes.options.slug', value: '$attributes.options.value' },
              name: { $first: '$attributes.options.name' },
              ids: { $addToSet: '$_id' },
            },
          },
          {
            $project: {
              slug: '$_id.slug',
              value: '$_id.value',
              name: 1,
              count: { $size: '$ids' },
            },
          },
        ],
      },
    },
  ]);

  const rangeRow = doc?.ranges?.[0] || {};
  const rangeCounts = [rangeRow.under5000 || 0, rangeRow.mid || 0, rangeRow.high || 0, rangeRow.over || 0];
  const groups = new Map();
  for (const row of doc?.attributes || []) {
    const slug = String(row.slug || '').trim().toLowerCase();
    const value = String(row.value || '').trim();
    if (!slug || !value) continue;
    if (!groups.has(slug)) {
      groups.set(slug, { slug, name: row.name || slug, options: [] });
    }
    const group = groups.get(slug);
    if (!group.options.some((option) => option.value === value)) {
      group.options.push({ value, count: row.count || 0 });
    }
  }
  const attributes = [...groups.values()]
    .map((group) => ({ ...group, options: sortFacetOptions(group.slug, group.options) }))
    .filter((group) => group.options.length)
    .sort((a, b) => {
      const ai = GROUP_ORDER.indexOf(a.slug);
      const bi = GROUP_ORDER.indexOf(b.slug);
      if (ai === -1 && bi === -1) return a.name.localeCompare(b.name);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

  let categories = [];
  if (!categorySlug) {
    const rows = doc?.categories || [];
    const ids = rows.map((row) => row._id).filter(Boolean);
    const found = ids.length ? await Category.find({ _id: { $in: ids } }).select('name slug').lean() : [];
    const byId = new Map(found.map((category) => [String(category._id), category]));
    categories = rows
      .map((row) => {
        const category = byId.get(String(row._id));
        if (!category?.slug) return null;
        return { slug: category.slug, name: category.name || category.slug, count: row.count || 0 };
      })
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  return {
    categories,
    priceRanges: PRICE_RANGES.map((range, index) => ({ ...range, count: rangeCounts[index] })).filter(
      (range) => range.count > 0,
    ),
    inStock: doc?.stock?.[0]?.n || 0,
    onSale: doc?.sale?.[0]?.n || 0,
    attributes,
  };
}

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
