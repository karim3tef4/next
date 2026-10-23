import { db } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { makeCode } from '@/lib/codes';
import { json, fail } from '@/lib/api';

// Spend points -> discount code (QR + text). The deduction is atomic in SQL.
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return fail('سجّل دخولك الأول', 401);
  const S = await getSettings();
  if (user.points_balance < S.points_per_discount) {
    return fail(`محتاج ${S.points_per_discount} نقطة، رصيدك ${user.points_balance}`);
  }

  const code = makeCode();
  const { data: row, error } = await db().from('discount_codes').insert({
    code, user_id: user.id, kind: 'points', percent: S.discount_percent, points_spent: S.points_per_discount,
    expires_at: new Date(Date.now() + S.code_valid_days * 86400000).toISOString(),
  }).select('id').single();
  if (error) return fail('تعذر إنشاء الكود', 500);

  const { error: spendErr } = await db().rpc('add_points', {
    p_user: user.id, p_delta: -S.points_per_discount, p_reason: `استبدال خصم ${S.discount_percent}%`, p_ref: row.id,
  });
  if (spendErr) {
    await db().from('discount_codes').delete().eq('id', row.id);
    return fail('الرصيد غير كافٍ');
  }
  return json({ code, percent: S.discount_percent });
}
