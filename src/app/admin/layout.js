import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser, isAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const LINKS = [
  ['/admin', 'التقارير', 'reports'],
  ['/admin/merchants', 'طلبات التجار', 'merchants'],
  ['/admin/students', 'توثيق الطلاب', 'merchants'],
  ['/admin/places', 'الأماكن', 'content'],
  ['/admin/cities', 'المدن', 'content'],
  ['/admin/categories', 'أنواع الأماكن', 'content'],
  ['/admin/explore', 'اكتشف المدينة', 'content'],
  ['/admin/transport', 'المواصلات', 'content'],
  ['/admin/plans', 'خطط اليوم', 'content'],
  ['/admin/memories', 'الذكريات', 'content'],
  ['/admin/settings', 'النقاط والخصومات', 'points'],
  ['/admin/complaints', 'الشكاوى والاقتراحات', 'complaints'],
  ['/admin/users', 'المشرفون (للمالك)', 'owner'],
];

export default async function AdminLayout({ children }) {
  const user = await getCurrentUser();
  if (!user || !(user.role === 'owner' || user.role === 'admin')) redirect('/');
  const links = LINKS.filter(([, , perm]) => (perm === 'owner' ? user.role === 'owner' : isAdmin(user, perm)));
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[200px_1fr]">
      <nav aria-label="الإدارة" className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
        {links.map(([href, label]) => (
          <Link key={href} href={href} className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold hover:bg-canal-soft">{label}</Link>
        ))}
      </nav>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
