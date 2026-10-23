import Link from 'next/link';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { db } from '@/lib/supabase';
import { tr } from '@/lib/i18n';
import LogoutButton from './LogoutButton';
import LangToggle from './LangToggle';

export default async function Header() {
  const { t, lang } = tr();
  let user = null;
  let unread = 0;
  try {
    user = await getCurrentUser();
    if (user) {
      const { count } = await db().from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_read', false);
      unread = count || 0;
    }
  } catch {}

  return (
    <header className="sticky top-0 z-30 border-b border-canal/10 bg-salt/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="font-display text-2xl font-bold text-canal">Hubs</Link>
        <nav className="flex flex-wrap items-center gap-2 text-sm">
          <LangToggle lang={lang} />
          {user ? (
            <>
              {user.role === 'merchant' && <Link href="/merchant" className="btn-ghost">{t('merchant')}</Link>}
              {isAdmin(user) && <Link href="/admin" className="btn-ghost">{t('admin')}</Link>}
              <Link href="/me" className="btn-ghost">
                <span className="font-display text-brass">{user.points_balance.toLocaleString(lang === 'en' ? 'en' : 'ar-EG')}</span> {t('points')}
                {unread > 0 && <span className="ms-1 rounded-full bg-balcony px-1.5 text-xs text-white" aria-label={`${unread} ${t('notifications')}`}>{unread}</span>}
              </Link>
              <LogoutButton label={t('logout')} />
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">{t('login')}</Link>
              <Link href="/register" className="btn-primary">{t('register')}</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
