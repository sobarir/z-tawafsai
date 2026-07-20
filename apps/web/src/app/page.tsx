import type { Metadata } from 'next';
import { ArticlesFeed } from '@/features/landing/components/articles-feed';
import { Hero } from '@/features/landing/components/hero';
import { LandingCta } from '@/features/landing/components/landing-cta';
import { LandingFooter } from '@/features/landing/components/landing-footer';
import { LandingShell } from '@/features/landing/components/landing-shell';
import { MoreDestinations } from '@/features/landing/components/more-destinations';
import { PackageDestinationRows } from '@/features/landing/components/package-destination-rows';
import { TrustStrip } from '@/features/landing/components/trust-strip';

export const metadata: Metadata = {
  title: 'TawafSai — Travel Umrah Resmi | Paket, Panduan & Info Makkah-Madinah',
  description:
    'TawafSai: travel umrah berizin resmi Kemenag. Paket umrah reguler, nyaman, & keluarga, plus panduan lengkap tawaf, sai, ziarah Makkah dan Madinah.',
};

const HomePage = () => {
  return (
    <LandingShell>
      <Hero />
      <TrustStrip />
      <PackageDestinationRows />
      <MoreDestinations />
      <ArticlesFeed />
      <LandingCta />
      <LandingFooter />
    </LandingShell>
  );
};

export default HomePage;
