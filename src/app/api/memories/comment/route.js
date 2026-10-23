import { db } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { json, fail } from '@/lib/api';

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return fail('سجّل دخولك الأول', 401);
  const { memory_id, body } = await req.json().catch(() => ({}));
  const text = String(body || '').trim();
  if (!memory_id || text.length < 1 || text.length > 500) return fail('اكتب تعليق (حتى 500 حرف)');
  const { data: mem } = await db().from('memories').select('id').eq('id', memory_id).eq('status', 'published').maybeSingle();
  if (!mem) return fail('الذكرى مش موجودة', 404);
  const { error } = await db().from('memory_comments').insert({ memory_id, user_id: user.id, body: text });
  return error ? fail('تعذر الإرسال', 500) : json({ ok: true });
}
