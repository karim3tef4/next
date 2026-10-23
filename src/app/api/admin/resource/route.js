import { db } from '@/lib/supabase';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { ADMIN_RESOURCES } from '@/lib/resources';
import { sanitize } from '@/lib/resource-core';
import { json, fail } from '@/lib/api';

export async function POST(req) {
  const user = await getCurrentUser();
  const { resource, action, id, data = {} } = await req.json().catch(() => ({}));
  const def = ADMIN_RESOURCES[resource];
  if (!def) return fail('مورد غير معروف', 404);
  if (!isAdmin(user, def.perm)) return fail('غير مصرح', 403);
  const pk = def.pk || 'id';

  if (action === 'delete') {
    if (def.canDelete === false) return fail('الحذف غير متاح', 403);
    const { error } = await db().from(def.table).delete().eq(pk, id);
    return error ? fail('تعذر الحذف (ممكن يكون مرتبط ببيانات تانية)', 409) : json({ ok: true });
  }
  if (!['create', 'update'].includes(action)) return fail('إجراء غير صحيح');
  if (action === 'create' && def.canCreate === false) return fail('الإضافة غير متاحة', 403);

  const clean = sanitize(def.fields, data, { creating: action === 'create' });
  if (clean.error) return fail(clean.error);
  if (resource === 'plans' && clean.data.duration_hours) clean.data.duration_hours = Number(clean.data.duration_hours);

  let rowId = id;
  if (action === 'create') {
    const { data: row, error } = await db().from(def.table).insert(clean.data).select(pk).single();
    if (error) return fail(error.code === '23505' ? 'القيمة دي موجودة قبل كده' : 'تعذر الحفظ', 409);
    rowId = row[pk];
  } else {
    const { error } = await db().from(def.table).update(clean.data).eq(pk, id);
    if (error) return fail('تعذر الحفظ', 409);
  }

  if (resource === 'plans' && Array.isArray(data.stops)) {
    await db().from('day_plan_stops').delete().eq('plan_id', rowId);
    if (data.stops.length) {
      await db().from('day_plan_stops').insert(data.stops.map((place_id, i) => ({ plan_id: rowId, place_id, position: i + 1 })));
    }
  }
  return json({ ok: true, id: rowId });
}
