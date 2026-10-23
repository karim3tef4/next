// In-memory limiter (per server instance). Good enough to slow down brute force;
// use Upstash/Redis if you need a strict global limit on Vercel.
const store = new Map();

export function rateLimit(key, max, windowMs) {
  const now = Date.now();
  const arr = (store.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) { store.set(key, arr); return true; }
  arr.push(now);
  store.set(key, arr);
  if (store.size > 5000) for (const [k, v] of store) if (!v.length || now - v[v.length - 1] > windowMs) store.delete(k);
  return false;
}

export function clientIp(req) {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
}
