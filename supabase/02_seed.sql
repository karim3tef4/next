-- Seed data. Coordinates and texts are starting points: please review before launch.
insert into settings (key, value, description) values
  ('points_per_discount', '10000', 'النقاط المطلوبة للحصول على خصم'),
  ('discount_percent', '10', 'نسبة الخصم عند استبدال النقاط'),
  ('loyalty_visits', '5', 'عدد الزيارات الموثقة لنفس المحل للحصول على خصم التكرار'),
  ('loyalty_percent', '15', 'نسبة خصم التكرار'),
  ('max_daily_visits', '5', 'أقصى عدد زيارات موثقة في اليوم'),
  ('place_cooldown_hours', '12', 'أقل مدة بين زيارتين موثقتين لنفس المكان'),
  ('max_distance_m', '150', 'المسافة المسموحة من المكان (متر) إذا لم يحددها المكان'),
  ('photo_max_age_minutes', '10', 'أقصى عمر للصورة وقت الرفع'),
  ('code_valid_days', '14', 'مدة صلاحية كود الخصم بالأيام'),
  ('platform_fee_per_code_egp', '5', 'رسم ثابت على التاجر عن كل كود يُستخدم'),
  ('default_commission_percent', '10', 'عمولة المنصة الافتراضية على المدفوعات')
on conflict (key) do nothing;

insert into cities (slug, name_ar, name_en, status, center_lat, center_lng, cover_image, sort_order) values
  ('port-said', 'بورسعيد', 'Port Said', 'active', 31.2653, 32.3019, '/images/canal-authority.webp', 1),
  ('ismailia',  'الإسماعيلية', 'Ismailia', 'coming_soon', 30.5965, 32.2715, null, 2);

insert into categories (slug, name_ar, name_en, icon, visit_points, sort_order) values
  ('restaurants', 'مطاعم', 'Restaurants', '🍽️', 100, 1),
  ('cafes', 'كافيهات', 'Cafes', '☕', 80, 2),
  ('hotels', 'فنادق', 'Hotels', '🏨', 150, 3),
  ('beaches', 'شواطئ', 'Beaches', '🏖️', 120, 4),
  ('landmarks', 'أماكن سياحية وتاريخية', 'Landmarks', '🏛️', 150, 5),
  ('entertainment', 'أماكن ترفيهية', 'Entertainment', '🎡', 100, 6),
  ('clothing', 'محلات ملابس', 'Clothing', '👕', 60, 7),
  ('salons', 'كوافيرات', 'Salons', '💇', 60, 8);

-- Places (landmark coordinates are approximate)
insert into places (city_id, category_id, name_ar, name_en, description, price_tier, address, lat, lng, radius_m, working_hours, images)
select c.id, k.id, v.name_ar, v.name_en, v.descr, v.tier, v.addr, v.lat, v.lng, v.radius, v.hours, v.imgs
from (values
  ('landmarks','مبنى هيئة قناة السويس','Suez Canal Authority Building','المبنى ذو القباب الخضراء المطل على مدخل القناة، من أشهر معالم بورسعيد.','C','شارع الشهداء، بورسعيد',31.2589,32.3128,200,'من الخارج طوال اليوم', array['/images/canal-authority.webp']),
  ('landmarks','ساحة مصر','Egypt Square','ساحة واسعة بتمثال في قلب المدينة، مناسبة لبداية جولة المشي.','C','وسط بورسعيد',31.2640,32.3010,200,'طوال اليوم', array['/images/egypt-square.webp']),
  ('landmarks','ميدان الشهداء','Martyrs Square','ميدان معروف بتجمع الحمام وبقربه من المباني القديمة.','C','بورسعيد',31.2610,32.3040,150,'طوال اليوم', array['/images/martyrs-square.webp']),
  ('beaches','شاطئ بورسعيد','Port Said Beach','شاطئ البحر المتوسط، يزدحم في الصيف وأيام الإجازات.','C','كورنيش بورسعيد',31.2760,32.3180,300,'طوال اليوم', array['/images/beach.webp','/images/seafront-mosque.webp']),
  ('entertainment','حديقة الفرما','Al-Farma Park','حديقة بممشى مظلل ومقاعد، مناسبة للعائلات.','C','بورسعيد',31.2580,32.2990,150,'من 9 ص إلى 11 م', array['/images/park.webp']),
  ('restaurants','مطعم تجريبي (بيانات للتجربة)','Demo Restaurant','محل تجريبي لاختبار الخصومات والتحقق من الأكواد. احذفه قبل الإطلاق.','B','بورسعيد',31.2650,32.3025,100,'12 ظ – 12 م', array[]::text[]),
  ('cafes','كافيه تجريبي (بيانات للتجربة)','Demo Cafe','كافيه تجريبي لاختبار تسجيل الزيارات. احذفه قبل الإطلاق.','A','بورسعيد',31.2645,32.3030,100,'10 ص – 1 ص', array[]::text[])
) as v(cat, name_ar, name_en, descr, tier, addr, lat, lng, radius, hours, imgs)
join categories k on k.slug = v.cat
join cities c on c.slug = 'port-said';

insert into explore_items (city_id, slug, title_ar, summary, history, significance, story, images, sort_order)
select c.id, v.slug, v.title, v.summary, v.history, v.sig, v.story, v.imgs, v.ord
from (values
  ('canal-authority-building','مبنى هيئة قناة السويس',
   'مبنى أبيض بقباب خضراء على ضفة القناة، يستقبل السفن العابرة بإطلالة لا تتكرر.',
   'نشأ المبنى مع تطور إدارة القناة في بورسعيد، وصار مع الوقت رمزًا بصريًا للمدينة.',
   'هو مقر إداري مرتبط بالملاحة في القناة، ويظهر في أغلب صور المدينة.',
   'نص مبدئي للمراجعة: أضف هنا قصة المبنى والتواريخ الدقيقة من مصدر موثوق.',
   array['/images/canal-authority.webp'], 1),
  ('egypt-square','ساحة مصر',
   'ساحة مفتوحة واسعة بتمثال في قلب بورسعيد.',
   'نص مبدئي للمراجعة: تاريخ الساحة والتمثال.',
   'نقطة لقاء وبداية مناسبة لأي جولة مشي في وسط المدينة.',
   'نص مبدئي للمراجعة.',
   array['/images/egypt-square.webp'], 2),
  ('martyrs-square','ميدان الشهداء',
   'ميدان في قلب المدينة يرتبط في أذهان الزوار بأسراب الحمام.',
   'نص مبدئي للمراجعة: تاريخ الميدان وسبب تسميته.',
   'يربط بين عدد من الشوارع والمباني القديمة.',
   'نص مبدئي للمراجعة.',
   array['/images/martyrs-square.webp'], 3),
  ('seafront','كورنيش وشاطئ بورسعيد',
   'شاطئ على البحر المتوسط وشارع طرح البحر بمبانيه ومسجده.',
   'تأسست بورسعيد عام 1859 مع بدء حفر قناة السويس، وامتدت المدينة نحو البحر مع الوقت.',
   'متنفس أهل المدينة وزوارها في الصيف والإجازات.',
   'نص مبدئي للمراجعة.',
   array['/images/beach.webp','/images/seafront-mosque.webp'], 4),
  ('old-port-said-streets','شوارع بورسعيد القديمة',
   'شرفات خشبية وجدران فاتحة وأرصفة مفروشة تميّز الأحياء القديمة.',
   'نص مبدئي للمراجعة: تاريخ طراز العمارة.',
   'تعطي المدينة طابعها المعماري المميز.',
   'نص مبدئي للمراجعة.',
   array['/images/old-street.webp','/images/green-avenue.webp'], 5)
) as v(slug, title, summary, history, sig, story, imgs, ord)
join cities c on c.slug = 'port-said';

insert into transport_lines (city_id, name, vehicle, stops, notes)
select c.id, 'خط تجريبي: وسط البلد – الشاطئ', 'ميني باص', array['ساحة مصر','ميدان الشهداء','كورنيش بورسعيد'], 'بيانات تجريبية: استبدلها بالخطوط الحقيقية من لوحة الإدارة'
from cities c where c.slug = 'port-said';

with p as (
  insert into day_plans (city_id, title, theme, duration_hours, tier, bonus_points)
  select id, 'جولة 4 ساعات: قلب بورسعيد', 'historical', 4, 'C', 200 from cities where slug = 'port-said'
  returning id
)
insert into day_plan_stops (plan_id, place_id, position, visit_minutes)
select p.id, pl.id, v.pos, v.mins
from p, (values ('ساحة مصر',1,40),('ميدان الشهداء',2,30),('مبنى هيئة قناة السويس',3,40),('شاطئ بورسعيد',4,60)) as v(name, pos, mins)
join places pl on pl.name_ar = v.name;
