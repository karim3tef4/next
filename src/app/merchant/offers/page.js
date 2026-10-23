import { redirect } from 'next/navigation';
import { db } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { MERCHANT_RESOURCES, loadOptions } from '@/lib/resources';
import ResourceManager from '@/components/ResourceManager';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'merchant') redirect('/merchant');
  const def = MERCHANT_RESOURCES.offers;
  const mine = await db().from('places').select('id').eq('merchant_id', user.id);
  const ids = (mine.data || []).map((p) => p.id);
  const col = def.table === 'places' ? 'merchant_id' : 'place_id';
  const { data: rows } = await db().from(def.table).select('*').in(col, def.table === 'places' ? [user.id] : ids.length ? ids : ['00000000-0000-0000-0000-000000000000']).limit(200);
  const fields = await loadOptions(db(), def.fields, user);
  return (
    <ResourceManager endpoint="/api/merchant/resource" resource="offers" title={def.title} fields={fields} rows={rows || []} labelKey={def.label} subKeys={def.sub} />
  );
}
