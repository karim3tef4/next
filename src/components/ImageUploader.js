'use client';
import { useState } from 'react';

export default function ImageUploader({ value = [], onChange }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function onFiles(e) {
    const files = [...e.target.files];
    e.target.value = '';
    setBusy(true); setErr('');
    const urls = [];
    for (const file of files) {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) urls.push(data.url); else setErr(data.error);
    }
    onChange([...value, ...urls]);
    setBusy(false);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {value.map((u) => (
          <div key={u} className="relative">
            <img src={u} alt="" className="h-20 w-20 rounded-lg object-cover" />
            <button type="button" aria-label="حذف الصورة" onClick={() => onChange(value.filter((x) => x !== u))}
              className="absolute -top-2 -start-2 h-6 w-6 rounded-full bg-balcony text-xs text-white">×</button>
          </div>
        ))}
      </div>
      <input type="file" accept="image/*" multiple onChange={onFiles} disabled={busy} className="mt-2 text-sm" />
      {busy && <span className="text-sm text-canal/60"> جاري الرفع...</span>}
      {err && <p role="alert" className="text-sm text-balcony">{err}</p>}
    </div>
  );
}
