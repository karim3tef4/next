import { db } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { distanceMeters } from '@/lib/geo';
import { makeCode } from '@/lib/codes';
import { json, fail } from '@/lib/api';

// Verified visit: live camera photo + GPS inside the place's radius => points.
export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return fail('سجّل دخولك الأول', 401);
  if (!user.photo_consent) return fail('لازم توافق على نشر صور الزيارات في حسابك الأول', 403);

  const form = await req.formData();
  const placeId = form.get('place_id');
  const lat = Number(form.get('lat'));
  const lng = Number(form.get('lng'));
  const takenAt = Number(form.get('taken_at')); // photo timestamp (ms) from the browser
  const photo = form.get('photo');

  if (!placeId || Number.isNaN(lat) || Number.isNaN(lng)) return fail('بيانات الموقع ناقصة');
  if (!photo || typeof photo === 'string' || !photo.type?.startsWith('image/')) return fail('الصورة مطلوبة');
  if (photo.size > 5 * 1024 * 1024) return fail('الصورة أكبر من 5 ميجا');

  const S = await getSettings();

  // Anti-cheat 1: the photo must be fresh (blocks old gallery photos)
  const ageMin = (Date.now() - takenAt) / 60000;
  if (!takenAt || ageMin > S.photo_max_age_minutes || ageMin < -2) {
    return fail('الصورة لازم تتصور دلوقتي من الكاميرا مباشرة، مش من المعرض');
  }

  const { data: place } = await db()
    .from('places')
    .select('id,name_ar,lat,lng,radius_m,status,categories(visit_points)')
    .eq('id', placeId).maybeSingle();
  if (!place || place.status !== 'active') return fail('المكان غير موجود', 404);

  // Anti-cheat 2: GPS inside the allowed radius
  const dist = distanceMeters(lat, lng, place.lat, place.lng);
  const radius = place.radius_m || S.max_distance_m;
  if (dist > radius) return fail(`أنت بعيد عن المكان (${dist} متر). لازم تكون في نطاق ${radius} متر`, 422);

  // Anti-cheat 3: daily cap
  const dayStart = new Date(); dayStart.setUTCHours(0, 0, 0, 0);
  const { count: today } = await db().from('visits').select('id', { count: 'exact', head: true })
    .eq('user_id', user.id).eq('kind', 'verified').gte('created_at', dayStart.toISOString());
  if (today >= S.max_daily_visits) return fail('وصلت للحد الأقصى من الزيارات الموثقة النهارده');

  // Anti-cheat 4: no repeat of the same place within the cooldown
  const since = new Date(Date.now() - S.place_cooldown_hours * 3600 * 1000).toISOString();
  const { count: recent } = await db().from('visits').select('id', { count: 'exact', head: true })
    .eq('user_id', user.id).eq('place_id', place.id).eq('kind', 'verified').gte('created_at', since);
  if (recent > 0) return fail(`سجّلت زيارة للمكان ده من أقل من ${S.place_cooldown_hours} ساعة`);

  const ext = photo.type === 'image/png' ? 'png' : photo.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `${place.id}/${user.id}-${Date.now()}.${ext}`;
  const up = await db().storage.from('visit-photos').upload(path, Buffer.from(await photo.arrayBuffer()), { contentType: photo.type });
  if (up.error) return fail('تعذر رفع الصورة', 500);
  const photoUrl = db().storage.from('visit-photos').getPublicUrl(path).data.publicUrl;

  const points = place.categories?.visit_points ?? 100;
  const { data: visit, error } = await db().from('visits').insert({
    user_id: user.id, place_id: place.id, kind: 'verified', photo_url: photoUrl,
    lat, lng, distance_m: dist, points_awarded: points,
  }).select('id').single();
  if (error) return fail('تعذر تسجيل الزيارة', 500);

  await db().rpc('add_points', { p_user: user.id, p_delta: points, p_reason: `زيارة: ${place.name_ar}`, p_ref: visit.id });
  await db().rpc('bump_place_visit', { p_place: place.id });

  // Loyalty: every Nth verified visit to the SAME place => a code valid at that shop
  let loyalty = null;
  const { count: total } = await db().from('visits').select('id', { count: 'exact', head: true })
    .eq('user_id', user.id).eq('place_id', place.id).eq('kind', 'verified');
  if (total % S.loyalty_visits === 0) {
    const code = makeCode();
    await db().from('discount_codes').insert({
      code, user_id: user.id, kind: 'loyalty', percent: S.loyalty_percent, place_id: place.id,
      expires_at: new Date(Date.now() + S.code_valid_days * 86400000).toISOString(),
    });
    loyalty = { code, percent: S.loyalty_percent };
  }

  // Day-plan bonus: all stops of a plan verified within the plan's time window (once per plan per window)
  let planBonus = null;
  const { data: plans } = await db().from('day_plan_stops')
    .select('plan_id, day_plans(id,title,duration_hours,bonus_points,is_published)').eq('place_id', place.id);
  for (const row of plans || []) {
    const plan = row.day_plans;
    if (!plan?.is_published || !plan.bonus_points) continue;
    const winStart = new Date(Date.now() - plan.duration_hours * 3600 * 1000).toISOString();
    const { data: stops } = await db().from('day_plan_stops').select('place_id').eq('plan_id', plan.id);
    const { data: done } = await db().from('visits').select('place_id')
      .eq('user_id', user.id).eq('kind', 'verified').gte('created_at', winStart).in('place_id', stops.map((s) => s.place_id));
    const doneSet = new Set((done || []).map((d) => d.place_id));
    if (!stops.every((s) => doneSet.has(s.place_id))) continue;
    const { count: paid } = await db().from('points_ledger').select('id', { count: 'exact', head: true })
      .eq('user_id', user.id).eq('ref_id', plan.id).gte('created_at', winStart);
    if (paid > 0) continue;
    await db().rpc('add_points', { p_user: user.id, p_delta: plan.bonus_points, p_reason: `إتمام خطة: ${plan.title}`, p_ref: plan.id });
    planBonus = { title: plan.title, points: plan.bonus_points };
    break;
  }

  return json({ points, distance_m: dist, visits_here: total, loyalty, plan_bonus: planBonus });
}
