import Link from 'next/link';
import { db } from '@/lib/supabase';
import { getCity } from '@/lib/city';
import { tr, pick } from '@/lib/i18n';

export default async function Places({ params, searchParams }) {
  const city = await getCity(params.city);
  const { t, lang, tier: tierName } = tr();
  const { data: cats } = await db().from('categories').select('id,slug,name_ar,name_en').eq('is_active', true).order('sort_order');
  const cat = cats?.find((c) => c.slug === searchParams.category);
  const tier = ['A', 'B', 'C'].includes(searchParams.tier) ? searchParams.tier : null;

  let q = db().from('places').select('id,name_ar,name_en,images,price_tier,address,categories(name_ar,name_en)').eq('city_id', city.id).eq('status', 'active');
  if (cat) q = q.eq('category_id', cat.id);
  if (tier) q = q.eq('price_tier', tier);
  const { data: places } = await q.order('visit_count', { ascending: false });

  const href = (c, t) => {
    const p = new URLSearchParams();
    if (c) p.set('category', c);
    if (t) p.set('tier', t);
    const s = p.toString();
    return `/${city.slug}/places${s ? `?${s}` : ''}`;
  };
  const chip = (on) => `rounded-full border px-3 py-1 text-sm ${on ? 'border-canal bg-canal text-white' : 'border-canal/20 bg-white'}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">{t('places_in')} {pick(city, 'name', lang)}</h1>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link href={href(null, tier)} className={chip(!cat)}>{t('all')}</Link>
        {cats?.map((c) => <Link key={c.id} href={href(c.slug, tier)} className={chip(cat?.id === c.id)}>{pick(c, 'name', lang)}</Link>)}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href={href(cat?.slug, null)} className={chip(!tier)}>{t('all_levels')}</Link>
        {['A', 'B', 'C'].map((k) => <Link key={k} href={href(cat?.slug, k)} className={chip(tier === k)}>{tierName(k)}</Link>)}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {places?.map((p) => (
          <Link key={p.id} href={`/${city.slug}/places/${p.id}`} className="overflow-hidden rounded-xl border border-canal/10 bg-white">
            <div className="h-40 bg-canal-soft">{p.images?.[0] && <img src={p.images[0]} alt="" className="h-full w-full object-cover" />}</div>
            <div className="p-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{pick(p, 'name', lang)}</span>
                {p.price_tier && <span className="tier bg-brass-soft text-brass">{tierName(p.price_tier)}</span>}
              </div>
              <div className="mt-1 text-sm text-canal/60">{p.categories && pick(p.categories, 'name', lang)}{p.address ? ` · ${p.address}` : ''}</div>
            </div>
          </Link>
        ))}
        {!places?.length && <p className="text-canal/60">{t('none')}</p>}
      </div>
    </div>
  );
}
