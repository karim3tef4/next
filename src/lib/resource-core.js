// Shared helpers for the generic admin / merchant CRUD.

export function toLines(v) {
  if (Array.isArray(v)) return v.map((s) => String(s).trim()).filter(Boolean);
  return String(v || '').split('\n').map((s) => s.trim()).filter(Boolean);
}

// Keeps only the columns declared in `fields`, coerced to the right type.
export function sanitize(fields, data, { creating }) {
  const out = {};
  for (const f of fields) {
    if (f.type === 'places') continue;                       // handled separately (day plan stops)
    if (f.readonlyOnEdit && !creating) continue;
    if (!(f.key in data)) continue;
    const v = data[f.key];
    switch (f.type) {
      case 'number': out[f.key] = v === '' || v === null || Number.isNaN(Number(v)) ? null : Number(v); break;
      case 'checkbox': out[f.key] = v === true || v === 'true'; break;
      case 'images': case 'lines': out[f.key] = toLines(v); break;
      case 'date': out[f.key] = v ? new Date(v).toISOString() : null; break;
      case 'select': out[f.key] = v === '' ? null : v; break;
      default: out[f.key] = typeof v === 'string' ? v.trim() : v;
    }
  }
  // empty value + a DB default => let the default apply instead of writing NULL
  for (const f of fields) if (out[f.key] === null && f.default !== undefined) delete out[f.key];
  if (creating) {
    for (const f of fields) {
      if (f.required && f.type !== 'places' && (out[f.key] === undefined || out[f.key] === null || out[f.key] === '' || (Array.isArray(out[f.key]) && !out[f.key].length))) {
        return { error: `الحقل مطلوب: ${f.label}` };
      }
    }
  }
  return { data: out };
}
