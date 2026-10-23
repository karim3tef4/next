import { redirect } from 'next/navigation';
import { db } from '@/lib/supabase';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { StudentRow } from '@/components/AdminForms';

export const dynamic = 'force-dynamic';

export default async function Students() {
  const user = await getCurrentUser();
  if (!isAdmin(user, 'merchants')) redirect('/admin');
  const { data } = await db().from('users').select('id,name,email,student_card_url').eq('student_status', 'pending');
  const rows = await Promise.all((data || []).map(async (s) => ({
    ...s, card_url: s.student_card_url ? (await db().storage.from('student-cards').createSignedUrl(s.student_card_url, 600)).data?.signedUrl : null,
  })));
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">توثيق الطلاب ({rows.length})</h1>
      {rows.map((s) => <StudentRow key={s.id} s={s} />)}
      {!rows.length && <p className="text-canal/60">مفيش طلبات معلقة.</p>}
    </div>
  );
}
