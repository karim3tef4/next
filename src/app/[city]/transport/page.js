import { db } from '@/lib/supabase';
import { getCity } from '@/lib/city';
import { tr, pick } from '@/lib/i18n';
import TransportFinder from '@/components/TransportFinder';

export default async function Transport({ params }) {
  const city = await getCity(params.city);
  const { t, lang } = tr();
  const { data: lines } = await db().from('transport_lines').select('*').eq('city_id', city.id);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">{t('transport_title')} {pick(city, 'name', lang)}</h1>
      <p className="mb-6 mt-2 text-canal/70">{t('transport_sub')}</p>
      <TransportFinder lines={lines || []} />
    </div>
  );
}
