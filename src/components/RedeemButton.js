'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RedeemButton({ cost, percent, enabled }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  return (
    <div>
      <button
        className="btn-brass"
        disabled={!enabled || busy}
        onClick={async () => {
          setBusy(true); setErr('');
          const res = await fetch('/api/redeem', { method: 'POST' });
          const data = await res.json();
          if (!res.ok) setErr(data.error);
          else router.refresh();
          setBusy(false);
        }}
      >
        استبدل {cost.toLocaleString('ar-EG')} نقطة بخصم {percent}%
      </button>
      {err && <p role="alert" className="mt-2 text-sm text-balcony">{err}</p>}
    </div>
  );
}
