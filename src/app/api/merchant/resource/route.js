import { db } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { MERCHANT_RESOURCES } from '@/lib/resources';
import { sanitize } from '@/lib/resource-core';
import { json, fail } from '@/lib/api';

async function owns(userId, placeId) {
  if (!placeId) return false;
  const { data } = await db().from('places').select('id').eq('id', placeId).eq('merchant_id', userId).maybeSingle();
  return !!data;
}

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'merchant') return fail('للتجار فقط', 403);
  const { data: m } = await db().from('merchants').select('status').eq('user_id', user.id).maybeSingle();
  if (m?.status !== 'approved') return fail('حساب التاجر غير معتمد', 403);

  const { resource, action, id, data = {} } = await req.json().catch(() => ({}));
  const def = MERCHANT_RESOURCES[resource];
  if (!def) return fail('مورد غير معروف', 404);
  const isPlace = resource === 'places';

  // Ownership check on the existing row (update / delete)
  if (action === 'update' || action === 'delete') {
    const { data: row } = await db().from(def.table).select(isPlace ? 'id, merchant_id' : 'id, place_id').eq('id', id).maybeSingle();
    const ok = row && (isPlace ? row.merchant_id === user.id : await owns(user.id, row.place_id));
    if (!ok) return fail('غير مصرح', 403);
  }
  if (action === 'delete') {
    const { error } = await db().from(def.table).delete().eq('id', id);
    return error ? fail('تعذر الحذف (المكان عليه زيارات)', 409) : json({ ok: true });
  }
  if (!['create', 'update'].includes(action)) return fail('إجراء غير صحيح');

  const clean = sanitize(def.fields, data, { creating: action === 'create' });
  if (clean.error) return fail(clean.error);
  const row = clean.data;

  if (!isPlace && row.place_id && !(await owns(user.id, row.place_id))) return fail('المكان ده مش بتاعك', 403);
  if (isPlace) {
    row.merchant_id = user.id;
    if (action === 'create') row.status = 'pending'; // admin must approve new places
  }

  const q = action === 'create' ? db().from(def.table).insert(row) : db().from(def.table).update(row).eq('id', id);
  const { error } = await q;
  return error ? fail('تعذر الحفظ', 409) : json({ ok: true });
}
