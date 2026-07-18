'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { PackageCard } from '@/features/landing/components/package-card';
import { toPackageCardData } from '@/features/landing/lib/to-package-card-data';
import { useListTravelPackages } from '@/libs/api/generated/endpoints';

export function FeaturedPackages() {
  const t = useTranslations('landing.packages');
  const locale = useLocale();
  const { data, isLoading } = useListTravelPackages();

  const cards = useMemo(() => {
    const labels = {
      typeUmrah: t('typeUmrah'),
      typeUmrahPlus: t('typeUmrahPlus'),
      typeHajj: t('typeHajj'),
      nightsUnit: t('nightsUnit'),
      mealFullBoard: t('mealFullBoard'),
      mealHalfBoard: t('mealHalfBoard'),
      mealRoomOnly: t('mealRoomOnly'),
      transitVia: (city: string) => t('transitVia', { city }),
      emptyHotel: t('emptyHotel'),
    };
    return (data ?? [])
      .filter((pkg) => pkg.isActive && pkg.isFeatured)
      .map((pkg) => ({
        id: pkg.id,
        data: toPackageCardData(pkg, locale, labels),
      }));
  }, [data, locale, t]);

  if (isLoading) {
    return <p className="text-[.86rem] text-landing-muted">{t('loading')}</p>;
  }

  if (cards.length === 0) {
    return <p className="text-[.86rem] text-landing-muted">{t('empty')}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 min-[861px]:grid-cols-2">
      {cards.map((card) => (
        <PackageCard key={card.id} pkg={card.data} t={t} />
      ))}
    </div>
  );
}
