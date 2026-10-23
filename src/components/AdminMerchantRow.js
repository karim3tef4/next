'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminMerchantRow({ m }) {
  const router = useRouter();
  const [reason, setReason] = useState('');
  const [err, setErr] = useState('');
  async function act(action) {
    setErr('');
    const res = await fetch('/api/admin/merchants', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: m.user_id, action, reason }),
    });
    const data = await res.json();
    if (!res.ok) setErr(data.error); else router.refresh();
  }
  return (
    <div className="rounded-xl border border-canal/10 bg-white p-4">
      <div className="font-semibold">{m.business_name}</div>
      <div className="text-sm text-canal/60">{m.users?.name} · {m.users?.email} · {m.cities?.name_ar}</div>
      {m.doc_url && <a href={m.doc_url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm underline">عرض السجل التجاري</a>}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button className="btn-primary" onClick={() => act('approve')}>قبول</button>
        <input className="input max-w-xs" placeholder="سبب الرفض" value={reason} onChange={(e) => setReason(e.target.value)} />
        <button className="btn-ghost" onClick={() => act('reject')}>رفض</button>
      </div>
      {err && <p role="alert" className="mt-2 text-sm text-balcony">{err}</p>}
    </div>
  );
}
