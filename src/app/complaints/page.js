import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { ComplaintForm } from '@/components/CommunityForms';

export const dynamic = 'force-dynamic';

export default async function Page() {
  if (!(await getCurrentUser())) redirect('/login');
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">شكوى أو اقتراح</h1>
      <ComplaintForm />
    </div>
  );
}
