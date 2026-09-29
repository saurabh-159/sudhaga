import dns from 'node:dns';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

dns.setServers(['8.8.8.8', '1.1.1.1']);

function loadEnv() {
  const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function loadDummy() {
  const source = readFileSync(new URL('../lib/dummyData.js', import.meta.url), 'utf8').replace(
    /export const (\w+) =/g,
    'exports.$1 ='
  );
  const sandbox = { exports: {} };
  vm.runInNewContext(source, sandbox, { filename: 'dummyData.js' });
  return sandbox.exports;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const categorySchema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, unique: true },
    blurb: String,
    image: String,
    imageFocus: String,
    imageFit: String,
    imageBg: String,
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, unique: true },
    description: String,
    price: Number,
    originalPrice: Number,
    image: String,
    images: [String],
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    stock: Number,
    rating: Number,
    numReviews: Number,
    featured: Boolean,
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true },
    password: String,
    role: String,
    phone: String,
    address: {
      line1: String,
      city: String,
      state: String,
      pincode: String,
    },
  },
  { timestamps: true }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        qty: Number,
        image: String,
      },
    ],
    shipping: {
      name: String,
      phone: String,
      email: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
    },
    total: Number,
    status: String,
    paymentId: String,
  },
  { timestamps: true }
);

const SEED_PASSWORD = 'Sudhaga@123';

async function main() {
  loadEnv();
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI missing in .env.local');

  const { products, categories, orders, users } = loadDummy();
  await mongoose.connect(uri);

  const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
  const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
  const User = mongoose.models.User || mongoose.model('User', userSchema);
  const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

  const categoryIds = new Map();
  for (const category of categories) {
    const saved = await Category.findOneAndUpdate(
      { slug: category.slug },
      {
        name: category.name,
        slug: category.slug,
        blurb: category.blurb,
        image: category.image,
        imageFocus: category.imageFocus || '',
        imageFit: category.imageFit || '',
        imageBg: category.imageBg || '',
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
    categoryIds.set(category.slug, saved._id);
  }

  const productIds = [];
  for (const [index, product] of products.entries()) {
    const categoryId = categoryIds.get(product.category);
    if (!categoryId) throw new Error(`Unknown category ${product.category} for ${product.name}`);
    const slug = slugify(product.name);
    const saved = await Product.findOneAndUpdate(
      { slug },
      {
        name: product.name,
        slug,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        images: [product.image],
        category: categoryId,
        stock: product.stock,
        rating: product.rating,
        numReviews: 0,
        featured: index < 8,
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
    productIds.push(saved);
  }

  const password = await bcrypt.hash(SEED_PASSWORD, 10);
  const userIds = new Map();
  for (const user of users) {
    const saved = await User.findOneAndUpdate(
      { email: user.email.toLowerCase() },
      {
        name: user.name,
        email: user.email.toLowerCase(),
        password,
        role: user.role === 'admin' ? 'admin' : 'user',
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
    userIds.set(user.email.toLowerCase(), saved);
  }

  const buyer = userIds.get('rahul@example.com') || userIds.values().next().value;
  await Order.deleteMany({ paymentId: /^seed-/ });

  for (const order of orders) {
    const count = Number(order.items) || 1;
    const picks = productIds.slice(0, count);
    const items = picks.map((product) => ({
      product: product._id,
      name: product.name,
      price: product.price,
      qty: 1,
      image: product.image,
    }));
    const total = items.reduce((sum, item) => sum + item.price * item.qty, 0) || order.total;

    await Order.create({
      user: buyer._id,
      items,
      shipping: {
        name: buyer.name,
        email: buyer.email,
        phone: '9876543210',
        address: '12 MG Road',
        city: 'Jaipur',
        state: 'Rajasthan',
        pincode: '302001',
      },
      total,
      status: order.status,
      paymentId: `seed-${order.id}`,
      createdAt: new Date(order.date),
    });
  }

  const [categoryCount, productCount, userCount, orderCount] = await Promise.all([
    Category.countDocuments(),
    Product.countDocuments(),
    User.countDocuments(),
    Order.countDocuments({ paymentId: /^seed-/ }),
  ]);

  console.log(
    JSON.stringify(
      {
        database: mongoose.connection.name,
        categories: categoryCount,
        products: productCount,
        users: userCount,
        orders: orderCount,
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error.message || error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
