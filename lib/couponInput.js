export function readCouponBody(body = {}) {
  const code = String(body.code || '').trim().toUpperCase();
  const type = body.type === 'flat' ? 'flat' : body.type === 'percent' ? 'percent' : '';
  const value = Number(body.value);
  const minSubtotal = Math.max(0, Number(body.minSubtotal) || 0);
  const maxUsesRaw = body.maxUses === '' || body.maxUses == null ? null : Number(body.maxUses);
  const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;

  if (!code) fail('Coupon code is required');
  if (!type) fail('Choose percent or flat discount');
  if (!Number.isFinite(value) || value <= 0) fail('Enter a discount greater than 0');
  if (type === 'percent' && value > 100) fail('Percent discount cannot be more than 100');
  if (maxUsesRaw != null && (!Number.isInteger(maxUsesRaw) || maxUsesRaw < 1)) {
    fail('Usage limit must be a whole number');
  }
  if (expiresAt && Number.isNaN(expiresAt.getTime())) fail('Expiry date is not valid');

  return {
    code,
    description: String(body.description || '').trim(),
    type,
    value,
    minSubtotal,
    maxUses: maxUsesRaw,
    expiresAt,
    active: body.active !== false && body.active !== 'false',
    oncePerUser: body.oncePerUser !== false && body.oncePerUser !== 'false',
  };
}

function fail(message) {
  const error = new Error(message);
  error.status = 400;
  throw error;
}
