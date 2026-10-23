'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VisitedButton({ placeId, loggedIn, label = 'أنا زرت المكان (بدون نقاط)' }) {
  const router = useRouter();
  const [done, setDone] = useState(false);
  return (
    <button
      className="btn-ghost w-full"
      disabled={done}
      onClick={async () => {
        if (!loggedIn) return router.push('/login');
        const res = await fetch('/api/visit', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ place_id: placeId }),
        });
        if (res.ok) setDone(true);
      }}
    >
      {done ? '✓' : label}
    </button>
  );
}
