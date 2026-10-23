const TIERS = [['A', 'اقتصادي'], ['B', 'متوسط'], ['C', 'مميز']];
const t = (key, label, extra = {}) => ({ key, label, type: 'text', ...extra });

// ---------- Admin resources ----------
export const ADMIN_RESOURCES = {
  places: {
    table: 'places', perm: 'content', title: 'الأماكن', label: 'name_ar', sub: ['status', 'visit_count'],
    order: ['created_at', false],
    fields: [
      t('name_ar', 'الاسم بالعربي', { required: true }),
      t('name_en', 'الاسم بالإنجليزي'),
      { key: 'city_id', label: 'المدينة', type: 'select', from: 'cities', required: true },
      { key: 'category_id', label: 'النوع', type: 'select', from: 'categories', required: true },
      { key: 'description', label: 'الوصف', type: 'textarea' },
      { key: 'price_tier', label: 'المستوى', type: 'select', options: TIERS },
      t('address', 'العنوان'),
      { key: 'lat', label: 'خط العرض', type: 'number' },
      { key: 'lng', label: 'خط الطول', type: 'number' },
      { key: 'radius_m', label: 'نطاق التحقق (متر)', type: 'number', default: 150 },
      t('phone', 'التليفون'),
      t('working_hours', 'المواعيد'),
      { key: 'images', label: 'الصور', type: 'images' },
      { key: 'status', label: 'الحالة', type: 'select', options: [['active', 'فعّال'], ['pending', 'قيد المراجعة'], ['hidden', 'مخفي']], default: 'active', required: true },
    ],
  },
  cities: {
    table: 'cities', perm: 'content', title: 'المدن', label: 'name_ar', sub: ['status'], order: ['sort_order', true],
    fields: [
      t('slug', 'الرابط (إنجليزي بدون مسافات)', { required: true, readonlyOnEdit: true }),
      t('name_ar', 'الاسم بالعربي', { required: true }),
      t('name_en', 'الاسم بالإنجليزي', { required: true }),
      { key: 'status', label: 'الحالة', type: 'select', options: [['active', 'فعّالة'], ['coming_soon', 'قريبًا'], ['hidden', 'مخفية']], default: 'coming_soon', required: true },
      { key: 'center_lat', label: 'خط العرض', type: 'number' },
      { key: 'center_lng', label: 'خط الطول', type: 'number' },
      t('cover_image', 'صورة الغلاف (رابط)'),
      { key: 'sort_order', label: 'الترتيب', type: 'number', default: 0 },
    ],
  },
  categories: {
    table: 'categories', perm: 'content', title: 'أنواع الأماكن', label: 'name_ar', sub: ['visit_points'], order: ['sort_order', true],
    fields: [
      t('slug', 'الرابط (إنجليزي)', { required: true, readonlyOnEdit: true }),
      t('name_ar', 'الاسم بالعربي', { required: true }),
      t('name_en', 'الاسم بالإنجليزي', { required: true }),
      t('icon', 'أيقونة (إيموجي)'),
      { key: 'visit_points', label: 'نقاط الزيارة الموثقة', type: 'number', default: 100, required: true },
      { key: 'sort_order', label: 'الترتيب', type: 'number', default: 0 },
      { key: 'is_active', label: 'فعّال', type: 'checkbox', default: true },
    ],
  },
  explore: {
    table: 'explore_items', perm: 'content', title: 'اكتشف المدينة', label: 'title_ar', sub: ['slug'], order: ['sort_order', true],
    fields: [
      { key: 'city_id', label: 'المدينة', type: 'select', from: 'cities', required: true },
      t('slug', 'الرابط (إنجليزي)', { required: true }),
      t('title_ar', 'العنوان', { required: true }),
      { key: 'summary', label: 'نبذة', type: 'textarea' },
      { key: 'history', label: 'التاريخ', type: 'textarea' },
      { key: 'significance', label: 'الأهمية', type: 'textarea' },
      { key: 'story', label: 'الحكاية', type: 'textarea' },
      { key: 'images', label: 'الصور', type: 'images' },
      { key: 'sort_order', label: 'الترتيب', type: 'number', default: 0 },
      { key: 'is_published', label: 'منشور', type: 'checkbox', default: true },
    ],
  },
  transport: {
    table: 'transport_lines', perm: 'content', title: 'خطوط المواصلات', label: 'name', sub: ['vehicle'], order: ['name', true],
    fields: [
      { key: 'city_id', label: 'المدينة', type: 'select', from: 'cities', required: true },
      t('name', 'اسم الخط', { required: true }),
      t('vehicle', 'نوع المركبة (ميني باص، أتوبيس...)'),
      { key: 'stops', label: 'المحطات بالترتيب (محطة في كل سطر)', type: 'lines', required: true },
      { key: 'notes', label: 'ملاحظات', type: 'textarea' },
    ],
  },
  plans: {
    table: 'day_plans', perm: 'content', title: 'خطط اليوم', label: 'title', sub: ['duration_hours'], order: ['duration_hours', true],
    select: '*, day_plan_stops(position, place_id)',
    fields: [
      { key: 'city_id', label: 'المدينة', type: 'select', from: 'cities', required: true },
      t('title', 'العنوان', { required: true }),
      { key: 'theme', label: 'النوع', type: 'select', options: [['general', 'عامة'], ['historical', 'تاريخية'], ['food', 'أكل'], ['family', 'عائلية']], default: 'general', required: true },
      { key: 'duration_hours', label: 'المدة', type: 'select', options: [['4', '4 ساعات'], ['8', '8 ساعات'], ['24', '24 ساعة']], required: true },
      { key: 'tier', label: 'المستوى', type: 'select', options: TIERS },
      { key: 'bonus_points', label: 'مكافأة إتمام الخطة (نقاط)', type: 'number', default: 200 },
      { key: 'is_published', label: 'منشورة', type: 'checkbox', default: true },
      { key: 'stops', label: 'المحطات بالترتيب', type: 'places', from: 'places' },
    ],
  },
  settings: {
    table: 'settings', perm: 'points', title: 'إعدادات النقاط والخصومات', label: 'description', sub: ['value'], pk: 'key', order: ['key', true], canDelete: false,
    fields: [
      t('key', 'المفتاح', { required: true, readonlyOnEdit: true }),
      t('value', 'القيمة', { required: true }),
      t('description', 'الوصف'),
    ],
  },
  memories: {
    table: 'memories', perm: 'content', title: 'الذكريات (مراجعة)', label: 'caption', sub: ['status'], order: ['created_at', false], canCreate: false,
    fields: [
      { key: 'caption', label: 'التعليق', type: 'textarea' },
      { key: 'status', label: 'الحالة', type: 'select', options: [['published', 'منشورة'], ['removed', 'محذوفة']], required: true },
    ],
  },
};

// ---------- Merchant resources (ownership is enforced in the API) ----------
export const MERCHANT_RESOURCES = {
  places: {
    table: 'places', title: 'أماكني', label: 'name_ar', sub: ['status'], order: ['created_at', false],
    fields: [
      t('name_ar', 'الاسم بالعربي', { required: true }),
      t('name_en', 'الاسم بالإنجليزي'),
      { key: 'city_id', label: 'المدينة', type: 'select', from: 'cities', required: true },
      { key: 'category_id', label: 'النوع', type: 'select', from: 'categories', required: true },
      { key: 'description', label: 'الوصف', type: 'textarea' },
      { key: 'price_tier', label: 'المستوى', type: 'select', options: TIERS },
      t('address', 'العنوان'),
      { key: 'lat', label: 'خط العرض', type: 'number', required: true },
      { key: 'lng', label: 'خط الطول', type: 'number', required: true },
      t('phone', 'التليفون'),
      t('working_hours', 'المواعيد'),
      { key: 'images', label: 'الصور', type: 'images' },
    ],
  },
  offers: {
    table: 'offers', title: 'عروضي', label: 'title', sub: ['discount_pct'], order: ['id', false],
    fields: [
      { key: 'place_id', label: 'المكان', type: 'select', from: 'myplaces', required: true },
      t('title', 'عنوان العرض', { required: true }),
      { key: 'description', label: 'التفاصيل', type: 'textarea' },
      { key: 'discount_pct', label: 'نسبة الخصم %', type: 'number' },
      { key: 'starts_at', label: 'يبدأ', type: 'date' },
      { key: 'ends_at', label: 'ينتهي', type: 'date' },
      { key: 'is_active', label: 'فعّال', type: 'checkbox', default: true },
    ],
  },
  rooms: {
    table: 'hotel_rooms', title: 'غرف الفندق', label: 'name', sub: ['price_egp'], order: ['name', true],
    fields: [
      { key: 'place_id', label: 'الفندق', type: 'select', from: 'myhotels', required: true },
      t('name', 'نوع الغرفة', { required: true }),
      { key: 'price_egp', label: 'السعر (ج.م)', type: 'number' },
      { key: 'details', label: 'التفاصيل', type: 'textarea' },
      { key: 'images', label: 'الصور', type: 'images' },
    ],
  },
};

// Turns `from` into [value,label] pairs on the server.
export async function loadOptions(db, fields, user) {
  const need = [...new Set(fields.map((f) => f.from).filter(Boolean))];
  const out = {};
  for (const n of need) {
    let rows = [];
    if (n === 'cities') rows = (await db.from('cities').select('id,name_ar').neq('status', 'hidden').order('sort_order')).data || [];
    if (n === 'categories') rows = (await db.from('categories').select('id,name_ar').order('sort_order')).data || [];
    if (n === 'places') rows = (await db.from('places').select('id,name_ar').order('name_ar')).data || [];
    if (n === 'myplaces') rows = (await db.from('places').select('id,name_ar').eq('merchant_id', user.id)).data || [];
    if (n === 'myhotels') {
      const { data: cat } = await db.from('categories').select('id').eq('slug', 'hotels').maybeSingle();
      rows = cat ? (await db.from('places').select('id,name_ar').eq('merchant_id', user.id).eq('category_id', cat.id)).data || [] : [];
    }
    out[n] = rows.map((r) => [r.id, r.name_ar]);
  }
  return fields.map((f) => (f.from ? { ...f, options: out[f.from] } : f));
}
