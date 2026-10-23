import bcrypt from 'bcryptjs';
import { db } from '@/lib/supabase';
import { createSession } from '@/lib/auth';
import { json, fail } from '@/lib/api';
import { rateLimit, clientIp } from '@/lib/ratelimit';

export async function POST(req) {
  if (rateLimit(`login:${clientIp(req)}`, 10, 15 * 60 * 1000)) return fail('محاولات كتير، جرّب بعد شوية', 429);
  const b = await req.json().catch(() => ({}));
  const email = String(b.email || '').trim().toLowerCase();
  const { data: user } = await db().from('users').select('id,name,role,password_hash').ilike('email', email).maybeSingle();
  // same message for unknown email and wrong password
  if (!user || !(await bcrypt.compare(String(b.password || ''), user.password_hash))) {
    return fail('البريد أو كلمة المرور غير صحيحة', 401);
  }
  await createSession(user.id);
  return json({ user: { id: user.id, name: user.name, role: user.role } });
}
