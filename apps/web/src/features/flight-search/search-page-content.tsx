import { getTranslations } from 'next-intl/server';
import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { FlightSearch } from './flight-search';

export async function SearchPageContent() {
  const t = await getTranslations('flightSearch');

  return (
    <PageLayout>
      <PageHeader title={t('title')} subtitle={t('description')} />
      <FlightSearch />
    </PageLayout>
  );
}
