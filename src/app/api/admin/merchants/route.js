import { db } from '@/lib/supabase';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { json, fail } from '@/lib/api';

export async function POST(req) {
  const admin = await getCurrentUser();
  if (!isAdmin(admin, 'merchants')) return fail('غير مصرح', 403);

  const { user_id, action, reason } = await req.json().catch(() => ({}));
  if (!user_id || !['approve', 'reject'].includes(action)) return fail('بيانات غير صحيحة');
  if (action === 'reject' && !String(reason || '').trim()) return fail('اكتب سبب الرفض');

  const approved = action === 'approve';
  const { error } = await db().from('merchants').update({
    status: approved ? 'approved' : 'rejected',
    reject_reason: approved ? null : String(reason).trim(),
    reviewed_at: new Date().toISOString(),
  }).eq('user_id', user_id);
  if (error) return fail('تعذر التحديث', 500);

  if (approved) await db().from('users').update({ role: 'merchant' }).eq('id', user_id).eq('role', 'user');
  await db().from('notifications').insert({
    user_id,
    title: approved ? 'تم قبول حساب التاجر' : 'تم رفض طلب التاجر',
    body: approved ? 'تقدر تبدأ تضيف عروضك.' : String(reason).trim(),
  });
  return json({ ok: true });
}
