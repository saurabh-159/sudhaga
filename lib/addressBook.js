export function shippingEntry(shipping) {
  if (!shipping) return null;
  const line1 = String(shipping.address || shipping.line1 || '').trim();
  if (!line1) return null;
  return {
    name: String(shipping.name || '').trim(),
    phone: String(shipping.phone || '').trim(),
    email: String(shipping.email || '').trim(),
    line1,
    city: String(shipping.city || '').trim(),
    state: String(shipping.state || '').trim(),
    pincode: String(shipping.pincode || '').trim(),
  };
}

export function addressKey(entry) {
  return [entry?.line1, entry?.city, entry?.pincode]
    .map((value) => String(value || '').trim().toLowerCase())
    .join('|');
}

export function addressesFromUser(user) {
  if (!user) return [];
  const seen = new Set();
  const list = [];

  function push(entry) {
    const normalized = shippingEntry({
      name: entry?.name || user.name || '',
      phone: entry?.phone || user.phone || '',
      email: entry?.email || user.email || '',
      address: entry?.line1 || entry?.address || '',
      city: entry?.city || '',
      state: entry?.state || '',
      pincode: entry?.pincode || '',
    });
    if (!normalized) return;
    const key = addressKey(normalized);
    if (seen.has(key)) return;
    seen.add(key);
    list.push(normalized);
  }

  (Array.isArray(user.addresses) ? user.addresses : []).forEach(push);
  if (user.address?.line1) {
    push({
      name: user.name,
      phone: user.phone,
      email: user.email,
      line1: user.address.line1,
      city: user.address.city,
      state: user.address.state,
      pincode: user.address.pincode,
    });
  }
  return list;
}

export const emptyShipping = {
  name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
};

export function draftFromEntry(entry, user) {
  return {
    name: entry?.name || user?.name || '',
    phone: entry?.phone || user?.phone || '',
    email: entry?.email || user?.email || '',
    address: entry?.line1 || entry?.address || '',
    city: entry?.city || '',
    state: entry?.state || '',
    pincode: entry?.pincode || '',
  };
}

export function draftFromUser(user) {
  const saved = addressesFromUser(user);
  if (saved[0]) return draftFromEntry(saved[0], user);
  return {
    ...emptyShipping,
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
  };
}

export function draftIsBlank(draft) {
  if (!draft) return true;
  return !draft.address && !draft.city && !draft.pincode && !draft.name && !draft.phone && !draft.email;
}

export function streetIsBlank(draft) {
  if (!draft) return true;
  return !String(draft.address || '').trim() && !String(draft.city || '').trim() && !String(draft.pincode || '').trim();
}
