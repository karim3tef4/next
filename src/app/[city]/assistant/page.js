import { getCity } from '@/lib/city';
import { getCurrentUser } from '@/lib/auth';
import { AssistantChat } from '@/components/CommunityForms';
import Link from 'next/link';

export default async function Assistant({ params }) {
  const city = await getCity(params.city);
  const user = await getCurrentUser();
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold">مساعد {city.name_ar}</h1>
      <p className="mb-6 text-canal/70">بيجاوب من بيانات المنصة بس: أماكن، مواصلات، ومعالم.</p>
      {user ? <AssistantChat city={city.slug} /> : <p className="rounded-xl bg-white p-4"><Link className="underline" href="/login">سجّل دخولك</Link> عشان تستخدم المساعد.</p>}
    </div>
  );
}
