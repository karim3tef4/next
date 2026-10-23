import { db } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { json, fail } from '@/lib/api';
import { rateLimit } from '@/lib/ratelimit';

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return fail('سجّل دخولك الأول', 401);
  if (!user.photo_consent) return fail('لازم توافق على نشر الصور في حسابك الأول', 403);
  if (rateLimit(`memory:${user.id}`, 10, 60 * 60 * 1000)) return fail('وصلت للحد الأقصى، جرّب بعد ساعة', 429);
  const form = await req.formData();
  const photo = form.get('photo');
  const caption = String(form.get('caption') || '').trim().slice(0, 500);
  const cityId = form.get('city_id');
  const placeId = form.get('place_id') || null;
  if (!cityId) return fail('المدينة مطلوبة');
  if (!photo || typeof photo === 'string' || !photo.type?.startsWith('image/') || photo.size > 5 * 1024 * 1024) return fail('ارفع صورة (أقصى حجم 5 ميجا)');

  const path = `memories/${user.id}/${Date.now()}.${photo.type.split('/')[1].replace(/[^a-z0-9]/g, '')}`;
  const up = await db().storage.from('content-images').upload(path, Buffer.from(await photo.arrayBuffer()), { contentType: photo.type });
  if (up.error) return fail('تعذر رفع الصورة', 500);
  const { error } = await db().from('memories').insert({
    user_id: user.id, city_id: cityId, place_id: placeId, caption,
    photo_url: db().storage.from('content-images').getPublicUrl(path).data.publicUrl,
  });
  return error ? fail('تعذر النشر', 500) : json({ ok: true });
}
