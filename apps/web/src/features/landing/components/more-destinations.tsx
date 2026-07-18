import { getTranslations } from 'next-intl/server';
import { DestinationCard } from '@/features/landing/components/destination-card';
import { moreDestinations } from '@/features/landing/data/destinations';

export async function MoreDestinations() {
  const t = await getTranslations('landing.moreDestinations');

  return (
    <section className="px-4 pb-[34px] min-[600px]:px-[30px]" id="destinasi">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="mb-1 block text-[.7rem] font-bold tracking-[.14em] text-brand-600 uppercase">
            {t('kicker')}
          </span>
          <h3 className="font-serif text-[clamp(1.5rem,2.6vw,2rem)] text-brand-900">
            {t('heading')}
          </h3>
        </div>
        <a
          href="#jelajah"
          className="text-[.86rem] font-semibold whitespace-nowrap text-brand-700 hover:text-gold"
        >
          {t('exploreAll')}
        </a>
      </div>

      <div className="grid grid-cols-1 gap-[14px] min-[600px]:grid-cols-2 min-[900px]:grid-cols-3 min-[1100px]:grid-cols-5">
        {moreDestinations.map((destination) => (
          <DestinationCard
            key={destination.slug}
            destination={destination}
            minHeightClassName="min-h-[170px]"
          />
        ))}
      </div>
    </section>
  );
}
