import { SignJWT, jwtVerify } from 'jose'

const secretKey = process.env.JWT_SECRET || 'super_secret_church_os_jwt_key_2026_dev_mode';
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

