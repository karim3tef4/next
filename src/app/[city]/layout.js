import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCity } from '@/lib/city';
import { tr, pick } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function CityLayout({ children, params }) {
  const city = await getCity(params.city);
  if (!city) notFound();
  const { t, lang } = tr();
  const name = pick(city, 'name', lang);
  const base = `/${city.slug}`;
  const links = [
    [base, `${t('home')} ${name}`],
    [`${base}/places`, t('places')],
    [`${base}/explore`, `${t('explore')} ${name}`],
    [`${base}/plans`, t('plans')],
    [`${base}/transport`, t('transport')],
    [`${base}/memories`, t('memories')],
    [`${base}/assistant`, t('assistant')],
  ];
  return (
    <>
      <div className="border-b border-canal/10 bg-white">
        <nav aria-label={name} className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 text-sm">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="whitespace-nowrap rounded-lg px-3 py-1.5 font-semibold text-canal hover:bg-canal-soft">{label}</Link>
          ))}
          <Link href="/complaints" className="ms-auto whitespace-nowrap rounded-lg px-3 py-1.5 text-canal/70 hover:bg-canal-soft">{t('complaints')}</Link>
        </nav>
      </div>
      {children}
    </>
  );
}
