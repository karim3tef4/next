import { redirect } from 'next/navigation';
import { db } from '@/lib/supabase';
import { getCurrentUser, isAdmin } from '@/lib/auth';

const num = (n) => (n ?? 0).toLocaleString('ar-EG');

export default async function Reports() {
  const user = await getCurrentUser();
  if (!isAdmin(user)) redirect('/');
  if (!isAdmin(user, 'reports')) return <p className="text-canal/70">أهلًا بك. اختار القسم المتاح لك من القائمة.</p>;

  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const count = async (table, f = (q) => q) => (await f(db().from(table).select('id', { count: 'exact', head: true }))).count;
  const [users, merchants, places, verified, verified7, simple, codesIssued, codesUsed, complaintsNew] = await Promise.all([
    count('users'),
    count('merchants', (q) => q.eq('status', 'approved')),
    count('places', (q) => q.eq('status', 'active')),
    count('visits', (q) => q.eq('kind', 'verified')),
    count('visits', (q) => q.eq('kind', 'verified').gte('created_at', weekAgo)),
    count('visits', (q) => q.eq('kind', 'simple')),
    count('discount_codes'),
    count('discount_codes', (q) => q.eq('status', 'used')),
    count('complaints', (q) => q.eq('status', 'new')),
  ]);

  const [{ data: top }, { data: used }, { data: pts }] = await Promise.all([
    db().from('places').select('name_ar,visit_count,cities(name_ar)').order('visit_count', { ascending: false }).limit(5),
    db().from('discount_codes').select('platform_fee_egp,used_by_merchant').eq('status', 'used').limit(5000),
    db().from('points_ledger').select('delta').limit(20000),
  ]);
  const issued = (pts || []).filter((p) => p.delta > 0).reduce((s, p) => s + p.delta, 0);
  const spent = (pts || []).filter((p) => p.delta < 0).reduce((s, p) => s - p.delta, 0);

  const fees = new Map();
  for (const u of used || []) fees.set(u.used_by_merchant, (fees.get(u.used_by_merchant) || 0) + Number(u.platform_fee_egp || 0));
  const ids = [...fees.keys()].filter(Boolean);
  const { data: ms } = ids.length ? await db().from('merchants').select('user_id,business_name').in('user_id', ids) : { data: [] };
  const feeRows = ids.map((id) => ({ id, name: ms?.find((m) => m.user_id === id)?.business_name || id, fee: fees.get(id) }));

  const cards = [
    ['المستخدمون', users], ['التجار المعتمدون', merchants], ['الأماكن الفعّالة', places],
    ['زيارات موثقة', verified], ['موثقة آخر 7 أيام', verified7], ['زيارات بدون نقاط', simple],
    ['أكواد صادرة', codesIssued], ['أكواد مستخدمة', codesUsed], ['شكاوى جديدة', complaintsNew],
    ['نقاط ممنوحة', issued], ['نقاط مستبدلة', spent],
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">التقارير</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map(([l, v]) => (
          <div key={l} className="rounded-xl border border-canal/10 bg-white p-4">
            <div className="font-display text-3xl font-bold text-canal">{num(v)}</div>
            <div className="text-sm text-canal/60">{l}</div>
          </div>
        ))}
      </div>
      <section>
        <h2 className="mb-2 text-lg font-bold">الأكثر زيارة</h2>
        <ul className="divide-y divide-canal/10 rounded-xl border border-canal/10 bg-white">
          {top?.map((p) => <li key={p.name_ar} className="flex justify-between px-4 py-2 text-sm"><span>{p.name_ar} · {p.cities?.name_ar}</span><b>{num(p.visit_count)}</b></li>)}
        </ul>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-bold">مستحقات المنصة على التجار (رسم الأكواد المستخدمة)</h2>
        <ul className="divide-y divide-canal/10 rounded-xl border border-canal/10 bg-white">
          {feeRows.map((f) => <li key={f.id} className="flex justify-between px-4 py-2 text-sm"><span>{f.name}</span><b>{num(f.fee)} ج.م</b></li>)}
          {!feeRows.length && <li className="px-4 py-2 text-sm text-canal/60">لسه مفيش أكواد مستخدمة.</li>}
        </ul>
      </section>
    </div>
  );
}
