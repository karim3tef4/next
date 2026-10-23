import Link from 'next/link';
import { db } from '@/lib/supabase';
import { getCity } from '@/lib/city';
import { tr, pick } from '@/lib/i18n';

const THEME = { historical: 'تاريخية', food: 'أكل', family: 'عائلية', general: 'عامة' };

export default async function Plans({ params }) {
  const city = await getCity(params.city);
  const { t, lang, tier } = tr();
  const { data: plans } = await db()
    .from('day_plans')
    .select('*, day_plan_stops(position, visit_minutes, places(id,name_ar))')
    .eq('city_id', city.id).eq('is_published', true).order('duration_hours');

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">{t('plans_title')} {pick(city, 'name', lang)}</h1>
      <p className="mb-8 mt-2 text-canal/70">{t('plans_sub')}</p>
      <div className="space-y-5">
        {plans?.map((p) => (
          <section key={p.id} className="rounded-2xl border border-canal/10 bg-white p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold">{p.title}</h2>
              <span className="tier bg-canal-soft text-canal">{p.duration_hours} ساعة</span>
              <span className="tier bg-dome-soft text-dome">{THEME[p.theme]}</span>
              {p.tier && <span className="tier bg-brass-soft text-brass">{tier(p.tier)}</span>}
            </div>
            <ol className="mt-4 space-y-2">
              {[...p.day_plan_stops].sort((a, b) => a.position - b.position).map((s) => (
                <li key={s.position} className="flex items-center justify-between rounded-lg bg-salt px-3 py-2 text-sm">
                  <Link className="font-semibold underline" href={`/${city.slug}/places/${s.places.id}`}>{s.places.name_ar}</Link>
                  <span className="text-canal/60">{s.visit_minutes} دقيقة</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-sm text-brass">مكافأة إتمام الخطة: {p.bonus_points} نقطة</p>
          </section>
        ))}
        {!plans?.length && <p className="text-canal/60">مفيش خطط لسه.</p>}
      </div>
    </div>
  );
}
