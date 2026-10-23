import { db } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { json, fail } from '@/lib/api';

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return fail('سجّل دخولك الأول', 401);
  if (user.user_type !== 'student') return fail('الخدمة دي للطلاب فقط', 403);
  const file = (await req.formData()).get('card');
  if (!file || typeof file === 'string' || !(file.type.startsWith('image/') || file.type === 'application/pdf')) return fail('ارفع صورة أو PDF للكارنيه');
  if (file.size > 5 * 1024 * 1024) return fail('الملف أكبر من 5 ميجا');

  const path = `${user.id}/${Date.now()}`;
  const up = await db().storage.from('student-cards').upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type });
  if (up.error) return fail('تعذر رفع الملف', 500);
  await db().from('users').update({ student_card_url: path, student_status: 'pending' }).eq('id', user.id);
  return json({ ok: true });
}
