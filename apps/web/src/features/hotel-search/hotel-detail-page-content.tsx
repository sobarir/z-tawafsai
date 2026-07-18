import { getTranslations } from 'next-intl/server';
import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { HotelDetail, type HotelDetailQuery } from './hotel-detail';

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

interface HotelDetailPageContentProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function HotelDetailPageContent({
  params,
  searchParams,
}: HotelDetailPageContentProps) {
  const [t, { id }, resolvedParams] = await Promise.all([
    getTranslations('hotelSearch'),
    params,
    searchParams,
  ]);

  const query: HotelDetailQuery = {
    destination: first(resolvedParams.destination) ?? '',
    checkIn: first(resolvedParams.checkIn) ?? '',
    checkOut: first(resolvedParams.checkOut) ?? '',
    occupancy: Number(first(resolvedParams.occupancy)) || 2,
    currency: first(resolvedParams.currency) ?? 'USD',
  };

  return (
    <PageLayout>
      <PageHeader title={t('detailTitle')} />
      <HotelDetail propertyCode={id} query={query} />
    </PageLayout>
  );
}
