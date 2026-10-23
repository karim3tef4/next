import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function MerchantLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const links = [['/merchant', 'الرئيسية'], ['/merchant/places', 'أماكني'], ['/merchant/offers', 'العروض'], ['/merchant/rooms', 'غرف الفندق']];
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {user.role === 'merchant' && (
        <nav aria-label="التاجر" className="mb-6 flex gap-1 overflow-x-auto">
          {links.map(([h, l]) => <Link key={h} href={h} className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold hover:bg-canal-soft">{l}</Link>)}
        </nav>
      )}
      {children}
    </div>
  );
}
