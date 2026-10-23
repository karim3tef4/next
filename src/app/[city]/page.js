import Link from 'next/link';
import { db } from '@/lib/supabase';
import { getCity } from '@/lib/city';
import { tr, pick } from '@/lib/i18n';

export default async function CityHome({ params }) {
  const city = await getCity(params.city);
  const { t, lang, tier } = tr();
  const cityName = pick(city, 'name', lang);
  const [{ data: cats }, { data: top }, { data: explore }] = await Promise.all([
    db().from('categories').select('*').eq('is_active', true).order('sort_order'),
    db().from('places').select('id,name_ar,name_en,images,price_tier,visit_count').eq('city_id', city.id).eq('status', 'active').order('visit_count', { ascending: false }).limit(6),
    db().from('explore_items').select('slug,title_ar,summary,images').eq('city_id', city.id).eq('is_published', true).order('sort_order').limit(3),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-14 px-4 py-10">
      <section>
        <h1 className="text-3xl font-bold">{t('welcome')} {cityName}</h1>
        <p className="mt-2 text-canal/70">{t('pick_type')}</p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {cats?.map((c) => (
            <Link key={c.id} href={`/${city.slug}/places?category=${c.slug}`}
              className="rounded-xl border border-canal/10 bg-white p-4 text-center transition-colors hover:border-canal/40">
              <div className="text-2xl" aria-hidden>{c.icon}</div>
              <div className="mt-1 text-sm font-semibold">{pick(c, 'name', lang)}</div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-bold">{t('top')}</h2>
          <Link className="text-sm underline" href={`/${city.slug}/places`}>{t('all_places')}</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {top?.map((p) => (
            <Link key={p.id} href={`/${city.slug}/places/${p.id}`} className="overflow-hidden rounded-xl border border-canal/10 bg-white">
              <div className="h-36 bg-canal-soft">{p.images?.[0] && <img src={p.images[0]} alt="" className="h-full w-full object-cover" />}</div>
              <div className="flex items-center justify-between p-3">
                <span className="font-semibold">{pick(p, 'name', lang)}</span>
                {p.price_tier && <span className="tier bg-brass-soft text-brass">{tier(p.price_tier)}</span>}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-bold">{t('explore')} {cityName}</h2>
          <Link className="text-sm underline" href={`/${city.slug}/explore`}>{t('more')}</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {explore?.map((e) => (
            <Link key={e.slug} href={`/${city.slug}/explore/${e.slug}`} className="group relative h-52 overflow-hidden rounded-xl">
              {e.images?.[0] && <img src={e.images[0]} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
              <div className="absolute inset-0 bg-gradient-to-t from-canal-dark/85 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 font-display text-xl font-bold text-white">{e.title_ar}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
