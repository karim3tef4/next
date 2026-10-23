import { redirect } from 'next/navigation';
import QRCode from 'qrcode';
import { db } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import RedeemButton from '@/components/RedeemButton';
import { StudentCardForm } from '@/components/CommunityForms';

export const dynamic = 'force-dynamic';

const STATUS = { new: 'جديدة', in_progress: 'جاري المعالجة', resolved: 'تم الحل' };
const STUDENT = { none: 'غير موثق', pending: 'قيد المراجعة', approved: 'موثق', rejected: 'مرفوض، ارفع صورة أوضح' };

export default async function Me() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const S = await getSettings();

  const [{ data: codes }, { data: ledger }, { data: notes }, { data: mine }, { data: full }] = await Promise.all([
    db().from('discount_codes').select('*, places:places!discount_codes_place_id_fkey(name_ar)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
    db().from('points_ledger').select('delta,reason,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(15),
    db().from('notifications').select('id,title,body,is_read,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
    db().from('complaints').select('id,kind,body,status,admin_reply').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    db().from('users').select('student_status').eq('id', user.id).single(),
  ]);
  // opening the page counts as reading the notifications
  if (notes?.some((n) => !n.is_read)) await db().from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);

  const active = (codes || []).filter((c) => c.status === 'active' && new Date(c.expires_at) > new Date());
  const qrs = await Promise.all(active.map((c) => QRCode.toDataURL(c.code, { margin: 1, width: 220 })));
  const pct = Math.min(100, Math.round((user.points_balance / S.points_per_discount) * 100));

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <section className="rounded-2xl bg-canal p-6 text-white">
        <div className="text-sm text-white/70">{user.name} · رصيدك في كل المدن</div>
        <div className="font-display text-5xl font-bold">{user.points_balance.toLocaleString('ar-EG')}</div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full bg-brass" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-2 text-sm text-white/70">
          {user.points_balance >= S.points_per_discount ? 'تقدر تستبدل خصم دلوقتي' : `باقي ${(S.points_per_discount - user.points_balance).toLocaleString('ar-EG')} نقطة للخصم الجاي`}
        </div>
        <div className="mt-4">
          <RedeemButton cost={S.points_per_discount} percent={S.discount_percent} enabled={user.points_balance >= S.points_per_discount} />
        </div>
      </section>

      {notes?.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-bold">الإشعارات</h2>
          <ul className="divide-y divide-canal/10 rounded-xl border border-canal/10 bg-white">
            {notes.map((n) => (
              <li key={n.id} className={`px-4 py-3 text-sm ${n.is_read ? '' : 'bg-brass-soft'}`}>
                <div className="font-semibold">{n.title}</div>{n.body && <div className="text-canal/70">{n.body}</div>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-xl font-bold">أكواد الخصم</h2>
        {active.length === 0 && <p className="text-canal/60">مفيش أكواد فعالة.</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          {active.map((c, i) => (
            <div key={c.id} className="rounded-xl border border-canal/10 bg-white p-4 text-center">
              <img src={qrs[i]} alt={`QR للكود ${c.code}`} className="mx-auto h-40 w-40" />
              <div className="mt-2 font-mono text-lg font-semibold" dir="ltr">{c.code}</div>
              <div className="text-sm text-canal/70">خصم {c.percent}%{c.places?.name_ar ? ` في ${c.places.name_ar}` : ''}</div>
              <div className="text-xs text-canal/50">ينتهي {new Date(c.expires_at).toLocaleDateString('ar-EG')}</div>
            </div>
          ))}
        </div>
      </section>

      {user.user_type === 'student' && (
        <section className="space-y-2">
          <h2 className="text-xl font-bold">توثيق الطالب</h2>
          <p className="text-sm text-canal/70">الحالة: {STUDENT[full?.student_status || 'none']}</p>
          {full?.student_status !== 'approved' && <StudentCardForm />}
        </section>
      )}

      {mine?.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-bold">شكاواك واقتراحاتك</h2>
          <ul className="divide-y divide-canal/10 rounded-xl border border-canal/10 bg-white">
            {mine.map((c) => (
              <li key={c.id} className="px-4 py-3 text-sm">
                <div className="flex justify-between"><span className="line-clamp-1">{c.body}</span><span className="text-canal/60">{STATUS[c.status]}</span></div>
                {c.admin_reply && <div className="mt-1 text-dome">رد الإدارة: {c.admin_reply}</div>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-xl font-bold">آخر الحركات</h2>
        <ul className="divide-y divide-canal/10 rounded-xl border border-canal/10 bg-white">
          {ledger?.map((l, i) => (
            <li key={i} className="flex justify-between px-4 py-3 text-sm">
              <span>{l.reason}</span>
              <span className={l.delta > 0 ? 'text-dome' : 'text-balcony'} dir="ltr">{l.delta > 0 ? '+' : ''}{l.delta}</span>
            </li>
          ))}
          {!ledger?.length && <li className="px-4 py-3 text-sm text-canal/60">لسه مفيش حركات.</li>}
        </ul>
      </section>
    </div>
  );
}
