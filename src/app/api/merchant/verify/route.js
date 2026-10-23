import { db } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { json, fail } from '@/lib/api';
import { rateLimit } from '@/lib/ratelimit';

// The UPDATE ... WHERE status='active' is atomic, so a code can never be used
// twice, even with two simultaneous requests.
export async function POST(req) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'merchant') return fail('للتجار فقط', 403);

  const { data: m } = await db().from('merchants').select('status').eq('user_id', user.id).maybeSingle();
  if (m?.status !== 'approved') return fail('حساب التاجر لسه مش معتمد', 403);

  if (rateLimit(`verify:${user.id}`, 30, 10 * 60 * 1000)) return fail('محاولات كتير، استنى شوية', 429);
  const { code } = await req.json().catch(() => ({}));
  const clean = String(code || '').trim().toUpperCase();
  if (!clean) return fail('اكتب الكود');

  const { data: c } = await db().from('discount_codes').select('*').eq('code', clean).maybeSingle();
  if (!c) return fail('الكود غير صحيح', 404);
  if (c.status === 'used') return fail('الكود ده اتستخدم قبل كده', 409);
  if (c.status !== 'active' || new Date(c.expires_at) < new Date()) return fail('الكود منتهي الصلاحية', 410);

  let usedPlace = null;
  if (c.place_id) {
    // loyalty codes only work at the shop they were earned in
    const { data: own } = await db().from('places').select('id').eq('id', c.place_id).eq('merchant_id', user.id).maybeSingle();
    if (!own) return fail('الكود ده خاص بمحل تاني', 403);
    usedPlace = c.place_id;
  }

  const S = await getSettings();
  const { data: updated } = await db().from('discount_codes').update({
    status: 'used', used_at: new Date().toISOString(), used_by_merchant: user.id,
    used_place_id: usedPlace, platform_fee_egp: S.platform_fee_per_code_egp,
  }).eq('id', c.id).eq('status', 'active').select('id').maybeSingle();
  if (!updated) return fail('الكود ده اتستخدم قبل كده', 409);

  return json({ ok: true, percent: c.percent });
}
