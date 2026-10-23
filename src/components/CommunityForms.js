'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

function Msg({ m }) {
  if (!m) return null;
  return <p role="status" className={`rounded-lg px-3 py-2 text-sm ${m.ok ? 'bg-dome-soft text-dome' : 'bg-balcony-soft text-balcony'}`}>{m.t}</p>;
}

export function ComplaintForm() {
  const [m, setM] = useState(null);
  const [busy, setBusy] = useState(false);
  return (
    <form className="space-y-4 rounded-2xl border border-canal/10 bg-white p-6" onSubmit={async (e) => {
      e.preventDefault(); setBusy(true); setM(null);
      const form = e.currentTarget;
      const res = await fetch('/api/complaints', { method: 'POST', body: new FormData(form) });
      const d = await res.json();
      setM(res.ok ? { ok: true, t: 'وصلتنا رسالتك، شكرًا.' } : { ok: false, t: d.error });
      if (res.ok) form.reset();
      setBusy(false);
    }}>
      <div><label className="label" htmlFor="kind">النوع</label>
        <select id="kind" name="kind" className="input"><option value="app">مشكلة في التطبيق</option><option value="place">شكوى على مكان</option><option value="suggestion">اقتراح</option></select></div>
      <div><label className="label" htmlFor="body">التفاصيل</label><textarea id="body" name="body" className="input min-h-32" required minLength={5} maxLength={2000} /></div>
      <div><label className="label" htmlFor="image">صورة (اختياري)</label><input id="image" name="image" type="file" accept="image/*" className="input" /></div>
      <Msg m={m} />
      <button className="btn-primary" disabled={busy}>إرسال</button>
    </form>
  );
}

export function MemoryForm({ cityId, places, loggedIn }) {
  const router = useRouter();
  const [m, setM] = useState(null);
  const [busy, setBusy] = useState(false);
  if (!loggedIn) return <p className="rounded-xl bg-white p-4 text-sm">سجّل دخولك عشان تشارك ذكرياتك.</p>;
  return (
    <form className="space-y-3 rounded-2xl border border-canal/10 bg-white p-5" onSubmit={async (e) => {
      e.preventDefault(); setBusy(true); setM(null);
      const form = e.currentTarget;
      const res = await fetch('/api/memories', { method: 'POST', body: new FormData(form) });
      const d = await res.json();
      setM(res.ok ? { ok: true, t: 'تم النشر.' } : { ok: false, t: d.error });
      if (res.ok) { form.reset(); router.refresh(); }
      setBusy(false);
    }}>
      <h2 className="text-lg font-bold">شارك ذكرى</h2>
      <input type="hidden" name="city_id" value={cityId} />
      <input name="photo" type="file" accept="image/*" required className="input" aria-label="الصورة" />
      <textarea name="caption" maxLength={500} placeholder="اكتب حاجة عن الذكرى" className="input" />
      <select name="place_id" className="input" aria-label="المكان">
        <option value="">المكان (اختياري)</option>
        {places.map((p) => <option key={p.id} value={p.id}>{p.name_ar}</option>)}
      </select>
      <Msg m={m} />
      <button className="btn-primary" disabled={busy}>نشر</button>
    </form>
  );
}

export function CommentForm({ memoryId, loggedIn }) {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [err, setErr] = useState('');
  if (!loggedIn) return null;
  return (
    <form className="mt-2 flex gap-2" onSubmit={async (e) => {
      e.preventDefault(); setErr('');
      const res = await fetch('/api/memories/comment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ memory_id: memoryId, body }) });
      const d = await res.json();
      if (res.ok) { setBody(''); router.refresh(); } else setErr(d.error);
    }}>
      <input className="input" placeholder="اكتب تعليق" maxLength={500} value={body} onChange={(e) => setBody(e.target.value)} aria-label="تعليق" />
      <button className="btn-ghost">إرسال</button>
      {err && <span role="alert" className="text-sm text-balcony">{err}</span>}
    </form>
  );
}

export function StudentCardForm() {
  const router = useRouter();
  const [m, setM] = useState(null);
  return (
    <form className="flex flex-wrap items-center gap-2" onSubmit={async (e) => {
      e.preventDefault();
      const res = await fetch('/api/student-card', { method: 'POST', body: new FormData(e.currentTarget) });
      const d = await res.json();
      setM(res.ok ? { ok: true, t: 'تم الإرسال للمراجعة.' } : { ok: false, t: d.error });
      if (res.ok) router.refresh();
    }}>
      <input name="card" type="file" accept="image/*,application/pdf" required className="input max-w-xs" aria-label="كارنيه الطالب" />
      <button className="btn-primary">رفع الكارنيه</button>
      <Msg m={m} />
    </form>
  );
}

export function AssistantChat({ city }) {
  const [msgs, setMsgs] = useState([{ role: 'assistant', content: 'أهلًا! اسألني عن الأماكن أو المواصلات أو إيه تعمل في يومك.' }]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  async function send(e) {
    e.preventDefault();
    const q = text.trim();
    if (!q || busy) return;
    const next = [...msgs, { role: 'user', content: q }];
    setMsgs(next); setText(''); setBusy(true);
    const res = await fetch('/api/bot', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city, message: q, history: msgs.slice(1) }),
    });
    const d = await res.json();
    setMsgs([...next, { role: 'assistant', content: res.ok ? d.reply : d.error }]);
    setBusy(false);
  }

  return (
    <div className="rounded-2xl border border-canal/10 bg-white">
      <div className="max-h-[55vh] min-h-64 space-y-3 overflow-y-auto p-4" aria-live="polite">
        {msgs.map((m, i) => (
          <div key={i} className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm leading-7 ${m.role === 'user' ? 'me-auto bg-canal text-white' : 'bg-salt'}`}>{m.content}</div>
        ))}
        {busy && <div className="text-sm text-canal/60">...</div>}
      </div>
      <form onSubmit={send} className="flex gap-2 border-t border-canal/10 p-3">
        <input className="input" value={text} maxLength={500} onChange={(e) => setText(e.target.value)} placeholder="اكتب سؤالك" aria-label="سؤالك" />
        <button className="btn-primary" disabled={busy}>إرسال</button>
      </form>
    </div>
  );
}
