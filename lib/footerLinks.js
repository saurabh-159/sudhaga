import { connection } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import FooterLink from '@/models/FooterLink';

const SEED = [
  { section: 'help', label: 'Contact', url: '/contact', published: true, sort: 10 },
  { section: 'help', label: 'Shipping', url: '/shipping', published: true, sort: 20 },
  { section: 'help', label: 'Returns', url: '/returns', published: true, sort: 30 },
  { section: 'help', label: 'Privacy', url: '/privacy', published: true, sort: 40 },
  { section: 'help', label: 'Terms', url: '/terms', published: true, sort: 50 },
  { section: 'help', label: 'About', url: '/about', published: true, sort: 60 },
  { section: 'help', label: 'Blog', url: '/blog', published: true, sort: 70 },
  { section: 'follow', label: 'Instagram', url: '', published: true, sort: 10 },
  { section: 'follow', label: 'Twitter', url: '', published: true, sort: 20 },
  { section: 'follow', label: 'Facebook', url: '', published: true, sort: 30 },
];

function shape(doc) {
  return {
    id: doc._id ? String(doc._id) : doc.id,
    section: doc.section,
    label: doc.label,
    url: doc.url || '',
    published: doc.published !== false,
    sort: doc.sort || 0,
  };
}

export function fallbackHelpLinks() {
  return SEED.filter((item) => item.section === 'help' && item.url).map((item) =>
    shape({ ...item, id: `fallback-${item.label}` })
  );
}

function isDuplicateKey(error) {
  if (error?.code === 11000) return true;
  return Array.isArray(error?.writeErrors) && error.writeErrors.every((item) => item.code === 11000);
}

let indexesReady = false;

async function dedupeFooterLinks() {
  const docs = await FooterLink.find().sort({ updatedAt: -1, createdAt: 1 }).select('_id section label');
  const seen = new Set();
  const remove = [];
  for (const doc of docs) {
    const key = `${doc.section}\0${doc.label}`;
    if (seen.has(key)) remove.push(doc._id);
    else seen.add(key);
  }
  if (remove.length) await FooterLink.deleteMany({ _id: { $in: remove } });
}

async function ensureUniqueIndex() {
  const indexes = await FooterLink.collection.indexes();
  const existing = indexes.find((index) => index.key?.section === 1 && index.key?.label === 1);
  if (existing && !existing.unique) await FooterLink.collection.dropIndex(existing.name);
  if (!existing?.unique) {
    await FooterLink.collection.createIndex({ section: 1, label: 1 }, { unique: true });
  }
}

export async function ensureFooterLinks() {
  await connectDB();
  if (!indexesReady) {
    await dedupeFooterLinks();
    await ensureUniqueIndex();
    indexesReady = true;
  }
  if ((await FooterLink.countDocuments()) > 0) return;
  try {
    await Promise.all(
      SEED.map((item) =>
        FooterLink.updateOne({ section: item.section, label: item.label }, { $setOnInsert: item }, { upsert: true })
      )
    );
  } catch (error) {
    if (!isDuplicateKey(error)) throw error;
  }
}

export async function listFooterLinks() {
  await connectDB();
  await ensureFooterLinks();
  const docs = await FooterLink.find().sort({ section: 1, sort: 1, label: 1 });
  return docs.map(shape);
}

export async function listPublicFooterLinks() {
  try {
    await connection();
    await ensureFooterLinks();
    const docs = await FooterLink.find({ published: true, url: { $nin: ['', null] } }).sort({
      sort: 1,
      label: 1,
    });
    return docs.map(shape);
  } catch {
    return fallbackHelpLinks();
  }
}
