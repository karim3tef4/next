import { redirect } from 'next/navigation';
import { db } from '@/lib/supabase';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { ComplaintRow } from '@/components/AdminForms';

export const dynamic = 'force-dynamic';

export default async function Complaints() {
  const user = await getCurrentUser();
  if (!isAdmin(user, 'complaints')) redirect('/admin');
  const { data } = await db().from('complaints').select('*, users(name)').order('created_at', { ascending: false }).limit(100);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">الشكاوى والاقتراحات</h1>
      {data?.map((c) => <ComplaintRow key={c.id} c={c} />)}
      {!data?.length && <p className="text-canal/60">مفيش شكاوى.</p>}
    </div>
  );
}
