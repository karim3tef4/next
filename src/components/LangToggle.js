'use client';
import { useRouter } from 'next/navigation';

export default function LangToggle({ lang }) {
  const router = useRouter();
  return (
    <button className="btn-ghost" aria-label={lang === 'en' ? 'العربية' : 'English'} onClick={() => {
      document.cookie = `lang=${lang === 'en' ? 'ar' : 'en'}; path=/; max-age=31536000; samesite=lax`;
      router.refresh();
    }}>{lang === 'en' ? 'عربي' : 'EN'}</button>
  );
}
