export function readTestimonialBody(body = {}) {
  const name = String(body.name || '').trim();
  const text = String(body.text || '').trim();
  const rating = Number(body.rating);
  const order = Number(body.order);

  if (name.length < 2) fail('Name is required');
  if (text.length < 8) fail('Review text is too short');
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) fail('Rating must be between 1 and 5');

  return {
    name,
    role: String(body.role || '').trim(),
    location: String(body.location || '').trim(),
    avatar: String(body.avatar || '').trim(),
    rating,
    text,
    order: Number.isFinite(order) ? order : 0,
    active: body.active !== false && body.active !== 'false',
  };
}

function fail(message) {
  const error = new Error(message);
  error.status = 400;
  throw error;
}
