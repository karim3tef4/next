import { db } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { getCity } from '@/lib/city';
import { MemoryForm, CommentForm } from '@/components/CommunityForms';

export default async function Memories({ params }) {
  const city = await getCity(params.city);
  const user = await getCurrentUser();
  const [{ data: mems }, { data: places }] = await Promise.all([
    db().from('memories').select('id,caption,photo_url,created_at,users(name),places(name_ar),memory_comments(id,body,created_at,users(name))')
      .eq('city_id', city.id).eq('status', 'published').order('created_at', { ascending: false }).limit(30),
    db().from('places').select('id,name_ar').eq('city_id', city.id).eq('status', 'active').order('name_ar'),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <h1 className="text-3xl font-bold">ذكريات {city.name_ar}</h1>
      <MemoryForm cityId={city.id} places={places || []} loggedIn={!!user} />
      {mems?.map((m) => (
        <article key={m.id} className="overflow-hidden rounded-2xl border border-canal/10 bg-white">
          <img src={m.photo_url} alt={m.caption || 'ذكرى'} className="max-h-96 w-full object-cover" />
          <div className="space-y-2 p-4">
            <div className="text-sm text-canal/60">{m.users?.name}{m.places?.name_ar ? ` · ${m.places.name_ar}` : ''}</div>
            {m.caption && <p className="leading-7">{m.caption}</p>}
            <ul className="space-y-1 border-t border-canal/10 pt-2">
              {[...m.memory_comments].sort((a, b) => a.created_at.localeCompare(b.created_at)).map((c) => (
                <li key={c.id} className="text-sm"><b>{c.users?.name}:</b> {c.body}</li>
              ))}
            </ul>
            <CommentForm memoryId={m.id} loggedIn={!!user} />
          </div>
        </article>
      ))}
      {!mems?.length && <p className="text-canal/60">كن أول من يشارك ذكرى.</p>}
    </div>
  );
}
