import { storePath } from '@/lib/storePath';

const PLACEMENTS = ['hero', 'promo', 'deal-side', 'deal-center'];

export function readBannerBody(body = {}) {
  const placement = String(body.placement || '').trim();
  if (!PLACEMENTS.includes(placement)) fail('Choose a valid banner placement');

  const title = String(body.title || '').trim();
  if (!title) fail('Title is required');

  const endsAt = body.endsAt ? new Date(body.endsAt) : null;
  if (endsAt && Number.isNaN(endsAt.getTime())) fail('End time is not valid');

  const order = Number(body.order);
  return {
    placement,
    title,
    subtitle: String(body.subtitle || '').trim(),
    badge: String(body.badge || '').trim(),
    href: storePath(body.href),
    cta: String(body.cta || '').trim(),
    code: String(body.code || '').trim().toUpperCase(),
    image: String(body.image || '').trim(),
    hoverImage: String(body.hoverImage || '').trim(),
    imageAlt: String(body.imageAlt || '').trim(),
    accent: body.accent === true || body.accent === 'true',
    endsAt,
    order: Number.isFinite(order) ? order : 0,
    active: body.active !== false && body.active !== 'false',
  };
}

function fail(message) {
  const error = new Error(message);
  error.status = 400;
  throw error;
}
