import { db } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { json, fail } from '@/lib/api';

// "أنا زرت المكان": no points, statistics only. One per user/place/day.
export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return fail('سجّل دخولك الأول', 401);
  const { place_id } = await req.json().catch(() => ({}));
  if (!place_id) return fail('المكان مطلوب');

  const dayStart = new Date(); dayStart.setUTCHours(0, 0, 0, 0);
  const { count } = await db().from('visits').select('id', { count: 'exact', head: true })
    .eq('user_id', user.id).eq('place_id', place_id).eq('kind', 'simple').gte('created_at', dayStart.toISOString());
  if (count > 0) return json({ ok: true, already: true });

  await db().from('visits').insert({ user_id: user.id, place_id, kind: 'simple' });
  await db().rpc('bump_place_visit', { p_place: place_id });
  return json({ ok: true });
}
