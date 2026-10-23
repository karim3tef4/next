import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { db } from './supabase';

const COOKIE = 'hubs_session';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) throw new Error('JWT_SECRET is missing or too short');
  return new TextEncoder().encode(s);
}

export async function createSession(userId) {
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  cookies().set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export function destroySession() {
  cookies().set(COOKIE, '', { path: '/', maxAge: 0 });
}

// Returns the fresh user row (role/points come from the DB, not from the token).
export async function getCurrentUser() {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const { data } = await db()
      .from('users')
      .select('id,name,email,user_type,role,permissions,points_balance,photo_consent')
      .eq('id', payload.uid)
      .maybeSingle();
    return data || null;
  } catch {
    return null;
  }
}

export function isAdmin(user, permission) {
  if (!user) return false;
  if (user.role === 'owner') return true;
  if (user.role !== 'admin') return false;
  return !permission || (user.permissions || []).includes(permission);
}
