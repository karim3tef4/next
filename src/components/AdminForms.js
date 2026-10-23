'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

async function post(url, body) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return { ok: res.ok, data: await res.json() };
}

export function StudentRow({ s }) {
  const router = useRouter();
  const act = async (action) => { await post('/api/admin/students', { user_id: s.id, action }); router.refresh(); };
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-canal/10 bg-white p-4">
      <div><div className="font-semibold">{s.name}</div><div className="text-sm text-canal/60">{s.email}</div>
        {s.card_url && <a href={s.card_url} target="_blank" rel="noreferrer" className="text-sm underline">عرض الكارنيه</a>}</div>
      <div className="flex gap-2"><button className="btn-primary" onClick={() => act('approve')}>توثيق</button><button className="btn-ghost" onClick={() => act('reject')}>رفض</button></div>
    </div>
  );
}

export function ComplaintRow({ c }) {
  const router = useRouter();
  const [status, setStatus] = useState(c.status);
  const [reply, setReply] = useState(c.admin_reply || '');
  const [msg, setMsg] = useState('');
  const KIND = { app: 'مشكلة في التطبيق', place: 'شكوى على مكان', suggestion: 'اقتراح' };
  return (
    <div className="space-y-3 rounded-xl border border-canal/10 bg-white p-4">
      <div className="text-xs text-canal/60">{KIND[c.kind]} · {c.users?.name || 'مستخدم محذوف'} · {new Date(c.created_at).toLocaleDateString('ar-EG')}</div>
      <p className="whitespace-pre-wrap leading-7">{c.body}</p>
      {c.image_url && <a href={c.image_url} target="_blank" rel="noreferrer"><img src={c.image_url} alt="مرفق" className="h-24 rounded-lg" /></a>}
      <textarea className="input" placeholder="الرد على المستخدم" value={reply} onChange={(e) => setReply(e.target.value)} />
      <div className="flex items-center gap-2">
        <select className="input max-w-44" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="new">جديدة</option><option value="in_progress">جاري المعالجة</option><option value="resolved">تم الحل</option>
        </select>
        <button className="btn-primary" onClick={async () => { const r = await post('/api/admin/complaints', { id: c.id, status, admin_reply: reply }); setMsg(r.ok ? 'تم الحفظ' : r.data.error); router.refresh(); }}>حفظ</button>
        {msg && <span role="status" className="text-sm">{msg}</span>}
      </div>
    </div>
  );
}

const PERMS = [['merchants', 'التجار والطلاب'], ['content', 'المحتوى'], ['points', 'النقاط والخصومات'], ['complaints', 'الشكاوى'], ['reports', 'التقارير']];

export function UserRoleForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('admin');
  const [perms, setPerms] = useState(['content']);
  const [msg, setMsg] = useState(null);
  return (
    <form className="space-y-4 rounded-2xl border border-canal/10 bg-white p-5" onSubmit={async (e) => {
      e.preventDefault();
      const r = await post('/api/admin/users', { email, role, permissions: perms });
      setMsg(r.ok ? { ok: true, t: 'تم الحفظ' } : { ok: false, t: r.data.error });
      if (r.ok) router.refresh();
    }}>
      <div><label className="label" htmlFor="u-email">بريد المستخدم</label><input id="u-email" className="input" dir="ltr" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div><label className="label" htmlFor="u-role">الدور</label>
        <select id="u-role" className="input" value={role} onChange={(e) => setRole(e.target.value)}><option value="admin">مشرف</option><option value="user">مستخدم عادي (إزالة الإشراف)</option></select></div>
      {role === 'admin' && (
        <fieldset><legend className="label">الصلاحيات</legend>
          <div className="flex flex-wrap gap-4">
            {PERMS.map(([k, l]) => (
              <label key={k} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={perms.includes(k)} onChange={(e) => setPerms(e.target.checked ? [...perms, k] : perms.filter((p) => p !== k))} />{l}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {msg && <p role="status" className={`rounded-lg px-3 py-2 text-sm ${msg.ok ? 'bg-dome-soft text-dome' : 'bg-balcony-soft text-balcony'}`}>{msg.t}</p>}
      <button className="btn-primary">حفظ</button>
    </form>
  );
}
