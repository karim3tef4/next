import { redirect } from 'next/navigation';
import { db } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { UserRoleForm } from '@/components/AdminForms';

export const dynamic = 'force-dynamic';

export default async function Users() {
  const user = await getCurrentUser();
  if (user?.role !== 'owner') redirect('/admin');
  const { data } = await db().from('users').select('name,email,role,permissions').in('role', ['admin', 'owner']).order('role');
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">المشرفون</h1>
      <UserRoleForm />
      <ul className="divide-y divide-canal/10 rounded-xl border border-canal/10 bg-white">
        {data?.map((u) => (
          <li key={u.email} className="px-4 py-3 text-sm">
            <b>{u.name}</b> <span className="text-canal/60" dir="ltr">{u.email}</span>
            <div className="text-xs text-canal/60">{u.role === 'owner' ? 'مالك (كل الصلاحيات)' : (u.permissions || []).join('، ') || 'بدون صلاحيات'}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
