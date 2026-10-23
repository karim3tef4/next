import bcrypt from 'bcryptjs';
import { db } from '@/lib/supabase';
import { createSession } from '@/lib/auth';
import { json, fail } from '@/lib/api';
import { rateLimit, clientIp } from '@/lib/ratelimit';

const TYPES = ['student', 'tourist', 'expat', 'local'];

export async function POST(req) {
  if (rateLimit(`register:${clientIp(req)}`, 5, 60 * 60 * 1000)) return fail('محاولات كتير، جرّب بعد شوية', 429);
  const b = await req.json().catch(() => ({}));
  const name = String(b.name || '').trim();
  const email = String(b.email || '').trim().toLowerCase();
  const password = String(b.password || '');
  const userType = TYPES.includes(b.user_type) ? b.user_type : 'tourist';

  if (name.length < 2) return fail('الاسم قصير جدًا');
  if (!/^\S+@\S+\.\S+$/.test(email)) return fail('البريد الإلكتروني غير صحيح');
  if (password.length < 8) return fail('كلمة المرور لازم تكون 8 أحرف على الأقل');

  const { data: exists } = await db().from('users').select('id').ilike('email', email).maybeSingle();
  if (exists) return fail('البريد مسجل قبل كده', 409);

  const { data: user, error } = await db()
    .from('users')
    .insert({
      name, email, user_type: userType,
      password_hash: await bcrypt.hash(password, 10),
      photo_consent: b.photo_consent === true, // explicit checkbox: terms for publishing visit photos
    })
    .select('id,name,user_type,role')
    .single();
  if (error) return fail('تعذر إنشاء الحساب', 500);

  await createSession(user.id);
  return json({ user });
}
