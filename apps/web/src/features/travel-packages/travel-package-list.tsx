'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useListTravelPackages } from '@/libs/api/generated/endpoints';
import { useApiErrorToast } from '@/libs/api/use-api-error-toast';
import { TravelPackageCard } from './travel-package-card';

export function TravelPackageList() {
  const t = useTranslations('travelPackages');
  const locale = useLocale();
  const handleError = useApiErrorToast();

  const { data, error, isLoading } = useListTravelPackages();

  useEffect(() => {
    if (error) handleError(error);
  }, [error, handleError]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">{t('loading')}</p>;
  }

  const items = (data ?? []).filter((item) => item.isActive);

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('noResults')}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <TravelPackageCard key={item.id} item={item} locale={locale} />
      ))}
    </div>
  );
}
