import { db } from '@/lib/supabase';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { json, fail } from '@/lib/api';

// Image upload for admins and approved merchants.
export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return fail('سجّل دخولك الأول', 401);
  if (!isAdmin(user)) {
    if (user.role !== 'merchant') return fail('غير مصرح', 403);
    const { data: m } = await db().from('merchants').select('status').eq('user_id', user.id).maybeSingle();
    if (m?.status !== 'approved') return fail('حساب التاجر غير معتمد', 403);
  }
  const file = (await req.formData()).get('file');
  if (!file || typeof file === 'string' || !file.type?.startsWith('image/')) return fail('الملف لازم يكون صورة');
  if (file.size > 5 * 1024 * 1024) return fail('الصورة أكبر من 5 ميجا');

  const ext = (file.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg').replace(/[^a-z0-9]/g, '');
  const path = `uploads/${user.id}/${Date.now()}.${ext}`;
  const up = await db().storage.from('content-images').upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type });
  if (up.error) return fail('تعذر رفع الصورة', 500);
  return json({ url: db().storage.from('content-images').getPublicUrl(path).data.publicUrl });
}
