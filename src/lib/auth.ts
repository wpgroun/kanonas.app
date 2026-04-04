import { SignJWT, jwtVerify } from 'jose'

// In production, JWT_SECRET MUST be set in environment variables.
// A missing secret would allow anyone to forge admin sessions.
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('[Kanonas] FATAL: JWT_SECRET environment variable is not set. Aborting startup.');
}
const secretKey = process.env.JWT_SECRET ?? 'kanonas_dev_only_fallback_do_not_use_in_prod';
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch(e) {
    return null;
  }
}

import { cookies } from 'next/headers';

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('Kanonas_auth')?.value;
  if (!token) return null;
  return await decrypt(token);
}


