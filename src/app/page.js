import Link from 'next/link';
import { db } from '@/lib/supabase';
import { tr, pick } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { t, lang } = tr();
  const { data: cities } = await db().from('cities').select('*').neq('status', 'hidden').order('sort_order');

  return (
    <>
      <section className="relative isolate overflow-hidden bg-canal-dark">
        <img src="/images/canal-authority.webp" alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40" />
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <h1 className="max-w-2xl text-4xl font-bold leading-tight text-white sm:text-5xl">
            {t('hero_title')}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/80">
            {t('hero_sub')}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-6 text-2xl font-bold">{t('cities')}</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {cities?.map((c) => {
            const live = c.status === 'active';
            const card = (
              <div className={`group relative h-56 overflow-hidden rounded-2xl border border-canal/10 ${live ? '' : 'bg-canal-soft'}`}>
                {c.cover_image && <img src={c.cover_image} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                <div className={`absolute inset-0 ${c.cover_image ? 'bg-gradient-to-t from-canal-dark/85 to-transparent' : ''}`} />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className={`font-display text-3xl font-bold ${c.cover_image ? 'text-white' : 'text-canal'}`}>{pick(c, 'name', lang)}</div>
                  <div className={`text-sm ${c.cover_image ? 'text-white/80' : 'text-canal/60'}`}>{lang === 'en' ? c.name_ar : c.name_en}</div>
                </div>
                {!live && <span className="tier absolute start-4 top-4 bg-brass-soft text-brass">{t('soon')}</span>}
              </div>
            );
            return live ? <Link key={c.id} href={`/${c.slug}`}>{card}</Link> : <div key={c.id} aria-disabled="true">{card}</div>;
          })}
        </div>
      </section>
    </>
  );
}
