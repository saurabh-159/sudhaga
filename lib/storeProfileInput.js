function fail(message) {
  const error = new Error(message);
  error.status = 400;
  throw error;
}

function clean(value, max = 200) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function emailOk(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export const STORE_DEFAULTS = {
  key: 'store',
  legalName: 'Sudhaga',
  email: 'support@sudhaga.com',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
  grievanceName: '',
  grievanceDesignation: 'Grievance Officer',
  grievanceEmail: '',
  grievancePhone: '',
  contactIntro:
    'Write to us about an order, a product, shipping, or a return. Include your order number if you already placed an order. We reply by email.',
};

export function readStoreProfile(body = {}) {
  const legalName = clean(body.legalName, 120);
  const email = clean(body.email, 160).toLowerCase();
  if (legalName.length < 2) fail('Seller name is required');
  if (!emailOk(email)) fail('A valid support email is required');

  const grievanceEmail = clean(body.grievanceEmail, 160).toLowerCase();
  if (grievanceEmail && !emailOk(grievanceEmail)) fail('Grievance email is not valid');

  const pincode = clean(body.pincode, 10);
  if (pincode && !/^\d{6}$/.test(pincode)) fail('PIN code must be 6 digits');

  const contactIntro = clean(body.contactIntro, 600);

  return {
    legalName,
    email,
    phone: clean(body.phone, 20),
    addressLine1: clean(body.addressLine1, 200),
    addressLine2: clean(body.addressLine2, 200),
    city: clean(body.city, 80),
    state: clean(body.state, 80),
    pincode,
    country: clean(body.country, 80) || 'India',
    grievanceName: clean(body.grievanceName, 120),
    grievanceDesignation: clean(body.grievanceDesignation, 80) || 'Grievance Officer',
    grievanceEmail,
    grievancePhone: clean(body.grievancePhone, 20),
    contactIntro,
  };
}

export function addressLines(profile) {
  const street = [profile.addressLine1, profile.addressLine2].filter(Boolean).join(', ');
  const city = [profile.city, profile.state].filter(Boolean).join(', ');
  if (!street && !city && !profile.pincode) return [];
  return [street, city, [profile.pincode, profile.country].filter(Boolean).join(' ')].filter(Boolean);
}

export function shapeStoreProfile(doc = {}) {
  const intro = String(doc.contactIntro || '').trim();
  return {
    legalName: doc.legalName || STORE_DEFAULTS.legalName,
    email: doc.email || STORE_DEFAULTS.email,
    phone: doc.phone || '',
    addressLine1: doc.addressLine1 || '',
    addressLine2: doc.addressLine2 || '',
    city: doc.city || '',
    state: doc.state || '',
    pincode: doc.pincode || '',
    country: doc.country || 'India',
    grievanceName: doc.grievanceName || '',
    grievanceDesignation: doc.grievanceDesignation || 'Grievance Officer',
    grievanceEmail: doc.grievanceEmail || '',
    grievancePhone: doc.grievancePhone || '',
    contactIntro: intro || STORE_DEFAULTS.contactIntro,
  };
}
