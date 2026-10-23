import { redirect } from 'next/navigation';
import { db } from '@/lib/supabase';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import AdminMerchantRow from '@/components/AdminMerchantRow';

export const dynamic = 'force-dynamic';

export default async function Admin() {
  const user = await getCurrentUser();
  if (!isAdmin(user, 'merchants')) redirect('/admin');

  const { data: pending } = await db()
    .from('merchants')
    .select('user_id,business_name,commercial_reg_url,users(name,email),cities(name_ar)')
    .eq('status', 'pending').order('created_at');

  // the registration document bucket is private: give the admin a short-lived signed link
  const rows = await Promise.all((pending || []).map(async (m) => {
    const { data } = await db().storage.from('merchant-docs').createSignedUrl(m.commercial_reg_url, 600);
    return { ...m, doc_url: data?.signedUrl };
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">طلبات التجار ({rows.length})</h1>
      <div className="space-y-3">
        {rows.map((m) => <AdminMerchantRow key={m.user_id} m={m} />)}
        {!rows.length && <p className="text-canal/60">مفيش طلبات معلقة.</p>}
      </div>
    </div>
  );
}
