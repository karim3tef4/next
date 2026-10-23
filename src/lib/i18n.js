import { cookies } from 'next/headers';

export function getLang() {
  return cookies().get('lang')?.value === 'en' ? 'en' : 'ar';
}

const ar = {
  login: 'دخول', register: 'حساب جديد', logout: 'خروج', merchant: 'لوحة التاجر', admin: 'الإدارة', points: 'نقطة', notifications: 'الإشعارات',
  home: 'رئيسية', places: 'الأماكن', explore: 'اكتشف', plans: 'خطط اليوم', transport: 'المواصلات', memories: 'الذكريات', assistant: 'اسأل المساعد', complaints: 'شكوى أو اقتراح',
  hero_title: 'كل مدينة ليها حكاية. اختار مدينتك وابدأ.',
  hero_sub: 'اكتشف الأماكن، سجّل زياراتك بالصورة والموقع، واجمع نقاط تتحول لخصومات عند التجار.',
  cities: 'المدن', soon: 'قريبًا', welcome: 'أهلًا في', pick_type: 'اختار نوع المكان اللي بتدور عليه.',
  top: 'الأكثر زيارة', all_places: 'كل الأماكن', more: 'المزيد', places_in: 'الأماكن في', all: 'الكل', all_levels: 'كل المستويات',
  none: 'مفيش أماكن بالفلتر ده لسه.', tierA: 'اقتصادي', tierB: 'متوسط', tierC: 'مميز',
  checkin: 'سجّل زيارتك واكسب نقاط', visited: 'أنا زرت المكان (بدون نقاط)', hours: 'المواعيد', phone: 'تليفون', map: 'افتح في الخريطة', offers: 'العروض', rooms: 'الغرف',
  footer: 'Hubs · منصة سياحية متعددة المدن',
  login_title: 'تسجيل الدخول', register_title: 'حساب جديد', name: 'الاسم', iam: 'أنا', email: 'البريد الإلكتروني', password: 'كلمة المرور',
  create_account: 'إنشاء الحساب', have_account: 'عندك حساب؟', no_account: 'مفيش حساب؟', make_one: 'اعمل واحد', consent: 'أوافق على نشر صور زياراتي الموثقة داخل المنصة (مطلوب لتسجيل الزيارات وكسب النقاط).',
  tourist: 'سائح', local: 'من أهل المدينة', student: 'طالب', expat: 'مغترب',
  transport_title: 'المواصلات في', transport_sub: 'اختار من فين ورايح فين، ونقولك أنهي خط.', plans_title: 'خطط اليوم في',
  plans_sub: 'جولات جاهزة بمدد مختلفة. كمّل كل المحطات ووثّق زياراتك واكسب نقاط إضافية.', explore_sub: 'تاريخ المكان، وإزاي بقى معلم، والحكايات اللي وراه.',
};
const en = {
  login: 'Log in', register: 'Sign up', logout: 'Log out', merchant: 'Merchant', admin: 'Admin', points: 'pts', notifications: 'Notifications',
  home: 'Home', places: 'Places', explore: 'Explore', plans: 'Day plans', transport: 'Transport', memories: 'Memories', assistant: 'Ask the assistant', complaints: 'Feedback',
  hero_title: 'Every city has a story. Pick yours and start.',
  hero_sub: 'Discover places, check in with a photo and your location, and earn points you can turn into discounts.',
  cities: 'Cities', soon: 'Coming soon', welcome: 'Welcome to', pick_type: 'Pick the kind of place you are looking for.',
  top: 'Most visited', all_places: 'All places', more: 'More', places_in: 'Places in', all: 'All', all_levels: 'All price levels',
  none: 'No places match this filter yet.', tierA: 'Budget', tierB: 'Mid-range', tierC: 'Premium',
  checkin: 'Check in and earn points', visited: 'I visited (no points)', hours: 'Hours', phone: 'Phone', map: 'Open in maps', offers: 'Offers', rooms: 'Rooms',
  footer: 'Hubs · a multi-city travel platform',
  login_title: 'Log in', register_title: 'Create an account', name: 'Name', iam: 'I am', email: 'Email', password: 'Password',
  create_account: 'Create account', have_account: 'Have an account?', no_account: 'No account yet?', make_one: 'Create one', consent: 'I agree to my verified visit photos being shown on the platform (required to check in and earn points).',
  tourist: 'Tourist', local: 'Local', student: 'Student', expat: 'Expat',
  transport_title: 'Transport in', transport_sub: 'Pick where from and where to, and we will show you the line.', plans_title: 'Day plans in',
  plans_sub: 'Ready-made routes of different lengths. Finish every stop with verified visits to earn bonus points.', explore_sub: 'The history of each landmark and the stories behind it.',
};

export function tr() {
  const lang = getLang();
  const d = lang === 'en' ? en : ar;
  return { lang, dir: lang === 'en' ? 'ltr' : 'rtl', t: (k) => d[k] ?? ar[k] ?? k, tier: (x) => d[`tier${x}`] };
}

// Pick name_en when English is selected and available.
export const pick = (obj, base, lang) => (lang === 'en' && obj[`${base}_en`]) || obj[`${base}_ar`] || obj[base];
