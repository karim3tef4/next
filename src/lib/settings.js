import { db } from './supabase';

const DEFAULTS = {
  points_per_discount: 10000, discount_percent: 10, loyalty_visits: 5, loyalty_percent: 15,
  max_daily_visits: 5, place_cooldown_hours: 12, max_distance_m: 150, photo_max_age_minutes: 10,
  code_valid_days: 14, platform_fee_per_code_egp: 5, default_commission_percent: 10,
};

// All values are editable from the admin side (settings table); numbers are parsed here.
export async function getSettings() {
  const { data } = await db().from('settings').select('key,value');
  const out = { ...DEFAULTS };
  for (const row of data || []) {
    const n = Number(row.value);
    out[row.key] = Number.isNaN(n) ? row.value : n;
  }
  return out;
}
