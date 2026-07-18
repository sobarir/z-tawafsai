import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { DestinationCard } from '@/features/landing/components/destination-card';
import { PackageCard } from '@/features/landing/components/package-card';
import type { PackageRow } from '@/features/landing/components/package-filter-rows';
import { PackageFilterRows } from '@/features/landing/components/package-filter-rows';
import { packages } from '@/features/landing/data/packages';

export async function PackageDestinationRows() {
  const t = await getTranslations('landing.packages');

  const rows: PackageRow[] = packages.map((pkg) => ({
    slug: pkg.slug,
    category: pkg.category,
    node: (
      <>
        <PackageCard pkg={pkg} t={t} />
        <DestinationCard
          destination={pkg.destination}
          minHeightClassName="min-h-[200px] min-[861px]:min-h-[230px]"
        />
      </>
    ),
  }));

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

      <PackageFilterRows
        rows={rows}
        labels={{
          all: t('filterAll'),
          hemat: t('filterHemat'),
          premium: t('filterPremium'),
          keluarga: t('filterKeluarga'),
        }}
      />
    </section>
  );
}
