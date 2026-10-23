import { db } from './supabase';

export async function getCity(slug) {
  const { data } = await db().from('cities').select('*').eq('slug', slug).eq('status', 'active').maybeSingle();
  return data;
}
