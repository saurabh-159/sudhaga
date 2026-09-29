import { decodeProtectedHeader, importX509, jwtVerify } from 'jose';

const CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

let cache = { keys: null, expires: 0 };

async function signingKeys() {
  if (cache.keys && Date.now() < cache.expires) return cache.keys;

  const res = await fetch(CERTS_URL);
  if (!res.ok) throw new Error('Could not verify Google login');

  const certs = await res.json();
  const keys = {};
  await Promise.all(
    Object.entries(certs).map(async ([kid, pem]) => {
      keys[kid] = await importX509(pem, 'RS256');
    }),
  );

  const maxAge = Number(res.headers.get('cache-control')?.match(/max-age=(\d+)/)?.[1] || 3600);
  cache = { keys, expires: Date.now() + maxAge * 1000 };
  return keys;
}

export async function verifyFirebaseIdToken(idToken) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error('Google login is not configured');

  const { kid } = decodeProtectedHeader(idToken);
  const key = kid ? (await signingKeys())[kid] : null;
  if (!key) throw new Error('Could not verify Google login');

  const { payload } = await jwtVerify(idToken, key, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });

  if (payload.firebase?.sign_in_provider !== 'google.com') {
    throw new Error('Use Google to sign in');
  }
  if (!payload.email || payload.email_verified === false) {
    throw new Error('Google account email is not verified');
  }

  return payload;
}
