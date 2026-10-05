import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import { Cursor } from '@/components/cursor';
import { Navigation } from '@/components/navigation';
import { Preloader } from '@/components/preloader';
import { SiteFooter } from '@/components/site-footer';
import { ScrollProvider } from '@/components/scroll-provider';
import { siteOrigin } from '@/lib/site-meta';
import './globals.css';

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] });
const manrope = Manrope({ variable: '--font-display', subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: 'Zero Degree — Creative Studio & Production House',
    template: '%s — Zero Degree',
  },
  description: "We don't just make content. We build the way it is seen. Zero Degree is a creative studio and production house.",
  applicationName: 'Zero Degree',
  openGraph: {
    type: 'website',
    siteName: 'Zero Degree',
    title: 'Zero Degree — Creative Studio & Production House',
    description: "We don't just make content. We build the way it is seen.",
    url: siteOrigin,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zero Degree — Creative Studio & Production House',
    description: "We don't just make content. We build the way it is seen.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body>
        <ScrollProvider>
          <Preloader />
          <Cursor />
          <Navigation />
          <main>{children}</main>
          <SiteFooter />
        </ScrollProvider>
      </body>
    </html>
  );
}
