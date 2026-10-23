import { db } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { json, fail } from '@/lib/api';

// Simple in-memory limiter (per server instance). Use Redis/Upstash for strict limits.
const hits = new Map();
function limited(id) {
  const now = Date.now();
  const arr = (hits.get(id) || []).filter((t) => now - t < 3600_000);
  if (arr.length >= 20) return true;
  arr.push(now); hits.set(id, arr);
  return false;
}

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return fail('سجّل دخولك الأول', 401);
  if (limited(user.id)) return fail('وصلت للحد الأقصى من الرسائل في الساعة، جرّب بعد شوية', 429);

  const { city, message, history = [] } = await req.json().catch(() => ({}));
  const text = String(message || '').trim().slice(0, 500);
  if (!text) return fail('اكتب سؤالك');

  const { data: c } = await db().from('cities').select('id,name_ar').eq('slug', city).eq('status', 'active').maybeSingle();
  if (!c) return fail('المدينة غير موجودة', 404);

  const [{ data: places }, { data: lines }, { data: explore }] = await Promise.all([
    db().from('places').select('name_ar,description,price_tier,address,working_hours,categories(name_ar)').eq('city_id', c.id).eq('status', 'active').limit(60),
    db().from('transport_lines').select('name,vehicle,stops').eq('city_id', c.id),
    db().from('explore_items').select('title_ar,summary').eq('city_id', c.id).eq('is_published', true),
  ]);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Fallback without an API key: keyword match over the city data.
    const words = text.split(/\s+/).filter((w) => w.length > 2);
    const hit = (places || []).filter((p) => words.some((w) => `${p.name_ar} ${p.description || ''} ${p.categories?.name_ar}`.includes(w))).slice(0, 5);
    return json({ reply: hit.length ? `ممكن تجرب: ${hit.map((p) => p.name_ar).join('، ')}.` : 'مقدرتش ألاقي حاجة مناسبة، جرّب تسأل بطريقة تانية.' });
  }

  const system = `أنت مساعد سياحي لمدينة ${c.name_ar} داخل منصة Hubs. أجب بالعربية بلهجة مصرية مبسطة وبإيجاز.
اعتمد فقط على البيانات التالية، ولو المعلومة مش موجودة قل إنك مش متأكد ولا تخترع أسماء أو أسعار أو مواعيد.
الأماكن: ${JSON.stringify(places)}
خطوط المواصلات: ${JSON.stringify(lines)}
معالم: ${JSON.stringify(explore)}`;

  const msgs = [...history.slice(-8).map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content).slice(0, 800) })), { role: 'user', content: text }];
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5', max_tokens: 600, system, messages: msgs }),
  });
  if (!res.ok) return fail('المساعد مش متاح دلوقتي', 502);
  const data = await res.json();
  return json({ reply: data.content?.filter((b) => b.type === 'text').map((b) => b.text).join('\n') || '' });
}
