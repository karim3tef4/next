import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/supabase';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { ADMIN_RESOURCES, loadOptions } from '@/lib/resources';
import ResourceManager from '@/components/ResourceManager';

export default async function Section({ params }) {
  const def = ADMIN_RESOURCES[params.section];
  if (!def) notFound();
  const user = await getCurrentUser();
  if (!isAdmin(user, def.perm)) redirect('/admin');

  const [col, asc] = def.order || ['id', true];
  let { data: rows } = await db().from(def.table).select(def.select || '*').order(col, { ascending: asc }).limit(300);
  if (params.section === 'plans') {
    rows = (rows || []).map((r) => ({
      ...r,
      stops: [...r.day_plan_stops].sort((a, b) => a.position - b.position).map((s) => s.place_id),
    }));
  }
  const fields = await loadOptions(db(), def.fields, user);

  return (
    <ResourceManager
      endpoint="/api/admin/resource" resource={params.section} title={def.title} fields={fields} rows={rows || []}
      labelKey={def.label} subKeys={def.sub} pk={def.pk || 'id'}
      canCreate={def.canCreate !== false} canDelete={def.canDelete !== false}
    />
  );
}
