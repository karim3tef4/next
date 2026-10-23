import { notFound } from 'next/navigation';
import { db } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import CheckinButton from '@/components/CheckinButton';
import VisitedButton from '@/components/VisitedButton';
import { tr, pick } from '@/lib/i18n';

export default async function PlacePage({ params }) {
  const { data: place } = await db()
    .from('places')
    .select('*, categories(name_ar,slug,visit_points), cities!inner(slug)')
    .eq('id', params.id).eq('status', 'active').eq('cities.slug', params.city).maybeSingle();
  if (!place) notFound();

  const user = await getCurrentUser();
  const { t, lang, tier } = tr();
  const now = new Date().toISOString();
  const [{ data: offers }, { data: rooms }] = await Promise.all([
    db().from('offers').select('*').eq('place_id', place.id).eq('is_active', true).or(`ends_at.is.null,ends_at.gt.${now}`),
    place.categories?.slug === 'hotels'
      ? db().from('hotel_rooms').select('*').eq('place_id', place.id)
      : Promise.resolve({ data: [] }),
  ]);

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_340px]">
      <div>
        {place.images?.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {place.images.map((src, i) => (
              <img key={src} src={src} alt={i === 0 ? pick(place, 'name', lang) : ''} className={`w-full rounded-xl object-cover ${i === 0 && place.images.length % 2 ? 'sm:col-span-2 h-72' : 'h-48'}`} />
            ))}
          </div>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold">{pick(place, 'name', lang)}</h1>
          {place.price_tier && <span className="tier bg-brass-soft text-brass">{tier(place.price_tier)}</span>}
        </div>
        <p className="mt-1 text-canal/60">{place.categories?.name_ar}{place.address ? ` · ${place.address}` : ''}</p>
        {place.description && <p className="mt-4 leading-8">{place.description}</p>}

        {offers?.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 text-xl font-bold">{t('offers')}</h2>
            <div className="space-y-3">
              {offers.map((o) => (
                <div key={o.id} className="rounded-xl border border-brass/30 bg-brass-soft p-4">
                  <div className="font-semibold">{o.title}{o.discount_pct ? ` — ${o.discount_pct}%` : ''}</div>
                  {o.description && <p className="mt-1 text-sm">{o.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {rooms?.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 text-xl font-bold">{t('rooms')}</h2>
            <div className="space-y-3">
              {rooms.map((r) => (
                <div key={r.id} className="rounded-xl border border-canal/10 bg-white p-4">
                  <div className="font-semibold">{r.name}{r.price_egp ? ` — ${r.price_egp} ج.م` : ''}</div>
                  {r.details && <p className="mt-1 text-sm text-canal/70">{r.details}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-canal/10 bg-white p-5">
          <p className="mb-3 text-sm text-canal/70">
            زيارة موثقة بصورة من الكاميرا وموقعك الحالي = <b className="font-display text-brass">{place.categories?.visit_points}</b> نقطة.
          </p>
          <div className="space-y-2">
            <CheckinButton placeId={place.id} loggedIn={!!user} label={t('checkin')} />
            <VisitedButton placeId={place.id} loggedIn={!!user} label={t('visited')} />
          </div>
        </div>
        <div className="rounded-2xl border border-canal/10 bg-white p-5 text-sm leading-7">
          {place.working_hours && <div><b>{t('hours')}:</b> {place.working_hours}</div>}
          {place.phone && <div><b>{t('phone')}:</b> <span dir="ltr">{place.phone}</span></div>}
          {place.lat && (
            <a className="mt-2 inline-block underline" target="_blank" rel="noreferrer"
              href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`}>{t('map')}</a>
          )}
        </div>
      </aside>
    </div>
  );
}
