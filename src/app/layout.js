import './globals.css';
import Header from '@/components/Header';
import { tr } from '@/lib/i18n';

export const metadata = {
  title: 'Hubs | دليلك السياحي المحلي',
  description: 'اكتشف مدينتك، اجمع نقاط من زياراتك، واحصل على خصومات في أماكنك المفضلة.',
};

export default function RootLayout({ children }) {
  const { lang, dir, t } = tr();
  return (
    <html lang={lang} dir={dir}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600&family=Reem+Kufi:wght@500;600;700&display=swap"
        />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <footer className="mt-20 border-t border-canal/10 py-8 text-center text-sm text-canal/60">{t('footer')}</footer>
      </body>
    </html>
  );
}
