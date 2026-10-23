'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

// Verified visit: opens the camera directly (capture) and reads GPS at the same moment.
export default function CheckinButton({ placeId, loggedIn, label = 'سجّل زيارتك واكسب نقاط' }) {
  const router = useRouter();
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  function start() {
    if (!loggedIn) { router.push('/login'); return; }
    setMsg(null);
    input.current?.click();
  }

  async function onPhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 15000 })
      );
      const fd = new FormData();
      fd.append('place_id', placeId);
      fd.append('lat', pos.coords.latitude);
      fd.append('lng', pos.coords.longitude);
      fd.append('taken_at', Date.now());
      fd.append('photo', file);
      const res = await fetch('/api/checkin', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) setMsg({ ok: false, text: data.error });
      else {
        setMsg({ ok: true, text: `تم! كسبت ${data.points} نقطة.${data.loyalty ? ` وكمان خصم تكرار ${data.loyalty.percent}% — كودك: ${data.loyalty.code}` : ''}${data.plan_bonus ? ` 🎉 خلّصت خطة «${data.plan_bonus.title}» وخدت ${data.plan_bonus.points} نقطة مكافأة.` : ''}` });
        router.refresh();
      }
    } catch (err) {
      setMsg({ ok: false, text: err?.code === 1 ? 'لازم تسمح بالوصول لموقعك' : 'تعذر تحديد موقعك، جرّب تاني' });
    }
    setBusy(false);
  }

  return (
    <div>
      <input ref={input} type="file" accept="image/*" capture="environment" className="hidden" onChange={onPhoto} />
      <button onClick={start} disabled={busy} className="btn-brass w-full">
        {busy ? '...' : label}
      </button>
      {msg && (
        <p role="status" className={`mt-3 rounded-lg px-3 py-2 text-sm ${msg.ok ? 'bg-dome-soft text-dome' : 'bg-balcony-soft text-balcony'}`}>{msg.text}</p>
      )}
    </div>
  );
}
