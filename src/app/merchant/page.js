import { db } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { ApplyForm, VerifyForm } from '@/components/MerchantForms';

export const dynamic = 'force-dynamic';

export default async function Merchant() {
  const user = await getCurrentUser();
  const [{ data: m }, { data: cities }] = await Promise.all([
    db().from('merchants').select('*').eq('user_id', user.id).maybeSingle(),
    db().from('cities').select('id,name_ar').eq('status', 'active'),
  ]);

  let stats = null;
  if (m?.status === 'approved') {
    const [{ data: pl }, { data: used }] = await Promise.all([
      db().from('places').select('visit_count,status').eq('merchant_id', user.id),
      db().from('discount_codes').select('platform_fee_egp').eq('used_by_merchant', user.id).eq('status', 'used'),
    ]);
    stats = {
      places: pl?.length || 0,
      pending: pl?.filter((p) => p.status === 'pending').length || 0,
      visits: pl?.reduce((s, p) => s + p.visit_count, 0) || 0,
      codes: used?.length || 0,
      fees: used?.reduce((s, c) => s + Number(c.platform_fee_egp || 0), 0) || 0,
    };
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">التجار</h1>
      {!m && <ApplyForm cities={cities || []} />}
      {m?.status === 'pending' && <p className="rounded-xl bg-brass-soft p-4">طلبك ({m.business_name}) تحت المراجعة.</p>}
      {m?.status === 'rejected' && (
        <>
          <p className="rounded-xl bg-balcony-soft p-4 text-balcony">تم رفض الطلب: {m.reject_reason}</p>
          <ApplyForm cities={cities || []} />
        </>
      )}
      {m?.status === 'approved' && (
        <>
          <p className="rounded-xl bg-dome-soft p-4 text-dome">{m.business_name} — حساب معتمد.</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[['أماكنك', stats.places], ['قيد المراجعة', stats.pending], ['إجمالي الزيارات', stats.visits], ['أكواد مستخدمة', stats.codes]].map(([l, v]) => (
              <div key={l} className="rounded-xl border border-canal/10 bg-white p-4"><div className="font-display text-2xl font-bold">{v.toLocaleString('ar-EG')}</div><div className="text-xs text-canal/60">{l}</div></div>
            ))}
          </div>
          <p className="text-sm text-canal/70">الرسوم المستحقة للمنصة عن الأكواد المستخدمة: <b>{stats.fees.toLocaleString('ar-EG')} ج.م</b></p>
          <VerifyForm />
        </>
      )}
    </div>
  );
}
