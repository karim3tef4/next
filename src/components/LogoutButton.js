'use client';
import { useRouter } from 'next/navigation';

export default function LogoutButton({ label = 'خروج' }) {
  const router = useRouter();
  return (
    <button
      className="btn-ghost"
      onClick={async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
        router.refresh();
      }}
    >
      {label}
    </button>
  );
}
