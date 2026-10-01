import { connection } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Policy from '@/models/Policy';
import { policySlug } from '@/lib/policyInput';

export { SYSTEM_PATHS, policyPath } from '@/lib/policyInput';

const SEED = [
  {
    title: 'Shipping',
    slug: 'shipping',
    summary: 'How Sudhaga ships orders in India, and what happens if a parcel cannot be delivered.',
    body: [
      'Orders are packed after payment is confirmed. Delivery time depends on the address you enter at checkout. Sudhaga ships within India.',
      'If a delivery attempt fails, we use the phone number on the order to reach you. If the parcel comes back to us, email the address on the contact page with your order number. We will arrange another delivery, or refund the items that were not delivered.',
      'The delivery charge is calculated at checkout and shown before you pay. That is the amount that applies to the order.',
    ].join('\n\n'),
    published: true,
    system: true,
    sort: 1,
  },
  {
    title: 'Returns and refunds',
    slug: 'returns',
    summary: 'How to ask for a return, what cannot be returned, and how refunds are paid.',
    body: [
      'You can ask for a return within 7 days of delivery. Email the support address on the contact page with your order number and the reason.',
      'The item should be unused, with tags attached, and in its original packing. Personal-care items, and anything worn, washed, or damaged after delivery, are not returnable.',
      'Approved refunds go back to the original payment method. If an order is cancelled after payment, the refund is started once the cancellation is confirmed and typically completes within 3–5 business days, depending on the bank or Razorpay.',
      'The website does not offer a direct exchange. If you need a different size or colour, return the original item when it is eligible and place a new order.',
    ].join('\n\n'),
    published: true,
    system: true,
    sort: 2,
  },
  {
    title: 'Privacy policy',
    slug: 'privacy',
    summary: 'What personal details Sudhaga collects, why, and how to ask for a correction or deletion.',
    body: [
      'Sudhaga collects the details needed to take an order and to reply to you: your name, email, phone number, shipping address, and the items you buy. If you create an account, we store those details so you can sign in and see past orders. If you sign in with Google, we receive the name, email, and profile photo Google shares with us.',
      'Checkout uses this information to deliver the parcel and to send order updates. Payments are handled by Razorpay. Sudhaga does not store your card number or UPI PIN. Razorpay receives the payment details under its own terms.',
      'We use this information to process orders, prevent fraud, answer support requests, and keep records we need for tax. We do not sell your personal information.',
      'You can ask us to correct or delete the personal information we hold, except where we must keep an order record for tax or a dispute. Write to the email on the contact page. A complaint about personal data can go to the grievance officer listed there.',
      'This store handles personal data under the Information Technology Act, 2000, the rules on sensitive personal data, and the Digital Personal Data Protection Act, 2023, to the extent they apply.',
    ].join('\n\n'),
    published: true,
    system: true,
    sort: 3,
  },
  {
    title: 'Terms and conditions',
    slug: 'terms',
    summary: 'The rules for browsing Sudhaga and placing an order, including price, payment, and liability.',
    body: [
      'These terms apply when you browse Sudhaga or place an order. The seller name, address, phone, email, and grievance officer are on the contact page.',
      'Prices are in Indian rupees. The total on the checkout page, including delivery and tax, is the amount you agree to pay. An order is accepted when payment succeeds and you see an order confirmation.',
      'You agree to give a delivery address and phone number we can use. We may cancel an order if payment fails, the item is out of stock, or the address cannot be delivered. If we cancel after payment, the amount is refunded to the original payment method.',
      'The goods remain our responsibility until delivery. After delivery, the returns page explains what can be sent back.',
      'Use of the website is for genuine shopping. You may not misuse accounts, coupons, or checkout.',
      'To the extent the law allows, Sudhaga’s liability for an order is limited to the amount you paid for that order. These terms do not remove rights you have under Indian consumer law.',
      'The shipping, returns, and privacy pages are part of these terms. Questions can go to the contact page.',
    ].join('\n\n'),
    published: true,
    system: true,
    sort: 4,
  },
];

function shape(policy) {
  return {
    id: policy._id ? String(policy._id) : policy.slug,
    title: policy.title,
    slug: policy.slug,
    summary: policy.summary || '',
    body: policy.body || '',
    published: policy.published !== false,
    system: Boolean(policy.system),
    sort: policy.sort || 100,
    updatedAt: policy.updatedAt ? new Date(policy.updatedAt).toISOString() : null,
  };
}

export function fallbackPolicy(slug) {
  const seed = SEED.find((item) => item.slug === slug);
  if (!seed) return null;
  return shape(seed);
}

export async function ensurePolicies() {
  await connectDB();
  await Promise.all(
    SEED.map((policy) => Policy.updateOne({ slug: policy.slug }, { $setOnInsert: policy }, { upsert: true }))
  );
}

export async function uniquePolicySlug(preferred, currentId) {
  const base = policySlug(preferred);
  let slug = base;
  let n = 2;
  while (await Policy.exists({ slug, ...(currentId ? { _id: { $ne: currentId } } : {}) })) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

export async function loadPublicPolicy(slug) {
  try {
    await connection();
    await ensurePolicies();
    const doc = await Policy.findOne({ slug, published: true });
    if (doc) return shape(doc);
  } catch {
    // The seeded copy still renders if the database is unavailable.
  }
  return fallbackPolicy(slug);
}

export async function getPublishedCustomPolicy(slug) {
  await connection();
  await connectDB();
  await ensurePolicies();
  const doc = await Policy.findOne({ slug, published: true, system: false });
  return doc ? shape(doc) : null;
}

export async function listExtraPolicies() {
  try {
    await connection();
    await ensurePolicies();
    const docs = await Policy.find({ published: true, system: false }).sort({ title: 1 });
    return docs.map(shape);
  } catch {
    return [];
  }
}
