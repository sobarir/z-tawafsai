import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { FeaturedPackages } from '@/features/landing/components/featured-packages';

export async function PackageDestinationRows() {
  const t = await getTranslations('landing.packages');

  return (
    <section className="px-4 py-[34px] min-[600px]:px-[30px]" id="paket">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="mb-1 block text-[.7rem] font-bold tracking-[.14em] text-brand-600 uppercase">
            {t('kicker')}
          </span>
          <h3 className="font-serif text-[clamp(1.5rem,2.6vw,2rem)] text-brand-900">
            {t('heading')}
          </h3>
        </div>
        <Link
          href="/packages"
          className="text-[.86rem] font-semibold whitespace-nowrap text-brand-700 hover:text-gold"
        >
          {t('compareAll')}
        </Link>
      </div>

      <FeaturedPackages />
    </section>
  );
}
