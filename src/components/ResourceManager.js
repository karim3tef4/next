'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from './ImageUploader';

const blank = (fields) =>
  Object.fromEntries(fields.map((f) => [
    f.key,
    f.type === 'checkbox' ? f.default ?? true : f.type === 'images' || f.type === 'places' ? [] : f.default ?? '',
  ]));

function fromRow(fields, row) {
  const out = blank(fields);
  for (const f of fields) {
    const v = row[f.key];
    if (v === undefined || v === null) continue;
    if (f.type === 'date') out[f.key] = String(v).slice(0, 10);
    else if (f.type === 'lines') out[f.key] = v.join('\n');
    else if (f.type === 'select' || f.type === 'number') out[f.key] = String(v);
    else out[f.key] = v;
  }
  return out;
}

export default function ResourceManager({
  endpoint, resource, title, fields, rows, labelKey, subKeys = [], pk = 'id', canCreate = true, canDelete = true,
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(null); // null | 'new' | row
  const [form, setForm] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const open = (row) => { setErr(''); setForm(row ? fromRow(fields, row) : blank(fields)); setEditing(row || 'new'); };
  const hasGeo = fields.some((f) => f.key === 'lat') && fields.some((f) => f.key === 'lng');

  async function send(payload) {
    setBusy(true); setErr('');
    const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resource, ...payload }) });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) { setErr(data.error || 'حصلت مشكلة'); return false; }
    router.refresh();
    return true;
  }

  async function submit(e) {
    e.preventDefault();
    const isNew = editing === 'new';
    if (await send({ action: isNew ? 'create' : 'update', id: isNew ? undefined : editing[pk], data: form })) setEditing(null);
  }

  function useMyLocation() {
    navigator.geolocation.getCurrentPosition(
      (p) => setForm((f) => ({ ...f, lat: p.coords.latitude.toFixed(6), lng: p.coords.longitude.toFixed(6) })),
      () => setErr('تعذر تحديد موقعك'), { enableHighAccuracy: true }
    );
  }

  function field(f) {
    const id = `f-${f.key}`;
    const v = form[f.key];
    const readonly = f.readonlyOnEdit && editing !== 'new';
    switch (f.type) {
      case 'textarea': return <textarea id={id} className="input min-h-24" value={v} onChange={(e) => set(f.key, e.target.value)} />;
      case 'lines': return <textarea id={id} className="input min-h-24" value={v} onChange={(e) => set(f.key, e.target.value)} />;
      case 'number': return <input id={id} type="number" step="any" className="input" dir="ltr" value={v} onChange={(e) => set(f.key, e.target.value)} />;
      case 'date': return <input id={id} type="date" className="input" dir="ltr" value={v} onChange={(e) => set(f.key, e.target.value)} />;
      case 'checkbox': return <input id={id} type="checkbox" checked={!!v} onChange={(e) => set(f.key, e.target.checked)} />;
      case 'images': return <ImageUploader value={v} onChange={(x) => set(f.key, x)} />;
      case 'select':
        return (
          <select id={id} className="input" value={v} onChange={(e) => set(f.key, e.target.value)}>
            <option value="">—</option>
            {(f.options || []).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
          </select>
        );
      case 'places':
        return (
          <div>
            <ol className="mb-2 space-y-1">
              {v.map((pid, i) => (
                <li key={pid + i} className="flex items-center gap-2 rounded-lg bg-salt px-3 py-1.5 text-sm">
                  <span className="flex-1">{i + 1}. {f.options?.find(([val]) => val === pid)?.[1] || pid}</span>
                  <button type="button" aria-label="لأعلى" disabled={i === 0} onClick={() => { const a = [...v]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; set(f.key, a); }}>↑</button>
                  <button type="button" aria-label="لأسفل" disabled={i === v.length - 1} onClick={() => { const a = [...v]; [a[i + 1], a[i]] = [a[i], a[i + 1]]; set(f.key, a); }}>↓</button>
                  <button type="button" aria-label="حذف" onClick={() => set(f.key, v.filter((_, j) => j !== i))}>×</button>
                </li>
              ))}
            </ol>
            <select className="input" value="" onChange={(e) => e.target.value && set(f.key, [...v, e.target.value])}>
              <option value="">+ أضف محطة</option>
              {(f.options || []).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
            </select>
          </div>
        );
      default: return <input id={id} className="input" value={v} readOnly={readonly} onChange={(e) => set(f.key, e.target.value)} />;
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>
        {canCreate && !editing && <button className="btn-primary" onClick={() => open(null)}>+ إضافة</button>}
      </div>

      {editing && (
        <form onSubmit={submit} className="mb-6 space-y-4 rounded-2xl border border-canal/10 bg-white p-5">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="label" htmlFor={`f-${f.key}`}>{f.label}{f.required ? ' *' : ''}</label>
              {field(f)}
              {(f.key === 'lng' && hasGeo) && <button type="button" className="btn-ghost mt-2" onClick={useMyLocation}>استخدم موقعي الحالي</button>}
            </div>
          ))}
          {err && <p role="alert" className="rounded-lg bg-balcony-soft px-3 py-2 text-sm text-balcony">{err}</p>}
          <div className="flex gap-2">
            <button className="btn-primary" disabled={busy}>{busy ? '...' : 'حفظ'}</button>
            <button type="button" className="btn-ghost" onClick={() => setEditing(null)}>إلغاء</button>
          </div>
        </form>
      )}

      <ul className="divide-y divide-canal/10 rounded-xl border border-canal/10 bg-white">
        {rows.map((r) => (
          <li key={r[pk]} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <div className="truncate font-semibold">{r[labelKey] || r[pk]}</div>
              <div className="truncate text-xs text-canal/60">{subKeys.map((k) => r[k]).filter((x) => x !== null && x !== undefined && x !== '').join(' · ')}</div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button className="btn-ghost" onClick={() => open(r)}>تعديل</button>
              {canDelete && <button className="btn-ghost" onClick={() => confirm('متأكد من الحذف؟') && send({ action: 'delete', id: r[pk] })}>حذف</button>}
            </div>
          </li>
        ))}
        {!rows.length && <li className="px-4 py-3 text-sm text-canal/60">لسه مفيش بيانات.</li>}
      </ul>
      {!editing && err && <p role="alert" className="mt-3 text-sm text-balcony">{err}</p>}
    </div>
  );
}
