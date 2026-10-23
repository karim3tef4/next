import { db } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { json, fail } from '@/lib/api';
import { rateLimit } from '@/lib/ratelimit';

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return fail('سجّل دخولك الأول', 401);
  if (rateLimit(`complaint:${user.id}`, 5, 60 * 60 * 1000)) return fail('وصلت للحد الأقصى، جرّب بعد ساعة', 429);
  const form = await req.formData();
  const kind = String(form.get('kind'));
  const body = String(form.get('body') || '').trim();
  const image = form.get('image');
  if (!['app', 'place', 'suggestion'].includes(kind)) return fail('النوع غير صحيح');
  if (body.length < 5 || body.length > 2000) return fail('اكتب التفاصيل (من 5 إلى 2000 حرف)');

  let imageUrl = null;
  if (image && typeof image !== 'string' && image.size > 0) {
    if (!image.type.startsWith('image/') || image.size > 5 * 1024 * 1024) return fail('الصورة غير صالحة (أقصى حجم 5 ميجا)');
    const path = `complaints/${user.id}/${Date.now()}.${image.type.split('/')[1].replace(/[^a-z0-9]/g, '')}`;
    const up = await db().storage.from('content-images').upload(path, Buffer.from(await image.arrayBuffer()), { contentType: image.type });
    if (!up.error) imageUrl = db().storage.from('content-images').getPublicUrl(path).data.publicUrl;
  }
  const { error } = await db().from('complaints').insert({ user_id: user.id, kind, body, image_url: imageUrl });
  return error ? fail('تعذر الإرسال', 500) : json({ ok: true });
}
