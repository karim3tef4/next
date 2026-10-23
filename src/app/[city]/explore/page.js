import Link from 'next/link';
import { db } from '@/lib/supabase';
import { getCity } from '@/lib/city';
import { tr, pick } from '@/lib/i18n';

export default async function Explore({ params }) {
  const city = await getCity(params.city);
  const { t, lang } = tr();
  const { data: items } = await db().from('explore_items').select('slug,title_ar,summary,images')
    .eq('city_id', city.id).eq('is_published', true).order('sort_order');
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">{t('explore')} {pick(city, 'name', lang)}</h1>
      <p className="mt-2 max-w-2xl text-canal/70">{t('explore_sub')}</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {items?.map((e) => (
          <Link key={e.slug} href={`/${city.slug}/explore/${e.slug}`} className="group overflow-hidden rounded-2xl border border-canal/10 bg-white">
            <div className="h-56 overflow-hidden bg-canal-soft">
              {e.images?.[0] && <img src={e.images[0]} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
            </div>
            <div className="p-4">
              <h2 className="text-xl font-bold">{e.title_ar}</h2>
              <p className="mt-1 text-sm text-canal/70">{e.summary}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
