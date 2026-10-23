import { notFound } from 'next/navigation';
import { db } from '@/lib/supabase';
import { getCity } from '@/lib/city';

export default async function ExploreItem({ params }) {
  const city = await getCity(params.city);
  const { data: e } = await db().from('explore_items').select('*')
    .eq('city_id', city.id).eq('slug', params.slug).eq('is_published', true).maybeSingle();
  if (!e) notFound();
  const sections = [['تاريخه', e.history], ['أهميته', e.significance], ['حكاية', e.story]].filter(([, t]) => t);
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-bold">{e.title_ar}</h1>
      {e.summary && <p className="mt-3 text-lg text-canal/80">{e.summary}</p>}
      <div className="mt-6 grid gap-3">
        {e.images?.map((src, i) => <img key={src} src={src} alt={i === 0 ? e.title_ar : ''} className="w-full rounded-xl object-cover" />)}
      </div>
      {sections.map(([h, t]) => (
        <section key={h} className="mt-8">
          <h2 className="mb-2 text-xl font-bold">{h}</h2>
          <p className="leading-8">{t}</p>
        </section>
      ))}
    </article>
  );
}
