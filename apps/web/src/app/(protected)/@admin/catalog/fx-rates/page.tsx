import { getTranslations } from 'next-intl/server';
import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { requirePermission } from '@/features/auth/rbac/require';
import { HotelFxRatesAdmin } from '@/features/hotel-fx-rates/hotel-fx-rates-admin';

const FxRatesPage = async () => {
  await requirePermission('dashboard.view:admin');
  const t = await getTranslations('catalog.fxRates');

  return (
    <PageLayout>
      <PageHeader title={t('title')} subtitle={t('description')} />
      <HotelFxRatesAdmin />
    </PageLayout>
  );
};

export default FxRatesPage;
