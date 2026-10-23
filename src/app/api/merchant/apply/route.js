import { db } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { json, fail } from '@/lib/api';

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return fail('سجّل دخولك الأول', 401);

  const form = await req.formData();
  const business = String(form.get('business_name') || '').trim();
  const phone = String(form.get('phone') || '').trim();
  const cityId = form.get('city_id');
  const doc = form.get('document');
  if (business.length < 2 || !cityId) return fail('بيانات النشاط ناقصة');
  if (!doc || typeof doc === 'string') return fail('ارفع السجل التجاري');
  if (doc.size > 8 * 1024 * 1024) return fail('الملف أكبر من 8 ميجا');

  const path = `${user.id}/${Date.now()}-${doc.name.replace(/[^\w.-]/g, '_')}`;
  const up = await db().storage.from('merchant-docs').upload(path, Buffer.from(await doc.arrayBuffer()), { contentType: doc.type });
  if (up.error) return fail('تعذر رفع الملف', 500);

  const { error } = await db().from('merchants').upsert({
    user_id: user.id, business_name: business, phone, city_id: cityId,
    commercial_reg_url: path, status: 'pending', reject_reason: null,
  });
  if (error) return fail('تعذر حفظ الطلب', 500);
  return json({ ok: true });
}
