'use client';

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { firebaseConfig, isFirebaseConfigured } from '@/lib/firebaseConfig';

export async function signInWithGoogle() {
  if (!isFirebaseConfigured()) {
    throw new Error('Google login is not configured. Add the Firebase web config to .env.local.');
  }

  const app = getApps()[0] || initializeApp(firebaseConfig());
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result.user.getIdToken();
}
