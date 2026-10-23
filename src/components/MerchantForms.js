'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ApplyForm({ cities }) {
  const router = useRouter();
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setMsg(null);
    const res = await fetch('/api/merchant/apply', { method: 'POST', body: new FormData(e.currentTarget) });
    const data = await res.json();
    setMsg(res.ok ? { ok: true, text: 'تم إرسال الطلب، هنراجعه ونبلغك.' } : { ok: false, text: data.error });
    setBusy(false);
    if (res.ok) router.refresh();
  }
  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-canal/10 bg-white p-6">
      <h2 className="text-xl font-bold">التسجيل كتاجر</h2>
      <div><label className="label" htmlFor="business_name">اسم النشاط</label><input id="business_name" name="business_name" className="input" required /></div>
      <div><label className="label" htmlFor="phone">التليفون</label><input id="phone" name="phone" className="input" dir="ltr" /></div>
      <div>
        <label className="label" htmlFor="city_id">المدينة</label>
        <select id="city_id" name="city_id" className="input" required>
          {cities.map((c) => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
        </select>
      </div>
      <div><label className="label" htmlFor="document">صورة السجل التجاري</label><input id="document" name="document" type="file" accept="image/*,application/pdf" className="input" required /></div>
      {msg && <p role="status" className={`rounded-lg px-3 py-2 text-sm ${msg.ok ? 'bg-dome-soft text-dome' : 'bg-balcony-soft text-balcony'}`}>{msg.text}</p>}
      <button className="btn-primary" disabled={busy}>إرسال للمراجعة</button>
    </form>
  );
}

export function VerifyForm() {
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState(null);
  return (
    <form
      className="space-y-3 rounded-2xl border border-canal/10 bg-white p-6"
      onSubmit={async (e) => {
        e.preventDefault(); setMsg(null);
        const res = await fetch('/api/merchant/verify', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }),
        });
        const data = await res.json();
        setMsg(res.ok ? { ok: true, text: `الكود صالح. طبّق خصم ${data.percent}%` } : { ok: false, text: data.error });
        if (res.ok) setCode('');
      }}
    >
      <h2 className="text-xl font-bold">التحقق من كود خصم</h2>
      <input className="input font-mono" dir="ltr" placeholder="HB-XXXXXXXX" value={code} onChange={(e) => setCode(e.target.value)} required />
      {msg && <p role="status" className={`rounded-lg px-3 py-2 text-sm ${msg.ok ? 'bg-dome-soft text-dome' : 'bg-balcony-soft text-balcony'}`}>{msg.text}</p>}
      <button className="btn-primary">تحقق واستخدم</button>
    </form>
  );
}
