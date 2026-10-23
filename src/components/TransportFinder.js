'use client';
import { useMemo, useState } from 'react';

// Finds lines that pass through both stops (works in either direction).
export default function TransportFinder({ lines }) {
  const stops = useMemo(() => [...new Set(lines.flatMap((l) => l.stops))].sort((a, b) => a.localeCompare(b, 'ar')), [lines]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const results = useMemo(() => {
    if (!from || !to || from === to) return null;
    return lines
      .map((l) => {
        const a = l.stops.indexOf(from), b = l.stops.indexOf(to);
        if (a < 0 || b < 0) return null;
        return { ...l, between: Math.abs(a - b), reverse: a > b };
      })
      .filter(Boolean)
      .sort((x, y) => x.between - y.between);
  }, [from, to, lines]);

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="from">من</label>
          <select id="from" className="input" value={from} onChange={(e) => setFrom(e.target.value)}>
            <option value="">اختار نقطة البداية</option>
            {stops.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="to">إلى</label>
          <select id="to" className="input" value={to} onChange={(e) => setTo(e.target.value)}>
            <option value="">اختار الوجهة</option>
            {stops.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-6 space-y-3" aria-live="polite">
        {results?.length === 0 && <p className="text-canal/60">مفيش خط مباشر بين النقطتين دول لسه.</p>}
        {results?.map((l) => (
          <div key={l.id} className="rounded-xl border border-canal/10 bg-white p-4">
            <div className="font-semibold">{l.name}{l.vehicle ? ` (${l.vehicle})` : ''}</div>
            <div className="mt-1 text-sm text-canal/70">
              {l.reverse ? 'اتجاه الراجع' : 'اتجاه الرايح'} · {l.between} {l.between === 1 ? 'محطة' : 'محطات'} بينهم
            </div>
            <div className="mt-2 text-sm">{l.stops.join(' ← ')}</div>
            {l.notes && <p className="mt-2 text-sm text-canal/60">{l.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
