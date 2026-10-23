import { db } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { json, fail } from '@/lib/api';

const PERMS = ['merchants', 'content', 'points', 'complaints', 'reports'];

// Owner only: promote/demote users and pick which sections an admin can use.
export async function POST(req) {
  const me = await getCurrentUser();
  if (me?.role !== 'owner') return fail('للمالك فقط', 403);
  const { email, role, permissions } = await req.json().catch(() => ({}));
  if (!['user', 'admin'].includes(role)) return fail('الدور غير صحيح');

  const { data: target } = await db().from('users').select('id,role').ilike('email', String(email || '').trim()).maybeSingle();
  if (!target) return fail('مفيش مستخدم بالبريد ده', 404);
  if (target.id === me.id) return fail('مينفعش تغيّر صلاحياتك أنت');
  if (target.role === 'owner') return fail('مينفعش تعدّل مالك آخر', 403);
  if (target.role === 'merchant' && role === 'user') return fail('ده حساب تاجر، عدّله من طلبات التجار', 409);

  const perms = role === 'admin' ? (permissions || []).filter((p) => PERMS.includes(p)) : [];
  const { error } = await db().from('users').update({ role, permissions: perms }).eq('id', target.id);
  return error ? fail('تعذر الحفظ', 500) : json({ ok: true });
}
