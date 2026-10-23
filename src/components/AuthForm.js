'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const TYPES = ['tourist', 'local', 'student', 'expat'];

export default function AuthForm({ mode, L }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const isRegister = mode === 'register';

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const body = isRegister ? { ...f, photo_consent: f.photo_consent === 'on' } : f;
    const res = await fetch(`/api/auth/${mode}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'حصلت مشكلة'); setBusy(false); return; }
    router.push('/'); router.refresh();
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-10 max-w-md space-y-4 rounded-2xl border border-canal/10 bg-white p-6">
      <h1 className="text-2xl font-bold">{isRegister ? L.register_title : L.login_title}</h1>
      {isRegister && (
        <>
          <div><label className="label" htmlFor="name">{L.name}</label><input id="name" name="name" className="input" required /></div>
          <div>
            <label className="label" htmlFor="user_type">{L.iam}</label>
            <select id="user_type" name="user_type" className="input">
              {TYPES.map((v) => <option key={v} value={v}>{L[v]}</option>)}
            </select>
          </div>
        </>
      )}
      <div><label className="label" htmlFor="email">{L.email}</label><input id="email" name="email" type="email" className="input" dir="ltr" required /></div>
      <div><label className="label" htmlFor="password">{L.password}</label><input id="password" name="password" type="password" minLength={8} className="input" dir="ltr" required /></div>
      {isRegister && (
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="photo_consent" className="mt-1" />
          <span>{L.consent}</span>
        </label>
      )}
      {error && <p role="alert" className="rounded-lg bg-balcony-soft px-3 py-2 text-sm text-balcony">{error}</p>}
      <button className="btn-primary w-full" disabled={busy}>{busy ? '...' : isRegister ? L.create_account : L.login}</button>
      <p className="text-center text-sm text-canal/70">
        {isRegister ? <>{L.have_account} <Link className="underline" href="/login">{L.login}</Link></> : <>{L.no_account} <Link className="underline" href="/register">{L.make_one}</Link></>}
      </p>
    </form>
  );
}
