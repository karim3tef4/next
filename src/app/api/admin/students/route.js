import { db } from '@/lib/supabase';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { json, fail } from '@/lib/api';

export async function POST(req) {
  const admin = await getCurrentUser();
  if (!isAdmin(admin, 'merchants')) return fail('غير مصرح', 403);
  const { user_id, action } = await req.json().catch(() => ({}));
  if (!user_id || !['approve', 'reject'].includes(action)) return fail('بيانات غير صحيحة');
  const approved = action === 'approve';
  await db().from('users').update({ student_status: approved ? 'approved' : 'rejected' }).eq('id', user_id).eq('student_status', 'pending');
  await db().from('notifications').insert({
    user_id, title: approved ? 'تم توثيق حساب الطالب' : 'تعذر توثيق كارنيه الطالب',
    body: approved ? 'حسابك الآن موثق كطالب.' : 'ارفع صورة أوضح للكارنيه وحاول تاني.',
  });
  return json({ ok: true });
}
