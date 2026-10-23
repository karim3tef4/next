import { db } from '@/lib/supabase';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { json, fail } from '@/lib/api';

export async function POST(req) {
  const admin = await getCurrentUser();
  if (!isAdmin(admin, 'complaints')) return fail('غير مصرح', 403);
  const { id, status, admin_reply } = await req.json().catch(() => ({}));
  if (!id || !['new', 'in_progress', 'resolved'].includes(status)) return fail('بيانات غير صحيحة');

  const { data: c } = await db().from('complaints').select('user_id,admin_reply').eq('id', id).maybeSingle();
  if (!c) return fail('الشكوى مش موجودة', 404);
  const reply = String(admin_reply || '').trim() || null;
  await db().from('complaints').update({ status, admin_reply: reply }).eq('id', id);
  if (c.user_id && reply && reply !== c.admin_reply) {
    await db().from('notifications').insert({ user_id: c.user_id, title: 'رد على شكواك أو اقتراحك', body: reply });
  }
  return json({ ok: true });
}
